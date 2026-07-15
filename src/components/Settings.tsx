import React, { useRef, useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { Product, Sale, Category, SaleItem, StoreInfo, Expense, Loan, ServiceOrder, Customer, Supplier, Purchase, CashSession } from '../types';

const stripAccents = (s: string) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
import {
  Download,
  Upload,
  RefreshCcw,
  ShieldAlert,
  FileSpreadsheet,
  CheckCircle,
  Loader2,
  Settings as SettingsIcon,
  Store,
  User as UserIcon,
  Save,
  CheckCircle2,
  HardDrive,
  AlertTriangle,
  Cloud,
  CloudDownload,
  Clock,
  Trash2,
  LogOut
} from 'lucide-react';

const defaultStoreInfo: StoreInfo = {
  name: 'ZM Store',
  cnpj: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  ownerName: '',
  notes: '',
  logoUrl: ''
  const parsePayment = (row: any[]): any => {
    let paymentMethod: any = 'pix';
    if (paymentIdx !== -1 && paymentIdx < row.length && row[paymentIdx]) {
      const pLower = String(row[paymentIdx]).trim().toLowerCase();
      if (pLower.includes('dinheiro') || pLower.includes('money')) paymentMethod = 'money';
      else if (pLower.includes('crédito') || pLower.includes('credito') || pLower.includes('credit')) paymentMethod = 'card_credit';
      else if (pLower.includes('débito') || pLower.includes('debito') || pLower.includes('debit')) paymentMethod = 'card_debit';
      else if (pLower.includes('transf') || pLower.includes('banc')) paymentMethod = 'transfer';
    }
    return paymentMethod;
  };

  const parseStatus = (row: any[]): 'completed' | 'cancelled' | 'pending' => {
    let status: 'completed' | 'cancelled' | 'pending' = 'completed';
    if (statusIdx !== -1 && statusIdx < row.length && row[statusIdx]) {
      const sLower = String(row[statusIdx]).trim().toLowerCase();
      if (sLower.includes('canc') || sLower.includes('estor')) status = 'cancelled';
      else if (sLower.includes('pend') || sLower.includes('abert') || sLower.includes('aguar')) status = 'pending';
    }
    return status;
  };

  const makeItem = (pNameRaw: any, qtyRaw: any): SaleItem => {
    const pName = String(pNameRaw || '').trim();
    let qty = parseInt(String(qtyRaw || '1'), 10);
    if (isNaN(qty) || qty <= 0) qty = 1;
    const pNameLower = pName.toLowerCase().trim();
    let matchedProd = productsList.find(pr =>
      pr.name.toLowerCase().trim() === pNameLower ||
      pr.code.toLowerCase().trim() === pNameLower
    );
    if (!matchedProd) {
      matchedProd = productsList.find(pr =>
        pr.name.toLowerCase().includes(pNameLower) ||
        pNameLower.includes(pr.name.toLowerCase())
      );
    }
    const costPrice = matchedProd ? matchedProd.costPrice : 0;
    const salePrice = matchedProd ? matchedProd.salePrice : 0;
    return {
      productId: matchedProd ? matchedProd.id : `p_temp_${Math.random().toString(36).substring(2, 6)}`,
      productName: matchedProd ? matchedProd.name : pName,
      quantity: qty,
      costPrice,
      salePrice,
      total: salePrice * qty
    };
  };

  const sales: Sale[] = [];
  const perItemMode = itemsIdx === -1 && produtoIdx !== -1 && qtdIdx !== -1;

  // Novo formato: uma linha por item (colunas Produto/QTD separadas)
  if (perItemMode) {
    const groups = new Map<string, any[]>();
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      if (row.every(c => c === null || c === undefined || String(c).trim() === '')) continue;
      const id = (idIdx !== -1 && idIdx < row.length && row[idIdx]) ? String(row[idIdx]).trim() : `venda_${Date.now()}_${i}`;
      if (!groups.has(id)) groups.set(id, []);
      groups.get(id)!.push(row);
    }
    for (const [id, groupRows] of groups) {
      const first = groupRows[0];
      const items = groupRows.map(r => makeItem(r[produtoIdx], r[qtdIdx]));
      let totalCost = 0;
      let total = 0;
      if (costIdx !== -1 || revenueIdx !== -1) {
        for (const r of groupRows) {
          totalCost += getFloatVal(r, costIdx);
          total += getFloatVal(r, revenueIdx);
        }
      }
      if (totalCost === 0) totalCost = items.reduce((s, it) => s + it.costPrice * it.quantity, 0);
      if (total === 0) total = items.reduce((s, it) => s + it.total, 0);
      const clientName = (clientIdx !== -1 && clientIdx < first.length && first[clientIdx]) ? String(first[clientIdx]).trim() : undefined;
      const clientPhone = (phoneIdx !== -1 && phoneIdx < first.length && first[phoneIdx]) ? String(first[phoneIdx]).trim() : undefined;
      let saleType = 'CPF';
      if (tipoIdx !== -1 && tipoIdx < first.length && first[tipoIdx]) {
        const t = String(first[tipoIdx]).trim().toLowerCase();
        if (t.includes('cnpj')) saleType = 'CNPJ';
      }
      const ecommerceOrderId = (orderIdIdx !== -1 && orderIdIdx < first.length && first[orderIdIdx]) ? String(first[orderIdIdx]).trim() : undefined;
      const saleChannel = (channelIdx !== -1 && channelIdx < first.length && first[channelIdx]) ? String(first[channelIdx]).trim() : undefined;
      sales.push({
        id,
        date: parseDate(first),
        clientName,
        clientPhone,
        paymentMethod: parsePayment(first),
        items,
        totalCost,
        total,
        profit: total - totalCost,
        saleType: saleType as 'CPF' | 'CNPJ',
        ecommerceOrderId,
        saleChannel,
        status: parseStatus(first)
      });
    }
    return sales;
  }

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
        const match = rawDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[^\d]*(\d{1,2}):(\d{2}))?/);
        if (match) {
          const day = parseInt(match[1], 10);
          const month = parseInt(match[2], 10) - 1;
          const year = parseInt(match[3], 10);
          const hh = match[4] ? parseInt(match[4], 10) : 12;
          const mm = match[5] ? parseInt(match[5], 10) : 0;
          const parsed = new Date(year, month, day, hh, mm, 0);
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

        const match = itemStr.match(/(.+?)\s*\((\d+)\s*x\b[^)]*\)/i) || itemStr.match(/(.+?)\s*\((\d+)\s*x?\)/i) || itemStr.match(/(.+?)\s*x\s*(\d+)/i) || itemStr.match(/(\d+)\s*x\s*(.+)/i);
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
          matchedProd = productsList.find(pr =>
            pr.name.toLowerCase().includes(pNameLower) ||
            pNameLower.includes(pr.name.toLowerCase())
          );
        }

        const costPrice = matchedProd ? matchedProd.costPrice : 0;
        const salePrice = matchedProd ? matchedProd.salePrice : 0;

        saleItems.push({
          productId: matchedProd ? matchedProd.id : `p_temp_${Math.random().toString(36).substring(2,6)}`,
          productName: matchedProd ? matchedProd.name : pName,
          quantity: qty,
          costPrice,
          salePrice,
          total: salePrice * qty
        });
      }
    }

    const totalCost = getFloatVal(row, costIdx) || saleItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
    const total = getFloatVal(row, revenueIdx) || saleItems.reduce((sum, item) => sum + item.total, 0);

    let status: 'completed' | 'cancelled' | 'pending' = 'completed';
    if (statusIdx !== -1 && statusIdx < row.length && row[statusIdx]) {
      const sLower = String(row[statusIdx]).trim().toLowerCase();
      if (sLower.includes('canc') || sLower.includes('estor')) {
        status = 'cancelled';
      } else if (sLower.includes('pend') || sLower.includes('abert') || sLower.includes('aguar')) {
        status = 'pending';
      }
    }

    const tipoIdx = findColIndex(['tipo', 'cpf', 'cnpj', 'tipo venda', 'sale type']);
    const orderIdIdx = findColIndex(['id pedido', 'pedido', 'order id', 'ecommerce', 'shopee', 'tiktok']);
    const channelIdx = findColIndex(['canal', 'channel', 'origem', 'marketplace']);

    let saleType = 'CPF';
    if (tipoIdx !== -1 && tipoIdx < row.length && row[tipoIdx]) {
      const t = String(row[tipoIdx]).trim().toLowerCase();
      if (t.includes('cnpj')) saleType = 'CNPJ';
    }

    const ecommerceOrderId = (orderIdIdx !== -1 && orderIdIdx < row.length && row[orderIdIdx]) ? String(row[orderIdIdx]).trim() : undefined;
    const saleChannel = (channelIdx !== -1 && channelIdx < row.length && row[channelIdx]) ? String(row[channelIdx]).trim() : undefined;

    sales.push({
      id,
      date: saleDate,
      clientName,
      clientPhone,
      paymentMethod,
      items: saleItems,
      totalCost,
      total,
      profit: total - totalCost,
      saleType: saleType as 'CPF' | 'CNPJ',
      ecommerceOrderId,
      saleChannel,
      status
    });
  }

  return sales;
}

