'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Waves,
  CloudLightning,
  X,
  ChevronRight,
  ShieldAlert,
  Volume2
} from 'lucide-react';
import { soundEffects } from '@/lib/audio';

export default function DisasterNotificationToast({
  alert,
  onDismiss,
  onViewDetails
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (alert) {
      setIsVisible(true);
      // Play high-tech alert chime
      soundEffects.playWarningChime();
    }
  }, [alert]);

  if (!alert || !isVisible) return null;

  const isCritical = alert.severity === 'critical';
  const isFlood =
    alert.category === 'floods' ||
    (alert.title || '').toLowerCase().includes('flood');
  const isStorm =
    alert.category === 'severeStorms' ||
    (alert.title || '').toLowerCase().includes('cyclone') ||
    (alert.title || '').toLowerCase().includes('storm');

  const handleClose = () => {
    soundEffects.playClick();
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  return (
    <div className="fixed top-18 right-4 sm:right-6 z-50 max-w-sm w-full animate-fade-up pointer-events-auto">
      <div
        className={`glass-panel p-4 rounded-2xl shadow-2xl border ${
          isCritical
            ? 'border-rose-400/60 bg-rose-950/70 shadow-[0_0_30px_rgba(244,63,94,0.35)]'
            : 'border-cyan-400/60 bg-slate-950/80 shadow-[0_0_30px_rgba(56,189,248,0.35)]'
        } backdrop-blur-2xl relative overflow-hidden`}
      >
        {/* Shiny Edge Light */}
        <span
          className={`absolute top-0 left-0 right-0 h-[2px] ${
            isCritical
              ? 'bg-gradient-to-r from-rose-500 via-pink-400 to-rose-600'
              : 'bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500'
          }`}
        />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isCritical
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}
            >
              {isFlood ? (
                <Waves className="w-5 h-5" />
              ) : isStorm ? (
                <CloudLightning className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full border ${
                    isCritical
                      ? 'bg-rose-500/20 text-rose-200 border-rose-400/40'
                      : 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40'
                  }`}
                >
                  {isCritical ? 'CRITICAL EARLY WARNING' : 'DISASTER ADVISORY'}
                </span>
                {alert.distanceKm !== undefined && (
                  <span className="text-[10px] font-mono text-slate-300">
                    {alert.distanceKm} km away
                  </span>
                )}
              </div>

              <h4 className="text-xs font-semibold text-white leading-tight">
                {alert.title}
              </h4>

              <p className="text-[11px] text-slate-300 line-clamp-2">
                {alert.description ||
                  alert.message ||
                  'Monitored via NASA EONET & Open-Meteo Early Warning Radar.'}
              </p>

              {onViewDetails && (
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    onViewDetails(alert);
                    setIsVisible(false);
                  }}
                  className="mt-2 text-[11px] font-bold text-cyan-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Open Radar Forecast</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
