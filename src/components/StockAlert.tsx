import React, { useMemo } from 'react';
import { Product, StoreInfo } from '../types';
import { AlertTriangle, Package, Send, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface StockAlertProps {
  products: Product[];
  storeInfo: StoreInfo;
  onUpdateProduct?: (product: Product) => void;
}

export default function StockAlert({ products, storeInfo, onUpdateProduct }: StockAlertProps) {
  const lowStockProducts = useMemo(() => {
    return products.filter(p => 
      !p.archived && 
      p.status !== 'indisponivel' && 
      p.minStock > 0 && 
      p.stock <= p.minStock &&
      !/^servi/i.test(p.category)
    ).sort((a, b) => a.stock - b.stock);
  }, [products]);

  const outOfStock = useMemo(() => {
    return lowStockProducts.filter(p => p.stock === 0);
  }, [lowStockProducts]);

  const criticalStock = useMemo(() => {
    return lowStockProducts.filter(p => p.stock > 0 && p.stock <= Math.ceil(p.minStock / 2));
  }, [lowStockProducts]);

  const generateWhatsAppMessage = (product: Product) => {
    const emoji = product.stock === 0 ? '❌' : '⚠️';
    const status = product.stock === 0 ? 'SEM ESTOQUE' : 'ESTOQUE BAIXO';
    
    let msg = `${emoji} *${status}* ${emoji}\n\n`;
    msg += `📱 *${product.name}*\n`;
    msg += `📦 Estoque: ${product.stock} un.\n`;
    msg += `💰 Preço: R$ ${product.salePrice.toFixed(2)}\n\n`;
    
    if (product.stock === 0) {
      msg += `⏰ Precisa repor urgentemente!`;
    } else {
      msg += `📉 Estoque abaixo do mínimo (${product.minStock} un.)`;
    }
    
    return msg;
  };

  const sendWhatsAppAlert = (product: Product) => {
    const message = generateWhatsAppMessage(product);
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    toast.success('Mensagem preparada!');
  };

  const sendAllAlerts = () => {
    if (lowStockProducts.length === 0) {
      toast.error('Nenhum produto com estoque baixo');
      return;
    }

    let message = `🚨 *RELATÓRIO DE ESTOQUE* 🚨\n\n`;
    message += `📋 *Produtos com estoque baixo:*\n\n`;
    
    lowStockProducts.forEach((p, i) => {
      const emoji = p.stock === 0 ? '❌' : '⚠️';
      message += `${emoji} ${i + 1}. ${p.name}\n`;
      message += `   📦 Estoque: ${p.stock} un. (mín: ${p.minStock})\n`;
      message += `   💰 Preço: R$ ${p.salePrice.toFixed(2)}\n\n`;
    });

    message += `\n📊 *Resumo:*\n`;
    message += `• Total de produtos baixos: ${lowStockProducts.length}\n`;
    message += `• Sem estoque: ${outOfStock.length}\n`;
    message += `• Estoque crítico: ${criticalStock.length}\n\n`;
    message += `⏰ Gerado em: ${new Date().toLocaleString('pt-BR')}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    toast.success('Relatório preparado!');
  };

  if (lowStockProducts.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <Package className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-emerald-800">Estoque OK!</p>
            <p className="text-sm text-emerald-600">Todos os produtos estão com estoque acima do mínimo.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Alertas de Estoque</h3>
            <p className="text-sm text-slate-500">{lowStockProducts.length} produto(s) abaixo do mínimo</p>
          </div>
        </div>
        <button
          onClick={sendAllAlerts}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors"
        >
          <Send className="h-4 w-4" />
          Enviar Relatório
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{outOfStock.length}</p>
          <p className="text-xs text-red-600">Sem Estoque</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{criticalStock.length}</p>
          <p className="text-xs text-amber-600">Estoque Crítico</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</p>
          <p className="text-xs text-orange-600">Total Baixos</p>
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-2">
        {lowStockProducts.map(product => (
          <div 
            key={product.id}
            className={`flex items-center justify-between p-3 rounded-xl border ${
              product.stock === 0 
                ? 'bg-red-50 border-red-200' 
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                product.stock === 0 ? 'bg-red-100' : 'bg-amber-100'
              }`}>
                {product.stock === 0 ? (
                  <span className="text-lg">❌</span>
                ) : (
                  <span className="text-lg">⚠️</span>
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
                <p className="text-xs text-slate-500">{product.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className={`font-bold text-sm ${product.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                  {product.stock} un.
                </p>
                <p className="text-[10px] text-slate-400">mín: {product.minStock}</p>
              </div>
              <button
                onClick={() => sendWhatsAppAlert(product)}
                className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors"
                title="Enviar alerta WhatsApp"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
