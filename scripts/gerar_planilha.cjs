const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const INPUT = path.join(PROJECT_ROOT, 'src', 'data.json');
const OUTPUT = path.join(PROJECT_ROOT, 'data', 'excel', 'ZMStore_Editavel.xlsx');

function roundCurrency(v) {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}

const d = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));
const { products, sales, expenses } = d;

const wb = XLSX.utils.book_new();

// --- Produtos ---
const prodRows = products.map((p) => ({
  'Produto': p.name,
  'Categoria': p.category,
  'Custo': roundCurrency(p.costPrice),
  'Venda': roundCurrency(p.salePrice),
  'Estoque': p.stock,
  'Estoque Min': p.minStock,
  'Status': p.status === 'disponivel' ? 'Disponível' : 'Indisponível',
}));
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(prodRows), 'Produtos');

// --- Vendas ---
const vendaRows = sales.map((s) => {
  const it = s.items[0] || { productName: '', quantity: 0, costPrice: 0, salePrice: 0 };
  return {
    'Data': (s.date || '').substring(0, 10),
    'Produto': it.productName,
    'QTD': it.quantity,
    'Custo Unit': roundCurrency(it.costPrice),
    'Venda Unit': roundCurrency(it.salePrice),
    'Total': roundCurrency(s.total),
    'Cliente': s.clientName || '',
    'Pagamento': s.paymentMethod,
    'Tipo': s.saleType === 'CNPJ' ? 'CNPJ' : 'CPF',
    'Canal': s.saleChannel || 'Loja Física',
    'Status': s.status === 'completed' ? 'Pago' : 'Pendente',
    'ID Pedido': s.ecommerceOrderId || '',
  };
});
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(vendaRows), 'Vendas');

// --- Despesas ---
if (Array.isArray(expenses) && expenses.length) {
  const expRows = expenses.map((e) => ({
    'Data': (e.date || '').substring(0, 10),
    'Categoria': e.category,
    'Descrição': e.description,
    'Valor': roundCurrency(e.amount),
    'Status': e.status === 'paid' ? 'Pago' : 'Pendente',
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expRows), 'Despesas');
}

XLSX.writeFile(wb, OUTPUT);
console.log(`Planilha editável gerada: ${OUTPUT}`);
console.log(`Produtos: ${prodRows.length} | Vendas: ${vendaRows.length} | Despesas: ${expenses ? expenses.length : 0}`);
console.log('Abas: Produtos, Vendas, Despesas');
