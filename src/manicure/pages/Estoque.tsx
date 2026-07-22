import { useState } from 'react';
import { ProdutoEstoque } from '../types';
import { newId } from '../localDb';
import { Package, Plus, Edit3, Trash2, Search, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  produtos: ProdutoEstoque[];
  setProdutos: (p: ProdutoEstoque[]) => void;
}

// BUG-FIX: adicionado botão excluir produto (sem ele, produto incorreto ficava preso para sempre)

export default function Estoque({ produtos, setProdutos }: Props) {
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: '', descricao: '', quantidade: '0', unidade: 'un', precoCusto: '0', precoVenda: '0', fornecedor: '', estoqueMinimo: '1' });

  const filtered = produtos.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()));
  const baixoEstoque = produtos.filter((p) => p.quantidade <= p.estoqueMinimo);

  const openNew = () => {
    setEditId(null); setForm({ nome: '', descricao: '', quantidade: '0', unidade: 'un', precoCusto: '0', precoVenda: '0', fornecedor: '', estoqueMinimo: '1' });
    setShowModal(true);
  };

  const openEdit = (p: ProdutoEstoque) => {
    setEditId(p.id); setForm({ nome: p.nome, descricao: p.descricao || '', quantidade: String(p.quantidade), unidade: p.unidade, precoCusto: String(p.precoCusto), precoVenda: String(p.precoVenda), fornecedor: p.fornecedor || '', estoqueMinimo: String(p.estoqueMinimo) });
    setShowModal(true);
  };

  const save = () => {
    if (!form.nome.trim()) { toast.error('Nome é obrigatório'); return; }
    if (editId) {
      setProdutos(produtos.map((p) => p.id === editId ? { ...p, nome: form.nome, descricao: form.descricao || undefined, quantidade: parseInt(form.quantidade) || 0, unidade: form.unidade as ProdutoEstoque['unidade'], precoCusto: parseFloat(form.precoCusto) || 0, precoVenda: parseFloat(form.precoVenda) || 0, fornecedor: form.fornecedor || undefined, estoqueMinimo: parseInt(form.estoqueMinimo) || 1, updatedAt: new Date().toISOString() } : p));
      toast.success('Produto atualizado');
    } else {
      const novo: ProdutoEstoque = { id: newId('pro'), nome: form.nome, descricao: form.descricao || undefined, quantidade: parseInt(form.quantidade) || 0, unidade: form.unidade as ProdutoEstoque['unidade'], precoCusto: parseFloat(form.precoCusto) || 0, precoVenda: parseFloat(form.precoVenda) || 0, fornecedor: form.fornecedor || undefined, estoqueMinimo: parseInt(form.estoqueMinimo) || 1, createdAt: new Date().toISOString() };
      setProdutos([...produtos, novo]);
      toast.success('Produto cadastrado');
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-fuchsia-600" />
          <h2 className="text-xl font-bold">Estoque</h2>
          <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{produtos.length}</span>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl text-sm font-bold transition-colors">
          <Plus className="h-4 w-4" /> Novo Produto
        </button>
      </div>

      {baixoEstoque.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">{baixoEstoque.length} produto(s) com estoque baixo</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">{baixoEstoque.map((p) => p.nome).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar produto..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
      </div>

      <div className="grid gap-3">
        {filtered.map((p) => {
          const baixo = p.quantidade <= p.estoqueMinimo;
          return (
            <div key={p.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{p.nome}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {p.fornecedor && `${p.fornecedor} · `}
                  R$ {p.precoVenda.toFixed(2)} (custo: R$ {p.precoCusto.toFixed(2)})
                </p>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${baixo ? 'text-amber-600' : 'text-slate-900 dark:text-slate-100'}`}>
                  {p.quantidade} {p.unidade}
                </p>
                {baixo && <p className="text-[10px] text-amber-600 font-bold">Estoque baixo</p>}
              </div>
              <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-slate-400 hover:text-fuchsia-600 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20"><Edit3 className="h-4 w-4" /></button>
              <button onClick={() => { if (window.confirm('Excluir este produto?')) setProdutos(produtos.filter(x => x.id !== p.id)); }} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20" title="Excluir produto"><Trash2 className="h-4 w-4" /></button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">
            {busca ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado.'}
          </p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{editId ? 'Editar Produto' : 'Novo Produto'}</h3>
            <div className="space-y-3">
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome do produto *" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
              <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição" rows={2} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none" />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} placeholder="Quantidade" min="0" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
                <select value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500">
                  <option value="un">Unidade</option>
                  <option value="ml">ML</option>
                  <option value="g">Grama</option>
                  <option value="par">Par</option>
                  <option value="kit">Kit</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={form.precoCusto} onChange={(e) => setForm({ ...form, precoCusto: e.target.value })} placeholder="Preço de custo (R$)" min="0" step="0.01" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
                <input type="number" value={form.precoVenda} onChange={(e) => setForm({ ...form, precoVenda: e.target.value })} placeholder="Preço de venda (R$)" min="0" step="0.01" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
              </div>
              <input value={form.fornecedor} onChange={(e) => setForm({ ...form, fornecedor: e.target.value })} placeholder="Fornecedor" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
              <input type="number" value={form.estoqueMinimo} onChange={(e) => setForm({ ...form, estoqueMinimo: e.target.value })} placeholder="Estoque mínimo" min="0" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Cancelar</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm font-bold">{editId ? 'Atualizar' : 'Cadastrar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
