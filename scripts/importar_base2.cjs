const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const INPUT = path.join(PROJECT_ROOT, 'data', 'excel', 'BASE 1.xlsx');
const OUTPUT_DATA_JSON = path.join(PROJECT_ROOT, 'src', 'data.json');
const OUTPUT_DATA_TS = path.join(PROJECT_ROOT, 'src', 'data.ts');
const OUTPUT_LOCAL_DB = path.join(PROJECT_ROOT, 'data', 'local-db.json');
const OUTPUT_SEED_BACKUP = path.join(PROJECT_ROOT, 'public', 'seed-backup.json');

const roundCurrency = (v) => Math.round((Number(v) + Number.EPSILON) * 100) / 100;
const n = (v) => (v === '' || v == null ? 0 : Number(v));

// Converte valores monetários que podem vir como texto "R$ 15.00", "R$ 1.200,00" ou número puro.
// No BASE 1.xlsx o ponto é separador decimal (ex.: "55.50" = 55,50) e a vírgula é rara (decimal pt-BR).
function money(v) {
  if (v === '' || v == null) return 0;
  if (typeof v === 'number') return v;
  let t = String(v).replace(/[^\d.,]/g, '').trim();
  if (!t) return 0;
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  const num = Number(t);
  return isNaN(num) ? 0 : num;
}
const str = (v) => (v == null ? '' : String(v).trim());

// Normaliza nome para chave de comparação (sem acento, minúsculo, sem espaço extra)
function normalizeKey(name) {
  return str(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function toISODateBR(d) {
  if (d == null || d === '') return new Date().toISOString();
  if (typeof d === 'number') {
    const dt = new Date(Math.round((d - 25569) * 86400 * 1000));
    return dt.toISOString();
  }
  const s = String(d).trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return `${m[3]}-${String(m[1]).padStart(2,'0')}-${String(m[2]).padStart(2,'0')}T00:00:00.000Z`;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.includes('T') ? s : `${s}T00:00:00.000Z`;
  return new Date().toISOString();
}

function mapPayment(p) {
  p = str(p).toLowerCase();
  if (p === 'pix' || p === 'transferido' || p === 'transferência' || p === 'transferencia') return 'pix';
  if (p.includes('cart') || p.includes('crédit') || p.includes('débit')) return 'card_credit';
  if (p.includes('dinheiro')) return 'money';
  return 'money';
}

function mapChannel(c) {
  const l = str(c).toLowerCase();
  const map = {
    'loja física': 'Loja Física',
    'loja fisica': 'Loja Física',
    'shopee': 'Shopee',
    'shopee cpf': 'Shopee CPF',
    'shopee cnpj': 'Shopee CNPJ',
    'tiktok': 'Tiktok',
    'olx': 'OLX',
  };
  return map[l] || str(c) || 'Loja Física';
}

function mapStatus(s) {
  s = str(s).toLowerCase();
  if (s.includes('pend') || s.includes('aguard')) return 'pending';
  return 'completed';
}

// Helper: obtém valor de campo cujo nome pode ter espaços extras
function getField(row, ...keys) {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== '') return row[k];
    // tenta com trim em todas as chaves do objeto
    for (const rk of Object.keys(row)) {
      if (rk.trim() === k.trim() && row[rk] !== undefined && row[rk] !== '') return row[rk];
    }
  }
  return '';
}

const wb = XLSX.readFile(INPUT);
console.log('Abas:', Object.keys(wb.Sheets).join(', '));

// ---------- PRESERVAR dados operacionais do local-db.json ----------
const preservedLocal = { customers: [], suppliers: [], purchases: [], cashSessions: [], orders: [], storeInfo: null, expenses: [], initialized: true };
if (fs.existsSync(OUTPUT_LOCAL_DB)) {
  try {
    const ex = JSON.parse(fs.readFileSync(OUTPUT_LOCAL_DB, 'utf-8'));
    preservedLocal.customers = ex.customers || [];
    preservedLocal.suppliers = ex.suppliers || [];
    preservedLocal.purchases = ex.purchases || [];
    preservedLocal.cashSessions = ex.cashSessions || [];
    preservedLocal.orders = ex.orders || [];
    preservedLocal.storeInfo = ex.storeInfo !== undefined ? ex.storeInfo : null;
    preservedLocal.expenses = ex.expenses || [];
    preservedLocal.initialized = ex.initialized !== undefined ? ex.initialized : true;
  } catch (e) { console.log('local-db.json inválido:', e.message); }
}

