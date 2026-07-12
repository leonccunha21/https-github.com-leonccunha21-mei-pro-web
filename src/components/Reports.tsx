import React, { useRef, useState, useEffect } from 'react';
import { Product, Sale, Category } from '../types';
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
  Loader2
} from 'lucide-react';
import { 
  createSpreadsheet, 
  uploadBackupFile, 
  listUserSpreadsheets, 
  fetchSpreadsheetValues,
  GoogleDriveFile
} from '../lib/googleApi';

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
  const [importSuccess, setImportSuccess] = useState(false);
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
    sale.items.forEach(item => {
      // Find category of original product
      const origProduct = products.find(p => p.id === item.productId);
      const catName = origProduct ? origProduct.category : 'Outros';

      if (!categoryStats[catName]) {
        categoryStats[catName] = { revenue: 0, cost: 0, profit: 0, itemsSold: 0 };
      }

      categoryStats[catName].itemsSold += item.quantity;
      categoryStats[catName].revenue += item.total;
      categoryStats[catName].cost += item.costPrice * item.quantity;
      categoryStats[catName].profit += (item.total - (item.costPrice * item.quantity));
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
      const headers = ['ID da Venda', 'Data', 'Cliente', 'Telefone', 'Forma de Pagamento', 'Custo Total (R$)', 'Faturamento (R$)', 'Lucro Líquido (R$)', 'Status'];
      const rows = sales.map(s => [
        s.id,
        new Date(s.date).toLocaleString('pt-BR'),
        s.clientName || 'Cliente Geral',
        s.clientPhone || '-',
        s.paymentMethod,
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

  // Import products from select spreadsheet
  const handleImportFromSheets = async () => {
    if (!accessToken || !selectedSpreadsheetId) return;
    setImportingFromSheet(true);
    setImportError(null);
    setGoogleSuccessMsg(null);
    try {
      // Fetch entire active sheet values (A1 to G500 range)
      const rows = await fetchSpreadsheetValues(accessToken, selectedSpreadsheetId, 'Sheet1!A1:G500');
      if (!rows || rows.length < 2) {
        throw new Error('A planilha selecionada está vazia ou não possui cabeçalho na "Sheet1".');
      }

      const importedProducts: Product[] = [];
      const newCategories = [...categories];

      // Parse starts at 1 to skip headers row
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0 || !row[1]) continue; // Skip empty rows or unnamed products

        const categoryName = row[2] ? String(row[2]).trim() : 'Geral';
        
        // Auto-create category if missing
        if (categoryName && !newCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase())) {
          newCategories.push({
            id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: categoryName
          });
        }

        importedProducts.push({
          id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${i}`,
          code: row[0] ? String(row[0]).trim() : `SKU-${Date.now()}-${i}`,
          name: String(row[1]).trim(),
          category: categoryName,
          costPrice: Math.max(0, parseFloat(String(row[3]).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0),
          salePrice: Math.max(0, parseFloat(String(row[4]).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0),
          stock: Math.max(0, parseInt(row[5]) || 0),
          minStock: Math.max(0, parseInt(row[6]) || 0),
          createdAt: new Date().toISOString()
        });
      }

      if (importedProducts.length === 0) {
        throw new Error('Nenhum produto válido encontrado. Certifique-se que o Nome esteja na coluna B e as colunas correspondam.');
      }

      onImportDatabase({
        products: importedProducts,
        categories: newCategories,
        sales: sales
      });

      setImportSuccess(true);
      setGoogleSuccessMsg(`Importação realizada! ${importedProducts.length} produtos carregados com sucesso.`);
      setTimeout(() => setImportSuccess(false), 5000);
    } catch (err: any) {
      setImportError(err.message || 'Erro ao processar dados da planilha.');
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
          setImportSuccess(true);
          setImportError(null);
          setTimeout(() => setImportSuccess(false), 4000);
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
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to dynamic rows
        const jsonRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (!jsonRows || jsonRows.length < 2) {
          throw new Error('O arquivo selecionado está vazio ou não possui uma linha de cabeçalho.');
        }

        const importedProducts: Product[] = [];
        const newCategories = [...categories];

        // Read and sanitize headers
        const headerRow = jsonRows[0].map((h: any) => String(h || '').trim().toLowerCase());
        
        // Helper to find column index matching keywords
        const findColIndex = (keywords: string[]) => {
          return headerRow.findIndex(h => keywords.some(keyword => h.includes(keyword)));
        };

        // Auto-detect columns
        let codeIdx = findColIndex(['código', 'codigo', 'sku', 'ref', 'id', 'referencia']);
        let nameIdx = findColIndex(['nome', 'produto', 'descrição', 'descricao', 'item', 'name']);
        let categoryIdx = findColIndex(['categoria', 'grupo', 'setor', 'tipo', 'category']);
        let costPriceIdx = findColIndex(['custo', 'preço custo', 'preco custo', 'compra', 'cost']);
        let salePriceIdx = findColIndex(['venda', 'preço venda', 'preco venda', 'valor', 'price']);
        let stockIdx = findColIndex(['estoque', 'qtd', 'quantidade', 'stock', 'saldo', 'atual']);
        let minStockIdx = findColIndex(['mínimo', 'minimo', 'estoque mínimo', 'estoque minimo', 'min']);

        // Safe fallback defaults based on standard templates
        if (codeIdx === -1) codeIdx = 0;
        if (nameIdx === -1) nameIdx = 1;
        if (categoryIdx === -1) categoryIdx = 2;
        if (costPriceIdx === -1) costPriceIdx = 3;
        if (salePriceIdx === -1) salePriceIdx = 4;
        if (stockIdx === -1) stockIdx = 5;
        if (minStockIdx === -1) minStockIdx = 6;

        // Iterate rows skipping header row at index 0
        for (let i = 1; i < jsonRows.length; i++) {
          const row = jsonRows[i];
          if (!row || row.length === 0) continue;
          
          const rawName = row[nameIdx];
          if (rawName === undefined || String(rawName).trim() === '') continue; // skip nameless rows
          
          const name = String(rawName).trim();
          const code = row[codeIdx] !== undefined ? String(row[codeIdx]).trim() : `SKU-${Date.now()}-${i}`;
          const categoryName = row[categoryIdx] !== undefined ? String(row[categoryIdx]).trim() : 'Geral';
          
          // Safe price parsing
          const costPriceRaw = row[costPriceIdx] !== undefined ? String(row[costPriceIdx]) : '0';
          const salePriceRaw = row[salePriceIdx] !== undefined ? String(row[salePriceIdx]) : '0';
          const stockRaw = row[stockIdx] !== undefined ? String(row[stockIdx]) : '0';
          const minStockRaw = row[minStockIdx] !== undefined ? String(row[minStockIdx]) : '0';

          const costPrice = Math.max(0, parseFloat(costPriceRaw.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0);
          const salePrice = Math.max(0, parseFloat(salePriceRaw.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0);
          
          // Integer parsing
          const stock = Math.max(0, parseInt(stockRaw.replace(/[^0-9]/g, ''), 10) || 0);
          const minStock = Math.max(0, parseInt(minStockRaw.replace(/[^0-9]/g, ''), 10) || 0);

          // Add category if not existing
          if (categoryName && !newCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase())) {
            newCategories.push({
              id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              name: categoryName
            });
          }

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

        if (importedProducts.length === 0) {
          throw new Error('Nenhum produto válido foi extraído da planilha. Certifique-se de que os dados estão estruturados com uma linha de cabeçalho.');
        }

        // Apply changes
        onImportDatabase({
          products: importedProducts,
          categories: newCategories,
          sales: sales
        });

        setImportSuccess(true);
        setGoogleSuccessMsg(`Planilha extraída! ${importedProducts.length} produtos importados com sucesso.`);
        setTimeout(() => setImportSuccess(false), 5000);
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
        
        {/* Category breakdown reports chart */}
        <div id="reports-categories-card" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-7">
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

        {/* Database Maintenance and Cloud Workspace integration */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Google Workspace Cloud Integrations Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Cloud className="h-5 w-5 text-indigo-600" />
                  Nuvem & Google Workspace
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Sincronização Firestore, Google Drive e Google Sheets.</p>
              </div>
              {user && (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Conectado
                </span>
              )}
            </div>

            {/* Google success notifications */}
            {googleSuccessMsg && (
              <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-lg text-xs font-semibold flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>{googleSuccessMsg}</span>
                </div>
                {lastExportedSheetUrl && (
                  <a 
                    href={lastExportedSheetUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 underline font-bold flex items-center gap-1 mt-0.5"
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
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 underline font-bold flex items-center gap-1 mt-0.5"
                  >
                    <FolderOpen className="h-3 w-3" />
                    Ver Backup no Google Drive
                  </a>
                )}
              </div>
            )}

            {!user ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center space-y-3.5">
                <div className="mx-auto w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                  <CloudLightning className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800">Sincronização em Nuvem Desativada</h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">Conecte sua conta do Google para ativar o banco de dados Firebase na nuvem e habilitar exportações automáticas para Planilhas e Drive.</p>
                </div>

                {/* Google styled button */}
                <button
                  onClick={onGoogleLogin}
                  className="mx-auto flex items-center justify-center gap-2.5 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 py-2 px-4 rounded-lg shadow-xs transition-all text-xs font-bold cursor-pointer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" width="16" height="16">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Entrar com o Google
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full border border-slate-200" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.displayName?.[0] || 'G'}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-800">{user.displayName || 'Minha Loja'}</p>
                      <p className="text-[10px] text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={onGoogleLogout}
                    className="py-1 px-2.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                  >
                    Desconectar
                  </button>
                </div>

                {/* Spreadsheet Export blocks */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Integração com Google Sheets</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled={exportingProducts}
                      onClick={handleExportStockToSheets}
                      className="py-2.5 px-3 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {exportingProducts ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                      )}
                      Exportar Estoque
                    </button>

                    <button
                      disabled={exportingSales}
                      onClick={handleExportSalesToSheets}
                      className="py-2.5 px-3 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {exportingSales ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                      )}
                      Exportar Vendas
                    </button>
                  </div>
                </div>

                {/* Drive Backups block */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Google Drive Cloud Backups</span>
                  <button
                    disabled={uploadingBackup}
                    onClick={handleBackupToDrive}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {uploadingBackup ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Cloud className="h-3.5 w-3.5 text-indigo-400" />
                    )}
                    Salvar Backup no Google Drive
                  </button>
                  <p className="text-[10px] text-slate-400">Envia um arquivo JSON criptografado e seguro com o estado completo de dados da sua loja para sua nuvem pessoal.</p>
                </div>

                {/* Google Sheet Import block */}
                <div className="space-y-2.5 border-t border-slate-100 pt-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Importar Estoque do Google Sheets</span>
                  {loadingSpreadsheets ? (
                    <div className="flex items-center gap-2 py-2 text-xs text-slate-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                      <span>Buscando planilhas no Google Drive...</span>
                    </div>
                  ) : spreadsheets.length === 0 ? (
                    <p className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded border border-dashed">Nenhuma planilha compatível encontrada no seu Google Drive. Crie ou carregue planilhas para importar produtos.</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-500">Selecione uma planilha no seu Google Drive para carregar produtos automaticamente na sua loja.</p>
                      <div className="flex gap-2">
                        <select
                          value={selectedSpreadsheetId}
                          onChange={(e) => setSelectedSpreadsheetId(e.target.value)}
                          className="flex-1 text-xs bg-white border border-slate-200 rounded-lg p-2 font-medium"
                        >
                          {spreadsheets.map((sheet) => (
                            <option key={sheet.id} value={sheet.id}>
                              {sheet.name} ({new Date(sheet.modifiedTime).toLocaleDateString()})
                            </option>
                          ))}
                        </select>
                        <button
                          disabled={importingFromSheet || !selectedSpreadsheetId}
                          onClick={handleImportFromSheets}
                          className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {importingFromSheet ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Upload className="h-3.5 w-3.5" />
                          )}
                          Importar
                        </button>
                      </div>
                      <p className="text-[10px] text-indigo-600 font-semibold bg-indigo-50/50 p-2 rounded border border-indigo-100/40">💡 Para que a importação funcione, sua planilha deve conter colunas na Sheet1: A:Código/SKU, B:Nome, C:Categoria, D:Custo, E:Venda, F:Estoque, G:Estoque Mínimo. (O cabeçalho deve estar na linha 1).</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Local Backups & Danger Zone Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">Backup Local & Zona de Perigo</h2>
              <p className="text-xs text-slate-400 mt-0.5">Operações manuais de arquivos offline e exclusão.</p>
            </div>

            {/* Feedback triggers for local backups */}
            {importSuccess && !googleSuccessMsg && (
              <div id="import-success-box" className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100 text-xs flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Backup local restaurado com sucesso!</span>
              </div>
            )}

            {importError && !googleSuccessMsg && (
              <div id="import-error-box" className="p-3 bg-rose-50 text-rose-800 rounded-lg border border-rose-100 text-xs flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{importError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Local Export */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Exportar Dados Offline</p>
                <button
                  id="export-db-btn"
                  onClick={handleExportDatabase}
                  className="w-full py-2.5 px-4 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-slate-500" />
                  Baixar Backup JSON (.json)
                </button>
                <p className="text-[10px] text-slate-400 mt-1">Gera um arquivo offline para arquivamento no seu computador local.</p>
              </div>

              {/* Local Import */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Restaurar Dados Offline</p>
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
                  className="w-full py-2.5 px-4 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="h-3.5 w-3.5 text-slate-500" />
                  Carregar Backup JSON (.json)
                </button>
                <p className="text-[10px] text-slate-400 mt-1">Substitui o estado atual do sistema com os dados de um arquivo local.</p>
              </div>

              {/* Excel / CSV Import */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-bold text-indigo-600 uppercase mb-2 flex items-center gap-1.5">
                  <FileSpreadsheet className="h-4 w-4" />
                  Extrair de Planilha (Excel / CSV)
                </p>
                <input
                  type="file"
                  ref={excelInputRef}
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImportExcelOrCsv}
                  className="hidden"
                />
                <button
                  id="import-excel-trigger"
                  onClick={() => excelInputRef.current?.click()}
                  disabled={importingExcel}
                  className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {importingExcel ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  Extrair e Carregar Planilha (.xlsx, .csv)
                </button>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  💡 Carregue qualquer arquivo <strong>.xlsx, .xls ou .csv</strong>. O importador inteligente detectará automaticamente as colunas de SKU, Nome, Categoria, Preço de Custo, Preço de Venda, Estoque e Estoque Mínimo.
                </p>
              </div>

              <hr className="border-slate-100 my-4" />

              {/* Danger Zone */}
              <div className="space-y-2 bg-rose-50/20 p-3 rounded-lg border border-rose-100/40">
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Zona de Perigo</span>
                <p className="text-[10px] text-slate-500">Exclusão permanente e redefinição de dados.</p>
                
                <button
                  id="reset-db-btn"
                  onClick={handleResetClick}
                  className="w-full py-2 px-3 bg-white hover:bg-rose-50 border border-rose-200 hover:border-rose-300 text-rose-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all mt-2 cursor-pointer"
                >
                  <RefreshCcw className="h-3 w-3" />
                  Zerar Todo o Banco de Dados
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
