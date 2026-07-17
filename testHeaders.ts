import fs from 'fs';
import * as XLSX from 'xlsx';

const buffer = fs.readFileSync('data/excel/BaseCompleta_2026-07-17.xlsx');
const workbook = XLSX.read(buffer, { type: 'buffer' });

const ws = workbook.Sheets['Vendas'];
if (ws) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
  console.log('Headers:', rows[0]);
}
