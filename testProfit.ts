import fs from 'fs';
import * as XLSX from 'xlsx';

const buffer = fs.readFileSync('data/excel/BaseCompleta_2026-07-17.xlsx');
const workbook = XLSX.read(buffer, { type: 'buffer' });

const ws = workbook.Sheets['Vendas'];
if (ws) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[];
  let totalLucro = 0;
  // find Lucro index
  const headers = rows[0].map(h => String(h).toLowerCase());
  const lucroIdx = headers.findIndex(h => h.includes('lucro'));
  const idIdx = headers.findIndex(h => h.includes('id'));
  
  const uniqueSales = new Set();
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    const id = row[idIdx];
    if (id && !uniqueSales.has(id)) {
      uniqueSales.add(id);
      const val = parseFloat(String(row[lucroIdx]).replace(/[^0-9.-]/g, '')) || 0;
      totalLucro += val;
    }
  }
  console.log(`Lucro total in spreadsheet (unique sales): R$ ${totalLucro}`);
}
