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
  const lucroIdx = headers.findIndex(h => h.includes('lucro'));
  const idIdx = headers.findIndex(h => h.includes('id'));
  const dateIdx = headers.findIndex(h => h.includes('data'));
  
  const uniqueSales = new Set();
  let thisMonthLucro = 0;
  let allTimeLucro = 0;
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    const id = row[idIdx];
    const dateStr = String(row[dateIdx]); 
    
    if (id && !uniqueSales.has(id)) {
      uniqueSales.add(id);
      const val = getFloatVal(row[lucroIdx]);
      allTimeLucro += val;
      if (dateStr.includes('/07/2026')) {
        thisMonthLucro += val;
      }
    }
  }
  console.log(`Lucro total in spreadsheet for July 2026 (unique sales): R$ ${thisMonthLucro}`);
  console.log(`Lucro total ALL TIME (unique sales): R$ ${allTimeLucro}`);
}
