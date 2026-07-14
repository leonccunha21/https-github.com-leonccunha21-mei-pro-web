const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const INPUT = path.join(PROJECT_ROOT, 'data', 'excel', 'ZMStore_Editavel.xlsx');
const OUTPUT_DATA_JSON = path.join(PROJECT_ROOT, 'src', 'data.json');
const OUTPUT_DATA_TS = path.join(PROJECT_ROOT, 'src', 'data.ts');
const OUTPUT_LOCAL_DB = path.join(PROJECT_ROOT, 'data', 'local-db.json');

function roundCurrency(v) {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}
function normalizeNameKey(name) {
  return (name || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '').replace(/\s+/g, '');
}
function categorizeProduct(name) {
  const n = (name || '').toLowerCase();
  if (/(capa|capinha|película|pelicula|protetor de tela|vidro temperado)/.test(n)) return 'Capas e Películas';
  if (/(cabo|adaptador|hub)/.test(n)) return 'Cabos e Adaptadores';
  if (/(fone|earphone|airpods|headphone)/.test(n)) return 'Fones de Ouvido';
  if (/(carregador|fontes?|carreg)/.test(n)) return 'Carregadores';
  if (/(suporte|magnético|magnetico|veicular|ventosa|imã|cordão|cordinha)/.test(n)) return 'Acessórios para Celular';
  if (/(mouse|teclado|monitor|notebook|computador)/.test(n)) return 'Computador e Periféricos';
  if (/(memória|memoria|cartão|cartao|micro sd|pendrive|ssd|hd )/.test(n)) return 'Memória e Armazenamento';
  if (/(caixa de som|alto falante|som|impressora|projetor|tv |evok|fluxo)/.test(n)) return 'Áudio e Vídeo';
  if (/(lanterna|câmera|camera|bateria|pilha|antena|wifi|led|lâmpada|lampada|relógio|relogio|smartband|pulseira|watch)/.test(n)) return 'Eletrônicos Diversos';
  if (/(garrafa|kit|balança|tapete|escova|luva|mochila)/.test(n)) return 'Casa e Utensílios';
  if (/(lego|boneco|brinquedo|jogo|figurinha|pop it|baralho)/.test(n)) return 'Brinquedos e Jogos';
  if (/(serviço|servico|formatação|formatacao|impressão|impressao|gravação|gravacao|manutenção|manutencao|instalação|instalacao|xerox)/.test(n)) return 'Serviços';
  return 'Diversos';
}

const wb = XLSX.readFile(INPUT);
console.log('Abas encontradas:', Object.keys(wb.Sheets).join(', '));

// --- PRODUTOS (com deduplicação por nome normalizado) ---
const prodRaw = XLSX.utils.sheet_to_json(wb.Sheets['Produtos'], { defval: '' });
const prodMap = new Map();
for (const row of prodRaw) {
  const name = String(row['Produto'] || '').trim();
  if (!name) continue;
  const cost = Number(row['Custo']) || 0;
  const sale = Number(row['Venda']) || 0;
  const stock = Number(row['Estoque']) || 0;
  const min = Number(row['Estoque Min']) || 0;
  const status = String(row['Status'] || '').includes('Indispon') ? 'indisponivel' : 'disponivel';
  const category = String(row['Categoria'] || '').trim() || categorizeProduct(name);
  const key = normalizeNameKey(name);
  if (prodMap.has(key)) {
    const ex = prodMap.get(key);
    ex.stock += stock;
    ex.costPrice = Math.max(ex.costPrice, cost);
    ex.salePrice = Math.max(ex.salePrice, sale);
    ex.minStock = Math.max(ex.minStock, min);
  } else {
    prodMap.set(key, { name, category, costPrice: cost, salePrice: sale, stock, minStock: min, status });
  }
}
const finalProducts = [];
let pid = 1;
for (const p of prodMap.values()) {
  finalProducts.push({
    id: `p_${pid}`,
    code: `PROD-${String(pid).padStart(4, '0')}`,
    name: p.name,
    category: p.category,
    costPrice: roundCurrency(p.costPrice),
    salePrice: roundCurrency(p.salePrice),
    stock: Math.max(0, p.stock),
    minStock: p.minStock,
    status: p.status,
    createdAt: new Date().toISOString(),
  });
  pid++;
}
console.log(`Produtos: ${finalProducts.length} (após deduplicação de ${prodRaw.length} linhas)`);

