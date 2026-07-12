import React, { useRef, useState, useEffect } from 'react';
import { Product, Sale, Category, SaleItem } from '../types';
import * as XLSX from 'xlsx';
import {
  Download,
  Upload,
  RefreshCcw,
  ShieldAlert,
  FileSpreadsheet,
  CheckCircle,
  Cloud,
  ExternalLink,
  FolderOpen,
  Loader2,
  Settings as SettingsIcon,
  Store,
  User,
  Save,
  CheckCircle2,
  HardDrive,
  AlertTriangle,
  Globe
} from 'lucide-react';
import {
  createSpreadsheet,
  uploadBackupFile,
  listUserSpreadsheets,
  fetchSpreadsheetValues,
  exportSpreadsheetAsArrayBuffer,
  GoogleDriveFile
} from '../lib/googleApi';

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
}

const defaultStoreInfo: StoreInfo = {
  name: 'ZM Store',
  cnpj: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  ownerName: '',
  notes: ''
};

function parseProductsSheet(rows: any[][]): { importedProducts: Product[]; categoriesFromProducts: string[] } {
  if (!rows || rows.length < 2) {
    throw new Error('A planilha de produtos está vazia ou não possui cabeçalho.');
  }

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
    const nonEmulatorCells = row.filter(cell => cell !== undefined && String(cell).trim() !== '');
    if (nonEmulatorCells.length === 0) continue;

    let name = '';
    if (nameIdx !== -1 && nameIdx < row.length && row[nameIdx] !== undefined) {
      name = String(row[nameIdx]).trim();
    }
    if (!name) {
      for (let col = 0; col < row.length; col++) {
        if (col !== codeIdx && row[col] !== undefined && String(row[col]).trim() !== '' && isNaN(Number(row[col]))) {
          name = String(row[col]).trim();
          break;
        }
      }
    }
    if (!name) continue;

    let code = '';
    if (codeIdx !== -1 && codeIdx < row.length && row[codeIdx] !== undefined) {
      code = String(row[codeIdx]).trim();
    }
    if (!code) code = `SKU-${1000 + i}`;

    let categoryName = 'Geral';
    if (categoryIdx !== -1 && categoryIdx < row.length && row[categoryIdx] !== undefined) {
      const rawCat = String(row[categoryIdx]).trim();
      if (rawCat) categoryName = rawCat;
    }
    if (categoryName && !categoriesFromProducts.some(c => c.toLowerCase() === categoryName.toLowerCase())) {
      categoriesFromProducts.push(categoryName);
    }

    importedProducts.push({
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${i}`,
      code,
      name,
      category: categoryName,
      costPrice: Math.max(0, getFloatVal(row, costPriceIdx)),
      salePrice: Math.max(0, getFloatVal(row, salePriceIdx)),
      stock: Math.max(0, getIntVal(row, stockIdx)),
      minStock: Math.max(0, getIntVal(row, minStockIdx)),
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
      profit: total - totalCost,
      status
    });
  }

  return sales;
}

interface SettingsProps {
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

export default function Settings({
  products,
  sales,
  categories,
  user,
  accessToken,
  onGoogleLogin,
  onGoogleLogout,
  onImportDatabase,
  onResetDatabase
}: SettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // Store profile
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(() => {
    const saved = localStorage.getItem('zm_store_info');
    return saved ? JSON.parse(saved) : defaultStoreInfo;
  });
  const [storeSaved, setStoreSaved] = useState(false);

  const handleSaveStoreInfo = () => {
    localStorage.setItem('zm_store_info', JSON.stringify(storeInfo));
    setStoreSaved(true);
    setTimeout(() => setStoreSaved(false), 3000);
  };

  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importingExcel, setImportingExcel] = useState(false);

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

  const handleExportStockToSheets = async () => {
    if (!accessToken) return;
    setExportingProducts(true);
    setGoogleSuccessMsg(null);
    try {
      const headers = ['Código/SKU', 'Nome do Produto', 'Categoria', 'Preço de Custo (R$)', 'Preço de Venda (R$)', 'Estoque', 'Estoque Mínimo'];
      const rows = products.map(p => [p.code, p.name, p.category, p.costPrice, p.salePrice, p.stock, p.minStock]);
      const result = await createSpreadsheet(accessToken, `GESTÃO.PRO - Estoque (${new Date().toLocaleDateString('pt-BR')})`, headers, rows);
      setLastExportedSheetUrl(result.webViewLink);
      setGoogleSuccessMsg('Estoque exportado com sucesso para o Google Sheets!');
    } catch (err: any) {
      setImportError(err.message || 'Falha ao exportar estoque.');
    } finally {
      setExportingProducts(false);
    }
  };

  const handleExportSalesToSheets = async () => {
    if (!accessToken) return;
    setExportingSales(true);
    setGoogleSuccessMsg(null);
    try {
      const headers = ['ID da Venda', 'Data', 'Cliente', 'Telefone', 'Forma de Pagamento', 'Produtos Vendidos', 'Custo Total (R$)', 'Faturamento (R$)', 'Lucro Líquido (R$)', 'Status'];
      const rows = sales.map(s => [
        s.id, new Date(s.date).toLocaleString('pt-BR'), s.clientName || 'Cliente Geral', s.clientPhone || '-',
        s.paymentMethod, s.items.map(item => `${item.productName} (${item.quantity}x)`).join(', '),
        s.totalCost, s.total, s.profit, s.status === 'completed' ? 'Concluída' : 'Cancelada'
      ]);
      const result = await createSpreadsheet(accessToken, `GESTÃO.PRO - Vendas (${new Date().toLocaleDateString('pt-BR')})`, headers, rows);
      setLastExportedSheetUrl(result.webViewLink);
      setGoogleSuccessMsg('Histórico de vendas exportado com sucesso para o Google Sheets!');
    } catch (err: any) {
      setImportError(err.message || 'Falha ao exportar vendas.');
    } finally {
      setExportingSales(false);
    }
  };

  const handleBackupToDrive = async () => {
    if (!accessToken) return;
    setUploadingBackup(true);
    setGoogleSuccessMsg(null);
    try {
      const backupData = { version: '1.0', exportedAt: new Date().toISOString(), categories, products, sales };
      const filename = `Backup_GestaoPro_${new Date().toISOString().substring(0, 10)}_${Math.random().toString(36).substring(2,6)}.json`;
      const result = await uploadBackupFile(accessToken, filename, backupData);
      setLastBackupUrl(result.webViewLink);
      setGoogleSuccessMsg(`Backup '${filename}' salvo com sucesso no Google Drive!`);
    } catch (err: any) {
      setImportError(err.message || 'Falha ao enviar backup para o Google Drive.');
    } finally {
      setUploadingBackup(false);
    }
  };

  const handleImportFromSheets = async () => {
    if (!accessToken || !selectedSpreadsheetId) return;
    setImportingFromSheet(true);
    setImportError(null);
    setGoogleSuccessMsg(null);
    try {
      const arrayBuffer = await exportSpreadsheetAsArrayBuffer(accessToken, selectedSpreadsheetId);
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      let importedProducts: Product[] = [];
      let importedCategories: Category[] = [...categories];
      let importedSales: Sale[] = [...sales];

      let productsSheetData: any[][] | null = null;
      let salesSheetData: any[][] | null = null;
      let categoriesSheetData: any[][] | null = null;
      let hasSalesSheet = false;

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (!jsonRows || jsonRows.length < 2) continue;

        const nameLower = sheetName.toLowerCase();
        const firstRow = jsonRows[0].map(h => String(h || '').trim().toLowerCase());

        const isProducts = nameLower.includes('prod') || nameLower.includes('estoq') || firstRow.includes('nome do produto') || firstRow.includes('preço de venda');
        const isSales = nameLower.includes('vend') || nameLower.includes('saída') || firstRow.includes('id da venda') || firstRow.includes('itens vendidos') || firstRow.includes('produtos vendidos');
        const isCategories = nameLower.includes('cat') || nameLower.includes('setor') || firstRow.includes('nome da categoria');

        if (isProducts && !productsSheetData) productsSheetData = jsonRows;
        else if (isSales && !salesSheetData) { salesSheetData = jsonRows; hasSalesSheet = true; }
        else if (isCategories && !categoriesSheetData) categoriesSheetData = jsonRows;
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

      onImportDatabase({
        products: importedProducts.length > 0 ? importedProducts : products,
        categories: importedCategories,
        sales: importedSales
      });

      let successMsg = 'Planilha do Google Drive importada com sucesso! ';
      if (importedProducts.length > 0) successMsg += `${importedProducts.length} produtos. `;
      if (hasSalesSheet) successMsg += `${importedSales.length} vendas. `;
      setGoogleSuccessMsg(successMsg);
      setImportError(null);
    } catch (err: any) {
      setImportError(err.message || 'Erro ao processar dados da planilha do Google Drive.');
    } finally {
      setImportingFromSheet(false);
    }
  };

  const handleExportDatabase = () => {
    const backupData = { version: '1.0', exportedAt: new Date().toISOString(), categories, products, sales };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Backup_GestaoPro_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.products && parsed.sales && parsed.categories) {
          onImportDatabase({ products: parsed.products, sales: parsed.sales, categories: parsed.categories });
          setImportSuccessMsg('Backup restaurado com sucesso!');
          setImportError(null);
          setTimeout(() => setImportSuccessMsg(null), 6000);
        } else {
          setImportError('Arquivo inválido. O backup precisa conter categorias, produtos e vendas.');
        }
      } catch {
        setImportError('Erro ao processar arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

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
        let hasSalesSheet = false;

        let productsSheetData: any[][] | null = null;
        let salesSheetData: any[][] | null = null;
        let categoriesSheetData: any[][] | null = null;

        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          const jsonRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (!jsonRows || jsonRows.length < 2) continue;

          const nameLower = sheetName.toLowerCase();
          const firstRow = jsonRows[0].map(h => String(h || '').trim().toLowerCase());

          const isProducts = nameLower.includes('prod') || nameLower.includes('estoq') || firstRow.includes('nome do produto') || firstRow.includes('preço de venda');
          const isSales = nameLower.includes('vend') || nameLower.includes('saída') || firstRow.includes('id da venda') || firstRow.includes('itens vendidos') || firstRow.includes('produtos vendidos');
          const isCategories = nameLower.includes('cat') || nameLower.includes('setor') || firstRow.includes('nome da categoria');

          if (isProducts && !productsSheetData) productsSheetData = jsonRows;
          else if (isSales && !salesSheetData) { salesSheetData = jsonRows; hasSalesSheet = true; }
          else if (isCategories && !categoriesSheetData) categoriesSheetData = jsonRows;
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

        onImportDatabase({
          products: importedProducts.length > 0 ? importedProducts : products,
          categories: importedCategories,
          sales: importedSales
        });

        let successMsg = 'Planilha importada com sucesso! ';
        if (importedProducts.length > 0) successMsg += `${importedProducts.length} produtos. `;
        if (hasSalesSheet) successMsg += `${importedSales.length} vendas. `;
        setImportSuccessMsg(successMsg);
        setImportError(null);
        setTimeout(() => setImportSuccessMsg(null), 6000);
      } catch (err: any) {
        setImportError(err.message || 'Erro ao processar o arquivo.');
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

  const handleExportStockToExcel = () => {
    try {
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

  const handleExportSalesToExcel = () => {
    try {
      const headers = ['ID da Venda', 'Data', 'Cliente', 'Telefone', 'Forma de Pagamento', 'Produtos Vendidos', 'Custo Total (R$)', 'Faturamento (R$)', 'Lucro Líquido (R$)', 'Status'];
      const rows = sales.map(s => [
        s.id, new Date(s.date).toLocaleString('pt-BR'), s.clientName || 'Cliente Geral', s.clientPhone || '-',
        s.paymentMethod, s.items.map(item => `${item.productName} (${item.quantity}x)`).join(', '),
        s.totalCost, s.total, s.profit, s.status === 'completed' ? 'Concluída' : 'Cancelada'
      ]);
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

  const handleDownloadTemplate = () => {
    try {
      const wb = XLSX.utils.book_new();

      const prodHeaders = ['Código/SKU', 'Nome do Produto', 'Categoria', 'Preço de Custo', 'Preço de Venda', 'Estoque', 'Estoque Mínimo'];
      const prodSampleRows = [
        ['SKU-1001', 'Camiseta Masculina', 'Vestuário', '25.00', '59.90', '100', '10'],
        ['SKU-1002', 'Calça Jeans', 'Vestuário', '45.00', '119.90', '50', '5'],
        ['SKU-1003', 'Tênis Running', 'Calçados', '75.00', '189.90', '30', '3'],
      ];
      const prodWs = XLSX.utils.aoa_to_sheet([prodHeaders, ...prodSampleRows]);
      XLSX.utils.book_append_sheet(wb, prodWs, 'Produtos');

      const salesHeaders = ['ID da Venda', 'Data', 'Cliente', 'Telefone', 'Forma de Pagamento', 'Itens Vendidos', 'Custo Total', 'Faturamento', 'Lucro Líquido', 'Status'];
      const salesSampleRows = [
        ['venda_1', '12/07/2026 14:30', 'Maria Souza', '(11) 99999-1111', 'pix', 'Camiseta Masculina (2x)', '50.00', '119.80', '69.80', 'Concluída'],
      ];
      const salesWs = XLSX.utils.aoa_to_sheet([salesHeaders, ...salesSampleRows]);
      XLSX.utils.book_append_sheet(wb, salesWs, 'Vendas');

      const catWs = XLSX.utils.aoa_to_sheet([['Nome da Categoria'], ['Vestuário'], ['Calçados']]);
      XLSX.utils.book_append_sheet(wb, catWs, 'Categorias');

      XLSX.writeFile(wb, 'Modelo_Importacao_GestaoPro.xlsx');
      setImportSuccessMsg('Modelo oficial baixado!');
      setTimeout(() => setImportSuccessMsg(null), 5000);
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
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-slate-500" />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: Excel & Local Backup */}
        <div className="space-y-6">

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

            {importError && !googleSuccessMsg && (
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
              </div>
            </div>
          </div>

          {/* Local Backup */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-slate-500" />
                Backup Local
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Exporte e restaure backups em JSON.</p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1.5">Exportar Backup</p>
                <button onClick={handleExportDatabase} className="w-full py-2 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer">
                  <Download className="h-3.5 w-3.5 text-slate-400" />
                  Baixar Backup JSON
                </button>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1.5">Restaurar Backup</p>
                <input type="file" ref={fileInputRef} accept=".json" onChange={handleImportDatabase} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="w-full py-2 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer">
                  <Upload className="h-3.5 w-3.5 text-slate-400" />
                  Carregar Backup JSON
                </button>
              </div>
            </div>
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

        {/* RIGHT: Cloud Sync & Account */}
        <div className="space-y-6">

          {/* Google Cloud Sync */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Cloud className="h-5 w-5 text-indigo-500" />
                Sincronização em Nuvem
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Exporte para Google Sheets e salve no Drive.</p>
            </div>

            {isInIframe && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-[10px] space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3 text-amber-600 shrink-0" />
                  Visualização em Iframe
                </p>
                <p className="leading-relaxed text-slate-600">
                  Cookies de login podem ser bloqueados. Abra em nova aba para login persistente.
                </p>
              </div>
            )}

            {googleSuccessMsg && (
              <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-lg text-[11px] font-semibold flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                  <span>{googleSuccessMsg}</span>
                </div>
                {lastExportedSheetUrl && (
                  <a href={lastExportedSheetUrl} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 hover:text-indigo-800 underline font-bold flex items-center gap-0.5">
                    <ExternalLink className="h-3 w-3" />
                    Abrir no Google Sheets
                  </a>
                )}
                {lastBackupUrl && (
                  <a href={lastBackupUrl} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 hover:text-indigo-800 underline font-bold flex items-center gap-0.5">
                    <FolderOpen className="h-3 w-3" />
                    Ver no Google Drive
                  </a>
                )}
              </div>
            )}

            {!user ? (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-center space-y-3">
                <p className="text-xs text-slate-500">Conecte sua conta Google para ativar integração com planilhas online.</p>
                <button onClick={onGoogleLogin} className="mx-auto flex items-center justify-center gap-2 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 py-2 px-4 rounded-lg shadow-xs transition-all text-xs font-bold cursor-pointer">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
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
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    {user.photoURL && (
                      <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full border" referrerPolicy="no-referrer" />
                    )}
                    <div className="min-w-0">
                      <p className="font-bold truncate text-slate-700">{user.displayName || 'Conectado'}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button onClick={onGoogleLogout} className="text-[10px] font-bold text-rose-600 hover:bg-rose-50 px-2 py-1 rounded border border-rose-200 transition-colors cursor-pointer shrink-0">
                    Desconectar
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button disabled={exportingProducts} onClick={handleExportStockToSheets} className="py-2 px-3 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors disabled:opacity-50 cursor-pointer">
                    {exportingProducts ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileSpreadsheet className="h-3 w-3" />}
                    Estoque → Sheets
                  </button>
                  <button disabled={exportingSales} onClick={handleExportSalesToSheets} className="py-2 px-3 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors disabled:opacity-50 cursor-pointer">
                    {exportingSales ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileSpreadsheet className="h-3 w-3" />}
                    Vendas → Sheets
                  </button>
                </div>

                <button disabled={uploadingBackup} onClick={handleBackupToDrive} className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer">
                  {uploadingBackup ? <Loader2 className="h-3 w-3 animate-spin" /> : <Cloud className="h-3 w-3" />}
                  Salvar Backup no Drive
                </button>

                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Importar do Google Drive</span>
                  {loadingSpreadsheets ? (
                    <div className="flex items-center gap-1 py-1 text-[11px] text-slate-500">
                      <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
                      <span>Buscando planilhas...</span>
                    </div>
                  ) : spreadsheets.length === 0 ? (
                    <p className="text-[10px] text-slate-400">Nenhuma planilha encontrada no Drive.</p>
                  ) : (
                    <div className="flex gap-2">
                      <select value={selectedSpreadsheetId} onChange={(e) => setSelectedSpreadsheetId(e.target.value)} className="flex-1 text-[11px] bg-white border border-slate-200 rounded-lg p-2 font-medium">
                        {spreadsheets.map((sheet) => (
                          <option key={sheet.id} value={sheet.id}>{sheet.name}</option>
                        ))}
                      </select>
                      <button disabled={importingFromSheet || !selectedSpreadsheetId} onClick={handleImportFromSheets} className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer">
                        {importingFromSheet ? <Loader2 className="h-3 w-3 animate-spin" /> : <Globe className="h-3 w-3" />}
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
