import fs from 'fs';
import * as XLSX from 'xlsx';

const buffer = fs.readFileSync('data/excel/BaseCompleta_2026-07-17.xlsx');
const workbook = XLSX.read(buffer, { type: 'buffer' });

const ws = workbook.Sheets['Vendas'];
if (ws) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[];
  const dateIdx = rows[0].map(h => String(h).toLowerCase()).findIndex(h => h.includes('data'));
  
  const dates = new Set();
  for (let i = 1; i < Math.min(20, rows.length); i++) {
    if (rows[i] && rows[i].length > 0) {
      dates.add(String(rows[i][dateIdx]));
    }
  }
  console.log('Sample dates:', Array.from(dates));
}
