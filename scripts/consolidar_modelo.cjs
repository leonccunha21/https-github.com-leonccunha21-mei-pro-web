const XLSX = require('xlsx');
const fs = require('fs');

const MODELO = 'data/excel/Dados coletas/Modelo_Importacao.xlsx';
const BASE1 = 'data/excel/BASE 1.xlsx';
const BAK = 'data/excel/Dados coletas/Modelo_Importacao.antes_consolidar.xlsx';

fs.copyFileSync(MODELO, BAK);
console.log('Backup: ' + BAK);

const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

const wb = XLSX.readFile(MODELO);
const vRows = XLSX.utils.sheet_to_json(wb.Sheets['Vendas'], { header: 1, defval: null });
const vH = vRows[0];
const viProd = vH.indexOf('Produto');
const viQtd = vH.indexOf('QTD');

let pRows = XLSX.utils.sheet_to_json(wb.Sheets['Produtos'], { header: 1, defval: null });
const pH = pRows[0];
const piNome = pH.indexOf('Nome do Produto');
const piCat = pH.indexOf('Categoria');

// ---- conjunto de nomes (Vendas com qtd + Produtos p/ cobertura) ----
const qty = new Map();
for (let i = 1; i < vRows.length; i++) {
  const n = String(vRows[i][viProd] || '').trim();
  if (!n) continue;
  qty.set(n, (qty.get(n) || 0) + (Number(vRows[i][viQtd]) || 0));
}
const prodNames = new Set();
for (let i = 1; i < pRows.length; i++) { const n = String(pRows[i][piNome] || '').trim(); if (n) prodNames.add(n); }
const names = [...new Set([...qty.keys(), ...prodNames])];

// ---- union-find ----
const parent = new Map();
names.forEach(n => parent.set(n, n));
function find(x) { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; }
function union(a, b) { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb); }

const byNorm = new Map();
for (const n of names) { const k = norm(n); if (!byNorm.has(k)) byNorm.set(k, []); byNorm.get(k).push(n); }
for (const [, lista] of byNorm) if (lista.length > 1) for (let j = 1; j < lista.length; j++) union(lista[0], lista[j]);

// ---- fuzzy ----
function lev(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    d[i][j] = a[i - 1] === b[j - 1] ? d[i - 1][j - 1] : 1 + Math.min(d[i - 1][j], d[i][j - 1], d[i - 1][j - 1]);
  return d[m][n];
}
const SPEC = /^\d+([.,]\d+)?(m|cm|mm|km|ml|l|g|kg|mg|gb|mb|kb|w|v|hz|khz|px|mp|pol|inch)?$/i;
const SPEC2 = /^[a-z]?\d+[a-z]?$/i; // modelos tipo m2, v8, w11, x9, y8
const SPECWORDS = new Set(['preto', 'branco', 'azul', 'vermelho', 'verde', 'rosa', 'amarelo', 'cinza', 'prata', 'dourado', 'gold', 'colorido', 'colorida', 'plus', 'pro', 'max', 'mini', 'grande', 'pequeno', '1m', '2m', '3m', '4m', '5m', '10m', '20w', '25w', '15w', '220v', '110v', '12v', '24v', 'ps2', 'ps3', 'ps4', 'xbox', 'iphone', 'android', 'cpf', 'cnpj']);
const nk = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function isSpecDiff(a, b) {
  const ta = (nk(a).match(/[a-z0-9]+/g) || []);
  const tb = (nk(b).match(/[a-z0-9]+/g) || []);
  const sa = new Set(ta), sb = new Set(tb);
  const diff = [...new Set([...ta.filter(x => !sb.has(x)), ...tb.filter(x => !sa.has(x))])];
  if (diff.length === 0) return false;
  return diff.every(t => SPEC.test(t) || SPEC2.test(t) || SPECWORDS.has(t));
}
for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) {
  const a = norm(names[i]), b = norm(names[j]);
  if (a === b) continue;
  const dist = lev(a, b);
  const mx = Math.max(a.length, b.length);
  const r = mx ? 1 - dist / mx : 1;
  const lr = Math.min(a.length, b.length) / mx;
  if (r >= 0.9 && lr >= 0.6 && !isSpecDiff(names[i], names[j])) union(names[i], names[j]);
}

// ---- canônico por grupo (mais completo = maior length, desempate qtd) ----
const groups = new Map();
for (const n of names) { const r = find(n); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(n); }
const canonMap = new Map();
for (const [, lista] of groups) {
  if (lista.length === 1) { canonMap.set(lista[0], lista[0]); continue; }
  lista.sort((x, y) => y.length - x.length || (qty.get(y) || 0) - (qty.get(x) || 0) || (x < y ? -1 : 1));
  const canon = lista[0];
  for (const v of lista) canonMap.set(v, canon);
}

