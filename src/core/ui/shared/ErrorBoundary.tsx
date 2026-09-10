import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Ghost, ArrowsClockwise } from '@phosphor-icons/react';
import { useUIStore } from '@/src/core/store/useUIStore';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches rendering errors in its child tree and displays a friendly fallback UI
 * instead of crashing the entire application.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  componentDidMount() {
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('[ErrorBoundary] Unhandled promise rejection:', event.reason);
    
    // Mostra um aviso não intrusivo para erros assíncronos
    const msg = event.reason?.message || typeof event.reason === 'string' ? event.reason : 'Erro inesperado na comunicação.';
    useUIStore.getState().showToast(`Aviso: ${msg}`);
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-(--color-surface) animate-in fade-in duration-300">
          <div className="text-center space-y-6 max-w-md bg-(--color-surface-container-lowest) p-8 rounded-3xl border border-(--color-outline-variant)/30 shadow-2xl">
            <div className="w-24 h-24 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
              <Ghost className="w-12 h-12" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-(--color-on-surface)">
                Ops! Algo deu errado.
              </h2>
              <p className="text-sm text-(--color-on-surface-variant)">
                A página encontrou um erro inesperado e não conseguiu carregar. 
                Nossa equipe técnica já foi avisada, mas tentar de novo pode resolver!
              </p>
            </div>

            {this.state.error && (
              <details className="text-[10px] text-left bg-rose-50 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-200">
                <summary className="cursor-pointer font-extrabold mb-2 opacity-80 hover:opacity-100 transition-opacity">
                  VER DETALHES TÉCNICOS (AVANÇADO)
                </summary>
                <pre className="whitespace-pre-wrap break-all opacity-80 font-mono mt-2">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleRetry}
              className="w-full py-4 rounded-2xl bg-(--color-primary) text-white font-black text-lg flex items-center justify-center space-x-2 shadow-lg hover:bg-(--color-primary)/90 transition-all transform hover:scale-[1.02]"
            >
              <ArrowsClockwise className="w-5 h-5" />
              <span>Recarregar Página</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
