import { Product, Sale, Category, Expense, StoreInfo, ServiceOrder, Customer, Supplier, Purchase, CashSession, Loan } from '../types';

export interface LocalDb {
  products: Product[];
  sales: Sale[];
  categories: Category[];
  expenses: Expense[];
  orders: ServiceOrder[];
  storeInfo: StoreInfo | null;
  customers: Customer[];
  suppliers: Supplier[];
  purchases: Purchase[];
  cashSessions: CashSession[];
  loans: Loan[];
  initialized?: boolean;
}

export async function loadDb(): Promise<Partial<LocalDb>> {
  const res = await fetch('/api/db');
  if (!res.ok) throw new Error('Falha ao carregar o banco de dados local');
  return (await res.json()) as Partial<LocalDb>;
}

export async function saveDb(db: LocalDb): Promise<void> {
  const res = await fetch('/api/db', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(db),
  });
  if (!res.ok) throw new Error('Falha ao salvar o banco de dados local');
}

export async function resetDb(): Promise<void> {
  const res = await fetch('/api/db/reset', { method: 'POST' });
  if (!res.ok) throw new Error('Falha ao zerar o banco de dados local');
}
