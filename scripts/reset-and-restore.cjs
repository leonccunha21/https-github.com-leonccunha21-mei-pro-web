/**
 * reset-and-restore.cjs
 * 1. Apaga TODOS os dados das tabelas principais no Supabase
 * 2. Insere o backup limpo de zmstore-backup-2026-07-21.json
 *
 * Uso: node scripts/reset-and-restore.cjs
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://hqcdxvevyholhydlcbej.supabase.co';
const SUPABASE_KEY = 'sb_publishable_J5Wn_foipp3h1ztHIQp6mw_QePuigXM';

const BACKUP_PATH = path.join(__dirname, '..', 'data', 'excel', 'zmstore-backup-2026-07-21.json');

const BATCH_SIZE = 200;

// Ordem de deleção (sem FK dependentes primeiro)
const TABLES_TO_CLEAR = [
  'sales',
  'purchases',
  'service_orders',
  'expenses',
  'bills',
  'cash_sessions',
  'loans',
  'leads',
  'opportunities',
  'internet_users',
  'customers',
  'suppliers',
  'products',
  'categories',
  // store_info é singleton — será feito upsert, não delete
];

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
};

// ── Helpers ───────────────────────────────────────────────────

async function deleteAll(table) {
  // DELETE com filtro id > '' apaga todas as linhas (RLS permite)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=neq.____never____`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    const body = await res.text();
    // 404 pode ocorrer se a tabela estiver vazia — não é erro fatal
    if (res.status === 404) { console.log(`  [DELETE ${table}] vazia, ok`); return; }
    console.error(`  [DELETE ${table}] ERRO ${res.status}: ${body}`);
  } else {
    console.log(`  [DELETE ${table}] ok`);
  }
}

async function upsertBatch(table, rows) {
  if (!rows || rows.length === 0) {
    console.log(`  [INSERT ${table}] 0 registros, pulando`);
    return;
  }
  let total = 0;
  let errors = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`\n  [INSERT ${table}] batch ${Math.floor(i / BATCH_SIZE) + 1} ERRO ${res.status}: ${err}`);
      errors++;
    } else {
      total += batch.length;
      process.stdout.write(`  [INSERT ${table}] ${total}/${rows.length}\r`);
    }
  }
  if (errors === 0) {
    console.log(`  [INSERT ${table}] OK — ${total} registros              `);
  } else {
    console.log(`  [INSERT ${table}] CONCLUÍDO COM ${errors} ERROS — ${total} registros`);
  }
}

// ── Normalização de campos JSONB ──────────────────────────────

function serializeJsonb(row, fields) {
  const out = { ...row };
  for (const f of fields) {
    if (out[f] !== undefined && out[f] !== null) {
      out[f] = typeof out[f] === 'string' ? out[f] : JSON.stringify(out[f]);
    } else {
      out[f] = '[]';
    }
  }
  return out;
}

function normalizeSale(s) {
  const cols = ['id','date','items','clientName','clientPhone','paymentMethod',
    'subtotal','discount','total','totalCost','profit','status','paidAt',
    'installments','paidAmount','ecommerceOrderId','trackingCode','trackingStatus',
    'saleChannel','saleType','notes','createdAt','updatedAt'];
  const row = {};
  for (const col of cols) row[col] = s[col] !== undefined ? s[col] : null;
  if (!row.createdAt) row.createdAt = s.date || new Date().toISOString();
  if (!row.updatedAt) row.updatedAt = s.date || new Date().toISOString();
  if (!row.saleType)  row.saleType  = 'CPF';
  // Serializa items como JSON string para coluna JSONB
  if (row.items !== null && typeof row.items !== 'string') row.items = JSON.stringify(row.items);
  return row;
}

function normalizeProduct(p) {
  const row = { ...p };
  if (!row.createdAt) row.createdAt = new Date().toISOString();
  if (!row.updatedAt) row.updatedAt = new Date().toISOString();
  if (row.priceHistory !== undefined && row.priceHistory !== null) {
    row.priceHistory = typeof row.priceHistory === 'string' ? row.priceHistory : JSON.stringify(row.priceHistory);
  } else {
    row.priceHistory = '[]';
  }
  return row;
}

// ── Main ──────────────────────────────────────────────────────

async function main() {
  console.log('=== ZM Store — Reset & Restore ===\n');
  console.log('Lendo backup:', BACKUP_PATH);
  const data = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf8'));

  console.log('\nResumo do backup:');
  console.log(`  Produtos:    ${data.products?.length || 0}`);
  console.log(`  Vendas:      ${data.sales?.length || 0}`);
  console.log(`  Categorias:  ${data.categories?.length || 0}`);
  console.log(`  Clientes:    ${data.customers?.length || 0}`);
  console.log('');

  // ── PASSO 1: Limpar tabelas ───────────────────────────────
  console.log('── Passo 1/2: Apagando dados existentes...');
  for (const table of TABLES_TO_CLEAR) {
    await deleteAll(table);
  }
  console.log('');

  // ── PASSO 2: Inserir backup ───────────────────────────────
  console.log('── Passo 2/2: Inserindo dados do backup...');

  // Categorias primeiro (podem ser FK)
  await upsertBatch('categories', (data.categories || []));

  // Produtos
  await upsertBatch('products', (data.products || []).map(normalizeProduct));

  // Clientes
  await upsertBatch('customers', (data.customers || []));

  // Vendas (campo items JSONB serializado)
  await upsertBatch('sales', (data.sales || []).map(normalizeSale));

  // Outros (vazios neste backup, mas inserimos caso existam)
  await upsertBatch('expenses',      (data.expenses || []));
  await upsertBatch('service_orders',(data.orders || []).map(r => serializeJsonb(r, ['items'])));
  await upsertBatch('purchases',     (data.purchases || []).map(r => serializeJsonb(r, ['items'])));
  await upsertBatch('suppliers',     (data.suppliers || []));
  await upsertBatch('cash_sessions', (data.cashSessions || []).map(r => serializeJsonb(r, ['withdrawals'])));
  await upsertBatch('loans',         (data.loans || []));
  await upsertBatch('bills',         (data.bills || []));
  await upsertBatch('internet_users',(data.internetUsers || []).map(r => serializeJsonb(r, ['payments'])));

  // store_info singleton
  if (data.storeInfo && typeof data.storeInfo === 'object') {
    await upsertBatch('store_info', [{ id: 'singleton', ...data.storeInfo }]);
  }

  console.log('\n=== Concluído! ===');
}

main().catch(err => {
  console.error('\nERRO FATAL:', err);
  process.exit(1);
});
