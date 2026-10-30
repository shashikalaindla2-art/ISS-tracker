'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Radio, Timer, Sparkles } from 'lucide-react';
import { formatTimestamp, formatRelativeTime } from '@/lib/formatters';

export default function LastUpdated({
  lastSuccessTime,
  observationTimestamp,
  intervalMs = 7000,
  isStale = false,
  isDemo = false
}) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-2xl glass-panel border border-cyan-500/20 text-xs text-slate-300">
      <div className="flex items-center gap-2.5">
        <Clock className={`w-3.5 h-3.5 ${isStale ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}`} />
        <span className="text-slate-300 font-medium">Telemetry Sync:</span>
        <span className={`font-bold font-mono ${isStale ? 'text-amber-300' : 'text-white'}`}>
          {lastSuccessTime ? formatRelativeTime(lastSuccessTime) : 'Synchronizing…'}
        </span>
        {lastSuccessTime && (
          <span className="hidden sm:inline text-slate-400 font-mono">
            ({new Date(lastSuccessTime).toLocaleTimeString()})
          </span>
        )}
        {isDemo && (
          <span className="px-2 py-0.5 rounded-full badge-blue text-[9px] font-bold">
            SYNTHETIC
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-[11px] font-mono">
        {observationTimestamp && (
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-200">{formatTimestamp(observationTimestamp)}</span>
          </div>
        )}
        <div className="hidden md:flex items-center gap-1.5 text-slate-400">
          <Timer className="w-3.5 h-3.5 text-slate-400" />
          <span>Interval: {Math.round(intervalMs / 1000)}s</span>
        </div>
      </div>
    </div>
  );
}
