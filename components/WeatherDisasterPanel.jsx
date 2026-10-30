'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CloudLightning,
  Waves,
  Wind,
  Droplets,
  Gauge,
  Sun,
  CloudRain,
  CloudFog,
  CloudSnow,
  CloudSun,
  Search,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Flame,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Satellite,
  Compass,
  Sliders,
  Check,
  KeyRound,
  X
} from 'lucide-react';
import {
  fetchLiveDisasters,
  fetchWeatherForecast,
  correlateDisastersWithISS,
  DISASTER_CATEGORIES
} from '@/lib/disasterApi';
import { soundEffects } from '@/lib/audio';

const PRESET_LOCATIONS = [
  { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Miami, USA', lat: 25.7617, lon: -80.1918 },
  { name: 'Mumbai, India', lat: 19.076, lon: 72.8777 },
  { name: 'Manila, Philippines', lat: 14.5995, lon: 120.9842 },
  { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
  { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 }
];

export default function WeatherDisasterPanel({ issPosition }) {
  // Mode: 'iss' | 'global' | 'custom'
  const [activeMode, setActiveMode] = useState('iss');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState({
    name: 'Directly Below ISS',
    lat: issPosition?.latitude || 0,
    lon: issPosition?.longitude || 0
  });

  const [weatherData, setWeatherData] = useState(null);
  const [disasters, setDisasters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter for disasters: 'all' | 'storms' | 'floods' | 'wildfires'
  const [disasterFilter, setDisasterFilter] = useState('all');

  // Custom API Modal state
  const [showApiModal, setShowApiModal] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);

  // Load custom key from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('CUSTOM_WEATHER_API_KEY') || '';
      setCustomApiKey(stored);
    }
  }, []);

  const saveCustomApiKey = () => {
    soundEffects.playClick();
    if (typeof window !== 'undefined') {
      localStorage.setItem('CUSTOM_WEATHER_API_KEY', customApiKey.trim());
      setSavedKeySuccess(true);
      setTimeout(() => setSavedKeySuccess(false), 2500);
    }
  };

  // Load Disasters and Weather
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [disasterList, weatherResult] = await Promise.all([
        fetchLiveDisasters(),
        fetchWeatherForecast(selectedLocation.lat, selectedLocation.lon)
      ]);

      setDisasters(disasterList);
      setWeatherData(weatherResult);
      setError(null);
    } catch (err) {
      console.warn('Weather panel fetch warning:', err);
      setError('Weather data synchronized via fallback engine.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedLocation.lat, selectedLocation.lon]);

  // When ISS moves in 'iss' mode, update coordinates if shifted significantly
  useEffect(() => {
    if (activeMode === 'iss' && issPosition?.latitude !== undefined) {
      setSelectedLocation((prev) => {
        const diffLat = Math.abs((prev.lat || 0) - issPosition.latitude);
        const diffLon = Math.abs((prev.lon || 0) - issPosition.longitude);
        if (diffLat > 2 || diffLon > 2) {
          return {
            name: 'Directly Below ISS Sub-Satellite Point',
            lat: issPosition.latitude,
            lon: issPosition.longitude
          };
        }
        return prev;
      });
    }
  }, [issPosition, activeMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Correlate active disasters with ISS
  const correlatedDisasters = useMemo(() => {
    return correlateDisastersWithISS(issPosition, disasters);
  }, [issPosition, disasters]);

  const filteredDisasters = useMemo(() => {
    if (disasterFilter === 'storms') {
      return correlatedDisasters.filter((d) => d.category === 'severeStorms');
    }
    if (disasterFilter === 'floods') {
      return correlatedDisasters.filter((d) => d.category === 'floods');
    }
    if (disasterFilter === 'wildfires') {
      return correlatedDisasters.filter((d) => d.category === 'wildfires');
    }
    return correlatedDisasters;
  }, [correlatedDisasters, disasterFilter]);

  // Geocode search query via OpenStreetMap Nominatim
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    soundEffects.playClick();
    setIsRefreshing(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setSelectedLocation({
          name: data[0].display_name.split(',').slice(0, 2).join(','),
          lat,
          lon
        });
        setActiveMode('custom');
        setSearchQuery('');
      } else {
        setError(`Location "${searchQuery}" not found. Try a major city name.`);
      }
    } catch {
      setError('Geocoding service unavailable.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSelectPreset = (preset) => {
    soundEffects.playClick();
    setSelectedLocation({
      name: preset.name,
      lat: preset.lat,
      lon: preset.lon
    });
    setActiveMode('custom');
  };

  const handleSwitchToISS = () => {
    soundEffects.playClick();
    setActiveMode('iss');
    if (issPosition?.latitude !== undefined) {
      setSelectedLocation({
        name: 'Directly Below ISS Sub-Satellite Point',
        lat: issPosition.latitude,
        lon: issPosition.longitude
      });
    }
  };

  // Weather icon component mapper
  const renderWeatherIcon = (iconName, className = 'w-6 h-6') => {
    switch (iconName) {
      case 'Sun':
        return <Sun className={`${className} text-amber-300`} />;
      case 'CloudSun':
        return <CloudSun className={`${className} text-sky-300`} />;
      case 'Cloud':
        return <CloudSun className={`${className} text-slate-300`} />;
      case 'CloudFog':
        return <CloudFog className={`${className} text-slate-400`} />;
      case 'CloudDrizzle':
        return <CloudRain className={`${className} text-cyan-300`} />;
      case 'CloudRain':
        return <CloudRain className={`${className} text-blue-400`} />;
      case 'CloudSnow':
        return <CloudSnow className={`${className} text-sky-100`} />;
      case 'CloudLightning':
        return <CloudLightning className={`${className} text-cyan-300 animate-pulse`} />;
      default:
        return <CloudSun className={`${className} text-sky-300`} />;
    }
  };

  return (
    <div className="space-y-5 animate-fade-up">
      {/* ── Top Control & Search Bar ── */}
      <section className="glass-panel-blue p-4 sm:p-5 rounded-3xl border border-cyan-400/40 relative overflow-hidden shadow-2xl">
        <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Mode Switchers */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="btn-weather-mode-iss"
              onClick={handleSwitchToISS}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'iss'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.5)] border border-cyan-300'
                  : 'glass-panel text-slate-300 hover:text-white hover:border-cyan-400/40'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>Overflying ISS Ground Weather</span>
            </button>

            <button
              type="button"
              id="btn-weather-mode-global"
              onClick={() => {
                soundEffects.playClick();
                setActiveMode('global');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'global'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.5)] border border-cyan-300'
                  : 'glass-panel text-slate-300 hover:text-white hover:border-cyan-400/40'
              }`}
            >
              <CloudLightning className="w-3.5 h-3.5" />
              <span>Global Disaster Radar ({disasters.length})</span>
            </button>
          </div>

          {/* Search Box & Quick City Pills */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search city / disaster zone…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/60 border border-cyan-500/30 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-sans"
              />
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5 pointer-events-none" />
            </form>

            <button
              type="button"
              id="btn-weather-refresh"
              onClick={() => {
                soundEffects.playClick();
                loadData();
              }}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl glass-panel text-cyan-300 hover:text-white hover:border-cyan-400/50 transition-all cursor-pointer"
              title="Refresh meteorological scan"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              id="btn-api-settings"
              onClick={() => {
                soundEffects.playClick();
                setShowApiModal(true);
              }}
              className="p-2.5 rounded-xl glass-panel text-slate-300 hover:text-cyan-300 hover:border-cyan-400/50 transition-all cursor-pointer"
              title="Configure Weather & Disaster APIs"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Location Pills */}
        <div className="mt-3.5 pt-3 border-t border-cyan-500/15 flex items-center gap-2 overflow-x-auto pb-1 text-[11px] font-mono">
          <span className="text-slate-400 uppercase tracking-wider text-[10px] shrink-0 font-bold">
            Hotspots:
          </span>
          {PRESET_LOCATIONS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="px-2.5 py-1 rounded-lg glass-panel hover:border-cyan-400/40 hover:text-cyan-200 text-slate-300 shrink-0 transition-all cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </section>

      {/* ── Main Content Grid ── */}
      {activeMode === 'global' ? (
        /* ════════ GLOBAL NATURAL DISASTER RADAR ════════ */
        <section className="space-y-4">
          {/* Category Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
                NASA EONET Global Natural Disaster Tracking
              </h2>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
              {[
                { id: 'all', label: 'All Hazards' },
                { id: 'storms', label: 'Cyclones & Storms' },
                { id: 'floods', label: 'Floods' },
                { id: 'wildfires', label: 'Wildfires' }
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setDisasterFilter(id);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    disasterFilter === id
                      ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Disaster Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredDisasters.map((evt) => {
              const isCritical = evt.severity === 'critical';
              const isNearISS = evt.distanceKm <= 1500;

              return (
                <div
                  key={evt.id}
                  className={`p-4 rounded-2xl glass-panel relative overflow-hidden transition-all hover:-translate-y-1 ${
                    isCritical
                      ? 'border-rose-400/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                      : isNearISS
                      ? 'border-cyan-400/50 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                      : 'hover:border-cyan-400/40'
                  }`}
                >
                  {/* Category Accent Stripe */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`text-[9px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full border ${
                        isCritical
                          ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                          : 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300'
                      }`}
                    >
                      {evt.categoryLabel}
                    </span>

                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(evt.date).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                    {evt.title}
                  </h3>

                  {/* Distance to ISS calculation */}
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/8 space-y-1 mb-3">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">ISS Distance:</span>
                      <span
                        className={`font-bold ${
                          isNearISS ? 'text-cyan-300 font-semibold animate-pulse' : 'text-white'
                        }`}
                      >
                        {evt.distanceKm.toLocaleString()} km
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Coordinates:</span>
                      <span>
                        {evt.latitude.toFixed(2)}°, {evt.longitude.toFixed(2)}°
                      </span>
                    </div>

                    {isNearISS && (
                      <div className="pt-1 text-[10px] text-cyan-200 font-bold flex items-center gap-1">
                        <Satellite className="w-3 h-3 text-cyan-400" />
                        <span>Visible within ISS Horizon Footprint</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        soundEffects.playClick();
                        setSelectedLocation({
                          name: evt.title,
                          lat: evt.latitude,
                          lon: evt.longitude
                        });
                        setActiveMode('custom');
                      }}
                      className="text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Forecast Local Weather</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={evt.source}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <span>{evt.sourceName}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        /* ════════ LIVE METEOROLOGICAL FORECAST & PREDICTIONS ════════ */
        weatherData && (
          <div className="space-y-5">
            {/* Location Banner */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-bold">{selectedLocation.name}</span>
                <span className="text-slate-400">
                  ({weatherData.latitude.toFixed(2)}°, {weatherData.longitude.toFixed(2)}°)
                </span>
              </div>

              <div className="text-xs font-mono text-slate-400">
                WMO ECMWF Model Analysis
              </div>
            </div>

            {/* ── Main 3-Column Weather & Risk Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Atmospheric Conditions Hero */}
              <div className="p-5 rounded-3xl glass-panel-blue border border-cyan-400/40 flex flex-col justify-between relative overflow-hidden shadow-2xl">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                      Atmospheric State
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {weatherData.isDay ? 'Daylight' : 'Night'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 my-2">
                    <div className="p-3.5 rounded-2xl bg-cyan-500/15 border border-cyan-400/30">
                      {renderWeatherIcon(weatherData.condition.icon, 'w-10 h-10')}
                    </div>
                    <div>
                      <div className="text-4xl font-semibold text-white font-mono tracking-tight">
                        {weatherData.temperature}°C
                      </div>
                      <p className="text-xs font-semibold text-cyan-200 mt-0.5">
                        {weatherData.condition.label}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-cyan-500/20 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-slate-950/40 border border-white/6">
                    <span className="text-[10px] text-slate-400 block">Humidity</span>
                    <span className="font-bold text-white">{weatherData.humidity}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/40 border border-white/6">
                    <span className="text-[10px] text-slate-400 block">Pressure</span>
                    <span className="font-bold text-white">{weatherData.pressure} hPa</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/40 border border-white/6">
                    <span className="text-[10px] text-slate-400 block">Wind Velocity</span>
                    <span className="font-bold text-white">{weatherData.windSpeed} km/h</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/40 border border-white/6">
                    <span className="text-[10px] text-slate-400 block">Peak Gusts</span>
                    <span className="font-bold text-cyan-300">{weatherData.windGusts} km/h</span>
                  </div>
                </div>
              </div>

              {/* 2. Flood Risk Prediction Engine */}
              <div
                className={`p-5 rounded-3xl glass-panel flex flex-col justify-between border ${
                  weatherData.floodRisk.badgeColor === 'rose'
                    ? 'border-rose-400/60 bg-rose-950/25 shadow-[0_0_25px_rgba(244,63,94,0.2)]'
                    : weatherData.floodRisk.badgeColor === 'amber'
                    ? 'border-amber-400/60 bg-amber-950/25 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                    : 'border-cyan-400/40 hover:border-cyan-400/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                      <Waves className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Flood Hazard Predictor</span>
                    </span>
                    <span
                      className={`text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full border ${
                        weatherData.floodRisk.badgeColor === 'rose'
                          ? 'bg-rose-500/20 text-rose-200 border-rose-400/40'
                          : weatherData.floodRisk.badgeColor === 'amber'
                          ? 'bg-amber-500/20 text-amber-200 border-amber-400/40'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                      }`}
                    >
                      {weatherData.floodRisk.level}
                    </span>
                  </div>

                  <div className="my-3">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-2xl font-semibold font-mono text-white">
                        {weatherData.floodRisk.score}%
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Rain: {weatherData.precipitation} mm/h
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          weatherData.floodRisk.score > 60
                            ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                            : 'bg-gradient-to-r from-cyan-400 to-blue-500'
                        }`}
                        style={{ width: `${Math.max(5, weatherData.floodRisk.score)}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {weatherData.floodRisk.message}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/8 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Soil Runoff Saturation:</span>
                  <span className="font-bold text-white">
                    {weatherData.floodRisk.score > 40 ? 'Saturated / Inundated' : 'Absorbing Normally'}
                  </span>
                </div>
              </div>

              {/* 3. Storm & Cyclone Prediction Engine */}
              <div
                className={`p-5 rounded-3xl glass-panel flex flex-col justify-between border ${
                  weatherData.stormRisk.badgeColor === 'rose'
                    ? 'border-rose-400/60 bg-rose-950/25 shadow-[0_0_25px_rgba(244,63,94,0.2)]'
                    : weatherData.stormRisk.badgeColor === 'amber'
                    ? 'border-amber-400/60 bg-amber-950/25 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                    : 'border-cyan-400/40 hover:border-cyan-400/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                      <CloudLightning className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Storm & Cyclone Predictor</span>
                    </span>
                    <span
                      className={`text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full border ${
                        weatherData.stormRisk.badgeColor === 'rose'
                          ? 'bg-rose-500/20 text-rose-200 border-rose-400/40'
                          : weatherData.stormRisk.badgeColor === 'amber'
                          ? 'bg-amber-500/20 text-amber-200 border-amber-400/40'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                      }`}
                    >
                      {weatherData.stormRisk.level}
                    </span>
                  </div>

                  <div className="my-3">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-2xl font-semibold font-mono text-white">
                        {weatherData.stormRisk.score}%
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Gusts: {weatherData.windGusts} km/h
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          weatherData.stormRisk.score > 60
                            ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                            : 'bg-gradient-to-r from-sky-400 to-cyan-400'
                        }`}
                        style={{ width: `${Math.max(5, weatherData.stormRisk.score)}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {weatherData.stormRisk.message}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/8 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Cyclonic Eye Depression:</span>
                  <span className="font-bold text-white">
                    {weatherData.pressure < 1000 ? 'Low Pressure Alert' : 'Normal Gradient'}
                  </span>
                </div>
              </div>
            </div>

            {/* ── 7-Day Severe Weather Trend Outlook ── */}
            <section className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-cyan-400" />
                  <span>7-Day Predictive Disaster & Meteorological Outlook</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">ECMWF / Open-Meteo</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {weatherData.dailyForecast.map((day, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-slate-950/50 border border-white/8 hover:border-cyan-400/40 transition-all flex flex-col justify-between items-center text-center space-y-2"
                  >
                    <span className="text-[11px] font-mono font-bold text-slate-300">
                      {day.date.length > 5 ? day.date.slice(5) : day.date}
                    </span>

                    <div className="my-1">
                      {renderWeatherIcon(day.condition.icon, 'w-6 h-6')}
                    </div>

                    <div className="text-xs font-mono font-bold text-white">
                      <span>{day.maxTemp}°</span>
                      <span className="text-slate-400 font-normal"> / {day.minTemp}°</span>
                    </div>

                    <div className="w-full pt-1.5 border-t border-white/8 text-[10px] font-mono space-y-0.5">
                      <div className="text-cyan-300 flex items-center justify-center gap-1">
                        <Droplets className="w-3 h-3" />
                        <span>{day.rainProb}%</span>
                      </div>
                      <div className="text-slate-400">
                        Gust: {day.windGust} km/h
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Hourly Trajectory (Next 12 Hours) ── */}
            <section className="glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span>Next 12 Hours Precipitation & Storm Probability</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Hourly Radar Track</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {weatherData.hourlyForecast.map((h, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-white/8 shrink-0 min-w-20 text-center space-y-1.5"
                  >
                    <span className="text-[10px] font-mono text-slate-400 block">{h.time}</span>
                    <div className="flex justify-center">{renderWeatherIcon(h.condition.icon, 'w-5 h-5')}</div>
                    <div className="text-xs font-mono font-bold text-white">{h.temp}°C</div>
                    <div className="text-[10px] font-mono text-cyan-300 font-bold">
                      {h.rainProb}% rain
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )
      )}

      {/* ── API Configuration Drawer / Modal ── */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel-blue p-6 rounded-3xl border border-cyan-400/50 max-w-lg w-full space-y-4 shadow-[0_0_50px_rgba(56,189,248,0.3)] relative">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Weather & Disaster APIs</h3>
                  <p className="text-[11px] text-slate-300 font-mono">Real-time Global Data Streams</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowApiModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Free Public APIs */}
            <div className="space-y-2 text-xs">
              <p className="font-bold text-cyan-200">Built-in & Working Out-of-the-Box (No Key Needed):</p>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    NASA EONET API v3
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Real-time severe storms, tropical cyclones, floods, and natural hazards tracked by NASA Goddard Space Flight Center.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Open-Meteo High-Resolution Weather & Flood API
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Real-time precipitation, wind gusts, atmospheric pressure, and 7-day hydrological flood risk forecasting for any coordinate on Earth.
                </p>
              </div>
            </div>

            {/* Optional Custom API Key input */}
            <div className="space-y-2 pt-2 border-t border-cyan-500/20">
              <label className="block text-xs font-bold text-cyan-200">
                Optional: Custom OpenWeatherMap / WeatherAPI Key
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  placeholder="Enter custom API key if desired..."
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  className="w-full bg-slate-950/80 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={saveCustomApiKey}
                  className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shrink-0 cursor-pointer transition-all"
                >
                  {savedKeySuccess ? 'Saved!' : 'Save Key'}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                The tracker works fully without this key using free NASA and Open-Meteo endpoints.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowApiModal(false)}
                className="px-4 py-2 rounded-xl glass-panel text-white font-bold text-xs hover:border-cyan-400 cursor-pointer"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
