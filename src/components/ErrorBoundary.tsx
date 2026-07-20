import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Copy } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State;
  public props: Props;
  public setState!: (state: Partial<State> | State, callback?: () => void) => void;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetErrorBoundary(): void {
    this.setState({ hasError: false, error: null } as State);
    this.props.onReset?.();
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetErrorBoundary={this.resetErrorBoundary} />;
      }
      return <DefaultErrorFallback error={this.state.error!} resetErrorBoundary={this.resetErrorBoundary} />;
    }
    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function DefaultErrorFallback({ error, resetErrorBoundary }: DefaultErrorFallbackProps) {
  const errorMessage = error?.message || 'Erro desconhecido';
  const errorStack = error?.stack || '';

  const copyError = () => {
    navigator.clipboard.writeText(`${errorMessage}\n\n${errorStack}`);
  };

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Ops! Algo deu errado
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          A tela de vendas travou. Não se preocupe, seus dados estão salvos.
        </p>
        
        <details className="text-left mb-6 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
          <summary className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
            Ver detalhes do erro
          </summary>
          <pre className="mt-3 text-[10px] text-rose-700 dark:text-rose-300 overflow-x-auto max-h-40 overflow-y-auto font-mono whitespace-pre-wrap">
            {errorMessage}
            {errorStack && `\n\n${errorStack}`}
          </pre>
        </details>

        <div className="space-y-3">
          <button
            onClick={resetErrorBoundary}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Tentar novamente
          </button>
          
          <button
            onClick={copyError}
            className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Copy className="w-5 h-5" />
            Copiar erro
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Se o problema persistir, recarregue a página (F5) ou entre em contato com o suporte.
        </p>
      </div>
    </div>
  );
}

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorBoundaryFallback({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) {
  const errorMessage = error?.message || 'Erro desconhecido';

  return (
    <div className="min-h-[40vh] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-rose-200 dark:border-rose-800 p-6 max-w-md w-full text-center">
        <div className="w-14 h-14 mx-auto mb-4 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-rose-600 dark:text-rose-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Erro na tela de vendas
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm">
          {errorMessage}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}