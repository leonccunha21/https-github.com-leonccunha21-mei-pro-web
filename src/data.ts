import { Product, Sale, Category } from './types';

export const initialCategories: Category[] = [
  { id: '1', name: 'Eletrônicos' },
  { id: '2', name: 'Vestuário' },
  { id: '3', name: 'Acessórios' },
  { id: '4', name: 'Calçados' },
  { id: '5', name: 'Casa e Lar' },
];

// Helper to subtract days from current date
const getPastDateString = (daysAgo: number, hour = 14, minute = 30): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const initialProducts: Product[] = [
  {
    id: 'p1',
    code: 'ELE-SW01',
    name: 'Smartwatch Sport Ultra',
    category: 'Eletrônicos',
    costPrice: 180.00,
    salePrice: 399.90,
    stock: 14,
    minStock: 5,
    description: 'Relógio inteligente resistente à água com monitor cardíaco e GPS integrado.',
    createdAt: getPastDateString(30),
  },
  {
    id: 'p2',
    code: 'ELE-PH02',
    name: 'Fone de Ouvido Noise Cancelling',
    category: 'Eletrônicos',
    costPrice: 120.00,
    salePrice: 289.00,
    stock: 8,
    minStock: 4,
    description: 'Fone sem fio Bluetooth com cancelamento ativo de ruído ambiente e bateria de 40h.',
    createdAt: getPastDateString(25),
  },
  {
    id: 'p3',
    code: 'VES-TS01',
    name: 'Camiseta Algodão Egípcio',
    category: 'Vestuário',
    costPrice: 25.00,
    salePrice: 69.90,
    stock: 35,
    minStock: 10,
    description: 'Camiseta básica premium em tecido de algodão egípcio super macio e durável.',
    createdAt: getPastDateString(20),
  },
  {
    id: 'p4',
    code: 'CAL-TR01',
    name: 'Tênis Running Performance',
    category: 'Calçados',
    costPrice: 160.00,
    salePrice: 389.90,
    stock: 3, // Low stock (minStock is 5)
    minStock: 5,
    description: 'Tênis de corrida de alta performance com amortecimento responsivo e tecido respirável.',
    createdAt: getPastDateString(15),
  },
  {
    id: 'p5',
    code: 'ACE-MC01',
    name: 'Mochila Tech Impermeável',
    category: 'Acessórios',
    costPrice: 70.00,
    salePrice: 159.90,
    stock: 11,
    minStock: 3,
    description: 'Mochila com compartimento para notebook de até 16 polegadas, resistente à água e com entrada USB externa.',
    createdAt: getPastDateString(12),
  },
  {
    id: 'p6',
    code: 'CAS-CN01',
    name: 'Caneca Cerâmica Artesanal',
    category: 'Casa e Lar',
    costPrice: 12.00,
    salePrice: 35.00,
    stock: 2, // Low stock (minStock is 4)
    minStock: 4,
    description: 'Caneca feita à mão em cerâmica fosca com design minimalista nórdico de 350ml.',
    createdAt: getPastDateString(10),
  },
  {
    id: 'p7',
    code: 'VES-JK02',
    name: 'Jaqueta Corta Vento Sport',
    category: 'Vestuário',
    costPrice: 55.00,
    salePrice: 129.90,
    stock: 15,
    minStock: 4,
    description: 'Jaqueta ultra leve, corta-vento com proteção UV50+ e repelente à água.',
    createdAt: getPastDateString(8),
  },
];

