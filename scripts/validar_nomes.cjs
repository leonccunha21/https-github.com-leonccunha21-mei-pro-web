const XLSX = require('xlsx');
const fs = require('fs');

const rows = XLSX.utils.sheet_to_json(XLSX.readFile('data/excel/Vendas Unificadas.xlsx').Sheets['Vendas'], { header: 1, defval: null });
const H = rows[0];
const ip = H.indexOf('Produto');
const iq = H.indexOf('QTD');
const ifa = H.indexOf('Faturamento (R$)');

// Coleta nome -> estatísticas
const stat = new Map(); // nome raw -> {qtd, fat}
for (let i = 1; i < rows.length; i++) {
  const p = rows[i][ip];
  if (!p) continue;
  const nome = String(p).trim();
  const q = Number(rows[i][iq]) || 0;
  const f = typeof rows[i][ifa] === 'number' ? rows[i][ifa] : 0;
  if (!stat.has(nome)) stat.set(nome, { qtd: 0, fat: 0 });
  const s = stat.get(nome);
  s.qtd += q; s.fat += f;
}
const nomes = [...stat.keys()];

const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

// ---- Grupo 1: clusters exatos por normalização ----
const byNorm = new Map();
for (const n of nomes) {
  const k = norm(n);
  if (!byNorm.has(k)) byNorm.set(k, []);
  byNorm.get(k).push(n);
}
const gruposExatos = [];
for (const [k, lista] of byNorm) {
  if (lista.length > 1) {
    gruposExatos.push({ canon: k, variantes: lista.slice().sort((a, b) => stat.get(b).qtd - stat.get(a).qtd) });
  }
}
gruposExatos.sort((a, b) => b.variantes.reduce((s, v) => s + stat.get(v).qtd, 0) - a.variantes.reduce((s, v) => s + stat.get(v).qtd, 0));

// ---- Grupo 2: candidatos fuzzy (possíveis erros de digitação) ----
function lev(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = a[i - 1] === b[j - 1] ? d[i - 1][j - 1] : 1 + Math.min(d[i - 1][j], d[i][j - 1], d[i - 1][j - 1]);
  return d[m][n];
}
function sim(a, b) {
  const dist = lev(a, b);
  const mx = Math.max(a.length, b.length);
  if (mx === 0) return 1;
  const r = 1 - dist / mx;
  const lr = Math.min(a.length, b.length) / mx;
  return { r, lr };
}
const pares = [];
for (let i = 0; i < nomes.length; i++) {
  for (let j = i + 1; j < nomes.length; j++) {
    const a = norm(nomes[i]), b = norm(nomes[j]);
    if (a === b) continue; // já coberto pelos exatos
    const { r, lr } = sim(a, b);
    if (r >= 0.9 && lr >= 0.6) {
      pares.push({ a: nomes[i], b: nomes[j], sim: +r.toFixed(3) });
    }
  }
}
pares.sort((x, y) => y.sim - x.sim);

// ---- Escreve saída ----
let out = 'TIPO;NOME_CANONICO_SUGERIDO;VARIANTES;QTD_TOTAL;FATURAMENTO_TOTAL\n';
for (const g of gruposExatos) {
  const qtd = g.variantes.reduce((s, v) => s + stat.get(v).qtd, 0);
  const fat = g.variantes.reduce((s, v) => s + stat.get(v).fat, 0);
  out += `EXATO;${g.canon};${g.variantes.map(v => v + ' (x' + stat.get(v).qtd + ')').join(' | ')};${qtd};${fat.toFixed(2)}\n`;
}
fs.writeFileSync('data/excel/validacao_nomes_exatos.csv', out, 'utf8');

let out2 = 'NOME_A;NOME_B;SIMILARIDADE;QTD_A;QTD_B;FAT_A;FAT_B\n';
for (const p of pares) {
  out2 += `${p.a};${p.b};${p.sim};${stat.get(p.a).qtd};${stat.get(p.b).qtd};${stat.get(p.a).fat.toFixed(2)};${stat.get(p.b).fat.toFixed(2)}\n`;
}
fs.writeFileSync('data/excel/validacao_nomes_parecidos.csv', out2, 'utf8');

console.log('Nomes únicos:', nomes.length);
console.log('Grupos exatos (variações só de caixa/acento/espaço):', gruposExatos.length);
console.log('Pares parecidos (fuzzy, p/ revisar):', pares.length);
console.log('\n=== TOP 15 grupos exatos (mais vendidos) ===');
gruposExatos.slice(0, 15).forEach(g => {
  console.log(`[${g.canon}] -> ${g.variantes.map(v => v + ' (x' + stat.get(v).qtd + ')').join(' | ')}`);
});
console.log('\n=== TOP 15 pares parecidos ===');
pares.slice(0, 15).forEach(p => console.log(`${p.sim}  "${p.a}"  ~  "${p.b}"`));
