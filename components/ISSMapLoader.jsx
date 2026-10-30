'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Satellite } from 'lucide-react';

function MapLoadingPlaceholder() {
  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden glass-panel border border-cyan-400/40 flex items-center justify-center text-center p-8 shadow-2xl"
      style={{ height: 'clamp(440px, 58vh, 680px)', minHeight: '440px' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl glass-panel-blue border border-cyan-400/50 flex items-center justify-center shadow-[0_0_25px_rgba(56,189,248,0.3)]">
          <Satellite className="w-8 h-8 text-cyan-300 animate-float" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-white font-display">Initializing Orbital Map</p>
          <p className="text-xs text-slate-300 font-mono">
            Loading CARTO & Satellite Cartographic Engine…
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-cyan-300 font-mono">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>NORAD #25544 Trajectory Feed</span>
        </div>
      </div>
    </div>
  );
}

const DynamicISSMap = dynamic(() => import('./ISSMap'), {
  ssr: false,
  loading: () => <MapLoadingPlaceholder />
});

export default function ISSMapLoader(props) {
  return <DynamicISSMap {...props} />;
}
