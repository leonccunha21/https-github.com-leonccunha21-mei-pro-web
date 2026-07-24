import React, { useState, useMemo, useEffect } from 'react';
import { Product, StoreInfo } from '../types';
import { MessageCircle, Send, Clock, Zap, Plus, Trash2, Play, Pause, RotateCcw, Calendar, Target } from 'lucide-react';
import toast from 'react-hot-toast';

interface WhatsAppAutomationProps {
  products: Product[];
  storeInfo: StoreInfo;
}

interface ScheduledPromotion {
  id: string;
  name: string;
  template: 'promocao' | 'novidade' | 'ultimas' | 'destaque' | 'personalizado';
  customMessage?: string;
  selectedProducts: string[];
  audience: 'all' | 'segment';
  segmentType?: 'high-value' | 'recent' | 'inactive';
  scheduledDate: string;
  scheduledTime: string;
  recurring: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly';
  status: 'pending' | 'sent' | 'paused' | 'cancelled';
  createdAt: string;
  lastSentAt?: string;
  sendCount: number;
}

const TEMPLATES = [
  { id: 'promocao' as const, label: 'Promoção', emoji: '🔥', color: 'bg-pink-100 text-pink-700' },
  { id: 'novidade' as const, label: 'Novidade', emoji: '🆕', color: 'bg-purple-100 text-purple-700' },
  { id: 'ultimas' as const, label: 'Últimas Unidades', emoji: '⚡', color: 'bg-amber-100 text-amber-700' },
  { id: 'destaque' as const, label: 'Destaque', emoji: '⭐', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'personalizado' as const, label: 'Personalizado', emoji: '✏️', color: 'bg-blue-100 text-blue-700' },
];

const AUDIENCES = [
  { id: 'all' as const, label: 'Todos os Clientes', description: 'Enviar para toda a base' },
  { id: 'segment' as const, label: 'Segmento', description: 'Enviar para grupo específico' },
];

const SEGMENTS = [
  { id: 'high-value' as const, label: 'Clientes Frequentes', description: 'Compraram mais de 3 vezes' },
  { id: 'recent' as const, label: 'Compradores Recentes', description: 'Compraram nos últimos 30 dias' },
  { id: 'inactive' as const, label: 'Clientes Inativos', description: 'Não compram há mais de 60 dias' },
];

