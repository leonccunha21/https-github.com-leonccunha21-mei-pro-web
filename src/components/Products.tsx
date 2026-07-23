import React, { useState, useMemo } from 'react';
import { Product, Category, Sale, PriceHistoryEntry } from '../types';
import { categorizeProduct } from '../lib/categorize';
import LabelPrinter from './LabelPrinter';
import toast from 'react-hot-toast';
import {
  Plus, Search, Edit2, Trash2, AlertTriangle, Filter, Minus, ArrowUpRight,
  Sparkles, Barcode, X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  ArrowUpDown, CheckSquare, Square, Download, Layers, ClipboardCheck,
  Trash, Archive, RotateCcw, Boxes, Copy, Tag, Merge, MoreVertical, CheckCircle2
} from 'lucide-react';

type SortField = 'name' | 'category' | 'costPrice' | 'salePrice' | 'stock' | 'margin';
type SortDirection = 'asc' | 'desc';

interface ProductsProps {
  products: Product[];
  categories: Category[];
  sales: Sale[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onArchiveProduct: (id: string) => void;
  onUnarchiveProduct: (id: string) => void;
  onClearAllProducts?: () => void;
  onAddCategory: (categoryName: string) => void;
  onMergeProducts?: (keepId: string, duplicateIds: string[], newName: string, newCostPrice: number, newSalePrice: number) => void;
}

export default function Products({ products, categories, sales, onAddProduct, onUpdateProduct, onDeleteProduct, onArchiveProduct, onUnarchiveProduct, onClearAllProducts, onAddCategory, onMergeProducts }: ProductsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'ok'>('all');
  const [archivedFilter, setArchivedFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'category' | 'stock' | null>(null);
  const [bulkCategoryValue, setBulkCategoryValue] = useState('');
  const [bulkStockValue, setBulkStockValue] = useState(0);
  const [bulkActionType, setBulkActionType] = useState<'add' | 'sub'>('add');

  const [showStockCheck, setShowStockCheck] = useState(false);
  const [missingProducts, setMissingProducts] = useState<{ name: string; productId: string; qty: number; costPrice: number; salePrice: number; suggestedCategory: string }[]>([]);
  const [showLabelPrinter, setShowLabelPrinter] = useState(false);

  // --- Estados do modal de mesclagem de duplicatas ---
  const [showMergeModal, setShowMergeModal] = useState(false);
  // grupos de prováveis duplicatas detectados automaticamente
  const [mergeGroups, setMergeGroups] = useState<{ products: Product[] }[]>([]);
  // grupo sendo editado atualmente no wizard
  const [mergeStep, setMergeStep] = useState(0);
  // produtos selecionados para mesclar (checkboxes) - IDs
  const [mergeSelectedIds, setMergeSelectedIds] = useState<Set<string>>(new Set());
  // produto "principal" escolhido pelo usuário (entre os selecionados)
  const [mergeKeepId, setMergeKeepId] = useState('');
  // nome final do produto mesclado (editável)
  const [mergeName, setMergeName] = useState('');
  const [mergeCostPrice, setMergeCostPrice] = useState(0);
  const [mergeSalePrice, setMergeSalePrice] = useState(0);

  const [showPriceHistory, setShowPriceHistory] = useState<Product | null>(null);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formCostPrice, setFormCostPrice] = useState<number>(0);
  const [formSalePrice, setFormSalePrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(0);
  const [formMinStock, setFormMinStock] = useState<number>(1);
  const [formStatus, setFormStatus] = useState<'disponivel' | 'indisponivel'>('disponivel');
  const [formDescription, setFormDescription] = useState('');

  const generateSKU = (cat: string) => `${cat ? cat.substring(0, 3).toUpperCase() : 'PRO'}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormCode(generateSKU(categories[0]?.name || ''));
    setFormName(''); setFormCategory(categories[0]?.name || '');
    setFormCostPrice(0); setFormSalePrice(0); setFormStock(0); setFormMinStock(3); setFormStatus('disponivel'); setFormDescription('');
    setIsModalOpen(true);
  };

  const handleDuplicateProduct = (p: Product) => {
    setEditingProduct(null);
    setFormCode(generateSKU(p.category));
    setFormName(p.name); setFormCategory(p.category);
    setFormCostPrice(p.costPrice); setFormSalePrice(p.salePrice);
    setFormStock(p.stock); setFormMinStock(p.minStock); setFormStatus(p.status); setFormDescription(p.description || '');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormCode(p.code); setFormName(p.name); setFormCategory(p.category);
    setFormCostPrice(p.costPrice); setFormSalePrice(p.salePrice);
    setFormStock(p.stock); setFormMinStock(p.minStock); setFormStatus(p.status); setFormDescription(p.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCategory) return;
    const isService = /^servi/i.test(formCategory);
    const data = { code: formCode.trim() || generateSKU(formCategory), name: formName.trim(), category: formCategory, costPrice: Number(formCostPrice), salePrice: Number(formSalePrice), stock: isService ? 0 : Number(formStock), minStock: isService ? 0 : Number(formMinStock), status: formStatus, description: formDescription.trim() || undefined };
    if (editingProduct) {
      const history: PriceHistoryEntry[] = [...(editingProduct.priceHistory || [])];
      const now = new Date().toISOString();
      if (editingProduct.costPrice !== data.costPrice) {
        history.push({ date: now, field: 'costPrice', oldValue: editingProduct.costPrice, newValue: data.costPrice });
      }
      if (editingProduct.salePrice !== data.salePrice) {
        history.push({ date: now, field: 'salePrice', oldValue: editingProduct.salePrice, newValue: data.salePrice });
      }
      onUpdateProduct({ ...editingProduct, ...data, priceHistory: history });
    } else {
      onAddProduct(data);
    }
    setIsModalOpen(false);
  };
  function PriceHistoryModal({ product, onClose }: { product: Product; onClose: () => void }) {
    const history = product.priceHistory || [];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Histórico de Preços</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={20} /></button>
          </div>
          <p className="text-sm text-slate-500">{product.name} ({product.code})</p>
          {history.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Nenhuma alteração de preço registrada.</p>
          ) : (
            <div className="space-y-2">
              {[...history].reverse().map((h, i) => (
                <div key={i} className="text-sm bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>{new Date(h.date).toLocaleString('pt-BR')}</span>
                    <span className="font-semibold uppercase text-[10px]">{h.field === 'costPrice' ? 'Custo' : 'Venda'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-rose-500 line-through">R$ {h.oldValue.toFixed(2)}</span>
                    <ArrowUpRight size={14} className="text-slate-400" />
                    <span className="text-emerald-600 font-semibold">R$ {h.newValue.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={onClose} className="w-full py-2 text-sm font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer">Fechar</button>
        </div>
      </div>
    );
  }

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    onAddCategory(newCategoryName.trim());
    setNewCategoryName(''); setIsCategoryModalOpen(false);
  };

  const handleQuickStockAdjust = (p: Product, delta: number) => {
    onUpdateProduct({ ...p, stock: Math.max(0, p.stock + delta) });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
    setCurrentPage(1);
  };

  const calcMargin = (cost: number, sale: number) => sale > 0 ? ((sale - cost) / sale) * 100 : 0;

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchArchived = archivedFilter === 'all' || (archivedFilter === 'active' ? !p.archived : p.archived);
      let matchStock = true;
      if (stockFilter === 'low') matchStock = p.status !== 'indisponivel' && p.stock > 0 && p.stock <= p.minStock;
      else if (stockFilter === 'out') matchStock = p.status !== 'indisponivel' && p.stock === 0;
      else if (stockFilter === 'ok') matchStock = p.status !== 'indisponivel' && p.stock > p.minStock;
      const price = p.salePrice;
      const matchMin = !priceMin || price >= Number(priceMin);
      const matchMax = !priceMax || price <= Number(priceMax);
      return matchSearch && matchCat && matchArchived && matchStock && matchMin && matchMax;
    });
  }, [products, searchQuery, selectedCategory, archivedFilter, stockFilter, priceMin, priceMax]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    sorted.sort((a, b) => {
      let c = 0;
      switch (sortField) {
        case 'name': c = a.name.localeCompare(b.name, 'pt-BR'); break;
        case 'category': c = a.category.localeCompare(b.category, 'pt-BR'); break;
        case 'costPrice': c = a.costPrice - b.costPrice; break;
        case 'salePrice': c = a.salePrice - b.salePrice; break;
        case 'stock': c = a.stock - b.stock; break;
        case 'margin': c = calcMargin(a.costPrice, a.salePrice) - calcMargin(b.costPrice, b.salePrice); break;
      }
      return sortDirection === 'asc' ? c : -c;
    });
    return sorted;
  }, [filteredProducts, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filters change
  React.useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCategory, archivedFilter, stockFilter, priceMin, priceMax, itemsPerPage]);

  // Memoize expensive calculations
  const totalStock = React.useMemo(() => sortedProducts.reduce((s, p) => s + p.stock, 0), [sortedProducts]);
  const totalCostValue = React.useMemo(() => sortedProducts.reduce((s, p) => s + (p.costPrice * p.stock), 0), [sortedProducts]);
  const totalRetailValue = React.useMemo(() => sortedProducts.reduce((s, p) => s + (p.salePrice * p.stock), 0), [sortedProducts]);

  // Memoize stock filter counts
  const stockCounts = React.useMemo(() => ({
    all: products.length,
    low: products.filter(p => p.status !== 'indisponivel' && p.stock > 0 && p.stock <= p.minStock).length,
    out: products.filter(p => p.status !== 'indisponivel' && p.stock === 0).length,
    ok: products.filter(p => p.status !== 'indisponivel' && p.stock > p.minStock).length,
  }), [products]);

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedProducts.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginatedProducts.map(p => p.id)));
  };
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = () => {
    if (!window.confirm(`Excluir ${selectedIds.size} produtos selecionados?`)) return;
    selectedIds.forEach(id => onDeleteProduct(id));
    setSelectedIds(new Set());
  };
  const handleBulkCategory = () => {
    if (!bulkCategoryValue) return;
    const now = new Date().toISOString();
    selectedIds.forEach(id => {
      const p = products.find(p => p.id === id);
      if (p) onUpdateProduct({ ...p, category: bulkCategoryValue, updatedAt: now });
    });
    setSelectedIds(new Set()); setBulkAction(null);
  };
  const handleBulkStock = () => {
    const now = new Date().toISOString();
    selectedIds.forEach(id => {
      const p = products.find(p => p.id === id);
      if (p) {
        const newStock = bulkActionType === 'add' ? p.stock + bulkStockValue : Math.max(0, p.stock - bulkStockValue);
        onUpdateProduct({ ...p, stock: newStock, updatedAt: now });
      }
    });
    setSelectedIds(new Set()); setBulkAction(null);
  };

  const categoryNames = categories.map(c => c.name);

  const inferCategory = (productName: string): string => categorizeProduct(productName);

  const handleCheckStock = () => {
    const soldItemsMap: Record<string, { name: string; productId: string; qty: number; costPrice: number; salePrice: number }> = {};
    sales.filter(s => s.status === 'completed').forEach(sale => {
      sale.items.forEach(item => {
        const key = item.productId === 'p_temp' ? `name:${item.productName.toLowerCase()}` : item.productId;
        if (!soldItemsMap[key]) {
          soldItemsMap[key] = { name: item.productName, productId: item.productId, qty: 0, costPrice: item.costPrice, salePrice: item.salePrice };
        }
        soldItemsMap[key].qty += item.quantity;
        if (item.costPrice > 0) soldItemsMap[key].costPrice = item.costPrice;
        if (item.salePrice > 0) soldItemsMap[key].salePrice = item.salePrice;
      });
    });

    const missing: typeof missingProducts = [];
    Object.values(soldItemsMap).forEach(soldItem => {
      const inStock = products.find(p => 
        p.id === soldItem.productId || 
        p.name.toLowerCase() === soldItem.name.toLowerCase()
      );
      if (!inStock) {
        missing.push({
          name: soldItem.name,
          productId: soldItem.productId,
          qty: soldItem.qty,
          costPrice: soldItem.costPrice,
          salePrice: soldItem.salePrice,
          suggestedCategory: inferCategory(soldItem.name)
        });
      }
    });

    setMissingProducts(missing.sort((a, b) => b.qty - a.qty));
    setShowStockCheck(true);
  };

  const handleRegisterMissing = (item: typeof missingProducts[0]) => {
    const sku = generateSKU(item.suggestedCategory);
    onAddProduct({
      code: sku,
      name: item.name,
      category: item.suggestedCategory,
      costPrice: item.costPrice,
      salePrice: item.salePrice,
      stock: 0,
      minStock: 3,
      status: 'disponivel',
      description: `Auto-cadastrado a partir de vendas (${item.qty} un. vendidas)`
    });
    setMissingProducts(prev => prev.filter(m => m.name !== item.name || m.productId !== item.productId));
  };

  const handleRegisterAllMissing = () => {
    missingProducts.forEach(item => {
      const sku = generateSKU(item.suggestedCategory);
      onAddProduct({
        code: sku,
        name: item.name,
        category: item.suggestedCategory,
        costPrice: item.costPrice,
        salePrice: item.salePrice,
        stock: 0,
        minStock: 3,
        status: 'disponivel',
        description: `Auto-cadastrado a partir de vendas (${item.qty} un. vendidas)`
      });
    });
    setMissingProducts([]);
    setShowStockCheck(false);
  };

  const handleExportMissing = async () => {
    const XLSX = await import('xlsx');
    const headers = ['Produto', 'Categoria Sugerida', 'Qtd Vendida', 'Custo', 'Venda', 'Status'];
    const rows = missingProducts.map(p => [p.name, p.suggestedCategory, p.qty, p.costPrice, p.salePrice, 'Não cadastrado']);
    const existingRows = products.map(p => [p.name, p.category, '-', p.costPrice, p.salePrice, 'Cadastrado']);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([headers, ...rows, ...existingRows]), 'Controle Estoque');
    XLSX.writeFile(wb, `controle_estoque_${new Date().toISOString().substring(0, 10)}.xlsx`);
  };

  const handleClearAllStock = () => {
    if (!window.confirm('Tem certeza que deseja REMOVER TODOS os produtos do estoque? Esta ação não pode ser desfeita.\n\nRecomenda-se exportar os dados antes (use o botão Exportar).')) return;
    if (!window.confirm('CONFIRMAÇÃO FINAL: Deseja realmente excluir TODOS os ' + products.length + ' produtos permanentemente?')) return;
    onClearAllProducts?.();
  };

  // ─── Detecção de duplicatas ───────────────────────────────────────────────
  // Normaliza o nome removendo acentos, espaços extras e colocando em minúsculas
  // para comparação fuzzy entre nomes similares.
  const normalizeName = (name: string) =>
    name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-z0-9\s]/g, '')                       // remove pontuação
      .replace(/\s+/g, ' ')
      .trim();

  // Calcula o coeficiente de Jaccard entre dois conjuntos de tokens.
  // Retorna 0..1, onde 1 = idêntico.
  const jaccardSimilarity = (a: string, b: string): number => {
    const ta = new Set(normalizeName(a).split(' ').filter(Boolean));
    const tb = new Set(normalizeName(b).split(' ').filter(Boolean));
    if (ta.size === 0 && tb.size === 0) return 1;
    const intersect = new Set([...ta].filter(t => tb.has(t)));
    const union = new Set([...ta, ...tb]);
    return intersect.size / union.size;
  };

  const handleDetectDuplicates = () => {
    const active = products.filter(p => !p.archived);
    const visited = new Set<string>();
    const groups: { products: Product[] }[] = [];

    for (let i = 0; i < active.length; i++) {
      if (visited.has(active[i].id)) continue;
      const group: Product[] = [active[i]];
      for (let j = i + 1; j < active.length; j++) {
        if (visited.has(active[j].id)) continue;
        const sim = jaccardSimilarity(active[i].name, active[j].name);
        if (sim >= 0.5) { // 50% de tokens em comum → provável duplicata
          group.push(active[j]);
          visited.add(active[j].id);
        }
      }
      if (group.length >= 2) {
        visited.add(active[i].id);
        groups.push({ products: group });
      }
    }

    if (groups.length === 0) {
      alert('Nenhum produto duplicado ou similar encontrado no estoque ativo.');
      return;
    }

    setMergeGroups(groups);
    setMergeStep(0);
    // Pré-seleciona TODOS os produtos do primeiro grupo para mesclar (checkboxes marcados)
    const firstGroupProducts = groups[0].products;
    const allIds = new Set(firstGroupProducts.map(p => p.id));
    setMergeSelectedIds(allIds);
    // Pré-seleciona o produto com maior estoque como principal
    const keeper = [...firstGroupProducts].sort((a, b) => b.stock - a.stock)[0];
    setMergeKeepId(keeper.id);
    setMergeName(keeper.name);
    setMergeCostPrice(keeper.costPrice);
    setMergeSalePrice(keeper.salePrice);
    setShowMergeModal(true);
  };

  const handleMergeConfirm = () => {
    const group = mergeGroups[mergeStep];
    if (!group || !mergeKeepId || !onMergeProducts) return;
    // Apenas os IDs selecionados (checkboxes marcados) EXCETO o principal serão mesclados
    const selectedIds: string[] = Array.from(mergeSelectedIds);
    const duplicateIds = selectedIds.filter(id => id !== mergeKeepId);
    
    if (duplicateIds.length === 0) {
      toast.error('Selecione pelo menos um produto para mesclar');
      return;
    }
    
    onMergeProducts(mergeKeepId, duplicateIds, mergeName.trim() || group.products[0].name, mergeCostPrice, mergeSalePrice);

    // Avança para o próximo grupo, ou fecha se acabou
    const nextStep = mergeStep + 1;
    if (nextStep < mergeGroups.length) {
      setMergeStep(nextStep);
      const nextGroup = mergeGroups[nextStep].products;
      // Pré-seleciona todos do próximo grupo
      const nextIds = new Set(nextGroup.map(p => p.id));
      setMergeSelectedIds(nextIds);
      const nextKeeper = [...nextGroup].sort((a, b) => b.stock - a.stock)[0];
      setMergeKeepId(nextKeeper.id);
      setMergeName(nextKeeper.name);
      setMergeCostPrice(nextKeeper.costPrice);
      setMergeSalePrice(nextKeeper.salePrice);
    } else {
      setShowMergeModal(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const handleExportFiltered = async () => {
    const XLSX = await import('xlsx');
    const headers = ['SKU', 'Nome', 'Categoria', 'Custo', 'Venda', 'Estoque', 'Mín', 'Margem%'];
    const rows = sortedProducts.map(p => [p.code, p.name, p.category, p.costPrice, p.salePrice, p.stock, p.minStock, calcMargin(p.costPrice, p.salePrice).toFixed(0)]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([headers, ...rows]), 'Estoque');
    XLSX.writeFile(wb, `Estoque_${new Date().toISOString().substring(0, 10)}.xlsx`);
  };

  const SortIndicator = ({ field }: { field: SortField }) => sortField !== field ? <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" /> : sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1 text-indigo-600" /> : <ChevronDown className="h-3 w-3 ml-1 text-indigo-600" />;

  const getPaginationRange = () => {
    const range: (number | string)[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  };

  const showingFrom = sortedProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(currentPage * itemsPerPage, sortedProducts.length);
  const hasSelection = selectedIds.size > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Boxes className="h-5 w-5 md:h-6 md:w-6 text-slate-500" />
            Gestão de Estoque
          </h1>
          <p className="text-sm text-slate-500 mt-1">{products.length} produtos | {totalStock} peças | {totalRetailValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleOpenAddModal} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <Plus className="h-4 w-4" /> Novo
          </button>
          <button onClick={handleClearAllStock} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <Trash className="h-4 w-4" /> Remover Tudo
          </button>
          <button onClick={handleExportFiltered} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <Download className="h-4 w-4" /> <span className="hidden sm:inline">Exportar</span>
          </button>
          <button onClick={() => setShowLabelPrinter(true)} className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-lg border border-emerald-200 flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <Tag className="h-4 w-4" /> <span className="hidden sm:inline">Etiquetas</span>
          </button>
          <button onClick={handleCheckStock} className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-semibold rounded-lg border border-amber-200 flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <ClipboardCheck className="h-4 w-4" /> <span className="hidden sm:inline">Verificar Vendas x Estoque</span><span className="sm:hidden">Verificar</span>
          </button>
          {onMergeProducts && (
            <button onClick={handleDetectDuplicates} className="px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 text-sm font-semibold rounded-lg border border-violet-200 flex items-center justify-center gap-2 transition-colors cursor-pointer">
              <Merge className="h-4 w-4" /> <span className="hidden sm:inline">Mesclar Duplicatas</span><span className="sm:hidden">Mesclar</span>
            </button>
          )}
          <button onClick={() => setIsCategoryModalOpen(true)} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer">
            + Categoria
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Buscar nome ou SKU..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-all" />
          </div>
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg bg-slate-50 px-2.5 py-1.5 w-full md:w-auto">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="bg-transparent text-sm outline-none cursor-pointer flex-1 md:flex-none">
              <option value="all">Todas categorias ({products.length})</option>
              {categories.map(c => {
                const count = products.filter(p => p.category === c.name).length;
                return <option key={c.id} value={c.name}>{c.name} ({count})</option>;
              })}
            </select>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/40">
            {([
              { key: 'all' as const, label: `Todos (${stockCounts.all})` },
              { key: 'low' as const, label: `Baixo (${stockCounts.low})` },
              { key: 'out' as const, label: `Esgotado (${stockCounts.out})` },
              { key: 'ok' as const, label: `OK (${stockCounts.ok})` },
            ]).map(opt => (
              <button key={opt.key} onClick={() => setStockFilter(opt.key)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap ${stockFilter === opt.key ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-900'}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/40">
            {([
              { key: 'active' as const, label: 'Ativos' },
              { key: 'archived' as const, label: 'Arquivados' },
              { key: 'all' as const, label: 'Todos' },
            ]).map(opt => (
              <button key={opt.key} onClick={() => setArchivedFilter(opt.key)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap ${archivedFilter === opt.key ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-900'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold">Preço:</span>
            <input type="number" placeholder="Mín" value={priceMin} onChange={e => setPriceMin(e.target.value)} className="w-20 px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-400" />
            <span>-</span>
            <input type="number" placeholder="Máx" value={priceMax} onChange={e => setPriceMax(e.target.value)} className="w-20 px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-400" />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 ml-auto">
            <span>Mostrar:</span>
            <select value={itemsPerPage} onChange={e => setItemsPerPage(Number(e.target.value))} className="px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none">
              <option value={20}>20</option><option value={50}>50</option><option value={100}>100</option><option value={9999}>Todos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {hasSelection && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-indigo-700">{selectedIds.size} selecionados</span>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleBulkDelete} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer">
              <Trash2 className="h-4 w-4" /> Excluir
            </button>
            {bulkAction === 'category' ? (
              <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-indigo-200">
                <select value={bulkCategoryValue} onChange={e => setBulkCategoryValue(e.target.value)} className="text-xs px-2 py-1 border-none outline-none">
                  <option value="">Selecionar...</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <button onClick={handleBulkCategory} className="px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded">OK</button>
                <button onClick={() => setBulkAction(null)} className="text-slate-400 hover:text-slate-600"><X className="h-3 w-3" /></button>
              </div>
            ) : (
                <button onClick={() => setBulkAction('category')} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <Layers className="h-4 w-4" /> Mudar Categoria
              </button>
            )}
            {bulkAction === 'stock' ? (
              <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-indigo-200">
                <select value={bulkActionType} onChange={e => setBulkActionType(e.target.value as 'add' | 'sub')} className="text-xs px-2 py-1 border-none outline-none">
                  <option value="add">+ Adicionar</option><option value="sub">- Remover</option>
                </select>
                <input type="number" min="1" value={bulkStockValue} onChange={e => setBulkStockValue(Number(e.target.value))} className="w-16 px-2 py-1 border border-slate-200 rounded text-xs text-center" />
                <button onClick={handleBulkStock} className="px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded">OK</button>
                <button onClick={() => setBulkAction(null)} className="text-slate-400 hover:text-slate-600"><X className="h-3 w-3" /></button>
              </div>
            ) : (
                <button onClick={() => setBulkAction('stock')} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <Layers className="h-4 w-4" /> Ajustar Estoque
              </button>
            )}
          </div>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-[11px] font-bold text-indigo-600 hover:text-indigo-800">Limpar seleção</button>
        </div>
      )}

      {/* MOBILE: Card Grid View */}
      <div className="md:hidden space-y-2">
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">Nenhum produto encontrado</h3>
            <p className="text-xs text-slate-400 mt-1">Ajuste os filtros ou cadastre novos produtos.</p>
          </div>
        ) : (
          <>
            {paginatedProducts.map(p => {
              const isIndisponivel = p.status === 'indisponivel';
              const isLow = !isIndisponivel && p.stock > 0 && p.stock <= p.minStock;
              const isOut = !isIndisponivel && p.stock === 0;
              const margin = calcMargin(p.costPrice, p.salePrice);
              return (
                <div key={p.id} className={`bg-white p-3 rounded-xl border shadow-sm ${
                  isOut ? 'border-rose-200 bg-rose-50/30' : isLow ? 'border-amber-200 bg-amber-50/30' : isIndisponivel ? 'border-slate-200 bg-slate-50/50 opacity-70' : 'border-slate-200'
                } ${selectedIds.has(p.id) ? 'ring-2 ring-indigo-500/30 border-indigo-300' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <button onClick={() => toggleSelect(p.id)} className="shrink-0">
                        {selectedIds.has(p.id) ? <CheckSquare className="h-4 w-4 text-indigo-600" /> : <Square className="h-4 w-4 text-slate-300" />}
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : isIndisponivel ? 'bg-slate-400' : 'bg-emerald-500'}`} />
                          <span className="text-[10px] font-mono text-slate-400">{p.code}</span>
                          {isIndisponivel && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded-full">Indisponível</span>}
                        </div>
                        <p className="text-sm font-semibold text-slate-900 truncate mt-0.5">{p.name}</p>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium inline-block mt-1">{p.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleDuplicateProduct(p)} className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors" title="Duplicar" aria-label="Duplicar"><Copy className="h-4 w-4" /></button>
                      <button onClick={() => handleOpenEditModal(p)} className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"><Edit2 className="h-4 w-4" /></button>
                      {p.archived ? (
                        <button onClick={() => onUnarchiveProduct(p.id)} className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors" title="Restaurar" aria-label="Restaurar"><RotateCcw className="h-4 w-4" /></button>
                      ) : (
                        <button onClick={() => { if (window.confirm(`Arquivar "${p.name}"?`)) onArchiveProduct(p.id); }} className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors" title="Arquivar" aria-label="Arquivar"><Archive className="h-4 w-4" /></button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[9px] text-slate-400 block">Custo</span>
                        <span className="text-xs font-mono text-slate-500">{p.costPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">Venda</span>
                        <span className="text-xs font-mono font-bold text-slate-900">{p.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${margin >= 50 ? 'bg-emerald-50 text-emerald-700' : margin >= 30 ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
                        {margin.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleQuickStockAdjust(p, -1)} disabled={p.stock === 0 || isIndisponivel} className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-30 border border-slate-200 flex items-center justify-center"><Minus className="h-3 w-3" /></button>
                      <span className={`font-bold font-mono text-sm w-8 text-center ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : isIndisponivel ? 'text-slate-400' : 'text-slate-800'}`}>{p.stock}</span>
                      <button onClick={() => handleQuickStockAdjust(p, 1)} className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center"><Plus className="h-3 w-3" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="border-t border-slate-200 px-4 py-2.5 flex items-center justify-between bg-slate-50/50 rounded-xl">
              <p className="text-[11px] text-slate-500">{showingFrom}-{showingTo} de {sortedProducts.length}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 border border-slate-200/60"><ChevronLeft className="h-4 w-4" /></button>
                <span className="text-xs font-bold text-slate-600 px-2">{currentPage}/{totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 border border-slate-200/60"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* DESKTOP: Table View */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">Nenhum produto encontrado</h3>
            <p className="text-xs text-slate-400 mt-1">Ajuste os filtros ou cadastre novos produtos.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 w-8 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">
                      <button onClick={toggleSelectAll} className="text-slate-400 hover:text-indigo-600">
                        {selectedIds.size === paginatedProducts.length && paginatedProducts.length > 0 ? <CheckSquare className="h-4 w-4 text-indigo-600" /> : <Square className="h-4 w-4" />}
                      </button>
                    </th>
                    <th className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50" onClick={() => handleSort('name')}><div className="flex items-center">Produto <SortIndicator field="name" /></div></th>
                    <th className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50" onClick={() => handleSort('category')}><div className="flex items-center">Categoria <SortIndicator field="category" /></div></th>
                    <th className="px-4 py-3 text-right cursor-pointer select-none hover:bg-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50" onClick={() => handleSort('costPrice')}><div className="flex items-center justify-end">Custo <SortIndicator field="costPrice" /></div></th>
                    <th className="px-4 py-3 text-right cursor-pointer select-none hover:bg-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50" onClick={() => handleSort('salePrice')}><div className="flex items-center justify-end">Venda <SortIndicator field="salePrice" /></div></th>
                    <th className="px-4 py-3 text-center cursor-pointer select-none hover:bg-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50" onClick={() => handleSort('stock')}><div className="flex items-center justify-center">Estoque <SortIndicator field="stock" /></div></th>
                    <th className="px-4 py-3 text-right cursor-pointer select-none hover:bg-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50" onClick={() => handleSort('margin')}><div className="flex items-center justify-end">Margem <SortIndicator field="margin" /></div></th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedProducts.map(p => {
                    const isIndisponivel = p.status === 'indisponivel';
                    const isLow = !isIndisponivel && p.stock > 0 && p.stock <= p.minStock;
                    const isOut = !isIndisponivel && p.stock === 0;
                    const margin = calcMargin(p.costPrice, p.salePrice);
                    return (
                      <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${isOut ? 'bg-rose-50/20' : isLow ? 'bg-amber-50/20' : isIndisponivel ? 'bg-slate-50/50 opacity-60' : ''} ${selectedIds.has(p.id) ? 'bg-indigo-50/30' : ''}`}>
                        <td className="px-4 py-3 border-b border-slate-100 align-middle">
                          <button onClick={() => toggleSelect(p.id)} className="text-slate-400 hover:text-indigo-600">
                            {selectedIds.has(p.id) ? <CheckSquare className="h-4 w-4 text-indigo-600" /> : <Square className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 border-b border-slate-100 align-middle">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500 animate-pulse' : isIndisponivel ? 'bg-slate-400' : 'bg-emerald-500'}`} />
                            <div>
                              <span className="font-mono text-[10px] text-slate-400 flex items-center gap-0.5"><Barcode className="h-2.5 w-2.5" />{p.code}</span>
                              <p className="font-semibold text-slate-900 text-xs truncate max-w-[200px]">{p.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-b border-slate-100 align-middle">
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded font-medium">{p.category}</span>
                          {isIndisponivel && <span className="ml-1 px-1.5 py-0.5 bg-slate-200 text-slate-500 text-[9px] rounded font-bold">Indisp.</span>}
                        </td>
                        <td className="px-4 py-3 border-b border-slate-100 align-middle text-right font-mono text-xs text-slate-500">{p.costPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td className="px-4 py-3 border-b border-slate-100 align-middle text-right font-mono text-xs font-semibold text-slate-900">{p.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td className="px-4 py-3 border-b border-slate-100 align-middle text-center">
                          <div className="inline-flex items-center gap-1">
                            <button onClick={() => handleQuickStockAdjust(p, -1)} disabled={p.stock === 0 || isIndisponivel} className="p-0.5 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 border border-slate-200/50"><Minus className="h-3 w-3" /></button>
                            <div className="flex flex-col items-center">
                              <span className={`font-bold font-mono text-xs w-10 text-center ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : isIndisponivel ? 'text-slate-400' : 'text-slate-800'}`}>{p.stock}</span>
                              {p.minStock > 0 && !isIndisponivel && (
                                <span className={`text-[8px] font-mono ${isLow ? 'text-amber-500' : 'text-slate-400'}`}>min: {p.minStock}</span>
                              )}
                            </div>
                            <button onClick={() => handleQuickStockAdjust(p, 1)} className="p-0.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200/50"><Plus className="h-3 w-3" /></button>
                          </div>
                          {!isIndisponivel && p.minStock > 0 && (
                            <div className="w-16 mx-auto mt-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${p.stock <= 0 ? 'bg-rose-500' : p.stock <= p.minStock ? 'bg-amber-500' : 'bg-emerald-400'}`}
                                style={{ width: `${Math.min(100, (p.stock / Math.max(p.minStock, 1)) * 100)}%` }}
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 border-b border-slate-100 align-middle text-right">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${margin >= 50 ? 'bg-emerald-50 text-emerald-700' : margin >= 30 ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
                            {margin.toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 border-b border-slate-100 align-middle text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            <button onClick={() => handleDuplicateProduct(p)} className="p-1 hover:bg-slate-100 text-slate-500 rounded transition-colors" title="Duplicar" aria-label="Duplicar"><Copy className="h-3.5 w-3.5" /></button>
                            <button onClick={() => handleOpenEditModal(p)} className="p-1 hover:bg-indigo-50 text-indigo-600 rounded transition-colors" title="Editar" aria-label="Editar"><Edit2 className="h-3.5 w-3.5" /></button>
                            {p.archived ? (
                              <button onClick={() => onUnarchiveProduct(p.id)} className="p-1 hover:bg-emerald-50 text-emerald-600 rounded transition-colors" title="Restaurar" aria-label="Restaurar"><RotateCcw className="h-3.5 w-3.5" /></button>
                            ) : (
                              <button onClick={() => { if (window.confirm(`Arquivar "${p.name}"?`)) onArchiveProduct(p.id); }} className="p-1 hover:bg-amber-50 text-amber-600 rounded transition-colors" title="Arquivar" aria-label="Arquivar"><Archive className="h-3.5 w-3.5" /></button>
              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold text-xs">
                    <td className="px-4 py-3 border-b border-slate-100 align-middle"></td>
                    <td className="px-4 py-3 border-b border-slate-100 align-middle text-slate-600 uppercase tracking-wider text-[10px]" colSpan={2}>Totais ({sortedProducts.length} produtos)</td>
                    <td className="px-4 py-3 border-b border-slate-100 align-middle text-right font-mono text-slate-600">{totalCostValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td className="px-4 py-3 border-b border-slate-100 align-middle text-right font-mono text-slate-600">{totalRetailValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td className="px-4 py-3 border-b border-slate-100 align-middle text-center font-mono">{totalStock} un</td>
                    <td className="px-4 py-3 border-b border-slate-100 align-middle text-right text-[10px] text-slate-500">{totalCostValue > 0 ? `${((totalRetailValue - totalCostValue) / totalRetailValue * 100).toFixed(0)}%` : ''}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="border-t border-slate-200 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
              <p className="text-[11px] text-slate-500">Mostrando <span className="font-semibold text-slate-700">{showingFrom}-{showingTo}</span> de <span className="font-semibold text-slate-700">{sortedProducts.length}</span></p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 border border-slate-200/60"><ChevronLeft className="h-4 w-4" /></button>
                {getPaginationRange().map((page, idx) => (
                  <button key={idx} onClick={() => setCurrentPage(page as number)} className={`min-w-[28px] h-7 rounded-lg text-[11px] font-semibold border transition-colors ${currentPage === page ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{page}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 border border-slate-200/60"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* PRODUCT FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Preencha os dados do produto.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">SKU</label>
                  <div className="relative">
                    <input type="text" required value={formCode} onChange={e => setFormCode(e.target.value.toUpperCase())} className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 font-mono" />
                    <button type="button" onClick={() => setFormCode(generateSKU(formCategory))} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"><Sparkles className="h-4 w-4" /></button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Categoria</label>
                  <select required value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 bg-white">
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome do Produto</label>
                <input type="text" required value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Custo (R$)</label>
                <input type="number" step="0.01" min="0" value={formCostPrice ?? ''} onChange={e => setFormCostPrice(Number(e.target.value))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Venda (R$)</label>
                  <input type="number" step="0.01" min="0" required value={formSalePrice || ''} onChange={e => setFormSalePrice(Number(e.target.value))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 font-mono" />
                </div>
              </div>
              {editingProduct && (
                <button type="button" onClick={() => setShowPriceHistory(editingProduct)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer">
                  Histórico de Preços
                </button>
              )}
              {formSalePrice > 0 && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Margem:</span>
                  <span className={`font-bold ${formSalePrice >= formCostPrice ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {(formSalePrice - formCostPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({calcMargin(formCostPrice, formSalePrice).toFixed(0)}%)
                  </span>
                </div>
              )}
              {!/^servi/i.test(formCategory) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Estoque</label>
                  <input type="number" min="0" required value={formStock} onChange={e => setFormStock(Number(e.target.value))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Estoque Mínimo</label>
                  <input type="number" min="0" value={formMinStock ?? ''} onChange={e => setFormMinStock(Number(e.target.value))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 font-mono" />
                </div>
              </div>
              )}
              {!/^servi/i.test(formCategory) && (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Status do Produto</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Indisponível não gera alerta de estoque baixo</p>
                </div>
                <button type="button" onClick={() => setFormStatus(s => s === 'disponivel' ? 'indisponivel' : 'disponivel')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formStatus === 'disponivel' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${formStatus === 'disponivel' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              )}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Descrição (opcional)</label>
                <textarea rows={2} value={formDescription} onChange={e => setFormDescription(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 resize-none" />
              </div>
              <div className="border-t border-slate-200 pt-4 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer">{editingProduct ? 'Salvar' : 'Cadastrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Nova Categoria</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddCategorySubmit} className="p-5 space-y-4">
              <input type="text" required placeholder="Nome da categoria" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK CHECK MODAL */}
      {showStockCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">Verificação de Estoque x Vendas</h3>
                <p className="text-xs text-slate-400 mt-0.5">Produtos vendidos que não estão cadastrados no estoque.</p>
              </div>
              <button onClick={() => setShowStockCheck(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              {missingProducts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600 mb-3">
                    <ClipboardCheck className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Todos os produtos vendidos estão cadastrados!</p>
                  <p className="text-xs text-slate-400 mt-1">Nenhuma inconsistência encontrada entre vendas e estoque.</p>
                </div>
              ) : (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-700 font-medium">{missingProducts.length} produto(s) vendido(s) mas não cadastrado(s) no estoque.</p>
                  </div>
                  <div className="space-y-2">
                    {missingProducts.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100/50 transition-colors">
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-slate-400">Categoria: <span className="font-semibold text-slate-600">{item.suggestedCategory}</span></span>
                            <span className="text-[10px] text-slate-400">Vendidos: <span className="font-semibold text-slate-600">{item.qty} un</span></span>
                            <span className="text-[10px] text-slate-400">Custo: <span className="font-mono text-slate-600">{item.costPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></span>
                            <span className="text-[10px] text-slate-400">Venda: <span className="font-mono text-slate-600">{item.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></span>
                          </div>
                        </div>
                        <button onClick={() => handleRegisterMissing(item)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0">
                          Cadastrar
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="p-5 border-t border-slate-200 flex items-center justify-between bg-slate-50 rounded-b-xl">
              <button onClick={handleExportMissing} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <Download className="h-4 w-4" /> Exportar Controle
              </button>
              <div className="flex items-center gap-2">
                {missingProducts.length > 0 && (
                  <button onClick={handleRegisterAllMissing} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer">
                    Cadastrar Todos ({missingProducts.length})
                  </button>
                )}
                <button onClick={() => setShowStockCheck(false)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer">
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showPriceHistory && <PriceHistoryModal product={showPriceHistory} onClose={() => setShowPriceHistory(null)} />}
      <LabelPrinter
        products={products}
        isOpen={showLabelPrinter}
        onClose={() => setShowLabelPrinter(false)}
      />

      {/* ── MODAL DE MESCLAGEM DE DUPLICATAS ─────────────────────────────── */}
      {showMergeModal && mergeGroups.length > 0 && (() => {
        const group = mergeGroups[mergeStep];
        const totalMergedStock = group.products.reduce((s, p) => s + p.stock, 0);
        const affectedSales = sales.filter(s =>
          s.items.some(it => group.products.some(p => p.id === it.productId && p.id !== mergeKeepId))
        ).length;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-violet-50 dark:bg-violet-950/30 rounded-t-2xl">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Merge className="h-5 w-5 text-violet-600" />
                    Mesclar Produtos Similares
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Grupo {mergeStep + 1} de {mergeGroups.length} · {group.products.length} produtos similares detectados
                  </p>
                </div>
                <button onClick={() => setShowMergeModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-white/60">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex-1 space-y-4">
                {/* Lista de produtos do grupo */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">
                      Selecione quais produtos mesclar (o principal fica, os marcados serão arquivados)
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const allIds = new Set(group.products.map(p => p.id));
                          setMergeSelectedIds(allIds);
                        }}
                        className="px-2 py-1 text-[10px] font-semibold text-slate-600 hover:text-violet-600 transition-colors"
                      >
                        Selecionar todos
                      </button>
                      <button
                        type="button"
                        onClick={() => setMergeSelectedIds(new Set())}
                        className="px-2 py-1 text-[10px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {group.products.map(p => {
                      const isSelected = mergeSelectedIds.has(p.id);
                      const isMain = mergeKeepId === p.id;
                      return (
                        <label key={p.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          isMain
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                            : isSelected
                              ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                              : 'border-slate-200 dark:border-slate-700 hover:border-violet-300'
                        }`}>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const newSet = new Set(mergeSelectedIds);
                                if (e.target.checked) {
                                  newSet.add(p.id);
                                } else {
                                  newSet.delete(p.id);
                                }
                                setMergeSelectedIds(newSet);
                              }}
                              className="mt-0.5 accent-violet-600 h-4 w-4"
                            />
                            {isMain && <span className="text-[10px] font-bold px-2 py-0.5 bg-violet-600 text-white rounded-full shrink-0">principal</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{p.name}</p>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="text-[10px] text-slate-500">SKU: <span className="font-mono">{p.code}</span></span>
                              <span className="text-[10px] text-slate-500">Estoque: <span className="font-semibold text-slate-700 dark:text-slate-200">{p.stock} un</span></span>
                              <span className="text-[10px] text-slate-500">Custo: <span className="font-mono">{p.costPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></span>
                              <span className="text-[10px] text-slate-500">Venda: <span className="font-mono">{p.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></span>
                            </div>
                          </div>
                          <input
                            type="radio"
                            name="mergeKeep"
                            value={p.id}
                            checked={isMain}
                            onChange={() => {
                              setMergeKeepId(p.id);
                              setMergeName(p.name);
                              setMergeCostPrice(p.costPrice);
                              setMergeSalePrice(p.salePrice);
                            }}
                            className="mt-0.5 accent-violet-600"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Campos editáveis do produto resultante */}
                <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-4 border border-slate-200 dark:border-slate-600 space-y-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Produto resultante (editável)</p>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Nome final</label>
                    <input
                      type="text"
                      value={mergeName}
                      onChange={e => setMergeName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:border-violet-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Custo (R$)</label>
                      <input type="number" step="0.01" min="0" value={mergeCostPrice}
                        onChange={e => setMergeCostPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:border-violet-400 font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Venda (R$)</label>
                      <input type="number" step="0.01" min="0" value={mergeSalePrice}
                        onChange={e => setMergeSalePrice(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:border-violet-400 font-mono" />
                    </div>
                  </div>
                </div>

                {/* Resumo do impacto */}
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 space-y-1">
                  <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">Impacto da mesclagem</p>
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    ✓ Estoque total mesclado: <b>{totalMergedStock} un</b>
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    ✓ {group.products.length - 1} produto(s) serão arquivados (não excluídos)
                  </p>
                  {affectedSales > 0 && (
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                      ✓ {affectedSales} venda(s) serão reapontadas para o produto principal
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-2xl">
                <button onClick={() => setShowMergeModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                  Cancelar
                </button>
                <div className="flex items-center gap-2">
{mergeStep > 0 && (
                    <button onClick={() => {
                      const prev = mergeStep - 1;
                      setMergeStep(prev);
                      const g = mergeGroups[prev].products;
                      const k = [...g].sort((a, b) => b.stock - a.stock)[0];
                      setMergeKeepId(k.id); setMergeName(k.name);
                      setMergeCostPrice(k.costPrice); setMergeSalePrice(k.salePrice);
                      // Pré-seleciona todos do grupo anterior
                      const prevIds = new Set(g.map(p => p.id));
                      setMergeSelectedIds(prevIds);
                    }} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                       Anterior
                    </button>
                  )}
{/* Pular: avança sem mesclar, útil quando o grupo não é realmente duplicata */}
                  <button onClick={() => {
                    const next = mergeStep + 1;
                    if (next < mergeGroups.length) {
                      setMergeStep(next);
                      const g = mergeGroups[next].products;
                      const k = [...g].sort((a, b) => b.stock - a.stock)[0];
                      setMergeKeepId(k.id); setMergeName(k.name);
                      setMergeCostPrice(k.costPrice); setMergeSalePrice(k.salePrice);
                      // Pré-seleciona todos do próximo grupo
                      const nextIds = new Set(g.map(p => p.id));
                      setMergeSelectedIds(nextIds);
                    } else {
                      setShowMergeModal(false);
                    }
                  }} className="px-4 py-2 text-sm font-semibold text-slate-500 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                    {mergeStep < mergeGroups.length - 1 ? 'Pular ' : 'Pular e fechar'}
                  </button>
                  <button onClick={handleMergeConfirm} disabled={!mergeKeepId}
                    className="px-5 py-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2">
                    <Merge className="h-4 w-4" />
                    {mergeStep < mergeGroups.length - 1 ? 'Mesclar e Próximo →' : 'Mesclar e Concluir'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
