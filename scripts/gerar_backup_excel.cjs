const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const INPUT = path.join(PROJECT_ROOT, 'src', 'data.json');
const OUTPUT_EXCEL = path.join(PROJECT_ROOT, 'data', 'excel', 'Backup_Dados_Completos.xlsx');

function roundCurrency(v) {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}

const d = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));
const { products, sales, categories, expenses } = d;

// --- Validation: garantir que nao ha produtos duplicados por nome normalizado ---
const normalizeNameKey = (name) =>
  (name || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '').replace(/\s+/g, '');
const seen = new Map();
let dups = 0;
for (const p of products) {
  const k = normalizeNameKey(p.name);
  if (seen.has(k)) { dups++; seen.get(k).push(p.code); } else seen.set(k, [p.code]);
}
console.log(`Validacao: ${products.length} produtos, ${seen.size} chaves unicas, duplicados: ${dups}`);
if (dups > 0) {
  const ex = [...seen.entries()].filter(([, v]) => v.length > 1).slice(0, 10);
  console.log('Exemplos de duplicados:', JSON.stringify(ex));
}

const wb = XLSX.utils.book_new();

// Identification sheet
const identData = [
  ['INFORMAÇÕES DA LOJA'],
  ['Nome', ''], ['CNPJ', ''], ['Telefone', ''], ['Email', ''], ['Endereço', ''],
  ['Cidade', ''], ['Estado', ''], ['Proprietário', ''], ['Observações', ''],
  [],
  ['RESUMO DO ESTOQUE'],
  ['Total de Produtos', products.length],
  ['Produtos com Estoque', products.filter((p) => p.stock > 0).length],
  ['Produtos sem Estoque', products.filter((p) => p.stock === 0).length],
  ['Valor Total em Estoque (Custo)', 'R$ ' + roundCurrency(products.reduce((a, p) => a + p.costPrice * p.stock, 0)).toFixed(2)],
  [],
  ['RESUMO DAS VENDAS'],
  ['Total de Itens Vendidos', sales.reduce((a, s) => a + s.items.reduce((i, it) => i + it.quantity, 0), 0)],
  ['Total de Vendas', sales.length],
  ['Faturamento Total', 'R$ ' + roundCurrency(sales.reduce((a, s) => a + s.total, 0)).toFixed(2)],
  ['Custo Total', 'R$ ' + roundCurrency(sales.reduce((a, s) => a + s.totalCost, 0)).toFixed(2)],
  ['Lucro Total', 'R$ ' + roundCurrency(sales.reduce((a, s) => a + s.profit, 0)).toFixed(2)],
];
const identSheet = XLSX.utils.aoa_to_sheet(identData);
identSheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
XLSX.utils.book_append_sheet(wb, identSheet, 'Identificação');

// Products sheet
const prodExport = products.map((p) => ({
  'ID': p.id, 'Código': p.code, 'Produto': p.name, 'Categoria': p.category,
  'Preço Custo': p.costPrice, 'Preço Venda': p.salePrice, 'Estoque': p.stock,
  'Estoque Mínimo': p.minStock, 'Status': p.status === 'disponivel' ? 'Disponível' : 'Indisponível',
}));
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(prodExport), 'Produtos');

// Sales sheet
const saleExport = sales.map((s) => ({
  'ID': s.id, 'Data': s.date, 'Produto': s.items[0] ? s.items[0].productName : '',
  'QTD': s.items[0] ? s.items[0].quantity : 0, 'Valor Venda': s.total, 'Custo': s.totalCost,
  'Lucro': s.profit, 'Cliente': s.clientName || '', 'Pagamento': s.paymentMethod,
  'Tipo': s.saleType === 'CNPJ' ? 'CNPJ' : 'CPF', 'ID Pedido': s.ecommerceOrderId || '',
  'Status': s.status === 'completed' ? 'Pago' : 'Pendente', 'Canal': s.saleChannel || 'Loja Física',
}));
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(saleExport), 'Vendas');

// Expenses sheet
if (Array.isArray(expenses) && expenses.length) {
  const expExport = expenses.map((e) => ({
    'ID': e.id, 'Data': (e.date || '').substring(0, 10), 'Categoria': e.category,
    'Descrição': e.description, 'Valor': e.amount, 'Status': e.status === 'paid' ? 'Pago' : 'Pendente',
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expExport), 'Despesas');
}

XLSX.writeFile(wb, OUTPUT_EXCEL);
console.log(`\nBackup Excel gerado: ${OUTPUT_EXCEL}`);
console.log(`Produtos: ${products.length} | Vendas: ${sales.length} | Categorias: ${categories.length} | Despesas: ${expenses.length}`);