// ---------- LER VENDAS PRIMEIRO (como fonte de verdade) ----------
const vendaSheet = wb.Sheets['Vendas'];
const vendaRaw = vendaSheet ? XLSX.utils.sheet_to_json(vendaSheet, { defval: '' }) : [];

// Diagnóstico dos nomes de coluna das vendas
if (vendaRaw.length > 0) {
  console.log('Colunas da aba Vendas:', Object.keys(vendaRaw[0]).join(' | '));
}

// Mapas de verdade da aba Vendas: nome produto -> { salePrice, totalCost, qty, category }
const vendaSalePriceMap = new Map(); // nameKey -> { sumTotal, sumQty }
const vendaCostMap = new Map();       // nameKey -> { sumCost, sumQty }

const finalSales = [];
for (const row of vendaRaw) {
  const productName = str(getField(row, 'Produto'));
  if (!productName) continue;

  const qty = n(getField(row, 'QTD', 'Qtd', 'Quantidade')) || 1;
  const total = roundCurrency(money(getField(row, 'Valor Venda', ' Valor Venda ', 'ValorVenda', 'Venda')));
  const totalCost = roundCurrency(money(getField(row, 'Custo', ' Custo ', 'Custo Total', 'ValorCusto')));
  const profit = roundCurrency(money(getField(row, 'Lucro')));
  const client = str(getField(row, 'Cliente'));
  const categoria = str(getField(row, 'Categoria'));

  const nameKey = normalizeKey(productName);

  // Acumular para calcular preço médio de venda por produto
  if (total > 0 && qty > 0) {
    if (!vendaSalePriceMap.has(nameKey)) {
      vendaSalePriceMap.set(nameKey, { sumTotal: 0, sumQty: 0, category: categoria });
    }
    const sp = vendaSalePriceMap.get(nameKey);
    sp.sumTotal += total;
    sp.sumQty += qty;
    if (categoria && !sp.category) sp.category = categoria;
  }

  // Acumular custo médio
  if (totalCost > 0 && qty > 0) {
    if (!vendaCostMap.has(nameKey)) {
      vendaCostMap.set(nameKey, { sumCost: 0, sumQty: 0 });
    }
    const cm = vendaCostMap.get(nameKey);
    cm.sumCost += totalCost;
    cm.sumQty += qty;
  }

  finalSales.push({
    id: str(getField(row, 'ID')) || `v_${finalSales.length + 1}`,
    date: toISODateBR(getField(row, 'Data')),
    items: [{
      productId: '',
      productName,
      quantity: qty,
      costPrice: roundCurrency(totalCost / qty),
      salePrice: roundCurrency(total / qty),
      total,
    }],
    clientName: client || undefined,
    paymentMethod: mapPayment(getField(row, 'Pagamento', 'Forma Pagamento')),
    total,
    totalCost,
    profit,
    saleType: str(getField(row, 'Tipo')).toUpperCase() === 'CNPJ' ? 'CNPJ' : 'CPF',
    saleChannel: mapChannel(getField(row, 'Canal')),
    ecommerceOrderId: str(getField(row, 'ID Pedido')) || undefined,
    status: mapStatus(getField(row, 'Status')),
  });
}
console.log(`Vendas: ${finalSales.length}`);

// ---------- PRODUTOS ----------
const prodRaw = wb.Sheets['Produtos'] ? XLSX.utils.sheet_to_json(wb.Sheets['Produtos'], { defval: '' }) : [];
if (prodRaw.length > 0) {
  console.log('Colunas da aba Produtos:', Object.keys(prodRaw[0]).join(' | '));
}

// Mapa dos produtos para facilitar o cruzamento
const prodMap = new Map(); // nameKey -> produto
const finalProducts = [];
let pid = 1;

