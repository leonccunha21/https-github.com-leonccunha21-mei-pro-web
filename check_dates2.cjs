const XLSX = require('xlsx');
const wb = XLSX.readFile('./arquivos excel/arquivo princial.xlsx');

// Check date format in Vendas 2024
const ws = wb.Sheets['Vendas 2024'];
const data = XLSX.utils.sheet_to_json(ws, {header:1});

console.log('Headers:', data[0]);
console.log('\nSample rows with date column (col B = index 1):');
for (let i = 1; i < Math.min(6, data.length); i++) {
  const row = data[i];
  const dateVal = row[1];
  console.log('Row', i, '- date value:', dateVal, 'type:', typeof dateVal);
  if (typeof dateVal === 'number') {
    // Convert Excel serial to JS date
    const d = new Date((dateVal - 25569) * 86400 * 1000);
    console.log('  -> Converted to:', d.toISOString().slice(0,10));
  }
}

// Count sales per year across all vendas sheets
console.log('\n=== Year distribution ===');
for (const sheetName of ['Vendas 2024', 'Vendas 2025', 'Vendas 2026']) {
  const ws2 = wb.Sheets[sheetName];
  const d2 = XLSX.utils.sheet_to_json(ws2, {header:1});
  let years = {};
  for (let i = 1; i < d2.length; i++) {
    const dateVal = d2[i][1];
    if (typeof dateVal === 'number') {
      const d = new Date((dateVal - 25569) * 86400 * 1000);
      const y = d.getFullYear();
      years[y] = (years[y] || 0) + 1;
    }
  }
  console.log(sheetName + ':', JSON.stringify(years));
}

// Check if current data.ts has any 2024 sales
const fs = require('fs');
const dataContent = fs.readFileSync('./src/data.ts', 'utf8');
const matches2024 = dataContent.match(/date: '2024/g);
console.log('\nSales with 2024 in data.ts:', matches2024 ? matches2024.length : 0);

// Count total sales in data.ts
const totalSales = dataContent.match(/date: '/g);
console.log('Total sales in data.ts:', totalSales ? totalSales.length : 0);
