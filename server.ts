import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'local-db.json');
const PORT = Number(process.env.PORT) || 4000;

interface LocalDb {
  products?: any[];
  sales?: any[];
  categories?: any[];
  expenses?: any[];
  orders?: any[];
  storeInfo?: any;
  customers?: any[];
  suppliers?: any[];
  purchases?: any[];
  cashSessions?: any[];
}

function ensureDb(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2), 'utf-8');
  }
}

function readDb(): LocalDb {
  ensureDb();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as LocalDb;
  } catch {
    return {};
  }
}

function writeDb(db: LocalDb): void {
  ensureDb();
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tmp, DATA_FILE);
}

const app = express();
app.use(express.json({ limit: '100mb' }));

app.get('/api/db', (_req, res) => {
  res.json(readDb());
});

app.put('/api/db', (req, res) => {
  const body = (req.body || {}) as LocalDb;
  const current = readDb();
  const merged: LocalDb = {
    products: body.products ?? current.products ?? [],
    sales: body.sales ?? current.sales ?? [],
    categories: body.categories ?? current.categories ?? [],
    expenses: body.expenses ?? current.expenses ?? [],
    orders: body.orders ?? current.orders ?? [],
    storeInfo: body.storeInfo !== undefined ? body.storeInfo : current.storeInfo ?? null,
    customers: body.customers ?? current.customers ?? [],
    suppliers: body.suppliers ?? current.suppliers ?? [],
    purchases: body.purchases ?? current.purchases ?? [],
    cashSessions: body.cashSessions ?? current.cashSessions ?? [],
  };
  writeDb(merged);
  res.json({ ok: true });
});

app.post('/api/db/reset', (_req, res) => {
  writeDb({ products: [], sales: [], categories: [], expenses: [], orders: [], storeInfo: null, customers: [], suppliers: [], purchases: [], cashSessions: [] });
  res.json({ ok: true });
});

const distDir = path.resolve(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Servidor local (banco de dados em ${DATA_FILE}) rodando em http://localhost:${PORT}`);
});
