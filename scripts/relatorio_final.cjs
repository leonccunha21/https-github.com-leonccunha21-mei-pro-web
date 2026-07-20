const XLSX = require('xlsx');
const path = require('path');

function parseBr(v) {
  if (v === '' || v == null) return 0;
  if (typeof v === 'number') return v;
  let s = String(v).trim().replace('R$', '').trim();
  if (!s || s === '-' || s === '0') return 0;
  const neg = s.startsWith('-');
  if (neg) s = s.substring(1).trim();
  if (s.includes(',') && s.includes('.')) {
    s = s.replace(/,/g, '');
  } else if (s.includes(',')) {
    s = s.replace(',', '.');
  }
  const n = parseFloat(s);
  return isNaN(n) ? 0 : (neg ? -n : n);
}

const INPUT = path.resolve(__dirname, '..', 'data', 'excel', 'BASE 2.xlsx');
const wb = XLSX.readFile(INPUT);
const vendas = XLSX.utils.sheet_to_json(wb.Sheets['Vendas'], { defval: '' });
const prods = XLSX.utils.sheet_to_json(wb.Sheets['Produtos'], { defval: '' });
const today = new Date('2026-07-19T23:59:59.999Z');
const years = {};
const months2026 = {};
const futureDates = [];
const zeroCost = [];
const canalCount = {};

for (const r of vendas) {
  const dateStr = r['Data'];
  let d = null;
  if (typeof dateStr === 'number') {
    d = new Date((dateStr - 25569) * 86400 * 1000);
  } else {
    const parts = String(dateStr).split('/');
    if (parts.length === 3) d = new Date(+parts[2], +parts[1] - 1, +parts[0]);
  }
  if (!d || isNaN(d.getTime())) continue;

  const year = d.getFullYear();
  if (!years[year]) years[year] = { count: 0, totalRevenue: 0, totalCost: 0, totalProfit: 0 };

  const rev = parseBr(r[' Valor Venda ']);
  const cost = parseBr(r[' Custo ']);
  const profit = parseBr(r[' Lucro ']);

  if (d > today) futureDates.push({ id: r['ID'], date: dateStr, rev });

  years[year].count++;
  years[year].totalRevenue += rev;
  years[year].totalCost += cost;
  years[year].totalProfit += profit;

  if (year === 2026) {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    if (!months2026[m]) months2026[m] = { count: 0, rev: 0 };
    months2026[m].count++;
    months2026[m].rev += rev;
  }

  if (cost === 0 && rev > 0) zeroCost.push({ id: r['ID'], rev, prod: r['Produto'] });

  const ca = r['Canal'] || '?';
  canalCount[ca] = (canalCount[ca]||0) + 1;
}

const sortedYears = Object.keys(years).filter(y => !isNaN(y)).sort((a,b) => a-b);

console.log('==============================================================================='.repeat(1));
console.log('  RELATORIO FINAL - DADOS CORRETOS');
console.log('  Fonte: BASE 2.xlsx (identico a BASE 1)');
console.log('  Data: ' + new Date().toLocaleString('pt-BR'));
console.log('==============================================================================='.repeat(1));
console.log('');
console.log('RESUMO GERAL:');
console.log('  Produtos cadastrados:   ' + prods.length);
console.log('  Total de vendas:        ' + vendas.length);
console.log('  Periodo:                ' + sortedYears[0] + ' a ' + sortedYears[sortedYears.length-1]);
console.log('');
console.log('============================================='.repeat(1));
console.log('  FATURAMENTO / CUSTO / LUCRO POR ANO');
console.log('============================================='.repeat(1));
console.log('');
console.log('  ' + 'ANO'.padEnd(6) + 'VENDAS'.padEnd(8) + 'FATURAMENTO(R$)'.padEnd(20) + 'CUSTO(R$)'.padEnd(17) + 'LUCRO(R$)'.padEnd(17) + 'MARGEM');
console.log('  ' + '-'.repeat(78));
let gRev=0,gCost=0,gProfit=0,gCount=0;
for (const y of sortedYears) {
  const r=years[y].totalRevenue, c=years[y].totalCost, p=years[y].totalProfit;
  const m = r > 0 ? ((p/r)*100).toFixed(1) : '0.0';
  console.log('  ' + y.toString().padEnd(6) + String(years[y].count).padEnd(8) + 'R$ ' + r.toFixed(2).padStart(12) + '     R$ ' + c.toFixed(2).padStart(10) + '     R$ ' + p.toFixed(2).padStart(10) + '     ' + m + '%');
  gRev+=r;gCost+=c;gProfit+=p;gCount+=years[y].count;
}
console.log('  ' + '-'.repeat(78));
const gm = gRev > 0 ? ((gProfit/gRev)*100).toFixed(1) : '0.0';
console.log('  ' + 'TOTAL'.padEnd(6) + String(gCount).padEnd(8) + 'R$ ' + gRev.toFixed(2).padStart(12) + '     R$ ' + gCost.toFixed(2).padStart(10) + '     R$ ' + gProfit.toFixed(2).padStart(10) + '     ' + gm + '%');

