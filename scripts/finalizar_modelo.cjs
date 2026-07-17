const XLSX = require('xlsx');
const fs = require('fs');

const srcPath = 'data/excel/Vendas Unificadas.xlsx';          // entrada (já com exatos aplicados)
const dstPath = 'data/excel/Dados coletas/Modelo_Importacao.xlsx'; // ARQUIVO FINAL
const bakPath = 'data/excel/Dados coletas/Modelo_Importacao.bak2.xlsx';

fs.copyFileSync(dstPath, bakPath);
console.log('Backup:', bakPath);

// ---------- carrega dados ----------
const wbSrc = XLSX.readFile(srcPath);
const data = XLSX.utils.sheet_to_json(wbSrc.Sheets['Vendas'], { header: 1, defval: null });
const H = data[0];
const ip = H.indexOf('Produto'), iq = H.indexOf('QTD'), ifa = H.indexOf('Faturamento (R$)'), ian = H.indexOf('Ano');

// ---------- estatísticas ----------
const stat = new Map();
for (let i = 1; i < data.length; i++) {
  const p = data[i][ip]; if (!p) continue;
  const n = String(p).trim();
  if (!stat.has(n)) stat.set(n, { qtd: 0, fat: 0 });
  const s = stat.get(n);
  s.qtd += Number(data[i][iq]) || 0;
  s.fat += typeof data[i][ifa] === 'number' ? data[i][ifa] : 0;
}
const nomes = [...stat.keys()];
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

// ---------- mapa exato (norm -> canônico mais frequente) ----------
const byNorm = new Map();
for (const n of nomes) { const k = norm(n); (byNorm.get(k) || byNorm.set(k, []).get(k)).push(n); }
const exactCanon = new Map(); // norm -> raw canon
for (const [k, lista] of byNorm) {
  if (lista.length > 1) {
    lista.sort((a, b) => stat.get(b).qtd - stat.get(a).qtd);
    exactCanon.set(k, lista[0]);
  }
}
const pass1 = n => exactCanon.get(norm(n)) || n;

// ---------- pares fuzzy ----------
function lev(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    d[i][j] = a[i - 1] === b[j - 1] ? d[i - 1][j - 1] : 1 + Math.min(d[i - 1][j], d[i][j - 1], d[i - 1][j - 1]);
  return d[m][n];
}
const SPEC = /^\d+([.,]\d+)?(m|cm|mm|km|ml|l|g|kg|mg|gb|mb|kb|w|v|hz|khz|px|mp|pol|inch)?$/i;
const SPECWORDS = new Set(['preto','branco','azul','vermelho','verde','rosa','amarelo','cinza','prata','dourado','gold','colorido','colorida','plus','pro','max','mini','grande','pequeno','1m','2m','3m','4m','5m','10m','20w','25w','15w','220v','110v','12v','24v','ps2','ps3','ps4','xbox','iphone','android']);
function avisoSpec(a, b) {
  const ta = a.match(/[a-z0-9]+/g) || [], tb = b.match(/[a-z0-9]+/g) || [];
  const sa = new Set(ta), sb = new Set(tb);
  const diff = [...new Set([...ta.filter(x => !sb.has(x)), ...tb.filter(x => !sa.has(x))])];
  if (!diff.length) return '';
  return diff.every(t => SPEC.test(t) || SPECWORDS.has(t)) ? 'SPEC' : '';
}

const fuzzyMerge = new Map(); // norm(canonLess) -> canonMore (raw)
let paresTotal = 0, fundidos = 0;
for (let i = 0; i < nomes.length; i++) {
  for (let j = i + 1; j < nomes.length; j++) {
    const a = norm(nomes[i]), b = norm(nomes[j]);
    if (a === b) continue;
    const dist = lev(a, b), mx = Math.max(a.length, b.length);
    const r = mx ? 1 - dist / mx : 1, lr = Math.min(a.length, b.length) / mx;
    if (r >= 0.9 && lr >= 0.6) {
      paresTotal++;
      if (avisoSpec(a, b) === '') {
        const ca = pass1(nomes[i]), cb = pass1(nomes[j]);
        if (ca !== cb) {
          const more = stat.get(ca).qtd >= stat.get(cb).qtd ? ca : cb;
          const less = more === ca ? cb : ca;
          fuzzyMerge.set(norm(less), more);
          fundidos++;
        }
      }
    }
  }
}

