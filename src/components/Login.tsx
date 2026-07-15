import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onSignIn: () => void;
  error?: string | null;
}

export default function LoginScreen({ onSignIn, error }: LoginScreenProps) {
  const [busy, setBusy] = useState(false);

  const handleSignIn = async () => {
    setBusy(true);
    try {
      await onSignIn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center gap-6">
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center">
          <div className="w-7 h-7 border-2 border-white"></div>
        </div>

        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-950 dark:text-slate-100 tracking-tight">ZM Store</h1>
          <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mt-0.5">Gestão Comercial</p>
        </div>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Uso particular. Faça login com sua conta Google para acessar seus dados.
          Sem login, nenhuma informação é exibida.
        </div>

        {error && (
          <div className="w-full text-center text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg py-2 px-3">
            {error}
          </div>
        )}

        <button
          onClick={handleSignIn}
          disabled={busy}
          className="w-full py-3 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed text-slate-800 dark:text-slate-100 rounded-xl text-sm font-bold flex items-center justify-center gap-3 transition-colors cursor-pointer"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          Entrar com Google
        </button>

        <p className="text-[11px] text-slate-400 leading-snug text-center">
          Seus dados ficam salvos neste aparelho. A importação é feita manualmente
          por planilha Excel.
        </p>
      </div>
    </div>
  );
}
