import React, { useState, useRef } from 'react';
import { Sale, Expense } from '../types';
import { parseOfx, type OfxTransaction } from '../lib/ofxParser';
import {
  Upload, Search, CheckCircle, XCircle, AlertTriangle,
  Building2, Calendar, DollarSign, Download, ChevronDown, ChevronUp
} from 'lucide-react';

interface BankConciliationProps {
  sales: Sale[];
  expenses: Expense[];
}

function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString('pt-BR'); }

export default function BankConciliation({ sales, expenses }: BankConciliationProps) {
  const [transactions, setTransactions] = useState<OfxTransaction[]>([]);
  const [bankInfo, setBankInfo] = useState<{ bankId?: string; accountId?: string }>({});
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = parseOfx(reader.result as string);
        setTransactions(result.transactions);
        setBankInfo({ bankId: result.bankId, accountId: result.accountId });
        setMatchedIds(new Set());
      } catch {
        alert('Erro ao processar arquivo OFX.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const salesByValue = new Map<number, Sale[]>();
  for (const s of sales) {
    if (s.status === 'completed') {
      const key = Math.round(s.total * 100);
      if (!salesByValue.has(key)) salesByValue.set(key, []);
      salesByValue.get(key)!.push(s);
    }
  }

  const expensesByValue = new Map<number, Expense[]>();
  for (const e of expenses) {
    if (e.status === 'paid') {
      const key = Math.round(e.amount * 100);
      if (!expensesByValue.has(key)) expensesByValue.set(key, []);
      expensesByValue.get(key)!.push(e);
    }
  }

  const autoMatch = (tx: OfxTransaction): 'sale' | 'expense' | null => {
    const key = Math.round(tx.amount * 100);
    if (tx.type === 'CREDIT' && salesByValue.has(key)) return 'sale';
    if (tx.type === 'DEBIT' && expensesByValue.has(key)) return 'expense';
    return null;
  };

  const toggleMatch = (id: string) => {
    setMatchedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filtered = transactions.filter(tx =>
    tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.id.toLowerCase().includes(searchTerm)
  );

  const totalCredits = transactions.filter(t => t.type === 'CREDIT').reduce((a, t) => a + t.amount, 0);
  const totalDebits = transactions.filter(t => t.type === 'DEBIT').reduce((a, t) => a + t.amount, 0);
  const matchedCredits = transactions.filter(t => t.type === 'CREDIT' && matchedIds.has(t.id)).reduce((a, t) => a + t.amount, 0);
  const matchedDebits = transactions.filter(t => t.type === 'DEBIT' && matchedIds.has(t.id)).reduce((a, t) => a + t.amount, 0);

  const exportCsv = () => {
    const rows = [['ID', 'Data', 'Descrição', 'Valor (R$)', 'Tipo', 'Conciliado']];
    for (const tx of transactions) {
      rows.push([tx.id, tx.date, tx.description, tx.amount.toFixed(2), tx.type === 'CREDIT' ? 'Crédito' : 'Débito', matchedIds.has(tx.id) ? 'Sim' : 'Não']);
    }
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conciliacao_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
            <Building2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Conciliação Bancária</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Importe extratos OFX e concilie com vendas e despesas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            Importar OFX
          </button>
          <input ref={fileInputRef} type="file" accept=".ofx,.qfx" onChange={handleFile} className="hidden" />
          {transactions.length > 0 && (
            <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer">
              <Download className="h-3.5 w-3.5" />
              Exportar CSV
            </button>
          )}
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <Building2 className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-500 dark:text-slate-400">Nenhum extrato importado</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Faça o download do extrato bancário no formato OFX/QFX e importe aqui para conciliar com suas vendas e despesas.
          </p>
        </div>
      ) : (
        <>
          {/* Bank Info + Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <span className="text-[10px] font-bold uppercase text-slate-400">Banco</span>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{bankInfo.bankId || 'N/I'}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <span className="text-[10px] font-bold uppercase text-slate-400">Conta</span>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{bankInfo.accountId || 'N/I'}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <span className="text-[10px] font-bold uppercase text-slate-400">Créditos</span>
              <p className="text-sm font-bold text-emerald-600 mt-1">{fmt(totalCredits)}</p>
              <p className="text-[10px] text-slate-400">{matchedCredits > 0 ? `Conciliado: ${fmt(matchedCredits)}` : `${transactions.filter(t => t.type === 'CREDIT').length} transações`}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <span className="text-[10px] font-bold uppercase text-slate-400">Débitos</span>
              <p className="text-sm font-bold text-rose-600 mt-1">{fmt(totalDebits)}</p>
              <p className="text-[10px] text-slate-400">{matchedDebits > 0 ? `Conciliado: ${fmt(matchedDebits)}` : `${transactions.filter(t => t.type === 'DEBIT').length} transações`}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text" placeholder="Buscar transação..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-400 transition-all"
            />
          </div>

          {/* Transactions Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        className="accent-indigo-600 cursor-pointer"
                        checked={transactions.length > 0 && transactions.every(t => matchedIds.has(t.id))}
                        onChange={() => {
                          if (transactions.every(t => matchedIds.has(t.id))) setMatchedIds(new Set());
                          else setMatchedIds(new Set(transactions.map(t => t.id)));
                        }}
                      />
                    </th>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Descrição</th>
                    <th className="py-3 px-4 text-right">Valor</th>
                    <th className="py-3 px-4 text-center">Tipo</th>
                    <th className="py-3 px-4 text-center">Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filtered.map(tx => {
                    const match = autoMatch(tx);
                    return (
                      <tr key={tx.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${matchedIds.has(tx.id) ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            className="accent-indigo-600 cursor-pointer"
                            checked={matchedIds.has(tx.id)}
                            onChange={() => toggleMatch(tx.id)}
                          />
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">{fmtDate(tx.date)}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate max-w-[300px]">{tx.description}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{tx.id}</p>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-sm font-bold">{fmt(tx.amount)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-sm ${
                            tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {tx.type === 'CREDIT' ? 'Crédito' : 'Débito'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {matchedIds.has(tx.id) ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                          ) : match ? (
                            <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 justify-center">
                              <AlertTriangle className="h-3 w-3" /> Possível match
                            </span>
                          ) : (
                            <XCircle className="h-4 w-4 text-slate-300 mx-auto" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 flex items-center justify-between">
              <span>{filtered.length} de {transactions.length} transações</span>
              <span>{matchedIds.size} conciliadas</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
