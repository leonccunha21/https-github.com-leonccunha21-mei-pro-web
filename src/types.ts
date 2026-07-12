export interface Product {
  id: string;
  code: string; // SKU / Código
  name: string;
  category: string;
  costPrice: number; // Valor Pago / Custo
  salePrice: number; // Valor de Venda
  stock: number; // Quantidade em Estoque
  minStock: number; // Estoque Mínimo para Alerta
  description?: string;
  createdAt: string;
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
  total: number; // Valor Total Vendido
  totalCost: number; // Valor Total Pago (Custo)
  profit: number; // Lucro (Total - TotalCost)
  status: 'completed' | 'cancelled';
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
}

export type ActiveTab = 'dashboard' | 'products' | 'pos' | 'sales' | 'reports';
