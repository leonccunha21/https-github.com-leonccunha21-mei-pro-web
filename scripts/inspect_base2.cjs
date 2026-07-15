const XLSX = require('xlsx');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const INPUT = path.join(PROJECT_ROOT, 'data', 'excel', 'BASE 2.xlsx');

const wb = XLSX.readFile(INPUT);
console.log('Abas:', Object.keys(wb.Sheets).join(', '));

const sheets = Object.keys(wb.Sheets);
sheets.forEach(s => {
  const data = XLSX.utils.sheet_to_json(wb.Sheets[s], { header: 1 });
  console.log('\n=== ABA:', s, '===');
  console.log('Headers:', JSON.stringify(data[0]));
  if (data[1]) console.log('Row 2:', JSON.stringify(data[1]));
  if (data[2]) console.log('Row 3:', JSON.stringify(data[2]));
  console.log('Total linhas:', data.length);
});
