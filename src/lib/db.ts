import { supabase, isSupabaseConfigured } from './supabase'
import type {
  Product, Sale, Expense, Category, Customer,
  Supplier, Purchase, ServiceOrder, Bill, Loan,
  StoreInfo, Opportunity,
} from '../types'

// ============================================================
// Helper: serializar/deserializar JSONB do Supabase
// ============================================================
function parseJsonField<T>(value: unknown, fallback: T): T {
  if (!value) return fallback
  if (typeof value === 'string') {
    try { return JSON.parse(value) as T } catch { return fallback }
  }
  return value as T
}

// ============================================================
// db - interface unica para todas as tabelas
// ============================================================
export const db = {
  // ----------------------------------------------------------
  // Products
  // ----------------------------------------------------------
  products: {
    async getAll(): Promise<Product[]> {
      if (!isSupabaseConfigured()) return []
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')
      if (error) { console.error('db.products.getAll:', error); return [] }
      return (data || []).map(row => ({
        ...row,
        priceHistory: parseJsonField(row.priceHistory, []),
      })) as Product[]
    },

    async upsert(product: Product): Promise<Product | null> {
      if (!isSupabaseConfigured()) return null
      const { data, error } = await supabase
        .from('products')
        .upsert(product, { onConflict: 'id' })
        .select()
        .single()
      if (error) { console.error('db.products.upsert:', error); return null }
      return { ...data, priceHistory: parseJsonField(data.priceHistory, []) } as Product
    },

    async delete(id: string): Promise<boolean> {
      if (!isSupabaseConfigured()) return false
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) { console.error('db.products.delete:', error); return false }
      return true
    },
  },

  // ----------------------------------------------------------
  // Sales
  // ----------------------------------------------------------
  sales: {
    async getAll(): Promise<Sale[]> {
      if (!isSupabaseConfigured()) return []
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('date', { ascending: false })
      if (error) { console.error('db.sales.getAll:', error); return [] }
      return (data || []).map(row => ({
        ...row,
        items: parseJsonField(row.items, []),
      })) as Sale[]
    },

    async upsert(sale: Sale): Promise<Sale | null> {
      if (!isSupabaseConfigured()) return null
      const { data, error } = await supabase
        .from('sales')
        .upsert(sale, { onConflict: 'id' })
        .select()
        .single()
      if (error) { console.error('db.sales.upsert:', error); return null }
      return { ...data, items: parseJsonField(data.items, []) } as Sale
    },

    async delete(id: string): Promise<boolean> {
      if (!isSupabaseConfigured()) return false
      const { error } = await supabase.from('sales').delete().eq('id', id)
      if (error) { console.error('db.sales.delete:', error); return false }
      return true
    },
  },

  // ----------------------------------------------------------
  // Categories
  // ----------------------------------------------------------
  categories: {
    async getAll(): Promise<Category[]> {
      if (!isSupabaseConfigured()) return []
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      if (error) { console.error('db.categories.getAll:', error); return [] }
      return (data || []) as Category[]
    },

    async upsert(cat: Category): Promise<Category | null> {
      if (!isSupabaseConfigured()) return null
      const { data, error } = await supabase
        .from('categories')
        .upsert(cat, { onConflict: 'id' })
        .select()
        .single()
      if (error) { console.error('db.categories.upsert:', error); return null }
      return data as Category
    },

    async delete(id: string): Promise<boolean> {
      if (!isSupabaseConfigured()) return false
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) { console.error('db.categories.delete:', error); return false }
      return true
    },
  },

  // ----------------------------------------------------------
  // Expenses
  // ----------------------------------------------------------
  expenses: {
    async getAll(): Promise<Expense[]> {
      if (!isSupabaseConfigured()) return []
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })
      if (error) { console.error('db.expenses.getAll:', error); return [] }
      return (data || []) as Expense[]
    },

    async upsert(exp: Expense): Promise<Expense | null> {
      if (!isSupabaseConfigured()) return null
      const { data, error } = await supabase
        .from('expenses')
        .upsert(exp, { onConflict: 'id' })
        .select()
        .single()
      if (error) { console.error('db.expenses.upsert:', error); return null }
      return data as Expense
    },

    async delete(id: string): Promise<boolean> {
      if (!isSupabaseConfigured()) return false
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) { console.error('db.expenses.delete:', error); return false }
      return true
    },
  },

  // ----------------------------------------------------------
  // Customers
  // ----------------------------------------------------------
  customers: {
    async getAll(): Promise<Customer[]> {
      if (!isSupabaseConfigured()) return []
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name')
      if (error) { console.error('db.customers.getAll:', error); return [] }
      return (data || []) as Customer[]
    },

    async upsert(c: Customer): Promise<Customer | null> {
      if (!isSupabaseConfigured()) return null
      const { data, error } = await supabase
        .from('customers')
        .upsert(c, { onConflict: 'id' })
        .select()
        .single()
      if (error) { console.error('db.customers.upsert:', error); return null }
      return data as Customer
    },

    async delete(id: string): Promise<boolean> {
      if (!isSupabaseConfigured()) return false
      const { error } = await supabase.from('customers').delete().eq('id', id)
      if (error) { console.error('db.customers.delete:', error); return false }
      return true
    },
  },

  // ----------------------------------------------------------
  // Suppliers
  // ----------------------------------------------------------
  suppliers: {
    async getAll(): Promise<Supplier[]> {
      if (!isSupabaseConfigured()) return []
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name')
      if (error) { console.error('db.suppliers.getAll:', error); return [] }
      return (data || []) as Supplier[]
    },

    async upsert(s: Supplier): Promise<Supplier | null> {
      if (!isSupabaseConfigured()) return null
      const { data, error } = await supabase
        .from('suppliers')
        .upsert(s, { onConflict: 'id' })
        .select()
        .single()
      if (error) { console.error('db.suppliers.upsert:', error); return null }
      return data as Supplier
    },

    async delete(id: string): Promise<boolean> {
      if (!isSupabaseConfigured()) return false
      const { error } = await supabase.from('suppliers').delete().eq('id', id)
      if (error) { console.error('db.suppliers.delete:', error); return false }
      return true
    },
  },

  // ----------------------------------------------------------
  // Purchases
  // ----------------------------------------------------------
  purchases: {
    async getAll(): Promise<Purchase[]> {
      if (!isSupabaseConfigured()) return []
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .order('date', { ascending: false })
      if (error) { console.error('db.purchases.getAll:', error); return [] }
      return (data || []).map(row => ({
        ...row,
        items: parseJsonField(row.items, []),
      })) as Purchase[]
    },

    async upsert(p: Purchase): Promise<Purchase | null> {
      if (!isSupabaseConfigured()) return null
      const { data, error } = await supabase
        .from('purchases')
        .upsert(p, { onConflict: 'id' })
        .select()
        .single()
      if (error) { console.error('db.purchases.upsert:', error); return null }
      return { ...data, items: parseJsonField(data.items, []) } as Purchase
    },

    async delete(id: string): Promise<boolean> {
      if (!isSupabaseConfigured()) return false
      const { error } = await supabase.from('purchases').delete().eq('id', id)
      if (error) { console.error('db.purchases.delete:', error); return false }
      return true
    },
  },

  // ----------------------------------------------------------
  // Service Orders (OS / Orcamentos)
  // ----------------------------------------------------------
  serviceOrders: {
    async getAll(): Promise<ServiceOrder[]> {
      if (!isSupabaseConfigured()) return []
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .order('date', { ascending: false })
      if (error) { console.error('db.serviceOrders.getAll:', error); return [] }
      return (data || []).map(row => ({
        ...row,
        items: parseJsonField(row.items, []),
      })) as ServiceOrder[]
    },

    async upsert(so: ServiceOrder): Promise<ServiceOrder | null> {
      if (!isSupabaseConfigured()) return null
      const { data, error } = await supabase
        .from('service_orders')
        .upsert(so, { onConflict: 'id' })
        .select()
        .single()
      if (error) { console.error('db.serviceOrders.upsert:', error); return null }
      return { ...data, items: parseJsonField(data.items, []) } as ServiceOrder
    },

    async delete(id: string): Promise<boolean> {
      if (!isSupabaseConfigured()) return false
      const { error } = await supabase.from('service_orders').delete().eq('id', id)
      if (error) { console.error('db.serviceOrders.delete:', error); return false }
      return true
    },
  },

  // ----------------------------------------------------------
  // Bills (contas a pagar)
  // ----------------------------------------------------------
  bills: {
    async getAll(): Promise<Bill[]> {
      if (!isSupabaseConfigured()) return []
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('dueDate')
      if (error) { console.error('db.bills.getAll:', error); return [] }
      return (data || []) as Bill[]
    },

    async upsert(b: Bill): Promise<Bill | null> {
      if (!isSupabaseConfigured()) return null
      const { data, error } = await supabase
        .from('bills')
        .upsert(b, { onConflict: 'id' })
        .select()
        .single()
      if (error) { console.error('db.bills.upsert:', error); return null }
      return data as Bill
    },

    async delete(id: string): Promise<boolean> {
      if (!isSupabaseConfigured()) return false
      const { error } = await supabase.from('bills').delete().eq('id', id)
      if (error) { console.error('db.bills.delete:', error); return false }
      return true
    },
  },

  // ----------------------------------------------------------
  // Cash Sessions
  // ----------------------------------------------------------
  cashSessions: {
    async getAll(): Promise<any[]> {
      if (!isSupabaseConfigured()) return []
      const { data, error } = await supabase
        .from('cash_sessions')
        .select('*')
        .order('openDate', { ascending: false })
      if (error) { console.error('db.cashSessions.getAll:', error); return [] }
      return (data || []).map(row => ({
        ...row,
        withdrawals: parseJsonField(row.withdrawals, []),
      }))
    },

    async upsert(cs: any): Promise<any | null> {
      if (!isSupabaseConfigured()) return null
      const { data, error } = await supabase
        .from('cash_sessions')
        .upsert(cs, { onConflict: 'id' })
        .select()
        .single()
      if (error) { console.error('db.cashSessions.upsert:', error); return null }
      return { ...data, withdrawals: parseJsonField(data.withdrawals, []) }
    },
  },

  // ----------------------------------------------------------
  // Loans
  // ----------------------------------------------------------
  loans: {
    async getAll(): Promise<Loan[]> {
      if (!isSupabaseConfigured()) return []
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('loanDate', { ascending: false })
      if (error) { console.error('db.loans.getAll:', error); return [] }
      return (data || []) as Loan[]
    },

    async upsert(l: Loan): Promise<Loan | null> {
      if (!isSupabaseConfigured()) return null
      const { data, error } = await supabase
        .from('loans')
        .upsert(l, { onConflict: 'id' })
        .select()
        .single()
      if (error) { console.error('db.loans.upsert:', error); return null }
      return data as Loan
    },

    async delete(id: string): Promise<boolean> {
      if (!isSupabaseConfigured()) return false
      const { error } = await supabase.from('loans').delete().eq('id', id)
      if (error) { console.error('db.loans.delete:', error); return false }
      return true
    },
  },

  // ----------------------------------------------------------
  // Store Info
  // ----------------------------------------------------------
  storeInfo: {
    async get(): Promise<StoreInfo | null> {
      if (!isSupabaseConfigured()) return null
      const { data, error } = await supabase
        .from('store_info')
        .select('*')
        .eq('id', 'singleton')
        .single()
      if (error) { console.error('db.storeInfo.get:', error); return null }
      return data as StoreInfo
    },

    async upsert(info: StoreInfo): Promise<StoreInfo | null> {
      if (!isSupabaseConfigured()) return null
      const { data, error } = await supabase
        .from('store_info')
        .upsert({ ...info, id: 'singleton' }, { onConflict: 'id' })
        .select()
        .single()
      if (error) { console.error('db.storeInfo.upsert:', error); return null }
      return data as StoreInfo
    },
  },

  // ----------------------------------------------------------
  // Leads
  // ----------------------------------------------------------
  leads: {
    async getAll(): Promise<any[]> {
      if (!isSupabaseConfigured()) return []
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('createdAt', { ascending: false })
      if (error) { console.error('db.leads.getAll:', error); return [] }
      return (data || [])
    },

    async upsert(l: any): Promise<any | null> {
      if (!isSupabaseConfigured()) return null
      const { data, error } = await supabase
        .from('leads')
        .upsert(l, { onConflict: 'id' })
        .select()
        .single()
      if (error) { console.error('db.leads.upsert:', error); return null }
      return data
    },
  },

  // ----------------------------------------------------------
  // Opportunities (Funil)
  // ----------------------------------------------------------
  opportunities: {
    async getAll(): Promise<Opportunity[]> {
      if (!isSupabaseConfigured()) return []
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('createdAt', { ascending: false })
      if (error) { console.error('db.opportunities.getAll:', error); return [] }
      return (data || []) as Opportunity[]
    },

    async upsert(o: Opportunity): Promise<Opportunity | null> {
      if (!isSupabaseConfigured()) return null
      const { data, error } = await supabase
        .from('opportunities')
        .upsert(o, { onConflict: 'id' })
        .select()
        .single()
      if (error) { console.error('db.opportunities.upsert:', error); return null }
      return data as Opportunity
    },

    async delete(id: string): Promise<boolean> {
      if (!isSupabaseConfigured()) return false
      const { error } = await supabase.from('opportunities').delete().eq('id', id)
      if (error) { console.error('db.opportunities.delete:', error); return false }
      return true
    },
  },

  // ----------------------------------------------------------
  // Internet Users
  // ----------------------------------------------------------
  internetUsers: {
    async getAll(): Promise<any[]> {
      if (!isSupabaseConfigured()) return []
      const { data, error } = await supabase
        .from('internet_users')
        .select('*')
        .order('userName')
      if (error) { console.error('db.internetUsers.getAll:', error); return [] }
      return (data || []).map(row => ({
        ...row,
        payments: parseJsonField(row.payments, []),
      }))
    },

    async upsert(u: any): Promise<any | null> {
      if (!isSupabaseConfigured()) return null
      const { data, error } = await supabase
        .from('internet_users')
        .upsert(u, { onConflict: 'id' })
        .select()
        .single()
      if (error) { console.error('db.internetUsers.upsert:', error); return null }
      return { ...data, payments: parseJsonField(data.payments, []) }
    },

    async delete(id: string): Promise<boolean> {
      if (!isSupabaseConfigured()) return false
      const { error } = await supabase.from('internet_users').delete().eq('id', id)
      if (error) { console.error('db.internetUsers.delete:', error); return false }
      return true
    },
  },
}