for (const row of prodRaw) {
  const name = str(getField(row, 'Nome'));
  if (!name) continue;
  const nameKey = normalizeKey(name);
  const stock = n(getField(row, 'Estoque'));

  const produto = {
    id: `p_${pid}`,
    code: str(getField(row, 'SKU', 'Código', 'Codigo')) || `PROD-${String(pid).padStart(4,'0')}`,
    name,
    category: str(getField(row, 'Categoria')) || 'Diversos',
    costPrice: roundCurrency(money(getField(row, 'Preço Custo', 'Preco Custo', 'Custo'))),
    salePrice: roundCurrency(money(getField(row, 'Preço Venda', 'Preco Venda', 'Venda'))),
    stock: Math.max(0, stock),
    minStock: n(getField(row, 'Estoque Mínimo', 'Estoque Minimo')),
    status: stock > 0 ? 'disponivel' : 'indisponivel',
    createdAt: new Date().toISOString(),
  };

  // ---- SINCRONIZAR COM VERDADE DA ABA VENDAS ----
  // Apenas atualizar categoria se a aba Vendas tiver e a Produtos não tiver
  if (vendaSalePriceMap.has(nameKey)) {
    const sp = vendaSalePriceMap.get(nameKey);
    if (sp.category && (!produto.category || produto.category === 'Diversos')) {
      produto.category = sp.category;
    }
  }

  // Se o custo está zerado na aba Produtos mas temos dados nas Vendas, usar custo médio das vendas apenas como fallback
  if (produto.costPrice === 0 && vendaCostMap.has(nameKey)) {
    const cm = vendaCostMap.get(nameKey);
    if (cm.sumQty > 0) {
      const avgCost = roundCurrency(cm.sumCost / cm.sumQty);
      console.log(`  [Fallback costPrice] "${name}": Produtos=0 → Vendas=${avgCost}`);
      produto.costPrice = avgCost;
    }
  }

  prodMap.set(nameKey, produto);
  finalProducts.push(produto);
  pid++;
}

// Adicionar produtos que existem nas Vendas mas não na aba Produtos
let addedFromSales = 0;
for (const [nameKey, sp] of vendaSalePriceMap) {
  if (!prodMap.has(nameKey)) {
    const avgSalePrice = roundCurrency(sp.sumTotal / sp.sumQty);
    const avgCost = vendaCostMap.has(nameKey)
      ? roundCurrency(vendaCostMap.get(nameKey).sumCost / vendaCostMap.get(nameKey).sumQty)
      : 0;
    // Recuperar nome original da primeira venda com esse nameKey
    const venda = finalSales.find(s => normalizeKey(s.items[0].productName) === nameKey);
    const name = venda ? venda.items[0].productName : nameKey;
    finalProducts.push({
      id: `p_${pid}`,
      code: `PROD-${String(pid).padStart(4,'0')}`,
      name,
      category: sp.category || 'Diversos',
      costPrice: avgCost,
      salePrice: avgSalePrice,
      stock: 0,
      minStock: 0,
      status: 'indisponivel',
      createdAt: new Date().toISOString(),
    });
    pid++;
    addedFromSales++;
  }
}
if (addedFromSales > 0) {
  console.log(`Produtos adicionados a partir das Vendas (não estavam na aba Produtos): ${addedFromSales}`);
}
console.log(`Produtos total: ${finalProducts.length}`);

// ---------- CATEGORIAS ----------
const catSet = new Set(finalProducts.map((p) => p.category));
// Garantir que "Som Automotivo" sempre exista na lista de categorias
catSet.add('Som Automotivo');
const finalCategories = [...catSet].map((c, i) => ({ id: `cat_${i + 1}`, name: c }));
console.log(`Categorias: ${finalCategories.length} -> ${[...catSet].join(', ')}`);

// ---------- DESPESAS ----------
let finalExpenses = [];
if (wb.Sheets['Despesas']) {
  const expRaw = XLSX.utils.sheet_to_json(wb.Sheets['Despesas'], { defval: '' });
  let eid = 1;
  for (const row of expRaw) {
    const category = str(getField(row, 'Categoria'));
    const amount = money(getField(row, 'Valor'));
    if (!category || amount <= 0) continue;
    finalExpenses.push({
      id: str(getField(row, 'ID')) || `exp_${eid}`,
      date: toISODateBR(getField(row, 'Data')),
      category,
      description: str(getField(row, 'Descrição', 'Descricao', 'Descrição')),
      amount: roundCurrency(amount),
      status: mapStatus(getField(row, 'Status')),
    });
    eid++;
  }
}
if (finalExpenses.length === 0 && preservedLocal.expenses.length) {
  finalExpenses = preservedLocal.expenses;
  console.log(`Despesas: BASE 2 vazio -> preservando ${finalExpenses.length} existentes.`);
} else {
  console.log(`Despesas: ${finalExpenses.length}`);
}

