import React, { useState, useMemo, useEffect } from 'react';
import { Product, SaleItem, PaymentMethod, Customer } from '../types';
import { roundCurrency } from '../lib/currency';
import { normalizeName } from '../lib/normalize';
import BarcodeScanner from './BarcodeScanner';
import ReceiptPDF from './ReceiptPDF';
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
  FileText,
  ChevronDown,
  ChevronRight,
  Clock,
  
Users,
  ScanBarcode
} from 'lucide-react';

interface SalesProps {
  products: Product[];
  customers?: Customer[];
  onRegisterSale: (saleData: {
    items: SaleItem[];
    clientName?: string;
    clientPhone?: string;
    paymentMethod: PaymentMethod;
    discount: number;
    ecommerceOrderId?: string;
    trackingCode?: string;
    saleChannel?: string;
    saleType: 'CPF' | 'CNPJ';
    notes?: string;
    pending?: boolean;
    allowNegativeStock?: boolean;
  }) => void;
  onNavigate: (tab: 'products') => void;
}

export default function Sales({ products, customers = [], onRegisterSale, onNavigate }: SalesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allowNegativeStock, setAllowNegativeStock] = useState(true);
  const [creditSale, setCreditSale] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Cart state
  const [cart, setCart] = useState<{
    product: Product;
    quantity: number;
    customSalePrice: number; // can override the default selling price
  }[]>([]);

  // Checkout info
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCPF, setClientCPF] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [saleChannel, setSaleChannel] = useState('Loja Física');
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [customDiscountInput, setCustomDiscountInput] = useState<string>('');
  const [showMaxDiscountWarning, setShowMaxDiscountWarning] = useState<boolean>(false);
  const [saleNotes, setSaleNotes] = useState('');
  const [ecommerceOrderId, setEcommerceOrderId] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [saleType, setSaleType] = useState<'CPF' | 'CNPJ'>('CPF');
  
  // Auto-set saleType based on channel
  useEffect(() => {
    if (isEcommerceChannel(saleChannel)) {
      setSaleType('CNPJ');
    } else {
      setSaleType('CPF');
    }
  }, [saleChannel]);
  
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

  const isEcommerceChannel = (ch: string) => ['Shopee', 'Magalu', 'E-commerce', 'TikTok'].includes(ch);

  const saleChannelLabels: Record<string, string> = {
    'Loja Física': '🏪 Loja Física',
    'Shopee': '🛒 Shopee',
    'Magalu': '🛒 Magalu',
    'TikTok': '🎵 TikTok',
    'E-commerce': '🌐 E-commerce',
    'WhatsApp': '📱 WhatsApp',
    'Outro': '📦 Outro'
  };

  const generateReceipt = () => {
    if (!lastSaleData) return;
    let storeInfo: Record<string, string> = {};
    try { storeInfo = JSON.parse(localStorage.getItem('zm_store_info') || '{}'); } catch {}
    const saleId = `V${Date.now().toString(36).toUpperCase()}`;
    const saleDate = new Date();

    const itemsHtml = lastSaleData.items.map(item => `
      <tr>
        <td style="padding:4px 0;border-bottom:1px dashed #ddd;font-size:12px">${item.productName}</td>
        <td style="padding:4px 0;border-bottom:1px dashed #ddd;text-align:center;font-size:12px">${item.quantity}x</td>
        <td style="padding:4px 0;border-bottom:1px dashed #ddd;text-align:right;font-size:12px">R$ ${item.salePrice.toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2})}</td>
        <td style="padding:4px 0;border-bottom:1px dashed #ddd;text-align:right;font-size:12px;font-weight:bold">R$ ${item.total.toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2})}</td>
      </tr>
    `).join('');

    const discountAmount = (lastSaleData.subtotal * lastSaleData.discount) / 100;

    let extraClientHtml = '';
    if (lastSaleData.notes) {
      const match = lastSaleData.notes.match(/\[client_data\](.*)/);
      if (match) {
        try {
          const clientData = JSON.parse(match[1]);
          if (clientData.channel) extraClientHtml += `<div style="font-size:10px">Canal: ${clientData.channel}</div>`;
          if (clientData.cpf) extraClientHtml += `<div style="font-size:10px">CPF/CNPJ: ${clientData.cpf}</div>`;
          if (clientData.email) extraClientHtml += `<div style="font-size:10px">Email: ${clientData.email}</div>`;
          if (clientData.address) extraClientHtml += `<div style="font-size:10px">Endereço: ${clientData.address}</div>`;
        } catch {}
      }
    }

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
      ${storeInfo.logoUrl ? `<div class="center"><img src="${storeInfo.logoUrl}" alt="Logo" style="max-width:80px;max-height:80px;margin:0 auto 8px;display:block" /></div>` : ''}
      <div class="center bold" style="font-size:16px">${storeInfo.name || 'ZM Store'}</div>
      ${storeInfo.cnpj ? `<div class="center" style="font-size:10px">CNPJ: ${storeInfo.cnpj}</div>` : ''}
      ${storeInfo.phone ? `<div class="center" style="font-size:10px">${storeInfo.phone}</div>` : ''}
      ${storeInfo.address ? `<div class="center" style="font-size:10px">${storeInfo.address} - ${storeInfo.city || ''}/${storeInfo.state || ''}</div>` : ''}
      
      <div class="line2"></div>
      <div class="center bold">COMPROVANTE DE VENDA</div>
      <div class="line2"></div>
      
      <div style="margin:8px 0">
        <div style="font-size:10px">Venda: <span class="bold">${saleId}</span></div>
        <div style="font-size:10px">Data: ${saleDate.toLocaleDateString('pt-BR')} ${saleDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
        ${lastSaleData.clientName ? `<div style="font-size:10px">Cliente: <span class="bold">${lastSaleData.clientName}</span></div>` : ''}
        ${lastSaleData.clientPhone ? `<div style="font-size:10px">Tel: ${lastSaleData.clientPhone}</div>` : ''}
        ${extraClientHtml}
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
        <div>Subtotal: R$ ${lastSaleData.subtotal.toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2})}</div>
        ${lastSaleData.discount > 0 ? `<div style="color:#e11d48">Desconto (${lastSaleData.discount}%): -R$ ${discountAmount.toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2})}</div>` : ''}
        <div class="total-row" style="font-size:16px;margin-top:5px">TOTAL: R$ ${lastSaleData.total.toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2})}</div>
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

    const receiptWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (receiptWindow) {
      receiptWindow.document.write(receiptHtml);
      receiptWindow.document.close();
    }
  };

  // Categories helper
  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category));
    return Array.from(list).sort();
  }, [products]);

  // Catalog products filter
  const filteredProducts = useMemo(() => {
    const q = normalizeName(searchQuery);
    return products.filter(p => {
      const matchesSearch = normalizeName(p.name).includes(q) ||
                            p.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Add to cart helper
  const isServiceProduct = (p: Product) => /^servi/i.test(p.category);

  const handleBarcodeDetected = (code: string) => {
    const product = products.find(p => p.code === code);
    if (!product) {
      setErrorMessage(`Código "${code}" não encontrado no catálogo.`);
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }
    handleAddToCart(product);
  };

  const handleAddToCart = (product: Product) => {
    const isService = isServiceProduct(product);
    const isOut = !isService && product.stock <= 0;
    if (isOut && !allowNegativeStock) {
      setErrorMessage(`O produto "${product.name}" está com estoque esgotado! Ative "Permitir venda sem estoque" no topo para vendê-lo mesmo assim.`);
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      if (!isService && !allowNegativeStock && existingItem.quantity + 1 > product.stock) {
        setErrorMessage(`Estoque máximo atingido para "${product.name}" (${product.stock} un disponíveis).`);
        setTimeout(() => setErrorMessage(null), 4000);
        return;
      }
      setCart(prev => prev.map(item =>
        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart(prev => [...prev, { product, quantity: 1, customSalePrice: product.salePrice }]);
    }
  };

  // Adjust cart item quantity
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    const item = cart.find(i => i.product.id === productId);
    if (item && !isServiceProduct(item.product) && !allowNegativeStock && quantity > item.product.stock) {
      setErrorMessage(`Estoque máximo atingido para "${item.product.name}" (${item.product.stock} un).`);
      setTimeout(() => setErrorMessage(null), 4000);
      quantity = item.product.stock;
    }

    setCart(prev => prev.map(i =>
      i.product.id === productId ? { ...i, quantity } : i
    ));
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

  // Discount handlers
  const handleQuickDiscount = (value: number) => {
    setDiscountPercent(value);
    setCustomDiscountInput('');
  };

  const handleCustomDiscountChange = (inputValue: string) => {
    setCustomDiscountInput(inputValue);
    const numericValue = parseFloat(inputValue);
    if (!isNaN(numericValue)) {
      const clampedValue = Math.min(50, Math.max(0, numericValue));
      if (numericValue > 50) {
        setShowMaxDiscountWarning(true);
        setTimeout(() => setShowMaxDiscountWarning(false), 3000);
      }
      setDiscountPercent(clampedValue);
    } else if (inputValue === '') {
      setDiscountPercent(0);
    }
  };

  // Calculations with floating point fix
  const cartSubtotal = roundCurrency(cart.reduce((acc, item) => acc + (item.customSalePrice * item.quantity), 0));
  const discountAmount = roundCurrency((cartSubtotal * discountPercent) / 100);
  const cartTotal = Math.max(0, roundCurrency(cartSubtotal - discountAmount));
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
        if (isServiceProduct(item.product)) continue;
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
    const subtotal = roundCurrency(saleItems.reduce((acc, item) => acc + item.total, 0));
    const discountAmount = roundCurrency((subtotal * discountPercent) / 100);
    const finalTotal = Math.max(0, roundCurrency(subtotal - discountAmount));

    // Build notes with client data and existing notes
    const clientData: Record<string, string> = {};
    if (clientCPF.trim()) clientData.cpf = clientCPF.trim();
    if (clientEmail.trim()) clientData.email = clientEmail.trim();
    if (clientAddress.trim()) clientData.address = clientAddress.trim();
    clientData.channel = saleChannel;

    const existingNotes = saleNotes.trim();
    let combinedNotes = existingNotes;
    if (Object.keys(clientData).length > 0) {
      const clientJson = JSON.stringify(clientData);
      combinedNotes = existingNotes ? `${existingNotes}\n[client_data]${clientJson}` : `[client_data]${clientJson}`;
    }

    onRegisterSale({
      items: saleItems,
      clientName: clientName.trim() || undefined,
      clientPhone: clientPhone.trim() || undefined,
      paymentMethod,
      discount: discountPercent,
      ecommerceOrderId: isEcommerceChannel(saleChannel) ? ecommerceOrderId.trim() || undefined : undefined,
      trackingCode: isEcommerceChannel(saleChannel) ? trackingCode.trim() || undefined : undefined,
      saleChannel: saleChannel,
      saleType,
      notes: combinedNotes || undefined,
      pending: creditSale,
      allowNegativeStock,
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
      notes: combinedNotes || undefined,
    });

    // Reset Form
    setCart([]);
    setClientName('');
    setClientPhone('');
    setClientCPF('');
    setClientEmail('');
    setClientAddress('');
    setSaleChannel('Loja Física');
    setShowClientDetails(false);
    setDiscountPercent(0);
    setCustomDiscountInput('');
    setShowMaxDiscountWarning(false);
    setSaleNotes('');
    setEcommerceOrderId('');
    setTrackingCode('');
    setSaleType('CPF');
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
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 id="pos-title" className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 text-slate-500" />
            Frente de Caixa (PDV)
          </h1>
          <p className="text-sm text-slate-500 mt-1">Registre vendas rápidas com baixa automática no estoque.</p>
        </div>
        
        {/* Toggle option for selling without stock constraint */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2.5 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 self-start sm:self-auto">
          <label className="text-[11px] md:text-xs font-bold text-slate-600 cursor-pointer select-none" htmlFor="allow-negative-stock-toggle">
            Vender sem estoque
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
      </div>

      {/* Message banners */}
      {successMessage && (
        <div id="sale-success-alert" className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Venda realizada com sucesso!</p>
            <p className="text-xs text-emerald-700 mt-0.5">Estoque atualizado e transação registrada.</p>
          </div>
        </div>
      )}

      {/* Persistent receipt button */}
      {lastSaleData && (
        <div className="flex gap-2 items-center">
          <button onClick={generateReceipt} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <Printer className="h-4 w-4" />
            Imprimir
          </button>
          <ReceiptPDF
            data={{
              saleId: `V${Date.now().toString(36).toUpperCase()}`,
              date: new Date(),
              items: lastSaleData.items,
              clientName: lastSaleData.clientName,
              clientPhone: lastSaleData.clientPhone,
              paymentMethod: lastSaleData.paymentMethod,
              subtotal: lastSaleData.subtotal,
              discount: lastSaleData.discount,
              total: lastSaleData.total,
              notes: lastSaleData.notes,
            }}
          />
          <button onClick={() => setLastSaleData(null)} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer">
            Dispensar
          </button>
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
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
            {/* Quick Search */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                id="catalog-search"
                type="text"
                placeholder="Pesquisar produto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-12 py-2.5 sm:py-2 text-sm bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-900 border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <button
                onClick={() => setShowScanner(true)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                title="Escanear código de barras"
              >
                <ScanBarcode className="h-5 w-5" />
              </button>
            </div>

            {/* Customer quick-select when searching */}
            {searchQuery.trim().length > 0 && customers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {customers
                  .filter(c => {
                    const q = normalizeName(searchQuery);
                    return normalizeName(c.name).includes(q) || (c.phone || '').replace(/\D/g, '').includes(searchQuery.replace(/\D/g, ''));
                  })
                  .slice(0, 5)
                  .map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setClientName(c.name); setClientPhone(c.phone || ''); }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Users className="h-3 w-3" />
                      {c.name}
                      {c.phone && <span className="text-[10px] font-mono opacity-60">{c.phone}</span>}
                    </button>
                  ))}
              </div>
            )}

            {/* Category selection */}
            <select
              id="catalog-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2.5 sm:py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 cursor-pointer"
            >
              <option value="all">Todas Categorias</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Catalog grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 max-h-[600px] overflow-y-auto pr-1">
            {filteredProducts.map(product => {
              const isService = isServiceProduct(product);
              const isOut = !isService && product.stock <= 0;
              const isLow = !isService && product.stock <= product.minStock;
              
              // Count of this product currently in cart
              const inCartItem = cart.find(item => item.product.id === product.id);
              const inCartQty = inCartItem ? inCartItem.quantity : 0;

              return (
                <div 
                  key={product.id}
                  onClick={() => handleAddToCart(product)}
                  className={`bg-white p-2.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative group select-none ${
                        isOut
                          ? allowNegativeStock
                            ? 'border-amber-300 bg-amber-50/30 hover:border-amber-400'
                            : 'opacity-75 border-rose-200 bg-rose-50/20 hover:border-rose-300'
                          : 'hover:border-indigo-500'
                      }`}
                >
                  {/* Cart count badge */}
                  {inCartQty > 0 && (
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-indigo-600 text-white font-mono font-bold text-[9px] rounded-full shadow-xs">
                      {inCartQty}x
                    </span>
                  )}

                  <div>
                    <span className="text-[9px] sm:text-[10px] font-mono font-semibold text-slate-400 block uppercase truncate">{product.category}</span>
                    <h3 className="font-bold text-slate-900 mt-0.5 line-clamp-2 group-hover:text-indigo-600 transition-colors text-xs sm:text-sm leading-tight" title={product.name}>
                      {product.name}
                    </h3>
                    <p className="text-[9px] font-mono text-slate-400 mt-0.5 hidden sm:block">SKU: {product.code}</p>
                  </div>

                  <div className="mt-2 sm:mt-4 flex items-end justify-between">
                    <div>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block">Preço</span>
                      <span className="text-sm sm:text-base font-extrabold text-slate-950 font-mono">
                        {product.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      {isService ? (
                        <span className="px-2 py-1 bg-sky-100 text-sky-800 text-[10px] font-bold rounded-md block border border-sky-200/50">
                          Serviço
                        </span>
                      ) : isOut ? (
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
          <div className="bg-indigo-950 p-3 sm:p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
              <h2 className="font-bold text-[11px] sm:text-xs uppercase tracking-wider">Carrinho</h2>
            </div>
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold rounded-full border border-emerald-500/30">
              {totalItemsCount} item(ns)
            </span>
          </div>

          {/* Cart Lines list */}
          <div className="p-3 sm:p-4 border-b border-slate-200 max-h-[280px] overflow-y-auto space-y-2 sm:space-y-3 flex-1">
            {cart.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-slate-400">
                <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 mx-auto stroke-1 mb-2 text-slate-300" />
                <p className="text-xs sm:text-sm font-medium">O carrinho está vazio.</p>
                <p className="text-[10px] sm:text-xs mt-1">Selecione produtos no catálogo.</p>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-2.5 sm:p-3 bg-slate-50 rounded-lg border border-slate-200/60">
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
                    list="customer-suggestions"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  <datalist id="customer-suggestions">
                    {customers.map(c => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
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

            {/* Collapsible Client Details Section */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setShowClientDetails(!showClientDetails)}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-100 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="h-3.5 w-3.5 text-indigo-600" />
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Dados do Cliente (Opcional)</span>
                </div>
                {showClientDetails ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </button>
              
              {showClientDetails && (
                <div className="p-3 space-y-3 bg-white">
                  {/* CPF/CNPJ */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">CPF / CNPJ</label>
                    <input
                      id="client-cpf"
                      type="text"
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      value={clientCPF}
                      onChange={(e) => setClientCPF(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email</label>
                    <input
                      id="client-email"
                      type="email"
                      placeholder="cliente@email.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Endereço</label>
                    <input
                      id="client-address"
                      type="text"
                      placeholder="Rua, número, bairro, cidade"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Canal de Venda (Sales Channel) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Canal de Venda</label>
              <div className="grid grid-cols-3 gap-1.5">
                {Object.entries(saleChannelLabels).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSaleChannel(value)}
                    className={`px-2 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                      saleChannel === value
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* E-commerce Order ID (only for e-commerce channels) */}
            {isEcommerceChannel(saleChannel) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <label className="block text-[10px] font-bold text-amber-700 uppercase mb-1">
                  ID do Pedido <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="ecommerce-order-id"
                    type="text"
                    required
                    placeholder={`ID do pedido ${saleChannel === 'Shopee' ? '(SHOPEE-...)' : saleChannel === 'TikTok' ? '(TIKTOK-...)' : 'Ex: #12345'}`}
                    value={ecommerceOrderId}
                    onChange={(e) => setEcommerceOrderId(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono"
                  />
                </div>
                <p className="text-[10px] text-amber-600 mt-1">ID do pedido no {saleChannel}.</p>
              </div>
            )}

            {/* Tracking Code (only for e-commerce channels) */}
            {isEcommerceChannel(saleChannel) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="block text-[10px] font-bold text-blue-700 uppercase mb-1">
                  Código de Rastreio
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="tracking-code"
                    type="text"
                    placeholder="Ex: AA123456789BR"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-blue-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                  />
                </div>
                <p className="text-[10px] text-blue-600 mt-1">Código dos Correios para rastrear o pedido.</p>
              </div>
            )}

            {/* Sale Type selector (visible for all channels) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tipo de Venda (Declaração Imposto)</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSaleType('CPF')}
                  className={`px-2 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                    saleType === 'CPF'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  CPF - Consumidor Final
                </button>
                <button
                  type="button"
                  onClick={() => setSaleType('CNPJ')}
                  className={`px-2 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                    saleType === 'CNPJ'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  CNPJ - Revenda / Empresa
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">E-commerce é automaticamente definido como CNPJ. Lojas físicas como CPF.</p>
            </div>

            {/* Payment Method & Discount percent */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <div className="space-y-2">
                  {/* Quick-select percentage buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {[0, 5, 10, 15, 20, 30].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleQuickDiscount(pct)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                          discountPercent === pct && customDiscountInput === ''
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>

                  {/* Custom discount input */}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                      <Tag className="h-3.5 w-3.5" />
                    </span>
                    <input
                      id="custom-discount-input"
                      type="number"
                      min="0"
                      max="50"
                      step="0.5"
                      placeholder="Desconto Personalizado (%)"
                      value={customDiscountInput}
                      onChange={(e) => handleCustomDiscountChange(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 font-mono"
                    />
                  </div>

                  {/* Discount amount indicator in R$ */}
                  {discountPercent > 0 && (
                    <div className="flex items-center justify-between text-[10px] px-2 py-1 bg-rose-50 rounded-md border border-rose-200/60">
                      <span className="text-rose-600 font-medium">
                        Desconto: {discountPercent}%
                      </span>
                      <span className="text-rose-700 font-bold font-mono">
                        -{discountAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  )}

                  {/* Max discount warning */}
                  {showMaxDiscountWarning && (
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Desconto máximo permitido: 50%. Valor ajustado.</span>
                    </div>
                  )}
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

            {/* Sell on credit (pending payment) */}
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={creditSale}
                onChange={(e) => setCreditSale(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                Venda a prazo (fiado / pendente)
              </span>
            </label>

            {/* Submit checkout button */}
            <button
              id="confirm-checkout-btn"
              type="submit"
              disabled={cart.length === 0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              {creditSale ? 'Registrar Venda a Prazo' : 'Finalizar Venda'}
            </button>

          </form>
        </div>

      </div>

      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onDetected={handleBarcodeDetected}
      />
    </div>
  );
}