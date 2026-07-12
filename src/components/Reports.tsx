import React, { useRef, useState, useEffect } from 'react';
import { Product, Sale, Category, SaleItem } from '../types';
import * as XLSX from 'xlsx';
import { 
  Download, 
  Upload, 
  TrendingUp, 
  DollarSign, 
  RefreshCcw, 
  ShieldAlert, 
  HelpCircle,
  FileSpreadsheet,
  CheckCircle,
  PieChart,
  Cloud,
  ExternalLink,
  FolderOpen,
  CloudLightning,
  Loader2,
  ShoppingBag
} from 'lucide-react';
import { 
  createSpreadsheet, 
  uploadBackupFile, 
  listUserSpreadsheets, 
  fetchSpreadsheetValues,
  exportSpreadsheetAsArrayBuffer,
  GoogleDriveFile
} from '../lib/googleApi';

// Shared spreadsheet parsing function for local files and Google Sheets
function parseProductsSheet(rows: any[][]): { importedProducts: Product[]; categoriesFromProducts: string[] } {
  if (!rows || rows.length < 2) {
    throw new Error('A planilha de produtos está vazia ou não possui cabeçalho.');
  }

  // Find the best header row dynamically (most keyword matches)
  let headerRowIndex = 0;
  let maxMatches = -1;
  const allKeywords = [
    'nome', 'produto', 'descrição', 'descricao', 'item', 'name', 'titulo', 'título',
    'código', 'codigo', 'sku', 'ref', 'id', 'referência', 'referencia', 'cod',
    'categoria', 'grupo', 'setor', 'tipo', 'category',
    'custo', 'compra', 'cost',
    'venda', 'preço', 'preco', 'price', 'valor',
    'estoque', 'qtd', 'quantidade', 'stock', 'saldo'
  ];

  for (let r = 0; r < Math.min(rows.length, 15); r++) {
    const row = rows[r];
    if (!row) continue;
    let matches = 0;
    for (const cell of row) {
      const val = String(cell || '').trim().toLowerCase();
      if (val && allKeywords.some(kw => val.includes(kw))) {
        matches++;
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      headerRowIndex = r;
    }
  }

  const headerRow = rows[headerRowIndex].map((h: any) => String(h || '').trim().toLowerCase());
  
  const findColIndex = (keywords: string[]) => {
    return headerRow.findIndex(h => keywords.some(keyword => h.includes(keyword)));
  };

  let codeIdx = findColIndex(['código', 'codigo', 'sku', 'ref', 'id', 'referência', 'referencia', 'cod']);
  let nameIdx = findColIndex(['nome', 'produto', 'descrição', 'descricao', 'item', 'name', 'titulo', 'título', 'artigo']);
  let categoryIdx = findColIndex(['categoria', 'grupo', 'setor', 'tipo', 'category', 'família', 'familia', 'departamento']);
  let costPriceIdx = findColIndex(['custo', 'preço custo', 'preco custo', 'compra', 'cost', 'vlr custo', 'valor custo']);
  let salePriceIdx = findColIndex(['venda', 'preço venda', 'preco venda', 'valor', 'price', 'preço', 'preco', 'vlr venda', 'valor venda']);
  let stockIdx = findColIndex(['estoque', 'qtd', 'quantidade', 'stock', 'saldo', 'atual', 'quant', 'qnt']);
  let minStockIdx = findColIndex(['mínimo', 'minimo', 'estoque mínimo', 'estoque minimo', 'min', 'est. min', 'est.min']);

  // Fallbacks if no columns matched
  if (codeIdx === -1) codeIdx = 0;
  if (nameIdx === -1) {
    nameIdx = headerRow.findIndex((h, idx) => idx !== codeIdx && h !== '');
    if (nameIdx === -1) nameIdx = 1;
  }
  if (categoryIdx === -1) categoryIdx = 2;
  if (costPriceIdx === -1) costPriceIdx = 3;
  if (salePriceIdx === -1) salePriceIdx = 4;
  if (stockIdx === -1) stockIdx = 5;
  if (minStockIdx === -1) minStockIdx = 6;

  const importedProducts: Product[] = [];
  const categoriesFromProducts: string[] = [];

  const getFloatVal = (row: any[], idx: number) => {
    if (idx === -1 || idx >= row.length || row[idx] === undefined || row[idx] === null) return 0;
    if (typeof row[idx] === 'number') return row[idx];
    const raw = String(row[idx]).trim();
    if (!raw) return 0;

    if (!isNaN(Number(raw))) return Number(raw);

    let clean = raw.replace(/[R$\s]/g, '');
    if (clean.includes('.') && clean.includes(',')) {
      if (clean.indexOf('.') < clean.indexOf(',')) {
        clean = clean.replace(/\./g, '').replace(',', '.');
      } else {
        clean = clean.replace(/,/g, '');
      }
    } else if (clean.includes(',')) {
      clean = clean.replace(/,/g, '.');
    } else if (clean.includes('.')) {
      const parts = clean.split('.');
      if (parts.length === 2 && parts[1].length === 3) {
        clean = clean.replace(/\./g, '');
      } else if (parts.length > 2) {
        clean = clean.replace(/\./g, '');
      }
    }
    clean = clean.replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
  };

  const getIntVal = (row: any[], idx: number) => {
    if (idx === -1 || idx >= row.length || row[idx] === undefined || row[idx] === null) return 0;
    if (typeof row[idx] === 'number') return Math.round(row[idx]);
    const raw = String(row[idx]).trim();
    if (!raw) return 0;
    const clean = raw.replace(/[^0-9]/g, '');
    return parseInt(clean, 10) || 0;
  };

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    
    // Skip mostly empty rows
    const nonEmulatorCells = row.filter(cell => cell !== undefined && String(cell).trim() !== '');
    if (nonEmulatorCells.length === 0) continue;

    let name = '';
    if (nameIdx !== -1 && nameIdx < row.length && row[nameIdx] !== undefined) {
      name = String(row[nameIdx]).trim();
    }

    if (!name) {
      // Look for any text column if detected name column is blank
      for (let col = 0; col < row.length; col++) {
        if (col !== codeIdx && row[col] !== undefined && String(row[col]).trim() !== '' && isNaN(Number(row[col]))) {
          name = String(row[col]).trim();
          break;
        }
      }
    }

    if (!name) continue; // skip nameless rows

    let code = '';
    if (codeIdx !== -1 && codeIdx < row.length && row[codeIdx] !== undefined) {
      code = String(row[codeIdx]).trim();
    }
    if (!code) {
      code = `SKU-${1000 + i}`;
    }

    let categoryName = 'Geral';
    if (categoryIdx !== -1 && categoryIdx < row.length && row[categoryIdx] !== undefined) {
      const rawCat = String(row[categoryIdx]).trim();
      if (rawCat) categoryName = rawCat;
    }

    if (categoryName && !categoriesFromProducts.some(c => c.toLowerCase() === categoryName.toLowerCase())) {
      categoriesFromProducts.push(categoryName);
    }

    const costPrice = Math.max(0, getFloatVal(row, costPriceIdx));
    const salePrice = Math.max(0, getFloatVal(row, salePriceIdx));
    const stock = Math.max(0, getIntVal(row, stockIdx));
    const minStock = Math.max(0, getIntVal(row, minStockIdx));

    importedProducts.push({
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${i}`,
      code,
      name,
      category: categoryName,
      costPrice,
      salePrice,
      stock,
      minStock,
      createdAt: new Date().toISOString()
    });
  }

  return { importedProducts, categoriesFromProducts };
}

function parseCategoriesSheet(rows: any[][]): string[] {
  let headerRowIndex = 0;
  for (let r = 0; r < Math.min(rows.length, 10); r++) {
    const row = rows[r];
    if (!row) continue;
    if (row.some(cell => String(cell || '').toLowerCase().includes('categoria'))) {
      headerRowIndex = r;
      break;
    }
  }

  const categories: string[] = [];
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    const catName = String(row[0] || '').trim();
    if (catName && !categories.some(c => c.toLowerCase() === catName.toLowerCase())) {
      categories.push(catName);
    }
  }
  return categories;
}

function parseSalesSheet(rows: any[][], productsList: Product[]): Sale[] {
  let headerRowIndex = 0;
  let maxMatches = -1;
  const keywords = ['id da venda', 'venda', 'cliente', 'pagamento', 'itens', 'faturamento', 'total', 'status'];

  for (let r = 0; r < Math.min(rows.length, 15); r++) {
    const row = rows[r];
    if (!row) continue;
    let matches = 0;
    for (const cell of row) {
      const val = String(cell || '').trim().toLowerCase();
      if (val && keywords.some(kw => val.includes(kw))) {
        matches++;
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      headerRowIndex = r;
    }
  }

  const headerRow = rows[headerRowIndex].map((h: any) => String(h || '').trim().toLowerCase());
  
  const findColIndex = (kwList: string[]) => {
    return headerRow.findIndex(h => kwList.some(kw => h.includes(kw)));
  };

  const idIdx = findColIndex(['id', 'código', 'codigo', 'venda']);
  const dateIdx = findColIndex(['data', 'data/hora', 'date']);
  const clientIdx = findColIndex(['cliente', 'nome', 'client']);
  const phoneIdx = findColIndex(['telefone', 'celular', 'fone', 'phone']);
  const paymentIdx = findColIndex(['pagamento', 'forma', 'meio', 'method']);
  const itemsIdx = findColIndex(['itens', 'produtos', 'item', 'descrição', 'descricao']);
  const costIdx = findColIndex(['custo', 'custo total', 'total cost']);
  const revenueIdx = findColIndex(['faturamento', 'valor', 'total', 'venda total', 'revenue']);
  const statusIdx = findColIndex(['status', 'situação', 'situacao']);

  const getFloatVal = (row: any[], idx: number) => {
    if (idx === -1 || idx >= row.length || row[idx] === undefined || row[idx] === null) return 0;
    if (typeof row[idx] === 'number') return row[idx];
    const raw = String(row[idx]).trim();
    if (!raw) return 0;

    if (!isNaN(Number(raw))) return Number(raw);

    let clean = raw.replace(/[R$\s]/g, '');
    if (clean.includes('.') && clean.includes(',')) {
      if (clean.indexOf('.') < clean.indexOf(',')) {
        clean = clean.replace(/\./g, '').replace(',', '.');
      } else {
        clean = clean.replace(/,/g, '');
      }
    } else if (clean.includes(',')) {
      clean = clean.replace(/,/g, '.');
    } else if (clean.includes('.')) {
      const parts = clean.split('.');
      if (parts.length === 2 && parts[1].length === 3) {
        clean = clean.replace(/\./g, '');
      } else if (parts.length > 2) {
        clean = clean.replace(/\./g, '');
      }
    }
    clean = clean.replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
  };

  const sales: Sale[] = [];

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    if (row.every(c => c === null || c === undefined || String(c).trim() === '')) continue;

    const id = (idIdx !== -1 && idIdx < row.length && row[idIdx]) ? String(row[idIdx]).trim() : `venda_${Date.now()}_${i}`;
    
    let rawDate = (dateIdx !== -1 && dateIdx < row.length && row[dateIdx]) ? String(row[dateIdx]).trim() : '';
    let saleDate = new Date().toISOString();
    if (rawDate) {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        saleDate = d.toISOString();
      } else {
        const match = rawDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (match) {
          const day = parseInt(match[1], 10);
          const month = parseInt(match[2], 10) - 1;
          const year = parseInt(match[3], 10);
          const parsed = new Date(year, month, day, 12, 0, 0);
          if (!isNaN(parsed.getTime())) {
            saleDate = parsed.toISOString();
          }
        }
      }
    }

    const clientName = (clientIdx !== -1 && clientIdx < row.length && row[clientIdx]) ? String(row[clientIdx]).trim() : undefined;
    const clientPhone = (phoneIdx !== -1 && phoneIdx < row.length && row[phoneIdx]) ? String(row[phoneIdx]).trim() : undefined;
    
    let paymentMethod: any = 'pix';
    if (paymentIdx !== -1 && paymentIdx < row.length && row[paymentIdx]) {
      const pLower = String(row[paymentIdx]).trim().toLowerCase();
      if (pLower.includes('dinheiro') || pLower.includes('money')) paymentMethod = 'money';
      else if (pLower.includes('crédito') || pLower.includes('credito') || pLower.includes('credit')) paymentMethod = 'card_credit';
      else if (pLower.includes('débito') || pLower.includes('debito') || pLower.includes('debit')) paymentMethod = 'card_debit';
      else if (pLower.includes('transf') || pLower.includes('banc')) paymentMethod = 'transfer';
    }

    const itemsStr = (itemsIdx !== -1 && itemsIdx < row.length && row[itemsIdx]) ? String(row[itemsIdx]).trim() : '';
    const saleItems: SaleItem[] = [];

    if (itemsStr) {
      const parts = itemsStr.split(',');
      for (const p of parts) {
        const itemStr = p.trim();
        if (!itemStr) continue;

        const match = itemStr.match(/(.+?)\s*\((\d+)\s*x?\)/i) || itemStr.match(/(.+?)\s*x\s*(\d+)/i) || itemStr.match(/(\d+)\s*x\s*(.+)/i);
        let pName = itemStr;
        let qty = 1;

        if (match) {
          if (isNaN(Number(match[1]))) {
            pName = match[1].trim();
            qty = parseInt(match[2], 10) || 1;
          } else {
            qty = parseInt(match[1], 10) || 1;
            pName = match[2].trim();
          }
        }

        const pNameLower = pName.toLowerCase().trim();
        let matchedProd = productsList.find(pr => 
          pr.name.toLowerCase().trim() === pNameLower || 
          pr.code.toLowerCase().trim() === pNameLower
        );

        if (!matchedProd) {
          // Soft match fallback
          matchedProd = productsList.find(pr => 
            pr.name.toLowerCase().includes(pNameLower) || 
            pNameLower.includes(pr.name.toLowerCase())
          );
        }

        const costPrice = matchedProd ? matchedProd.costPrice : 0;
        const salePrice = matchedProd ? matchedProd.salePrice : 0;
        const finalProdName = matchedProd ? matchedProd.name : pName;

        saleItems.push({
          productId: matchedProd ? matchedProd.id : `p_temp_${Math.random().toString(36).substring(2,6)}`,
          productName: finalProdName,
          quantity: qty,
          costPrice,
          salePrice,
          total: salePrice * qty
        });
      }
    }

    const totalCost = getFloatVal(row, costIdx) || saleItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
    const total = getFloatVal(row, revenueIdx) || saleItems.reduce((sum, item) => sum + item.total, 0);
    const profit = total - totalCost;

    let status: 'completed' | 'cancelled' = 'completed';
    if (statusIdx !== -1 && statusIdx < row.length && row[statusIdx]) {
      const sLower = String(row[statusIdx]).trim().toLowerCase();
      if (sLower.includes('canc') || sLower.includes('estor')) {
        status = 'cancelled';
      }
    }

    sales.push({
      id,
      date: saleDate,
      clientName,
      clientPhone,
      paymentMethod,
      items: saleItems,
      totalCost,
      total,
      profit,
      status
    });
  }

  return sales;
}

function parseSpreadsheetRows(rows: any[][], categoriesList: Category[]): { importedProducts: Product[]; newCategories: Category[] } {
  const { importedProducts, categoriesFromProducts } = parseProductsSheet(rows);
  const newCategories = [...categoriesList];
  
  categoriesFromProducts.forEach(catName => {
    if (!newCategories.some(c => c.name.toLowerCase() === catName.toLowerCase())) {
      newCategories.push({
        id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: catName
      });
    }
  });

  return { importedProducts, newCategories };
}

interface ReportsProps {
  products: Product[];
  sales: Sale[];
  categories: Category[];
  user: any;
  accessToken: string | null;
  onGoogleLogin: () => Promise<void>;
  onGoogleLogout: () => Promise<void>;
  onImportDatabase: (data: { products: Product[]; sales: Sale[]; categories: Category[] }) => void;
  onResetDatabase: () => void;
}

export default function Reports({ 
  products, 
  sales, 
  categories, 
  user,
  accessToken,
  onGoogleLogin,
  onGoogleLogout,
  onImportDatabase,
  onResetDatabase 
}: ReportsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  
  // Basic states
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importingExcel, setImportingExcel] = useState(false);

  // Google APIs states
  const [exportingProducts, setExportingProducts] = useState(false);
  const [exportingSales, setExportingSales] = useState(false);
  const [uploadingBackup, setUploadingBackup] = useState(false);
  const [loadingSpreadsheets, setLoadingSpreadsheets] = useState(false);
  const [importingFromSheet, setImportingFromSheet] = useState(false);
  
  const [spreadsheets, setSpreadsheets] = useState<GoogleDriveFile[]>([]);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string>('');
  
  const [lastExportedSheetUrl, setLastExportedSheetUrl] = useState<string | null>(null);
  const [lastBackupUrl, setLastBackupUrl] = useState<string | null>(null);
  const [googleSuccessMsg, setGoogleSuccessMsg] = useState<string | null>(null);

  const [isInIframe, setIsInIframe] = useState(false);
  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      setIsInIframe(true);
    }
  }, []);

  // Filter completed sales
  const completedSales = sales.filter(s => s.status === 'completed');

  // Metrics
  const totalFaturamento = completedSales.reduce((acc, s) => acc + s.total, 0);
  const totalCustoVendas = completedSales.reduce((acc, s) => acc + s.totalCost, 0);
  const lucroReal = totalFaturamento - totalCustoVendas;
  
  // Return on Investment (ROI)
  const roi = totalCustoVendas > 0 ? (lucroReal / totalCustoVendas) * 100 : 0;
  const averageTicket = completedSales.length > 0 ? (totalFaturamento / completedSales.length) : 0;

  // Category Sales Volume & Profit map
  const categoryStats: Record<string, { revenue: number; cost: number; profit: number; itemsSold: number }> = {};
  
  // Pre-populate categories
  categories.forEach(cat => {
    categoryStats[cat.name] = { revenue: 0, cost: 0, profit: 0, itemsSold: 0 };
  });
  // Default fallback category for missing associations
  categoryStats['Outros'] = { revenue: 0, cost: 0, profit: 0, itemsSold: 0 };

  completedSales.forEach(sale => {
    const subtotal = sale.items.reduce((acc, item) => acc + item.total, 0);
    const discountRatio = subtotal > 0 ? (sale.total / subtotal) : 1;

    sale.items.forEach(item => {
      // Find category of original product
      const origProduct = products.find(p => p.id === item.productId);
      const catName = origProduct ? origProduct.category : 'Outros';

      if (!categoryStats[catName]) {
        categoryStats[catName] = { revenue: 0, cost: 0, profit: 0, itemsSold: 0 };
      }

      const effectiveTotal = item.total * discountRatio;
      const effectiveProfit = effectiveTotal - (item.costPrice * item.quantity);

      categoryStats[catName].itemsSold += item.quantity;
      categoryStats[catName].revenue += effectiveTotal;
      categoryStats[catName].cost += item.costPrice * item.quantity;
      categoryStats[catName].profit += effectiveProfit;
    });
  });

  // Convert to array and filter out inactive ones
  const activeCategoryReports = Object.entries(categoryStats)
    .map(([categoryName, stats]) => ({
      categoryName,
      ...stats
    }))
    .filter(c => c.revenue > 0 || c.itemsSold > 0)
    .sort((a, b) => b.revenue - a.revenue);

  const maxCategoryRevenue = Math.max(...activeCategoryReports.map(c => c.revenue), 100);

  // Product Sales Volume & Profit map
  const productStats: Record<string, { productName: string; category: string; revenue: number; cost: number; profit: number; itemsSold: number }> = {};

  completedSales.forEach(sale => {
    const subtotal = sale.items.reduce((acc, item) => acc + item.total, 0);
    const discountRatio = subtotal > 0 ? (sale.total / subtotal) : 1;

    sale.items.forEach(item => {
      const origProduct = products.find(p => p.id === item.productId);
      const catName = origProduct ? origProduct.category : 'Outros';
      const key = item.productId || item.productName;

      if (!productStats[key]) {
        productStats[key] = {
          productName: item.productName,
          category: catName,
          revenue: 0,
          cost: 0,
          profit: 0,
          itemsSold: 0
        };
      }

      const effectiveTotal = item.total * discountRatio;
      const effectiveProfit = effectiveTotal - (item.costPrice * item.quantity);

      productStats[key].itemsSold += item.quantity;
      productStats[key].revenue += effectiveTotal;
      productStats[key].cost += item.costPrice * item.quantity;
      productStats[key].profit += effectiveProfit;
    });
  });

  const activeProductReports = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue);

  // Load user's Google Drive Spreadsheets list when accessToken is available
  useEffect(() => {
    const fetchSpreadsheets = async () => {
      if (!accessToken) return;
      setLoadingSpreadsheets(true);
      try {
        const files = await listUserSpreadsheets(accessToken);
        setSpreadsheets(files);
        if (files.length > 0) {
          setSelectedSpreadsheetId(files[0].id);
        }
      } catch (err) {
        console.error('Erro ao buscar planilhas do Google Drive:', err);
      } finally {
        setLoadingSpreadsheets(false);
      }
    };

    fetchSpreadsheets();
  }, [accessToken]);

  // Export Stock to Google Sheets
  const handleExportStockToSheets = async () => {
    if (!accessToken) return;
    setExportingProducts(true);
    setGoogleSuccessMsg(null);
    try {
      const headers = ['Código/SKU', 'Nome do Produto', 'Categoria', 'Preço de Custo (R$)', 'Preço de Venda (R$)', 'Estoque', 'Estoque Mínimo'];
      const rows = products.map(p => [
        p.code,
        p.name,
        p.category,
        p.costPrice,
        p.salePrice,
        p.stock,
        p.minStock
      ]);

      const result = await createSpreadsheet(
        accessToken,
        `GESTÃO.PRO - Inventário de Estoque (${new Date().toLocaleDateString('pt-BR')})`,
        headers,
        rows
      );

      setLastExportedSheetUrl(result.webViewLink);
      setGoogleSuccessMsg('Estoque exportado com sucesso para o Google Sheets!');
    } catch (err: any) {
      setImportError(err.message || 'Falha ao exportar estoque.');
    } finally {
      setExportingProducts(false);
    }
  };

  // Export Sales History to Google Sheets
  const handleExportSalesToSheets = async () => {
    if (!accessToken) return;
    setExportingSales(true);
    setGoogleSuccessMsg(null);
    try {
      const headers = [
        'ID da Venda', 
        'Data', 
        'Cliente', 
        'Telefone', 
        'Forma de Pagamento', 
        'Produtos Vendidos', 
        'Custo Total (R$)', 
        'Faturamento (R$)', 
        'Lucro Líquido (R$)', 
        'Status'
      ];
      const rows = sales.map(s => [
        s.id,
        new Date(s.date).toLocaleString('pt-BR'),
        s.clientName || 'Cliente Geral',
        s.clientPhone || '-',
        s.paymentMethod,
        s.items.map(item => `${item.productName} (${item.quantity}x)`).join(', '),
        s.totalCost,
        s.total,
        s.profit,
        s.status === 'completed' ? 'Concluída' : 'Cancelada'
      ]);

      const result = await createSpreadsheet(
        accessToken,
        `GESTÃO.PRO - Relatório de Vendas (${new Date().toLocaleDateString('pt-BR')})`,
        headers,
        rows
      );

      setLastExportedSheetUrl(result.webViewLink);
      setGoogleSuccessMsg('Histórico de vendas exportado com sucesso para o Google Sheets!');
    } catch (err: any) {
      setImportError(err.message || 'Falha ao exportar vendas.');
    } finally {
      setExportingSales(false);
    }
  };

  // Upload JSON backup to Google Drive
  const handleBackupToDrive = async () => {
    if (!accessToken) return;
    setUploadingBackup(true);
    setGoogleSuccessMsg(null);
    try {
      const backupData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        categories,
        products,
        sales
      };
      const filename = `Backup_GestaoPro_${new Date().toISOString().substring(0, 10)}_${Math.random().toString(36).substring(2,6)}.json`;
      
      const result = await uploadBackupFile(accessToken, filename, backupData);
      setLastBackupUrl(result.webViewLink);
      setGoogleSuccessMsg(`Backup '${filename}' salvo com sucesso no seu Google Drive!`);
    } catch (err: any) {
      setImportError(err.message || 'Falha ao enviar backup para o Google Drive.');
    } finally {
      setUploadingBackup(false);
    }
  };

  // Import products, sales, and categories from select Google Spreadsheet
  const handleImportFromSheets = async () => {
    if (!accessToken || !selectedSpreadsheetId) return;
    setImportingFromSheet(true);
    setImportError(null);
    setGoogleSuccessMsg(null);
    try {
      // Export spreadsheet from Google Drive as raw XLSX array buffer
      const arrayBuffer = await exportSpreadsheetAsArrayBuffer(accessToken, selectedSpreadsheetId);
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      let importedProducts: Product[] = [];
      let importedCategories: Category[] = [...categories];
      let importedSales: Sale[] = [...sales];
      
      let hasProductsSheet = false;
      let hasSalesSheet = false;
      let hasCategoriesSheet = false;

      let productsSheetData: any[][] | null = null;
      let salesSheetData: any[][] | null = null;
      let categoriesSheetData: any[][] | null = null;

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (!jsonRows || jsonRows.length < 2) continue;

        // Identify sheet type based on sheetName or first row headers
        const nameLower = sheetName.toLowerCase();
        const firstRow = jsonRows[0].map(h => String(h || '').trim().toLowerCase());
        
        const isProducts = nameLower.includes('prod') || nameLower.includes('estoq') || firstRow.includes('nome do produto') || firstRow.includes('preço de venda');
        const isSales = nameLower.includes('vend') || nameLower.includes('saída') || firstRow.includes('id da venda') || firstRow.includes('itens vendidos') || firstRow.includes('produtos vendidos');
        const isCategories = nameLower.includes('cat') || nameLower.includes('setor') || firstRow.includes('nome da categoria');

        if (isProducts && !productsSheetData) {
          productsSheetData = jsonRows;
          hasProductsSheet = true;
        } else if (isSales && !salesSheetData) {
          salesSheetData = jsonRows;
          hasSalesSheet = true;
        } else if (isCategories && !categoriesSheetData) {
          categoriesSheetData = jsonRows;
          hasCategoriesSheet = true;
        }
      }

      // Fallback: If no products sheet was detected, treat the first sheet as products!
      if (!hasProductsSheet && workbook.SheetNames.length > 0) {
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (jsonRows && jsonRows.length >= 2) {
          productsSheetData = jsonRows;
          hasProductsSheet = true;
        }
      }

      // Parse categories sheet first
      if (categoriesSheetData) {
        const parsedCats = parseCategoriesSheet(categoriesSheetData);
        parsedCats.forEach(cName => {
          if (!importedCategories.some(c => c.name.toLowerCase() === cName.toLowerCase())) {
            importedCategories.push({
              id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              name: cName
            });
          }
        });
      }

      // Parse products sheet second
      if (productsSheetData) {
        const parsed = parseProductsSheet(productsSheetData);
        importedProducts = parsed.importedProducts;
        parsed.categoriesFromProducts.forEach(cName => {
          if (!importedCategories.some(c => c.name.toLowerCase() === cName.toLowerCase())) {
            importedCategories.push({
              id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              name: cName
            });
          }
        });
      }

      // Parse sales sheet third
      if (salesSheetData) {
        importedSales = parseSalesSheet(salesSheetData, importedProducts.length > 0 ? importedProducts : products);
      }

      // Apply changes
      onImportDatabase({
        products: importedProducts.length > 0 ? importedProducts : products,
        categories: importedCategories,
        sales: importedSales
      });

      let successMsg = 'Planilha do Google Drive importada com sucesso! ';
      if (importedProducts.length > 0) successMsg += `${importedProducts.length} produtos carregados. `;
      if (hasSalesSheet) successMsg += `${importedSales.length} vendas cadastradas. `;

      setGoogleSuccessMsg(successMsg);
      setImportError(null);
    } catch (err: any) {
      setImportError(err.message || 'Erro ao processar dados da planilha do Google Drive.');
    } finally {
      setImportingFromSheet(false);
    }
  };

  // Local Backup Export Utility
  const handleExportDatabase = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      categories,
      products,
      sales
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Backup_GestaoLoja_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Local Backup Import Utility
  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.products && parsed.sales && parsed.categories) {
          onImportDatabase({
            products: parsed.products,
            sales: parsed.sales,
            categories: parsed.categories
          });
          setImportSuccessMsg('Backup offline em formato JSON restaurado com sucesso!');
          setImportError(null);
          setTimeout(() => setImportSuccessMsg(null), 6000);
        } else {
          setImportError('Estrutura de arquivo inválida. O backup precisa conter categorias, produtos e histórico de vendas.');
        }
      } catch (err) {
        setImportError('Erro ao processar arquivo JSON. Verifique se o arquivo está corrompido.');
      }
    };
    reader.readAsText(file);
  };

  // Local Excel / CSV File Import Parser
  const handleImportExcelOrCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setImportingExcel(true);
    setImportError(null);
    setGoogleSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (!data) throw new Error('Não foi possível ler os dados do arquivo.');

        const workbook = XLSX.read(data, { type: 'array' });
        
        let importedProducts: Product[] = [];
        let importedCategories: Category[] = [...categories];
        let importedSales: Sale[] = [...sales];
        
        let hasProductsSheet = false;
        let hasSalesSheet = false;
        let hasCategoriesSheet = false;

        let productsSheetData: any[][] | null = null;
        let salesSheetData: any[][] | null = null;
        let categoriesSheetData: any[][] | null = null;

        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          const jsonRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (!jsonRows || jsonRows.length < 2) continue;

          // Identify sheet type based on sheetName or first row headers
          const nameLower = sheetName.toLowerCase();
          const firstRow = jsonRows[0].map(h => String(h || '').trim().toLowerCase());
          
          const isProducts = nameLower.includes('prod') || nameLower.includes('estoq') || firstRow.includes('nome do produto') || firstRow.includes('preço de venda');
          const isSales = nameLower.includes('vend') || nameLower.includes('saída') || firstRow.includes('id da venda') || firstRow.includes('itens vendidos') || firstRow.includes('produtos vendidos');
          const isCategories = nameLower.includes('cat') || nameLower.includes('setor') || firstRow.includes('nome da categoria');

          if (isProducts && !productsSheetData) {
            productsSheetData = jsonRows;
            hasProductsSheet = true;
          } else if (isSales && !salesSheetData) {
            salesSheetData = jsonRows;
            hasSalesSheet = true;
          } else if (isCategories && !categoriesSheetData) {
            categoriesSheetData = jsonRows;
            hasCategoriesSheet = true;
          }
        }

        // Fallback: If no products sheet was detected, treat the first sheet as products!
        if (!hasProductsSheet && workbook.SheetNames.length > 0) {
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (jsonRows && jsonRows.length >= 2) {
            productsSheetData = jsonRows;
            hasProductsSheet = true;
          }
        }

        // Parse categories sheet first
        if (categoriesSheetData) {
          const parsedCats = parseCategoriesSheet(categoriesSheetData);
          parsedCats.forEach(cName => {
            if (!importedCategories.some(c => c.name.toLowerCase() === cName.toLowerCase())) {
              importedCategories.push({
                id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                name: cName
              });
            }
          });
        }

        // Parse products sheet second
        if (productsSheetData) {
          const parsed = parseProductsSheet(productsSheetData);
          importedProducts = parsed.importedProducts;
          parsed.categoriesFromProducts.forEach(cName => {
            if (!importedCategories.some(c => c.name.toLowerCase() === cName.toLowerCase())) {
              importedCategories.push({
                id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                name: cName
              });
            }
          });
        }

        // Parse sales sheet third
        if (salesSheetData) {
          importedSales = parseSalesSheet(salesSheetData, importedProducts.length > 0 ? importedProducts : products);
        }

        // Apply changes
        onImportDatabase({
          products: importedProducts.length > 0 ? importedProducts : products,
          categories: importedCategories,
          sales: importedSales
        });

        let successMsg = 'Planilha importada com sucesso! ';
        if (importedProducts.length > 0) successMsg += `${importedProducts.length} produtos carregados. `;
        if (hasSalesSheet) successMsg += `${importedSales.length} vendas cadastradas. `;
        
        setImportSuccessMsg(successMsg);
        setImportError(null);
        setTimeout(() => setImportSuccessMsg(null), 6000);
      } catch (err: any) {
        setImportError(err.message || 'Erro ao processar o arquivo de planilha.');
      } finally {
        setImportingExcel(false);
        if (e.target) e.target.value = ''; // Reset file input
      }
    };

    reader.onerror = () => {
      setImportError('Ocorreu um erro ao carregar o arquivo físico do computador.');
      setImportingExcel(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // Local Excel (.xlsx) Stock Export
  const handleExportStockToExcel = () => {
    try {
      const headers = ['Código/SKU', 'Nome do Produto', 'Categoria', 'Preço de Custo (R$)', 'Preço de Venda (R$)', 'Estoque', 'Estoque Mínimo'];
      const rows = products.map(p => [
        p.code,
        p.name,
        p.category,
        p.costPrice,
        p.salePrice,
        p.stock,
        p.minStock
      ]);

      const wsData = [headers, ...rows];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Estoque');
      XLSX.writeFile(wb, `Estoque_Inventario_${new Date().toISOString().substring(0, 10)}.xlsx`);
      
      setImportSuccessMsg('Estoque exportado para Excel (.xlsx) com sucesso!');
      setTimeout(() => setImportSuccessMsg(null), 5000);
    } catch (err: any) {
      setImportError('Erro ao exportar estoque para Excel: ' + err.message);
    }
  };

  // Local Excel (.xlsx) Sales Export
  const handleExportSalesToExcel = () => {
    try {
      const headers = [
        'ID da Venda', 
        'Data', 
        'Cliente', 
        'Telefone', 
        'Forma de Pagamento', 
        'Produtos Vendidos', 
        'Custo Total (R$)', 
        'Faturamento (R$)', 
        'Lucro Líquido (R$)', 
        'Status'
      ];
      const rows = sales.map(s => [
        s.id,
        new Date(s.date).toLocaleString('pt-BR'),
        s.clientName || 'Cliente Geral',
        s.clientPhone || '-',
        s.paymentMethod,
        s.items.map(item => `${item.productName} (${item.quantity}x)`).join(', '),
        s.totalCost,
        s.total,
        s.profit,
        s.status === 'completed' ? 'Concluída' : 'Cancelada'
      ]);

      const wsData = [headers, ...rows];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Histórico de Vendas');
      XLSX.writeFile(wb, `Historico_Vendas_${new Date().toISOString().substring(0, 10)}.xlsx`);

      setImportSuccessMsg('Histórico de vendas exportado para Excel (.xlsx) com sucesso!');
      setTimeout(() => setImportSuccessMsg(null), 5000);
    } catch (err: any) {
      setImportError('Erro ao exportar vendas para Excel: ' + err.message);
    }
  };

  // Download Standard Import Template
  const handleDownloadTemplate = () => {
    try {
      const wb = XLSX.utils.book_new();

      // 1. Products Sheet
      const prodHeaders = ['Código/SKU', 'Nome do Produto', 'Categoria', 'Preço de Custo', 'Preço de Venda', 'Estoque', 'Estoque Mínimo'];
      const prodSampleRows = [
        ['SKU-1001', 'Camiseta Masculina Algodão', 'Vestuário', '25.00', '59.90', '100', '10'],
        ['SKU-1002', 'Calça Jeans Premium', 'Vestuário', '45.00', '119.90', '50', '5'],
        ['SKU-1003', 'Tênis Running Confort', 'Calçados', '75.00', '189.90', '30', '3'],
        ['SKU-1004', 'Boné Casual Streetwear', 'Acessórios', '12.50', '39.90', '150', '15'],
        ['SKU-1005', 'Cinto de Couro Clássico', 'Acessórios', '18.00', '49.90', '40', '8'],
      ];
      const prodWs = XLSX.utils.aoa_to_sheet([prodHeaders, ...prodSampleRows]);
      prodWs['!cols'] = [
        { wch: 15 }, // SKU
        { wch: 30 }, // Nome do Produto
        { wch: 18 }, // Categoria
        { wch: 15 }, // Preço de Custo
        { wch: 15 }, // Preço de Venda
        { wch: 10 }, // Estoque
        { wch: 15 }, // Estoque Mínimo
      ];
      XLSX.utils.book_append_sheet(wb, prodWs, 'Produtos (Estoque)');

      // 2. Sales Sheet
      const salesHeaders = [
        'ID da Venda', 
        'Data', 
        'Cliente', 
        'Telefone', 
        'Forma de Pagamento', 
        'Itens Vendidos (Nome e Qtd)', 
        'Custo Total', 
        'Faturamento', 
        'Lucro Líquido', 
        'Status'
      ];
      const salesSampleRows = [
        ['venda_1', '12/07/2026 14:30', 'Maria Souza', '(11) 99999-1111', 'pix', 'Camiseta Masculina Algodão (2x), Calça Jeans Premium (1x)', '95.00', '239.70', '144.70', 'Concluída'],
        ['venda_2', '12/07/2026 15:15', 'João Silva', '', 'dinheiro', 'Boné Casual Streetwear (1x)', '12.50', '39.90', '27.40', 'Concluída'],
        ['venda_3', '12/07/2026 16:00', 'Ana Oliveira', '(11) 98888-2222', 'card_credit', 'Cinto de Couro Clássico (1x)', '18.00', '49.90', '31.90', 'Concluída']
      ];
      const salesWs = XLSX.utils.aoa_to_sheet([salesHeaders, ...salesSampleRows]);
      salesWs['!cols'] = [
        { wch: 15 }, // ID
        { wch: 20 }, // Data
        { wch: 20 }, // Cliente
        { wch: 18 }, // Telefone
        { wch: 20 }, // Pagamento
        { wch: 45 }, // Itens
        { wch: 15 }, // Custo Total
        { wch: 15 }, // Faturamento
        { wch: 15 }, // Lucro
        { wch: 12 }, // Status
      ];
      XLSX.utils.book_append_sheet(wb, salesWs, 'Histórico de Vendas');

      // 3. Categories Sheet
      const catHeaders = ['Nome da Categoria'];
      const catSampleRows = [
        ['Vestuário'],
        ['Calçados'],
        ['Acessórios']
      ];
      const catWs = XLSX.utils.aoa_to_sheet([catHeaders, ...catSampleRows]);
      catWs['!cols'] = [
        { wch: 25 } // Categoria
      ];
      XLSX.utils.book_append_sheet(wb, catWs, 'Lista de Categorias');

      XLSX.writeFile(wb, 'Modelo_Importacao_GestaoPro_Completo.xlsx');
      
      setImportSuccessMsg('Modelo oficial multi-abas baixado! Preencha Produtos, Vendas e Categorias e faça o upload.');
      setTimeout(() => setImportSuccessMsg(null), 8000);
    } catch (err: any) {
      setImportError('Erro ao gerar modelo de planilha: ' + err.message);
    }
  };

  const handleResetClick = () => {
    if (window.confirm('CUIDADO: Tem certeza que deseja ZERAR o banco de dados?\n\nIsso removerá PERMANENTEMENTE todos os seus produtos, categorias e histórico de vendas atuais, deixando o banco de dados totalmente limpo.')) {
      onResetDatabase();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 id="reports-title" className="text-2xl font-bold tracking-tight text-slate-900">Relatórios & Manutenção</h1>
        <p className="text-sm text-slate-500 mt-1">Gere relatórios de desempenho por categoria e gerencie integrações em nuvem para sua loja.</p>
      </div>

      {/* Grid of secondary statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ticket médio */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Ticket Médio por Venda</span>
          <span className="text-2xl font-bold font-mono text-slate-900 block mt-3">
            {averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <p className="text-xs text-slate-400 mt-1.5">Faturamento total dividido pelo volume total de vendas concluídas.</p>
        </div>

        {/* ROI */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Retorno Sobre Investimento (ROI)</span>
          <span className="text-2xl font-bold font-mono text-emerald-600 block mt-3">
            {roi.toFixed(1)}%
          </span>
          <p className="text-xs text-slate-400 mt-1.5">Eficiência financeira: quanto você lucra para cada R$ 1,00 de custo investido.</p>
        </div>

        {/* Margem de Contribuição Média */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Markup Geral / Margem Média</span>
          <span className="text-2xl font-bold font-mono text-indigo-600 block mt-3">
            {totalFaturamento > 0 ? ((lucroReal / totalFaturamento) * 100).toFixed(1) : 0}%
          </span>
          <p className="text-xs text-slate-400 mt-1.5">Porcentagem líquida retida de lucro em cima do faturamento operacional total.</p>
        </div>
      </div>

      {/* Reports and Backup splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Charts & Rankings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Category breakdown reports chart */}
          <div id="reports-categories-card" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
              <PieChart className="h-5 w-5 text-slate-500" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Desempenho de Vendas por Categoria</h2>
                <p className="text-xs text-slate-400 mt-0.5">Visão analítica de faturamento, volume de peças e lucratividade de cada setor.</p>
              </div>
            </div>

            {activeCategoryReports.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-sm font-medium">Nenhum setor registrou vendas ainda.</p>
                <p className="text-xs mt-0.5">As estatísticas serão listadas conforme novas compras forem efetuadas no caixa.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {activeCategoryReports.map((cat, idx) => {
                  const percentageOfMax = (cat.revenue / maxCategoryRevenue) * 100;
                  const catMargin = cat.revenue > 0 ? (cat.profit / cat.revenue) * 100 : 0;
                  
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">{cat.categoryName}</span>
                        <span className="font-mono text-slate-500">
                          {cat.itemsSold} un. vendidas •{' '}
                          <strong className="text-slate-900 font-bold">
                            {cat.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </strong>
                        </span>
                      </div>

                      {/* Progress Bar with faturamento ratio */}
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex relative">
                        <div 
                          style={{ width: `${percentageOfMax}%` }} 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        />
                      </div>

                      {/* Detailed info of costs, margins */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Custo de Estoque: {cat.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        <div className="flex gap-2">
                          <span className="text-emerald-600 font-semibold">Lucro Líquido: {cat.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                          <span className="text-indigo-600 font-bold font-mono">Margem: {catMargin.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product performance report card */}
          <div id="reports-products-card" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
              <ShoppingBag className="h-5 w-5 text-slate-500" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Desempenho de Vendas por Produto</h2>
                <p className="text-xs text-slate-400 mt-0.5">Visão detalhada de faturamento, peças vendidas e rentabilidade individual.</p>
              </div>
            </div>

            {activeProductReports.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-sm font-medium">Nenhum produto registrou vendas ainda.</p>
                <p className="text-xs mt-0.5">O ranking de vendas individuais aparecerá assim que você realizar novas vendas.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 pr-2">Produto</th>
                      <th className="pb-3 text-center">Un.</th>
                      <th className="pb-3 text-right">Faturamento</th>
                      <th className="pb-3 text-right">Lucro</th>
                      <th className="pb-3 text-right">Margem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {activeProductReports.slice(0, 8).map((prod, idx) => {
                      const prodMargin = prod.revenue > 0 ? (prod.profit / prod.revenue) * 100 : 0;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 pr-2 font-bold text-slate-900">
                            <p className="line-clamp-1" title={prod.productName}>{prod.productName}</p>
                            <span className="text-[9px] text-slate-400 font-normal uppercase tracking-wider">{prod.category}</span>
                          </td>
                          <td className="py-2.5 text-center font-mono text-slate-600">{prod.itemsSold}</td>
                          <td className="py-2.5 text-right font-mono text-slate-900 font-medium">
                            {prod.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                          <td className="py-2.5 text-right font-mono text-emerald-600 font-bold">
                            {prod.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                          <td className="py-2.5 text-right font-mono font-bold text-indigo-600">{prodMargin.toFixed(0)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {activeProductReports.length > 8 && (
                  <p className="text-[10px] text-slate-400 text-center mt-3 font-semibold">
                    Mostrando os 8 produtos mais vendidos.
                  </p>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Database Maintenance and Cloud Workspace integration */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1: Ferramentas de Planilha Excel (100% Offline, Totalmente Funcional) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                Planilhas Excel (.xlsx) & Importação
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Importe ou exporte dados de produtos e vendas offline instantaneamente.</p>
            </div>

            {/* Notification indicators */}
            {importSuccessMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100 text-xs flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{importSuccessMsg}</span>
              </div>
            )}

            {importError && !googleSuccessMsg && (
              <div className="p-3 bg-rose-50 text-rose-800 rounded-lg border border-rose-100 text-xs flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{importError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* 1. Download Model Template */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">1. Planilha Modelo Oficial</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">Recomendado</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Baixe nosso modelo padrão com as colunas corretas. Preencha seus produtos para que o sistema alinhe todos os preços, custos e estoque perfeitamente.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Download className="h-4 w-4" />
                  Baixar Planilha Modelo (.xlsx)
                </button>
              </div>

              {/* 2. Import Excel/CSV Sheet */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">2. Enviar Planilha Preenchida</span>
                <input
                  type="file"
                  ref={excelInputRef}
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImportExcelOrCsv}
                  className="hidden"
                />
                <button
                  onClick={() => excelInputRef.current?.click()}
                  disabled={importingExcel}
                  className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {importingExcel ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Extrair e Carregar Planilha (.xlsx, .csv)
                </button>
                <div className="text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1.5">
                  <p className="font-bold text-slate-600 uppercase">Colunas esperadas na planilha:</p>
                  <ul className="list-disc list-inside space-y-0.5 font-mono text-slate-500">
                    <li>A: Código/SKU</li>
                    <li>B: Nome do Produto</li>
                    <li>C: Categoria</li>
                    <li>D: Preço de Custo</li>
                    <li>E: Preço de Venda</li>
                    <li>F: Estoque</li>
                    <li>G: Estoque Mínimo</li>
                  </ul>
                </div>
              </div>

              {/* 3. Local Exports */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">3. Exportar para Excel (.xlsx)</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleExportStockToExcel}
                    className="py-2.5 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    Exportar Estoque
                  </button>

                  <button
                    onClick={handleExportSalesToExcel}
                    className="py-2.5 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    Exportar Vendas
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-center">Gera arquivos compatíveis com o Excel com um clique.</p>
              </div>
            </div>
          </div>

          {/* Card 2: Backup Local JSON & Zona de Perigo */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">Backup Local & Zona de Perigo</h2>
              <p className="text-xs text-slate-400 mt-0.5">Operações manuais de arquivos offline e exclusão.</p>
            </div>

            <div className="space-y-4">
              {/* Local JSON Backup Export */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1.5">Exportar Backup Completo</p>
                <button
                  id="export-db-btn"
                  onClick={handleExportDatabase}
                  className="w-full py-2 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-slate-400" />
                  Baixar Backup JSON (.json)
                </button>
                <p className="text-[10px] text-slate-400 mt-1">Salva todo o estado (estoque, categorias e vendas) em um único arquivo JSON.</p>
              </div>

              {/* Local JSON Backup Import */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1.5">Restaurar Backup Completo</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleImportDatabase}
                  className="hidden"
                />
                <button
                  id="import-db-trigger"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="h-3.5 w-3.5 text-slate-400" />
                  Carregar Backup JSON (.json)
                </button>
              </div>

              <hr className="border-slate-100 my-2" />

              {/* Danger Zone */}
              <div className="space-y-1.5 bg-rose-50/20 p-3 rounded-lg border border-rose-100/40">
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Zona de Perigo</span>
                <p className="text-[10px] text-slate-500">Exclusão permanente e redefinição de dados.</p>
                
                <button
                  id="reset-db-btn"
                  onClick={handleResetClick}
                  className="w-full py-2 px-3 bg-white hover:bg-rose-50 border border-rose-200 hover:border-rose-300 text-rose-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all mt-1 cursor-pointer"
                >
                  <RefreshCcw className="h-3 w-3" />
                  Zerar Todo o Banco de Dados
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Google Cloud (Sincronização opcional) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Cloud className="h-4 w-4 text-indigo-500" />
                  Sincronização em Nuvem (Opcional)
                </h2>
                <p className="text-[10px] text-slate-400">Salve no Firestore e exporte para Google Sheets.</p>
              </div>
              {user && (
                <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                  Nuvem Ativa
                </span>
              )}
            </div>

            {/* Iframe Cookie Policy / Auto-logout Alert */}
            {isInIframe && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-[10px] space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3 text-amber-600 shrink-0" />
                  Visualização em Painel (Iframe)
                </p>
                <p className="leading-relaxed text-slate-600">
                  Os navegadores (como o Chrome) bloqueiam cookies de login em telas embutidas. Se o site desconectar sozinho, por favor <strong>abra o app em uma nova aba</strong> usando o botão do topo para ter login persistente!
                </p>
              </div>
            )}

            {/* Google success notifications */}
            {googleSuccessMsg && (
              <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-lg text-[11px] font-semibold flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                  <span>{googleSuccessMsg}</span>
                </div>
                {lastExportedSheetUrl && (
                  <a 
                    href={lastExportedSheetUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 underline font-bold flex items-center gap-0.5"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Abrir Planilha no Google Sheets
                  </a>
                )}
                {lastBackupUrl && (
                  <a 
                    href={lastBackupUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 underline font-bold flex items-center gap-0.5"
                  >
                    <FolderOpen className="h-3 w-3" />
                    Ver Backup no Google Drive
                  </a>
                )}
              </div>
            )}

            {!user ? (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center space-y-2.5">
                <p className="text-[10px] text-slate-500 leading-relaxed">Conecte sua conta do Google para ativar o backup automático na nuvem e exportar para planilhas online.</p>
                <button
                  onClick={onGoogleLogin}
                  className="mx-auto flex items-center justify-center gap-2 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 py-1.5 px-3 rounded-lg shadow-xs transition-all text-[11px] font-bold cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Conectar Conta Google
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-slate-50 p-2 rounded border border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {user.photoURL && (
                      <img src={user.photoURL} alt={user.displayName} className="w-6 h-6 rounded-full border" referrerPolicy="no-referrer" />
                    )}
                    <span className="font-bold truncate text-slate-700">{user.displayName || 'Conectado'}</span>
                  </div>
                  <button
                    onClick={onGoogleLogout}
                    className="text-[9px] font-bold text-rose-600 hover:bg-rose-50 px-1.5 py-0.5 rounded border transition-colors cursor-pointer"
                  >
                    Desconectar
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={exportingProducts}
                    onClick={handleExportStockToSheets}
                    className="py-1.5 px-2.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Exportar Estoque (Sheets)
                  </button>

                  <button
                    disabled={exportingSales}
                    onClick={handleExportSalesToSheets}
                    className="py-1.5 px-2.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Exportar Vendas (Sheets)
                  </button>
                </div>

                <button
                  disabled={uploadingBackup}
                  onClick={handleBackupToDrive}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Salvar Backup no Google Drive
                </button>

                {/* Import from Drive */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Importar de Planilha Drive</span>
                  {loadingSpreadsheets ? (
                    <div className="flex items-center gap-1 py-1 text-[11px] text-slate-500">
                      <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
                      <span>Buscando planilhas...</span>
                    </div>
                  ) : spreadsheets.length === 0 ? (
                    <p className="text-[10px] text-slate-400">Nenhuma planilha encontrada no seu Google Drive.</p>
                  ) : (
                    <div className="flex gap-2">
                      <select
                        value={selectedSpreadsheetId}
                        onChange={(e) => setSelectedSpreadsheetId(e.target.value)}
                        className="flex-1 text-[11px] bg-white border border-slate-200 rounded-lg p-1.5 font-medium"
                      >
                        {spreadsheets.map((sheet) => (
                          <option key={sheet.id} value={sheet.id}>
                            {sheet.name}
                          </option>
                        ))}
                      </select>
                      <button
                        disabled={importingFromSheet || !selectedSpreadsheetId}
                        onClick={handleImportFromSheets}
                        className="py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Carregar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
