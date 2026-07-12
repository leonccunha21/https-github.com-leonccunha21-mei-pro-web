import React, { useState, useMemo } from 'react';
import { Product, Category } from '../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  Filter, 
  Minus, 
  ArrowUpRight, 
  Sparkles,
  Barcode,
  X,
  FileSpreadsheet
} from 'lucide-react';

interface ProductsProps {
  products: Product[];
  categories: Category[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddCategory: (categoryName: string) => void;
}

export default function Products({ 
  products, 
  categories, 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct,
  onAddCategory
}: ProductsProps) {
  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // New Category state
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form states
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formCostPrice, setFormCostPrice] = useState<number>(0);
  const [formSalePrice, setFormSalePrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(0);
  const [formMinStock, setFormMinStock] = useState<number>(1);
  const [formDescription, setFormDescription] = useState('');

  // Auto-generate Code/SKU
  const generateSKU = (categoryName: string) => {
    const prefix = categoryName ? categoryName.substring(0, 3).toUpperCase() : 'PRO';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${randomNum}`;
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormCode(generateSKU(categories[0]?.name || 'PRO'));
    setFormName('');
    setFormCategory(categories[0]?.name || '');
    setFormCostPrice(0);
    setFormSalePrice(0);
    setFormStock(0);
    setFormMinStock(3);
    setFormDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormCode(product.code);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormCostPrice(product.costPrice);
    setFormSalePrice(product.salePrice);
    setFormStock(product.stock);
    setFormMinStock(product.minStock);
    setFormDescription(product.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCategory) return;

    const productData = {
      code: formCode.trim() || generateSKU(formCategory),
      name: formName.trim(),
      category: formCategory,
      costPrice: Number(formCostPrice),
      salePrice: Number(formSalePrice),
      stock: Number(formStock),
      minStock: Number(formMinStock),
      description: formDescription.trim() || undefined,
    };

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...productData
      });
    } else {
      onAddProduct(productData);
    }
    setIsModalOpen(false);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    onAddCategory(newCategoryName.trim());
    setNewCategoryName('');
    setIsCategoryModalOpen(false);
  };

  // Quick stock updates
  const handleQuickStockAdjust = (product: Product, delta: number) => {
    const updatedStock = Math.max(0, product.stock + delta);
    onUpdateProduct({
      ...product,
      stock: updatedStock
    });
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search matches name or SKU code
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category match
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

      // Stock filter
      let matchesStock = true;
      if (stockFilter === 'low') {
        matchesStock = p.stock <= p.minStock;
      } else if (stockFilter === 'out') {
        matchesStock = p.stock === 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  // Calculate profit margin helper for UI
  const calculateMargin = (cost: number, sale: number) => {
    if (sale <= 0) return 0;
    return ((sale - cost) / sale) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 id="products-title" className="text-2xl font-bold tracking-tight text-slate-900">Gestão de Estoque</h1>
          <p className="text-sm text-slate-500 mt-1">Cadastre seus produtos, acompanhe quantidades físicas e gerencie margens de lucro.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="new-category-btn"
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 transition-colors"
          >
            Nova Categoria
          </button>
          <button
            id="new-product-btn"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            Cadastrar Produto
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            id="product-search-input"
            type="text"
            placeholder="Buscar por nome ou código SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-900 border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 border border-slate-200 rounded-lg bg-slate-50 px-2.5">
          <span className="text-slate-400"><Filter className="h-4 w-4" /></span>
          <select
            id="category-filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2 bg-transparent text-sm text-slate-700 outline-hidden border-none cursor-pointer focus:ring-0"
          >
            <option value="all">Todas Categorias</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Stock Alert Filter Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/40">
          <button
            id="stock-filter-all"
            onClick={() => setStockFilter('all')}
            className={`flex-1 py-1 px-2.5 text-xs font-semibold rounded-md transition-colors ${
              stockFilter === 'all' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            Todos
          </button>
          <button
            id="stock-filter-low"
            onClick={() => setStockFilter('low')}
            className={`flex-1 py-1 px-2.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition-colors ${
              stockFilter === 'low' ? 'bg-white text-rose-600 shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            Alerta ({products.filter(p => p.stock <= p.minStock).length})
          </button>
        </div>
      </div>

      {/* Products Table Card */}
      <div id="products-table-card" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400 mb-4 border border-slate-100">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Nenhum produto localizado</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Tente reajustar seus filtros, limpar o campo de busca ou cadastre novos itens no estoque.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Código / Produto</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4 text-right">Valor Pago (Custo)</th>
                  <th className="py-3 px-4 text-right">Preço de Venda</th>
                  <th className="py-3 px-4 text-center">Estoque</th>
                  <th className="py-3 px-4 text-right">Margem</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.map(product => {
                  const isLow = product.stock <= product.minStock;
                  const isOut = product.stock === 0;
                  const margin = calculateMargin(product.costPrice, product.salePrice);
                  
                  return (
                    <tr 
                      key={product.id} 
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isOut ? 'bg-rose-50/10' : isLow ? 'bg-amber-50/10' : ''
                      }`}
                    >
                      {/* Product details */}
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-1">
                            {isOut ? (
                              <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500" title="Esgotado!" />
                            ) : isLow ? (
                              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" title="Estoque Baixo!" />
                            ) : (
                              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" title="Estoque Saudável" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs text-slate-400 flex items-center gap-0.5">
                                <Barcode className="h-3 w-3" />
                                {product.code}
                              </span>
                            </div>
                            <p className="font-semibold text-slate-900 mt-0.5">{product.name}</p>
                            {product.description && (
                              <p className="text-xs text-slate-400 truncate max-w-[240px]" title={product.description}>
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-500">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-sm border border-slate-200/50">
                          {product.category}
                        </span>
                      </td>

                      {/* Cost price */}
                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        {product.costPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>

                      {/* Sale price */}
                      <td className="py-3 px-4 text-right font-semibold font-mono text-slate-900">
                        {product.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>

                      {/* Stock Level with Quick Adjust */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            id={`quick-minus-${product.id}`}
                            onClick={() => handleQuickStockAdjust(product, -1)}
                            disabled={product.stock === 0}
                            className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-slate-200/50"
                            title="Remover 1 do estoque"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          
                          <div className="w-16 text-center">
                            <span className={`font-bold font-mono ${
                              isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-800'
                            }`}>
                              {product.stock} un
                            </span>
                            {isLow && (
                              <span className="block text-[9px] text-amber-600 font-medium">Mín. {product.minStock}</span>
                            )}
                          </div>

                          <button
                            id={`quick-plus-${product.id}`}
                            onClick={() => handleQuickStockAdjust(product, 1)}
                            className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors border border-slate-200/50"
                            title="Adicionar 1 ao estoque"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </td>

                      {/* Margin */}
                      <td className="py-3 px-4 text-right">
                        <span className={`font-semibold inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full ${
                          margin >= 50 ? 'bg-emerald-50 text-emerald-700' : margin >= 30 ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          <ArrowUpRight className="h-3 w-3" />
                          {margin.toFixed(0)}%
                        </span>
                      </td>

                      {/* Edit / Delete Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            id={`edit-prod-${product.id}`}
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                            title="Editar dados"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            id={`delete-prod-${product.id}`}
                            onClick={() => {
                              if (window.confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
                                onDeleteProduct(product.id);
                              }
                            }}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                            title="Excluir produto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PRODUCT FORM MODAL */}
      {isModalOpen && (
        <div id="product-form-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Preencha as informações detalhadas para manter seu estoque atualizado.</p>
              </div>
              <button
                id="close-modal-btn"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {/* SKU Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código SKU</label>
                  <div className="relative">
                    <input
                      id="form-code"
                      type="text"
                      required
                      placeholder="Ex: ELE-SW01"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                      className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono transition-all"
                    />
                    <button
                      id="regen-sku-btn"
                      type="button"
                      onClick={() => setFormCode(generateSKU(formCategory))}
                      className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-indigo-600"
                      title="Gerar código automático"
                    >
                      <Sparkles className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria</label>
                  <select
                    id="form-category"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Produto</label>
                <input
                  id="form-name"
                  type="text"
                  required
                  placeholder="Ex: Smartwatch Sport Ultra v2"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Financial values (Cost and Selling Price) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor Pago (Custo)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs font-semibold pointer-events-none">R$</span>
                    <input
                      id="form-cost-price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0,00"
                      value={formCostPrice || ''}
                      onChange={(e) => setFormCostPrice(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor de Venda</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs font-semibold pointer-events-none">R$</span>
                    <input
                      id="form-sale-price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0,00"
                      value={formSalePrice || ''}
                      onChange={(e) => setFormSalePrice(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Preview Margin Alert */}
              {formSalePrice > 0 && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Margem Calculada:</span>
                  <div className="flex items-center gap-1 font-bold">
                    <span className={formSalePrice - formCostPrice >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {(formSalePrice - formCostPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de lucro por unidade
                    </span>
                    <span className={`px-2 py-0.5 rounded-full ${
                      calculateMargin(formCostPrice, formSalePrice) >= 30 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      ({calculateMargin(formCostPrice, formSalePrice).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              )}

              {/* Stock settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantidade em Estoque</label>
                  <input
                    id="form-stock"
                    type="number"
                    min="0"
                    required
                    placeholder="Ex: 10"
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estoque Mínimo (Alerta)</label>
                  <input
                    id="form-min-stock"
                    type="number"
                    min="1"
                    required
                    placeholder="Ex: 3"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição / Notas (Opcional)</label>
                <textarea
                  id="form-description"
                  rows={2}
                  placeholder="Informações adicionais do produto, fornecedor ou especificações técnicas..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="border-t border-slate-200 pt-4 flex items-center justify-end gap-2 bg-white">
                <button
                  id="form-cancel-btn"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  id="form-save-btn"
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
                >
                  {editingProduct ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY FORM MODAL */}
      {isCategoryModalOpen && (
        <div id="category-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Nova Categoria</h3>
              <button
                id="close-category-btn"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddCategorySubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Categoria</label>
                <input
                  id="category-name-input"
                  type="text"
                  required
                  placeholder="Ex: Livros, Perfumaria..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  id="cancel-category-btn"
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  id="save-category-btn"
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
