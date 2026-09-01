import React, { Component, ErrorInfo, ReactNode } from 'react';

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

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-8">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto text-2xl">
              ⚠️
            </div>
            <h2 className="text-xl font-black text-(--color-on-surface)">
              Algo deu errado
            </h2>
            <p className="text-sm text-(--color-outline)">
              Ocorreu um erro inesperado. Tente recarregar a página ou clique no botão abaixo.
            </p>
            {this.state.error && (
              <details className="text-xs text-left bg-(--color-surface-container) p-3 rounded-xl">
                <summary className="cursor-pointer font-bold text-(--color-outline)">
                  Detalhes técnicos
                </summary>
                <pre className="mt-2 whitespace-pre-wrap break-all text-rose-600">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleRetry}
              className="px-6 py-3 rounded-2xl bg-(--color-primary) text-(--color-on-primary) font-bold text-sm shadow-md hover:shadow-lg transition-all"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