interface SettingsProps {
  products: Product[];
  sales: Sale[];
  categories: Category[];
  expenses: Expense[];
  loans: Loan[];
  orders: ServiceOrder[];
  customers: Customer[];
  suppliers: Supplier[];
  purchases: Purchase[];
  cashSessions: CashSession[];
  storeInfo: StoreInfo;
  onStoreInfoChange: (info: StoreInfo) => void;
  onImportDatabase: (data: { products: Product[]; sales: Sale[]; categories: Category[]; expenses: Expense[]; loans?: Loan[]; orders?: ServiceOrder[]; customers?: Customer[]; suppliers?: Supplier[]; purchases?: Purchase[]; cashSessions?: CashSession[] }) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onResetDatabase: () => void;
  cloudUser: User | null;
  cloudSyncing: boolean;
  cloudLastSync: string | null;
  cloudError: string | null;
  cloudPending: boolean;
  dailyWrites: number;
  dailyWriteLimit: number;
  onCloudSignIn: () => void;
  onCloudSignOut: () => void;
  onCloudSyncNow: () => void;
  onDownloadFromCloud: () => void;
  onRestoreBackup: () => void;
  restoringBackup: boolean;
  onClearCloud: () => void;
  clearingCloud: boolean;
  syncEnabled: boolean;
}

