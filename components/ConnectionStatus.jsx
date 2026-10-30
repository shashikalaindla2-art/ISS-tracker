'use client';

import React from 'react';
import { Wifi, WifiOff, AlertTriangle, RefreshCw, Radio, Zap } from 'lucide-react';

const STATUS_CONFIG = {
  LIVE: {
    dot: 'bg-emerald-400',
    ping: 'bg-emerald-400',
    text: 'text-emerald-300',
    container: 'border-emerald-500/20 bg-emerald-500/8',
    label: 'Live'
  },
  UPDATING: {
    dot: 'bg-cyan-400',
    text: 'text-cyan-300',
    container: 'border-cyan-500/20 bg-cyan-500/8',
    label: 'Updating'
  },
  STALE: {
    dot: 'bg-amber-400',
    text: 'text-amber-300',
    container: 'border-amber-500/20 bg-amber-500/8',
    label: 'Stale'
  },
  ERROR: {
    dot: 'bg-rose-400',
    text: 'text-rose-300',
    container: 'border-rose-500/20 bg-rose-500/8',
    label: 'Error'
  },
  INITIAL_LOADING: {
    dot: 'bg-slate-500',
    text: 'text-slate-400',
    container: 'border-white/8 bg-white/3',
    label: 'Connecting'
  }
};

export default function ConnectionStatus({ status, isDemo = false, isUpdating = false }) {
  if (isDemo) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/8 text-amber-300 text-xs font-medium">
        <Zap className="w-3 h-3" />
        <span>Demo</span>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.INITIAL_LOADING;

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${cfg.container} ${cfg.text}`}>
      {status === 'LIVE' ? (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.ping || cfg.dot} opacity-75`} />
          <span className={`relative inline-flex h-2 w-2 rounded-full ${cfg.dot}`} />
        </span>
      ) : status === 'UPDATING' ? (
        <RefreshCw className="w-3 h-3 animate-spin" />
      ) : status === 'STALE' ? (
        <AlertTriangle className="w-3 h-3" />
      ) : status === 'ERROR' ? (
        <WifiOff className="w-3 h-3" />
      ) : (
        <Radio className="w-3 h-3 animate-pulse" />
      )}
      <span>{cfg.label}</span>
    </div>
  );
}
