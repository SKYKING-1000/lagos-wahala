import React from 'react';
import { Navigation, X, MapPin, Compass, Flag } from 'lucide-react';
import { LAGOS_LANDMARKS, LAGOS_ZONES } from '../city/lagosGeography';
import { Landmark } from '../types/game';

interface MapModalProps {
  onClose: () => void;
  activeDestinationId: string | null;
  onSelectDestination: (landmarkId: string | null) => void;
  playerPos: { x: number; z: number };
}

export const MapModal: React.FC<MapModalProps> = ({
  onClose,
  activeDestinationId,
  onSelectDestination,
  playerPos,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-zinc-700 bg-zinc-900 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-inner">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Lagos Metropolitan GPS Map</h2>
              <p className="text-xs text-zinc-400">
                Connected Corridors: Ikeja • Yaba • Third Mainland Bridge • VI • Lekki
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2-Column Layout: Visual Map + Destinations Panel */}
        <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
          {/* Interactive Geographic Map View */}
          <div className="relative flex-1 bg-zinc-950 p-6 flex flex-col justify-between overflow-y-auto">
            {/* Zones overview badges */}
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              {LAGOS_ZONES.map((zone) => (
                <div
                  key={zone.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-2.5 shadow-sm"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: zone.color }}
                    />
                    <span className="font-bold text-zinc-200">{zone.name}</span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-[11px] text-zinc-400">{zone.subtitle}</p>
                </div>
              ))}
            </div>

            {/* Geographical Schematic Canvas */}
            <div className="relative my-4 h-72 w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 overflow-hidden">
              {/* Lagos Lagoon Graphic in background */}
              <div className="absolute right-12 top-28 h-32 w-48 rounded-full bg-sky-950/40 blur-md pointer-events-none" />
              <div className="absolute right-20 top-40 text-[10px] font-bold uppercase tracking-widest text-sky-500/50">
                Lagos Lagoon (TMB Crossing)
              </div>

              {/* Connected Expressway Highway Lines */}
              <svg className="absolute inset-0 h-full w-full pointer-events-none">
                {/* Ikorodu Road (Ikeja to Yaba) */}
                <line x1="25%" y1="20%" x2="40%" y2="45%" stroke="#64748b" strokeWidth="4" strokeDasharray="6 3" />
                {/* Third Mainland Bridge (Yaba across Lagoon to VI) */}
                <line x1="40%" y1="45%" x2="65%" y2="70%" stroke="#0284c7" strokeWidth="5" />
                {/* Lekki-Ikoyi Link Bridge (VI to Lekki) */}
                <line x1="65%" y1="70%" x2="85%" y2="75%" stroke="#f59e0b" strokeWidth="4" />
              </svg>

              {/* Landmark Pins positioned schematically according to real coordinates */}
              {LAGOS_LANDMARKS.map((lm) => {
                const isSelected = activeDestinationId === lm.id;
                // Normalize 3D coordinates (x: -80..420, z: -480..450) into percentage for map
                const leftPercent = Math.max(8, Math.min(92, ((lm.position.x + 100) / 540) * 100));
                const topPercent = Math.max(8, Math.min(90, ((lm.position.z + 500) / 980) * 100));

                return (
                  <button
                    key={lm.id}
                    onClick={() => onSelectDestination(isSelected ? null : lm.id)}
                    style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-md transition ${
                      isSelected
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30 scale-110'
                        : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:scale-105 border border-zinc-700'
                    }`}
                  >
                    <MapPin className="h-3 w-3" />
                    <span>{lm.name.split(' ')[0]}</span>
                  </button>
                );
              })}

              {/* Player Current Location Indicator */}
              <div
                style={{
                  left: `${Math.max(8, Math.min(92, ((playerPos.x + 100) / 540) * 100))}%`,
                  top: `${Math.max(8, Math.min(90, ((playerPos.z + 500) / 980) * 100))}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg border-2 border-white"
              >
                <Compass className="h-3 w-3 animate-spin" /> You
              </div>
            </div>

            {/* Quick status bar */}
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Click any destination pin or select from the list to set GPS route</span>
              {activeDestinationId && (
                <button
                  onClick={() => onSelectDestination(null)}
                  className="font-semibold text-red-400 hover:text-red-300"
                >
                  Clear GPS Destination
                </button>
              )}
            </div>
          </div>

          {/* Destination Selector List */}
          <div className="w-full border-t border-zinc-800 bg-zinc-900/90 p-4 md:w-80 md:border-t-0 md:border-l overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Mapped Destinations ({LAGOS_LANDMARKS.length})
            </h3>

            <div className="space-y-2">
              {LAGOS_LANDMARKS.map((lm) => {
                const isSelected = activeDestinationId === lm.id;
                const distToPlayerMeters = Math.round(
                  Math.hypot(lm.position.x - playerPos.x, lm.position.z - playerPos.z) * 8
                );

                return (
                  <div
                    key={lm.id}
                    onClick={() => onSelectDestination(isSelected ? null : lm.id)}
                    className={`cursor-pointer rounded-xl border p-3 transition ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/30'
                        : 'border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-zinc-200">{lm.name}</span>
                      <span className="rounded-md bg-zinc-700 px-1.5 py-0.5 text-[9px] font-bold uppercase text-zinc-300">
                        {lm.zone}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-[11px] text-zinc-400">{lm.description}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500 font-mono">
                        {distToPlayerMeters > 1000
                          ? `${(distToPlayerMeters / 1000).toFixed(1)} km`
                          : `${distToPlayerMeters} m`}
                      </span>
                      <span
                        className={`font-bold ${
                          isSelected ? 'text-emerald-400' : 'text-sky-400'
                        }`}
                      >
                        {isSelected ? 'Active Route ✓' : 'Set Route →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
