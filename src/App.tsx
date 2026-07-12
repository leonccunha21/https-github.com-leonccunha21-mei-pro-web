import React, { useState, useEffect } from 'react';
import { 
  Product, 
  Sale, 
  Category, 
  ActiveTab, 
  PaymentMethod 
} from './types';
import { 
  initialProducts, 
  initialSales, 
  initialCategories 
} from './data';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Sales from './components/Sales';
import SalesHistory from './components/SalesHistory';
import Reports from './components/Reports';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  BarChart3, 
  Store,
  Clock,
  Cloud,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import appVersion from '../package.json';

// Firebase Imports
import { 
  initAuth, 
  googleSignIn, 
  logoutUser 
} from './lib/firebase';
import { 
  loadUserProducts, 
  loadUserCategories, 
  loadUserSales, 
  saveUserProduct, 
  saveUserCategory, 
  saveUserSale, 
  deleteUserProduct,
  clearUserProducts,
  clearUserCategories,
  clearUserSales
} from './lib/dbSync';

export default function App() {
  // State Initialization
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Firebase auth & cloud loading states
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loadingCloud, setLoadingCloud] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const loadingCloudRef = React.useRef<boolean>(false);

  // Initial local storage fallback loading
  useEffect(() => {
    if (!user) {
      const savedProducts = localStorage.getItem('loja_products');
      const savedSales = localStorage.getItem('loja_sales');
      const savedCategories = localStorage.getItem('loja_categories');

      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        setProducts(initialProducts);
        localStorage.setItem('loja_products', JSON.stringify(initialProducts));
      }

      if (savedSales) {
        setSales(JSON.parse(savedSales));
      } else {
        setSales(initialSales);
        localStorage.setItem('loja_sales', JSON.stringify(initialSales));
      }

      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      } else {
        setCategories(initialCategories);
        localStorage.setItem('loja_categories', JSON.stringify(initialCategories));
      }
    }
  }, [user]);

  // Sync Cloud Data
  const loadCloudData = async (uid: string) => {
    if (loadingCloudRef.current) return;
    loadingCloudRef.current = true;
    setLoadingCloud(true);
    try {
      const cloudProducts = await loadUserProducts(uid);
      const cloudCategories = await loadUserCategories(uid);
      const cloudSales = await loadUserSales(uid);

      if (cloudProducts.length > 0 || cloudCategories.length > 0 || cloudSales.length > 0) {
        setProducts(cloudProducts);
        setCategories(cloudCategories);
        setSales(cloudSales);
        localStorage.setItem('loja_products', JSON.stringify(cloudProducts));
        localStorage.setItem('loja_sales', JSON.stringify(cloudSales));
        localStorage.setItem('loja_categories', JSON.stringify(cloudCategories));
      } else {
        const localProducts = localStorage.getItem('loja_products');
        const localSales = localStorage.getItem('loja_sales');
        const localCategories = localStorage.getItem('loja_categories');

        const parsedProducts: Product[] = localProducts ? JSON.parse(localProducts) : initialProducts;
        const parsedSales: Sale[] = localSales ? JSON.parse(localSales) : initialSales;
        const parsedCategories: Category[] = localCategories ? JSON.parse(localCategories) : initialCategories;

        // Always set state first so the user sees data immediately
        setProducts(parsedProducts);
        setCategories(parsedCategories);
        setSales(parsedSales);
        localStorage.setItem('loja_products', JSON.stringify(parsedProducts));
        localStorage.setItem('loja_sales', JSON.stringify(parsedSales));
        localStorage.setItem('loja_categories', JSON.stringify(parsedCategories));

        // Then upload to cloud in background (resilient - individual failures don't block)
        console.log(`Enviando ${parsedProducts.length} produtos, ${parsedCategories.length} categorias, ${parsedSales.length} vendas para a nuvem...`);
        let failedProducts = 0;
        for (const p of parsedProducts) {
          try { await saveUserProduct(uid, p); } catch { failedProducts++; }
        }
        let failedCategories = 0;
        for (const c of parsedCategories) {
          try { await saveUserCategory(uid, c); } catch { failedCategories++; }
        }
        let failedSales = 0;
        for (const s of parsedSales) {
          try { await saveUserSale(uid, s); } catch { failedSales++; }
        }
        console.log(`Upload concluído. Falhas: ${failedProducts} produtos, ${failedCategories} categorias, ${failedSales} vendas`);
      }
    } catch (err) {
      console.error("Erro ao carregar ou sincronizar dados da nuvem:", err);
    } finally {
      loadingCloudRef.current = false;
      setLoadingCloud(false);
    }
  };

  // Auth Listener setup
  useEffect(() => {
    const unsubscribe = initAuth(
      async (loggedInUser, token) => {
        setUser(loggedInUser);
        setAccessToken(token);
        await loadCloudData(loggedInUser.uid);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync state helpers
  const saveProductsToStorage = async (updatedProducts: Product[], changedProduct?: Product, isDeletedId?: string) => {
    setProducts(updatedProducts);
    localStorage.setItem('loja_products', JSON.stringify(updatedProducts));
    
    if (user) {
      if (isDeletedId) {
        await deleteUserProduct(user.uid, isDeletedId);
      } else if (changedProduct) {
        await saveUserProduct(user.uid, changedProduct);
      } else {
        // Full list overwrite - clear the collection and save new ones
        await clearUserProducts(user.uid);
        for (const p of updatedProducts) {
          await saveUserProduct(user.uid, p);
        }
      }
    }
  };

  const saveSalesToStorage = async (updatedSales: Sale[], changedSale?: Sale) => {
    setSales(updatedSales);
    localStorage.setItem('loja_sales', JSON.stringify(updatedSales));
    
    if (user) {
      if (changedSale) {
        await saveUserSale(user.uid, changedSale);
      } else {
        // Full list overwrite - clear the collection and save new ones
        await clearUserSales(user.uid);
        for (const s of updatedSales) {
          await saveUserSale(user.uid, s);
        }
      }
    }
  };

  const saveCategoriesToStorage = async (updatedCategories: Category[], changedCategory?: Category) => {
    setCategories(updatedCategories);
    localStorage.setItem('loja_categories', JSON.stringify(updatedCategories));
    
    if (user) {
      if (changedCategory) {
        await saveUserCategory(user.uid, changedCategory);
      } else {
        // Full list overwrite - clear the collection and save new ones
        await clearUserCategories(user.uid);
        for (const c of updatedCategories) {
          await saveUserCategory(user.uid, c);
        }
      }
    }
  };

  // Clock tick
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- GOOGLE AUTH HANDLERS ---
  const handleGoogleLogin = async () => {
    setLoginError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
      }
    } catch (error: any) {
      console.error("Erro no login com Google:", error);
      let msg = 'Erro ao fazer login com Google.';
      if (error?.code === 'auth/unauthorized-domain') {
        msg = 'Domínio não autorizado. Adicione este domínio no Firebase Console > Authentication > Settings > Authorized Domains.';
      } else if (error?.code === 'auth/popup-blocked') {
        msg = 'Popup bloqueado pelo navegador. Permita popups para este site.';
      } else if (error?.code === 'auth/popup-closed-by-user') {
        msg = 'Janela de login fechada antes de concluir.';
      } else if (error?.message) {
        msg = 'Erro: ' + error.message;
      }
      setLoginError(msg);
    }
  };

  const handleGoogleLogout = async () => {
    if (window.confirm("Deseja realmente desconectar sua conta?")) {
      await logoutUser();
      setUser(null);
      setAccessToken(null);
      
      // Reload local values
      const savedProducts = localStorage.getItem('loja_products');
      const savedSales = localStorage.getItem('loja_sales');
      const savedCategories = localStorage.getItem('loja_categories');

      setProducts(savedProducts ? JSON.parse(savedProducts) : initialProducts);
      setSales(savedSales ? JSON.parse(savedSales) : initialSales);
      setCategories(savedCategories ? JSON.parse(savedCategories) : initialCategories);
    }
  };

  // --- ACTIONS ---

  // Add Product
  const handleAddProduct = (newProductData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: `p_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newProduct, ...products];
    saveProductsToStorage(updated, newProduct);
  };

  // Update Product
  const handleUpdateProduct = (updatedProduct: Product) => {
    const updated = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    saveProductsToStorage(updated, updatedProduct);
  };

  // Delete Product
  const handleDeleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    saveProductsToStorage(updated, undefined, id);
  };

  // Add Category
  const handleAddCategory = (categoryName: string) => {
    const newCategory: Category = {
      id: `cat_${Date.now()}`,
      name: categoryName
    };
    const updated = [...categories, newCategory];
    saveCategoriesToStorage(updated, newCategory);
  };

  // Register New Sale (and deduct stock)
  const handleRegisterSale = (saleData: {
    items: any[];
    clientName?: string;
    clientPhone?: string;
    paymentMethod: PaymentMethod;
    discount: number;
    notes?: string;
  }) => {
    // 1. Calculate costs and prices
    const subtotal = saleData.items.reduce((acc, item) => acc + item.total, 0);
    const discountAmount = (subtotal * saleData.discount) / 100;
    const finalTotal = Math.max(0, subtotal - discountAmount);

    const totalCost = saleData.items.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0);
    const profit = finalTotal - totalCost;

    // 2. Generate sale object
    const newSale: Sale = {
      id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString(),
      items: saleData.items,
      clientName: saleData.clientName,
      clientPhone: saleData.clientPhone,
      paymentMethod: saleData.paymentMethod,
      total: finalTotal,
      totalCost,
      profit,
      status: 'completed',
      notes: saleData.notes
    };

    // 3. Deduct stock quantities from inventory products
    const updatedProducts = products.map(p => {
      const soldItem = saleData.items.find(item => item.productId === p.id);
      if (soldItem) {
        return {
          ...p,
          stock: Math.max(0, p.stock - soldItem.quantity)
        };
      }
      return p;
    });

    saveProductsToStorage(updatedProducts, undefined); // sync stock update to all products
    saveSalesToStorage([newSale, ...sales], newSale);
  };

  // Cancel/Refund Sale (and restore stock)
  const handleCancelSale = (saleId: string) => {
    const updatedSales = sales.map(s => {
      if (s.id === saleId) {
        return {
          ...s,
          status: 'cancelled' as const
        };
      }
      return s;
    });

    // Find the cancelled sale to get quantities
    const cancelledSale = sales.find(s => s.id === saleId);
    if (!cancelledSale) return;

    // Restore stock quantities
    const updatedProducts = products.map(p => {
      const refundedItem = cancelledSale.items.find(item => item.productId === p.id);
      if (refundedItem) {
        return {
          ...p,
          stock: p.stock + refundedItem.quantity
        };
      }
      return p;
    });

    saveProductsToStorage(updatedProducts, undefined);
    saveSalesToStorage(updatedSales, { ...cancelledSale, status: 'cancelled' });
  };

  // Import whole database from external source
  const handleImportDatabase = (imported: { products: Product[]; sales: Sale[]; categories: Category[] }) => {
    saveProductsToStorage(imported.products);
    saveSalesToStorage(imported.sales);
    saveCategoriesToStorage(imported.categories);
  };

  // Reset database to initial mock settings
  const handleResetDatabase = () => {
    saveProductsToStorage(initialProducts);
    saveSalesToStorage(initialSales);
    saveCategoriesToStorage(initialCategories);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 antialiased font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-white text-slate-800 shrink-0 border-r border-slate-200 flex flex-col justify-between z-10 py-2">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-slate-100 flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shrink-0">
              <div className="w-4 h-4 border-2 border-white"></div>
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight text-slate-950">GESTÃO.PRO</h2>
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Gestão Comercial</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {/* Tab 1: Dashboard */}
            <button
              id="nav-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-indigo-50 text-indigo-700 font-bold' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Painel Geral
            </button>

            {/* Tab 2: Products */}
            <button
              id="nav-products"
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'products' 
                  ? 'bg-indigo-50 text-indigo-700 font-bold' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Package className="h-4 w-4" />
              Estoque
            </button>

            {/* Tab 3: Sales (POS) */}
            <button
              id="nav-pos"
              onClick={() => setActiveTab('pos')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'pos' 
                  ? 'bg-indigo-50 text-indigo-700 font-bold' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              Frente de Caixa
            </button>

            {/* Tab 4: Sales History */}
            <button
              id="nav-sales"
              onClick={() => setActiveTab('sales')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'sales' 
                  ? 'bg-indigo-50 text-indigo-700 font-bold' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <History className="h-4 w-4" />
              Vendas
            </button>

            {/* Tab 5: Reports */}
            <button
              id="nav-reports"
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'reports' 
                  ? 'bg-indigo-50 text-indigo-700 font-bold' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Relatórios
            </button>
          </nav>
        </div>

        {/* Firebase & Google Account Sync Box */}
        <div className="px-4 py-2 border-t border-slate-100 flex flex-col gap-2.5">
          {loadingCloud ? (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-semibold">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
              <span>Sincronizando Nuvem...</span>
            </div>
          ) : user ? (
            <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 flex items-center gap-3">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName} 
                  className="w-8 h-8 rounded-full border border-indigo-200" 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate leading-snug">{user.displayName || 'Minha Loja'}</p>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Nuvem Ativa
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Modo Offline</p>
              <p className="text-[10px] text-slate-400 leading-normal">Dados salvos localmente. Conecte sua conta para salvar na nuvem e usar planilhas.</p>
              {loginError && (
                <p className="text-[10px] text-rose-600 leading-normal bg-rose-50 p-2 rounded-lg border border-rose-100">{loginError}</p>
              )}
              <button 
                onClick={handleGoogleLogin}
                className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                Conectar Conta Google
              </button>
            </div>
          )}
        </div>

        {/* Footer info box (time, date and version) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 space-y-1.5 hidden md:block m-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-indigo-600" />
            <span className="font-semibold font-mono text-slate-800">{currentTime || '12:00'}</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
          <p className="text-[10px] text-slate-300 font-mono mt-1">v{appVersion.version}</p>
        </div>
      </aside>

      {/* MAIN CONTENT DISPLAY */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'dashboard' && (
              <Dashboard 
                products={products} 
                sales={sales} 
                onNavigate={(tab) => {
                  if (tab === 'products') setActiveTab('products');
                  if (tab === 'pos') setActiveTab('pos');
                  if (tab === 'sales') setActiveTab('sales');
                }}
              />
            )}

            {activeTab === 'products' && (
              <Products 
                products={products}
                categories={categories}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onAddCategory={handleAddCategory}
              />
            )}

            {activeTab === 'pos' && (
              <Sales 
                products={products} 
                onRegisterSale={handleRegisterSale}
                onNavigate={(tab) => {
                  if (tab === 'products') setActiveTab('products');
                }}
              />
            )}

            {activeTab === 'sales' && (
              <SalesHistory 
                sales={sales} 
                products={products}
                onCancelSale={handleCancelSale}
              />
            )}

            {activeTab === 'reports' && (
              <Reports 
                products={products}
                sales={sales}
                categories={categories}
                user={user}
                accessToken={accessToken}
                onGoogleLogin={handleGoogleLogin}
                onGoogleLogout={handleGoogleLogout}
                onImportDatabase={handleImportDatabase}
                onResetDatabase={handleResetDatabase}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}
