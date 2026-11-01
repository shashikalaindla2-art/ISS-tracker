'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  CloudLightning,
  Waves,
  Volume2,
  VolumeX,
  ShieldAlert,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { soundEffects } from '@/lib/audio';

export default function DisasterAlertBell({
  alerts = [],
  onSelectAlert,
  onNavigateTab
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [hasDesktopPerm, setHasDesktopPerm] = useState(() => (
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission === 'granted'
      : false
  ));
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const requestNotificationPermission = async () => {
    soundEffects.playClick();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setHasDesktopPerm(permission === 'granted');
      if (permission === 'granted') {
        new Notification('ISS Disaster Radar', {
          body: 'Disaster and severe storm notifications enabled.',
          icon: '/favicon.ico'
        });
      }
    }
  };

  const toggleSound = () => {
    soundEffects.playClick();
    setIsAudioMuted(!isAudioMuted);
  };

  const criticalCount = alerts.filter(
    (a) => a.severity === 'critical' || a.severity === 'high'
  ).length;

  const totalCount = alerts.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Bell Trigger Button with Shiny Blue Glass & Red/Cyan Ping ── */}
      <button
        type="button"
        id="btn-disaster-alert-bell"
        onClick={() => {
          soundEffects.playClick();
          setIsOpen(!isOpen);
        }}
        title="Disaster & Severe Weather Alerts"
        className={`relative flex items-center justify-center w-9 h-9 rounded-xl glass-panel transition-all duration-200 cursor-pointer ${
          criticalCount > 0
            ? 'border-rose-400/50 bg-rose-500/15 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.35)]'
            : totalCount > 0
            ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-200 shadow-[0_0_15px_rgba(56,189,248,0.25)]'
            : 'text-slate-300 hover:text-white hover:border-cyan-400/40'
        }`}
      >
        <Bell className={`w-4 h-4 ${criticalCount > 0 ? 'animate-bounce' : ''}`} />

        {/* Pulse badge */}
        {totalCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[9px] font-mono font-semibold text-slate-950 border border-slate-950 shadow-md ${
              criticalCount > 0
                ? 'bg-rose-400 animate-pulse'
                : 'bg-cyan-300'
            }`}
          >
            {totalCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ── */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel-blue border border-cyan-400/40 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(56,189,248,0.2)] p-4 z-50 text-xs animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold uppercase tracking-wider text-white">
                Disaster & Storm Radar
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleSound}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 transition-colors"
                title={isAudioMuted ? 'Alert Sounds Muted' : 'Alert Sounds Enabled'}
              >
                {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 font-bold">
                {totalCount} Live
              </span>
            </div>
          </div>

          {/* Desktop Push Notification Banner */}
          {!hasDesktopPerm && (
            <div className="mt-2.5 p-2 rounded-xl bg-cyan-950/40 border border-cyan-400/20 flex items-center justify-between gap-2">
              <span className="text-[10px] text-cyan-200">
                Receive browser alerts for severe storms & floods
              </span>
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="shrink-0 px-2 py-1 rounded-lg bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 text-[10px] font-bold border border-cyan-400/40 cursor-pointer"
              >
                Enable
              </button>
            </div>
          )}

          {/* Alert List */}
          <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <div className="py-6 text-center text-slate-400 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="font-bold text-white text-xs">No Critical Disasters Detected</p>
                <p className="text-[10px] text-slate-400">
                  Global meteorological systems operating normally.
                </p>
              </div>
            ) : (
              alerts.map((alert) => {
                const isCritical = alert.severity === 'critical';
                const isFlood = alert.category === 'floods' || (alert.title || '').toLowerCase().includes('flood');
                const isStorm = alert.category === 'severeStorms' || (alert.title || '').toLowerCase().includes('cyclone') || (alert.title || '').toLowerCase().includes('storm');

                return (
                  <div
                    key={alert.id}
                    onClick={() => {
                      if (onSelectAlert) onSelectAlert(alert);
                      if (onNavigateTab) onNavigateTab('weather');
                      setIsOpen(false);
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer group ${
                      isCritical
                        ? 'bg-rose-950/30 border-rose-500/40 hover:border-rose-400 hover:bg-rose-950/50'
                        : 'bg-cyan-950/25 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                            isCritical
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {isFlood ? (
                            <Waves className="w-3.5 h-3.5" />
                          ) : isStorm ? (
                            <CloudLightning className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white text-[11px] leading-tight group-hover:text-cyan-200 transition-colors">
                            {alert.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                            <span className={isCritical ? 'text-rose-300 font-bold' : 'text-cyan-300'}>
                              {alert.categoryLabel || 'Severe Event'}
                            </span>
                            {alert.distanceKm !== undefined && (
                              <span>· {alert.distanceKm.toLocaleString()} km from ISS</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300 transition-colors shrink-0 mt-1" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer CTA */}
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">NASA EONET + Open-Meteo</span>
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                if (onNavigateTab) onNavigateTab('weather');
                setIsOpen(false);
              }}
              className="text-[11px] font-bold text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>Open Weather Radar</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