// --- VENDAS ---
const vendaRaw = XLSX.utils.sheet_to_json(wb.Sheets['Vendas'], { defval: '' });
const finalSales = [];
let vid = 1;
for (const row of vendaRaw) {
  const productName = String(row['Produto'] || '').trim();
  if (!productName) continue;
  const qty = Number(row['QTD']) || 1;
  const costPrice = Number(row['Custo Unit']) || 0;
  const salePrice = Number(row['Venda Unit']) || 0;
  const total = Number(row['Total']) || roundCurrency(salePrice * qty);
  const dateStr = String(row['Data'] || '').substring(0, 10);
  const status = String(row['Status'] || '').includes('Pend') ? 'pending' : 'completed';
  finalSales.push({
    id: `v_${vid}`,
    date: dateStr ? `${dateStr}T00:00:00.000Z` : new Date().toISOString(),
    items: [{
      productId: '',
      productName,
      quantity: qty,
      costPrice: roundCurrency(costPrice),
      salePrice: roundCurrency(salePrice),
      total: roundCurrency(total),
    }],
    clientName: String(row['Cliente'] || '') || undefined,
    paymentMethod: String(row['Pagamento'] || 'money') || 'money',
    total: roundCurrency(total),
    totalCost: roundCurrency(costPrice * qty),
    profit: roundCurrency(total - costPrice * qty),
    saleType: String(row['Tipo'] || '').toUpperCase() === 'CNPJ' ? 'CNPJ' : 'CPF',
    saleChannel: String(row['Canal'] || 'Loja Física') || 'Loja Física',
    ecommerceOrderId: String(row['ID Pedido'] || '') || undefined,
    status,
  });
  vid++;
}
console.log(`Vendas: ${finalSales.length}`);

// --- DESPESAS ---
let finalExpenses = [];
if (wb.Sheets['Despesas']) {
  const expRaw = XLSX.utils.sheet_to_json(wb.Sheets['Despesas'], { defval: '' });
  let eid = 1;
  for (const row of expRaw) {
    const category = String(row['Categoria'] || '').trim();
    const amount = Number(row['Valor']) || 0;
    if (!category || amount <= 0) continue;
    finalExpenses.push({
      id: `exp_${eid}`,
      date: `${String(row['Data'] || '').substring(0, 10)}T00:00:00.000Z`,
      category,
      description: String(row['Descrição'] || ''),
      amount: roundCurrency(amount),
      status: String(row['Status'] || '').includes('Pend') ? 'pending' : 'paid',
    });
    eid++;
  }
}
console.log(`Despesas: ${finalExpenses.length}`);

// --- CATEGORIAS (derivadas dos produtos) ---
const catSet = new Set(finalProducts.map((p) => p.category));
const finalCategories = [...catSet].map((c, i) => ({ id: `cat_${i + 1}`, name: c }));

// --- GRAVAR data.json + data.ts ---
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
console.log(`\n${OUTPUT_DATA_JSON} e ${OUTPUT_DATA_TS} atualizados.`);

// --- ATUALIZAR local-db.json (para o app refletir sem reset) ---
let storeInfo = null;
let orders = [];
try {
  const existing = JSON.parse(fs.readFileSync(OUTPUT_LOCAL_DB, 'utf-8'));
  storeInfo = existing.storeInfo || null;
  orders = existing.orders || [];
} catch {}
const localDb = {
  products: finalProducts,
  sales: finalSales,
  categories: finalCategories,
  expenses: finalExpenses,
  orders,
  storeInfo,
  initialized: true,
};
fs.writeFileSync(OUTPUT_LOCAL_DB, JSON.stringify(localDb, null, 2), 'utf-8');
console.log(`${OUTPUT_LOCAL_DB} atualizado (initialized: true). Recarregue a página do app.`);

// --- RESUMO ---
console.log('\n========== RESUMO ==========');
console.log(`Produtos: ${finalProducts.length} | Vendas: ${finalSales.length} | Categorias: ${finalCategories.length} | Despesas: ${finalExpenses.length}`);
const totalRev = finalSales.reduce((a, s) => a + s.total, 0);
console.log(`Faturamento total: R$ ${roundCurrency(totalRev).toFixed(2)}`);
