// Converte data/excel/BASE 2.xlsx no formato LocalDb do app (public/seed-backup.json).
// Usa a aba "Itens Vendidos" para montar os itens de cada venda (qtd correta)
// e a aba "Vendas" para o cabeçalho (cliente, pagamento, canal, status).
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const wb = XLSX.readFile('data/excel/BASE 2.xlsx');

const num = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  const s = String(v).replace(/[^\d.,-]/g, '').replace(/\.(?=\d{2}\b)/g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
};

const parseDateTime = (d, h) => {
  const ds = String(d || '').trim();
  const m = ds.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return new Date().toISOString();
  const day = +m[1], month = +m[2] - 1, year = +m[3];
  const hm = String(h || '').match(/(\d{1,2}):(\d{2})/);
  const hh = hm ? +hm[1] : 12, mm = hm ? +hm[2] : 0;
  const dt = new Date(year, month, day, hh, mm, 0);
  return isNaN(dt.getTime()) ? new Date().toISOString() : dt.toISOString();
};

const mapPayment = (p) => {
  const s = String(p || '').trim().toLowerCase();
  if (s.includes('dinheiro') || s.includes('money')) return 'money';
  if (s.includes('credito') || s.includes('crédito') || s.includes('credit')) return 'card_credit';
  if (s.includes('debito') || s.includes('débito') || s.includes('debit')) return 'card_debit';
  if (s.includes('transf') || s.includes('banc')) return 'transfer';
  return 'pix';
};

const mapStatus = (s) => {
  const t = String(s || '').trim().toLowerCase();
  if (t.includes('cancel')) return 'cancelled';
  if (t.includes('pend') || t.includes('abert') || t.includes('aguar')) return 'pending';
  return 'completed';
};

// ---- Produtos ----
const pRows = XLSX.utils.sheet_to_json(wb.Sheets['Produtos'], { header: 1 });
const products = [];
const categoriesSet = new Set();
const seenCode = new Set();
for (let i = 1; i < pRows.length; i++) {
  const r = pRows[i];
  if (!r || r.length < 2) continue;
  const name = String(r[1] || '').trim();
  if (!name) continue;
  let code = String(r[0] || '').trim();
  if (!code || seenCode.has(code)) code = `PROD-${String(i).padStart(4, '0')}`;
  seenCode.add(code);
  const category = String(r[2] || '').trim();
  if (category) categoriesSet.add(category);
  products.push({
    id: code,
    code,
    name,
    category,
    costPrice: num(r[3]),
    salePrice: num(r[4]),
    stock: num(r[5]),
    minStock: num(r[6]),
    status: 'disponivel',
    createdAt: new Date().toISOString(),
  });
}
const prodByName = new Map();
products.forEach(p => prodByName.set(p.name.trim().toLowerCase(), p));

// ---- Itens de venda (agrupados por Venda ID) ----
const itRows = XLSX.utils.sheet_to_json(wb.Sheets['Itens Vendidos'], { header: 1 });
const itemsBySale = {};
for (let i = 1; i < itRows.length; i++) {
  const r = itRows[i];
  if (!r || r.length < 5) continue;
  const saleId = String(r[0] || '').trim();
  if (!saleId) continue;
  const productName = String(r[3] || '').trim();
  const quantity = num(r[4]) || 1;
  const salePrice = num(r[5]) || 0;
  const costPrice = num(r[7]) || 0;
  const total = num(r[6]) || salePrice * quantity;
  const match = prodByName.get(productName.toLowerCase());
  (itemsBySale[saleId] = itemsBySale[saleId] || []).push({
    productId: match ? match.id : '',
    productName,
    quantity,
    costPrice,
    salePrice,
    total,
  });
}

// ---- Cabeçalho das vendas ----
const vRows = XLSX.utils.sheet_to_json(wb.Sheets['Vendas'], { header: 1 });
const vHeader = {};
for (let i = 1; i < vRows.length; i++) {
  const r = vRows[i];
  if (!r || r.length < 1) continue;
  const saleId = String(r[0] || '').trim();
  if (saleId) vHeader[saleId] = r;
}

// ---- Monta as vendas ----
const sales = [];
for (const saleId of Object.keys(itemsBySale)) {
  const items = itemsBySale[saleId];
  const v = vHeader[saleId] || [];
  const date = parseDateTime(v[1], v[2]);
  const clientName = String(v[3] || '').trim() || undefined;
  const phoneRaw = String(v[4] || '').trim();
  const clientPhone = phoneRaw === '-' ? undefined : phoneRaw || undefined;
  const paymentMethod = mapPayment(v[5]);
  const saleType = String(v[6] || '').trim().toLowerCase().includes('cnpj') ? 'CNPJ' : 'CPF';
  const oidRaw = String(v[7] || '').trim();
  const ecommerceOrderId = oidRaw ? oidRaw : undefined;
  const status = mapStatus(v[13]);
  const saleChannel = String(v[14] || '').trim() || undefined;
  const total = items.reduce((s, it) => s + it.total, 0);
  const totalCost = items.reduce((s, it) => s + it.costPrice * it.quantity, 0);
  sales.push({
    id: saleId,
    date,
    items,
    clientName,
    clientPhone,
    paymentMethod,
    saleType,
    ecommerceOrderId,
    saleChannel,
    total,
    totalCost,
    profit: total - totalCost,
    status,
  });
}

// ---- Despesas ----
const eRows = XLSX.utils.sheet_to_json(wb.Sheets['Despesas'], { header: 1 });
const expenses = [];
for (let i = 1; i < eRows.length; i++) {
  const r = eRows[i];
  if (!r || r.length < 5) continue;
  const id = String(r[0] || '').trim();
  if (!id) continue;
  expenses.push({
    id,
    date: parseDateTime(r[1], ''),
    category: String(r[2] || '').trim(),
    description: String(r[3] || '').trim(),
    amount: num(r[4]),
    status: String(r[5] || '').trim().toLowerCase().includes('pag') ? 'paid' : 'pending',
  });
}

const categories = Array.from(categoriesSet).map((name, i) => ({
  id: `cat_${String(i).padStart(3, '0')}`,
  name,
}));

const db = {
  products,
  categories,
  sales,
  expenses,
  customers: [],
  suppliers: [],
  purchases: [],
  cashSessions: [],
  orders: [],
  loans: [],
  storeInfo: null,
  initialized: true,
};

const out = path.resolve('public/seed-backup.json');
fs.writeFileSync(out, JSON.stringify(db, null, 0));
console.log(`OK -> ${out}`);
console.log('products:', products.length);
console.log('sales:', sales.length);
console.log('categories:', categories.length);
console.log('expenses:', expenses.length);
