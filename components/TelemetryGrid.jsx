'use client';

import React from 'react';
import {
  Compass,
  Navigation,
  Mountain,
  Gauge,
  Sun,
  Moon,
  Radio
} from 'lucide-react';
import TelemetryCard from './TelemetryCard';
import {
  formatLatitude,
  formatLongitude,
  formatAltitude,
  formatVelocity,
  formatVelocityKmS,
  formatFootprint,
  formatVisibility
} from '@/lib/formatters';

export default function TelemetryGrid({ position, isStale = false }) {
  if (!position) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl glass-panel animate-pulse flex flex-col justify-between p-4"
          >
            <div className="h-2.5 w-14 bg-white/10 rounded-full" />
            <div className="h-7 w-20 bg-white/10 rounded-lg" />
            <div className="h-2 w-16 bg-white/10 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  const { latitude, longitude, altitude, velocity, visibility, footprint } = position;
  const visibilityInfo = formatVisibility(visibility);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {/* 1. Latitude Card */}
      <TelemetryCard
        title="Latitude"
        value={typeof latitude === 'number' ? formatLatitude(latitude) : '—'}
        icon={Navigation}
        badge={latitude >= 0 ? 'North' : 'South'}
        badgeVariant="silver"
        subvalue={`Equator: ${Math.abs(latitude).toFixed(2)}°`}
        tooltip="Angular distance north or south of the Earth's equator"
      />

      {/* 2. Longitude Card */}
      <TelemetryCard
        title="Longitude"
        value={typeof longitude === 'number' ? formatLongitude(longitude) : '—'}
        icon={Compass}
        badge={longitude >= 0 ? 'East' : 'West'}
        badgeVariant="silver"
        subvalue={`Meridian: ${Math.abs(longitude).toFixed(2)}°`}
        tooltip="Angular distance east or west of the Prime Meridian"
      />

      {/* 3. Altitude Card */}
      <TelemetryCard
        title="Altitude"
        value={typeof altitude === 'number' ? Math.round(altitude).toLocaleString() : '—'}
        unit="km"
        icon={Mountain}
        badge="LEO Orbit"
        badgeVariant="silver"
        subvalue={`Geoid: ${formatAltitude(altitude)}`}
        tooltip="Orbital altitude above Earth's reference geoid"
      />

      {/* 4. Orbital Velocity Card (Highlighted with Shiny Blue) */}
      <TelemetryCard
        title="Orbital Speed"
        value={typeof velocity === 'number' ? Math.round(velocity).toLocaleString() : '—'}
        unit="km/h"
        icon={Gauge}
        badge="Mach 25.4"
        badgeVariant="blue"
        subvalue={`Rate: ${formatVelocityKmS(velocity)}`}
        highlight={true}
        tooltip="Orbital velocity required to maintain zero-g continuous freefall"
      />

      {/* 5. Illumination Card */}
      <TelemetryCard
        title="Solar Status"
        value={visibilityInfo.label}
        icon={visibilityInfo.isDaylight ? Sun : Moon}
        badge={visibilityInfo.isDaylight ? 'Sunlit' : 'Eclipse'}
        badgeVariant={visibilityInfo.isDaylight ? 'blue' : 'silver'}
        subvalue={visibilityInfo.isDaylight ? 'Arrays at 100%' : 'Battery Storage'}
        tooltip="Orbital lighting classification (Solar illumination vs Earth shadow)"
      />

      {/* 6. Horizon Footprint Card */}
      <TelemetryCard
        title="Footprint"
        value={typeof footprint === 'number' ? Math.round(footprint).toLocaleString() : '—'}
        unit="km ⌀"
        icon={Radio}
        badge="Coverage"
        badgeVariant="emerald"
        subvalue="LOS Earth Horizon"
        tooltip="Diameter of Earth visible to the station line-of-sight"
      />
    </div>
  );
}
