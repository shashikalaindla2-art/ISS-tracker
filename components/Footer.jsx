'use client';

import React from 'react';
import { ExternalLink, Radio, Globe, Terminal, CloudLightning } from 'lucide-react';
import { getAssetPath } from '@/lib/basePath';

export default function Footer() {
  return (
    <footer className="mt-14 border-t border-cyan-500/20 glass-panel py-8 text-xs text-slate-300 relative z-10 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 border border-cyan-400/50 flex items-center justify-center p-0.5 shadow-[0_0_15px_rgba(56,189,248,0.4)] shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getAssetPath('/logo.jpeg')}
                alt="ISS Tracker Emblem"
                width={36}
                height={36}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <div className="text-sm font-semibold text-white font-display">
                ISS <span className="text-blue-gradient font-bold">TRACKER PRO</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">NORAD #25544 · Disaster Early Warning Station</div>
            </div>
          </div>

          {/* API attribution links */}
          <div className="flex flex-wrap gap-2.5">
            {[
              { href: 'https://wheretheiss.at', icon: Radio, label: 'Where The ISS At?' },
              { href: 'https://eonet.gsfc.nasa.gov', icon: CloudLightning, label: 'NASA EONET' },
              { href: 'https://open-meteo.com', icon: Globe, label: 'Open-Meteo' },
              { href: 'https://platform.deepseek.com', icon: Terminal, label: 'DeepSeek AI' }
            ].map(({ href, icon: Icon, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 glass-panel hover:border-cyan-400/50 text-slate-300 hover:text-cyan-200 transition-all font-mono text-[11px]"
              >
                <Icon className="w-3 h-3 text-cyan-400" />
                <span>{label}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-5 pt-5 border-t border-white/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
          <span>Orbital inclination 51.64° · Period 92.7 min · 15.54 rev/day · Expedition 72</span>
          <span className="text-cyan-300 font-bold">DeepSeek AI + NASA EONET + Open-Meteo Weather Active</span>
        </div>
      </div>
    </footer>
  );
}
