const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const base = 'data/excel/Dados coletas';
const outXlsx = 'data/excel/Vendas Unificadas.xlsx';
const outCsv = 'data/excel/Vendas Unificadas.csv';

const MODELO = ['ID da Venda','Data','Hora','Cliente','Telefone','Forma de Pagamento','Tipo','Produto','QTD','Custo (R$)','Faturamento (R$)','Lucro (R$)','Status','Canal'];
const EXTRA = ['Ano','Mês','Origem'];
const FIELDS = [...MODELO, ...EXTRA];

const MONTHS = /^(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)$/i;
const isMonth = s => typeof s === 'string' && MONTHS.test(s.trim().toLowerCase());
const MNAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
function monthNum(v) {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return (v >= 1 && v <= 12) ? v : 0;
  const s = String(v).trim().toLowerCase();
  const idx = MNAMES.findIndex(m => m.toLowerCase() === s);
  if (idx >= 0) return idx + 1;
  const n = parseInt(s, 10);
  return (n >= 1 && n <= 12) ? n : 0;
}
function serialToBr(v) {
  if (typeof v !== 'number') return '';
  if (v < 40000 || v > 60000) return '';
  const d = new Date((v - 25569) * 86400000);
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}
const num = v => (v == null || v === '' || isNaN(Number(v))) ? '' : Number(v);
const str = v => (v == null ? '' : String(v).trim());

function readRows(file, sheet) {
  const wb = XLSX.readFile(path.join(base, file), { sheets: [sheet] });
  const ws = wb.Sheets[sheet];
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
}

// cols: índices das colunas na planilha (sem shift). mesFromFirstCell removido (cada linha traz seu mês).
const SOURCES = [
  { file: 'venda 2024 a 2026 .xlsx', sheet: 'Vendas 2024', year: 2024, label: 'venda 2024 a 2026',
    cols: { mes: 0, produto: 2, data: 1, qtd: 3, cliente: 4, tipo: 9, custo: 6, faturamento: 8, lucro: 10, status: 11 } },
  { file: 'venda 2024 a 2026 .xlsx', sheet: 'Vendas 2025', year: 2025, label: 'venda 2024 a 2026',
    cols: { mes: 0, produto: 2, data: 1, qtd: 3, cliente: 4, tipo: 9, custo: 6, faturamento: 8, lucro: 10, status: 11 } },
  { file: 'venda 2024 a 2026 .xlsx', sheet: 'Vendas 2026', year: 2026, label: 'venda 2024 a 2026',
    cols: { mes: 0, produto: 2, data: 1, qtd: 3, cliente: 4, tipo: 9, custo: 6, faturamento: 8, lucro: 10, status: 11 } },
  { file: 'Vendas 2023 bi.xlsx', sheet: 'Vendas', year: 2023, label: 'Vendas 2023 bi',
    cols: { mes: 0, produto: 1, qtd: 2, custo: 3, faturamento: 4, lucro: 5, status: 6, canal: 7 } },
  { file: 'Vendas 2022.xlsx', sheet: 'vendas', year: 2022, label: 'Vendas 2022',
    cols: { mes: 0, produto: 1, qtd: 2, custo: 3, faturamento: 4, lucro: 5, status: 6, tipo: 7 } },
  { file: 'Gastos 2019.xlsx', sheet: 'Vendas', year: 2019, label: 'Gastos 2019',
    cols: { mes: 0, produto: 1, cliente: 2, custo: 4, faturamento: 3, lucro: 5, status: 6 } },
  { file: 'Gastos 2020.xlsx', sheet: 'Vendas 20', year: 2020, label: 'Gastos 2020',
    cols: { data: 0, produto: 1, qtd: 2, custo: 3, faturamento: 4, lucro: 5, status: 6, canal: 7 } },
  { file: 'Gastos 2021.xlsx', sheet: 'vendas', year: 2021, label: 'Gastos 2021',
    cols: { mes: 0, produto: 1, qtd: 2, custo: 3, faturamento: 4, lucro: 5, status: 6, data: 7 } },
];

const records = [];
let seq = 0;
let skipped = 0;

