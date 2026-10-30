'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
  Circle,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import {
  Crosshair,
  Eye,
  EyeOff,
  Layers,
  Orbit,
  Compass,
  Globe,
  Sun,
  Map
} from 'lucide-react';
import {
  formatLatitude,
  formatLongitude,
  formatAltitude,
  formatVisibility
} from '@/lib/formatters';
import {
  predictFutureOrbit,
  calculateBearing,
  calculateFootprintRadius
} from '@/lib/orbitCalculation';
import { getGeographicRegion } from '@/lib/geocoding';

// ── Map Tile Layers (CARTO with Auth Key + Satellite + OSM) ─────────────
const CARTO_KEY =
  process.env.NEXT_PUBLIC_CARTO_API_KEY || 'cb1_4uy8_1_7f3b62bc006601121a15ee5c';

const MAP_LAYERS = {
  dark: {
    name: 'CARTO Dark Matter',
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${CARTO_KEY}`,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  },
  voyager: {
    name: 'CARTO Voyager',
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_KEY}`,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  },
  positron: {
    name: 'CARTO Positron',
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png?key=${CARTO_KEY}`,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  },
  satellite: {
    name: 'ESRI Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      '&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics',
    subdomains: 'a',
    maxZoom: 18
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19
  }
};

// ── ISS Marker Icon with Shiny Electric Cyan & Sapphire Glow ──────────────
const createISSIcon = (isDaylight = true, headingDeg = 0) => {
  const glowColor = isDaylight
    ? 'rgba(56, 189, 248, 0.7)'
    : 'rgba(14, 165, 233, 0.7)';
  const ringColor = isDaylight ? '#38bdf8' : '#7dd3fc';

  const svgHtml = `
    <div style="position:relative;width:58px;height:58px;display:flex;align-items:center;justify-content:center;">
      <div style="position:absolute;inset:0;border-radius:50%;background:${glowColor};animation:ping 2.5s cubic-bezier(0,0,0.2,1) infinite;opacity:0.6"></div>
      <div style="position:absolute;inset:5px;border-radius:50%;border:2px solid ${ringColor};opacity:0.8;animation:pulse 2s ease-in-out infinite"></div>
      <div style="position:relative;z-index:10;width:42px;height:42px;display:flex;align-items:center;justify-content:center;background:rgba(8,20,44,0.96);border-radius:50%;border:2px solid ${ringColor};box-shadow:0 0 25px ${glowColor},0 0 45px ${glowColor}60;transform:rotate(${headingDeg}deg);transition:transform 0.8s ease">
        <svg viewBox="0 0 32 32" fill="none" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
          <rect x="1.5" y="7" width="5.5" height="4.5" rx="1" fill="${ringColor}" opacity="0.95"/>
          <rect x="1.5" y="13.5" width="5.5" height="4.5" rx="1" fill="${ringColor}" opacity="0.95"/>
          <rect x="1.5" y="20" width="5.5" height="4.5" rx="1" fill="${ringColor}" opacity="0.95"/>
          <line x1="7" y1="16" x2="12" y2="16" stroke="#94a3b8" stroke-width="1.8" stroke-linecap="round"/>
          <line x1="12" y1="16" x2="20" y2="16" stroke="#f8fafc" stroke-width="2.5" stroke-linecap="round"/>
          <rect x="13.5" y="11" width="5.5" height="10" rx="2.5" fill="#00d2ff" stroke="${ringColor}" stroke-width="1.5"/>
          <circle cx="16" cy="16" r="2" fill="${ringColor}"/>
          <line x1="20" y1="16" x2="25" y2="16" stroke="#94a3b8" stroke-width="1.8" stroke-linecap="round"/>
          <rect x="25" y="7" width="5.5" height="4.5" rx="1" fill="${ringColor}" opacity="0.95"/>
          <rect x="25" y="13.5" width="5.5" height="4.5" rx="1" fill="${ringColor}" opacity="0.95"/>
          <rect x="25" y="20" width="5.5" height="4.5" rx="1" fill="${ringColor}" opacity="0.95"/>
        </svg>
        <div style="position:absolute;top:-3px;width:7px;height:7px;background:#00d2ff;border-radius:50%;box-shadow:0 0 10px #00d2ff"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'iss-custom-icon',
    iconSize: [58, 58],
    iconAnchor: [29, 29],
    popupAnchor: [0, -32]
  });
};

