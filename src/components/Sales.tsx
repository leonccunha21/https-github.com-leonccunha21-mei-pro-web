import React, { useState, useMemo } from 'react';
import { Product, SaleItem, PaymentMethod } from '../types';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  User, 
  Tag, 
  CheckCircle2, 
  UserPlus, 
  DollarSign,
  AlertCircle,
  Printer,
  FileText
} from 'lucide-react';

interface SalesProps {
  products: Product[];
  onRegisterSale: (saleData: {
    items: SaleItem[];
    clientName?: string;
    clientPhone?: string;
    paymentMethod: PaymentMethod;
    discount: number;
    notes?: string;
  }) => void;
  onNavigate: (tab: 'products') => void;
}

export default function Sales({ products, onRegisterSale, onNavigate }: SalesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allowNegativeStock, setAllowNegativeStock] = useState(true);

  // Cart state
  const [cart, setCart] = useState<{
    product: Product;
    quantity: number;
    customSalePrice: number; // can override the default selling price
  }[]>([]);

  // Checkout info
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [saleNotes, setSaleNotes] = useState('');
  
  // Checkout feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<boolean>(false);
  const [lastSaleData, setLastSaleData] = useState<{
    items: SaleItem[];
    clientName?: string;
    clientPhone?: string;
    paymentMethod: PaymentMethod;
    discount: number;
    total: number;
    subtotal: number;
    notes?: string;
  } | null>(null);

  const paymentMethodLabels: Record<string, string> = {
    money: 'Dinheiro',
    card_credit: 'Cartão Crédito',
    card_debit: 'Cartão Débito',
    pix: 'PIX',
    transfer: 'Transferência'
  };

  const generateReceipt = () => {
    if (!lastSaleData) return;
    const storeInfo = JSON.parse(localStorage.getItem('zm_store_info') || '{}');
    const saleId = `V${Date.now().toString(36).toUpperCase()}`;

    const itemsHtml = lastSaleData.items.map(item => `
      <tr>
        <td style="padding:4px 0;border-bottom:1px dashed #ddd;font-size:12px">${item.productName}</td>
        <td style="padding:4px 0;border-bottom:1px dashed #ddd;text-align:center;font-size:12px">${item.quantity}x</td>
        <td style="padding:4px 0;border-bottom:1px dashed #ddd;text-align:right;font-size:12px">R$ ${item.salePrice.toFixed(2)}</td>
        <td style="padding:4px 0;border-bottom:1px dashed #ddd;text-align:right;font-size:12px;font-weight:bold">R$ ${item.total.toFixed(2)}</td>
      </tr>
    `).join('');

    const discountAmount = (lastSaleData.subtotal * lastSaleData.discount) / 100;

    const receiptHtml = `
      <html><head><title>Recibo - ${saleId}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 15px; max-width: 350px; margin: 0 auto; font-size: 12px; color: #333; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #333; margin: 8px 0; }
        .line2 { border-top: 2px solid #333; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; }
        .total-row { font-size: 14px; font-weight: bold; border-top: 2px solid #333; padding-top: 5px; }
        .footer { text-align: center; margin-top: 15px; font-size: 10px; color: #666; }
        @media print { body { padding: 5px; max-width: 100%; } }
      </style></head><body>
      <div class="center bold" style="font-size:16px">${storeInfo.name || 'ZM Store'}</div>
      ${storeInfo.cnpj ? `<div class="center" style="font-size:10px">CNPJ: ${storeInfo.cnpj}</div>` : ''}
      ${storeInfo.phone ? `<div class="center" style="font-size:10px">${storeInfo.phone}</div>` : ''}
      ${storeInfo.address ? `<div class="center" style="font-size:10px">${storeInfo.address} - ${storeInfo.city || ''}/${storeInfo.state || ''}</div>` : ''}
      
      <div class="line2"></div>
      <div class="center bold">COMPROVANTE DE VENDA</div>
      <div class="line2"></div>
      
      <div style="margin:8px 0">
        <div style="font-size:10px">Venda: <span class="bold">${saleId}</span></div>
        <div style="font-size:10px">Data: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
        ${lastSaleData.clientName ? `<div style="font-size:10px">Cliente: <span class="bold">${lastSaleData.clientName}</span></div>` : ''}
        ${lastSaleData.clientPhone ? `<div style="font-size:10px">Tel: ${lastSaleData.clientPhone}</div>` : ''}
      </div>

      <div class="line"></div>
      
      <table>
        <thead>
          <tr style="font-size:10px;color:#666">
            <th style="text-align:left;padding-bottom:3px">Item</th>
            <th style="text-align:center;padding-bottom:3px">Qtd</th>
            <th style="text-align:right;padding-bottom:3px">Preço</th>
            <th style="text-align:right;padding-bottom:3px">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="line"></div>
      
      <div style="text-align:right">
        <div>Subtotal: R$ ${lastSaleData.subtotal.toFixed(2)}</div>
        ${lastSaleData.discount > 0 ? `<div style="color:#e11d48">Desconto (${lastSaleData.discount}%): -R$ ${discountAmount.toFixed(2)}</div>` : ''}
        <div class="total-row" style="font-size:16px;margin-top:5px">TOTAL: R$ ${lastSaleData.total.toFixed(2)}</div>
      </div>
      
      <div class="line"></div>
      
      <div style="font-size:10px">
        <div>Pagamento: <span class="bold">${paymentMethodLabels[lastSaleData.paymentMethod] || lastSaleData.paymentMethod}</span></div>
      </div>

      ${lastSaleData.notes ? `<div style="font-size:10px;margin-top:5px"><strong>Obs:</strong> ${lastSaleData.notes}</div>` : ''}
      
      <div class="line2"></div>
      <div class="footer">
        <div class="bold">Obrigado pela preferência!</div>
        ${storeInfo.notes ? `<div>${storeInfo.notes}</div>` : ''}
        <div style="margin-top:5px">${storeInfo.name || 'ZM Store'} - ${storeInfo.phone || ''}</div>
      </div>
      <script>window.onload=function(){window.print();}</script>
      </body></html>
    `;

    const receiptWindow = window.open('', '_blank');
    if (receiptWindow) {
      receiptWindow.document.write(receiptHtml);
      receiptWindow.document.close();
    }
  };

  // Categories helper
  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category));
    return Array.from(list);
  }, [products]);

  // Catalog products filter
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Add to cart helper
  const handleAddToCart = (product: Product) => {
    const isOut = product.stock <= 0;
    if (isOut && !allowNegativeStock) {
      setErrorMessage(`O produto "${product.name}" está com estoque esgotado! Ative "Permitir venda sem estoque" no topo para vendê-lo mesmo assim.`);
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const item = prev[existingIndex];
        // Check stock if strict control is on
        if (!allowNegativeStock && item.quantity >= product.stock) {
          setErrorMessage(`Estoque máximo atingido para "${product.name}" (${product.stock} un disponíveis).`);
          setTimeout(() => setErrorMessage(null), 4000);
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = {
          ...item,
          quantity: item.quantity + 1
        };
        return updated;
      } else {
        return [...prev, { product, quantity: 1, customSalePrice: product.salePrice }];
      }
    });
  };

  // Adjust cart item quantity
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const maxStock = item.product.stock;
          if (!allowNegativeStock && quantity > maxStock) {
            setErrorMessage(`Estoque máximo atingido para "${item.product.name}" (${maxStock} un).`);
            setTimeout(() => setErrorMessage(null), 4000);
            return { ...item, quantity: maxStock };
          }
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  // Adjust custom item price (for temporary discounts or adjustments)
  const handleUpdateCustomPrice = (productId: string, price: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          return { ...item, customSalePrice: Math.max(0, price) };
        }
        return item;
      });
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.customSalePrice * item.quantity), 0);
  const discountAmount = (cartSubtotal * discountPercent) / 100;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Submit Sale Handler
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setErrorMessage('Adicione pelo menos um produto ao carrinho antes de finalizar.');
      return;
    }

    // Double check stock levels if strict mode is active
    if (!allowNegativeStock) {
      for (const item of cart) {
        const realProduct = products.find(p => p.id === item.product.id);
        if (!realProduct) {
          setErrorMessage(`Produto "${item.product.name}" não foi encontrado no estoque.`);
          return;
        }
        if (item.quantity > realProduct.stock) {
          setErrorMessage(`Inconsistência de estoque: "${item.product.name}" possui apenas ${realProduct.stock} unidades disponíveis.`);
          return;
        }
      }
    }

    // Map to SaleItems schema
    const saleItems: SaleItem[] = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      costPrice: item.product.costPrice,
      salePrice: item.customSalePrice,
      total: item.customSalePrice * item.quantity
    }));

    // Perform sale
    const subtotal = saleItems.reduce((acc, item) => acc + item.total, 0);
    const discountAmount = (subtotal * discountPercent) / 100;
    const finalTotal = Math.max(0, subtotal - discountAmount);

    onRegisterSale({
      items: saleItems,
      clientName: clientName.trim() || undefined,
      clientPhone: clientPhone.trim() || undefined,
      paymentMethod,
      discount: discountPercent,
      notes: saleNotes.trim() || undefined
    });

    // Save sale data for receipt generation before resetting
    setLastSaleData({
      items: saleItems,
      clientName: clientName.trim() || undefined,
      clientPhone: clientPhone.trim() || undefined,
      paymentMethod,
      discount: discountPercent,
      total: finalTotal,
      subtotal,
      notes: saleNotes.trim() || undefined
    });

    // Reset Form
    setCart([]);
    setClientName('');
    setClientPhone('');
    setDiscountPercent(0);
    setSaleNotes('');
    setErrorMessage(null);
    setSuccessMessage(true);
    
    // Hide success alert after 3 seconds
    setTimeout(() => {
      setSuccessMessage(false);
    }, 4500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 id="pos-title" className="text-2xl font-bold tracking-tight text-slate-900">Frente de Caixa (PDV)</h1>
          <p className="text-sm text-slate-500 mt-1">Registre as vendas rápidas de balcão da sua loja com baixa automática no estoque.</p>
        </div>
        
        {/* Toggle option for selling without stock constraint */}
        <div className="flex items-center gap-2.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto shadow-xs">
          <label className="text-xs font-bold text-slate-600 cursor-pointer select-none" htmlFor="allow-negative-stock-toggle">
            Permitir venda sem estoque
          </label>
          <input
            id="allow-negative-stock-toggle"
            type="checkbox"
            checked={allowNegativeStock}
            onChange={(e) => setAllowNegativeStock(e.target.checked)}
            className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded-sm focus:ring-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Message banners */}
      {successMessage && (
        <div id="sale-success-alert" className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Venda realizada com sucesso!</p>
            <p className="text-xs text-emerald-700 mt-0.5">Estoque atualizado e transação registrada.</p>
          </div>
          {lastSaleData && (
            <button onClick={generateReceipt} className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0">
              <Printer className="h-3.5 w-3.5" />
              Recibo
            </button>
          )}
        </div>
      )}

      {errorMessage && (
        <div id="sale-error-alert" className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Atenção / Erro</p>
            <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Product Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
            {/* Quick Search */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                id="catalog-search"
                type="text"
                placeholder="Pesquisar produto pelo nome ou SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-900 border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            
            {/* Category selection */}
            <select
              id="catalog-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 cursor-pointer"
            >
              <option value="all">Todas Categorias</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Catalog grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
            {filteredProducts.map(product => {
              const isOut = product.stock <= 0;
              const isLow = product.stock <= product.minStock;
              
              // Count of this product currently in cart
              const inCartItem = cart.find(item => item.product.id === product.id);
              const inCartQty = inCartItem ? inCartItem.quantity : 0;

              return (
                <div 
                  key={product.id}
                  onClick={() => handleAddToCart(product)}
                  className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative group select-none ${
                    isOut && !allowNegativeStock ? 'opacity-75 border-rose-250 bg-rose-50/10' : 'hover:border-indigo-500'
                  }`}
                >
                  {/* Cart count badge */}
                  {inCartQty > 0 && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-indigo-600 text-white font-mono font-bold text-[10px] rounded-full shadow-xs">
                      {inCartQty} no carrinho
                    </span>
                  )}

                  <div>
                    <span className="text-[10px] font-mono font-semibold text-slate-400 block uppercase">{product.category}</span>
                    <h3 className="font-bold text-slate-900 mt-1 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={product.name}>
                      {product.name}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">SKU: {product.code}</p>
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Preço</span>
                      <span className="text-base font-extrabold text-slate-950 font-mono">
                        {product.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      {isOut ? (
                        <span className="px-2 py-1 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-md block border border-rose-200/50">
                          Esgotado
                        </span>
                      ) : (
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-md block ${
                          isLow ? 'bg-amber-100 text-amber-800 border border-amber-200/50' : 'bg-slate-100 text-slate-700 border border-slate-200/50'
                        }`}>
                          {product.stock - inCartQty} un disp.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center col-span-2 shadow-sm">
                <p className="text-sm text-slate-500 font-medium">Nenhum produto cadastrado corresponde à busca.</p>
                <button
                  onClick={() => onNavigate('products')}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:underline"
                >
                  Ir para Estoque cadastrar novo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Cart & Checkout form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Cart Header */}
          <div className="bg-indigo-950 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-emerald-400" />
              <h2 className="font-bold text-xs uppercase tracking-wider">Carrinho de Compras</h2>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold rounded-full border border-emerald-500/30">
              {totalItemsCount} item(ns)
            </span>
          </div>

          {/* Cart Lines list */}
          <div className="p-4 border-b border-slate-200 max-h-[280px] overflow-y-auto space-y-3 flex-1">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <ShoppingCart className="h-8 w-8 mx-auto stroke-1 mb-2 text-slate-300" />
                <p className="text-sm font-medium">O carrinho está vazio.</p>
                <p className="text-xs mt-1">Selecione produtos no catálogo à esquerda para iniciar.</p>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200/60">
                  {/* Name & price info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 truncate" title={item.product.name}>
                      {item.product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {/* Price override input */}
                      <span className="text-[10px] text-slate-400">Preço unit.:</span>
                      <div className="relative inline-block w-20">
                        <span className="absolute inset-y-0 left-0 pl-1.5 flex items-center text-[10px] text-slate-400">R$</span>
                        <input
                          id={`price-override-${item.product.id}`}
                          type="number"
                          step="0.10"
                          value={item.customSalePrice}
                          onChange={(e) => handleUpdateCustomPrice(item.product.id, Number(e.target.value))}
                          className="w-full pl-5 pr-1 py-0.5 text-xs border border-slate-200 rounded-md font-mono text-slate-800 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quantity adjustments */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="flex items-center bg-white border border-slate-200 rounded-md">
                      <button
                        id={`cart-minus-${item.product.id}`}
                        type="button"
                        onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 text-slate-500 hover:bg-slate-100 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <input
                        id={`cart-qty-${item.product.id}`}
                        type="number"
                        min="1"
                        max={item.product.stock}
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.product.id, Number(e.target.value))}
                        className="w-8 text-center text-xs font-bold font-mono text-slate-800 focus:outline-hidden"
                      />
                      <button
                        id={`cart-plus-${item.product.id}`}
                        type="button"
                        onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 text-slate-500 hover:bg-slate-100 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Line total and delete */}
                    <div className="text-right w-20">
                      <span className="text-xs font-bold font-mono text-slate-900 block">
                        {(item.customSalePrice * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>

                    <button
                      id={`cart-delete-${item.product.id}`}
                      type="button"
                      onClick={() => handleRemoveFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-sm hover:bg-rose-50 transition-colors"
                      title="Remover do carrinho"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Info Form */}
          <form onSubmit={handleCheckout} className="p-4 bg-slate-50/50 space-y-4">
            
            {/* Customer metadata (Name & Phone) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome do Cliente</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                    <User className="h-3.5 w-3.5" />
                  </span>
                  <input
                    id="client-name"
                    type="text"
                    placeholder="Opcional"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Telefone / Celular</label>
                <input
                  id="client-phone"
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Payment Method & Discount percent */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Forma de Pagamento</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                    <CreditCard className="h-3.5 w-3.5" />
                  </span>
                  <select
                    id="payment-method-select"
                    required
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 cursor-pointer"
                  >
                    <option value="pix">⚡ PIX</option>
                    <option value="money">💵 Dinheiro</option>
                    <option value="card_credit">💳 Cartão de Crédito</option>
                    <option value="card_debit">💳 Cartão de Débito</option>
                    <option value="transfer">🏦 Transferência Bancária</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Desconto Aplicado</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                    <Tag className="h-3.5 w-3.5" />
                  </span>
                  <select
                    id="discount-select"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 font-mono cursor-pointer"
                  >
                    <option value="0">Sem Desconto</option>
                    <option value="5">5% de Desconto</option>
                    <option value="10">10% de Desconto</option>
                    <option value="15">15% de Desconto</option>
                    <option value="20">20% de Desconto</option>
                    <option value="30">30% de Desconto</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sales Notes */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Observações da Venda (Opcional)</label>
              <textarea
                id="sale-notes"
                rows={1}
                placeholder="Ex: Entrega agendada, observações de parcelamento..."
                value={saleNotes}
                onChange={(e) => setSaleNotes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none font-sans"
              />
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-slate-100 p-3 rounded-xl space-y-1.5 border border-slate-200">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal dos Itens:</span>
                <span className="font-mono">{cartSubtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-xs text-rose-600 font-medium">
                  <span>Desconto ({discountPercent}%):</span>
                  <span className="font-mono">-{discountAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black text-slate-950 pt-1.5 border-t border-slate-200">
                <span>Total Líquido:</span>
                <span className="font-mono text-base text-indigo-600">
                  {cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            {/* Submit checkout button */}
            <button
              id="confirm-checkout-btn"
              type="submit"
              disabled={cart.length === 0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              Finalizar Venda
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}
