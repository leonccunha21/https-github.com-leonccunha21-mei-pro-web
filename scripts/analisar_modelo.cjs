const XLSX = require('xlsx');
const fs = require('fs');

const MODELO = 'data/excel/Dados coletas/Modelo_Importacao.xlsx';
const BASE1 = 'data/excel/BASE 1.xlsx';

const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

// ---------- Modelo ----------
const wb = XLSX.readFile(MODELO);
const pRows = XLSX.utils.sheet_to_json(wb.Sheets['Produtos'], { header: 1, defval: null });
const pH = pRows[0];
const piNome = pH.indexOf('Nome do Produto');
const piCat = pH.indexOf('Categoria');
const produtos = pRows.slice(1).filter(r => (r[piNome] || '').toString().trim() !== '');

// distribuição de categorias
const catCount = {};
for (const r of produtos) { const c = (r[piCat] || '').toString().trim() || '(vazio)'; catCount[c] = (catCount[c] || 0) + 1; }
console.log('=== CATEGORIAS NO MODELO (' + produtos.length + ' produtos) ===');
Object.entries(catCount).sort((a,b)=>b[1]-a[1]).forEach(([c,n]) => console.log(`${n}\t${c}`));

// ---------- BASE 1 Som automotivo ----------
const bwb = XLSX.readFile(BASE1);
const bpRows = XLSX.utils.sheet_to_json(bwb.Sheets['Produtos'], { header: 1, defval: null });
const bpH = bpRows[0];
const bpiNome = bpH.indexOf('Nome');
const bpiCat = bpH.indexOf('Categoria');
const b1Som = bpRows.slice(1).filter(r => (r[bpiCat]||'').toString().toLowerCase().includes('som automotivo'));
console.log('\n=== BASE 1: produtos "Som automotivo" (' + b1Som.length + ') ===');
b1Som.forEach(r => console.log(' - ' + (r[bpiNome]||'').toString().trim()));

// ---------- candidatos a Som automotivo no Modelo (keyword) ----------
const SOM_KW = ['power vox','snake pro','tweeter','tweter','titwwer','corneta','mid bass','woofer','subwoofer','caixa de som automotivo','alto falante','falante automotivo','caixa automotiva','autosom','auto som','som automotivo','caixa acustica automotiva'];
const modeloSomCand = produtos.filter(r => {
  const t = ' ' + norm(r[piNome]) + ' ';
  return SOM_KW.some(k => t.includes(' ' + k + ' ') || t.includes(k));
});
console.log('\n=== MODELO: candidatos Som automotivo por keyword (' + modeloSomCand.length + ') ===');
const somCatNow = {};
modeloSomCand.forEach(r => { const c = (r[piCat]||'').toString().trim(); somCatNow[c]=(somCatNow[c]||0)+1; console.log(` [${r[piCat]||''}] ${r[piNome]}`); });
console.log('Categorias atuais desses candidatos:', JSON.stringify(somCatNow));

// ---------- grupos de nome idêntico por normalização (variantes a fundir) ----------
const groups = new Map();
for (const r of produtos) {
  const k = norm(r[piNome]);
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(r[piNome]);
}
// variantes reais = mesmo nome normalizado mas grafia diferente
let variantGroups = 0, variantCells = 0;
const examples = [];
for (const [k, lista] of groups) {
  const distintos = [...new Set(lista.map(x => x.toString()))];
  if (distintos.length > 1) {
    variantGroups++;
    variantCells += distintos.length - 1;
    if (examples.length < 30) examples.push(distintos);
  }
}
console.log('\n=== VARIANTES DE NOME (mesma normalização, grafias diferentes) ===');
console.log('Grupos com variante:', variantGroups, '| células Produtos a unificar:', variantCells);
examples.forEach(g => console.log('  * ' + g.join('  |  ')));

// ---------- match BASE1 som -> Modelo por normalização ----------
console.log('\n=== MATCH BASE1 Som automotivo x Modelo (por nome normalizado) ===');
const modeloNorms = new Map();
for (const r of produtos) { const k = norm(r[piNome]); if (!modeloNorms.has(k)) modeloNorms.set(k, r[piNome]); }
let matched = 0;
b1Som.forEach(r => {
  const k = norm(r[bpiNome]);
  const m = modeloNorms.get(k);
  console.log((m ? 'OK ' : '-- ') + (r[bpiNome]||'').toString().trim() + (m ? `  ->  ${m}` : '  (NÃO encontrado no Modelo)'));
  if (m) matched++;
});
console.log('Encontrados no Modelo:', matched, '/', b1Som.length);
