const XLSX = require('xlsx');
const path = require('path');

// Path to the Excel file (BASE 2.xlsx)
const excelPath = path.resolve('data/excel/BASE 2.xlsx');

// Load workbook
const wb = XLSX.readFile(excelPath);

// Helper to safely get cell value
const getCell = (row, idx) => (row[idx] !== undefined ? row[idx] : '');

// Read Produtos sheet (assumed name)
const sheet = wb.Sheets['Produtos'];
if (!sheet) {
  console.error('Aba "Produtos" não encontrada no arquivo Excel.');
  process.exit(1);
}

const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Row 0 is header
const header = rows[0];
console.log('Cabeçalhos da aba Produtos:');
console.log(header.join(' | '));

// Print each product line with relevant fields
console.log('\nProdutos (ID, Nome, Categoria, Custo, Preço Venda, Estoque, Validade):');
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r || r.length < 2) continue; // skip empty rows
  const id = getCell(r, 0);
  const name = getCell(r, 1);
  const category = getCell(r, 2);
  const cost = getCell(r, 3);
  const sale = getCell(r, 4);
  const stock = getCell(r, 5);
  const validade = getCell(r, 7); // assume column 8 is validade (adjust if needed)
  console.log(`${id} | ${name} | ${category} | ${cost} | ${sale} | ${stock} | ${validade}`);
}
