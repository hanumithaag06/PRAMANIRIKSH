import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Shield, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PRAMANIRIKSH Uncaught UI Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    localStorage.removeItem('prm_auth_token');
    localStorage.removeItem('prm_user');
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B1220] text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-7 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-xs text-rose-400 font-bold uppercase tracking-wider">
                  Interface Exception
                </span>
                <h2 className="text-xl font-black text-white font-sans">Something went wrong</h2>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              An unexpected rendering error occurred. The application state was safely contained.
            </p>

            {this.state.error && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <p className="text-[11px] font-mono text-rose-300 font-bold break-words">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[10px] font-mono text-slate-500 max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Reset & Go Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
