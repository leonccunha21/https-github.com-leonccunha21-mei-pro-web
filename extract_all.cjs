const XLSX = require('xlsx');
const fs = require('fs');
const wb = XLSX.readFile('./arquivos excel/arquivo princial.xlsx');

// ============ EXTRACT PRODUCTS ============
const prodWs = wb.Sheets['PROD'];
const prodData = XLSX.utils.sheet_to_json(prodWs, {header:1});

// Extract cost prices from sales
const costMap = {};
for (const sheetName of ['Vendas 2024', 'Vendas 2025', 'Vendas 2026']) {
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, {header:1});
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const productName = String(row[2] || '').trim();
    const costPrice = parseFloat(row[6]) || 0;
    if (productName && costPrice > 0) {
      if (!costMap[productName] || costMap[productName] < costPrice) {
        costMap[productName] = costPrice;
      }
    }
  }
}

const products = [];
for (let i = 1; i < prodData.length; i++) {
  const row = prodData[i];
  const name = String(row[0] || '').trim();
  if (!name) continue;
  const costPrice = costMap[name] || parseFloat(row[3]) || 0;
  products.push({
    id: 'p_' + i,
    code: 'PROD-' + String(i).padStart(4, '0'),
    name: name,
    category: String(row[7] || 'Geral').trim().toUpperCase() || 'Geral',
    costPrice: costPrice,
    salePrice: parseFloat(row[4]) || 0,
    stock: parseInt(row[2]) || 0,
    minStock: 5,
    createdAt: '2026-07-12T00:00:00.000Z'
  });
}

const categories = ['IPHONE', 'MOTOROLA', 'SAMSUNG', 'XIAOMI', 'Privacidade', 'Geral'];
const categoryColors = {
  IPHONE: '#3B82F6',
  MOTOROLA: '#EF4444',
  SAMSUNG: '#8B5CF6',
  XIAOMI: '#F97316',
  Privacidade: '#10B981',
  Geral: '#6B7280'
};
const categoryIcons = {
  IPHONE: 'Smartphone',
  MOTOROLA: 'Smartphone',
  SAMSUNG: 'Smartphone',
  XIAOMI: 'Smartphone',
  Privacidade: 'Shield',
  Geral: 'Package'
};

const categoriesData = categories.map(name => ({
  id: 'c_' + name.toLowerCase(),
  name: name,
  color: categoryColors[name] || '#6B7280',
  icon: categoryIcons[name] || 'Package'
}));

// ============ EXTRACT SALES ============
const sales = [];
let saleId = 1;

function excelDateToISO(serial) {
  if (typeof serial === 'number') {
    const d = new Date((serial - 25569) * 86400 * 1000);
    return d.toISOString().slice(0,10) + 'T12:00:00.000Z';
  }
  if (typeof serial === 'string' && serial.includes('/')) {
    const parts = serial.split('/');
    if (parts.length === 3) {
      return parts[2].padStart(4,'20') + '-' + parts[1].padStart(2,'0') + '-' + parts[0].padStart(2,'0') + 'T12:00:00.000Z';
    }
  }
  return '2026-07-12T12:00:00.000Z';
}

function mapPayment(method) {
  if (!method) return 'money';
  const m = String(method).toLowerCase().trim();
  if (m.includes('pix')) return 'pix';
  if (m.includes('credit') || m.includes('crédito') || m.includes('c/')) return 'card_credit';
  if (m.includes('debit') || m.includes('débito') || m.includes('s/')) return 'card_debit';
  if (m.includes('transfer') || m.includes('transferi')) return 'transfer';
  if (m.includes('shopee')) return 'transfer';
  if (m.includes('magalu')) return 'transfer';
  if (m.includes('loja') || m.includes('fisica') || m.includes('física')) return 'money';
  if (m.includes('picpay')) return 'transfer';
  if (m.includes('infinite')) return 'card_credit';
  if (m.includes('nota')) return 'transfer';
  return 'money';
}

// Vendas 2024 (columns: Mês, Data, Produto, QT, Cliente, Vendedor, Custo Un, Valor gasto, Valor uni venda, Valor da venda, Tipo de venda, Valor CNPJ, Lucro, Forma pagam, % Lucro, Recebido loja)
const ws2024 = wb.Sheets['Vendas 2024'];
const data2024 = XLSX.utils.sheet_to_json(ws2024, {header:1});
for (let i = 1; i < data2024.length; i++) {
  const row = data2024[i];
  const productName = String(row[2] || '').trim();
  if (!productName) continue;
  const qty = parseInt(row[3]) || 1;
  const costUn = parseFloat(row[6]) || 0;
  const saleValue = parseFloat(row[8]) || parseFloat(row[9]) || 0;
  const profit = parseFloat(row[12]) || (saleValue - costUn * qty);
  const payment = mapPayment(row[13]);
  sales.push({
    id: 'v_' + (saleId++),
    date: excelDateToISO(row[1]),
    clientName: String(row[4] || 'Cliente').trim(),
    clientPhone: '',
    items: [{
      productId: 'p_temp_' + i,
      productName: productName,
      quantity: qty,
      salePrice: qty > 0 ? saleValue / qty : saleValue,
      costPrice: costUn,
      total: saleValue
    }],
    subtotal: saleValue,
    discount: 0,
    total: saleValue,
    totalCost: costUn * qty,
    profit: profit,
    paymentMethod: payment,
    status: 'completed',
    notes: ''
  });
}

