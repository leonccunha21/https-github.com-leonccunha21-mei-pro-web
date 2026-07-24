import React, { useState, useMemo } from 'react';
import { Product, StoreInfo } from '../types';
import { Calendar, Plus, Send, Trash2, Clock, Image, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ScheduledPost {
  id: string;
  productId: string;
  productName: string;
  template: 'novidade' | 'promocao' | 'ultimas' | 'destaque';
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'sent' | 'cancelled';
  createdAt: string;
}

interface PostSchedulerProps {
  products: Product[];
  storeInfo: StoreInfo;
}

const TEMPLATES = [
  { id: 'novidade' as const, label: 'Novidade', emoji: '🆕', color: 'bg-purple-100 text-purple-700' },
  { id: 'promocao' as const, label: 'Promoção', emoji: '🔥', color: 'bg-pink-100 text-pink-700' },
  { id: 'ultimas' as const, label: 'Últimas Unidades', emoji: '⚡', color: 'bg-amber-100 text-amber-700' },
  { id: 'destaque' as const, label: 'Destaque', emoji: '⭐', color: 'bg-emerald-100 text-emerald-700' },
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function PostScheduler({ products, storeInfo }: PostSchedulerProps) {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(() => {
    const saved = localStorage.getItem('zm_scheduled_posts');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ScheduledPost['template']>('novidade');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('19:00');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const savePosts = (posts: ScheduledPost[]) => {
    setScheduledPosts(posts);
    localStorage.setItem('zm_scheduled_posts', JSON.stringify(posts));
  };

  const addPost = () => {
    if (!selectedProduct) {
      toast.error('Selecione um produto');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const newPost: ScheduledPost = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      template: selectedTemplate,
      scheduledDate: selectedDate,
      scheduledTime: selectedTime,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    savePosts([...scheduledPosts, newPost]);
    setShowAddModal(false);
    setSelectedProduct('');
    toast.success('Post agendado!');
  };

  const cancelPost = (id: string) => {
    const updated = scheduledPosts.map(p => 
      p.id === id ? { ...p, status: 'cancelled' as const } : p
    );
    savePosts(updated);
    toast.success('Post cancelado');
  };

  const deletePost = (id: string) => {
    const updated = scheduledPosts.filter(p => p.id !== id);
    savePosts(updated);
    toast.success('Post removido');
  };

  const markAsSent = (id: string) => {
    const updated = scheduledPosts.map(p => 
      p.id === id ? { ...p, status: 'sent' as const } : p
    );
    savePosts(updated);
    toast.success('Marcado como enviado');
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    
    return days;
  };

  const getPostsForDate = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return scheduledPosts.filter(p => p.scheduledDate === dateStr && p.status !== 'cancelled');
  };

  const upcomingPosts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return scheduledPosts
      .filter(p => p.scheduledDate >= today && p.status === 'pending')
      .sort((a, b) => `${a.scheduledDate}${a.scheduledTime}`.localeCompare(`${b.scheduledDate}${b.scheduledTime}`))
      .slice(0, 5);
  }, [scheduledPosts]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: scheduledPosts.length,
      pending: scheduledPosts.filter(p => p.status === 'pending').length,
      sent: scheduledPosts.filter(p => p.status === 'sent').length,
      today: scheduledPosts.filter(p => p.scheduledDate === today && p.status === 'pending').length,
    };
  }, [scheduledPosts]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <Calendar className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Calendário de Publicações</h3>
            <p className="text-sm text-slate-500">{stats.pending} posts agendados</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Agendar Post
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-indigo-600">{stats.total}</p>
          <p className="text-[10px] text-indigo-600">Total</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-[10px] text-amber-600">Pendentes</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-emerald-600">{stats.sent}</p>
          <p className="text-[10px] text-emerald-600">Enviados</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-blue-600">{stats.today}</p>
          <p className="text-[10px] text-blue-600">Hoje</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            ←
          </button>
          <h4 className="font-bold text-slate-900">
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h4>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
              {day}
            </div>
          ))}
          {getCalendarDays().map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;
            const posts = getPostsForDate(day);
            const isToday = new Date().getDate() === day && 
                           new Date().getMonth() === currentMonth.getMonth() && 
                           new Date().getFullYear() === currentMonth.getFullYear();
            
            return (
              <div
                key={day}
                className={`min-h-[60px] p-1 rounded-lg border text-xs ${
                  isToday ? 'border-indigo-400 bg-indigo-50' : 'border-slate-100'
                }`}
              >
                <div className={`text-right font-medium ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>
                  {day}
                </div>
                {posts.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {posts.slice(0, 2).map(post => {
                      const template = TEMPLATES.find(t => t.id === post.template);
                      return (
                        <div
                          key={post.id}
                          className={`text-[8px] px-1 py-0.5 rounded ${template?.color || 'bg-slate-100'}`}
                          title={`${template?.emoji} ${post.productName} - ${post.scheduledTime}`}
                        >
                          {template?.emoji} {post.scheduledTime}
                        </div>
                      );
                    })}
                    {posts.length > 2 && (
                      <div className="text-[8px] text-slate-400 text-center">+{posts.length - 2}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Posts */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h4 className="font-bold text-slate-900 mb-3">Próximos Posts</h4>
        {upcomingPosts.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">Nenhum post agendado</p>
        ) : (
          <div className="space-y-2">
            {upcomingPosts.map(post => {
              const template = TEMPLATES.find(t => t.id === post.template);
              return (
                <div key={post.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{template?.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{post.productName}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(post.scheduledDate + 'T12:00:00').toLocaleDateString('pt-BR')} às {post.scheduledTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => markAsSent(post.id)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                      title="Marcar como enviado"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => cancelPost(post.id)}
                      className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg"
                      title="Cancelar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900">Agendar Novo Post</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Produto</label>
                <select
                  value={selectedProduct}
                  onChange={e => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                >
                  <option value="">Selecione um produto</option>
                  {products.filter(p => !p.archived).map(p => (
                    <option key={p.id} value={p.id}>{p.name} - R$ {p.salePrice.toFixed(2)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Template</label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`p-2 rounded-xl border-2 text-sm font-medium flex items-center gap-2 ${
                        selectedTemplate === t.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span>{t.emoji}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Horário</label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={e => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={addPost}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700"
              >
                Agendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
