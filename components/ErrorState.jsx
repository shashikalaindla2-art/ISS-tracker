'use client';

import React from 'react';
import { RefreshCw, Eye, WifiOff } from 'lucide-react';

export default function ErrorState({ errorMessage, onRetry, onLoadDemo }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-4 text-center max-w-md mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/8 border border-rose-500/20 flex items-center justify-center">
        <WifiOff className="w-6 h-6 text-rose-400" />
      </div>

      <div className="space-y-2">
        <h2 className="text-base font-semibold text-white">Connection Failed</h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
          {errorMessage ||
            'Unable to reach the ISS tracking API. This may be a temporary network issue or rate limit.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          id="btn-error-retry"
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-sm font-medium hover:bg-cyan-500/20 hover:border-cyan-400/40 transition-all active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>

        {onLoadDemo && (
          <button
            type="button"
            id="btn-error-demo"
            onClick={onLoadDemo}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/4 border border-white/8 text-slate-300 text-sm font-medium hover:bg-white/8 hover:text-white transition-all active:scale-95"
          >
            <Eye className="w-4 h-4" />
            View Demo
          </button>
        )}
      </div>

      <p className="text-xs text-slate-600 max-w-xs">
        Demo mode lets you preview the full dashboard interface without a live API connection.
      </p>
    </div>
  );
}
