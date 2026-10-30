import React from 'react';
import { Users, Award, Orbit, Globe, Sparkles } from 'lucide-react';

const CREW_MEMBERS = [
  {
    name: 'Sunita Williams',
    role: 'Commander',
    agency: 'NASA',
    country: 'United States',
    spacecraft: 'Boeing Starliner / Crew-9',
    daysInSpace: '320+ Days',
    spacewalks: '7 EVAs (50h 40m)',
    accent: 'border-cyan-400/50 bg-cyan-500/10'
  },
  {
    name: 'Barry "Butch" Wilmore',
    role: 'Flight Engineer',
    agency: 'NASA',
    country: 'United States',
    spacecraft: 'Boeing Starliner / Crew-9',
    daysInSpace: '280+ Days',
    spacewalks: '4 EVAs (25h 36m)',
    accent: 'border-white/20 bg-white/5'
  },
  {
    name: 'Nick Hague',
    role: 'Flight Engineer',
    agency: 'NASA',
    country: 'United States',
    spacecraft: 'SpaceX Crew-9',
    daysInSpace: '200+ Days',
    spacewalks: '3 EVAs (19h 56m)',
    accent: 'border-cyan-400/40 bg-cyan-500/10'
  },
  {
    name: 'Donald Pettit',
    role: 'Flight Engineer / Science Officer',
    agency: 'NASA',
    country: 'United States',
    spacecraft: 'Soyuz MS-26',
    daysInSpace: '390+ Days',
    spacewalks: '2 EVAs (13h 17m)',
    accent: 'border-cyan-400/50 bg-cyan-500/10'
  },
  {
    name: 'Aleksandr Gorbunov',
    role: 'Flight Engineer',
    agency: 'Roscosmos',
    country: 'International Cosmonaut',
    spacecraft: 'SpaceX Crew-9',
    daysInSpace: 'First Flight',
    spacewalks: '0 EVAs',
    accent: 'border-white/20 bg-white/5'
  },
  {
    name: 'Aleksey Ovchinin',
    role: 'Flight Engineer',
    agency: 'Roscosmos',
    country: 'International Cosmonaut',
    spacecraft: 'Soyuz MS-26',
    daysInSpace: '375+ Days',
    spacewalks: '1 EVA (6h 01m)',
    accent: 'border-white/20 bg-white/5'
  },
  {
    name: 'Ivan Vagner',
    role: 'Flight Engineer',
    agency: 'Roscosmos',
    country: 'International Cosmonaut',
    spacecraft: 'Soyuz MS-26',
    daysInSpace: '196+ Days',
    spacewalks: '0 EVAs',
    accent: 'border-white/20 bg-white/5'
  }
];

export default function CrewPanel() {
  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 border border-cyan-400/40 shadow-2xl relative overflow-hidden text-white font-mono">
      {/* Cyan Corner Brackets */}
      <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
      <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-cyan-500/20 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white uppercase tracking-wider font-display">
                Expedition 72 Active Crew
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full badge-blue">
                7 Astronauts Onboard
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Continuously inhabited orbital research laboratory since November 2000
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-cyan-200 badge-blue px-3.5 py-1.5 rounded-full">
          <Orbit className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span>16 Sunrises & Sunsets Daily</span>
        </div>
      </div>

      {/* Crew Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10">
        {CREW_MEMBERS.map((member, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-4.5 border transition-all duration-300 hover:-translate-y-1 glass-panel hover:border-cyan-400/60 flex flex-col justify-between shadow-xl ${member.accent}`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md badge-blue">
                  {member.role}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {member.agency}
                </span>
              </div>
              <h4 className="text-base font-semibold text-white mt-1 group-hover:text-cyan-200 font-display">
                {member.name}
              </h4>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{member.country}</span>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/8 space-y-1.5 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle:</span>
                <span className="text-white font-medium">{member.spacecraft}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total in Space:</span>
                <span className="text-cyan-300 font-bold">{member.daysInSpace}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Spacewalks:</span>
                <span className="text-white font-medium">{member.spacewalks}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
