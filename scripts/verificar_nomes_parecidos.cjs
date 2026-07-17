const XLSX = require('xlsx');

const wb = XLSX.readFile('data/excel/Dados coletas/Modelo_Importacao.xlsx');
const p = XLSX.utils.sheet_to_json(wb.Sheets['Produtos'], { header: 1, defval: null });
const nomes = p.slice(1).map(r => String(r[1] || '')).filter(Boolean);

const nk = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();

function lev(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array(n + 1); for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    let cur = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[n];
}
const ratio = (a, b) => { const d = lev(a, b); return 1 - d / Math.max(a.length, b.length, 1); };

const norm = nomes.map(nk);
const seen = new Set();
const buckets = {};
norm.forEach((t, i) => {
  const k = t.slice(0, 4);
  (buckets[k] = buckets[k] || []).push(i);
});

const pairs = [];
for (const k in buckets) {
  const idx = buckets[k];
  for (let a = 0; a < idx.length; a++) for (let b = a + 1; b < idx.length; b++) {
    const i = idx[a], j = idx[b];
    if (norm[i] === norm[j]) continue;
    if (Math.abs(norm[i].length - norm[j].length) > 10) continue;
    const r = ratio(norm[i], norm[j]);
    if (r >= 0.82) pairs.push([r, nomes[i], nomes[j]]);
  }
}

pairs.sort((x, y) => y[0] - x[0]);
console.log('PARES PRÓXIMOS encontrados:', pairs.length);
console.log('(similaridade >= 82%, mesmo 1º bloco de 4 letras, normalizado)\n');
const show = pairs.slice(0, 150);
show.forEach(([r, a, b]) => console.log((r * 100).toFixed(1).padStart(5) + '%  | ' + a + '  <>  ' + b));