// ---------- EMPRÉSTIMOS ----------
let finalLoans = [];
if (wb.Sheets['Empréstimos']) {
  const loanRaw = XLSX.utils.sheet_to_json(wb.Sheets['Empréstimos'], { defval: '' });
  for (const row of loanRaw) {
    if (!str(getField(row, 'ID')) && !str(getField(row, 'Nome'))) continue;
    finalLoans.push({
      id: str(getField(row, 'ID')) || `emp_${Date.now()}`,
      borrowerName: str(getField(row, 'Nome')),
      borrowerPhone: str(getField(row, 'Telefone')),
      loanDate: toISODateBR(getField(row, 'Data Empréstimo', 'Data Emprestimo')),
      dueDate: toISODateBR(getField(row, 'Vencimento')),
      principal: roundCurrency(money(getField(row, 'Valor Emprestado'))),
      interest: roundCurrency(money(getField(row, 'Juros'))),
      status: str(getField(row, 'Situação', 'Situacao')) || 'open',
      createdAt: str(getField(row, 'CreatedAt')) || new Date().toISOString(),
    });
  }
}
console.log(`Empréstimos: ${finalLoans.length}`);

console.log(`Preservando: ${preservedLocal.customers.length} clientes, ${preservedLocal.suppliers.length} fornecedores, ${preservedLocal.purchases.length} compras, ${preservedLocal.cashSessions.length} fechamentos.`);

// ---------- GRAVAR data.json + data.ts ----------
const dataJson = JSON.stringify({ products: finalProducts, sales: finalSales, categories: finalCategories, expenses: finalExpenses });
fs.writeFileSync(OUTPUT_DATA_JSON, dataJson, 'utf-8');
const ts = `import { Product, Sale, Category, Expense } from './types';\n\n` +
  `import raw from './data.json';\n\n` +
  `const d = raw as { categories: Category[]; products: Product[]; sales: Sale[]; expenses: Expense[] };\n\n` +
  `export const initialCategories = d.categories;\n` +
  `export const initialProducts = d.products;\n` +
  `export const initialSales = d.sales;\n` +
  `export const initialExpenses = d.expenses;\n`;
fs.writeFileSync(OUTPUT_DATA_TS, ts, 'utf-8');
console.log(`${OUTPUT_DATA_JSON} e ${OUTPUT_DATA_TS} atualizados.`);

// ---------- ATUALIZAR local-db.json ----------
const localDb = {
  products: finalProducts,
  sales: finalSales,
  categories: finalCategories,
  expenses: finalExpenses,
  loans: finalLoans,
  customers: preservedLocal.customers,
  suppliers: preservedLocal.suppliers,
  purchases: preservedLocal.purchases,
  cashSessions: preservedLocal.cashSessions,
  orders: preservedLocal.orders,
  storeInfo: preservedLocal.storeInfo,
  initialized: preservedLocal.initialized,
};
fs.writeFileSync(OUTPUT_LOCAL_DB, JSON.stringify(localDb, null, 2), 'utf-8');
console.log(`${OUTPUT_LOCAL_DB} atualizado.`);

// ---------- ATUALIZAR seed-backup.json ----------
if (fs.existsSync(OUTPUT_SEED_BACKUP)) {
  try {
    const sb = JSON.parse(fs.readFileSync(OUTPUT_SEED_BACKUP, 'utf-8'));
    sb.products = finalProducts;
    sb.sales = finalSales;
    sb.categories = finalCategories;
    sb.expenses = finalExpenses;
    fs.writeFileSync(OUTPUT_SEED_BACKUP, JSON.stringify(sb, null, 2), 'utf-8');
    console.log(`${OUTPUT_SEED_BACKUP} atualizado.`);
  } catch (e) { console.log('seed-backup.json não atualizado:', e.message); }
}

// ---------- RESUMO ----------
console.log('\n========== RESUMO ==========');
console.log(`Produtos: ${finalProducts.length} | Vendas: ${finalSales.length} | Categorias: ${finalCategories.length} | Despesas: ${finalExpenses.length} | Empréstimos: ${finalLoans.length}`);
const totRev = finalSales.reduce((a, s) => a + s.total, 0);
const totCost = finalSales.reduce((a, s) => a + s.totalCost, 0);
const fmtBR = (v) => roundCurrency(v).toFixed(2).replace('.', ',');
console.log(`Faturamento: R$ ${fmtBR(totRev)} | Custo: R$ ${fmtBR(totCost)} | Lucro: R$ ${fmtBR(totRev - totCost)}`);
