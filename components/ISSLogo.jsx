'use client';

import React, { useState, useId } from 'react';
import { getAssetPath } from '@/lib/basePath';
import { soundEffects } from '@/lib/audio';

/**
 * ISS Tracker Precision Aerospace Emblem & Logo
 * Features official circular mission patch emblem with cybernetic HUD brackets,
 * resilient SVG vector fallback with unique IDs, and interactive navigation.
 */
export default function ISSLogo({
  size = 'md',
  className = '',
  showSubtext = true,
  onClick
}) {
  const [imageError, setImageError] = useState(false);
  const id = useId();

  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const badgeSize = isSm ? 'w-10 h-10' : isLg ? 'w-18 h-18' : 'w-13 h-13 sm:w-15 sm:h-15';
  const iconSize = isSm ? 'w-8 h-8' : isLg ? 'w-16 h-16' : 'w-11 h-11 sm:w-13 sm:h-13';

  const handleClick = (e) => {
    soundEffects.playClick();
    if (onClick) {
      onClick(e);
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      title="ISS Tracker — Return to Live Telemetry"
      className={`flex items-center gap-3 select-none group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition-transform active:scale-[0.98] ${className}`}
    >
      {/* Light Curve Emblem Container without harsh edges/highlights */}
      <div className="relative shrink-0">
        <div
          className={`relative ${badgeSize} rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 flex items-center justify-center p-1 transition-all duration-300 group-hover:border-cyan-400/40 group-hover:bg-slate-800/80`}
        >
          {/* Official Mission Emblem Image or Precision Vector Fallback */}
          {!imageError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={getAssetPath('/logo.jpeg')}
              alt="ISS Tracker Official Aerospace Emblem"
              width={80}
              height={80}
              onError={() => setImageError(true)}
              className={`${iconSize} object-cover rounded-xl transition-transform duration-300 group-hover:scale-105`}
            />
          ) : (
            /* High-Precision ISS Vector SVG Fallback */
            <svg
              viewBox="0 0 64 64"
              className={`${iconSize} transition-transform duration-300 group-hover:scale-105`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id={`${id}-solarGlow`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id={`${id}-trussGrad`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="50%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
                <linearGradient id={`${id}-orbitArc`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              <ellipse
                cx="32"
                cy="32"
                rx="28"
                ry="11"
                transform="rotate(-26 32 32)"
                stroke={`url(#${id}-orbitArc)`}
                strokeWidth="1.5"
                strokeDasharray="4 3"
                className="opacity-75 group-hover:opacity-100"
              />

              <line x1="8" y1="32" x2="56" y2="32" stroke={`url(#${id}-trussGrad)`} strokeWidth="2.2" strokeLinecap="square" />
              <line x1="20" y1="30" x2="20" y2="34" stroke="#22d3ee" strokeWidth="1.2" />
              <line x1="44" y1="30" x2="44" y2="34" stroke="#22d3ee" strokeWidth="1.2" />

              {/* Port Arrays */}
              <line x1="14" y1="14" x2="14" y2="50" stroke="#94a3b8" strokeWidth="1.5" />
              <rect x="9" y="15" width="10" height="13" fill={`url(#${id}-solarGlow)`} stroke="#38bdf8" strokeWidth="0.8" />
              <line x1="9" y1="19.5" x2="19" y2="19.5" stroke="#0ea5e9" strokeWidth="0.5" />
              <line x1="9" y1="24" x2="19" y2="24" stroke="#0ea5e9" strokeWidth="0.5" />
              <line x1="14" y1="15" x2="14" y2="28" stroke="#38bdf8" strokeWidth="0.8" />
              <rect x="9" y="36" width="10" height="13" fill={`url(#${id}-solarGlow)`} stroke="#38bdf8" strokeWidth="0.8" />
              <line x1="9" y1="40.5" x2="19" y2="40.5" stroke="#0ea5e9" strokeWidth="0.5" />
              <line x1="9" y1="45" x2="19" y2="45" stroke="#0ea5e9" strokeWidth="0.5" />
              <line x1="14" y1="36" x2="14" y2="49" stroke="#38bdf8" strokeWidth="0.8" />

              {/* Starboard Arrays */}
              <line x1="50" y1="14" x2="50" y2="50" stroke="#94a3b8" strokeWidth="1.5" />
              <rect x="45" y="15" width="10" height="13" fill={`url(#${id}-solarGlow)`} stroke="#38bdf8" strokeWidth="0.8" />
              <line x1="45" y1="19.5" x2="55" y2="19.5" stroke="#0ea5e9" strokeWidth="0.5" />
              <line x1="45" y1="24" x2="55" y2="24" stroke="#0ea5e9" strokeWidth="0.5" />
              <line x1="50" y1="15" x2="50" y2="28" stroke="#38bdf8" strokeWidth="0.8" />
              <rect x="45" y="36" width="10" height="13" fill={`url(#${id}-solarGlow)`} stroke="#38bdf8" strokeWidth="0.8" />
              <line x1="45" y1="40.5" x2="55" y2="40.5" stroke="#0ea5e9" strokeWidth="0.5" />
              <line x1="45" y1="45" x2="55" y2="45" stroke="#0ea5e9" strokeWidth="0.5" />
              <line x1="50" y1="36" x2="50" y2="49" stroke="#38bdf8" strokeWidth="0.8" />

              {/* Pressurized Modules */}
              <rect x="28" y="21" width="8" height="22" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.4" />
              <line x1="28" y1="26" x2="36" y2="26" stroke="#06b6d4" strokeWidth="0.8" />
              <line x1="28" y1="32" x2="36" y2="32" stroke="#22d3ee" strokeWidth="1" />
              <line x1="28" y1="38" x2="36" y2="38" stroke="#06b6d4" strokeWidth="0.8" />
              <rect x="23" y="28.5" width="18" height="7" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
              <circle cx="32" cy="32" r="2.2" fill="#38bdf8" />
              <circle cx="32" cy="32" r="1" fill="#ffffff" />
              <path d="M 23 25 Q 21 21 24 19" stroke="#f59e0b" strokeWidth="1.2" fill="none" />
              <circle cx="24" cy="19" r="1" fill="#f59e0b" />
              <circle cx="32" cy="19" r="1.5" fill="#22d3ee" className="animate-ping" />
            </svg>
          )}
        </div>
      </div>

      {/* Identity Typography */}
      <div className="leading-tight">
        <div className="flex items-center gap-2">
          <span
            className={`font-semibold tracking-wider text-white uppercase font-sans ${
              isSm ? 'text-sm' : isLg ? 'text-2xl' : 'text-xl sm:text-2xl'
            }`}
          >
            ISS<span className="text-cyan-400">TRACKER</span>
          </span>
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 tracking-wider">
            LIVE
          </span>
        </div>

        {showSubtext && (
          <p
            className={`font-mono text-slate-400 uppercase tracking-widest mt-0.5 ${
              isSm ? 'text-[9px]' : 'text-[10px] sm:text-[11px]'
            }`}
          >
            NORAD #25544 <span className="text-cyan-500/60">•</span> 51.64° INC <span className="text-cyan-500/60">•</span> LEO FLIGHT
          </p>
        )}
      </div>
    </div>
  );
}
