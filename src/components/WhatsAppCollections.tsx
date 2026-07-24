import React, { useMemo, useState } from 'react';
import { Sale, StoreInfo } from '../types';
import { Send, Clock, AlertCircle, CheckCircle, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

interface WhatsAppCollectionsProps {
  sales: Sale[];
  storeInfo: StoreInfo;
}

type ReminderType = 'gentle' | 'firm' | 'urgent';

const REMINDER_TEMPLATES: Record<ReminderType, { label: string; color: string; icon: React.ReactNode; template: (sale: Sale, store: StoreInfo) => string }> = {
  gentle: {
    label: 'Amigável',
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    icon: <MessageSquare className="h-4 w-4" />,
    template: (sale, store) => {
      const items = sale.items.map(i => i.productName).join(', ');
      return `Olá! Tudo bem? 😊\n\n` +
        `Aqui é da *${store.name || 'ZM Store'}*.\n\n` +
        `Passando para lembrar sobre a venda de *${items}* no dia *${new Date(sale.date).toLocaleDateString('pt-BR')}*.\n\n` +
        `Valor: *R$ ${sale.total.toFixed(2)}*\n\n` +
        `Qualquer dúvida, é só me chamar! 👍`;
    }
  },
  firm: {
    label: 'Direto',
    color: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    icon: <Clock className="h-4 w-4" />,
    template: (sale, store) => {
      const items = sale.items.map(i => i.productName).join(', ');
      const daysAgo = Math.floor((Date.now() - new Date(sale.date).getTime()) / (1000 * 60 * 60 * 24));
      return `Olá! Aqui é da *${store.name || 'ZM Store'}*.\n\n` +
        `Gostaria de saber sobre o pagamento da venda de *${items}* (${daysAgo} dias atrás).\n\n` +
        `📋 Pedido: #${sale.id.slice(0, 8).toUpperCase()}\n` +
        `💰 Valor: *R$ ${sale.total.toFixed(2)}*\n\n` +
        `Pode me informar quando será realizado o pagamento?`;
    }
  },
  urgent: {
    label: 'Urgente',
    color: 'bg-red-100 text-red-700 hover:bg-red-200',
    icon: <AlertCircle className="h-4 w-4" />,
    template: (sale, store) => {
      const items = sale.items.map(i => i.productName).join(', ');
      const daysAgo = Math.floor((Date.now() - new Date(sale.date).getTime()) / (1000 * 60 * 60 * 24));
      return `⚠️ *PENDÊNCIA DE PAGAMENTO*\n\n` +
        `Olá, aqui é da *${store.name || 'ZM Store'}*.\n\n` +
        `Identificamos que o pagamento referente à venda abaixo continua em aberto há *${daysAgo} dias*:\n\n` +
        `📦 Itens: *${items}*\n` +
        `📅 Data: ${new Date(sale.date).toLocaleDateString('pt-BR')}\n` +
        `💰 Valor: *R$ ${sale.total.toFixed(2)}*\n\n` +
        `Por favor, entre em contato para regularizarmos esta pendência.\n\n` +
        `Obrigado pela atenção! 🙏`;
    }
  }
};

export default function WhatsAppCollections({ sales, storeInfo }: WhatsAppCollectionsProps) {
  const [selectedType, setSelectedType] = useState<ReminderType>('gentle');

  const pendingSales = useMemo(() => {
    return sales
      .filter(s => s.status === 'pending')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sales]);

  const totalPending = useMemo(() => {
    return pendingSales.reduce((acc, s) => acc + s.total, 0);
  }, [pendingSales]);

  const overdueSales = useMemo(() => {
    const now = new Date();
    return pendingSales.filter(s => {
      const saleDate = new Date(s.date);
      const daysDiff = Math.floor((now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 7; // Mais de 7 dias pendente
    });
  }, [pendingSales]);

  const getDaysPending = (date: string) => {
    const now = new Date();
    const saleDate = new Date(date);
    return Math.floor((now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const generateMessage = (sale: Sale) => {
    return REMINDER_TEMPLATES[selectedType].template(sale, storeInfo);
  };

  const sendReminder = (sale: Sale) => {
    const message = generateMessage(sale);
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    toast.success('Mensagem preparada!');
  };

  const sendAllReminders = () => {
    if (pendingSales.length === 0) {
      toast.error('Nenhuma venda pendente');
      return;
    }

    let message = `📋 *RELATÓRIO DE PENDÊNCIAS*\n\n`;
    message += `📊 Total de pendências: ${pendingSales.length}\n`;
    message += `💰 Valor total: R$ ${totalPending.toFixed(2)}\n`;
    message += `⏰ Gerado: ${new Date().toLocaleString('pt-BR')}\n\n`;
    
    message += `*Lista de pendências:*\n\n`;
    
    pendingSales.forEach((sale, i) => {
      const days = getDaysPending(sale.date);
      const emoji = days > 30 ? '🔴' : days > 14 ? '🟡' : '🟢';
      message += `${emoji} *${i + 1}. ${sale.clientName || 'Cliente'}*\n`;
      message += `   📅 ${new Date(sale.date).toLocaleDateString('pt-BR')} (${days} dias)\n`;
      message += `   💰 R$ ${sale.total.toFixed(2)}\n`;
      message += `   📦 ${sale.items.map(i => i.productName).join(', ')}\n\n`;
    });

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    toast.success('Relatório preparado!');
  };

  if (pendingSales.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-emerald-800">Tudo em dia!</p>
            <p className="text-sm text-emerald-600">Nenhuma venda pendente encontrada.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Send className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Cobranças via WhatsApp</h3>
            <p className="text-sm text-slate-500">{pendingSales.length} venda(s) pendente(s)</p>
          </div>
        </div>
        <button
          onClick={sendAllReminders}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors"
        >
          <Send className="h-4 w-4" />
          Enviar Relatório
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-orange-600">{pendingSales.length}</p>
          <p className="text-xs text-orange-600">Pendentes</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{overdueSales.length}</p>
          <p className="text-xs text-red-600">Atrasados (7+ dias)</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">
            R$ {totalPending.toFixed(0)}
          </p>
          <p className="text-xs text-amber-600">Total Pendente</p>
        </div>
      </div>

      {/* Reminder Type Selection */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de mensagem</label>
        <div className="flex gap-2">
          {(Object.keys(REMINDER_TEMPLATES) as ReminderType[]).map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === type
                  ? REMINDER_TEMPLATES[type].color + ' ring-2 ring-offset-1 ring-current'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {REMINDER_TEMPLATES[type].icon}
              {REMINDER_TEMPLATES[type].label}
            </button>
          ))}
        </div>
      </div>

      {/* Sales List */}
      <div className="space-y-2">
        {pendingSales.map(sale => {
          const days = getDaysPending(sale.date);
          const urgency = days > 30 ? 'high' : days > 14 ? 'medium' : 'low';
          
          return (
            <div 
              key={sale.id}
              className={`flex items-center justify-between p-3 rounded-xl border ${
                urgency === 'high' ? 'bg-red-50 border-red-200' :
                urgency === 'medium' ? 'bg-amber-50 border-amber-200' :
                'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  urgency === 'high' ? 'bg-red-100' :
                  urgency === 'medium' ? 'bg-amber-100' :
                  'bg-slate-100'
                }`}>
                  {urgency === 'high' ? '🔴' : urgency === 'medium' ? '🟡' : '🟢'}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {sale.clientName || 'Cliente sem nome'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(sale.date).toLocaleDateString('pt-BR')} • {days} dia(s) pendente(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-bold text-sm text-slate-900">
                    R$ {sale.total.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    #{sale.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => sendReminder(sale)}
                  className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors"
                  title="Enviar cobrança"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
