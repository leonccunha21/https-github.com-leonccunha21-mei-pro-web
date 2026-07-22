-- ============================================================
-- Gestão.PRO - Migração inicial para Supabase
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================================

-- Tabela: products
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  "costPrice" NUMERIC(12,2) NOT NULL DEFAULT 0,
  "salePrice" NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock NUMERIC(10,2) NOT NULL DEFAULT 0,
  "minStock" NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'disponivel',
  description TEXT DEFAULT '',
  "createdAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text,
  "updatedAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text,
  archived BOOLEAN DEFAULT false,
  "archivedAt" TEXT,
  "priceHistory" JSONB DEFAULT '[]'::jsonb
);

-- Tabela: categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL DEFAULT '',
  color TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  "createdAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text,
  "updatedAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text
);

-- Tabela: sales
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  date TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  "clientName" TEXT,
  "clientPhone" TEXT,
  "paymentMethod" TEXT NOT NULL DEFAULT 'money',
  subtotal NUMERIC(12,2) DEFAULT 0,
  discount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  "totalCost" NUMERIC(12,2) NOT NULL DEFAULT 0,
  profit NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  "paidAt" TEXT,
  installments NUMERIC(3,0),
  "paidAmount" NUMERIC(12,2),
  "ecommerceOrderId" TEXT,
  "trackingCode" TEXT,
  "trackingStatus" TEXT,
  "saleChannel" TEXT,
  "saleType" TEXT NOT NULL DEFAULT 'CPF',
  notes TEXT,
  "createdAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text,
  "updatedAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text
);

-- Tabela: expenses
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  date TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text,
  category TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  "paymentMethod" TEXT,
  notes TEXT,
  "createdAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text,
  "updatedAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text
);

-- Tabela: customers
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  email TEXT,
  address TEXT,
  cnpj TEXT,
  notes TEXT,
  "createdAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text,
  "updatedAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text
);

-- Tabela: suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  email TEXT,
  notes TEXT,
  "createdAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text,
  "updatedAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text
);

-- Tabela: purchases
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  date TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text,
  "supplierId" TEXT,
  "supplierName" TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  "createdAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text,
  "updatedAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text
);

-- Tabela: service_orders (OS / Orcamentos)
CREATE TABLE IF NOT EXISTS service_orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT NOT NULL DEFAULT 'os',
  number NUMERIC(10,0) NOT NULL DEFAULT 1,
  date TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text,
  "clientName" TEXT NOT NULL DEFAULT '',
  "clientPhone" TEXT NOT NULL DEFAULT '',
  "clientAddress" TEXT,
  device TEXT,
  defect TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'aberta',
  notes TEXT,
  "createdAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text,
  "updatedAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text
);

-- Tabela: bills (contas a pagar)
CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL DEFAULT '',
  description TEXT,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  "dueDate" TEXT NOT NULL,
  "paymentDate" TEXT,
  category TEXT NOT NULL DEFAULT '',
  recurrence TEXT NOT NULL DEFAULT 'once',
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  "createdAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text,
  "updatedAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text
);

-- Tabela: cash_sessions
CREATE TABLE IF NOT EXISTS cash_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "openDate" TEXT NOT NULL,
  "closeDate" TEXT,
  "openingBalance" NUMERIC(12,2) NOT NULL DEFAULT 0,
  "closingBalance" NUMERIC(12,2),
  "expectedBalance" NUMERIC(12,2),
  difference NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'open',
  withdrawals JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  "createdAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text,
  "updatedAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text
);

-- Tabela: loans (emprestimos)
CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "borrowerName" TEXT NOT NULL DEFAULT '',
  "borrowerPhone" TEXT,
  "loanDate" TEXT NOT NULL,
  "dueDate" TEXT NOT NULL,
  principal NUMERIC(12,2) NOT NULL DEFAULT 0,
  "interestRate" NUMERIC(5,2) DEFAULT 0,
  interest NUMERIC(12,2) NOT NULL DEFAULT 0,
  "paidAmount" NUMERIC(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open',
  notes TEXT,
  "createdAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text,
  "updatedAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text
);

-- Tabela: store_info (configuracoes da loja - apenas 1 registro)
CREATE TABLE IF NOT EXISTS store_info (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  name TEXT DEFAULT '',
  cnpj TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  "ownerName" TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  "logoUrl" TEXT DEFAULT '',
  "primaryColor" TEXT DEFAULT '#6366f1',
  "pixKey" TEXT DEFAULT ''
);

-- Tabela: leads
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "jobId" TEXT,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  email TEXT,
  cnpj TEXT,
  source TEXT NOT NULL DEFAULT 'MANUAL',
  "createdAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text,
  "updatedAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text
);

-- Tabela: opportunities (funil de vendas)
CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL DEFAULT '',
  "leadId" TEXT,
  "leadName" TEXT,
  value NUMERIC(12,2) NOT NULL DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'lead',
  owner TEXT,
  "expectedCloseDate" TEXT,
  notes TEXT,
  "createdAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text,
  "updatedAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text
);

-- Tabela: internet_users (clientes de internet)
CREATE TABLE IF NOT EXISTS internet_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userName" TEXT NOT NULL DEFAULT '',
  contact TEXT,
  "serviceStartDate" TEXT NOT NULL,
  "monthlyFee" NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  payments JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  "createdAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text,
  "updatedAt" TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::text
);

-- ============================================================
-- Habilitar RLS (Row Level Security) em todas as tabelas
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE internet_users ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Politicas RLS: permitir acesso total para usuario autenticado
-- (Ajuste conforme necessidade de multi-tenant)
-- ============================================================
CREATE POLICY "Allow all for authenticated" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON service_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON bills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON cash_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON loans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON store_info FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON opportunities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON internet_users FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Inserir loja padrao
-- ============================================================
INSERT INTO store_info (id, name, cnpj, phone, email, address, city, state, "ownerName")
VALUES ('singleton', 'ZM Store', '', '', '', '', '', '', '')
ON CONFLICT (id) DO NOTHING;
