import React, { useState, useMemo } from 'react';
import { Product, Supplier, Purchase, PurchaseItem } from '../types';
import { roundCurrency } from '../lib/currency';
import { normalizeName } from '../lib/normalize';
import {
  Truck, Plus, Search, Pencil, Trash2, Package, DollarSign,
  X, UserPlus, Building2
} from 'lucide-react';

interface PurchasesProps {
  products: Product[];
  suppliers: Supplier[];
  purchases: Purchase[];
  onSaveSuppliers: (suppliers: Supplier[]) => void;
  onAddPurchase: (purchase: Purchase) => void;
}

export default function Purchases({ products, suppliers, purchases, onSaveSuppliers, onAddPurchase }: PurchasesProps) {
  const [tab, setTab] = useState<'compras' | 'fornecedores'>('compras');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showSupplier, setShowSupplier] = useState(false);

  const [supplierId, setSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([{ productName: '', quantity: 1, costPrice: 0, salePrice: 0 }]);

  const [supplierForm, setSupplierForm] = useState<Supplier | null>(null);

  const filtered = useMemo(() => {
    const q = normalizeName(search);
    return purchases
      .filter(p => !q || normalizeName(p.supplierName || '')?.includes(q) || normalizeName(p.notes || '')?.includes(q))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [purchases, search]);

  const addItem = () => setItems([...items, { productName: '', quantity: 1, costPrice: 0, salePrice: 0 }]);
  const updateItem = (i: number, patch: Partial<PurchaseItem>) =>
    setItems(items.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const total = roundCurrency(items.reduce((acc, it) => acc + ((Number(it.quantity) || 0) * (Number(it.costPrice) || 0)), 0));

  const resetForm = () => {
    setSupplierId('');
    setSupplierName('');
    setNotes('');
    setItems([{ productName: '', quantity: 1, costPrice: 0, salePrice: 0 }]);
  };

  const savePurchase = () => {
    const valid = items.filter(it => (it.productName || '').trim() && (Number(it.quantity) || 0) > 0);
    if (valid.length === 0) return;
    const supplier = suppliers.find(s => s.id === supplierId);
    const purchase: Purchase = {
      id: `cmp_${Date.now()}`,
      date: new Date().toISOString(),
      supplierId: supplierId || undefined,
      supplierName: supplier?.name || supplierName.trim() || undefined,
      items: valid.map(it => ({
        productName: it.productName.trim(),
        quantity: Number(it.quantity) || 0,
        costPrice: Number(it.costPrice) || 0,
        salePrice: Number(it.salePrice) || 0,
      })),
      total,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    onAddPurchase(purchase);
    resetForm();
    setShowForm(false);
  };

  const saveSupplier = () => {
    if (!supplierForm || !supplierForm.name.trim()) return;
    if (supplierForm.id) {
      onSaveSuppliers(suppliers.map(s => s.id === supplierForm.id ? supplierForm : s));
    } else {
      onSaveSuppliers([{ ...supplierForm, id: `f_${Date.now()}`, name: supplierForm.name.trim(), createdAt: new Date().toISOString() }, ...suppliers]);
    }
    setShowSupplier(false);
    setSupplierForm(null);
  };

  const removeSupplier = (id: string) => {
    if (!confirm('Remover fornecedor?')) return;
    onSaveSuppliers(suppliers.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Truck className="h-6 w-6 text-indigo-600" /> Compras & Fornecedores
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Registre entradas de estoque com custo e fornecedor.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab(t => t === 'compras' ? 'fornecedores' : 'compras')} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold cursor-pointer">
            {tab === 'compras' ? 'Fornecedores' : 'Compras'}
          </button>
          {tab === 'compras'
            ? <button onClick={() => setShowForm(true)} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer"><Plus className="h-4 w-4" /> Nova Compra</button>
            : <button onClick={() => { setSupplierForm({ id: '', name: '', phone: '', email: '', notes: '', createdAt: '' }); setShowSupplier(true); }} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer"><Plus className="h-4 w-4" /> Novo Fornecedor</button>}
        </div>
      </div>

      {tab === 'compras' ? (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar compra / fornecedor / nota"
              className="w-full pl-8 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20" />
          </div>

          <div className="space-y-2">
            {filtered.map(p => (
              <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-indigo-500" />
                      {p.supplierName || 'Sem fornecedor'}
                    </p>
                    <p className="text-xs text-slate-400">{new Date(p.date).toLocaleDateString('pt-BR')} · {p.items.length} item(ns)</p>
                  </div>
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100">R$ {roundCurrency(p.total).toFixed(2)}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.items.map((it, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {it.productName} ×{it.quantity}
                    </span>
                  ))}
                </div>
                {p.notes && <p className="text-xs text-slate-400 mt-2">{p.notes}</p>}
              </div>
            ))}
            {filtered.length === 0 && <p className="text-center text-slate-400 text-sm py-12">Nenhuma compra registrada.</p>}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {suppliers.map(s => (
            <div key={s.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Building2 className="h-4 w-4 text-indigo-500" />{s.name}</span>
                <div className="flex gap-1">
                  <button onClick={() => { setSupplierForm({ ...s }); setShowSupplier(true); }} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => removeSupplier(s.id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 hover:bg-red-100 text-red-600 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="text-xs text-slate-400 mt-2 space-y-0.5">
                {s.phone && <p className="flex items-center gap-1"><Package className="h-3 w-3" /> {s.phone}</p>}
                {s.email && <p className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {s.email}</p>}
                {s.notes && <p className="text-slate-400">{s.notes}</p>}
              </div>
            </div>
          ))}
          {suppliers.length === 0 && <div className="col-span-full text-center py-12 text-slate-400 text-sm"><UserPlus className="h-10 w-10 mx-auto mb-2 opacity-50" />Nenhum fornecedor cadastrado.</div>}
        </div>
      )}

      {/* Purchase form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Nova Compra</h2>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fornecedor (cadastrado)</label>
                  <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">— Selecione —</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ou nome avulso</label>
                  <input value={supplierName} onChange={e => setSupplierName(e.target.value)} placeholder="Ex.: Distribuidora X" className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Itens</label>
                  <button onClick={addItem} className="text-xs font-bold text-indigo-600 flex items-center gap-1 cursor-pointer"><Plus className="h-3 w-3" /> Adicionar</button>
                </div>
                {items.map((it, i) => {
                  const match = products.find(p => normalizeName(p.name) === normalizeName(it.productName));
                  return (
                    <div key={i} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <input list="purchase-products" value={it.productName} onChange={e => updateItem(i, { productName: e.target.value })}
                          placeholder="Produto" className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden" />
                        <datalist id="purchase-products">
                          {products.filter(p => !p.archived).map(p => <option key={p.id} value={p.name} />)}
                        </datalist>
                      </div>
                      <div className="col-span-2">
                        <input type="number" min="0" value={it.quantity} onChange={e => updateItem(i, { quantity: Number(e.target.value) })} placeholder="Qtd" className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden" />
                      </div>
                      <div className="col-span-2">
                        <input type="number" min="0" step="0.01" value={it.costPrice} onChange={e => updateItem(i, { costPrice: Number(e.target.value) })}
                          placeholder="Custo" className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden" />
                      </div>
                      <div className="col-span-2">
                        <input type="number" min="0" step="0.01" value={it.salePrice} onChange={e => updateItem(i, { salePrice: Number(e.target.value) })}
                          placeholder="Venda" className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden" />
                      </div>
                      <div className="col-span-1">
                        <button onClick={() => removeItem(i)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                      {match && <p className="col-span-12 -mt-1 text-[10px] text-slate-400">Estoque atual: {match.stock} · último custo R$ {match.costPrice.toFixed(2)}</p>}
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Observações / Nota fiscal</label>
                <input value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20" />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between sticky bottom-0 bg-white dark:bg-slate-900">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Total: R$ {total.toFixed(2)}</span>
              <button onClick={savePurchase} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer">Registrar Compra</button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier form */}
      {showSupplier && supplierForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{supplierForm.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
              <button onClick={() => { setShowSupplier(false); setSupplierForm(null); }} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome *</label>
                <input value={supplierForm.name} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20" /></div>
              <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Telefone</label>
                <input value={supplierForm.phone || ''} onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20" /></div>
              <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">E-mail</label>
                <input value={supplierForm.email || ''} onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20" /></div>
              <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Observações</label>
                <textarea value={supplierForm.notes || ''} onChange={e => setSupplierForm({ ...supplierForm, notes: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20" /></div>
            </div>
            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
              <button onClick={() => { setShowSupplier(false); setSupplierForm(null); }} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">Cancelar</button>
              <button onClick={saveSupplier} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
