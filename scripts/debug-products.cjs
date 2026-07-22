const fs = require('fs');

const SUPABASE_URL = 'https://hqcdxvevyholhydlcbej.supabase.co';
const SUPABASE_KEY = 'sb_publishable_J5Wn_foipp3h1ztHIQp6mw_QePuigXM';
const headers = { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json' };

async function count(table) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id`, {
    headers: { ...headers, 'Prefer': 'count=exact', 'Range-Unit': 'items', 'Range': '0-0' }
  });
  return r.headers.get('content-range');
}

async function main() {
  const data = JSON.parse(fs.readFileSync('data/excel/zmstore-backup-2026-07-21.json', 'utf8'));

  // Pega 5 produtos reais do backup e mostra estrutura
  const sample = data.products.slice(0, 5).map(p => ({
    ...p,
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
    priceHistory: p.priceHistory ? JSON.stringify(p.priceHistory) : '[]'
  }));

  console.log('=== PRODUTO EXEMPLO ===');
  console.log(JSON.stringify(sample[0], null, 2));

  // Limpa tudo antes
  console.log('\n=== LIMPANDO products ===');
  for (let i = 0; i < 20; i++) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id&limit=500`, { headers });
    const rows = await r.json();
    if (!rows.length) break;
    const ids = rows.map(x => x.id);
    await fetch(`${SUPABASE_URL}/rest/v1/products?id=in.(${ids.join(',')})`, { method: 'DELETE', headers: { ...headers, 'Prefer': 'return=minimal' } });
    console.log('  deletados', ids.length);
  }
  console.log('count depois delete:', await count('products'));

  // Insere BATCH 1 (200 produtos)
  console.log('\n=== INSERT BATCH 1 (200 produtos) ===');
  const batch1 = data.products.slice(0, 200).map(p => ({
    ...p,
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
    priceHistory: p.priceHistory ? JSON.stringify(p.priceHistory) : '[]'
  }));
  const r1 = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(batch1)
  });
  console.log('status:', r1.status);
  if (!r1.ok) console.log('ERRO:', await r1.text());
  console.log('count depois batch1:', await count('products'));

  // Insere BATCH 2 (200-400)
  console.log('\n=== INSERT BATCH 2 (200-400) ===');
  const batch2 = data.products.slice(200, 400).map(p => ({
    ...p,
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
    priceHistory: p.priceHistory ? JSON.stringify(p.priceHistory) : '[]'
  }));
  const r2 = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(batch2)
  });
  console.log('status:', r2.status);
  if (!r2.ok) console.log('ERRO:', await r2.text());
  console.log('count depois batch2:', await count('products'));

  // Insere todos os 1912 de uma vez em batch de 200
  console.log('\n=== INSERT TODOS OS 1912 ===');
  const all = data.products.map(p => ({
    ...p,
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
    priceHistory: p.priceHistory ? JSON.stringify(p.priceHistory) : '[]'
  }));
  let total = 0;
  for (let i = 0; i < all.length; i += 200) {
    const batch = all.slice(i, i + 200);
    const r = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(batch)
    });
    if (!r.ok) {
      console.log(`  batch ${i}-${i+200} ERRO ${r.status}:`, await r.text());
    } else {
      total += batch.length;
      process.stdout.write(`  inseridos: ${total}/${all.length}\r`);
    }
  }
  console.log('\ncount FINAL:', await count('products'));
}

main().catch(console.error);
