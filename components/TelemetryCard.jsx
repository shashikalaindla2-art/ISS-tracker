'use client';

import React from 'react';

/**
 * Shiny Blue Aerospace Telemetry Card
 * Uses Electric Cyan, Sapphire Blue, Silver, and Glassy styling with glowing indicator dots
 */
export default function TelemetryCard({
  title,
  value,
  unit,
  subvalue,
  icon: Icon,
  badge,
  badgeVariant = 'default',
  highlight = false,
  tooltip
}) {
  const badgeStyles = {
    default:  'bg-white/8 text-slate-300 border-white/15',
    blue:     'bg-cyan-500/15 text-cyan-200 border-cyan-400/45 shadow-[0_0_12px_rgba(56,189,248,0.25)]',
    gold:     'bg-cyan-500/15 text-cyan-200 border-cyan-400/45 shadow-[0_0_12px_rgba(56,189,248,0.25)]',
    silver:   'bg-slate-200/10 text-slate-200 border-slate-300/30 shadow-[0_0_10px_rgba(226,232,240,0.15)]',
    cyan:     'bg-cyan-500/15 text-cyan-200 border-cyan-400/45 shadow-[0_0_12px_rgba(6,182,212,0.25)]',
    amber:    'bg-amber-500/15 text-amber-300 border-amber-400/40',
    emerald:  'bg-emerald-500/15 text-emerald-300 border-emerald-400/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    rose:     'bg-rose-500/15 text-rose-300 border-rose-400/40'
  };

  return (
    <div
      className={`relative group flex flex-col justify-between p-4 rounded-2xl glass-panel transition-all duration-300 hover:-translate-y-1 ${
        highlight
          ? 'glass-panel-blue border-cyan-400/50 shadow-[0_0_25px_rgba(56,189,248,0.25)]'
          : 'hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]'
      }`}
      title={tooltip}
    >
      {/* Decorative Electric Blue Corner Indicator */}
      <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400/50 group-hover:bg-cyan-300 group-hover:scale-125 transition-all shadow-[0_0_6px_#38bdf8]" />

      {/* Top row: label + icon */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 group-hover:text-cyan-200 transition-colors">
          {title}
        </span>
        {Icon && (
          <div className={`p-1.5 rounded-xl transition-all ${
            highlight
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
              : 'bg-white/8 text-slate-300 group-hover:bg-cyan-500/15 group-hover:text-cyan-300 group-hover:border group-hover:border-cyan-400/30'
          }`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Main value */}
      <div className="flex items-baseline gap-1.5 mb-2.5">
        <span className={`font-mono font-semibold tracking-tight ${
          highlight
            ? 'text-blue-gradient drop-shadow-[0_2px_14px_rgba(56,189,248,0.4)]'
            : 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]'
        } ${
          String(value).length > 8 ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'
        }`}>
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-cyan-300/90 font-bold">{unit}</span>
        )}
      </div>

      {/* Bottom: badge or subvalue */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/8">
        {badge && (
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
            badgeStyles[badgeVariant] || badgeStyles.default
          }`}>
            {badge}
          </span>
        )}
        {subvalue && (
          <span className="text-[10px] text-slate-300 font-mono font-medium ml-auto truncate">
            {subvalue}
          </span>
        )}
      </div>
    </div>
  );
}
