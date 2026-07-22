const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://hqcdxvevyholhydlcbej.supabase.co';
const SUPABASE_KEY = 'sb_publishable_J5Wn_foipp3h1ztHIQp6mw_QePuigXM';

const BACKUP_PATH = path.join(__dirname, '..', 'data', 'excel', 'zmstore-backup-2026-07-21.json');

const TABLE_MAP = {
  products: 'products',
  categories: 'categories',
  sales: 'sales',
  customers: 'customers',
  storeInfo: 'store_info',
  orders: 'service_orders',
};

const BATCH_SIZE = 500;

const SALE_COLUMNS = ['id','date','items','clientName','clientPhone','paymentMethod','subtotal','discount','total','totalCost','profit','status','paidAt','installments','paidAmount','ecommerceOrderId','trackingCode','trackingStatus','saleChannel','saleType','notes','createdAt','updatedAt'];

function normalizeSale(s) {
  const row = {};
  for (const col of SALE_COLUMNS) {
    row[col] = s[col] !== undefined ? s[col] : null;
  }
  if (!row.createdAt) row.createdAt = s.date || new Date().toISOString();
  if (!row.updatedAt) row.updatedAt = s.date || new Date().toISOString();
  if (!row.clientName) row.clientName = null;
  if (!row.clientPhone) row.clientPhone = null;
  return row;
}

async function upsert(table, rows, normalizeFn) {
  if (!rows || rows.length === 0) return { inserted: 0 };
  let total = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    let batch = rows.slice(i, i + BATCH_SIZE);
    if (normalizeFn) batch = batch.map(normalizeFn);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`  [${table}] batch ${Math.floor(i/BATCH_SIZE)+1} ERRO ${res.status}: ${err}`);
    } else {
      total += batch.length;
      process.stdout.write(`  [${table}] ${total}/${rows.length}\r`);
    }
  }
  console.log(`  [${table}] OK - ${total} registros`);
  return { inserted: total };
}

async function main() {
  console.log('Lendo backup...');
  const data = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf8'));

  console.log(`Produtos: ${data.products?.length || 0}`);
  console.log(`Categorias: ${data.categories?.length || 0}`);
  console.log(`Vendas: ${data.sales?.length || 0}`);
  console.log(`Clientes: ${data.customers?.length || 0}`);
  console.log('');

  // Upload in order: categories first (FK), then products, then sales, then customers, then store_info
  await upsert('categories', data.categories || []);
  await upsert('products', data.products || []);
  await upsert('customers', data.customers || []);
  await upsert('sales', data.sales || [], normalizeSale);

  if (data.storeInfo && typeof data.storeInfo === 'object') {
    await upsert('store_info', [{ id: 'singleton', ...data.storeInfo }]);
  }

  console.log('\nConcluído!');
}

main().catch(console.error);
