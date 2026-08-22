import React from 'react';
import { getCurrentLanguage } from '../../core/utils/i18n.js';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    const lang = getCurrentLanguage();
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-xl min-w-[320px] sm:min-w-[480px] bg-white dark:bg-slate-900 rounded-2xl p-8 border border-red-200 dark:border-red-900 mx-auto space-y-4 text-center shadow-lg my-8">
          <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950 text-[#E63946] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">warning</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {lang === 'en' ? 'An Error Occurred While Displaying Component' : 'Terjadi Kesalahan Saat Menampilkan Komponen'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800 p-3 rounded-lg font-mono">
            {this.state.error?.toString() || 'Komponen mengalami error runtime.'}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                localStorage.removeItem('wtp_generated_programs');
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-[#E63946] text-white rounded-xl font-bold text-xs hover:bg-[#D62839] transition-all shadow-md shadow-red-500/20 cursor-pointer"
            >
              {lang === 'en' ? 'Reset & Regenerate Program' : 'Reset & Regenerate Program'}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
