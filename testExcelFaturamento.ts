import fs from 'fs';
import * as XLSX from 'xlsx';

function getFloatVal(val: any): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  val = String(val).replace('R$', '').trim();
  val = val.replace(/\./g, '');
  val = val.replace(',', '.');
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

const buffer = fs.readFileSync('data/excel/BaseCompleta_2026-07-17.xlsx');
const workbook = XLSX.read(buffer, { type: 'buffer' });
const ws = workbook.Sheets['Vendas'];

if (ws) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[];
  const headers = rows[0].map(h => String(h).toLowerCase());
  
  const idIdx = headers.findIndex(h => h.includes('id'));
  const faturamentoIdx = headers.findIndex(h => h.includes('faturamento') || h.includes('valor venda'));
  const custoIdx = headers.findIndex(h => h.includes('custo'));
  const dateIdx = headers.findIndex(h => h.includes('data'));
  
  const groups = new Map();
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    const id = row[idIdx];
    if (!id) continue;
    const dateStr = String(row[dateIdx]);
    if (!dateStr.includes('2026')) continue;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(row);
  }
  
  let totalFaturamento = 0;
  let totalCusto = 0;
  
  for (const [id, groupRows] of groups) {
    let saleFaturamento = 0;
    let saleCusto = 0;
    for (const r of groupRows) {
       saleFaturamento += getFloatVal(r[faturamentoIdx]);
       saleCusto += getFloatVal(r[custoIdx]);
    }
    totalFaturamento += saleFaturamento;
    totalCusto += saleCusto;
  }
  
  console.log(`Total Faturamento (Sum of rows) in Excel for July: R$ ${totalFaturamento}`);
  console.log(`Total Custo in Excel for July: R$ ${totalCusto}`);
}
