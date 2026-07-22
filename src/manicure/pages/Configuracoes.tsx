import { useState } from 'react';
import { ConfigManicure, ManicureDb } from '../types';
import { loadManicureDb, saveManicureDb } from '../localDb';
import { Settings as SettingsIcon, Save, Download, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  config: ConfigManicure;
  setConfig: (c: ConfigManicure) => void;
}

export default function Configuracoes({ config, setConfig }: Props) {
  const [form, setForm] = useState({ nomeSalao: config.nomeSalao, profissional: config.profissional, telefoneContato: config.telefoneContato || '', endereco: config.endereco || '' });
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const save = () => {
    setConfig({ nomeSalao: form.nomeSalao, profissional: form.profissional, telefoneContato: form.telefoneContato || undefined, endereco: form.endereco || undefined });
    toast.success('Configurações salvas');
  };

  const exportBackup = async () => {
    setExporting(true);
    try {
      const db = await loadManicureDb();
      const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `manicure-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Backup exportado!');
    } catch { toast.error('Erro ao exportar backup.'); }
    finally { setExporting(false); }
  };

  const importBackup = (file: File) => {
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as ManicureDb;
        if (!parsed.clientes && !parsed.servicos) { toast.error('Arquivo inválido'); return; }
        if (!window.confirm('Importar este backup? Isso substituirá TODOS os dados atuais.')) { setImporting(false); return; }
        await saveManicureDb(parsed);
        toast.success('Backup importado! Recarregando...');
        setTimeout(() => window.location.reload(), 1500);
      } catch { toast.error('Erro ao ler arquivo.'); }
      finally { setImporting(false); }
    };
    reader.onerror = () => { toast.error('Erro ao ler arquivo.'); setImporting(false); };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-6 w-6 text-fuchsia-600" />
        <h2 className="text-xl font-bold">Configurações</h2>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Dados do Salão</h3>
        <div className="space-y-3">
          <input value={form.nomeSalao} onChange={(e) => setForm({ ...form, nomeSalao: e.target.value })} placeholder="Nome do salão" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
          <input value={form.profissional} onChange={(e) => setForm({ ...form, profissional: e.target.value })} placeholder="Seu nome / profissional" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
          <input value={form.telefoneContato} onChange={(e) => setForm({ ...form, telefoneContato: e.target.value })} placeholder="Telefone de contato" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
          <input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Endereço do salão" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
        </div>
        <button onClick={save} className="flex items-center gap-2 px-5 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl text-sm font-bold transition-colors">
          <Save className="h-4 w-4" /> Salvar
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Backup</h3>
        <div className="flex gap-3 flex-wrap">
          <button onClick={exportBackup} disabled={exporting} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {exporting ? 'Exportando...' : 'Exportar Backup'}
          </button>
          <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-sm font-bold transition-colors cursor-pointer disabled:opacity-50">
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {importing ? 'Importando...' : 'Importar Backup'}
            <input type="file" accept="application/json" className="hidden" disabled={importing} onChange={(e) => e.target.files?.[0] && importBackup(e.target.files[0])} />
          </label>
        </div>
      </div>
    </div>
  );
}
