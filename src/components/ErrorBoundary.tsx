import React from 'react';

export class ErrorBoundary extends React.Component<any, any> {
  public state: any;
  public props: any;

  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state && this.state.hasError) {
      return (
        <div className="p-10 text-red-600 bg-red-50 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Aplikasi Mengalami Crash (Error)</h1>
          <pre className="whitespace-pre-wrap text-sm border border-red-200 p-4 bg-white rounded shadow">{this.state.error?.toString()}</pre>
          <pre className="whitespace-pre-wrap text-xs mt-4 text-slate-500 overflow-auto">{this.state.error?.stack}</pre>
          <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded" onClick={() => window.location.reload()}>Muat Ulang Halaman</button>
        </div>
      );
    }
    return (this.props && this.props.children) || null;
  }
}
