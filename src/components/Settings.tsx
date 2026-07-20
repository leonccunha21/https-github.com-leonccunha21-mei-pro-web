import React, { useRef, useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { Product, Sale, Category, SaleItem, StoreInfo, Expense, Loan, ServiceOrder, Customer, Supplier, Purchase, CashSession, AppUser, UserRole } from '../types';
import {
  stripAccents,
  parseProductsSheet,
  parseCategoriesSheet,
  parseLoansSheet,
  parseOrdersSheet,
  parsePurchasesSheet,
  parseCustomersSheet,
  parseSuppliersSheet,
  parseCashSheet,
  parseSalesSheet,
} from '../lib/sheetParsers';
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
  LogOut,
  Bell,
} from 'lucide-react';
import { getPrefs, savePrefs, requestPermission, sendNotification, NotificationPrefs } from '../lib/notifications';
import { getBackupSchedule, saveBackupSchedule, BackupSchedulePrefs } from '../lib/backupScheduler';

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
};

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
  onRunScheduledBackup: () => void;
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
  onClearCloud: () => void;
  clearingCloud: boolean;
  syncEnabled: boolean;
  appUsers: AppUser[];
  currentUserRole: UserRole;
  onAppUsersChange: (users: AppUser[]) => void;
  onCurrentUserRoleChange: (role: UserRole) => void;
}

import ExcelUploader from '../components/ExcelUploader';

