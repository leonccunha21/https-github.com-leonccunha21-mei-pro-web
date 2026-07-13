import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Product, 
  Sale, 
  Category, 
  Expense,
  ActiveTab, 
  PaymentMethod,
  StoreInfo
} from './types';
import { initialProducts, initialSales, initialCategories, initialExpenses } from './data';

import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Sales from './components/Sales';
import SalesHistory from './components/SalesHistory';
import Reports from './components/Reports';
import Settings from './components/Settings';
import OsOrcamento from './components/OsOrcamento';
import Debtors from './components/Debtors';
import CashFlow from './components/CashFlow';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  BarChart3, 
  Settings as SettingsIcon,
  ClipboardList,
  Clock,
  Cloud,
  Loader2,
  Sun,
  Moon,
  PackageSearch,
  Users,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import appVersion from '../package.json';

// Firebase Imports
import { 
  initAuth, 
  googleSignIn, 
  logoutUser 
} from './lib/firebase';
import { categorizeProduct } from './lib/categorize';
import { roundCurrency } from './lib/currency';
import { 
  loadUserProducts, 
  loadUserCategories, 
  loadUserSales,
  loadUserStoreInfo,
  saveUserProduct, 
  saveUserCategory, 
  saveUserSale, 
  saveUserStoreInfo,
  deleteUserProduct,
  clearUserProducts,
  clearUserCategories,
  clearUserSales
} from './lib/dbSync';

// Utility to fix floating point issues (e.g., 0.92999 → 0.93)

