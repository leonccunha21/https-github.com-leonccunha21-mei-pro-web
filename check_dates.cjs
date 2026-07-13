const XLSX = require('xlsx');
const wb = XLSX.readFile('./arquivos excel/arquivo princial.xlsx');
console.log('Abas:', wb.SheetNames);
for (const name of wb.SheetNames) {
  const ws = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, {header:1});
  console.log('\n=== ' + name + ' (' + data.length + ' linhas) ===');
  if (data.length > 0) console.log('Headers:', data[0]);
  
  // Check date columns for year distribution
  let dates2024 = [];
  let dates2025 = [];
  let dates2026 = [];
  
  for (const row of data) {
    for (const cell of row) {
      if (cell instanceof Date) {
        const y = cell.getFullYear();
        if (y === 2024) dates2024.push(cell.toISOString().slice(0,10));
        if (y === 2025) dates2025.push(cell.toISOString().slice(0,10));
        if (y === 2026) dates2026.push(cell.toISOString().slice(0,10));
      } else if (typeof cell === 'string' && cell.match(/\d{4}-\d{2}-\d{2}/)) {
        const y = parseInt(cell.slice(0,4));
        if (y === 2024) dates2024.push(cell);
        if (y === 2025) dates2025.push(cell);
        if (y === 2026) dates2026.push(cell);
      }
    }
  }
  
  console.log('Datas 2024:', dates2024.length, dates2024.length > 0 ? 'Ex: ' + dates2024.slice(0,3).join(', ') : '');
  console.log('Datas 2025:', dates2025.length, dates2025.length > 0 ? 'Ex: ' + dates2025.slice(0,3).join(', ') : '');
  console.log('Datas 2026:', dates2026.length, dates2026.length > 0 ? 'Ex: ' + dates2026.slice(0,3).join(', ') : '');
  
  // Show first 3 data rows
  if (data.length > 1) {
    console.log('\nPrimeiras 3 linhas de dados:');
    for (let i = 1; i < Math.min(4, data.length); i++) {
      console.log('  Row ' + i + ':', JSON.stringify(data[i]).slice(0, 200));
    }
  }
}