// ── Map pan and viewport controller ────────────────────────────────────────
function MapController({ position, isFollowing }) {
  const map = useMap();
  const prevPosRef = useRef(null);

  // Invalidate size immediately so tiles render properly upon dynamic mount
  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  useEffect(() => {
    if (!position?.latitude) return;
    const target = [position.latitude, position.longitude];

    if (!prevPosRef.current) {
      map.setView(target, map.getZoom() || 3, { animate: false });
      prevPosRef.current = target;
      return;
    }

    if (isFollowing) {
      map.panTo(target, { animate: true, duration: 1.5, easeLinearity: 0.25 });
    }

    prevPosRef.current = target;
  }, [position, isFollowing, map]);

  return null;
}

// ── Antimeridian-safe trail splitting ─────────────────────────────────────
function splitTrailAtDateLine(points = []) {
  const segs = [];
  let cur = [];

  for (const pt of points) {
    const coords = Array.isArray(pt) ? pt : [pt.latitude, pt.longitude];
    const lon = Array.isArray(pt) ? pt[1] : pt.longitude;

    if (cur.length > 0) {
      const prevLon = cur[cur.length - 1][1];
      if (Math.abs(lon - prevLon) > 180) {
        segs.push(cur);
        cur = [];
      }
    }
    cur.push(coords);
  }
  if (cur.length > 0) segs.push(cur);
  return segs;
}