export default function App() {
  // State Initialization
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Firebase auth & cloud loading states
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [loadingCloud, setLoadingCloud] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const loadingCloudRef = React.useRef<boolean>(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [showVendasEstoque, setShowVendasEstoque] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [storeInfo, setStoreInfo] = useState(() => {
    try { return JSON.parse(localStorage.getItem('zm_store_info') || '{}') as { logoUrl?: string; name?: string }; } catch { return {} as { logoUrl?: string; name?: string }; }
  });
  useEffect(() => {
    const handler = () => {
      try { setStoreInfo(JSON.parse(localStorage.getItem('zm_store_info') || '{}')); } catch {}
    };
    window.addEventListener('storeInfoChanged', handler);
    return () => window.removeEventListener('storeInfoChanged', handler);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('darkMode', String(next));
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, []);

  // Auth gate: only load data when user is properly authenticated
  useEffect(() => {
    if (!authInitialized) return;
    if (!user) {
      setProducts([]);
      setSales([]);
      setCategories([]);
      return;
    }

    // For cloud users, cloud data will be loaded by loadCloudData
    // Clear to avoid showing stale data while cloud loads
    setProducts([]);
    setSales([]);
    setCategories([]);
  }, [user, authInitialized]);

  // Stock cleanup: deduplicate and remove empty products (runs once)
  useEffect(() => {
    if (localStorage.getItem('stock_cleanup_v2_done')) return;
    setProducts(prev => {
      if (prev.length === 0) return prev;
      const cleaned = runStockCleanup(prev);
      if (cleaned.length !== prev.length || cleaned.some((p, i) => prev[i]?.id !== p.id || prev[i]?.stock !== p.stock)) {
        localStorage.setItem('loja_products', JSON.stringify(cleaned));
        return cleaned;
      }
      return prev;
    });
    localStorage.setItem('stock_cleanup_v2_done', 'true');
  }, []);

  // Category fix: re-categorize products based on their name (runs once on local data)
  useEffect(() => {
    if (localStorage.getItem('category_fix_v1_done')) return;
    setProducts(prev => {
      if (prev.length === 0) return prev;
      const fixed = prev.map(p => {
        const correct = categorizeProduct(p.name);
        return p.category === correct ? p : { ...p, category: correct };
      });
      const changed = fixed.some((p, i) => prev[i]?.id !== p.id || prev[i]?.category !== p.category);
      if (changed) {
        localStorage.setItem('loja_products', JSON.stringify(fixed));
        return fixed;
      }
      return prev;
    });
    localStorage.setItem('category_fix_v1_done', 'true');
  }, []);

  // Sync Cloud Data
  const loadCloudData = async (uid: string) => {
    if (loadingCloudRef.current) return;
    loadingCloudRef.current = true;
    setLoadingCloud(true);

    // 1. Always load local data first so the user sees something immediately
    const localProducts = localStorage.getItem('loja_products');
    const localSales = localStorage.getItem('loja_sales');
    const localExpenses = localStorage.getItem('loja_expenses');
    const localCategories = localStorage.getItem('loja_categories');
    const localStoreInfo = localStorage.getItem('zm_store_info');
    const deletedProductIds = JSON.parse(localStorage.getItem('loja_deleted_products') || '[]');

    let parsedProducts: Product[] = initialProducts;
    let parsedSales: Sale[] = initialSales;
    let parsedExpenses: Expense[] = initialExpenses;
    let parsedCategories: Category[] = initialCategories;
    let parsedStoreInfo: StoreInfo | null = null;

    try {
      if (localProducts) parsedProducts = JSON.parse(localProducts);
      if (localSales) parsedSales = JSON.parse(localSales);
      if (localExpenses) parsedExpenses = JSON.parse(localExpenses);
      if (localCategories) parsedCategories = JSON.parse(localCategories);
      if (localStoreInfo) parsedStoreInfo = JSON.parse(localStoreInfo);
    } catch {
      // Corrupted localStorage, use seed data
    }

    setProducts(parsedProducts);
    setCategories(parsedCategories);
    setSales(parsedSales);
    setExpenses(parsedExpenses);
    if (parsedStoreInfo) setStoreInfo(parsedStoreInfo);

    // 2. Try to load from cloud (parallelized)
    try {
      const [cloudProducts, cloudCategories, cloudSales, cloudStoreInfo] = await Promise.all([
        loadUserProducts(uid),
        loadUserCategories(uid),
        loadUserSales(uid),
        loadUserStoreInfo(uid),
      ]);

      // Merge StoreInfo: prefer cloud if it has more data, else local
      let finalStoreInfo = parsedStoreInfo;
      if (cloudStoreInfo && (Object.keys(cloudStoreInfo).some(k => cloudStoreInfo[k]) || !parsedStoreInfo)) {
        finalStoreInfo = { ...parsedStoreInfo, ...cloudStoreInfo };
        localStorage.setItem('zm_store_info', JSON.stringify(finalStoreInfo));
        setStoreInfo(finalStoreInfo);
      } else if (parsedStoreInfo && !cloudStoreInfo) {
        // Local has data, cloud doesn't - push to cloud
        await saveUserStoreInfo(uid, parsedStoreInfo);
      }

      if (cloudProducts.length > 0 || cloudCategories.length > 0 || cloudSales.length > 0) {
        // Merge local + cloud: keep everything from both sources, but respect deletions
        const localProductMap = new Map(parsedProducts.map(p => [p.id, p]));
        const cloudProductMap = new Map(cloudProducts.map(p => [p.id, p]));
        const deletedSet = new Set(deletedProductIds);

        // Merge products: local items + cloud items not in local AND not deleted
        const mergedProducts = [...parsedProducts];
        for (const cp of cloudProducts) {
          if (!localProductMap.has(cp.id) && !deletedSet.has(cp.id)) {
            const correct = categorizeProduct(cp.name);
            mergedProducts.push(cp.category === correct ? cp : { ...cp, category: correct });
          }
        }

        // Merge categories: union of both
        const localCatMap = new Map(parsedCategories.map(c => [c.id, c]));
        const mergedCategories = [...parsedCategories];
        for (const cc of cloudCategories) {
          if (!localCatMap.has(cc.id)) mergedCategories.push(cc);
        }

        // Merge sales: union of both
        const localSaleMap = new Map(parsedSales.map(s => [s.id, s]));
        const mergedSales = [...parsedSales];
        for (const cs of cloudSales) {
          if (!localSaleMap.has(cs.id)) mergedSales.push(cs);
        }

        console.log(`Sync: local ${parsedProducts.length}p/${parsedCategories.length}c/${parsedSales.length}s | cloud ${cloudProducts.length}p/${cloudCategories.length}c/${cloudSales.length}s | deleted ${deletedProductIds.length} | merged ${mergedProducts.length}p/${mergedCategories.length}c/${mergedSales.length}s`);

        setProducts(mergedProducts);
        setCategories(mergedCategories);
        setSales(mergedSales);
        localStorage.setItem('loja_products', JSON.stringify(mergedProducts));
        localStorage.setItem('loja_sales', JSON.stringify(mergedSales));
        localStorage.setItem('loja_categories', JSON.stringify(mergedCategories));

        // Push merged result to cloud (sync both directions)
        for (const p of mergedProducts) {
          try { await saveUserProduct(uid, p); } catch {}
        }
        for (const c of mergedCategories) {
          try { await saveUserCategory(uid, c); } catch {}
        }
        for (const s of mergedSales) {
          try { await saveUserSale(uid, s); } catch {}
        }

        // Also delete removed products from cloud
        for (const deletedId of deletedProductIds) {
          try { await deleteUserProduct(uid, deletedId); } catch {}
        }
      } else {
        console.log('Cloud vazia. Enviando dados locais...');
        let failedProducts = 0;
        for (const p of parsedProducts) {
          try { await saveUserProduct(uid, p); } catch (e) { failedProducts++; }
        }
        let failedCategories = 0;
        for (const c of parsedCategories) {
          try { await saveUserCategory(uid, c); } catch (e) { failedCategories++; }
        }
        let failedSales = 0;
        for (const s of parsedSales) {
          try { await saveUserSale(uid, s); } catch (e) { failedSales++; }
        }
        console.log(`Upload OK. Falhas: ${failedProducts}/${parsedProducts.length} produtos, ${failedCategories}/${parsedCategories.length} cats, ${failedSales}/${parsedSales.length} vendas`);
      }
    } catch (err) {
      console.error("Erro na nuvem (usando dados locais):", err);
    } finally {
      loadingCloudRef.current = false;
      setLoadingCloud(false);
    }
  };

  // Auth Listener setup
  useEffect(() => {
    let cancelled = false;
    const unsubscribe = initAuth(
      async (loggedInUser, token) => {
        if (cancelled) return;
        setUser(loggedInUser);
        setAccessToken(token);
        setAuthInitialized(true);
        await loadCloudData(loggedInUser.uid);
      },
      () => {
        if (cancelled) return;
        setUser(null);
        setAccessToken(null);
        setAuthInitialized(true);
      }
    );
    return () => { cancelled = true; unsubscribe(); };
  }, []);

  // Sync state helpers
  const saveProductsToStorage = async (updatedProducts: Product[], changedProduct?: Product, isDeletedId?: string) => {
    setProducts(updatedProducts);
    localStorage.setItem('loja_products', JSON.stringify(updatedProducts));
    
    if (user) {
      try {
        if (isDeletedId) {
          await deleteUserProduct(user.uid, isDeletedId);
        } else if (changedProduct) {
          await saveUserProduct(user.uid, changedProduct);
        } else {
          for (const p of updatedProducts) {
            try { await saveUserProduct(user.uid, p); } catch {}
          }
        }
      } catch (e) {
        console.error('Erro ao sincronizar produtos com a nuvem:', e);
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

  const saveExpensesToStorage = (updatedExpenses: Expense[]) => {
    setExpenses(updatedExpenses);
    localStorage.setItem('loja_expenses', JSON.stringify(updatedExpenses));
  };

  const handleAddExpense = (expense: Expense) => {
    saveExpensesToStorage([expense, ...expenses]);
  };

  const handleDeleteExpense = (id: string) => {
    saveExpensesToStorage(expenses.filter(e => e.id !== id));
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
      
      // Clear data - user needs to login again
      localStorage.removeItem('loja_products');
      localStorage.removeItem('loja_sales');
      localStorage.removeItem('loja_categories');
      setProducts([]);
      setSales([]);
      setCategories([]);
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
    saveProductsToStorage(updated, newProduct).catch(() => {});
  };

  // Update Product
  const handleUpdateProduct = (updatedProduct: Product) => {
    const updated = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    saveProductsToStorage(updated, updatedProduct).catch(() => {});
  };

  // Archive Product (soft delete)
  const handleArchiveProduct = (id: string) => {
    const updated = products.map(p => {
      if (p.id === id) {
        return { ...p, archived: true, archivedAt: new Date().toISOString() };
      }
      return p;
    });
    saveProductsToStorage(updated, updated.find(p => p.id === id)).catch(() => {});
  };

  // Unarchive Product
  const handleUnarchiveProduct = (id: string) => {
    const updated = products.map(p => {
      if (p.id === id) {
        return { ...p, archived: false, archivedAt: undefined };
      }
      return p;
    });
    saveProductsToStorage(updated, updated.find(p => p.id === id)).catch(() => {});
  };

  // Delete Product - alias for archive (kept for compatibility)
  const handleDeleteProduct = handleArchiveProduct;

  const handleClearAllProducts = () => {
    const updated = products.map(p => ({ ...p, archived: true, archivedAt: new Date().toISOString() }));
    saveProductsToStorage(updated).catch(() => {});
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
    ecommerceOrderId?: string;
    saleType: 'CPF' | 'CNPJ';
    notes?: string;
  }) => {
    // 1. Calculate costs and prices with floating point fix
    const subtotal = roundCurrency(saleData.items.reduce((acc, item) => acc + item.total, 0));
    const discountAmount = roundCurrency((subtotal * saleData.discount) / 100);
    const finalTotal = Math.max(0, roundCurrency(subtotal - discountAmount));

    const totalCost = roundCurrency(saleData.items.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0));
    const profit = roundCurrency(finalTotal - totalCost);

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
      ecommerceOrderId: saleData.ecommerceOrderId,
      saleType: saleData.saleType,
      notes: saleData.notes
    };

    // 3. Deduct stock quantities from inventory products
    const changedProducts: Product[] = [];
    const updatedProducts = products.map(p => {
      const soldItem = saleData.items.find(item => item.productId === p.id);
      if (soldItem) {
        const updated = {
          ...p,
          stock: Math.max(0, p.stock - soldItem.quantity)
        };
        changedProducts.push(updated);
        return updated;
      }
      return p;
    });

    saveProductsToStorage(updatedProducts, undefined);
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
  const handleImportDatabase = (imported: { products: Product[]; sales: Sale[]; categories: Category[]; expenses?: Expense[] }) => {
    saveProductsToStorage(imported.products);
    saveSalesToStorage(imported.sales);
    saveCategoriesToStorage(imported.categories);
    if (imported.expenses) {
      saveExpensesToStorage(imported.expenses);
    }
  };

  // Reset database to empty
  const handleResetDatabase = () => {
    saveProductsToStorage([]);
    saveSalesToStorage([]);
    saveCategoriesToStorage([]);
    saveExpensesToStorage([]);
    setActiveTab('dashboard');
  };

  // --- STOCK CLEANUP ---
  function runStockCleanup(productsToClean: Product[]): Product[] {
    // Step 1 & 2: Merge by normalized name (case-insensitive, trimmed)
    const byName = new Map<string, Product[]>();
    for (const p of productsToClean) {
      const key = p.name.trim().toLowerCase();
      if (!byName.has(key)) byName.set(key, []);
      byName.get(key)!.push(p);
    }
    let merged: Product[] = [];
    for (const group of byName.values()) {
      if (group.length === 1) {
        merged.push(group[0]);
        continue;
      }
      // Keep the one with highest stock; sum stock from duplicates
      group.sort((a, b) => b.stock - a.stock);
      const best = { ...group[0] };
      for (let i = 1; i < group.length; i++) {
        best.stock += group[i].stock;
        if (best.costPrice === 0 && group[i].costPrice > 0) best.costPrice = group[i].costPrice;
        if (best.salePrice === 0 && group[i].salePrice > 0) best.salePrice = group[i].salePrice;
      }
      merged.push(best);
    }

    // Step 3: Remove products with stock=0 AND salePrice=0
    const cleaned = merged.filter(p => !(p.stock === 0 && p.salePrice === 0));
    return cleaned;
  }

  // --- VERIFICAR VENDAS X ESTOQUE ---
  const missingProducts = useMemo(() => {
    if (!showVendasEstoque) return [];
    const productNamesLower = new Set(products.map(p => p.name.trim().toLowerCase()));
    const completedSales = sales.filter(s => s.status === 'completed');
    const soldMap = new Map<string, { name: string; quantity: number; salePrice: number; costPrice: number }>();
    for (const sale of completedSales) {
      for (const item of sale.items) {
        const key = item.productName.trim().toLowerCase();
        if (productNamesLower.has(key)) continue;
        const existing = soldMap.get(key);
        if (existing) {
          existing.quantity += item.quantity;
          existing.salePrice = Math.max(existing.salePrice, item.salePrice);
          existing.costPrice = Math.max(existing.costPrice, item.costPrice);
        } else {
          soldMap.set(key, {
            name: item.productName.trim(),
            quantity: item.quantity,
            salePrice: item.salePrice,
            costPrice: item.costPrice
          });
        }
      }
    }
    return Array.from(soldMap.values());
  }, [showVendasEstoque, products, sales]);

  const suggestCategory = (name: string): string => categorizeProduct(name);

  const handleAddSingleMissingProduct = (item: { name: string; quantity: number; salePrice: number; costPrice: number }) => {
    const newProduct: Product = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      code: `SKU-${Date.now()}`,
      name: item.name,
      category: suggestCategory(item.name),
      costPrice: item.costPrice,
      salePrice: item.salePrice,
      stock: 0,
      minStock: 5,
      status: 'disponivel',
      createdAt: new Date().toISOString()
    };
    const updated = [newProduct, ...products];
    saveProductsToStorage(updated, newProduct);
  };

  const handleAddMissingProducts = () => {
    const newProducts: Product[] = missingProducts.map(item => ({
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      code: `SKU-${Date.now()}_${Math.random().toString(36).substring(2, 4)}`,
      name: item.name,
      category: suggestCategory(item.name),
      costPrice: item.costPrice,
      salePrice: item.salePrice,
      stock: 0,
      minStock: 5,
      status: 'disponivel',
      createdAt: new Date().toISOString()
    }));
    const updated = [...newProducts, ...products];
    saveProductsToStorage(updated);
    setShowVendasEstoque(false);
  };

  const handleExportMissingProducts = () => {
    const data = missingProducts.map(item => ({
      'Produto': item.name,
      'Categoria Sugerida': suggestCategory(item.name),
      'Qtd Vendida': item.quantity,
      'Preço Venda': item.salePrice,
      'Custo': item.costPrice
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Produtos Ausentes');
    XLSX.writeFile(wb, 'controle_vendas_estoque.xlsx');
  };

  // --- AUTH GATE: loading state ---
  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  // --- AUTH GATE: not logged in ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center mx-auto">
            <Cloud className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">GESTÃO.PRO</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Faça login para acessar o sistema</p>
          </div>

          {loginError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg border border-rose-100 dark:border-rose-800 text-left leading-relaxed">{loginError}</p>
          )}

          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-800 dark:text-slate-200 antialiased font-sans">

      {/* MOBILE TOP HEADER */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 px-4 py-3 shadow-sm">
        {storeInfo.logoUrl ? (
          <img src={storeInfo.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain shrink-0" />
        ) : (
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <div className="w-4 h-4 border-2 border-white"></div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-sm tracking-tight text-slate-950 dark:text-slate-100 truncate">{user ? 'ZM Store' : 'GESTÃO.PRO'}</h2>
          <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider">Gestão Comercial</span>
        </div>
        <button
          onClick={() => setShowVendasEstoque(true)}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
          title="Verificar Vendas x Estoque"
        >
          <PackageSearch className="h-5 w-5" />
        </button>
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={darkMode ? 'Modo claro' : 'Modo escuro'}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <span className="text-[8px] text-slate-300 font-mono">v{appVersion.version}</span>
      </header>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 flex items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {([
          { tab: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
          { tab: 'products', label: 'Estoque', icon: Package },
          { tab: 'pos', label: 'Caixa', icon: ShoppingCart },
          { tab: 'sales', label: 'Vendas', icon: History },
          { tab: 'settings', label: 'Menu', icon: SettingsIcon },
        ] as const).map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab && !mobileMenuOpen;
          const isMenu = item.tab === 'settings';
          return (
            <button
              key={item.tab}
              onClick={() => isMenu ? setMobileMenuOpen(!mobileMenuOpen) : setActiveTab(item.tab)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 px-1 transition-all cursor-pointer relative ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 dark:text-slate-500 active:text-slate-600'
              }`}
            >
              {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />}
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* MOBILE SLIDE-UP MENU for extra tabs */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-0 inset-x-0 bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl p-4 pb-[env(safe-area-inset-bottom)] animate-[slideUp_0.2s_ease-out]"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-4" />
            <div className="grid grid-cols-3 gap-3">
              {([
                { tab: 'reports', label: 'Relatórios', icon: BarChart3 },
                { tab: 'cashflow', label: 'Fluxo de Caixa', icon: DollarSign },
                { tab: 'os', label: 'OS / Orçamento', icon: ClipboardList },
                { tab: 'debtors', label: 'Devedores', icon: Users },
              ] as const).map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.tab}
                    onClick={() => { setActiveTab(item.tab); setMobileMenuOpen(false); }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
       {/* SIDEBAR NAVIGATION (Desktop) */}
       <aside className="hidden md:flex w-full md:w-64 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shrink-0 border-r border-slate-200 dark:border-slate-700 flex-col justify-between z-10 py-2">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 mb-6">
            {storeInfo.logoUrl ? (
              <img src={storeInfo.logoUrl} alt="Logo" className="w-8 h-8 rounded object-contain shrink-0" />
            ) : (
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shrink-0">
                <div className="w-4 h-4 border-2 border-white"></div>
              </div>
            )}
            <div className="flex-1">
              <h2 className="font-bold text-base tracking-tight text-slate-950 dark:text-slate-100">{user ? 'ZM Store' : 'GESTÃO.PRO'}</h2>
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Gestão Comercial</span>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={darkMode ? 'Modo claro' : 'Modo escuro'}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setShowVendasEstoque(true)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
              title="Verificar Vendas x Estoque"
            >
              <PackageSearch className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {/* Tab 1: Dashboard */}
            <button
              id="nav-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
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
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
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
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
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
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
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
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Relatórios
            </button>

            {/* Tab: Fluxo de Caixa */}
            <button
              id="nav-cashflow"
              onClick={() => setActiveTab('cashflow')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'cashflow' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <DollarSign className="h-4 w-4" />
              Fluxo de Caixa
            </button>

            {/* Tab 6: OS & Orçamentos */}
            <button
              id="nav-os"
              onClick={() => setActiveTab('os')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'os' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              OS / Orçamento
            </button>

            {/* Tab 7: Devedores */}
            <button
              id="nav-debtors"
              onClick={() => setActiveTab('debtors')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'debtors' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="h-4 w-4" />
              Devedores
            </button>

            {/* Tab 8: Settings */}
            <button
              id="nav-settings"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'settings' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <SettingsIcon className="h-4 w-4" />
              Configurações
            </button>
          </nav>
        </div>

        {/* Firebase & Google Account Sync Box */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-2.5">
          {loadingCloud ? (
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
              <span>Sincronizando Nuvem...</span>
            </div>
          ) : user ? (
            <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center gap-3">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName} 
                  className="w-8 h-8 rounded-full border border-indigo-200 dark:border-indigo-700" 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate leading-snug">{user.displayName || 'Minha Loja'}</p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Nuvem Ativa
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col gap-2">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sem Conexão</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">Faça login com sua conta Google para acessar seus dados na nuvem.</p>
              {loginError && (
                <p className="text-[10px] text-rose-600 dark:text-rose-400 leading-normal bg-rose-50 dark:bg-rose-900/20 p-2 rounded-lg border border-rose-100 dark:border-rose-800">{loginError}</p>
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
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-500 dark:text-slate-400 space-y-1.5 hidden md:block m-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-indigo-600" />
            <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">{currentTime || '12:00'}</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
          <p className="text-[10px] text-slate-300 font-mono mt-1">v{appVersion.version}</p>
        </div>
      </aside>

      {/* MAIN CONTENT DISPLAY */}
      <main className="flex-1 p-3 md:p-8 pb-28 md:pb-8 overflow-y-auto max-w-7xl mx-auto w-full bg-slate-50 dark:bg-slate-950">
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
                sales={sales}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onArchiveProduct={handleArchiveProduct}
                onUnarchiveProduct={handleUnarchiveProduct}
                onClearAllProducts={handleClearAllProducts}
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
                onUpdateSale={(updatedSale) => {
                  const updatedSales = sales.map(s => s.id === updatedSale.id ? updatedSale : s);
                  saveSalesToStorage(updatedSales, updatedSale);
                }}
              />
            )}

            {activeTab === 'reports' && (
              <Reports 
                products={products}
                sales={sales}
                categories={categories}
              />
            )}

            {activeTab === 'os' && (
              <OsOrcamento 
                products={products}
                storeInfo={storeInfo as StoreInfo}
                userId={user?.uid}
              />
            )}

            {activeTab === 'debtors' && (
              <Debtors 
                sales={sales}
                onUpdateSale={(updatedSale) => {
                  const updatedSales = sales.map(s => s.id === updatedSale.id ? updatedSale : s);
                  saveSalesToStorage(updatedSales, updatedSale);
                }}
              />
            )}

            {activeTab === 'cashflow' && (
              <CashFlow
                sales={sales}
                expenses={expenses}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
              />
            )}

            {activeTab === 'settings' && (
              <Settings 
                products={products}
                sales={sales}
                categories={categories}
                user={user}
                accessToken={accessToken}
                onGoogleLogin={handleGoogleLogin}
                onGoogleLogout={handleGoogleLogout}
                onImportDatabase={handleImportDatabase}
                onResetDatabase={handleResetDatabase}
                onSaveStoreInfo={saveUserStoreInfo}
                onLoadStoreInfo={() => loadUserStoreInfo(user?.uid || '')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* MODAL: Verificar Vendas x Estoque */}
      {showVendasEstoque && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <PackageSearch className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Verificar Vendas x Estoque</h2>
              </div>
              <button
                onClick={() => setShowVendasEstoque(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {missingProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✓</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Todos os produtos vendidos existem no catálogo!</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Nenhum produto ausente encontrado.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    {missingProducts.length} produto(s) vendido(s) que não existem no catálogo atual:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-2 px-3 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Produto</th>
                          <th className="text-left py-2 px-3 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoria Sugerida</th>
                          <th className="text-center py-2 px-3 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qtd Vendida</th>
                          <th className="text-right py-2 px-3 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Preço Venda</th>
                          <th className="text-right py-2 px-3 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Custo</th>
                          <th className="text-center py-2 px-3 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {missingProducts.map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{item.name}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-bold text-[10px] uppercase">
                                {suggestCategory(item.name)}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-slate-700 dark:text-slate-300">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">R$ {item.salePrice.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">R$ {item.costPrice.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => handleAddSingleMissingProduct(item)}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                              >
                                Cadastrar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {missingProducts.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
                <button
                  onClick={handleExportMissingProducts}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
                >
                  Exportar Controle
                </button>
                <button
                  onClick={handleAddMissingProducts}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Cadastrar Todos ({missingProducts.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
