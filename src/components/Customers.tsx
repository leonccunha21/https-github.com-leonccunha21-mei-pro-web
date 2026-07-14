import React, { useState, useMemo } from 'react';
import { Customer, Sale } from '../types';
import { roundCurrency } from '../lib/currency';
import { normalizeName } from '../lib/normalize';
import {
  Users, Plus, Search, Pencil, Trash2, Phone, Mail, MapPin,
  DollarSign, ShoppingBag, ArrowLeft, CreditCard, X, UserPlus, Clock
} from 'lucide-react';

interface CustomersProps {
  customers: Customer[];
  sales: Sale[];
  onSaveCustomers: (customers: Customer[]) => void;
}

export default function Customers({ customers, sales, onSaveCustomers }: CustomersProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Customer | null>(null);

  const salesByCustomer = useMemo(() => {
    const map = new Map<string, Sale[]>();
    for (const s of sales) {
      const name = (s.clientName || '').trim();
      if (!name) continue;
      const key = normalizeName(name);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [sales]);

  const filtered = useMemo(() => {
    const q = normalizeName(search);
    return customers.filter(c => !q || normalizeName(c.name).includes(q) || (c.phone || '').includes(q));
  }, [customers, search]);

  const selected = customers.find(c => c.id === selectedId) || null;
  const selectedSales = selected ? (salesByCustomer.get(normalizeName(selected.name)) || []) : [];

  const statsFor = (customer: Customer) => {
    const list = salesByCustomer.get(normalizeName(customer.name)) || [];
    const paid = list.filter(s => s.status === 'completed' || s.status === 'pending');
    const totalSpent = list
      .filter(s => s.status !== 'cancelled')
      .reduce((acc, s) => acc + (s.paidAmount ?? s.total), 0);
    const debts = list
      .filter(s => s.status === 'pending' || (s.installments && (s.paidAmount ?? 0) < s.total))
      .reduce((acc, s) => acc + Math.max(0, (s.total - (s.paidAmount ?? (s.status === 'pending' ? 0 : s.total)))), 0);
    const lastDate = list.length ? list.reduce((a, b) => (new Date(a.date) > new Date(b.date) ? a : b)).date : null;
    return { count: paid.length, totalSpent, debts, lastDate };
  };

  const openNew = () => {
    setForm({ id: '', name: '', phone: '', email: '', address: '', notes: '', createdAt: new Date().toISOString() });
    setShowForm(true);
  };

  const openEdit = (c: Customer) => {
    setForm({ ...c });
    setShowForm(true);
  };

  const saveForm = () => {
    if (!form) return;
    const name = form.name.trim();
    if (!name) return;
    if (form.id) {
      onSaveCustomers(customers.map(c => c.id === form.id ? { ...form, name } : c));
    } else {
      onSaveCustomers([{ ...form, id: `c_${Date.now()}`, name, createdAt: new Date().toISOString() }, ...customers]);
    }
    setShowForm(false);
    setForm(null);
  };

  const remove = (id: string) => {
    if (!confirm('Remover este cliente? O histórico de vendas permanece vinculado pelo nome.')) return;
    onSaveCustomers(customers.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" /> Clientes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">CRM: histórico de compras e débitos por cliente.</p>
        </div>
        <button
          onClick={openNew}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Novo Cliente
        </button>
      </div>

      {selected ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSelectedId(null)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 cursor-pointer">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
            <div className="flex gap-2">
              <button onClick={() => openEdit(selected)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 cursor-pointer"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => remove(selected.id)} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 hover:bg-red-100 text-red-600 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{selected.name}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
              {selected.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {selected.phone}</span>}
              {selected.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {selected.email}</span>}
              {selected.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {selected.address}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat icon={<ShoppingBag className="h-4 w-4" />} label="Compras" value={String(statsFor(selected).count)} />
            <Stat icon={<DollarSign className="h-4 w-4" />} label="Total gasto" value={`R$ ${roundCurrency(statsFor(selected).totalSpent).toFixed(2)}`} />
            <Stat icon={<CreditCard className="h-4 w-4" />} label="Em aberto" value={`R$ ${roundCurrency(statsFor(selected).debts).toFixed(2)}`} accent={statsFor(selected).debts > 0} />
            <Stat icon={<Clock className="h-4 w-4" />} label="Última compra" value={statsFor(selected).lastDate ? new Date(statsFor(selected).lastDate!).toLocaleDateString('pt-BR') : '—'} />
          </div>

          {selected.notes && (
            <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">{selected.notes}</p>
          )}

          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Histórico de Vendas</h3>
            {selectedSales.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Nenhuma venda registrada para este cliente.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="text-left py-2 px-2">Data</th>
                      <th className="text-left py-2 px-2">Forma</th>
                      <th className="text-right py-2 px-2">Total</th>
                      <th className="text-left py-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSales
                      .slice()
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(s => (
                        <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800">
                          <td className="py-2 px-2 text-slate-600 dark:text-slate-300">{new Date(s.date).toLocaleDateString('pt-BR')}</td>
                          <td className="py-2 px-2 text-slate-600 dark:text-slate-300">{s.paymentMethod}</td>
                          <td className="py-2 px-2 text-right font-mono text-slate-700 dark:text-slate-200">R$ {s.total.toFixed(2)}</td>
                          <td className="py-2 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              s.status === 'cancelled' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                              s.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                              'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                            }`}>{s.status}</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente por nome ou telefone"
              className="w-full pl-8 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(c => {
              const st = statsFor(c);
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100 truncate">{c.name}</span>
                    {st.debts > 0 && <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">Devendo</span>}
                  </div>
                  {c.phone && <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Phone className="h-3 w-3" /> {c.phone}</p>}
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{st.count} compras</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">R$ {roundCurrency(st.totalSpent).toFixed(2)}</span>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-400 text-sm">
                <UserPlus className="h-10 w-10 mx-auto mb-2 opacity-50" />
                Nenhum cliente encontrado.
              </div>
            )}
          </div>
        </>
      )}

      {showForm && form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{form.id ? 'Editar Cliente' : 'Novo Cliente'}</h2>
              <button onClick={() => { setShowForm(false); setForm(null); }} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              <Field label="Nome *">
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20" />
              </Field>
              <Field label="Telefone"><input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20" /></Field>
              <Field label="E-mail"><input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20" /></Field>
              <Field label="Endereço"><input value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20" /></Field>
              <Field label="Observações"><textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20" /></Field>
            </div>
            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
              <button onClick={() => { setShowForm(false); setForm(null); }} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">Cancelar</button>
              <button onClick={saveForm} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
      <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${accent ? 'text-red-500' : 'text-slate-400'}`}>
        {icon} {label}
      </div>
      <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 truncate">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{label}</label>
      {children}
    </div>
  );
}