function NotificationSettings() {
  const [prefs, setPrefs] = useState(getPrefs);
  const [perm, setPerm] = useState<'default' | 'granted' | 'denied' | 'unavailable'>('default');
  useEffect(() => {
    if (typeof Notification === 'undefined') setPerm('unavailable');
    else setPerm(Notification.permission as any);
  }, []);
  const toggle = (key: keyof NotificationPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    savePrefs(next);
  };
  const request = async () => {
    const ok = await requestPermission();
    setPerm(ok ? 'granted' : 'denied');
  };
  const test = () => sendNotification('Gestão.PRO', 'Notificação de teste funcionando! 🎉');
  const items = [
    { key: 'debtReminder' as const, label: 'Lembrete de Contas a Receber', desc: 'Notifica quando houver vendas pendentes' },
    { key: 'lowStockAlert' as const, label: 'Alerta de Estoque Baixo', desc: 'Notifica quando produtos estiverem abaixo do mínimo' },
    { key: 'dailySummary' as const, label: 'Resumo Diário', desc: 'Resumo das vendas e despesas do dia' },
  ];
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notificações
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Lembretes automáticos no navegador.</p>
      </div>
      <div className="space-y-4">
        {perm !== 'granted' && perm !== 'unavailable' && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-3">
            <span className="text-xs text-amber-800">Permissão de notificação necessária</span>
            <button onClick={request} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer">Permitir</button>
          </div>
        )}
        {perm === 'unavailable' && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500">
            Notificações não são suportadas neste navegador.
          </div>
        )}
        {items.map(item => (
          <div key={item.key} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">{item.label}</p>
              <p className="text-xs text-slate-400">{item.desc}</p>
            </div>
            <button
              onClick={() => toggle(item.key)}
              className={`w-10 h-6 rounded-full transition-colors cursor-pointer shrink-0 ml-3 ${prefs[item.key] ? 'bg-primary' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform mx-0.5 ${prefs[item.key] ? 'translate-x-4' : ''}`} />
            </button>
          </div>
        ))}
        {perm === 'granted' && (
          <button onClick={test} className="w-full py-2 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <Bell className="h-3.5 w-3.5" /> Testar Notificação
          </button>
        )}
      </div>
    </div>
  );
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
  onClearCloud,
  clearingCloud,
  syncEnabled,
  onRunScheduledBackup,
  appUsers,
  currentUserRole,
  onAppUsersChange,
  onCurrentUserRoleChange,
}: SettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showExcelUploader, setShowExcelUploader] = useState(false);
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

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('vendedor');

  const handleAddUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    const exists = appUsers.some(u => u.email.toLowerCase() === newUserEmail.trim().toLowerCase());
    if (exists) { alert('Este email já está cadastrado.'); return; }
    const newUser: AppUser = {
      uid: `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      createdAt: new Date().toISOString(),
    };
    onAppUsersChange([...appUsers, newUser]);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('vendedor');
  };

  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImportBackup(file);
    e.target.value = '';
  };

  const handleImportExcelOrCsv = () => {
    // Open the dedicated ExcelUploader modal directly.
    openExcelUploader();
  };

  // New handler to open ExcelUploader modal
  const openExcelUploader = () => setShowExcelUploader(true);
  const closeExcelUploader = () => setShowExcelUploader(false);

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
        const loanHeaders = ['ID', 'Nome', 'Telefone', 'Data Empréstimo', 'Vencimento', 'Valor Emprestado', 'Juros', 'Recebido', 'Situação', 'Observações', 'CreatedAt'];
        const loanRows = loans.map(l => [
          l.id, l.borrowerName, l.borrowerPhone || '', l.loanDate ? new Date(l.loanDate).toLocaleDateString('pt-BR') : '',
          l.dueDate ? new Date(l.dueDate).toLocaleDateString('pt-BR') : '', l.principal, l.interest ?? 0, l.paidAmount ?? 0,
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
        ['SKU-1001', 'Camiseta Masculina', 'Vestuário', 25, 59.9, 100, 10],
        ['SKU-1002', 'Calça Jeans', 'Vestuário', 45, 119.9, 50, 5],
        ['SKU-1003', 'Tênis Running', 'Calçados', 75, 189.9, 30, 3],
        ['SKU-1004', 'Boné Aba Reta', 'Acessórios', 8, 29.9, 200, 20],
        ['SKU-1005', 'Bolsa Couro', 'Acessórios', 35, 89.9, 40, 5],
      ];
      const prodWs = XLSX.utils.aoa_to_sheet([prodHeaders, ...prodSampleRows]);
      XLSX.utils.book_append_sheet(wb, prodWs, 'Produtos');

      const salesHeaders = ['ID da Venda', 'Data', 'Hora', 'Cliente', 'Telefone', 'Forma de Pagamento', 'Tipo', 'Produto', 'QTD', 'Custo (R$)', 'Faturamento (R$)', 'Lucro (R$)', 'Status', 'Canal'];
      const salesSampleRows = [
        ['venda_001', '12/07/2026', '14:30', 'Maria Souza', '(11) 99999-1111', 'pix', 'CPF', 'Camiseta Masculina', 2, 50, 119.8, 69.8, 'Concluída', 'Loja Física'],
        ['venda_001', '12/07/2026', '14:30', 'Maria Souza', '(11) 99999-1111', 'pix', 'CPF', 'Boné Aba Reta', 1, 8, 29.9, 21.9, 'Concluída', 'Loja Física'],
        ['venda_002', '12/07/2026', '16:45', 'João Silva', '(11) 98888-2222', 'credito', 'CPF', 'Calça Jeans', 1, 45, 119.9, 74.9, 'Concluída', 'Shopee'],
        ['venda_003', '13/07/2026', '10:00', 'Ana Costa', '(11) 97777-3333', 'dinheiro', 'CPF', 'Tênis Running', 1, 75, 189.9, 114.9, 'Concluída', 'Loja Física'],
        ['venda_003', '13/07/2026', '10:00', 'Ana Costa', '(11) 97777-3333', 'dinheiro', 'CPF', 'Bolsa Couro', 1, 35, 89.9, 54.9, 'Concluída', 'Loja Física'],
      ];
      const salesWs = XLSX.utils.aoa_to_sheet([salesHeaders, ...salesSampleRows]);
      XLSX.utils.book_append_sheet(wb, salesWs, 'Vendas');

      const catWs = XLSX.utils.aoa_to_sheet([['Nome da Categoria'], ['Vestuário'], ['Calçados'], ['Acessórios']]);
      XLSX.utils.book_append_sheet(wb, catWs, 'Categorias');

      const loanHeaders = ['ID', 'Nome', 'Telefone', 'Data Empréstimo', 'Vencimento', 'Valor Emprestado', 'Juros', 'Recebido', 'Situação', 'Observações'];
      const loanSampleRows = [
        ['emp_001', 'José Pereira', '(11) 95555-4444', '10/07/2026', '10/08/2026', 500, 50, 200, 'Aberto', 'Empréstimo pessoal'],
        ['emp_002', 'Carla Dias', '(11) 94444-3333', '05/07/2026', '05/09/2026', 1000, 100, 1000, 'Pago', 'Quitado'],
      ];
      const loanWs = XLSX.utils.aoa_to_sheet([loanHeaders, ...loanSampleRows]);
      XLSX.utils.book_append_sheet(wb, loanWs, 'Empréstimos');

      const customerHeaders = ['ID', 'Nome', 'Telefone', 'Email', 'Endereço', 'Observações'];
      const customerSampleRows = [
        ['cli_001', 'Maria Souza', '(11) 99999-1111', 'maria@email.com', 'Rua A, 123', 'Cliente frequente'],
        ['cli_002', 'João Silva', '(11) 98888-2222', 'joao@email.com', 'Rua B, 456', ''],
      ];
      const customerWs = XLSX.utils.aoa_to_sheet([customerHeaders, ...customerSampleRows]);
      XLSX.utils.book_append_sheet(wb, customerWs, 'Clientes');

      const supplierHeaders = ['ID', 'Nome', 'Telefone', 'Email', 'Observações'];
      const supplierSampleRows = [
        ['for_001', 'Distribuidora X', '(11) 97777-3333', 'contato@x.com', 'Fornecedor principal'],
        ['for_002', 'Atacado Y', '(11) 96666-5555', 'contato@y.com', ''],
      ];
      const supplierWs = XLSX.utils.aoa_to_sheet([supplierHeaders, ...supplierSampleRows]);
      XLSX.utils.book_append_sheet(wb, supplierWs, 'Fornecedores');

      const instrHeaders = ['Instruções de Preenchimento'];
      const instrRows = [
        [''],
        ['PLANILHA DE PRODUTOS (aba "Produtos")'],
        ['• Preencha todas as colunas conforme o modelo'],
        ['• Código/SKU: identificador único do produto (ex: SKU-001)'],
        ['• Nome do Produto: nome completo do produto'],
        ['• Categoria: agrupamento do produto (ex: Vestuário, Calçados)'],
        ['• COLUNAS NUMÉRICAS (Preço de Custo, Preço de Venda, Estoque, Estoque Mínimo):'],
        ['  - Use tipo NUMÉRICO (célula de número), NUNCA texto.'],
        ['  - Decimal com VÍRGULA (ex: 25,90). NÃO use PONTO (nem de milhar, nem decimal).'],
        ['  - Exemplo correto: 25,90  |  Incorreto: 25.90 ou "25,90" (texto)'],
        ['• Preço de Custo: valor que o produto custa'],
        ['• Preço de Venda: valor que o produto será vendido'],
        ['• Estoque: quantidade atual em estoque (somente números)'],
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
        ['• QTD: quantidade vendida (número inteiro, não texto)'],
        ['• Custo (R$), Faturamento (R$), Lucro (R$): valores numéricos, decimal com VÍRGULA, sem ponto'],
        ['• Custo (R$): custo total desse item (preço de custo x QTD)'],
        ['• Faturamento (R$): valor total recebido desse item (preço de venda x QTD)'],
        ['• Lucro (R$): Faturamento - Custo'],
        ['• Status: Concluída ou Cancelada'],
        ['• Canal: opcional — Loja Física, Shopee, Mercado Livre, TikTok, etc. (um por venda)'],
        [''],
        ['PLANILHA DE CATEGORIAS (aba "Categorias")'],
        ['• Nome da Categoria: nome de cada categoria (uma por linha)'],
        [''],
        ['PLANILHA DE EMPRÉSTIMOS (aba "Empréstimos")'],
        ['• ID: código do empréstimo (ex: emp_001)'],
        ['• Nome / Telefone: do devedor'],
        ['• Data Empréstimo / Vencimento: formato DD/MM/AAAA'],
        ['• Valor Emprestado: principal; Juros: acréscimo; Recebido: quanto já foi pago'],
        ['• Situação: Aberto ou Pago'],
        [''],
        ['PLANILHA DE CLIENTES (aba "Clientes")'],
        ['• ID / Nome: obrigatórios; Telefone, Email, Endereço e Observações opcionais'],
        [''],
        ['PLANILHA DE FORNECEDORES (aba "Fornecedores")'],
        ['• ID / Nome: obrigatórios; Telefone, Email e Observações opcionais'],
        [''],
        ['DICA: Você pode apagar as linhas de exemplo e preencher com seus próprios dados.'],
        ['Ao importar, os dados substituirão todos os dados atuais. Use sua conta Google — sem login, nada é exibido.'],
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

      {/* Excel Uploader Modal */}
      {showExcelUploader && (
        <ExcelUploader
          isOpen={showExcelUploader}
          onClose={closeExcelUploader}
          onImport={(data) => {
            onImportDatabase(data);
            setImportSuccessMsg('Dados importados com sucesso!');
            setTimeout(() => setImportSuccessMsg(null), 5000);
          }}
        />
      )}

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
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Chave PIX</label>
            <input type="text" value={storeInfo.pixKey || ''} onChange={e => setStoreInfo({ ...storeInfo, pixKey: e.target.value })} placeholder="CPF, CNPJ, email, celular ou chave aleatória" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
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
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Cor Primária (tema)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={storeInfo.primaryColor || '#4f46e5'}
                onChange={e => setStoreInfo({ ...storeInfo, primaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 font-mono">{storeInfo.primaryColor || '#4f46e5'}</span>
            </div>
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
                <button onClick={handleImportExcelOrCsv} disabled={importingExcel} className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer">
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

          {/* Backup Automático */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-500" />
                Backup Automático
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Agende backups automáticos para não perder dados.</p>
            </div>
            <BackupScheduler onRunNow={onRunScheduledBackup} />
          </div>

          <NotificationSettings />

          {/* Sincronização na Nuvem */}
          <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm space-y-3">
            <div className="border-b border-indigo-100 pb-3">
              <h2 className="text-base font-bold text-indigo-700 flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Sincronização na Nuvem
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Seus dados ficam salvos no Firebase e acessíveis em qualquer dispositivo conectado.</p>
            </div>
            {/* Sync button */}
            <button onClick={onCloudSyncNow} className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              disabled={!cloudUser || cloudSyncing}
            >
              {cloudSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sincronizar agora'}
            </button>

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

          {/* Usuários */}
          {currentUserRole === 'admin' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                  Usuários
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Gerencie os usuários e suas permissões.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Nome"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-400"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-400"
                />
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as UserRole)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-400"
                >
                  <option value="admin">Admin</option>
                  <option value="gerente">Gerente</option>
                  <option value="vendedor">Vendedor</option>
                </select>
                <button onClick={handleAddUser} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0">
                  Adicionar
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {appUsers.map(user => (
                  <div key={user.uid} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-700 truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <select
                        value={user.role}
                        onChange={e => {
                          const updated = appUsers.map(u => u.uid === user.uid ? { ...u, role: e.target.value as UserRole } : u);
                          onAppUsersChange(updated);
                        }}
                        className="text-xs border border-slate-200 rounded px-1 py-0.5"
                      >
                        <option value="admin">Admin</option>
                        <option value="gerente">Gerente</option>
                        <option value="vendedor">Vendedor</option>
                      </select>
                      <button
                        onClick={() => {
                          if (window.confirm(`Remover usuário ${user.name}?`)) {
                            onAppUsersChange(appUsers.filter(u => u.uid !== user.uid));
                          }
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {appUsers.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">Nenhum usuário cadastrado.</p>
                )}
              </div>
            </div>
          )}

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

function BackupScheduler({ onRunNow }: { onRunNow: () => void }) {
  const [prefs, setPrefs] = useState(getBackupSchedule);
  const update = (patch: Partial<BackupSchedulePrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    saveBackupSchedule(next);
  };
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase mb-1.5">Frequência</p>
        <div className="flex gap-2">
          {(['never', 'daily', 'weekly'] as const).map((f) => (
            <button key={f} onClick={() => update({ frequency: f })}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${prefs.frequency === f ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
              {f === 'never' ? 'Desligado' : f === 'daily' ? 'Diário' : 'Semanal'}
            </button>
          ))}
        </div>
      </div>
      {prefs.frequency !== 'never' && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase mb-1.5">Horário</p>
          <select value={prefs.hour} onChange={(e) => update({ hour: Number(e.target.value) })}
            className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg bg-white">
            {hours.map((h) => (
              <option key={h} value={h}>{h.toString().padStart(2, '0')}:00</option>
            ))}
          </select>
        </div>
      )}
      {prefs.lastBackup && (
        <p className="text-xs text-slate-400">Último backup: {new Date(prefs.lastBackup).toLocaleString('pt-BR')}</p>
      )}
      <button onClick={() => { onRunNow(); update({ lastBackup: new Date().toISOString() }); }}
        className="w-full py-2 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer">
        <Download className="h-3.5 w-3.5 text-slate-400" /> Executar backup agora
      </button>
    </div>
  );
}