// ── Glassy Aerospace Map Button ────────────────────────────────────────────
function MapButton({ active, activeClass, onClick, children, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold backdrop-blur-2xl border transition-all duration-200 cursor-pointer shadow-lg ${
        active
          ? activeClass || 'bg-gradient-to-r from-amber-500/25 to-yellow-500/20 text-amber-200 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-bold'
          : 'bg-black/60 text-slate-300 border-white/12 hover:text-white hover:border-amber-400/30'
      }`}
    >
      {children}
    </button>
  );
}

// ── Main Map Component ─────────────────────────────────────────────────────
export default function ISSMap({
  position,
  trail = [],
  isFollowing = true,
  isTrailVisible = true,
  onToggleFollow,
  onToggleTrail,
  onClearTrail
}) {
  const [activeLayer, setActiveLayer] = useState('voyager');
  const [showOrbit, setShowOrbit] = useState(true);
  const [showFootprint, setShowFootprint] = useState(true);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const coords = useMemo(
    () =>
      position?.latitude != null ? [position.latitude, position.longitude] : [0, 0],
    [position]
  );

  const heading = useMemo(() => {
    if (trail.length >= 2) {
      const p1 = trail[trail.length - 2];
      const p2 = trail[trail.length - 1];
      return calculateBearing(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
    }
    return 45;
  }, [trail]);

  const region = useMemo(
    () =>
      position ? getGeographicRegion(position.latitude, position.longitude) : { name: 'Earth Orbit' },
    [position]
  );

  const visInfo = useMemo(() => formatVisibility(position?.visibility), [position?.visibility]);
  const issIcon = useMemo(() => createISSIcon(visInfo.isDaylight, heading), [visInfo.isDaylight, heading]);

  const trailSegs = useMemo(
    () => (isTrailVisible && trail.length >= 2 ? splitTrailAtDateLine(trail) : []),
    [trail, isTrailVisible]
  );

  const orbitSegs = useMemo(() => {
    if (!showOrbit || !position?.latitude) return [];
    return splitTrailAtDateLine(predictFutureOrbit(position.latitude, position.longitude, 40));
  }, [position, showOrbit]);

  const footprintRadius = useMemo(
    () => calculateFootprintRadius(position?.altitude || 420) * 1000,
    [position?.altitude]
  );

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden glass-panel border border-cyan-400/40 shadow-[0_0_35px_rgba(56,189,248,0.2)]"
      style={{ height: 'clamp(440px, 58vh, 680px)', minHeight: '440px' }}
    >
      {/* Decorative Cyan Corner Brackets */}
      <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none z-20" />
      <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none z-20" />
      <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none z-20" />
      <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none z-20" />

      {/* Map */}
      <MapContainer
        center={coords}
        zoom={3}
        minZoom={2}
        maxZoom={13}
        scrollWheelZoom
        className="w-full h-full z-0"
        style={{ width: '100%', height: '100%', minHeight: '440px' }}
        worldCopyJump
      >
        <TileLayer
          key={activeLayer}
          attribution={MAP_LAYERS[activeLayer].attribution}
          url={MAP_LAYERS[activeLayer].url}
          subdomains={MAP_LAYERS[activeLayer].subdomains || 'abcd'}
          maxZoom={MAP_LAYERS[activeLayer].maxZoom || 19}
        />
        <MapController position={position} isFollowing={isFollowing} />

        {/* Footprint circle */}
        {showFootprint && position && (
          <Circle
            center={coords}
            radius={footprintRadius}
            pathOptions={{
              color: '#38bdf8',
              weight: 1,
              opacity: 0.4,
              fillColor: '#38bdf8',
              fillOpacity: 0.05,
              dashArray: '6 6'
            }}
          />
        )}

        {/* Predicted orbit */}
        {orbitSegs.map((seg, i) => (
          <Polyline
            key={`orbit-${i}`}
            positions={seg}
            pathOptions={{ color: '#00d2ff', weight: 2.2, opacity: 0.75, dashArray: '8 8' }}
          />
        ))}

        {/* Historical trail */}
        {trailSegs.map((seg, i) => (
          <Polyline
            key={`trail-${i}`}
            positions={seg}
            pathOptions={{ color: '#38bdf8', weight: 2.5, opacity: 0.8 }}
          />
        ))}

        {/* Trail dots */}
        {isTrailVisible &&
          trail.slice(0, -1).map((pt, i) => (
            <CircleMarker
              key={`dot-${i}`}
              center={[pt.latitude, pt.longitude]}
              radius={2.5}
              pathOptions={{ color: '#0284c7', fillColor: '#38bdf8', fillOpacity: 0.7, weight: 1 }}
            />
          ))}

        {/* Subsolar point */}
        {position?.solar_lat != null && (
          <CircleMarker
            center={[position.solar_lat, position.solar_lon]}
            radius={6}
            pathOptions={{ color: '#f59e0b', fillColor: '#fbbf24', fillOpacity: 0.85, weight: 1.5 }}
          >
            <Popup closeButton={false} className="custom-iss-popup-glass">
              <div className="px-1 py-0.5 text-xs font-mono text-white flex items-center gap-1.5">
                <Sun className="w-3 h-3 text-amber-400" />
                <span className="font-bold text-amber-300">Subsolar Zenith</span>
                <span className="text-slate-300 text-[10px]">
                  {formatLatitude(position.solar_lat)}, {formatLongitude(position.solar_lon)}
                </span>
              </div>
            </Popup>
          </CircleMarker>
        )}

        {/* ISS Marker */}
        {position && (
          <Marker position={coords} icon={issIcon}>
            <Popup className="custom-iss-popup-glass" closeButton>
              <div className="p-1 min-w-[220px] font-mono text-white">
                <div className="flex items-center gap-2 pb-2 mb-2 border-b border-white/10">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">ISS · NORAD #25544</span>
                  <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    visInfo.isDaylight
                      ? 'bg-amber-500/15 text-amber-300'
                      : 'bg-indigo-500/15 text-indigo-300'
                  }`}>
                    {visInfo.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {[
                    ['Lat', formatLatitude(position.latitude)],
                    ['Lon', formatLongitude(position.longitude)],
                    ['Alt', formatAltitude(position.altitude)],
                    ['Hdg', `${Math.round(heading)}°`]
                  ].map(([k, v]) => (
                    <div key={k} className="bg-white/5 rounded-lg p-1.5">
                      <span className="text-slate-400 block text-[9px] uppercase tracking-wider">{k}</span>
                      <span className="text-cyan-300 font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Globe className="w-3 h-3 text-cyan-400" />
                  <span className="text-white font-medium">{region.name}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* ── Floating Controls (Top Right) ── */}
      <div className="absolute top-3.5 right-3.5 z-[1000] flex flex-col gap-2">
        <MapButton
          active={isFollowing}
          activeClass="glass-panel-blue text-cyan-200 border-cyan-400/80 shadow-[0_0_16px_rgba(56,189,248,0.3)] font-bold"
          onClick={onToggleFollow}
          title={isFollowing ? 'Pause tracking' : 'Follow ISS'}
        >
          <Crosshair className={`w-3.5 h-3.5 ${isFollowing ? 'text-cyan-400 animate-spin-slow' : 'text-slate-300'}`} />
          <span>{isFollowing ? 'Tracking' : 'Follow'}</span>
          {isFollowing && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
        </MapButton>

        <MapButton
          active={showOrbit}
          activeClass="glass-panel-blue text-cyan-200 border-cyan-400/80"
          onClick={() => setShowOrbit((v) => !v)}
          title="Toggle predicted orbit"
        >
          <Orbit className="w-3.5 h-3.5 text-cyan-400" />
          <span>Orbit Path</span>
        </MapButton>

        <MapButton
          active={showFootprint}
          activeClass="glass-panel-silver text-white border-white/40"
          onClick={() => setShowFootprint((v) => !v)}
          title="Toggle visibility footprint"
        >
          <Compass className="w-3.5 h-3.5 text-slate-300" />
          <span>Footprint</span>
        </MapButton>

        <MapButton
          active={isTrailVisible}
          activeClass="glass-panel-blue text-cyan-200 border-cyan-400/80"
          onClick={onToggleTrail}
          title="Toggle flight trail"
        >
          {isTrailVisible ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
          <span>{isTrailVisible ? 'Trail On' : 'Trail Off'}</span>
        </MapButton>

        {/* Layer switcher */}
        <div className="relative">
          <MapButton
            active={showLayerMenu}
            activeClass="glass-panel-blue text-cyan-200 border-cyan-400/80"
            onClick={() => setShowLayerMenu((v) => !v)}
            title="Switch map layer"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Layers</span>
          </MapButton>
          {showLayerMenu && (
            <div className="absolute right-0 top-full mt-1.5 min-w-[150px] rounded-2xl glass-panel-blue border border-cyan-400/50 shadow-2xl overflow-hidden p-1">
              {Object.entries(MAP_LAYERS).map(([key, layer]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setActiveLayer(key); setShowLayerMenu(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                    activeLayer === key
                      ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/8'
                  }`}
                >
                  <Map className="w-3 h-3 text-cyan-400" />
                  {layer.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Coordinate Pill (Bottom Left) with Shiny Blue Styling ── */}
      {position && (
        <div className="absolute bottom-3.5 left-3.5 z-[1000]">
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl glass-panel border border-cyan-400/30 text-[11px] font-mono shadow-xl">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-blue-gradient font-bold">{region.name}</span>
            </div>
            <div className="h-3 w-px bg-white/15" />
            <span className="text-slate-100 font-semibold">
              {formatLatitude(position.latitude)}, {formatLongitude(position.longitude)}
            </span>
            <div className="h-3 w-px bg-white/15" />
            <span className="text-cyan-300 font-bold">{Math.round(heading)}°</span>
          </div>
        </div>
      )}
    </div>
  );
}