export default function WhatsAppAutomation({ products, storeInfo }: WhatsAppAutomationProps) {
  const [promotions, setPromotions] = useState<ScheduledPromotion[]>(() => {
    const saved = localStorage.getItem('zm_whatsapp_promotions');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<ScheduledPromotion | null>(null);
  const [promoName, setPromoName] = useState('');
  const [promoTemplate, setPromoTemplate] = useState<ScheduledPromotion['template']>('promocao');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [audience, setAudience] = useState<ScheduledPromotion['audience']>('all');
  const [segmentType, setSegmentType] = useState<ScheduledPromotion['segmentType']>('high-value');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('19:00');
  const [recurring, setRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<ScheduledPromotion['recurringType']>('weekly');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'sent' | 'paused'>('all');

  const savePromotions = (data: ScheduledPromotion[]) => {
    setPromotions(data);
    localStorage.setItem('zm_whatsapp_promotions', JSON.stringify(data));
  };

  const resetForm = () => {
    setPromoName('');
    setPromoTemplate('promocao');
    setCustomMessage('');
    setSelectedProducts([]);
    setAudience('all');
    setSegmentType('high-value');
    setScheduledDate(new Date().toISOString().split('T')[0]);
    setScheduledTime('19:00');
    setRecurring(false);
    setRecurringType('weekly');
    setEditingPromo(null);
  };

  const addPromotion = () => {
    if (!promoName) {
      toast.error('Dê um nome para a promoção');
      return;
    }
    if (selectedProducts.length === 0 && promoTemplate !== 'personalizado') {
      toast.error('Selecione pelo menos um produto');
      return;
    }

    const newPromo: ScheduledPromotion = {
      id: editingPromo?.id || Date.now().toString(),
      name: promoName,
      template: promoTemplate,
      customMessage: promoTemplate === 'personalizado' ? customMessage : undefined,
      selectedProducts,
      audience,
      segmentType: audience === 'segment' ? segmentType : undefined,
      scheduledDate,
      scheduledTime,
      recurring,
      recurringType: recurring ? recurringType : undefined,
      status: 'pending',
      createdAt: editingPromo?.createdAt || new Date().toISOString(),
      sendCount: editingPromo?.sendCount || 0,
    };

    if (editingPromo) {
      savePromotions(promotions.map(p => p.id === editingPromo.id ? newPromo : p));
      toast.success('Promoção atualizada!');
    } else {
      savePromotions([...promotions, newPromo]);
      toast.success('Promoção agendada!');
    }

    setShowAddModal(false);
    resetForm();
  };

  const editPromotion = (promo: ScheduledPromotion) => {
    setEditingPromo(promo);
    setPromoName(promo.name);
    setPromoTemplate(promo.template);
    setCustomMessage(promo.customMessage || '');
    setSelectedProducts(promo.selectedProducts);
    setAudience(promo.audience);
    setSegmentType(promo.segmentType || 'high-value');
    setScheduledDate(promo.scheduledDate);
    setScheduledTime(promo.scheduledTime);
    setRecurring(promo.recurring);
    setRecurringType(promo.recurringType || 'weekly');
    setShowAddModal(true);
  };

  const togglePause = (id: string) => {
    const updated = promotions.map(p =>
      p.id === id ? { ...p, status: p.status === 'paused' ? 'pending' : 'paused' } : p
    );
    savePromotions(updated);
    toast.success(updated.find(p => p.id === id)?.status === 'paused' ? 'Promoção pausada' : 'Promoção retomada');
  };

  const deletePromotion = (id: string) => {
    savePromotions(promotions.filter(p => p.id !== id));
    toast.success('Promoção removida');
  };

  const sendNow = (promo: ScheduledPromotion) => {
    const message = generateMessage(promo);
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');

    const updated = promotions.map(p =>
      p.id === promo.id ? { ...p, status: 'sent', lastSentAt: new Date().toISOString(), sendCount: p.sendCount + 1 } : p
    );
    savePromotions(updated);
    toast.success('Mensagem enviada!');
  };

  const generateMessage = (promo: ScheduledPromotion): string => {
    const template = TEMPLATES.find(t => t.id === promo.template);
    const selectedProductList = products.filter(p => promo.selectedProducts.includes(p.id));

    let message = '';

    if (promo.template === 'personalizado' && promo.customMessage) {
      message = promo.customMessage;
    } else {
      switch (promo.template) {
        case 'promocao':
          message = `🔥 *PROMOÇÃO ${storeInfo.name}!*\n\n`;
          message += `Aproveite nossas ofertas imperdíveis!\n\n`;
          selectedProductList.forEach(p => {
            const discount = p.costPrice > 0 ? Math.round(((p.salePrice - p.costPrice) / p.costPrice) * 100) : 0;
            message += `✅ *${p.name}*\n`;
            message += `De R$ ${p.salePrice.toFixed(2)} por *R$ ${p.salePrice.toFixed(2)}*\n`;
            if (discount > 0) message += `💰 Economia de ${discount}%\n`;
            message += `\n`;
          });
          message += `📞 *${storeInfo.phone || 'Entre em contato'}*\n`;
          message += `📍 ${storeInfo.address || storeInfo.city || ''}`;
          break;

        case 'novidade':
          message = `🆕 *NOVIDADE ${storeInfo.name}!*\n\n`;
          message += `Acabou de chegar!\n\n`;
          selectedProductList.forEach(p => {
            message += `✨ *${p.name}*\n`;
            message += `💰 Por apenas R$ ${p.salePrice.toFixed(2)}\n`;
            if (p.description) message += `📝 ${p.description}\n`;
            message += `\n`;
          });
          message += `📞 *${storeInfo.phone || 'Entre em contato'}*`;
          break;

        case 'ultimas':
          message = `⚡ *ÚLTIMAS UNIDADES!*\n\n`;
          message += `Corra! Só restam poucas unidades!\n\n`;
          selectedProductList.forEach(p => {
            message += `⚠️ *${p.name}*\n`;
            message += `Estoque: ${p.stock} unidades\n`;
            message += `💰 R$ ${p.salePrice.toFixed(2)}\n\n`;
          });
          message += `Não perca! *${storeInfo.name}*`;
          break;

        case 'destaque':
          message = `⭐ *PRODUTO DESTAQUE*\n\n`;
          message += `O produto mais vendido da semana!\n\n`;
          selectedProductList.forEach(p => {
            message += `🏆 *${p.name}*\n`;
            message += `💰 R$ ${p.salePrice.toFixed(2)}\n`;
            if (p.description) message += `📝 ${p.description}\n`;
            message += `\n`;
          });
          message += `📍 *${storeInfo.name}*`;
          break;
      }
    }

    return message;
  };

  const stats = useMemo(() => ({
    total: promotions.length,
    pending: promotions.filter(p => p.status === 'pending').length,
    sent: promotions.filter(p => p.status === 'sent').length,
    paused: promotions.filter(p => p.status === 'paused').length,
    totalSent: promotions.reduce((sum, p) => sum + p.sendCount, 0),
  }), [promotions]);

  const filteredPromotions = useMemo(() => {
    if (filterStatus === 'all') return promotions;
    return promotions.filter(p => p.status === filterStatus);
  }, [promotions, filterStatus]);

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">WhatsApp Automático</h3>
            <p className="text-sm text-slate-500">{stats.pending} promoções agendadas</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nova Promoção
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-green-600">{stats.pending}</p>
          <p className="text-[10px] text-green-600">Agendadas</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-blue-600">{stats.sent}</p>
          <p className="text-[10px] text-blue-600">Enviadas</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-amber-600">{stats.paused}</p>
          <p className="text-[10px] text-amber-600">Pausadas</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-purple-600">{stats.totalSent}</p>
          <p className="text-[10px] text-purple-600">Total Enviadas</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { value: 'all', label: 'Todas' },
          { value: 'pending', label: 'Agendadas' },
          { value: 'sent', label: 'Enviadas' },
          { value: 'paused', label: 'Pausadas' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value as typeof filterStatus)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap ${
              filterStatus === f.value
                ? 'bg-green-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Promotions List */}
      <div className="space-y-2">
        {filteredPromotions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold">Nenhuma promoção encontrada</p>
            <p className="text-sm">Crie promoções automáticas para engajar clientes!</p>
          </div>
        ) : (
          filteredPromotions.map(promo => {
            const template = TEMPLATES.find(t => t.id === promo.template);
            const selectedProductList = products.filter(p => promo.selectedProducts.includes(p.id));

            return (
              <div key={promo.id} className="bg-white border border-slate-200 rounded-xl p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                        promo.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                        promo.status === 'sent' ? 'bg-emerald-100 text-emerald-700' :
                        promo.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {promo.status === 'pending' ? '🕐 Agendada' :
                         promo.status === 'sent' ? '✅ Enviada' :
                         promo.status === 'paused' ? '⏸️ Pausada' : '❌ Cancelada'}
                      </span>
                      {promo.recurring && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-100 text-purple-700">
                          🔄 Recorrente
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm">{promo.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${template?.color}`}>
                        {template?.emoji} {template?.label}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(promo.scheduledDate + 'T12:00:00').toLocaleDateString('pt-BR')} às {promo.scheduledTime}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {selectedProductList.length} produto(s) • {promo.audience === 'all' ? 'Todos' : 'Segmento'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => sendNow(promo)}
                      className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg"
                      title="Enviar agora"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => togglePause(promo.id)}
                      className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg"
                      title={promo.status === 'paused' ? 'Retomar' : 'Pausar'}
                    >
                      {promo.status === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => editPromotion(promo)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg"
                      title="Editar"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deletePromotion(promo.id)}
                      className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg"
                      title="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 sticky top-0 bg-white">
              <h3 className="font-bold text-slate-900">{editingPromo ? 'Editar Promoção' : 'Nova Promoção'}</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nome da Promoção</label>
                <input
                  type="text"
                  placeholder="Ex: Promoção de Natal"
                  value={promoName}
                  onChange={e => setPromoName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Template</label>
                <div className="grid grid-cols-3 gap-2">
                  {TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setPromoTemplate(t.id)}
                      className={`p-2 rounded-xl border-2 text-xs font-medium flex flex-col items-center gap-1 ${
                        promoTemplate === t.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-lg">{t.emoji}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {promoTemplate === 'personalizado' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Mensagem Personalizada</label>
                  <textarea
                    value={customMessage}
                    onChange={e => setCustomMessage(e.target.value)}
                    rows={4}
                    placeholder="Digite sua mensagem..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
              )}

              {promoTemplate !== 'personalizado' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Produtos</label>
                  <div className="max-h-48 overflow-y-auto space-y-1 border border-slate-200 rounded-xl p-2">
                    {products.filter(p => !p.archived).map(p => (
                      <label key={p.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(p.id)}
                          onChange={() => toggleProductSelection(p.id)}
                          className="h-4 w-4 text-green-600 rounded"
                        />
                        <span className="text-sm text-slate-700">{p.name}</span>
                        <span className="text-xs text-slate-500 ml-auto">R$ {p.salePrice.toFixed(2)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Público-Alvo</label>
                <div className="grid grid-cols-2 gap-2">
                  {AUDIENCES.map(a => (
                    <button
                      key={a.id}
                      onClick={() => setAudience(a.id)}
                      className={`p-3 rounded-xl border-2 text-left ${
                        audience === a.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-900">{a.label}</p>
                      <p className="text-[10px] text-slate-500">{a.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {audience === 'segment' && (
                <div className="grid grid-cols-3 gap-2">
                  {SEGMENTS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSegmentType(s.id)}
                      className={`p-2 rounded-xl border-2 text-left ${
                        segmentType === s.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-xs font-semibold text-slate-900">{s.label}</p>
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Horário</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={e => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recurring}
                    onChange={e => setRecurring(e.target.checked)}
                    className="h-4 w-4 text-green-600 rounded"
                  />
                  <span className="text-sm font-semibold text-slate-700">Recorrente</span>
                </label>
              </div>

              {recurring && (
                <div className="flex gap-2">
                  {[
                    { value: 'daily' as const, label: 'Diário' },
                    { value: 'weekly' as const, label: 'Semanal' },
                    { value: 'monthly' as const, label: 'Mensal' },
                  ].map(r => (
                    <button
                      key={r.value}
                      onClick={() => setRecurringType(r.value)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                        recurringType === r.value
                          ? 'bg-green-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 flex gap-2 sticky bottom-0 bg-white">
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={addPromotion}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700"
              >
                {editingPromo ? 'Atualizar' : 'Agendar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
