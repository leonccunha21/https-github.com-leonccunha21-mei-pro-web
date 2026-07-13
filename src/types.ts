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
  ecommerceOrderId?: string; // ID do pedido Shopee/TikTok/etc
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

export type ActiveTab = 'dashboard' | 'products' | 'pos' | 'sales' | 'reports' | 'settings' | 'os' | 'debtors' | 'cashflow';

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
