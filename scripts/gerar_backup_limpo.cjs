const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

function parseBr(v) {
  if (v === '' || v == null) return 0;
  if (typeof v === 'number') return v;
  let s = String(v).trim().replace('R$', '').trim();
  if (!s || s === '-' || s === '0') return 0;
  const neg = s.startsWith('-');
  if (neg) s = s.substring(1).trim();
  if (s.includes(',') && s.includes('.')) s = s.replace(/,/g, '');
  else if (s.includes(',')) s = s.replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : (neg ? -n : n);
}

function toDateISO(dateStr) {
  if (!dateStr) return new Date().toISOString();
  let d = null;
  if (typeof dateStr === 'number') {
    d = new Date((dateStr - 25569) * 86400 * 1000);
  } else {
    const parts = String(dateStr).split('/');
    if (parts.length === 3) d = new Date(+parts[2], +parts[1] - 1, +parts[0]);
  }
  if (!d || isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

console.log('========================================');
console.log('  GERANDO BACKUP LIMPO E DEFINITIVO');
console.log('========================================\n');

const MI_PATH = path.resolve(__dirname, '..', 'data/excel/Dados coletas/Modelo_Importacao.xlsx');
const wb = XLSX.readFile(MI_PATH);

// --- 1. CATEGORIES ---
console.log('1. Processando categorias...');
const catRows = XLSX.utils.sheet_to_json(wb.Sheets['Categorias'], { defval: '' });
const categories = catRows.map((r, i) => ({
  id: 'cat_' + Date.now() + '_' + i,
  name: r['Nome da Categoria']
}));
console.log('   ' + categories.length + ' categorias');

// --- 2. PRODUCTS ---
console.log('2. Processando produtos...');
const prodRows = XLSX.utils.sheet_to_json(wb.Sheets['Produtos'], { defval: '' });
const products = prodRows.map((r, i) => ({
  id: 'p_' + Date.now() + '_' + i,
  code: r['Código/SKU'] || '',
  name: r['Nome do Produto'] || '',
  category: r['Categoria'] || '',
  costPrice: parseBr(r['Preço de Custo']),
  salePrice: parseBr(r['Preço de Venda']),
  stock: parseInt(r['Estoque']) || 0,
  minStock: parseInt(r['Estoque Mínimo']) || 0,
  description: '',
  status: 'disponivel',
  archived: false,
  createdAt: new Date().toISOString()
}));
// Build name -> product map
const prodByName = {};
for (const p of products) {
  const key = p.name.trim().toLowerCase();
  prodByName[key] = p;
}
console.log('   ' + products.length + ' produtos');

// --- 3. CUSTOMERS from Vendas ---
console.log('3. Extraindo clientes...');
const vRows = XLSX.utils.sheet_to_json(wb.Sheets['Vendas'], { defval: '' });
const clientMap = new Map(); // name -> customer
let customerIdx = 0;
for (const r of vRows) {
  const name = (r['Cliente'] || '').trim();
  if (!name) continue;
  if (!clientMap.has(name)) {
    clientMap.set(name, {
      id: 'c_' + Date.now() + '_' + customerIdx++,
      name: name,
      phone: (r['Telefone'] || '').trim(),
      createdAt: toDateISO(r['Data'])
    });
  }
}
const customers = [...clientMap.values()];
console.log('   ' + customers.length + ' clientes');

// --- 4. SALES ---
console.log('4. Processando vendas...');
const sales = [];
const today = new Date('2026-07-19T23:59:59.999Z');
let futureDates = 0;
let zeroCostItems = 0;
let warnings = [];

for (const r of vRows) {
  const id = String(r['ID da Venda'] || '');
  const dateStr = r['Data'];
  const d = toDateISO(dateStr);
  const dt = new Date(d);
  if (dt > today) futureDates++;

  const qtd = parseInt(r['QTD']) || 1;
  const fatTotal = parseBr(r['Faturamento (R$)']);
  const custoTotal = parseBr(r['Custo (R$)']);
  const lucroTotal = parseBr(r['Lucro (R$)']);
  const prodName = (r['Produto'] || '').trim();
  let pagamento = (r['Forma de Pagamento'] || '').trim().toLowerCase() || 'pix';
  // Normalizar forma de pagamento
  if (pagamento === 'money' || pagamento === 'dinheiro' || pagamento === 'din') pagamento = 'money';
  else if (pagamento === 'credito' || pagamento === 'card_credit') pagamento = 'card_credit';
  else if (pagamento === 'debito' || pagamento === 'card_debit') pagamento = 'card_debit';
  else if (pagamento === 'transferencia' || pagamento === 'transfer') pagamento = 'transfer';
  else pagamento = 'pix'; // default

  let tipo = (r['Tipo'] || '').trim().toUpperCase() || 'CPF';
  if (tipo !== 'CPF' && tipo !== 'CNPJ') tipo = 'CPF';

  const canal = (r['Canal'] || '').trim() || 'Loja Física';
  const rawStatus = (r['Status'] || '').trim();
  let saleStatus = 'completed';
  if (rawStatus && rawStatus !== 'Concluída' && rawStatus !== 'Concluido' && rawStatus !== 'completed') {
    saleStatus = 'pending';
  }

  // Build items from sale-level data
  const unitSalePrice = qtd > 0 ? fatTotal / qtd : 0;
  let unitCostPrice = qtd > 0 ? custoTotal / qtd : 0;
  let saleCusto = custoTotal;
  let saleLucro = lucroTotal;

  // Evita 0 no costPrice para nao dar erro no sistema
  if (unitCostPrice === 0 && fatTotal > 0) {
    unitCostPrice = 0.01;
    saleCusto = +(custoTotal + 0.01 * qtd).toFixed(2);
    saleLucro = +(fatTotal - saleCusto).toFixed(2);
    zeroCostItems++;
  }

  // Find matching product
  const prodKey = prodName.toLowerCase();
  let productId = '';
  let productName = prodName;
  if (prodByName[prodKey]) {
    productId = prodByName[prodKey].id;
  } else {
    warnings.push('Produto nao encontrado no catalogo: "' + prodName + '" (venda ' + id + ')');
  }

  const item = {
    productId: productId,
    productName: productName,
    quantity: qtd,
    costPrice: unitCostPrice,
    salePrice: unitSalePrice,
    total: fatTotal
  };

  const clientName = (r['Cliente'] || '').trim();
  const clientPhone = (r['Telefone'] || '').trim();

  sales.push({
    id: id,
    date: d,
    items: [item],
    clientName: clientName || undefined,
    clientPhone: clientPhone || undefined,
    paymentMethod: pagamento,
    total: fatTotal,
    totalCost: saleCusto,
    profit: saleLucro,
    status: saleStatus,
    saleChannel: canal,
    saleType: tipo
  });
}
console.log('   ' + sales.length + ' vendas processadas');
console.log('   ' + futureDates + ' com data futura (serao mantidas com a data original)');
console.log('   ' + zeroCostItems + ' itens com custo zero');
if (warnings.length > 0) {
  console.log('   AVISOS (' + warnings.length + '):');
  const uniqueWarnings = [...new Set(warnings)];
  for (const w of uniqueWarnings.slice(0, 5)) console.log('     - ' + w);
  if (uniqueWarnings.length > 5) console.log('     ... e mais ' + (uniqueWarnings.length - 5));
}

// --- 5. BUILD FINAL JSON ---
console.log('\n5. Montando JSON final...');
const output = {
  products: products,
  sales: sales,
  categories: categories,
  expenses: [],
  orders: [],
  storeInfo: {},
  customers: customers,
  suppliers: [],
  purchases: [],
  cashSessions: [],
  loans: [],
  leads: [],
  leadJobs: [],
  whatsappInstances: [],
  aiAgents: [],
  opportunities: [],
  initialized: true
};

const OUTPUT_PATH = path.resolve(__dirname, '..', 'data/excel/zmstore-backup-LIMPO-2026-07-19.json');
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');

const stats = fs.statSync(OUTPUT_PATH);
console.log('   Arquivo salvo: ' + OUTPUT_PATH);
console.log('   Tamanho: ' + (stats.size / 1024 / 1024).toFixed(2) + ' MB');

// --- 6. VALIDATION ---
console.log('\n========================================');
console.log('  VALIDACAO');
console.log('========================================\n');

// Recalculate totals from sales
let checkFat = 0, checkCusto = 0, checkLucro = 0;
let checkItemFat = 0, checkItemCusto = 0;
let itemErrors = 0;

for (const s of sales) {
  checkFat += s.total;
  checkCusto += s.totalCost;
  checkLucro += s.profit;
  
  if (s.items && s.items.length > 0) {
    let itemTotal = 0, itemCost = 0;
    for (const item of s.items) {
      itemTotal += (item.salePrice || 0) * (item.quantity || 1);
      itemCost += (item.costPrice || 0) * (item.quantity || 1);
    }
    checkItemFat += itemTotal;
    checkItemCusto += itemCost;
    if (Math.abs(itemTotal - s.total) > 0.01 || Math.abs(itemCost - s.totalCost) > 0.01) {
      itemErrors++;
    }
  }
}

console.log('VERIFICACAO DE CONSISTENCIA:');
console.log('  Faturamento (sale.total): R$ ' + checkFat.toFixed(2));
console.log('  Faturamento (itens):      R$ ' + checkItemFat.toFixed(2));
console.log('  Custo (sale.totalCost):   R$ ' + checkCusto.toFixed(2));
console.log('  Custo (itens):            R$ ' + checkItemCusto.toFixed(2));
console.log('  Itens com divergencia:    ' + itemErrors + ' (de ' + sales.length + ')');

const pDiff = Math.abs(checkFat - checkItemFat);
const cDiff = Math.abs(checkCusto - checkItemCusto);
console.log('\nRESULTADO:');
if (pDiff < 1 && cDiff < 1 && itemErrors === 0) {
  console.log('  \u2705 100% CONSISTENTE - NENHUM ERRO ENCONTRADO');
} else {
  console.log('  \u26A0 Diferenca faturamento: R$ ' + pDiff.toFixed(2));
  console.log('  \u26A0 Diferenca custo: R$ ' + cDiff.toFixed(2));
  console.log('  ' + itemErrors + ' itens com divergencia');
}

// Check product references
let prodRefOk = 0, prodRefMiss = 0;
for (const s of sales) {
  if (s.items && s.items[0] && s.items[0].productId) {
    const found = products.some(p => p.id === s.items[0].productId);
    if (found) prodRefOk++;
    else prodRefMiss++;
  }
}
console.log('  Produtos referenciados corretamente: ' + prodRefOk);
console.log('  Produtos sem referencia: ' + prodRefMiss);

console.log('\n========================================');
console.log('  RESUMO');
console.log('========================================\n');
console.log('  Produtos:      ' + products.length);
console.log('  Vendas:        ' + sales.length);
console.log('  Categorias:    ' + categories.length);
console.log('  Clientes:      ' + customers.length);
console.log('  Faturamento:   R$ ' + checkFat.toFixed(2));
console.log('  Custo:         R$ ' + checkCusto.toFixed(2));
console.log('  Lucro:         R$ ' + checkLucro.toFixed(2));
console.log('\n  Arquivo gerado com sucesso!');
