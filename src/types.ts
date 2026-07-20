export interface PriceHistoryEntry {
  date: string;
  field: 'costPrice' | 'salePrice';
  oldValue: number;
  newValue: number;
}

export type UserRole = 'admin' | 'gerente' | 'vendedor';

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Product {
  id: string;
  code: string; // SKU / Código
  name: string;
  category: string;
  costPrice: number; // Valor Pago / Custo
  salePrice: number; // Valor de Venda
  stock: number; // Quantidade em Estoque
  minStock: number; // Estoque Mínimo para Alerta
  status: 'disponivel' | 'indisponivel';
  description?: string;
  createdAt: string;
  archived?: boolean;
  archivedAt?: string;
  priceHistory?: PriceHistoryEntry[];
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number; // Custo no momento da venda
  salePrice: number; // Preço de venda praticado
  total: number; // Quantidade * Preço de Venda
}

export type PaymentMethod = 'money' | 'card_credit' | 'card_debit' | 'pix' | 'transfer';

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  clientName?: string;
  clientPhone?: string;
  paymentMethod: PaymentMethod;
  subtotal?: number;
  discount?: number;
  total: number; // Valor Total Vendido
  totalCost: number; // Valor Total Pago (Custo)
  profit: number; // Lucro (Total - TotalCost)
  status: 'completed' | 'cancelled' | 'pending';
  paidAt?: string;
  installments?: number;
  paidAmount?: number;
  ecommerceOrderId?: string; // ID do pedido Shopee/TikTok/etc
  saleChannel?: string; // Canal de venda (Loja Física, Shopee, TikTok, OLX, ...)
  saleType: 'CPF' | 'CNPJ';
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  status: 'pending' | 'paid';
  paymentMethod?: string;
  notes?: string;
}

export type ActiveTab = 'dashboard' | 'products' | 'pos' | 'sales' | 'reports' | 'dre' | 'settings' | 'os' | 'debtors' | 'cashflow' | 'customers' | 'purchases' | 'cashclosing' | 'leads' | 'whatsapp' | 'ai' | 'funnel' | 'conciliation';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  cnpj?: string;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export interface PurchaseItem {
  productId?: string;
  productName: string;
  quantity: number;
  costPrice: number;
  salePrice?: number;
}

export interface Purchase {
  id: string;
  date: string;
  supplierId?: string;
  supplierName?: string;
  items: PurchaseItem[];
  total: number;
  notes?: string;
  createdAt: string;
}

export interface CashWithdrawal {
  id: string;
  date: string;
  amount: number;
  reason: string;
}

export interface CashSession {
  id: string;
  openDate: string;
  closeDate?: string;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  difference?: number;
  status: 'open' | 'closed';
  withdrawals: CashWithdrawal[];
  notes?: string;
}

export interface Loan {
  id: string;
  borrowerName: string;
  borrowerPhone?: string;
  loanDate: string; // Data em que pegou o dinheiro
  dueDate: string;  // Data para pagamento
  principal: number; // Valor emprestado
  interestRate?: number; // Taxa de juros em % (aplicada sobre o principal)
  interest: number;  // Valor dos juros (R$)
  paidAmount?: number; // Valor já recebido
  status: 'open' | 'paid';
  notes?: string;
  createdAt: string;
}

export interface StoreInfo {
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  ownerName: string;
  notes: string;
  logoUrl: string;
  primaryColor?: string;
  pixKey?: string;
}

export interface OsItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ServiceOrder {
  id: string;
  type: 'os' | 'orcamento';
  number: number;
  date: string;
  clientName: string;
  clientPhone: string;
  clientAddress?: string;
  device?: string;
  defect?: string;
  items: OsItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'aberta' | 'em_andamento' | 'concluida' | 'cancelada' | 'aprovada' | 'rejeitada';
  notes?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  jobId?: string;
  name: string;
  phone?: string;
  email?: string;
  cnpj?: string;
  source: 'GOOGLE_MAPS' | 'SPREADSHEET' | 'INSTAGRAM' | 'MANUAL';
  createdAt: string;
}

export interface LeadExtractionJob {
  id: string;
  keyword: string;
  location: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  totalFound: number;
  createdAt: string;
}

export interface WhatsAppInstance {
  id: string;
  companyId?: string;
  name: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';
  qrCode?: string;
  createdAt: string;
}

export interface AIAgent {
  id: string;
  name: string;
  objective: string;
  prompt: string;
  model: 'gpt-4o' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet';
  createdAt: string;
}

export type FunnelStage =
  | 'lead'
  | 'contacted'
  | 'qualification'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost';

export interface FunnelStageDef {
  id: FunnelStage;
  name: string;
  color: string;
  text: string;
  bg: string;
  order: number;
}

export interface Opportunity {
  id: string;
  title: string;
  leadId?: string;
  leadName?: string;
  value: number;
  stage: FunnelStage;
  owner?: string;
  expectedCloseDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