// ---- Som automotivo (espelhar BASE 1) ----
const bwb = XLSX.readFile(BASE1);
const bpRows = XLSX.utils.sheet_to_json(bwb.Sheets['Produtos'], { header: 1, defval: null });
const bpH = bpRows[0];
const bpiNome = bpH.indexOf('Nome');
const bpiCat = bpH.indexOf('Categoria');
const b1Som = bpRows.slice(1)
  .filter(r => (r[bpiCat] || '').toString().toLowerCase().includes('som automotivo'))
  .map(r => String(r[bpiNome] || '').trim())
  .filter(Boolean);

const SOM_KW = ['power vox', 'snake pro', 'tweeter', 'tweter', 'titwwer', 'corneta', 'mid bass', 'woofer', 'subwoofer', 'caixa de som automotivo', 'alto falante', 'falante automotivo', 'caixa automotiva', 'autosom', 'auto som', 'som automotivo', 'caixa acustica automotiva', 'super tweeter'];
const somNames = new Set();
for (const n of names) { const t = ' ' + norm(n) + ' '; if (SOM_KW.some(k => t.includes(' ' + k + ' ') || t.includes(k))) somNames.add(n); }
for (const b of b1Som) { const bn = norm(b); for (const n of names) if (norm(n) === bn) somNames.add(n); }

function toks(s) { return new Set((String(s).toLowerCase().match(/[a-z0-9]+/g) || [])); }
function jacc(a, b) { const A = toks(a), B = toks(b); let inter = 0; for (const x of A) if (B.has(x)) inter++; const uni = A.size + B.size - inter; return uni ? inter / uni : 0; }
function sim2(a, b) { const na = norm(a), nb = norm(b); if (na === nb) return 1; const d = lev(na, nb); const mx = Math.max(na.length, nb.length); const r = mx ? 1 - d / mx : 1; return Math.max(r, jacc(a, b)); }

const somCanonFinal = new Set();
for (const n of [...somNames]) {
  let best = null, bestS = 0.5;
  for (const b of b1Som) { const s = sim2(n, b); if (s > bestS) { bestS = s; best = b; } }
  if (best) { canonMap.set(n, best); somNames.add(n); somCanonFinal.add(best); }
}
for (const n of somNames) { const c = canonMap.get(n) || n; somCanonFinal.add(c); }

// ---- aplica renomeação ----
let vChanged = 0;
for (let i = 1; i < vRows.length; i++) {
  const v = vRows[i][viProd]; if (v == null) continue;
  const key = String(v).trim(); const c = canonMap.get(key);
  if (c && c !== key) { vRows[i][viProd] = c; vChanged++; }
}
let pChanged = 0;
for (let i = 1; i < pRows.length; i++) {
  const v = pRows[i][piNome]; if (v == null) continue;
  const key = String(v).trim(); const c = canonMap.get(key);
  if (c && c !== key) { pRows[i][piNome] = c; pChanged++; }
  const cf = canonMap.get(key) || key;
  if (somCanonFinal.has(cf)) pRows[i][piCat] = 'Som automotivo';
}

// ---- deduplica linhas de Produtos por nome final ----
const seenName = new Set();
const newP = [pRows[0]];
let dropped = 0;
for (let i = 1; i < pRows.length; i++) {
  const fn = String(pRows[i][piNome] || '').trim();
  if (seenName.has(fn)) { dropped++; continue; }
  seenName.add(fn); newP.push(pRows[i]);
}
pRows = newP;

// ---- aba Categorias ----
let cRows = XLSX.utils.sheet_to_json(wb.Sheets['Categorias'], { header: 1, defval: null });
if (!cRows.length) cRows = [['Nome da Categoria']];
const catCol = cRows[0].indexOf('Nome da Categoria');
const temSom = cRows.slice(1).some(r => (r[catCol] || '').toString().trim().toLowerCase() === 'som automotivo');
if (!temSom) cRows.push(['Som automotivo']);

wb.Sheets['Vendas'] = XLSX.utils.aoa_to_sheet(vRows);
wb.Sheets['Produtos'] = XLSX.utils.aoa_to_sheet(pRows);
wb.Sheets['Categorias'] = XLSX.utils.aoa_to_sheet(cRows);
XLSX.writeFile(wb, MODELO);

// ---- logs ----
let log = 'ORIGINAL;CANONICO;EH_SOM\n';
for (const [k, c] of canonMap) if (c !== k) log += `${k};${c};${somCanonFinal.has(c) ? 'S' : ''}\n`;
fs.writeFileSync('data/excel/consolidar_nomes.csv', log, 'utf8');
console.log('Vendas renomeadas:', vChanged, '| Produtos renomeados:', pChanged, '| Produtos duplicados removidos:', dropped);
console.log('Produtos Som automotivo (canônicos):', somCanonFinal.size);
console.log('Produtos totais agora:', pRows.length - 1);
console.log('Gravado em', MODELO, '| log: consolidar_nomes.csv');
