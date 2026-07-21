import React, { useState, useMemo } from 'react';
import { InternetUser, InternetPayment } from '../types';
import {
  Users,
  Wifi,
  DollarSign,
  Calendar,
  Plus,
  Trash2,
  Search,
  X,
  Check,
  Clock,
  UserCheck,
  UserX,
  Phone,
  FileText,
  Receipt,
  CreditCard,
  ChevronDown,
  ChevronUp,
  MessageCircle,
} from 'lucide-react';

interface InternetSharingProps {
  internetUsers: InternetUser[];
  onSaveInternetUsers: (users: InternetUser[]) => void;
}

const PAYMENT_METHODS = ['PIX', 'Dinheiro', 'Cartão', 'Transferência', 'Boleto'];

export default function InternetSharing({ internetUsers, onSaveInternetUsers }: InternetSharingProps) {
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<InternetUser | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState<InternetUser | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('active');

  const [formData, setFormData] = useState({
    userName: '',
    contact: '',
    serviceStartDate: new Date().toISOString().slice(0, 10),
    monthlyFee: '',
    notes: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'PIX',
    referenceMonth: new Date().toISOString().slice(0, 7),
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const openNewForm = () => {
    setEditUser(null);
    setFormData({
      userName: '',
      contact: '',
      serviceStartDate: new Date().toISOString().slice(0, 10),
      monthlyFee: '',
      notes: '',
    });
    setShowForm(true);
  };

  const openEditForm = (user: InternetUser) => {
    setEditUser(user);
    setFormData({
      userName: user.userName,
      contact: user.contact || '',
      serviceStartDate: user.serviceStartDate.slice(0, 10),
      monthlyFee: user.monthlyFee.toString(),
      notes: user.notes || '',
    });
    setShowForm(true);
  };

  const handleSaveUser = () => {
    const name = formData.userName.trim();
    const fee = parseFloat(formData.monthlyFee.replace(',', '.'));
    if (!name || !fee || fee <= 0) return;

    const now = new Date().toISOString();
    if (editUser) {
      onSaveInternetUsers(internetUsers.map(u =>
        u.id === editUser.id
          ? {
              ...u,
              userName: name,
              contact: formData.contact || undefined,
              serviceStartDate: formData.serviceStartDate,
              monthlyFee: fee,
              notes: formData.notes || undefined,
              updatedAt: now,
            }
          : u
      ));
    } else {
      const newUser: InternetUser = {
        id: `inet_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        userName: name,
        contact: formData.contact || undefined,
        serviceStartDate: formData.serviceStartDate,
        monthlyFee: fee,
        status: 'active',
        payments: [],
        notes: formData.notes || undefined,
        createdAt: now,
        updatedAt: now,
      };
      onSaveInternetUsers([newUser, ...internetUsers]);
    }
    setShowForm(false);
    setEditUser(null);
  };

  const handleDeleteUser = (id: string) => {
    if (!window.confirm('Remover este usuário permanentemente?')) return;
    onSaveInternetUsers(internetUsers.filter(u => u.id !== id));
  };

  const handleToggleStatus = (user: InternetUser) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    onSaveInternetUsers(internetUsers.map(u =>
      u.id === user.id
        ? { ...u, status: newStatus as 'active' | 'inactive', updatedAt: new Date().toISOString() }
        : u
    ));
  };

  const openPaymentForm = (user: InternetUser) => {
    setShowPaymentForm(user);
    setPaymentForm({
      amount: user.monthlyFee.toString(),
      paymentMethod: 'PIX',
      referenceMonth: new Date().toISOString().slice(0, 7),
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    });
  };

  const handleSavePayment = () => {
    if (!showPaymentForm) return;
    const amount = parseFloat(paymentForm.amount.replace(',', '.'));
    if (!amount || amount <= 0) return;

    const now = new Date().toISOString();
    const newPayment: InternetPayment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      date: paymentForm.date,
      amount,
      paymentMethod: paymentForm.paymentMethod,
      referenceMonth: paymentForm.referenceMonth,
      notes: paymentForm.notes || undefined,
    };

    onSaveInternetUsers(internetUsers.map(u =>
      u.id === showPaymentForm.id
        ? { ...u, payments: [newPayment, ...u.payments], updatedAt: now }
        : u
    ));
    setShowPaymentForm(null);
  };

  const handleDeletePayment = (userId: string, paymentId: string) => {
    if (!window.confirm('Remover este pagamento?')) return;
    onSaveInternetUsers(internetUsers.map(u =>
      u.id === userId
        ? { ...u, payments: u.payments.filter(p => p.id !== paymentId), updatedAt: new Date().toISOString() }
        : u
    ));
  };

  const filtered = useMemo(() => {
    return internetUsers.filter(u => {
      if (filterStatus === 'active' && u.status !== 'active') return false;
      if (filterStatus === 'inactive' && u.status !== 'inactive') return false;
      if (search) {
        const q = search.toLowerCase();
        if (!u.userName.toLowerCase().includes(q) && !(u.contact || '').toLowerCase().includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [internetUsers, filterStatus, search]);

  const stats = useMemo(() => {
    const active = internetUsers.filter(u => u.status === 'active');
    const totalReceived = internetUsers.reduce((a, u) => a + u.payments.reduce((s, p) => s + p.amount, 0), 0);
    const pendingCount = active.filter(u => {
      const lastPayment = u.payments.sort((a, b) => b.referenceMonth.localeCompare(a.referenceMonth))[0];
      if (!lastPayment) return true;
      return lastPayment.referenceMonth < new Date().toISOString().slice(0, 7);
    }).length;
    const monthlyTotal = active.reduce((a, u) => a + u.monthlyFee, 0);

    return {
      activeCount: active.length,
      totalUsers: internetUsers.length,
      totalReceived,
      pendingCount,
      monthlyTotal,
    };
  }, [internetUsers]);

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const getLastPaymentMonth = (user: InternetUser): string | null => {
    if (user.payments.length === 0) return null;
    return user.payments.sort((a, b) => b.referenceMonth.localeCompare(a.referenceMonth))[0].referenceMonth;
  };

  const buildWhatsAppMessage = (user: InternetUser) => {
    const firstName = user.userName.split(' ')[0] || user.userName;
    const lastPayment = user.payments.sort((a, b) => b.referenceMonth.localeCompare(a.referenceMonth))[0];
    const overdue = user.status === 'active' && (!lastPayment || lastPayment.referenceMonth < new Date().toISOString().slice(0, 7));
    const head = `Olá ${firstName}, tudo bem?`;
    const lastPaymentInfo = lastPayment
      ? ` Seu último pagamento foi em ${getMonthLabel(lastPayment.referenceMonth)}.`
      : '';
    const body = overdue
      ? `Passando para lembrar que a mensalidade da internet de ${formatCurrency(user.monthlyFee)} referente ao mês atual está pendente.${lastPaymentInfo}`
      : `Passando para lembrar que a mensalidade da internet de ${formatCurrency(user.monthlyFee)} vence em breve. Se possível, realize o pagamento para manter o serviço ativo.`;
    return `${head}\n${body}\nQualquer dúvida, estou à disposição. Obrigado!`;
  };

  const openWhatsApp = (user: InternetUser) => {
    let phone = (user.contact || '').replace(/\D/g, '');
    if (phone && !phone.startsWith('55')) phone = '55' + phone;
    const text = encodeURIComponent(buildWhatsAppMessage(user));
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const getMonthLabel = (monthStr: string) => {
    const [y, m] = monthStr.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${months[parseInt(m) - 1]}/${y}`;
  };

  const getStatusBadge = (user: InternetUser) => {
    if (user.status !== 'active') return { label: 'Inativo', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: UserX };
    const lastMonth = getLastPaymentMonth(user);
    if (!lastMonth || lastMonth < new Date().toISOString().slice(0, 7)) {
      return { label: 'Pendente', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock };
    }
    return { label: 'Em Dia', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: UserCheck };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Wifi className="h-5 w-5 md:h-6 md:w-6 text-slate-500" />
            Internet Compartilhada
          </h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie usuários, pagamentos e controle financeiro da internet compartilhada.</p>
        </div>
        <button
          onClick={openNewForm}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Novo Usuário
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ativos</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600"><Wifi className="h-4 w-4" /></div>
          </div>
          <span className="text-lg font-bold text-slate-900">{stats.activeCount}</span>
          <p className="text-xs text-slate-500">de {stats.totalUsers} total</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mensalidade</span>
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600"><DollarSign className="h-4 w-4" /></div>
          </div>
          <span className="text-lg font-bold text-blue-600">{formatCurrency(stats.monthlyTotal)}</span>
          <p className="text-xs text-slate-500">faturamento mensal</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pendentes</span>
            <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Clock className="h-4 w-4" /></div>
          </div>
          <span className="text-lg font-bold text-amber-600">{stats.pendingCount}</span>
          <p className="text-xs text-slate-500">usuários a pagar</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Recebido</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600"><CreditCard className="h-4 w-4" /></div>
          </div>
          <span className="text-lg font-bold text-emerald-600">{formatCurrency(stats.totalReceived)}</span>
          <p className="text-xs text-slate-500">histórico</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou contato..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-all"
          />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/40">
          {(['active', 'all', 'inactive'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setFilterStatus(opt)}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap ${
                filterStatus === opt
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {opt === 'active' ? 'Ativos' : opt === 'all' ? 'Todos' : 'Inativos'}
            </button>
          ))}
        </div>
      </div>

      {/* User List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <Wifi className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">Nenhum usuário encontrado</h3>
            <p className="text-xs text-slate-400 mt-1">
              {search ? 'Tente outro termo de busca.' : 'Clique em "Novo Usuário" para adicionar.'}
            </p>
          </div>
        ) : (
          filtered.map(user => {
            const badge = getStatusBadge(user);
            const StatusIcon = badge.icon;
            const isExpanded = expandedUser === user.id;
            const totalPaid = user.payments.reduce((a, p) => a + p.amount, 0);

            return (
              <div
                key={user.id}
                className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                  user.status === 'active' ? 'border-slate-200' : 'border-slate-200/60 opacity-75'
                }`}
              >
                {/* User Header */}
                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0 ${
                      user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {user.userName[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm">{user.userName}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${badge.color}`}>
                          <StatusIcon className="h-3 w-3" /> {badge.label}
                        </span>
                      </div>
                      {user.contact && (
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {user.contact}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Desde {formatDate(user.serviceStartDate)} · R$ {user.monthlyFee.toFixed(2)}/mês
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => user.status === 'active' && openPaymentForm(user)}
                      disabled={user.status !== 'active'}
                      className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Registrar Pagamento"
                    >
                      <DollarSign className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditForm(user)}
                      className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        user.status === 'active'
                          ? 'hover:bg-rose-50 text-rose-500'
                          : 'hover:bg-emerald-50 text-emerald-500'
                      }`}
                      title={user.status === 'active' ? 'Desativar' : 'Ativar'}
                    >
                      {user.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => openWhatsApp(user)}
                      className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors cursor-pointer"
                      title="Enviar WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                      className="p-2 hover:bg-slate-100 text-slate-400 rounded-lg transition-colors cursor-pointer"
                      title={isExpanded ? 'Recolher' : 'Expandir'}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded: Payment History */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Receipt className="h-3.5 w-3.5" /> Histórico de Pagamentos
                        </h4>
                        <span className="text-xs font-semibold text-slate-600">
                          Total: <span className="text-emerald-600 font-mono">{formatCurrency(totalPaid)}</span>
                        </span>
                      </div>
                      {user.payments.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">Nenhum pagamento registrado.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                                <th className="py-2 px-3">Data</th>
                                <th className="py-2 px-3">Mês Ref.</th>
                                <th className="py-2 px-3">Valor</th>
                                <th className="py-2 px-3">Método</th>
                                <th className="py-2 px-3">Obs</th>
                                <th className="py-2 px-3 text-center">Ação</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {user.payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(payment => (
                                <tr key={payment.id} className="hover:bg-slate-100/50">
                                  <td className="py-2 px-3 text-slate-700">{formatDate(payment.date)}</td>
                                  <td className="py-2 px-3">
                                    <span className="font-semibold text-slate-600">{getMonthLabel(payment.referenceMonth)}</span>
                                  </td>
                                  <td className="py-2 px-3 font-mono font-semibold text-emerald-600">{formatCurrency(payment.amount)}</td>
                                  <td className="py-2 px-3">
                                    <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-sm">
                                      {payment.paymentMethod}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-slate-400 max-w-[120px] truncate">{payment.notes || '-'}</td>
                                  <td className="py-2 px-3 text-center">
                                    <button
                                      onClick={() => handleDeletePayment(user.id, payment.id)}
                                      className="p-1 hover:bg-rose-50 text-rose-400 rounded transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Wifi className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {editUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h2>
              </div>
              <button
                onClick={() => { setShowForm(false); setEditUser(null); }}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nome do Usuário *</label>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={e => setFormData(f => ({ ...f, userName: e.target.value }))}
                  placeholder="Nome completo"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Contato</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={e => setFormData(f => ({ ...f, contact: e.target.value }))}
                  placeholder="Telefone ou e-mail"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Data de Início *</label>
                  <input
                    type="date"
                    value={formData.serviceStartDate}
                    onChange={e => setFormData(f => ({ ...f, serviceStartDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Valor Mensal (R$) *</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.monthlyFee}
                    onChange={e => setFormData(f => ({ ...f, monthlyFee: e.target.value }))}
                    placeholder="0,00"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-all font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Observações</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Observações opcionais..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-all resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
              <button
                onClick={() => { setShowForm(false); setEditUser(null); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUser}
                disabled={!formData.userName.trim() || !formData.monthlyFee || parseFloat(formData.monthlyFee.replace(',', '.')) <= 0}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {editUser ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Pagamento: {showPaymentForm.userName}
                </h2>
              </div>
              <button
                onClick={() => setShowPaymentForm(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500">
                  Mensalidade: <span className="font-bold text-slate-800 font-mono">{formatCurrency(showPaymentForm.monthlyFee)}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Total pago: <span className="font-bold text-emerald-600 font-mono">{formatCurrency(showPaymentForm.payments.reduce((a, p) => a + p.amount, 0))}</span>
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Valor (R$) *</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0,00"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-all font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Data do Pagamento</label>
                  <input
                    type="date"
                    value={paymentForm.date}
                    onChange={e => setPaymentForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Mês de Referência</label>
                  <input
                    type="month"
                    value={paymentForm.referenceMonth}
                    onChange={e => setPaymentForm(f => ({ ...f, referenceMonth: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Forma de Pagamento</label>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map(m => (
                    <button
                      key={m}
                      onClick={() => setPaymentForm(f => ({ ...f, paymentMethod: m }))}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        paymentForm.paymentMethod === m
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Observações</label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Opcional"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-all"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPaymentForm(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePayment}
                disabled={!paymentForm.amount || parseFloat(paymentForm.amount.replace(',', '.')) <= 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Check className="h-4 w-4" /> Registrar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
