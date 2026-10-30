'use client';

import React, { useState, useMemo } from 'react';
import { MapPin, Navigation, Compass, Crosshair, Sparkles, Eye, CheckCircle2, AlertCircle, Globe } from 'lucide-react';
import { calculateHaversineDistance, calculateSlantRange, calculateElevationAngle } from '@/lib/orbitCalculation';
import { soundEffects } from '@/lib/audio';

const PRESET_CITIES = [
  { name: 'London, UK', lat: 51.5074, lon: -0.1278, code: 'GB' },
  { name: 'New York, USA', lat: 40.7128, lon: -74.006, code: 'US' },
  { name: 'Mumbai, India', lat: 19.076, lon: 72.8777, code: 'IN' },
  { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503, code: 'JP' },
  { name: 'Paris, France', lat: 48.8566, lon: 2.3522, code: 'FR' },
  { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093, code: 'AU' },
  { name: 'Dubai, UAE', lat: 25.2048, lon: 55.2708, code: 'AE' }
];

export default function PassCalculator({ issPosition }) {
  const [userLocation, setUserLocation] = useState(PRESET_CITIES[0]);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setGeoError(null);
    soundEffects.playClick();

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setUserLocation({
          name: 'Detected Location',
          lat: Number(pos.coords.latitude.toFixed(4)),
          lon: Number(pos.coords.longitude.toFixed(4)),
          code: 'GPS'
        });
        soundEffects.playQuindarBeep();
      },
      (err) => {
        setIsLocating(false);
        setGeoError(err.message || 'Unable to retrieve location.');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const distanceMetrics = useMemo(() => {
    if (!issPosition || typeof issPosition.latitude !== 'number' || typeof issPosition.longitude !== 'number') {
      return null;
    }

    const groundDist = calculateHaversineDistance(
      userLocation.lat,
      userLocation.lon,
      issPosition.latitude,
      issPosition.longitude
    );

    const slantRange = calculateSlantRange(
      userLocation.lat,
      userLocation.lon,
      issPosition.latitude,
      issPosition.longitude,
      issPosition.altitude || 420
    );

    const elevation = calculateElevationAngle(
      userLocation.lat,
      userLocation.lon,
      issPosition.latitude,
      issPosition.longitude,
      issPosition.altitude || 420
    );

    return {
      groundDistKm: Math.round(groundDist),
      slantRangeKm: Math.round(slantRange),
      elevationDeg: Math.round(elevation),
      isVisibleNow: elevation > 10
    };
  }, [userLocation, issPosition]);

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 border border-cyan-400/40 shadow-2xl relative overflow-hidden text-white font-mono">
      {/* Cyan Corner Brackets */}
      <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
      <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.25)]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white tracking-wide font-display">
                Ground Station Radar Range
              </h3>
              <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full badge-blue">
                Vector Calculation
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Real-time 3D slant range vector, horizon elevation, and visibility tracking
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isLocating}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-semibold text-xs transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)] cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <Navigation className={`w-3.5 h-3.5 text-slate-950 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Detecting GPS…' : 'Use My GPS Location'}</span>
        </button>
      </div>

      {geoError && (
        <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{geoError} (Select any preset observer station below)</span>
        </div>
      )}

      {/* Preset city pills */}
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-1.5 font-display">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>Select Observer Ground Station:</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_CITIES.map((city) => {
            const isSelected = userLocation.name === city.name;
            return (
              <button
                key={city.name}
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setUserLocation(city);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                  isSelected
                    ? 'badge-blue font-bold shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                    : 'glass-panel text-slate-300 hover:text-white hover:border-cyan-400/40'
                }`}
              >
                <Globe className={`w-3 h-3 ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`} />
                <span>{city.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time distance telemetry */}
      {distanceMetrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl glass-panel-silver">
            <span className="text-[10px] font-medium text-cyan-300 uppercase tracking-wider block mb-1">
              Observer Station
            </span>
            <div className="text-base font-medium text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>{userLocation.name}</span>
            </div>
            <span className="text-xs text-slate-400 font-mono block mt-1">
              {userLocation.lat}° N, {userLocation.lon}° E
            </span>
          </div>

          <div className="p-4 rounded-2xl glass-panel-silver">
            <span className="text-[10px] font-medium text-slate-300 uppercase tracking-wider block mb-1">
              Direct 3D Slant Range
            </span>
            <div className="text-2xl font-semibold text-white">
              {distanceMetrics.slantRangeKm.toLocaleString()} <span className="text-xs font-normal text-cyan-300">km</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Straight space line of sight
            </span>
          </div>

          <div className="p-4 rounded-2xl glass-panel-silver">
            <span className="text-[10px] font-medium text-cyan-300 uppercase tracking-wider block mb-1">
              Great-Circle Arc
            </span>
            <div className="text-2xl font-semibold text-white">
              {distanceMetrics.groundDistKm.toLocaleString()} <span className="text-xs font-normal text-cyan-300">km</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Earth curvature surface distance
            </span>
          </div>

          <div className="p-4 rounded-2xl glass-panel-silver">
            <span className="text-[10px] font-medium text-emerald-300 uppercase tracking-wider block mb-1">
              Sky Elevation Angle
            </span>
            <div className="text-2xl font-semibold text-white flex items-center gap-2">
              <span>{distanceMetrics.elevationDeg}°</span>
              {distanceMetrics.isVisibleNow ? (
                <span className="text-[10px] font-medium text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 uppercase">
                  Above Horizon
                </span>
              ) : (
                <span className="text-[10px] font-medium text-slate-400 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase">
                  Below Horizon
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              {distanceMetrics.isVisibleNow
                ? 'ISS is in sky line of sight!'
                : 'Behind Earth curvature from here'}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-slate-400 text-xs">
          Calculating distance vector to ISS…
        </div>
      )}
    </div>
  );
}