export default function Settings({
  products,
  sales,
  categories,
  expenses,
  loans,
  orders,
  customers,
  suppliers,
  purchases,
  cashSessions,
  storeInfo: initialStoreInfo,
  onStoreInfoChange,
  onImportDatabase,
  onExportBackup,
  onImportBackup,
  onResetDatabase,
  cloudUser,
  cloudSyncing,
  cloudLastSync,
  cloudError,
  cloudPending,
  dailyWrites,
  dailyWriteLimit,
  onCloudSignIn,
  onCloudSignOut,
  onCloudSyncNow,
  onDownloadFromCloud,
  onRestoreBackup,
  restoringBackup,
  onClearCloud,
  clearingCloud,
  syncEnabled
}: SettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // Store profile
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(initialStoreInfo);
  useEffect(() => { setStoreInfo(initialStoreInfo); }, [initialStoreInfo]);
  const [storeSaved, setStoreSaved] = useState(false);

  const handleSaveStoreInfo = async () => {
    localStorage.setItem('zm_store_info', JSON.stringify(storeInfo));
    onStoreInfoChange(storeInfo);
    setStoreSaved(true);
    setTimeout(() => setStoreSaved(false), 3000);
  };

  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importingExcel, setImportingExcel] = useState(false);

  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImportBackup(file);
    e.target.value = '';
  };

  const handleImportExcelOrCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setImportingExcel(true);
    setImportError(null);

    const XLSX = await import('xlsx');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (!data) throw new Error('Não foi possível ler os dados do arquivo.');
        const workbook = XLSX.read(data, { type: 'array' });

        let importedProducts: Product[] = [];
        let importedCategories: Category[] = [...categories];
        let importedSales: Sale[] = [...sales];
        let hasSalesSheet = false;

        let productsSheetData: any[][] | null = null;
        let salesSheetData: any[][] | null = null;
        let categoriesSheetData: any[][] | null = null;
        let loansSheetData: any[][] | null = null;
        let ordersSheetData: any[][] | null = null;
        let purchasesSheetData: any[][] | null = null;
        let customersSheetData: any[][] | null = null;
        let suppliersSheetData: any[][] | null = null;
        let cashSheetData: any[][] | null = null;

        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          const jsonRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (!jsonRows || jsonRows.length < 2) continue;

          const nameLower = sheetName.toLowerCase();
          const firstRow = jsonRows[0].map(h => String(h || '').trim().toLowerCase());
          const n = stripAccents(nameLower);

          const isProducts = nameLower.includes('prod') || nameLower.includes('estoq') || firstRow.includes('nome do produto') || firstRow.includes('preço de venda');
          const isSales = nameLower.includes('vend') || nameLower.includes('saída') || firstRow.includes('id da venda') || firstRow.includes('itens vendidos') || firstRow.includes('produtos vendidos');
          const isCategories = nameLower.includes('cat') || nameLower.includes('setor') || firstRow.includes('nome da categoria');
          const isLoans = n.includes('emprest') || n.includes('loan') || n.includes('divida') || n.includes('devedor');
          const isOrders = n.includes('ordem') || n.includes('servico') || n.includes('servi') || n.includes('orcamento') || n.includes('os ');
          const isPurchases = n.includes('compra') || n.includes('purchase') || n.includes('entrada');
          const isCustomers = n.includes('cliente') || n.includes('customer');
          const isSuppliers = n.includes('fornecedor') || n.includes('supplier');
          const isCash = n.includes('caixa') || n.includes('fechamento') || n.includes('cash');

          if (isProducts && !productsSheetData) productsSheetData = jsonRows;
          else if (isSales && !salesSheetData) { salesSheetData = jsonRows; hasSalesSheet = true; }
          else if (isCategories && !categoriesSheetData) categoriesSheetData = jsonRows;
          else if (isLoans && !loansSheetData) loansSheetData = jsonRows;
          else if (isOrders && !ordersSheetData) ordersSheetData = jsonRows;
          else if (isPurchases && !purchasesSheetData) purchasesSheetData = jsonRows;
          else if (isCustomers && !customersSheetData) customersSheetData = jsonRows;
          else if (isSuppliers && !suppliersSheetData) suppliersSheetData = jsonRows;
          else if (isCash && !cashSheetData) cashSheetData = jsonRows;
        }

        if (!productsSheetData && workbook.SheetNames.length > 0) {
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (jsonRows && jsonRows.length >= 2) productsSheetData = jsonRows;
        }

        if (categoriesSheetData) {
          parseCategoriesSheet(categoriesSheetData).forEach(cName => {
            if (!importedCategories.some(c => c.name.toLowerCase() === cName.toLowerCase())) {
              importedCategories.push({ id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, name: cName });
            }
          });
        }

        if (productsSheetData) {
          const parsed = parseProductsSheet(productsSheetData);
          importedProducts = parsed.importedProducts;
          parsed.categoriesFromProducts.forEach(cName => {
            if (!importedCategories.some(c => c.name.toLowerCase() === cName.toLowerCase())) {
              importedCategories.push({ id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, name: cName });
            }
          });
        }

        if (salesSheetData) {
          importedSales = parseSalesSheet(salesSheetData, importedProducts.length > 0 ? importedProducts : products);
        }

        let importedLoans: Loan[] | undefined;
        let importedOrders: ServiceOrder[] | undefined;
        let importedPurchases: Purchase[] | undefined;
        let importedCustomers: Customer[] | undefined;
        let importedSuppliers: Supplier[] | undefined;
        let importedCash: CashSession[] | undefined;

        if (loansSheetData) importedLoans = parseLoansSheet(loansSheetData);
        if (ordersSheetData) importedOrders = parseOrdersSheet(ordersSheetData);
        if (purchasesSheetData) importedPurchases = parsePurchasesSheet(purchasesSheetData, suppliers);
        if (customersSheetData) importedCustomers = parseCustomersSheet(customersSheetData);
        if (suppliersSheetData) importedSuppliers = parseSuppliersSheet(suppliersSheetData);
        if (cashSheetData) importedCash = parseCashSheet(cashSheetData);

        onImportDatabase({
          products: importedProducts.length > 0 ? importedProducts : products,
          categories: importedCategories,
          sales: importedSales,
          expenses: expenses,
          ...(importedLoans ? { loans: importedLoans } : {}),
          ...(importedOrders ? { orders: importedOrders } : {}),
          ...(importedCustomers ? { customers: importedCustomers } : {}),
          ...(importedSuppliers ? { suppliers: importedSuppliers } : {}),
          ...(importedPurchases ? { purchases: importedPurchases } : {}),
          ...(importedCash ? { cashSessions: importedCash } : {}),
        });

        let successMsg = 'Planilha importada com sucesso! ';
        if (importedProducts.length > 0) {
          successMsg += `${importedProducts.length} produtos encontrados. `;
        } else {
          successMsg += 'Nenhum produto encontrado na planilha. Verifique se as colunas estão corretas. ';
        }
        if (hasSalesSheet) successMsg += `${importedSales.length} vendas. `;
        if (importedLoans) successMsg += `${importedLoans.length} empréstimos. `;
        if (importedOrders) successMsg += `${importedOrders.length} ordens de serviço. `;
        if (importedPurchases) successMsg += `${importedPurchases.length} compras. `;
        if (importedCustomers) successMsg += `${importedCustomers.length} clientes. `;
        if (importedSuppliers) successMsg += `${importedSuppliers.length} fornecedores. `;
        if (importedCash) successMsg += `${importedCash.length} fechamentos de caixa. `;
        const catCount = importedCategories.length - categories.length;
        if (catCount > 0) successMsg += `${catCount} categorias novas.`;
        setImportSuccessMsg(successMsg);
        setImportError(null);
        setTimeout(() => setImportSuccessMsg(null), 10000);
      } catch (err: any) {
        const msg = err.message || 'Erro ao processar o arquivo.';
        if (msg.includes('planilha está vazia')) {
          setImportError('A planilha está vazia ou não possui dados. Baixe o modelo oficial e preencha os dados.');
        } else {
          setImportError('Erro ao processar: ' + msg);
        }
      } finally {
        setImportingExcel(false);
        if (e.target) e.target.value = '';
      }
    };
    reader.onerror = () => {
      setImportError('Erro ao carregar o arquivo.');
      setImportingExcel(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExportStockToExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const headers = ['Código/SKU', 'Nome do Produto', 'Categoria', 'Preço de Custo (R$)', 'Preço de Venda (R$)', 'Estoque', 'Estoque Mínimo'];
      const rows = products.map(p => [p.code, p.name, p.category, p.costPrice, p.salePrice, p.stock, p.minStock]);
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      XLSX.utils.book_append_sheet(wb, ws, 'Estoque');
      XLSX.writeFile(wb, `Estoque_${new Date().toISOString().substring(0, 10)}.xlsx`);
      setImportSuccessMsg('Estoque exportado para Excel!');
      setTimeout(() => setImportSuccessMsg(null), 5000);
    } catch (err: any) {
      setImportError('Erro ao exportar: ' + err.message);
    }
  };

  const handleExportSalesToExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const headers = ['ID da Venda', 'Data', 'Hora', 'Cliente', 'Telefone', 'Forma de Pagamento', 'Tipo', 'Produto', 'QTD', 'Custo (R$)', 'Faturamento (R$)', 'Lucro (R$)', 'Status'];
      const rows: any[] = [];
      sales.forEach(s => {
        const dt = new Date(s.date);
        const data = dt.toLocaleDateString('pt-BR');
        const hora = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        s.items.forEach(item => {
          const itemCost = (item.costPrice || 0) * item.quantity;
          const itemTotal = item.total != null ? item.total : (item.salePrice || 0) * item.quantity;
          rows.push([
            s.id, data, hora, s.clientName || 'Cliente Geral', s.clientPhone || '-',
            s.paymentMethod, s.saleType || 'CPF', item.productName, item.quantity,
            Number(itemCost.toFixed(2)), Number(itemTotal.toFixed(2)), Number((itemTotal - itemCost).toFixed(2)),
            s.status === 'completed' ? 'Concluída' : s.status === 'cancelled' ? 'Cancelada' : 'Pendente'
          ]);
        });
      });
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      XLSX.utils.book_append_sheet(wb, ws, 'Vendas');
      XLSX.writeFile(wb, `Vendas_${new Date().toISOString().substring(0, 10)}.xlsx`);
      setImportSuccessMsg('Vendas exportadas para Excel!');
      setTimeout(() => setImportSuccessMsg(null), 5000);
    } catch (err: any) {
      setImportError('Erro ao exportar: ' + err.message);
    }
  };

  const handleExportFullDatabase = async () => {
    try {
      const XLSX = await import('xlsx');
      const dateStr = new Date().toISOString().substring(0, 10);
      const wb = XLSX.utils.book_new();

      // Sheet 1: Produtos (Estoque)
      const prodHeaders = ['SKU', 'Nome', 'Categoria', 'Preço Custo', 'Preço Venda', 'Estoque', 'Estoque Mínimo', 'Margem %'];
      const prodRows = products.map(p => {
        const margin = p.salePrice > 0 ? ((p.salePrice - p.costPrice) / p.salePrice * 100).toFixed(1) : '0.0';
        return [p.code, p.name, p.category, p.costPrice, p.salePrice, p.stock, p.minStock, margin];
      });
      const prodWs = XLSX.utils.aoa_to_sheet([prodHeaders, ...prodRows]);
      prodWs['!cols'] = prodHeaders.map(() => ({ wch: 22 }));
      XLSX.utils.book_append_sheet(wb, prodWs, 'Produtos');

      // Sheet 2: Vendas (uma linha por item)
      const saleHeaders = ['ID', 'Data', 'Hora', 'Cliente', 'Telefone', 'Pagamento', 'Tipo', 'ID Pedido', 'Produto', 'QTD', 'Valor Venda', 'Custo', 'Lucro', 'Status', 'Canal'];
      const saleRowsArray: any[] = [];
      sales.forEach(s => {
        const dt = new Date(s.date);
        const data = dt.toLocaleDateString('pt-BR');
        const hora = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        s.items.forEach(i => {
          const itemCost = (i.costPrice || 0) * i.quantity;
          const itemTotal = i.total != null ? i.total : (i.salePrice || 0) * i.quantity;
          saleRowsArray.push([
            s.id, data, hora, s.clientName || 'Cliente Geral', s.clientPhone || '-',
            s.paymentMethod, s.saleType || 'CPF', s.ecommerceOrderId || '',
            i.productName, i.quantity, Number(itemTotal.toFixed(2)), Number(itemCost.toFixed(2)),
            Number((itemTotal - itemCost).toFixed(2)),
            s.status === 'completed' ? 'Concluída' : s.status === 'cancelled' ? 'Cancelada' : 'Pendente',
            s.saleChannel || 'Loja Física'
          ]);
        });
      });
      const saleWs = XLSX.utils.aoa_to_sheet([saleHeaders, ...saleRowsArray]);
      saleWs['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 8 }, { wch: 22 }, { wch: 18 }, { wch: 15 }, { wch: 8 }, { wch: 12 }, { wch: 40 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, saleWs, 'Vendas');

      // Sheet 3: Itens de Venda (detalhado)
      const itemHeaders = ['Venda ID', 'Data', 'Hora', 'Produto', 'Quantidade', 'Preço Unitário', 'Total do Item', 'Custo Unitário', 'Lucro do Item'];
      const itemRows: any[] = [];
      sales.forEach(s => {
        if (s.status !== 'completed') return;
        const dt = new Date(s.date);
        const data = dt.toLocaleDateString('pt-BR');
        const hora = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        s.items.forEach(i => {
          const itemProfit = (i.salePrice - i.costPrice) * i.quantity;
          itemRows.push([s.id, data, hora, i.productName, i.quantity, i.salePrice, i.total, i.costPrice, itemProfit]);
        });
      });
      const itemWs = XLSX.utils.aoa_to_sheet([itemHeaders, ...itemRows]);
      itemWs['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, itemWs, 'Itens Vendidos');

      // Sheet 4: Resumo por Categoria
      const catHeaders = ['Categoria', 'Qtd Produtos', 'Valor Estoque (Custo)', 'Valor Estoque (Venda)', 'Qtd Vendida', 'Faturamento Total', 'Lucro Total'];
      const catMap = new Map<string, { prods: number; costVal: number; retailVal: number; qtdVend: number; fat: number; lucro: number }>();
      products.forEach(p => {
        if (!catMap.has(p.category)) catMap.set(p.category, { prods: 0, costVal: 0, retailVal: 0, qtdVend: 0, fat: 0, lucro: 0 });
        const c = catMap.get(p.category)!;
        c.prods++;
        c.costVal += p.costPrice * p.stock;
        c.retailVal += p.salePrice * p.stock;
      });
      sales.forEach(s => {
        if (s.status !== 'completed') return;
        s.items.forEach(i => {
          const p = products.find(pp => pp.id === i.productId);
          const cat = p?.category || 'Sem Categoria';
          if (!catMap.has(cat)) catMap.set(cat, { prods: 0, costVal: 0, retailVal: 0, qtdVend: 0, fat: 0, lucro: 0 });
          const c = catMap.get(cat)!;
          c.qtdVend += i.quantity;
          c.fat += i.total;
          c.lucro += (i.salePrice - i.costPrice) * i.quantity;
        });
      });
      const catRows = Array.from(catMap.entries()).map(([cat, data]) => [cat, data.prods, data.costVal, data.retailVal, data.qtdVend, data.fat, data.lucro]);
      const catWs = XLSX.utils.aoa_to_sheet([catHeaders, ...catRows]);
      catWs['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 16 }, { wch: 16 }];
      XLSX.utils.book_append_sheet(wb, catWs, 'Resumo por Categoria');

      // Sheet 5: Despesas
      const expHeaders = ['ID', 'Data', 'Categoria', 'Descrição', 'Valor', 'Status'];
      const expRows = expenses.map(e => [
        e.id,
        new Date(e.date).toLocaleDateString('pt-BR'),
        e.category,
        e.description,
        e.amount,
        e.status === 'paid' ? 'Pago' : 'Pendente'
      ]);
      const expWs = XLSX.utils.aoa_to_sheet([expHeaders, ...expRows]);
      expWs['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 25 }, { wch: 30 }, { wch: 14 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, expWs, 'Despesas');

      // Sheet 6: Métodos de Pagamento
      const payHeaders = ['Forma de Pagamento', 'Qtd Vendas', 'Faturamento Total'];
      const payMap = new Map<string, { qtd: number; total: number }>();
      sales.filter(s => s.status === 'completed').forEach(s => {
        if (!payMap.has(s.paymentMethod)) payMap.set(s.paymentMethod, { qtd: 0, total: 0 });
        const p = payMap.get(s.paymentMethod)!;
        p.qtd++;
        p.total += s.total;
      });
      const payRows = Array.from(payMap.entries()).map(([method, data]) => {
        const labels: Record<string, string> = { money: 'Dinheiro', card_credit: 'Cartão Crédito', card_debit: 'Cartão Débito', pix: 'PIX', transfer: 'Transferência' };
        return [labels[method] || method, data.qtd, data.total];
      });
      const payWs = XLSX.utils.aoa_to_sheet([payHeaders, ...payRows]);
      XLSX.utils.book_append_sheet(wb, payWs, 'Pagamentos');

      // Sheet 6: Dashboard (totais consolidados)
      const totalRevenue = sales.filter(s => s.status === 'completed').reduce((a, s) => a + s.total, 0);
      const totalCost = sales.filter(s => s.status === 'completed').reduce((a, s) => a + s.totalCost, 0);
      const totalProfit = totalRevenue - totalCost;
      const dashHeaders = ['Métrica', 'Valor'];
      const dashRows = [
        ['Qtd Produtos', products.length],
        ['Qtd Vendas (concluídas)', sales.filter(s => s.status === 'completed').length],
        ['Faturamento Total', totalRevenue],
        ['Custo Total', totalCost],
        ['Lucro Líquido', totalProfit],
        ['Margem Média %', totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0'],
        ['Valor Estoque (custo)', products.reduce((a, p) => a + p.costPrice * p.stock, 0)],
        ['Valor Estoque (venda)', products.reduce((a, p) => a + p.salePrice * p.stock, 0)],
        ['Data Exportação', new Date().toLocaleString('pt-BR')],
      ];
      const dashWs = XLSX.utils.aoa_to_sheet([dashHeaders, ...dashRows]);
      dashWs['!cols'] = [{ wch: 25 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, dashWs, 'Dashboard');

      // Sheet 8: Empréstimos
      if (loans.length) {
        const loanHeaders = ['ID', 'Nome', 'Telefone', 'Data Empréstimo', 'Vencimento', 'Valor Emprestado', 'Taxa (%)', 'Juros', 'Recebido', 'Situação', 'Observações', 'CreatedAt'];
        const loanRows = loans.map(l => [
          l.id, l.borrowerName, l.borrowerPhone || '', l.loanDate ? new Date(l.loanDate).toLocaleDateString('pt-BR') : '',
          l.dueDate ? new Date(l.dueDate).toLocaleDateString('pt-BR') : '', l.principal, l.interestRate ?? '', l.interest ?? 0, l.paidAmount ?? 0,
          l.status === 'paid' ? 'Pago' : 'Em aberto', l.notes || '', l.createdAt || ''
        ]);
        const loanWs = XLSX.utils.aoa_to_sheet([loanHeaders, ...loanRows]);
        loanWs['!cols'] = [{ wch: 14 }, { wch: 24 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 30 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(wb, loanWs, 'Empréstimos');
      }

      // Sheet 9: Ordens de Serviço
      if (orders.length) {
        const osHeaders = ['ID', 'Tipo', 'Número', 'Data', 'Cliente', 'Telefone', 'Endereço', 'Aparelho/Equipamento', 'Defeito', 'Subtotal', 'Desconto', 'Total', 'Status', 'Observações', 'Itens (JSON)', 'CreatedAt'];
        const osRows = orders.map(o => [
          o.id, o.type === 'orcamento' ? 'Orçamento' : 'OS', o.number,
          new Date(o.date).toLocaleDateString('pt-BR'), o.clientName, o.clientPhone || '', o.clientAddress || '',
          o.device || '', o.defect || '', o.subtotal, o.discount, o.total, o.status, o.notes || '',
          JSON.stringify(o.items || []), o.createdAt || ''
        ]);
        const osWs = XLSX.utils.aoa_to_sheet([osHeaders, ...osRows]);
        osWs['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 24 }, { wch: 16 }, { wch: 26 }, { wch: 24 }, { wch: 24 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 28 }, { wch: 40 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(wb, osWs, 'Ordens de Serviço');
      }

      // Sheet 10: Compras
      if (purchases.length) {
        const purHeaders = ['ID', 'Data', 'Fornecedor', 'Total', 'Observações', 'Itens (JSON)', 'CreatedAt'];
        const purRows = purchases.map(p => [
          p.id, new Date(p.date).toLocaleDateString('pt-BR'), p.supplierName || '', p.total, p.notes || '',
          JSON.stringify(p.items || []), p.createdAt || ''
        ]);
        const purWs = XLSX.utils.aoa_to_sheet([purHeaders, ...purRows]);
        purWs['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 24 }, { wch: 12 }, { wch: 30 }, { wch: 50 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(wb, purWs, 'Compras');
      }

      // Sheet 11: Clientes
      if (customers.length) {
        const cliHeaders = ['ID', 'Nome', 'Telefone', 'Email', 'Endereço', 'Observações', 'CreatedAt'];
        const cliRows = customers.map(c => [c.id, c.name, c.phone || '', c.email || '', c.address || '', c.notes || '', c.createdAt || '']);
        const cliWs = XLSX.utils.aoa_to_sheet([cliHeaders, ...cliRows]);
        cliWs['!cols'] = [{ wch: 14 }, { wch: 28 }, { wch: 16 }, { wch: 24 }, { wch: 28 }, { wch: 30 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(wb, cliWs, 'Clientes');
      }

      // Sheet 12: Fornecedores
      if (suppliers.length) {
        const supHeaders = ['ID', 'Nome', 'Telefone', 'Email', 'Observações', 'CreatedAt'];
        const supRows = suppliers.map(s => [s.id, s.name, s.phone || '', s.email || '', s.notes || '', s.createdAt || '']);
        const supWs = XLSX.utils.aoa_to_sheet([supHeaders, ...supRows]);
        supWs['!cols'] = [{ wch: 14 }, { wch: 28 }, { wch: 16 }, { wch: 24 }, { wch: 30 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(wb, supWs, 'Fornecedores');
      }

      // Sheet 13: Caixa (Fechamentos)
      if (cashSessions.length) {
        const cashHeaders = ['ID', 'Abertura', 'Fechamento', 'Saldo Inicial', 'Saldo Esperado', 'Saldo Final', 'Diferença', 'Status', 'Observações', 'Retiradas (JSON)'];
        const cashRows = cashSessions.map(c => [
          c.id, new Date(c.openDate).toLocaleDateString('pt-BR'), c.closeDate ? new Date(c.closeDate).toLocaleDateString('pt-BR') : '',
          c.openingBalance, c.expectedBalance ?? '', c.closingBalance ?? '', c.difference ?? '', c.status === 'closed' ? 'Fechado' : 'Aberto',
          c.notes || '', JSON.stringify(c.withdrawals || [])
        ]);
        const cashWs = XLSX.utils.aoa_to_sheet([cashHeaders, ...cashRows]);
        cashWs['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 28 }, { wch: 50 }];
        XLSX.utils.book_append_sheet(wb, cashWs, 'Caixa');
      }

      XLSX.writeFile(wb, `BaseCompleta_${dateStr}.xlsx`);
      setImportSuccessMsg('Base completa exportada com sucesso!');
      setTimeout(() => setImportSuccessMsg(null), 5000);
    } catch (err: any) {
      setImportError('Erro ao exportar base: ' + err.message);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();

      const prodHeaders = ['Código/SKU', 'Nome do Produto', 'Categoria', 'Preço de Custo', 'Preço de Venda', 'Estoque', 'Estoque Mínimo'];
      const prodSampleRows = [
        ['SKU-1001', 'Camiseta Masculina', 'Vestuário', '25.00', '59.90', '100', '10'],
        ['SKU-1002', 'Calça Jeans', 'Vestuário', '45.00', '119.90', '50', '5'],
        ['SKU-1003', 'Tênis Running', 'Calçados', '75.00', '189.90', '30', '3'],
        ['SKU-1004', 'Boné Aba Reta', 'Acessórios', '8.00', '29.90', '200', '20'],
        ['SKU-1005', 'Bolsa Couro', 'Acessórios', '35.00', '89.90', '40', '5'],
      ];
      const prodWs = XLSX.utils.aoa_to_sheet([prodHeaders, ...prodSampleRows]);
      XLSX.utils.book_append_sheet(wb, prodWs, 'Produtos');

      const salesHeaders = ['ID da Venda', 'Data', 'Hora', 'Cliente', 'Telefone', 'Forma de Pagamento', 'Tipo', 'Produto', 'QTD', 'Custo (R$)', 'Faturamento (R$)', 'Lucro (R$)', 'Status'];
      const salesSampleRows = [
        ['venda_001', '12/07/2026', '14:30', 'Maria Souza', '(11) 99999-1111', 'pix', 'CPF', 'Camiseta Masculina', 2, '50.00', '119.80', '69.80', 'Concluída'],
        ['venda_001', '12/07/2026', '14:30', 'Maria Souza', '(11) 99999-1111', 'pix', 'CPF', 'Boné Aba Reta', 1, '8.00', '29.90', '21.90', 'Concluída'],
        ['venda_002', '12/07/2026', '16:45', 'João Silva', '(11) 98888-2222', 'credito', 'CPF', 'Calça Jeans', 1, '45.00', '119.90', '74.90', 'Concluída'],
        ['venda_003', '13/07/2026', '10:00', 'Ana Costa', '(11) 97777-3333', 'dinheiro', 'CPF', 'Tênis Running', 1, '75.00', '189.90', '114.90', 'Concluída'],
        ['venda_003', '13/07/2026', '10:00', 'Ana Costa', '(11) 97777-3333', 'dinheiro', 'CPF', 'Bolsa Couro', 1, '35.00', '89.90', '54.90', 'Concluída'],
      ];
      const salesWs = XLSX.utils.aoa_to_sheet([salesHeaders, ...salesSampleRows]);
      XLSX.utils.book_append_sheet(wb, salesWs, 'Vendas');

      const catWs = XLSX.utils.aoa_to_sheet([['Nome da Categoria'], ['Vestuário'], ['Calçados'], ['Acessórios']]);
      XLSX.utils.book_append_sheet(wb, catWs, 'Categorias');

      const instrHeaders = ['Instruções de Preenchimento'];
      const instrRows = [
        [''],
        ['PLANILHA DE PRODUTOS (aba "Produtos")'],
        ['• Preencha todas as colunas conforme o modelo'],
        ['• Código/SKU: identificador único do produto (ex: SKU-001)'],
        ['• Nome do Produto: nome completo do produto'],
        ['• Categoria: agrupamento do produto (ex: Vestuário, Calçados)'],
        ['• Preço de Custo: valor que o produto custa (use ponto para decimal)'],
        ['• Preço de Venda: valor que o produto será vendido'],
        ['• Estoque: quantidade atual em estoque'],
        ['• Estoque Mínimo: quantidade mínima para alerta de estoque baixo'],
        [''],
        ['PLANILHA DE VENDAS (aba "Vendas") - um item por linha'],
        ['• ID da Venda: código único da venda (ex: venda_001); repita em todas as linhas dos itens da mesma venda'],
        ['• Data: formato DD/MM/AAAA'],
        ['• Hora: formato HH:MM'],
        ['• Cliente: nome do cliente (opcional)'],
        ['• Telefone: telefone do cliente (opcional)'],
        ['• Forma de Pagamento: pix, credito, debito, dinheiro, transferencia'],
        ['• Tipo: CPF ou CNPJ'],
        ['• Produto: nome exato do produto cadastrado'],
        ['• QTD: quantidade vendida desse produto'],
        ['• Custo (R$): custo total desse item (preço de custo x QTD)'],
        ['• Faturamento (R$): valor total recebido desse item (preço de venda x QTD)'],
        ['• Lucro (R$): Faturamento - Custo'],
        ['• Status: Concluída ou Cancelada'],
        [''],
        ['PLANILHA DE CATEGORIAS (aba "Categorias")'],
        ['• Nome da Categoria: nome de cada categoria (uma por linha)'],
        [''],
        ['DICA: Você pode apagar as linhas de exemplo e preencher com seus próprios dados.'],
        ['Ao importar, os dados substituirão todos os dados atuais.'],
      ];
      const instrWs = XLSX.utils.aoa_to_sheet([instrHeaders, ...instrRows]);
      XLSX.utils.book_append_sheet(wb, instrWs, 'Instruções');

      XLSX.writeFile(wb, 'Modelo_Importacao_GestaoPro.xlsx');
      setImportSuccessMsg('Modelo oficial baixado! Preencha os dados e importe pela opção "Carregar Planilha".');
      setTimeout(() => setImportSuccessMsg(null), 8000);
    } catch (err: any) {
      setImportError('Erro ao gerar modelo: ' + err.message);
    }
  };

  const handleResetClick = () => {
    if (window.confirm('Tem certeza que deseja ZERAR todo o banco de dados? Esta ação é irreversível.')) {
      onResetDatabase();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 md:h-6 md:w-6 text-slate-500" />
          Configurações
        </h1>
        <p className="text-sm text-slate-500 mt-1">Importe, exporte, faça backup e gerencie sua conta.</p>
      </div>

      {/* Store Profile */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Store className="h-5 w-5 text-indigo-600" />
            Perfil da Loja
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Informações que aparecem nos recibos e documentos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Nome da Loja</label>
            <input type="text" value={storeInfo.name} onChange={e => setStoreInfo({ ...storeInfo, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">CNPJ</label>
            <input type="text" value={storeInfo.cnpj} onChange={e => setStoreInfo({ ...storeInfo, cnpj: e.target.value })} placeholder="00.000.000/0000-00" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Telefone</label>
            <input type="text" value={storeInfo.phone} onChange={e => setStoreInfo({ ...storeInfo, phone: e.target.value })} placeholder="(00) 00000-0000" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">E-mail</label>
            <input type="email" value={storeInfo.email} onChange={e => setStoreInfo({ ...storeInfo, email: e.target.value })} placeholder="contato@zmstore.com.br" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Endereço</label>
            <input type="text" value={storeInfo.address} onChange={e => setStoreInfo({ ...storeInfo, address: e.target.value })} placeholder="Rua, número, bairro" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Cidade</label>
            <input type="text" value={storeInfo.city} onChange={e => setStoreInfo({ ...storeInfo, city: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Estado</label>
            <input type="text" value={storeInfo.state} onChange={e => setStoreInfo({ ...storeInfo, state: e.target.value })} placeholder="SP" maxLength={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Responsável</label>
            <input type="text" value={storeInfo.ownerName} onChange={e => setStoreInfo({ ...storeInfo, ownerName: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Observações (aparece no recibo)</label>
            <textarea value={storeInfo.notes} onChange={e => setStoreInfo({ ...storeInfo, notes: e.target.value })} rows={2} placeholder="Obrigado pela preferência!" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-none" />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Logo da Loja (aparece no site, recibos e OS)</label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setStoreInfo({ ...storeInfo, logoUrl: ev.target?.result as string });
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              {storeInfo.logoUrl && (
                <div className="flex items-center gap-2">
                  <img src={storeInfo.logoUrl} alt="Logo" className="w-12 h-12 rounded-lg object-contain border border-slate-200" />
                  <button
                    type="button"
                    onClick={() => setStoreInfo({ ...storeInfo, logoUrl: '' })}
                    className="text-rose-500 hover:text-rose-700 text-[10px] font-bold"
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Formatos aceitos: JPG, PNG, SVG. Tamanho recomendado: 200x200px.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleSaveStoreInfo} className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <Save className="h-3.5 w-3.5" />
            Salvar Perfil
          </button>
          {storeSaved && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Salvo!
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

        {/* Excel Import/Export */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                Planilhas Excel
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Importe ou exporte dados offline.</p>
            </div>

            {importSuccessMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100 text-xs flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{importSuccessMsg}</span>
              </div>
            )}

            {importError && (
              <div className="p-3 bg-rose-50 text-rose-800 rounded-lg border border-rose-100 text-xs flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{importError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Modelo Oficial</span>
                <p className="text-xs text-slate-500">Baixe o modelo com as colunas corretas.</p>
                <button onClick={handleDownloadTemplate} className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs">
                  <Download className="h-4 w-4" />
                  Baixar Modelo (.xlsx)
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Enviar Planilha</span>
                <input type="file" ref={excelInputRef} accept=".xlsx,.xls,.csv" onChange={handleImportExcelOrCsv} className="hidden" />
                <button onClick={() => excelInputRef.current?.click()} disabled={importingExcel} className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer">
                  {importingExcel ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Carregar Planilha (.xlsx, .csv)
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Exportar para Excel</span>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handleExportStockToExcel} className="py-2.5 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    Estoque
                  </button>
                  <button onClick={handleExportSalesToExcel} className="py-2.5 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    Vendas
                  </button>
                </div>
                <button onClick={handleExportFullDatabase} className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm">
                  <Download className="h-3.5 w-3.5" />
                  Exportar Base Completa (Tudo)
                </button>
              </div>
            </div>
          </div>

          {/* Local Backup */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-slate-500" />
                Backup Local (Troca de PC)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Baixe um arquivo .json com TODOS os dados (vendas, empréstimos, clientes, marketplace, fechamentos) e restaure em outro navegador/PC.</p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1.5">Exportar Backup</p>
                <button onClick={onExportBackup} className="w-full py-2 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer">
                  <Download className="h-3.5 w-3.5 text-slate-400" />
                  Baixar Backup Completo (.json)
                </button>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1.5">Restaurar Backup</p>
                <input type="file" ref={fileInputRef} accept=".json" onChange={handleImportDatabase} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="w-full py-2 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer">
                  <Upload className="h-3.5 w-3.5 text-slate-400" />
                  Carregar Backup (.json)
                </button>
              </div>
            </div>
          </div>

          {/* Sincronização na Nuvem */}
          <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm space-y-3">
            <div className="border-b border-indigo-100 pb-3">
              <h2 className="text-base font-bold text-indigo-700 flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Sincronização na Nuvem
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Seus dados ficam salvos no Firebase e acessíveis em qualquer dispositivo conectado.</p>
            </div>

            {!syncEnabled && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span><b>Sincronização desativada (modo local).</b> Nenhum dado está sendo enviado ou baixado da nuvem. Seus dados ficam salvos apenas neste aparelho/navegador.</span>
              </div>
            )}

            {cloudUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {cloudUser.photoURL ? (
                    <img src={cloudUser.photoURL} alt="" className="h-9 w-9 rounded-full" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-indigo-600" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{cloudUser.displayName || cloudUser.email}</p>
                    <p className="text-xs text-slate-400 truncate">{cloudUser.email}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  {cloudSyncing ? (
                    <span className="flex items-center gap-1.5 text-indigo-600">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sincronizando...
                    </span>
                  ) : cloudPending ? (
                    <span className="flex items-center gap-1.5 text-amber-600">
                      <Clock className="h-3.5 w-3.5" /> Alterações pendentes (envio automático)
                    </span>
                  ) : cloudLastSync ? (
                    <span>Última sincronização: {new Date(cloudLastSync).toLocaleString('pt-BR')}</span>
                  ) : (
                    <span>Não sincronizado ainda.</span>
                  )}
                </div>

                {cloudError && (
                  <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2">{cloudError}</p>
                )}

                {/* Uso da cota diária do Firestore */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                    <span>Operações hoje (Firebase)</span>
                    <span className={dailyWrites / dailyWriteLimit > 0.9 ? 'text-rose-600 font-bold' : ''}>
                      {dailyWrites.toLocaleString('pt-BR')} / {dailyWriteLimit.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        dailyWrites / dailyWriteLimit > 0.9 ? 'bg-rose-500'
                          : dailyWrites / dailyWriteLimit > 0.7 ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (dailyWrites / dailyWriteLimit) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    A sincronização é incremental (só o que muda), então o consumo é mínimo.
                  </p>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug">
                  A sincronização é <b>automática</b> e <b>incremental</b> (só o que muda). Toda alteração sobe para a nuvem em ~2s e cada aparelho baixa e mescla sozinho a cada 20s (e ao abrir/voltar à aba). Assim o celular e o computador ficam iguais. <b>Sincronizar Agora</b> força o envio imediato; <b>Baixar da Nuvem</b> substitui os dados deste aparelho pelos da nuvem.
                </p>

                <div className="flex gap-2">
                  <button onClick={onCloudSyncNow} disabled={!syncEnabled} className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                    <RefreshCcw className="h-3.5 w-3.5" /> Sincronizar Agora
                  </button>
                  <button onClick={onCloudSignOut} className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                    <LogOut className="h-3.5 w-3.5" /> Sair
                  </button>
                </div>

                <button onClick={onDownloadFromCloud} disabled={!syncEnabled} className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                  <CloudDownload className="h-3.5 w-3.5" /> Baixar da Nuvem (espelhar no celular)
                </button>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Baixa os dados salvos na nuvem (do computador) para ESTE aparelho. Use no celular depois de clicar <b>Sincronizar Agora</b> no computador, para deixar os dois iguais.
                </p>

                <button onClick={onRestoreBackup} disabled={restoringBackup} className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                  <RefreshCcw className="h-3.5 w-3.5" /> {restoringBackup ? 'Restaurando...' : 'Restaurar do Backup (corrigir estoque)'}
                </button>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Substitui produtos, categorias, vendas e despesas pelos dados limpos do backup embutido (BASE 2). Apenas local (a nuvem está desativada).
                </p>

                <button onClick={onClearCloud} disabled={clearingCloud} className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5" /> {clearingCloud ? 'Apagando...' : 'Limpar dados da nuvem'}
                </button>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Apaga TUDO da nuvem deste usuário. Use antes de reimportar um backup antigo para subir os dados corretos do zero.
                </p>
              </div>
            ) : (
              <button onClick={onCloudSignIn} className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                <Cloud className="h-3.5 w-3.5" /> Entrar com Google e Sincronizar
              </button>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-sm space-y-3">
            <div className="border-b border-rose-100 pb-3">
              <h2 className="text-base font-bold text-rose-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Zona de Perigo
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Exclusão permanente de dados.</p>
            </div>
            <button onClick={handleResetClick} className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 text-rose-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
              <RefreshCcw className="h-3.5 w-3.5" />
              Zerar Todo o Banco de Dados
            </button>
          </div>

      </div>
    </div>
  );
}
