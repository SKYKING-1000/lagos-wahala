import React, { useState } from 'react';
import {
  Navigation,
  Smartphone,
  Utensils,
  Briefcase,
  Volume2,
  VolumeX,
  Gauge,
  Fuel,
  Sun,
  CloudRain,
  ChevronUp,
  ChevronDown,
  HelpCircle,
  Car,
  Compass,
  Settings,
  Laptop,
  MessageSquare,
} from 'lucide-react';
import { PlayerStats, VehicleState, DeviceMode } from '../types/game';
import { RouteResult } from '../game/routing';
import { Minimap } from './Minimap';

interface HUDProps {
  stats: PlayerStats;
  isDriving: boolean;
  vehicle: VehicleState | null;
  activeRoute: RouteResult | null;
  activeDestinationId: string | null;
  currentZoneName: string;
  interactionPrompt: string | null;
  playerPos: { x: number; z: number };
  playerHeading: number;
  onClearDestination: () => void;
  onOpenMap: () => void;
  onOpenPhone: () => void;
  onOpenBuka: () => void;
  onOpenOffice: () => void;
  onOpenSettings: () => void;
  onInteract: () => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  onCycleCamera?: () => void;
  showTouchControls?: boolean;
  onToggleTouchControls?: () => void;
  deviceMode: DeviceMode;
  latestNotification?: { sender: string; text: string } | null;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  isDriving,
  vehicle,
  activeRoute,
  activeDestinationId,
  currentZoneName,
  interactionPrompt,
  playerPos,
  playerHeading,
  onClearDestination,
  onOpenMap,
  onOpenPhone,
  onOpenBuka,
  onOpenOffice,
  onOpenSettings,
  onInteract,
  isAudioMuted,
  onToggleAudio,
  onCycleCamera,
  showTouchControls,
  onToggleTouchControls,
  deviceMode,
  latestNotification,
}) => {
  const [dockExpanded, setDockExpanded] = useState(true);
  const [showControlsHelp, setShowControlsHelp] = useState(false);

  // Format time of day (e.g. 360 -> "06:00 AM")
  const hours = Math.floor(stats.timeMinutes / 60) % 24;
  const minutes = Math.floor(stats.timeMinutes % 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const timeFormatted = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;

  // Vehicle speed in km/h
  const speedKmh = vehicle ? Math.round(Math.abs(vehicle.speed) * 3.6) : 0;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 select-none flex flex-col justify-between p-3 sm:p-5">
      {/* Top Section: Status Bar & Notification */}
      <div className="flex flex-col gap-2">
        {/* Top Status Bar */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/85 px-4 py-2.5 text-white shadow-xl backdrop-blur-xs">
          {/* Left: Time & Zone */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-amber-400">
              <Sun className="h-4 w-4 text-amber-400" />
              <span>{timeFormatted}</span>
            </div>
            <span className="text-zinc-600">|</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <Compass className="h-3.5 w-3.5 text-sky-400" />
              <span>{currentZoneName}</span>
            </div>
            <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400 uppercase">
              Day {stats.day}
            </span>
          </div>

          {/* Center-Right: Device Mode Toggle & Settings Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/90 px-2.5 py-1 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-800"
              title="Change Device Mode or View Settings"
            >
              {deviceMode === 'mobile' ? (
                <>
                  <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Phone</span>
                </>
              ) : (
                <>
                  <Laptop className="h-3.5 w-3.5 text-sky-400" />
                  <span>Laptop</span>
                </>
              )}
            </button>

            {/* Naira balance */}
            <div className="flex items-center gap-1 rounded-lg bg-emerald-950/80 px-3 py-1 font-mono text-sm font-bold text-emerald-400 border border-emerald-500/30 shadow-sm">
              <span>₦{stats.money.toLocaleString()}</span>
            </div>

            {/* Hunger Bar */}
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>Hunger</span>
                <span className="font-mono">{Math.round(stats.hunger)}%</span>
              </div>
              <div className="h-1.5 w-14 overflow-hidden rounded-full bg-zinc-800">
                <div
                  style={{ width: `${Math.min(100, stats.hunger)}%` }}
                  className={`h-full transition-all ${
                    stats.hunger > 70 ? 'bg-red-500' : stats.hunger > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
              </div>
            </div>

            {/* Energy Bar */}
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>Energy</span>
                <span className="font-mono">{Math.round(stats.energy)}%</span>
              </div>
              <div className="h-1.5 w-14 overflow-hidden rounded-full bg-zinc-800">
                <div
                  style={{ width: `${Math.min(100, stats.energy)}%` }}
                  className="h-full bg-sky-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Incoming Notification Preview Banner */}
        {latestNotification && (
          <div
            onClick={onOpenPhone}
            className="pointer-events-auto mx-auto flex cursor-pointer items-center gap-2.5 rounded-2xl border border-emerald-500/50 bg-zinc-950/90 px-4 py-2 text-xs text-white shadow-2xl backdrop-blur-md transition hover:scale-105 active:scale-95 max-w-md animate-in slide-in-from-top-2"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="font-bold text-emerald-400 text-[11px] truncate">{latestNotification.sender}</div>
              <div className="text-zinc-300 text-[11px] truncate">{latestNotification.text}</div>
            </div>
            <span className="text-[10px] text-zinc-500">Tap to open</span>
          </div>
        )}
      </div>

      {/* Floating GPS Minimap (Top-Right, compact, zero route lines on 3D map) */}
      <div className="pointer-events-none absolute top-18 right-3 sm:right-5 z-20">
        <Minimap
          playerPos={playerPos}
          playerHeading={playerHeading}
          activeRoute={activeRoute}
          activeDestinationId={activeDestinationId}
          onClearDestination={onClearDestination}
          onOpenFullMap={onOpenMap}
        />
      </div>

      {/* Middle Center: Interaction Banner */}
      <div className="flex flex-col items-center justify-center pointer-events-none">
        {interactionPrompt && (
          <div
            onClick={onInteract}
            className="pointer-events-auto cursor-pointer rounded-2xl border-2 border-amber-400/80 bg-zinc-950/90 px-6 py-3 text-center shadow-2xl transition hover:scale-105 active:scale-95"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
              <span className="rounded-md bg-amber-500 px-2.5 py-1 font-mono text-xs font-black text-zinc-950 shadow-xs">
                SPACE / E
              </span>
              <span>{interactionPrompt}</span>
            </div>
          </div>
        )}
      </div>

      {/* Driving HUD overlay when in vehicle */}
      {isDriving && vehicle && (
        <div className="pointer-events-auto absolute bottom-24 left-6 flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4 text-white shadow-xl backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Gauge className="h-6 w-6" />
            </div>
            <div>
              <div className="font-mono text-2xl font-black">{speedKmh}</div>
              <div className="text-[10px] uppercase font-bold text-zinc-400">KM / H</div>
            </div>
          </div>

          <div className="h-8 w-px bg-zinc-800" />

          <div className="flex items-center gap-2">
            <Fuel className={`h-5 w-5 ${vehicle.fuel < 20 ? 'text-red-500' : 'text-amber-400'}`} />
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold">{Math.round(vehicle.fuel)}%</span>
              <span className="text-[10px] text-zinc-400">FUEL</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapsible Bottom Control Dock (Consolidated, Zero Viewport Occlusion) */}
      <div className="pointer-events-auto relative mx-auto flex flex-col items-center">
        {/* Collapse Toggle Tab */}
        <button
          onClick={() => setDockExpanded(!dockExpanded)}
          className="flex items-center gap-1 rounded-t-xl border-t border-x border-zinc-700 bg-zinc-900 px-3 py-1 text-[11px] font-semibold text-zinc-300 shadow-lg hover:text-white"
        >
          {dockExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          <span>{dockExpanded ? 'Hide Controls (H)' : 'Show Controls (H)'}</span>
        </button>

        {/* Dock Bar */}
        {dockExpanded && (
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950/95 px-4 py-2.5 shadow-2xl backdrop-blur-xs max-w-[94vw]">
            <button
              onClick={onOpenMap}
              className="flex items-center gap-1.5 rounded-xl bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
            >
              <Navigation className="h-4 w-4 text-sky-400" />
              <span>GPS Map [M]</span>
            </button>

            <button
              onClick={onOpenPhone}
              className="flex items-center gap-1.5 rounded-xl bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
            >
              <Smartphone className="h-4 w-4 text-emerald-400" />
              <span>Phone [P]</span>
            </button>

            <button
              onClick={onOpenBuka}
              className="flex items-center gap-1.5 rounded-xl bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
            >
              <Utensils className="h-4 w-4 text-amber-400" />
              <span>Food [B]</span>
            </button>

            <button
              onClick={onOpenOffice}
              className="flex items-center gap-1.5 rounded-xl bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
            >
              <Briefcase className="h-4 w-4 text-purple-400" />
              <span>Work</span>
            </button>

            {onCycleCamera && (
              <button
                onClick={onCycleCamera}
                className="flex items-center gap-1.5 rounded-xl bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700"
                title="Switch Camera View [C]"
              >
                <span>Camera [C]</span>
              </button>
            )}

            {onToggleTouchControls && (
              <button
                onClick={onToggleTouchControls}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  showTouchControls ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
                title="Toggle On-Screen Touch Buttons"
              >
                <span>{showTouchControls ? '📱 Touch UI: On' : '📱 Touch UI: Off'}</span>
              </button>
            )}

            <button
              onClick={onToggleAudio}
              className="flex items-center gap-1.5 rounded-xl bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-700"
              title="Toggle Audio"
            >
              {isAudioMuted ? (
                <VolumeX className="h-4 w-4 text-red-400" />
              ) : (
                <Volume2 className="h-4 w-4 text-emerald-400" />
              )}
            </button>

            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 rounded-xl bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
              title="Settings & Device Mode"
            >
              <Settings className="h-4 w-4 text-amber-400" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => setShowControlsHelp(!showControlsHelp)}
              className="flex items-center gap-1 rounded-xl bg-zinc-800 px-2.5 py-2 text-xs text-zinc-400 hover:text-white"
              title="Controls Help"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Controls Help Card Popup */}
        {showControlsHelp && (
          <div className="absolute bottom-16 rounded-2xl border border-zinc-700 bg-zinc-950 p-4 text-xs text-zinc-300 shadow-2xl w-96 max-h-[75vh] overflow-y-auto">
            <h4 className="font-bold text-white mb-2 text-sm">Computer & Phone Controls</h4>
            
            <div className="space-y-3">
              <div>
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">🖥️ Desktop / Computer Controls</span>
                <ul className="mt-1 space-y-1 text-zinc-300">
                  <li><b className="text-white">WASD / Arrow Keys:</b> Walk on foot / Steer car</li>
                  <li><b className="text-white">Left or Right Mouse Drag:</b> Rotate camera 360°</li>
                  <li><b className="text-white">Mouse Scroll Wheel:</b> Zoom camera in and out</li>
                  <li><b className="text-white">Spacebar:</b> Jump (on foot) / Handbrake drift (driving)</li>
                  <li><b className="text-white">Shift:</b> Sprint (run faster on foot)</li>
                  <li><b className="text-white">E or F:</b> Enter/Exit Car & Interact with objects</li>
                  <li><b className="text-white">C:</b> Switch Camera view (Standard, Close, Panoramic)</li>
                  <li><b className="text-white">H:</b> Horn (driving) / Hide Controls Dock</li>
                  <li><b className="text-white">L:</b> Toggle Headlights</li>
                  <li><b className="text-white">M:</b> Open Lagos GPS Map</li>
                  <li><b className="text-white">P:</b> Open Smartphone</li>
                  <li><b className="text-white">B:</b> Open Buka Food Menu</li>
                </ul>
              </div>

              <div className="border-t border-zinc-800 pt-2">
                <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">📱 Mobile / Phone Touch Controls</span>
                <ul className="mt-1 space-y-1 text-zinc-300">
                  <li><b className="text-white">Virtual Joystick (Bottom Left):</b> Move in 360° directions</li>
                  <li><b className="text-white">Right Screen Swipe:</b> Drag anywhere on screen to look around</li>
                  <li><b className="text-white">Green GAS Pedal:</b> Hold to accelerate vehicle</li>
                  <li><b className="text-white">Red BRAKE Pedal:</b> Tap/hold to brake and reverse</li>
                  <li><b className="text-white">DRIFT Button:</b> Handbrake drift around corners</li>
                  <li><b className="text-white">JUMP Button:</b> Leap with realistic gravity</li>
                  <li><b className="text-white">RUN/WALK Button:</b> Toggle between walking & sprinting</li>
                  <li><b className="text-white">USE & ENTER Buttons:</b> Interact & enter/exit car</li>
                  <li><b className="text-white">Top Right Icons:</b> Quick access to GPS Map, Phone, and Buka</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