// ---------- aplica nos dados ----------
let mudou = 0;
for (let i = 1; i < data.length; i++) {
  const v = data[i][ip]; if (v == null) continue;
  const p1 = pass1(String(v).trim());
  const p2 = fuzzyMerge.get(norm(p1)) || p1;
  if (p2 !== String(v).trim()) { data[i][ip] = p2; mudou++; }
}

// ---------- validação ----------
const valCols = ['Ano','Qtd Vendas','Total Custo','Total Faturamento','Total Lucro','Faturamento-Custo','Diferença (Lucro vs F-C)'];
const byYear = {};
for (let i = 1; i < data.length; i++) {
  const a = data[i][ian]; if (!byYear[a]) byYear[a] = { q: 0, c: 0, f: 0, l: 0 };
  byYear[a].q++;
  byYear[a].c += typeof data[i][H.indexOf('Custo (R$)')] === 'number' ? data[i][H.indexOf('Custo (R$)')] : 0;
  byYear[a].f += typeof data[i][ifa] === 'number' ? data[i][ifa] : 0;
  byYear[a].l += typeof data[i][H.indexOf('Lucro (R$)')] === 'number' ? data[i][H.indexOf('Lucro (R$)')] : 0;
}
const valRows = []; const tot = { q: 0, c: 0, f: 0, l: 0 };
for (const a of Object.keys(byYear).sort()) {
  const v = byYear[a]; const fc = +(v.f - v.c).toFixed(2); const dif = +(v.l - fc).toFixed(2);
  valRows.push([a, v.q, +v.c.toFixed(2), +v.f.toFixed(2), +v.l.toFixed(2), fc, dif]);
  tot.q += v.q; tot.c += v.c; tot.f += v.f; tot.l += v.l;
}
valRows.push(['TOTAL', tot.q, +tot.c.toFixed(2), +tot.f.toFixed(2), +tot.l.toFixed(2), +(tot.f - tot.c).toFixed(2), +(tot.l - (tot.f - tot.c)).toFixed(2)]);

// ---------- grava no Modelo_Importacao (arquivo final) ----------
const wbDst = XLSX.readFile(dstPath);
wbDst.Sheets['Vendas'] = XLSX.utils.aoa_to_sheet(data);
wbDst.Sheets['Validacao'] = XLSX.utils.aoa_to_sheet([valCols, ...valRows]);
XLSX.writeFile(wbDst, dstPath);

// espelho em Vendas Unificadas (para não ficar divergente)
const wbMir = XLSX.readFile(srcPath);
wbMir.Sheets['Vendas'] = XLSX.utils.aoa_to_sheet(data);
if (wbMir.Sheets['Validacao']) wbMir.Sheets['Validacao'] = XLSX.utils.aoa_to_sheet([valCols, ...valRows]);
XLSX.writeFile(wbMir, srcPath);

// nomes únicos finais
const finalSet = new Set();
for (let i = 1; i < data.length; i++) { const p = data[i][ip]; if (p) finalSet.add(String(p).trim()); }
console.log('Pares fuzzy encontrados:', paresTotal, '| fundidos (sem aviso):', fundidos);
console.log('Células de nome alteradas nesta etapa:', mudou);
console.log('Nomes únicos finais:', finalSet.size);
console.log('Gravado em:', dstPath, '(arquivo final). Espelho em Vendas Unificadas.xlsx.');
console.log('\n=== VALIDAÇÃO FINAL ===');
console.log(valCols.join(' | '));
for (const r of valRows) console.log(r.join(' | '));