export const initialSales: Sale[] = [
  // 6 Days ago
  {
    id: 's1',
    date: getPastDateString(6, 10, 15),
    items: [
      {
        productId: 'p1',
        productName: 'Smartwatch Sport Ultra',
        quantity: 1,
        costPrice: 180.00,
        salePrice: 399.90,
        total: 399.90,
      },
      {
        productId: 'p3',
        productName: 'Camiseta Algodão Egípcio',
        quantity: 2,
        costPrice: 25.00,
        salePrice: 69.90,
        total: 139.80,
      }
    ],
    clientName: 'Carlos Eduardo Oliveira',
    clientPhone: '11 98888-7777',
    paymentMethod: 'pix',
    total: 539.70,
    totalCost: 230.00,
    profit: 309.70,
    status: 'completed',
    notes: 'Cliente fiel, oferecido desconto de cortesia nas próximas compras.',
  },
  // 5 Days ago
  {
    id: 's2',
    date: getPastDateString(5, 15, 45),
    items: [
      {
        productId: 'p2',
        productName: 'Fone de Ouvido Noise Cancelling',
        quantity: 1,
        costPrice: 120.00,
        salePrice: 289.00,
        total: 289.00,
      }
    ],
    clientName: 'Ana Maria Souza',
    clientPhone: '21 97777-6666',
    paymentMethod: 'card_credit',
    total: 289.00,
    totalCost: 120.00,
    profit: 169.00,
    status: 'completed',
  },
  // 4 Days ago
  {
    id: 's3',
    date: getPastDateString(4, 11, 20),
    items: [
      {
        productId: 'p4',
        productName: 'Tênis Running Performance',
        quantity: 1,
        costPrice: 160.00,
        salePrice: 389.90,
        total: 389.90,
      },
      {
        productId: 'p5',
        productName: 'Mochila Tech Impermeável',
        quantity: 1,
        costPrice: 70.00,
        salePrice: 159.90,
        total: 159.90,
      }
    ],
    clientName: 'Rodrigo Santos',
    clientPhone: '31 96666-5555',
    paymentMethod: 'pix',
    total: 549.80,
    totalCost: 230.00,
    profit: 319.80,
    status: 'completed',
  },
  // 3 Days ago
  {
    id: 's4',
    date: getPastDateString(3, 16, 10),
    items: [
      {
        productId: 'p6',
        productName: 'Caneca Cerâmica Artesanal',
        quantity: 4,
        costPrice: 12.00,
        salePrice: 35.00,
        total: 140.00,
      }
    ],
    clientName: 'Beatriz Costa',
    clientPhone: '19 95555-4444',
    paymentMethod: 'money',
    total: 140.00,
    totalCost: 48.00,
    profit: 92.00,
    status: 'completed',
    notes: 'Compra de conjunto de canecas para escritório.',
  },
  // 2 Days ago
  {
    id: 's5',
    date: getPastDateString(2, 12, 30),
    items: [
      {
        productId: 'p3',
        productName: 'Camiseta Algodão Egípcio',
        quantity: 3,
        costPrice: 25.00,
        salePrice: 69.90,
        total: 209.70,
      },
      {
        productId: 'p7',
        productName: 'Jaqueta Corta Vento Sport',
        quantity: 1,
        costPrice: 55.00,
        salePrice: 129.90,
        total: 129.90,
      }
    ],
    clientName: 'Felipe Melo',
    paymentMethod: 'card_debit',
    total: 339.60,
    totalCost: 130.00,
    profit: 209.60,
    status: 'completed',
  },
  // 1 Day ago
  {
    id: 's6',
    date: getPastDateString(1, 17, 0),
    items: [
      {
        productId: 'p1',
        productName: 'Smartwatch Sport Ultra',
        quantity: 1,
        costPrice: 180.00,
        salePrice: 399.90,
        total: 399.90,
      }
    ],
    clientName: 'Juliana Paes',
    clientPhone: '11 94444-3333',
    paymentMethod: 'pix',
    total: 399.90,
    totalCost: 180.00,
    profit: 219.90,
    status: 'completed',
  },
  // Today
  {
    id: 's7',
    date: getPastDateString(0, 10, 45),
    items: [
      {
        productId: 'p5',
        productName: 'Mochila Tech Impermeável',
        quantity: 1,
        costPrice: 70.00,
        salePrice: 159.90,
        total: 159.90,
      },
      {
        productId: 'p3',
        productName: 'Camiseta Algodão Egípcio',
        quantity: 1,
        costPrice: 25.00,
        salePrice: 69.90,
        total: 69.90,
      }
    ],
    clientName: 'Gabriel Nogueira',
    paymentMethod: 'pix',
    total: 229.80,
    totalCost: 95.00,
    profit: 134.80,
    status: 'completed',
  },
  // Cancelled Sale Example
  {
    id: 's8',
    date: getPastDateString(3, 14, 0),
    items: [
      {
        productId: 'p2',
        productName: 'Fone de Ouvido Noise Cancelling',
        quantity: 1,
        costPrice: 120.00,
        salePrice: 289.00,
        total: 289.00,
      }
    ],
    clientName: 'Marcelo Vieira',
    paymentMethod: 'card_credit',
    total: 289.00,
    totalCost: 120.00,
    profit: 169.00,
    status: 'cancelled',
    notes: 'Cancelamento solicitado pelo cliente antes do envio.',
  },
];