for (const cfg of SOURCES) {
  const rows = readRows(cfg.file, cfg.sheet);
  if (!rows.length) { console.log(`  (vazio) ${cfg.label} [${cfg.sheet}]`); continue; }
  const hr = cfg.headerRow || 0;
  const data = rows;
  for (let i = hr + 1; i < data.length && i < 30000; i++) {
    const r = data[i];
    if (r.every(c => c == null || c === '')) continue;
    if (isMonth(r[0])) continue;
    if (typeof r[0] === 'string') continue; // linha de rótulo/agregada

    const c = cfg.cols;
    const produto = c.produto != null ? str(r[c.produto]) : '';
    if (!produto) { skipped++; continue; }

    const cliente = c.cliente != null ? str(r[c.cliente]) : '';
    const tipo = c.tipo != null ? str(r[c.tipo]) : '';
    const canal = c.canal != null ? str(r[c.canal]) : '';
    const custo = c.custo != null ? num(r[c.custo]) : '';
    const faturamento = c.faturamento != null ? num(r[c.faturamento]) : '';
    const lucro = c.lucro != null ? num(r[c.lucro]) : '';
    const status = c.status != null ? str(r[c.status]) : '';
    const forma = c.forma != null ? str(r[c.forma]) : '';
    const qtd = c.qtd != null ? num(r[c.qtd]) : '';

    let mnum = c.mes != null ? monthNum(r[c.mes]) : 0;
    const mes = mnum ? MNAMES[mnum - 1] : '';
    let dataBr = '';
    if (c.data != null) dataBr = serialToBr(r[c.data]);
    if (!dataBr && mnum && cfg.year) dataBr = `01/${String(mnum).padStart(2, '0')}/${cfg.year}`;

    seq++;
    records.push({
      'ID da Venda': 'V' + String(seq).padStart(5, '0'),
      'Data': dataBr,
      'Hora': '',
      'Cliente': cliente,
      'Telefone': '',
      'Forma de Pagamento': forma,
      'Tipo': tipo,
      'Produto': produto,
      'QTD': qtd === '' ? 1 : qtd,
      'Custo (R$)': custo,
      'Faturamento (R$)': faturamento,
      'Lucro (R$)': lucro,
      'Status': status,
      'Canal': canal,
      'Ano': cfg.year,
      'Mês': mes,
      'Origem': cfg.label,
    });
  }
  console.log(`  ${cfg.label} [${cfg.sheet}]: ${records.length} acumulado`);
}

console.log('Total de vendas unificadas:', records.length, '| ignoradas(aggregadas):', skipped);

// Validação: totais por ano
const valCols = ['Ano','Qtd Vendas','Total Custo','Total Faturamento','Total Lucro','Faturamento-Custo','Diferença (Lucro vs F-C)'];
const byYear = {};
for (const rec of records) {
  const a = rec['Ano'];
  if (!byYear[a]) byYear[a] = { q: 0, c: 0, f: 0, l: 0 };
  byYear[a].q++;
  byYear[a].c += typeof rec['Custo (R$)'] === 'number' ? rec['Custo (R$)'] : 0;
  byYear[a].f += typeof rec['Faturamento (R$)'] === 'number' ? rec['Faturamento (R$)'] : 0;
  byYear[a].l += typeof rec['Lucro (R$)'] === 'number' ? rec['Lucro (R$)'] : 0;
}
const valRows = [];
const tot = { q: 0, c: 0, f: 0, l: 0 };
for (const a of Object.keys(byYear).sort()) {
  const v = byYear[a];
  const fc = +(v.f - v.c).toFixed(2);
  const dif = +(v.l - fc).toFixed(2);
  valRows.push([a, v.q, +v.c.toFixed(2), +v.f.toFixed(2), +v.l.toFixed(2), fc, dif]);
  tot.q += v.q; tot.c += v.c; tot.f += v.f; tot.l += v.l;
}
valRows.push(['TOTAL', tot.q, +tot.c.toFixed(2), +tot.f.toFixed(2), +tot.l.toFixed(2), +(tot.f - tot.c).toFixed(2), +(tot.l - (tot.f - tot.c)).toFixed(2)]);

console.log('\n=== VALIDAÇÃO (totais por ano) ===');
console.log(valCols.join(' | '));
for (const row of valRows) console.log(row.join(' | '));

// Escreve arquivo
const ws = XLSX.utils.json_to_sheet(records, { header: FIELDS });
const wbOut = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wbOut, ws, 'Vendas');
const wsVal = XLSX.utils.aoa_to_sheet([valCols, ...valRows]);
XLSX.utils.book_append_sheet(wbOut, wsVal, 'Validacao');
XLSX.writeFile(wbOut, outXlsx);
fs.writeFileSync(outCsv, XLSX.utils.sheet_to_csv(ws), 'utf8');
console.log('\nSalvo:', outXlsx, 'e', outCsv);
