'use client';

import React from 'react';
import {
  Gauge,
  Zap,
  Sun,
  Moon,
  Orbit,
  Compass,
  Shield,
  Activity,
  BatteryCharging
} from 'lucide-react';
import { computeMachNumber, estimateNextSolarEvent } from '@/lib/orbitCalculation';
import { formatVelocityKmS } from '@/lib/formatters';

export default function PhysicsEnginePanel({ position }) {
  const velocity = position?.velocity || 27580;
  const machNum = computeMachNumber(velocity);
  const solarEvent = estimateNextSolarEvent(position?.visibility, position?.timestamp);
  const isDaylight = String(position?.visibility || '').toLowerCase() === 'daylight';

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 border border-cyan-400/40 shadow-2xl space-y-6 text-white font-mono relative">
      {/* Cyan Corner Brackets */}
      <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
      <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
            <Orbit className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white tracking-wide font-display">
                Orbital Physics & Solar Cycle Engine
              </h3>
              <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full badge-blue">
                Keplerian LEO Dynamics
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Kinematics, solar sub-point angles, and microgravity parameters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-cyan-200 badge-blue px-3.5 py-1.5 rounded-full">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Orbital Energy: 30.5 MJ/kg</span>
        </div>
      </div>

      {/* Physics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Mach Number & Hypersonic Speed */}
        <div className="p-5 rounded-2xl glass-panel-blue border border-cyan-400/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-cyan-300">
                Speed of Sound Multiple
              </span>
              <Gauge className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-semibold text-blue-gradient">
              Mach {machNum}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Rate: <span className="text-white font-medium">{formatVelocityKmS(velocity)}</span>
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-cyan-500/20 text-[10px] text-cyan-300 font-medium flex items-center gap-1.5 uppercase">
            <Zap className="w-3.5 h-3.5" />
            <span>22x Faster than airliners</span>
          </div>
        </div>

        {/* 2. Solar Terminator Cycle */}
        <div className="p-5 rounded-2xl glass-panel-silver border border-white/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-300">
                Next Illumination Shift
              </span>
              {isDaylight ? <Sun className="w-4 h-4 text-cyan-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </div>
            <div className="text-2xl font-semibold text-white">
              ~{solarEvent.minutesRemaining} <span className="text-xs font-medium text-cyan-300">mins</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Target: <strong className="text-white">{solarEvent.event}</strong>
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/10 text-[10px] text-slate-300 font-medium flex items-center gap-1.5 uppercase">
            <Sun className="w-3.5 h-3.5 text-cyan-400" />
            <span>16 Sunrises & Sunsets / 24h</span>
          </div>
        </div>

        {/* 3. Solar Power Generation */}
        <div className="p-5 rounded-2xl glass-panel-blue border border-cyan-400/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-cyan-300">
                Solar Array Output
              </span>
              <BatteryCharging className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-semibold text-blue-gradient">
              {isDaylight ? '120 kW' : 'Battery'}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {isDaylight ? '8 Ultra-Flex Wings Active' : 'Li-Ion Battery Storage'}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-cyan-500/20 text-[10px] text-cyan-300 font-medium flex items-center gap-1.5 uppercase">
            <Zap className="w-3.5 h-3.5" />
            <span>2,400 m² total PV surface</span>
          </div>
        </div>

        {/* 4. Subsolar Geographic Point */}
        <div className="p-5 rounded-2xl glass-panel-silver border border-white/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-300">
                Subsolar Zenith
              </span>
              <Compass className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-lg font-semibold text-white">
              {position?.solar_lat !== null && position?.solar_lat !== undefined
                ? `${Number(position.solar_lat).toFixed(2)}°, ${Number(position.solar_lon).toFixed(2)}°`
                : '10.70°, 101.70°'}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Direct perpendicular sunlight
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/10 text-[10px] text-slate-300 font-medium flex items-center gap-1.5 uppercase">
            <Orbit className="w-3.5 h-3.5 text-cyan-400" />
            <span>Earth axial tilt: 23.44°</span>
          </div>
        </div>
      </div>

      {/* Structural Specs */}
      <div className="p-5 rounded-2xl glass-panel border border-cyan-500/20 text-xs">
        <h4 className="font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2 font-display">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>Spacecraft Engineering & Structural Architecture</span>
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-300">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Wingspan & Length</span>
            <span className="font-bold text-white">109 m × 73 m (Football Pitch)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">On-Orbit Mass</span>
            <span className="font-bold text-cyan-300">444,615 kg (~445 Tonnes)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Pressurized Volume</span>
            <span className="font-bold text-white">916 m³ (Boeing 747 Class)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Microgravity Level</span>
            <span className="font-bold text-emerald-300">10⁻⁶ g (One Millionth 1G)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
