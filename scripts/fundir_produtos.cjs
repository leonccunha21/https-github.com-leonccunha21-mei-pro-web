const XLSX = require('xlsx');
const fs = require('fs');
const PATH = 'data/excel/Dados coletas/Modelo_Importacao.xlsx';
fs.copyFileSync(PATH, 'data/excel/Dados coletas/Modelo_Importacao.bak6.xlsx');

const nk = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();

// Grupos: [canonico (nome existente), ...variantes]
const GROUPS = [
  ['Adaptador hdmi ps2', 'adaptador hdmi ps2', 'adaptor hdmi ps2'],
  ['Bleybleid', 'bleybleid', 'bleybleyd'],
  ['carregador veicular', 'carregador veicular', 'carregadro veicular'],
  ['carregador tipo c', 'carregador tipo c', 'carregadro tipo c'],
  ['fita dupla face', 'fita dupla face', 'fita dupla facil'],
  ['Lampiao led', 'lampaiao led', 'lampiao led'],
  ['lâmpada bluet', 'lampada blu', 'lâmpada bluet', 'lampada bluth'],
  ['Lampada Giratoria', 'lampa giratoria', 'lampada giratoria'],
  ['Super Cola Instantânea Metal Madeira e Plástico 1un', 'super cola instantânea metal madeira e plástico 1un', 'super cola instantânea metal madeira plástico'],
  ['Tenebrio', 'tenebrio', 'tenebrios'],
  ['vuvuzela', 'vuvulzela', 'vuvunzela', 'vuvuzela'],
  ['Carregador de Notebook', 'carregador de notebook', 'carregador notebook'],
  ['maleta de ferramentas', 'maleta de ferramentas', 'maleta ferramentas'],
  ['kit de chave celular', 'kit chave celular', 'kit de chave celular'],
  ['micro sd 128gb', 'micro sd 128gb', 'microsd 128gm'],
  ['Pendrive 32gb', 'pendrive 32', 'pendrive 32gb'],
  ['Pendrive 8gb', 'pendrive 8g', 'pendrive 8gb'],
  ['Carregador completo v8', 'carregador completo v8', 'carregador v8 completo'],
  ['Kit Agulha Mão Agulheiro Costura Passador Linha', 'kit agulha mão agulheiro costura passador linha 44 peças.', 'kit agulha mão agulheiro costura passador linha peças.', 'kit agulha mão agulheiro costura passador linha'],
  ['Linha Costura Coloridas Circulo Kit 10 Tubos Cores Sortidas', 'linha costura coloridas circulo kit 10 tubos cores sortidas', 'linha costura coloridas kit 10 tubos cores sortidas'],
  ['luvinhas dedo', 'luvinhas dedo', 'luvinhas dedo n'],
  ['massageador', 'massageador', 'massageador p'],
  ['adaptador wifi 2.5g antena', 'adaptador wifi 2.5g antena', 'adaptador wifi 2.5g antena ms'],
];

const wb = XLSX.readFile(PATH);
const prodRows = XLSX.utils.sheet_to_json(wb.Sheets['Produtos'], { header: 1, defval: null });
const prodHdr = prodRows[0];
const iNome = prodHdr.indexOf('Nome do Produto');
const iCat = prodHdr.indexOf('Categoria');

// mapa normKey -> nome exato atual
const normToExact = new Map();
for (let i = 1; i < prodRows.length; i++) {
  const e = String(prodRows[i][iNome] || '');
  if (e) normToExact.set(nk(e), e);
}
const nameToCat = new Map();
for (let i = 1; i < prodRows.length; i++) {
  const e = String(prodRows[i][iNome] || '');
  if (e) nameToCat.set(e, prodRows[i][iCat]);
}

// constrói rename exato -> canonico
const rename = new Map();
for (const g of GROUPS) {
  const canon = g[0];
  const canonKey = nk(canon);
  if (!normToExact.has(canonKey)) console.log('AVISO: canonico nao encontrado ->', canon);
  const canonExact = normToExact.get(canonKey) || canon;
  for (let v = 1; v < g.length; v++) {
    const vk = nk(g[v]);
    if (!normToExact.has(vk)) { console.log('AVISO: variante nao encontrada ->', g[v]); continue; }
    rename.set(normToExact.get(vk), canonExact);
  }
}
console.log('Mapeamentos preparados:', rename.size);

// 1) atualiza Vendas (coluna Produto)
const vRows = XLSX.utils.sheet_to_json(wb.Sheets['Vendas'], { header: 1, defval: null });
const vHdr = vRows[0];
const iP = vHdr.indexOf('Produto');
let vChanged = 0;
for (let i = 1; i < vRows.length; i++) {
  const cur = String(vRows[i][iP] || '');
  if (rename.has(cur)) { vRows[i][iP] = rename.get(cur); vChanged++; }
}
console.log('Linhas de Venda renomeadas:', vChanged);
wb.Sheets['Vendas'] = XLSX.utils.aoa_to_sheet(vRows);

// 2) reconstrói Produtos agregando por canonico
const agg = new Map();
for (let i = 1; i < vRows.length; i++) {
  const nome = String(vRows[i][iP] || '').trim(); if (!nome) continue;
  const q = Number(vRows[i][vHdr.indexOf('QTD')]) || 0;
  const c = Number(vRows[i][vHdr.indexOf('Custo (R$)')]) || 0;
  const f = Number(vRows[i][vHdr.indexOf('Faturamento (R$)')]) || 0;
  const o = agg.get(nome) || { q: 0, c: 0, f: 0 };
  o.q += q; o.c += c; o.f += f; agg.set(nome, o);
}
const nomesUnicos = [...agg.keys()].sort((a, b) => a.localeCompare(b, 'pt'));
const out = [prodHdr];
let n = 0;
for (const nome of nomesUnicos) {
  n++;
  const o = agg.get(nome);
  const custoMed = o.q ? o.c / o.q : 0;
  const vendaMed = o.q ? o.f / o.q : 0;
  const cat = nameToCat.get(nome) || 'Diversos';
  out.push(['SKU-' + (2000 + n), nome, cat, +custoMed.toFixed(2), +vendaMed.toFixed(2), 0, 0]);
}
wb.Sheets['Produtos'] = XLSX.utils.aoa_to_sheet(out);

// 3) reconstrói Categorias (distintas presentes + Diversos)
const catsUnicas = [...new Set(out.slice(1).map(r => r[2]))];
if (!catsUnicas.includes('Diversos')) catsUnicas.push('Diversos');
const catAoa = [['Nome da Categoria']].concat(catsUnicas.map(c => [c]));
wb.Sheets['Categorias'] = XLSX.utils.aoa_to_sheet(catAoa);

XLSX.writeFile(wb, PATH);
console.log('Produtos apos fusao:', out.length - 1, '(era 1965)');
console.log('Categorias na aba:', catsUnicas.length);
