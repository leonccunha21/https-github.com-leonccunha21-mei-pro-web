import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ServiceOrder, OsItem, Product, StoreInfo } from '../types';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Trash2,
  X,
  Printer,
  ClipboardList,
  CheckCircle2
} from 'lucide-react';
import { loadUserOrders, saveUserOrder, deleteUserOrder } from '../lib/dbSync';

interface OsOrcamentoProps {
  products: Product[];
  storeInfo: StoreInfo;
  userId?: string | null;
}

const generateId = () => `os_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
const getNextNumber = (orders: ServiceOrder[]) => {
  const max = orders.reduce((m, o) => Math.max(m, o.number), 0);
  return max + 1;
};

const statusLabels: Record<string, { label: string; color: string }> = {
  aberta: { label: 'Aberta', color: 'bg-blue-100 text-blue-700' },
  em_andamento: { label: 'Em Andamento', color: 'bg-amber-100 text-amber-700' },
  concluida: { label: 'Concluída', color: 'bg-emerald-100 text-emerald-700' },
  cancelada: { label: 'Cancelada', color: 'bg-rose-100 text-rose-700' },
  aprovada: { label: 'Aprovada', color: 'bg-emerald-100 text-emerald-700' },
  rejeitada: { label: 'Rejeitada', color: 'bg-rose-100 text-rose-700' }
};

export default function OsOrcamento({ products, storeInfo, userId }: OsOrcamentoProps) {
  const [orders, setOrders] = useState<ServiceOrder[]>(() => {
    try {
      const saved = localStorage.getItem('zm_service_orders');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const loadedFromCloud = useRef(false);
  const [activeView, setActiveView] = useState<'list' | 'form' | 'detail'>('list');
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'os' | 'orcamento'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formType, setFormType] = useState<'os' | 'orcamento'>('os');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [device, setDevice] = useState('');
  const [defect, setDefect] = useState('');
  const [formItems, setFormItems] = useState<OsItem[]>([]);
  const [formDiscount, setFormDiscount] = useState(0);
  const [formNotes, setFormNotes] = useState('');
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);

  // Item form
  const [itemDesc, setItemDesc] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState(0);

  // Load from cloud on mount
  useEffect(() => {
    if (!userId || loadedFromCloud.current) return;
    loadedFromCloud.current = true;
    loadUserOrders(userId).then(cloudOrders => {
      if (cloudOrders.length > 0) {
        setOrders(cloudOrders);
        localStorage.setItem('zm_service_orders', JSON.stringify(cloudOrders));
      } else {
        // Cloud empty, upload local data
        const localOrders = orders;
        if (localOrders.length > 0) {
          for (const o of localOrders) {
            saveUserOrder(userId, o).catch(() => {});
          }
        }
      }
    }).catch(() => {});
  }, [userId]);

  // Warn before leaving form with unsaved data
  useEffect(() => {
    if (activeView !== 'form') return;
    const hasData = clientName.trim() || formItems.length > 0;
    if (!hasData) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [activeView, clientName, formItems]);

  const saveOrders = (newOrders: ServiceOrder[]) => {
    setOrders(newOrders);
    localStorage.setItem('zm_service_orders', JSON.stringify(newOrders));
    if (userId) {
      // Sync last changed order to cloud
      // For full sync we save all in background
      for (const o of newOrders) {
        saveUserOrder(userId, o).catch(() => {});
      }
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (filterType !== 'all' && o.type !== filterType) return false;
      if (filterStatus !== 'all' && o.status !== filterStatus) return false;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        return o.clientName.toLowerCase().includes(s) || o.number.toString().includes(s) || (o.device || '').toLowerCase().includes(s);
      }
      return true;
    }).sort((a, b) => b.number - a.number);
  }, [orders, filterType, filterStatus, searchTerm]);

  const resetForm = () => {
    setClientName('');
    setClientPhone('');
    setClientAddress('');
    setDevice('');
    setDefect('');
    setFormItems([]);
    setFormDiscount(0);
    setFormNotes('');
    setEditingItemIdx(null);
  };

  const handleAddItem = () => {
    if (!itemDesc.trim()) return;
    const newItem: OsItem = {
      id: generateId(),
      description: itemDesc.trim(),
      quantity: itemQty,
      unitPrice: itemPrice,
      total: itemQty * itemPrice
    };
    setFormItems([...formItems, newItem]);
    setItemDesc('');
    setItemQty(1);
    setItemPrice(0);
  };

  const handleRemoveItem = (idx: number) => {
    setFormItems(formItems.filter((_, i) => i !== idx));
  };

  const handleSubmit = (status: 'aberta' | 'aprovada' = 'aberta') => {
    if (!clientName.trim() || formItems.length === 0) return;
    const subtotal = formItems.reduce((s, i) => s + i.total, 0);
    const discountAmount = (subtotal * formDiscount) / 100;
    const total = Math.max(0, subtotal - discountAmount);

    const order: ServiceOrder = {
      id: generateId(),
      type: formType,
      number: getNextNumber(orders),
      date: new Date().toISOString(),
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientAddress: clientAddress.trim() || undefined,
      device: device.trim() || undefined,
      defect: defect.trim() || undefined,
      items: formItems,
      subtotal,
      discount: formDiscount,
      total,
      status,
      notes: formNotes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    saveOrders([order, ...orders]);
    resetForm();
    setActiveView('list');
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o);
    saveOrders(updated);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus as any });
    }
  };

  const handleDelete = (orderId: string) => {
    if (window.confirm('Excluir esta ordem/orçamento?')) {
      saveOrders(orders.filter(o => o.id !== orderId));
      if (userId) deleteUserOrder(userId, orderId).catch(() => {});
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
        setActiveView('list');
      }
    }
  };

  const handlePrint = (order: ServiceOrder) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const store: StoreInfo = storeInfo || { name: '', cnpj: '', phone: '', email: '', address: '', city: '', state: '', ownerName: '', notes: '', logoUrl: '' };
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding:6px;border-bottom:1px solid #eee">${item.description}</td>
        <td style="padding:6px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
        <td style="padding:6px;border-bottom:1px solid #eee;text-align:right">R$ ${item.unitPrice.toFixed(2)}</td>
        <td style="padding:6px;border-bottom:1px solid #eee;text-align:right">R$ ${item.total.toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html><head><title>${order.type === 'os' ? 'OS' : 'Orçamento'} #${order.number}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 13px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
        .header h1 { margin: 0; font-size: 18px; }
        .header p { margin: 2px 0; font-size: 11px; color: #666; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px; }
        .info-item { font-size: 12px; }
        .info-item span { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th { background: #f5f5f5; padding: 6px; text-align: left; font-size: 11px; border-bottom: 2px solid #ddd; }
        .totals { text-align: right; margin-top: 15px; }
        .totals p { margin: 3px 0; font-size: 12px; }
        .totals .total-final { font-size: 16px; font-weight: bold; border-top: 2px solid #333; padding-top: 5px; }
        .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
        .signature { margin-top: 40px; display: flex; justify-content: space-between; }
        .signature div { width: 45%; border-top: 1px solid #333; text-align: center; padding-top: 5px; font-size: 11px; }
        @media print { body { padding: 10px; } }
      </style></head><body>
      <div class="header">
        ${store.logoUrl ? `<div style="margin-bottom:10px"><img src="${store.logoUrl}" alt="Logo" style="max-width:100px;max-height:100px;margin:0 auto;display:block" /></div>` : ''}
        <h1>${store.name || 'ZM Store'}</h1>
        ${store.cnpj ? `<p>CNPJ: ${store.cnpj}</p>` : ''}
        ${store.phone ? `<p>Tel: ${store.phone}</p>` : ''}
        ${store.address ? `<p>${store.address} - ${store.city || ''}/${store.state || ''}</p>` : ''}
      </div>
      <div style="text-align:center;margin-bottom:15px">
        <h2 style="margin:0;font-size:16px">${order.type === 'os' ? 'ORDEM DE SERVIÇO' : 'ORÇAMENTO'} Nº ${order.number}</h2>
        <p style="font-size:11px;color:#666">Data: ${new Date(order.date).toLocaleDateString('pt-BR')} ${new Date(order.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
      <div class="info-grid">
        <div class="info-item"><span>Cliente:</span> ${order.clientName}</div>
        <div class="info-item"><span>Telefone:</span> ${order.clientPhone || '-'}</div>
        ${order.clientAddress ? `<div class="info-item"><span>Endereço:</span> ${order.clientAddress}</div>` : ''}
        ${order.device ? `<div class="info-item"><span>Aparelho:</span> ${order.device}</div>` : ''}
        ${order.defect ? `<div class="info-item" style="grid-column:span 2"><span>Defeito/Descrição:</span> ${order.defect}</div>` : ''}
      </div>
      <table>
        <thead><tr><th>Descrição</th><th style="text-align:center">Qtd</th><th style="text-align:right">Valor Un.</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div class="totals">
        <p>Subtotal: R$ ${order.subtotal.toFixed(2)}</p>
        ${order.discount > 0 ? `<p>Desconto (${order.discount}%): -R$ ${(order.subtotal * order.discount / 100).toFixed(2)}</p>` : ''}
        <p class="total-final">TOTAL: R$ ${order.total.toFixed(2)}</p>
      </div>
      ${order.notes ? `<p style="margin-top:15px;font-size:12px"><strong>Obs:</strong> ${order.notes}</p>` : ''}
      <div class="signature">
        <div>Assinatura do Cliente</div>
        <div>Assinatura do Responsável</div>
      </div>
      <div class="footer">
        <p>${store.name || 'ZM Store'} - ${store.phone || ''}</p>
        ${store.notes ? `<p>${store.notes}</p>` : ''}
      </div>
      <script>window.onload=function(){window.print();}</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  // LIST VIEW
  if (activeView === 'list') {
    return (
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-slate-500" />
              OS & Orçamentos
            </h1>
            <p className="text-sm text-slate-500 mt-1">Ordens de serviço e orçamentos para clientes.</p>
          </div>
          <button onClick={() => { resetForm(); setActiveView('form'); }} className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs">
            <Plus className="h-4 w-4" />
            Nova OS / Orçamento
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por cliente, nº ou aparelho..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-400" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium bg-white">
            <option value="all">Todos</option>
            <option value="os">Ordens de Serviço</option>
            <option value="orcamento">Orçamentos</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium bg-white">
            <option value="all">Todos Status</option>
            <option value="aberta">Aberta</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluida">Concluída</option>
            <option value="aprovada">Aprovada</option>
            <option value="rejeitada">Rejeitada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200">
            <ClipboardList className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium">Nenhuma OS ou orçamento encontrado.</p>
            <p className="text-xs mt-1">Clique em "Nova OS / Orçamento" para começar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map(order => {
              const st = statusLabels[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-600' };
              return (
                <div key={order.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-indigo-600 uppercase">
                          {order.type === 'os' ? 'OS' : 'ORC'} Nº {order.number}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${st.color}`}>
                          {st.label}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(order.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 mt-1">{order.clientName}</p>
                      <p className="text-xs text-slate-500">
                        {order.clientPhone && `${order.clientPhone} • `}
                        {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                        {order.device && ` • ${order.device}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold font-mono text-slate-900">
                        R$ {order.total.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <button onClick={() => { setSelectedOrder(order); setActiveView('detail'); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer" title="Ver detalhes">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handlePrint(order)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer" title="Imprimir">
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(order.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer" title="Excluir">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // FORM VIEW
  if (activeView === 'form') {
    const subtotal = formItems.reduce((s, i) => s + i.total, 0);
    const discountAmount = (subtotal * formDiscount) / 100;
    const total = Math.max(0, subtotal - discountAmount);

    return (
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Nova {formType === 'os' ? 'Ordem de Serviço' : 'Orçamento'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Preencha os dados do cliente e adicione itens.</p>
          </div>
          <button onClick={() => setActiveView('list')} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Type selector */}
            <div className="flex gap-2">
              <button onClick={() => setFormType('os')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${formType === 'os' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
                <FileText className="h-4 w-4 inline mr-1" />
                Ordem de Serviço
              </button>
              <button onClick={() => setFormType('orcamento')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${formType === 'orcamento' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
                <ClipboardList className="h-4 w-4 inline mr-1" />
                Orçamento
              </button>
            </div>

            {/* Client info */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dados do Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nome *</label>
                  <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Telefone</label>
                  <input type="text" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-400" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Endereço</label>
                  <input type="text" value={clientAddress} onChange={e => setClientAddress(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-400" />
                </div>
              </div>
            </div>

            {/* Device / Defect (for OS) */}
            {formType === 'os' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aparelho / Defeito</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Aparelho</label>
                    <input type="text" value={device} onChange={e => setDevice(e.target.value)} placeholder="Ex: iPhone 14, Notebook Dell..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Defeito / Descrição</label>
                    <input type="text" value={defect} onChange={e => setDefect(e.target.value)} placeholder="Ex: Tela quebrada, não liga..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Itens / Serviços</h3>
              
              <div className="flex gap-2 flex-col md:flex-row">
                <input type="text" value={itemDesc} onChange={e => setItemDesc(e.target.value)} placeholder="Descrição do item/serviço" className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-400" />
                <input type="number" value={itemQty} onChange={e => setItemQty(Number(e.target.value))} min={1} className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-400 text-center" />
                <input type="number" value={itemPrice} onChange={e => setItemPrice(Number(e.target.value))} min={0} step={0.01} placeholder="R$" className="w-28 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-400 text-right" />
                <button onClick={handleAddItem} className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {formItems.length > 0 ? (
                <div className="space-y-2">
                  {formItems.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-xs text-slate-400 font-mono w-5">{idx + 1}</span>
                      <span className="flex-1 text-xs font-medium text-slate-800 truncate">{item.description}</span>
                      <span className="text-xs text-slate-500 font-mono">{item.quantity}x</span>
                      <span className="text-xs text-slate-500 font-mono">R$ {item.unitPrice.toFixed(2)}</span>
                      <span className="text-xs font-bold text-slate-900 font-mono">R$ {item.total.toFixed(2)}</span>
                      <button onClick={() => handleRemoveItem(idx)} className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">Adicione itens ou serviços acima.</p>
              )}
            </div>
          </div>

          {/* RIGHT: Summary */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 sticky top-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resumo</h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-mono font-medium">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Desconto (%)</span>
                  <input type="number" value={formDiscount} onChange={e => setFormDiscount(Number(e.target.value))} min={0} max={100} className="w-16 px-2 py-1 border border-slate-200 rounded text-xs text-right font-mono focus:outline-none focus:border-indigo-400" />
                </div>
                {formDiscount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Desconto</span>
                    <span className="font-mono">-R$ {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-lg font-mono text-slate-900">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Observações</label>
                <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-400 resize-none" />
              </div>

              <div className="space-y-2">
                <button onClick={() => handleSubmit('aberta')} disabled={!clientName.trim() || formItems.length === 0} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer">
                  Salvar {formType === 'os' ? 'OS' : 'Orçamento'}
                </button>
                <button onClick={() => handleSubmit('aprovada')} disabled={!clientName.trim() || formItems.length === 0} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer">
                  Salvar como Aprovado
                </button>
              </div>
            </div>
          </div>
        </div>

        <button onClick={() => setActiveView('list')} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
          ← Voltar para lista
        </button>
      </div>
    );
  }

  // DETAIL VIEW
  if (activeView === 'detail' && selectedOrder) {
    const order = selectedOrder;
    const st = statusLabels[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-600' };

    return (
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {order.type === 'os' ? 'OS' : 'Orçamento'} Nº {order.number}
              </h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${st.color}`}>{st.label}</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Criado em {new Date(order.date).toLocaleDateString('pt-BR')} às {new Date(order.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handlePrint(order)} className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
              <Printer className="h-3.5 w-3.5" /> Imprimir
            </button>
            <button onClick={() => setActiveView('list')} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Status actions */}
        <div className="flex gap-2 flex-wrap">
          {order.status === 'aberta' && (
            <>
              <button onClick={() => handleStatusChange(order.id, 'em_andamento')} className="py-1.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer">Em Andamento</button>
              <button onClick={() => handleStatusChange(order.id, 'concluida')} className="py-1.5 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer">Concluir</button>
              <button onClick={() => handleStatusChange(order.id, 'cancelada')} className="py-1.5 px-3 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer">Cancelar</button>
            </>
          )}
          {order.status === 'em_andamento' && (
            <>
              <button onClick={() => handleStatusChange(order.id, 'concluida')} className="py-1.5 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer">Concluir</button>
              <button onClick={() => handleStatusChange(order.id, 'cancelada')} className="py-1.5 px-3 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer">Cancelar</button>
            </>
          )}
          {order.type === 'orcamento' && order.status === 'aberta' && (
            <>
              <button onClick={() => handleStatusChange(order.id, 'aprovada')} className="py-1.5 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer">Aprovar</button>
              <button onClick={() => handleStatusChange(order.id, 'rejeitada')} className="py-1.5 px-3 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer">Rejeitar</button>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Dados do Cliente</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-400">Nome:</span> <span className="font-medium">{order.clientName}</span></div>
                <div><span className="text-slate-400">Telefone:</span> <span className="font-medium">{order.clientPhone || '-'}</span></div>
                {order.clientAddress && <div className="col-span-2"><span className="text-slate-400">Endereço:</span> <span className="font-medium">{order.clientAddress}</span></div>}
                {order.device && <div><span className="text-slate-400">Aparelho:</span> <span className="font-medium">{order.device}</span></div>}
                {order.defect && <div className="col-span-2"><span className="text-slate-400">Defeito:</span> <span className="font-medium">{order.defect}</span></div>}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Itens</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase">
                    <th className="pb-2 text-left">Descrição</th>
                    <th className="pb-2 text-center">Qtd</th>
                    <th className="pb-2 text-right">Valor Un.</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map(item => (
                    <tr key={item.id}>
                      <td className="py-2 font-medium">{item.description}</td>
                      <td className="py-2 text-center font-mono">{item.quantity}</td>
                      <td className="py-2 text-right font-mono">R$ {item.unitPrice.toFixed(2)}</td>
                      <td className="py-2 text-right font-mono font-bold">R$ {item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 sticky top-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Valores</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-mono">R$ {order.subtotal.toFixed(2)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-rose-600"><span>Desconto ({order.discount}%)</span><span className="font-mono">-R$ {(order.subtotal * order.discount / 100).toFixed(2)}</span></div>}
              <div className="flex justify-between pt-2 border-t border-slate-200"><span className="font-bold text-slate-900">Total</span><span className="font-bold text-lg font-mono">R$ {order.total.toFixed(2)}</span></div>
            </div>
            {order.notes && <p className="text-xs text-slate-500 mt-2"><strong>Obs:</strong> {order.notes}</p>}
          </div>
        </div>

        <button onClick={() => setActiveView('list')} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
          ← Voltar para lista
        </button>
      </div>
    );
  }

  return null;
}
