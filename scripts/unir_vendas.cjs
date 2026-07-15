const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const base = 'data/excel/Dados coletas';
const outXlsx = 'data/excel/Vendas Unificadas.xlsx';
const outCsv = 'data/excel/Vendas Unificadas.csv';

const MODELO = ['ID da Venda','Data','Hora','Cliente','Telefone','Forma de Pagamento','Tipo','Produto','QTD','Custo (R$)','Faturamento (R$)','Lucro (R$)','Status'];
const EXTRA = ['Ano','Mês','Origem'];
const FIELDS = [...MODELO, ...EXTRA];

const MONTHS = /^(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)$/i;
const isMonth = s => typeof s === 'string' && MONTHS.test(s.trim().toLowerCase());

function serialToBr(v) {
  if (typeof v !== 'number') return '';
  if (v < 40000 || v > 60000) return '';
  const d = new Date((v - 25569) * 86400000);
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}
const num = v => (v == null || v === '' || isNaN(Number(v))) ? '' : Number(v);
const str = v => (v == null ? '' : String(v).trim());

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

function readRows(file, sheet) {
  const wb = XLSX.readFile(path.join(base, file), { sheets: [sheet] });
  const ws = wb.Sheets[sheet];
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
}

// config: {file, sheet, year, label, headerRow, shift, cols{}, mesFromFirstCell, dataFrom[], skipAggregate}
const SOURCES = [
  { file: 'venda 2024 a 2026 .xlsx', sheet: 'Vendas 2024', year: 2024, label: 'venda 2024 a 2026',
    cols: { mes: 0, produto: 2, data: 1, qtd: 3, cliente: 4, tipo: 9, custo: 6, faturamento: 8, lucro: 10, status: 11 } },
  { file: 'venda 2024 a 2026 .xlsx', sheet: 'Vendas 2025', year: 2025, label: 'venda 2024 a 2026',
    cols: { mes: 0, produto: 2, data: 1, qtd: 3, cliente: 4, tipo: 9, custo: 6, faturamento: 8, lucro: 10, status: 11 } },
  { file: 'venda 2024 a 2026 .xlsx', sheet: 'Vendas 2026', year: 2026, label: 'venda 2024 a 2026',
    cols: { mes: 0, produto: 2, data: 1, qtd: 3, cliente: 4, tipo: 9, custo: 6, faturamento: 8, lucro: 10, status: 11 } },
  { file: 'Vendas 2023 bi.xlsx', sheet: 'Vendas', year: 2023, label: 'Vendas 2023 bi',
    cols: { produto: 2, mes: 1, qtd: 3, tipo: 9, custo: 4, faturamento: 6, lucro: 7, status: 8 } },
  { file: 'Vendas 2022.xlsx', sheet: 'vendas', year: 2022, label: 'Vendas 2022', mesFromFirstCell: true,
    cols: { produto: 1, tipo: 8, custo: 3, faturamento: 4, lucro: 5, status: 6 } },
  { file: 'Gastos 2019.xlsx', sheet: 'Vendas', year: 2019, label: 'Gastos 2019',
    cols: { produto: 1, cliente: 2, custo: 4, faturamento: 3, lucro: 5, status: 6, mes: 0 } },
  { file: 'Gastos 2020.xlsx', sheet: 'Vendas 20', year: 2020, label: 'Gastos 2020',
    shift: true, cols: { produto: 0, custo: 2, faturamento: 3, lucro: 4, status: 5, data: 6 } },
  { file: 'Gastos 2021.xlsx', sheet: 'vendas', year: 2021, label: 'Gastos 2021',
    shift: true, dataFrom: [6, 7], cols: { produto: 0, custo: 2, faturamento: 3, lucro: 4, status: 5 } },
];

const records = [];
let seq = 0;
let skipped = 0;

for (const cfg of SOURCES) {
  const rows = readRows(cfg.file, cfg.sheet);
  if (!rows.length) continue;
  const hr = cfg.headerRow || 0;
  let data = cfg.shift ? rows.map(r => r.slice(1)) : rows;
  let currentMonth = '';
  for (let i = hr + 1; i < data.length && i < 30000; i++) {
    const r = data[i];
    if (r.every(c => c == null || c === '')) continue;
    if (cfg.mesFromFirstCell) {
      if (isMonth(r[0])) { currentMonth = str(r[0]); continue; }
    }
    if (isMonth(r[0])) continue;
    if (!cfg.shift && typeof r[0] === 'string') continue; // aggregate label row in non-shifted sheets

    const c = cfg.cols;
    let produto = c.produto != null ? str(r[c.produto]) : '';
    let cliente = c.cliente != null ? str(r[c.cliente]) : '';
    let tipo = c.tipo != null ? str(r[c.tipo]) : '';
    let custo = c.custo != null ? num(r[c.custo]) : '';
    let faturamento = c.faturamento != null ? num(r[c.faturamento]) : '';
    let lucro = c.lucro != null ? num(r[c.lucro]) : '';
    let status = c.status != null ? str(r[c.status]) : '';
    let forma = c.forma != null ? str(r[c.forma]) : '';
    let qtd = c.qtd != null ? num(r[c.qtd]) : '';
    if (qtd === '') qtd = 1;
    let rawMes = c.mes != null ? r[c.mes] : (cfg.mesFromFirstCell ? currentMonth : '');
    let mnum = monthNum(rawMes);
    let mes = mnum ? MNAMES[mnum - 1] : (typeof rawMes === 'string' ? str(rawMes) : '');
    let dataBr = '';
    if (c.data != null) dataBr = serialToBr(r[c.data]);
    if (cfg.dataFrom) {
      for (const di of cfg.dataFrom) {
        const v = serialToBr(r[di]);
        if (v) { dataBr = v; break; }
      }
    }
    if (!dataBr && mnum && cfg.year) {
      dataBr = `01/${String(mnum).padStart(2, '0')}/${cfg.year}`;
    }

    if (!produto) { skipped++; continue; }
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
      'QTD': qtd,
      'Custo (R$)': custo,
      'Faturamento (R$)': faturamento,
      'Lucro (R$)': lucro,
      'Status': status,
      'Ano': cfg.year,
      'Mês': mes,
      'Origem': cfg.label,
    });
  }
  console.log(`  ${cfg.label} [${cfg.sheet}]: ${records.length} acumulado`);
}

console.log('Total de vendas unificadas:', records.length, '| ignoradas(aggregadas):', skipped);

const ws = XLSX.utils.json_to_sheet(records, { header: FIELDS });
const wbOut = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wbOut, ws, 'Vendas');
XLSX.writeFile(wbOut, outXlsx);
fs.writeFileSync(outCsv, XLSX.utils.sheet_to_csv(ws), 'utf8');
console.log('Salvo:', outXlsx, 'e', outCsv);