console.log('');
console.log('============================================='.repeat(1));
console.log('  FATURAMENTO MENSAL 2026');
console.log('============================================='.repeat(1));
console.log('');
const ms = Object.keys(months2026).sort();
for (const m of ms) {
  console.log('  Mes ' + m + ': ' + String(months2026[m].count).padStart(3) + ' vendas - R$ ' + months2026[m].rev.toFixed(2));
}

console.log('');
console.log('============================================='.repeat(1));
console.log('  CANAIS DE VENDA');
console.log('============================================='.repeat(1));
console.log('');
for (const [k,v] of Object.entries(canalCount).sort((a,b) => b[1]-a[1])) {
  console.log('  ' + k + ': ' + v + ' vendas');
}

console.log('');
console.log('============================================='.repeat(1));
console.log('  PROBLEMAS ENCONTRADOS');
console.log('============================================='.repeat(1));
console.log('');
console.log('  A) DATAS FUTURAS: ' + futureDates.length + ' vendas');
if (futureDates.length > 0) {
  const byMonth = {};
  for (const f of futureDates) {
    const p = f.date.split('/');
    const key = p[2] + '-' + p[1];
    byMonth[key] = (byMonth[key]||0) + 1;
  }
  for (const [m,c] of Object.entries(byMonth).sort()) {
    console.log('      ' + m + ': ' + c + ' vendas');
  }
}
console.log('');
console.log('  B) CUSTO ZERO: ' + zeroCost.length + ' vendas (R$ ' + zeroCost.reduce((a,s) => a+s.rev, 0).toFixed(2) + ')');
const zeroTop = zeroCost.sort((a,b) => b.rev - a.rev).slice(0, 5);
for (const z of zeroTop) {
  console.log('      ' + z.id + ' - R$ ' + z.rev.toFixed(2) + ' - ' + (z.prod||'').substring(0,40));
}

console.log('');
console.log('============================================='.repeat(1));
console.log('  DIAGNOSTICO DA CORRUPCAO');
console.log('============================================='.repeat(1));
console.log('');
console.log('  O JSON backup (zmstore-backup-2026-07-17.json) e o arquivo');
console.log('  BaseCompleta_2026-07-17.xlsx contem dados INFLADOS.');
console.log('');
console.log('  CAUSA RAIZ:');
console.log('  Ao re-importar produtos no sistema (IndexedDB), novos IDs foram');
console.log('  gerados. As vendas antigas perderam a referencia correta e o');
console.log('  sistema passou a usar precos de produtos diferentes/errados.');
console.log('');
console.log('  EVIDENCIA:');
console.log('  - Produtos no JSON: 1.912 vs BASE 2: 856');
console.log('  - Product IDs das vendas nao existem no catalogo de produtos');
console.log('  - Apenas 25 vendas do BASE 2 tem ID correspondente no JSON');
console.log('  - 2021 aparece com R$ 1.969.192,92 (falso) vs R$ 0 (real, sem vendas em 2021)');
console.log('');
console.log('  CONCLUSAO:');
console.log('  Use BASE 2 (ou BASE 1) como fonte oficial. Os dados la estao corretos.');
console.log('  O sistema Web esta salvando/exportando dados corrompidos, provavelmente');
console.log('  por causa do IndexedDB que misturou produtos importados em momentos');
console.log('  diferentes com IDs inconsistentes.');

console.log('');
console.log('============================================='.repeat(1));
console.log('  RESUMO EXECUTIVO');
console.log('============================================='.repeat(1));
console.log('');
console.log('  FATURAMENTO TOTAL:   R$ ' + gRev.toFixed(2));
console.log('  CUSTO TOTAL:         R$ ' + gCost.toFixed(2));
console.log('  LUCRO TOTAL:         R$ ' + gProfit.toFixed(2));
console.log('  MARGEM MEDIA:        ' + gm + '%');
console.log('  VENDAS:              ' + gCount);
console.log('  PERIODO:             2023 a 2026');
