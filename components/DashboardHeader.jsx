'use client';

import React from 'react';
import {
  RefreshCw,
  Orbit,
  Compass,
  Users,
  Activity,
  Bot,
  Zap,
  CloudLightning
} from 'lucide-react';
import ConnectionStatus from './ConnectionStatus';
import DisasterAlertBell from './DisasterAlertBell';
import { getAssetPath } from '@/lib/basePath';

const NAV_TABS = [
  { id: 'tracker', label: 'Orbital Tracker', icon: Orbit, color: 'blue' },
  { id: 'weather', label: 'Disaster & Weather', icon: CloudLightning, color: 'blue', isNew: true },
  { id: 'copilot', label: 'AI Chatbot', icon: Bot, color: 'blue', accent: true },
  { id: 'sighting', label: 'Radar Pass', icon: Compass, color: 'silver' },
  { id: 'physics', label: 'Physics Engine', icon: Activity, color: 'silver' },
  { id: 'crew', label: 'Expedition 72', icon: Users, color: 'silver' }
];

export default function DashboardHeader({
  status,
  isDemo = false,
  isManualRefreshing = false,
  canManualRefresh = true,
  isSimulationMode = false,
  activeTab = 'tracker',
  alerts = [],
  onSelectTab,
  onRefresh,
  onToggleSimulation,
  onSelectAlert
}) {
  return (
    <header className="sticky top-0 z-40 px-3 sm:px-6 py-2.5 pointer-events-auto">
      <div className="max-w-7xl mx-auto">
        <div className="glass-panel px-4 sm:px-6 py-2.5 rounded-2xl flex items-center justify-between gap-3 border border-cyan-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">

          {/* ── Brand with Official Emblem Logo ── */}
          <button
            type="button"
            onClick={() => onSelectTab('tracker')}
            className="flex items-center gap-3 shrink-0 group text-left cursor-pointer"
          >
            <div className="relative w-10 h-10 rounded-full bg-slate-900 border border-cyan-400/50 flex items-center justify-center p-0.5 shadow-[0_0_20px_rgba(56,189,248,0.5)] group-hover:scale-105 group-hover:border-cyan-300 transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getAssetPath('/logo.jpeg')}
                alt="ISS Tracker Official Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover rounded-full"
              />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-300 border-2 border-slate-950 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-semibold tracking-tight text-white group-hover:text-cyan-300 transition-colors font-display">
                  ISS <span className="text-blue-gradient font-bold">TRACKER</span>
                </span>
                <span className="hidden md:inline-block text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-400/15 border border-cyan-400/40 text-cyan-200 font-mono font-medium">
                  PRO
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                <span className="text-[10px] text-slate-300 font-mono font-medium">NORAD #25544 · LEO</span>
              </div>
            </div>
          </button>

          {/* ── Geometric Glassy Navigation Tabs (Shiny Blue) ── */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/8" aria-label="Main navigation">
            {NAV_TABS.map(({ id, label, icon: Icon, accent, isNew }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  id={`tab-${id}`}
                  onClick={() => onSelectTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/30 via-sky-400/20 to-blue-500/30 text-cyan-100 border border-cyan-400/60 shadow-[0_0_16px_rgba(56,189,248,0.3)] font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/6 border border-transparent'
                  } ${accent && !isActive ? 'text-cyan-300' : ''}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-300' : 'text-slate-400'} ${accent && !isActive ? 'animate-pulse text-cyan-300' : ''}`} />
                  <span>{label}</span>
                  {isNew && (
                    <span className="px-1 py-0.2 rounded-full bg-cyan-400/20 text-cyan-300 text-[8px] font-mono border border-cyan-400/40 font-bold">
                      RADAR
                    </span>
                  )}
                  {accent && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* ── Right Controls ── */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Disaster Alert Bell with Badge */}
            <DisasterAlertBell
              alerts={alerts}
              onSelectAlert={onSelectAlert}
              onNavigateTab={onSelectTab}
            />

            <ConnectionStatus
              status={status}
              isDemo={isDemo}
              isUpdating={isManualRefreshing || status === 'UPDATING'}
            />

            {/* Simulation Toggle */}
            <button
              type="button"
              id="btn-toggle-simulation"
              onClick={onToggleSimulation}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isSimulationMode
                  ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:text-white hover:border-cyan-400/40'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isSimulationMode ? 'Simulation Active' : 'Simulate'}</span>
            </button>

            {/* Manual Refresh Button (Shiny Blue Sheen) */}
            <button
              type="button"
              id="btn-manual-refresh"
              onClick={onRefresh}
              disabled={!canManualRefresh || isManualRefreshing}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                canManualRefresh && !isManualRefreshing
                  ? 'bg-gradient-to-r from-cyan-500/25 via-sky-500/20 to-blue-500/25 text-cyan-100 border-cyan-400/50 hover:border-cyan-300 hover:shadow-[0_0_18px_rgba(56,189,248,0.4)] cursor-pointer active:scale-95'
                  : 'bg-white/5 text-slate-500 border-white/6 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isManualRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isManualRefreshing ? 'Polling…' : 'Sync'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto scrollbar-thin py-2 px-1 mt-1">
          {NAV_TABS.map(({ id, label, icon: Icon, accent, isNew }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'glass-panel-blue text-cyan-200 border-cyan-400/60 font-bold shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                    : 'glass-panel text-slate-300 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                <span>{label}</span>
                {isNew && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