// Vendas 2025 (same columns as 2024)
const ws2025 = wb.Sheets['Vendas 2025'];
const data2025 = XLSX.utils.sheet_to_json(ws2025, {header:1});
for (let i = 1; i < data2025.length; i++) {
  const row = data2025[i];
  const productName = String(row[2] || '').trim();
  if (!productName) continue;
  const qty = parseInt(row[3]) || 1;
  const costUn = parseFloat(row[6]) || 0;
  const saleValue = parseFloat(row[8]) || parseFloat(row[9]) || 0;
  const profit = parseFloat(row[12]) || (saleValue - costUn * qty);
  const payment = mapPayment(row[13]);
  sales.push({
    id: 'v_' + (saleId++),
    date: excelDateToISO(row[1]),
    clientName: String(row[4] || 'Cliente').trim(),
    clientPhone: '',
    items: [{
      productId: 'p_temp_' + i,
      productName: productName,
      quantity: qty,
      salePrice: qty > 0 ? saleValue / qty : saleValue,
      costPrice: costUn,
      total: saleValue
    }],
    subtotal: saleValue,
    discount: 0,
    total: saleValue,
    totalCost: costUn * qty,
    profit: profit,
    paymentMethod: payment,
    status: 'completed',
    notes: ''
  });
}

// Vendas 2026 (different columns - has discount, fees etc.)
const ws2026 = wb.Sheets['Vendas 2026'];
const data2026 = XLSX.utils.sheet_to_json(ws2026, {header:1});
for (let i = 1; i < data2026.length; i++) {
  const row = data2026[i];
  const productName = String(row[2] || '').trim();
  if (!productName) continue;
  const qty = parseInt(row[3]) || 1;
  const costUn = parseFloat(row[6]) || 0;
  const saleValue = parseFloat(row[8]) || parseFloat(row[10]) || 0;
  const profit = parseFloat(row[21]) || parseFloat(row[11]) || (saleValue - costUn * qty);
  const payment = mapPayment(row[13]);
  const discount = parseFloat(row[15]) || 0;
  sales.push({
    id: 'v_' + (saleId++),
    date: excelDateToISO(row[1]),
    clientName: String(row[4] || 'Cliente').trim(),
    clientPhone: '',
    items: [{
      productId: 'p_temp_' + i,
      productName: productName,
      quantity: qty,
      salePrice: qty > 0 ? saleValue / qty : saleValue,
      costPrice: costUn,
      total: saleValue
    }],
    subtotal: saleValue,
    discount: discount,
    total: discount > 0 ? saleValue - discount : saleValue,
    totalCost: costUn * qty,
    profit: profit,
    paymentMethod: payment,
    status: 'completed',
    notes: ''
  });
}

// Fix floating point
for (const sale of sales) {
  sale.total = Math.round(sale.total * 100) / 100;
  sale.totalCost = Math.round(sale.totalCost * 100) / 100;
  sale.profit = Math.round(sale.profit * 100) / 100;
  sale.subtotal = Math.round(sale.subtotal * 100) / 100;
  for (const item of sale.items) {
    item.total = Math.round(item.total * 100) / 100;
    item.salePrice = Math.round(item.salePrice * 100) / 100;
    item.costPrice = Math.round(item.costPrice * 100) / 100;
  }
}

console.log('Products:', products.length);
console.log('Categories:', categoriesData.length);
console.log('Sales 2024:', data2024.length - 1);
console.log('Sales 2025:', data2025.length - 1);
console.log('Sales 2026:', data2026.length - 1);
console.log('Total Sales:', sales.length);

// Write data.ts
let content = `import { Product, Sale, Category } from './types';\n\n`;
content += `export const initialCategories: Category[] = ${JSON.stringify(categoriesData, null, 2)};\n\n`;
content += `export const initialProducts: Product[] = ${JSON.stringify(products, null, 2)};\n\n`;
content += `export const initialSales: Sale[] = ${JSON.stringify(sales, null, 2)};\n`;

fs.writeFileSync('./src/data.ts', content);
console.log('\ndata.ts written successfully!');

// Write extracted JSON for backup
fs.writeFileSync('./src/extracted_data.json', JSON.stringify({
  products,
  categories: categoriesData,
  sales,
  salesByYear: {
    '2024': data2024.length - 1,
    '2025': data2025.length - 1,
    '2026': data2026.length - 1
  }
}, null, 2));
console.log('extracted_data.json written!');
