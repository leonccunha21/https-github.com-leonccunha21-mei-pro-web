import React, { useState } from 'react';
import { parseExcel, ExcelData } from '../lib/excelSync';
import { showToast } from '../lib/toast';

interface ExcelUploaderProps {
  uid?: string; // Mantido para retrocompatibilidade, mas não usado aqui diretamente
  isOpen?: boolean;
  onClose: () => void;
  onImport: (data: any) => void;
}

export default function ExcelUploader({ onClose, onImport }: ExcelUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleLoadLocally = async () => {
    if (!file) return;
    setLoading(true);
    try {
      showToast('Lendo planilha...', 'loading');
      const data = await parseExcel(file);
      onImport(data);
      showToast('✅ Planilha carregada com sucesso!', 'success');
      onClose();
    } catch (e) {
      console.error(e);
      showToast('⚠️ Falha ao ler a planilha. Verifique o formato.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Importar Planilha Excel</h2>
          <p className="text-xs text-slate-500 mt-1">Os dados serão carregados no sistema localmente.</p>
        </div>
        
        <div className="p-6 space-y-4">
          <input 
            type="file" 
            accept=".xlsx,.xls,.csv" 
            onChange={handleFileChange} 
            disabled={loading} 
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100
              dark:file:bg-indigo-900/30 dark:file:text-indigo-400
            "
          />
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
          <button 
            onClick={onClose} 
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleLoadLocally} 
            disabled={!file || loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
          >
            {loading ? 'Carregando...' : 'Carregar no Sistema'}
          </button>
        </div>
      </div>
    </div>
  );
}

