import React from 'react';
import {
  X,
  Smartphone,
  Laptop,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Keyboard,
} from 'lucide-react';
import { DeviceMode } from '../types/game';
import { gameState } from '../game/gameState';

interface SettingsModalProps {
  onClose: () => void;
  currentDeviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  currentDeviceMode,
  onDeviceModeChange,
  isAudioMuted,
  onToggleAudio,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border-2 border-zinc-700 bg-zinc-950 p-6 text-white shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white">Game Settings</h2>
            <p className="text-xs text-zinc-400">Controls, Device Style & Performance</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-zinc-900 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1. Device Mode Selection */}
        <div className="mt-5">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Control Layout / Device Mode
          </label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              onClick={() => onDeviceModeChange('mobile')}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition ${
                currentDeviceMode === 'mobile'
                  ? 'border-emerald-500 bg-emerald-950/30 text-white'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Smartphone className="h-6 w-6 text-emerald-400" />
              <div className="text-center">
                <div className="text-sm font-bold text-white">Phone Mode</div>
                <div className="text-[11px] text-zinc-400">Touch D-pad & Pedals</div>
              </div>
            </button>

            <button
              onClick={() => onDeviceModeChange('laptop')}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition ${
                currentDeviceMode === 'laptop'
                  ? 'border-sky-500 bg-sky-950/30 text-white'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Laptop className="h-6 w-6 text-sky-400" />
              <div className="text-center">
                <div className="text-sm font-bold text-white">Laptop Mode</div>
                <div className="text-[11px] text-zinc-400">Keyboard & Mouse</div>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Audio Toggle */}
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-amber-400">
              {isAudioMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </div>
            <div>
              <div className="text-sm font-bold text-white">Procedural Lagos Sounds</div>
              <div className="text-xs text-zinc-400">Engines, Danfo horns, traffic ambience</div>
            </div>
          </div>
          <button
            onClick={onToggleAudio}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              isAudioMuted
                ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                : 'bg-emerald-600 text-white shadow-sm'
            }`}
          >
            {isAudioMuted ? 'Muted' : 'Enabled'}
          </button>
        </div>

        {/* 3. Controls Reference Card */}
        <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wide">
            <Keyboard className="h-4 w-4" />
            <span>Controls Guide ({currentDeviceMode === 'mobile' ? 'Touchscreen' : 'Keyboard'})</span>
          </div>
          {currentDeviceMode === 'mobile' ? (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-300">
              <div>🕹️ <b>Left Joystick:</b> Walk / Steer</div>
              <div>⚡ <b>Action Button:</b> Enter car / Talk / Work</div>
              <div>🟢 <b>Gas Pedal:</b> Accelerate car</div>
              <div>🔴 <b>Brake Pedal:</b> Slow down & reverse</div>
              <div>🅿️ <b>Handbrake:</b> Tight drift / stop</div>
              <div>👀 <b>Drag Right Screen:</b> Look around</div>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-300">
              <div>⌨️ <b>W A S D / Arrows:</b> Move / Drive</div>
              <div>🔑 <b>E or F:</b> Interact / Enter Car / Work</div>
              <div>🚀 <b>Space:</b> Jump on foot / Handbrake in car</div>
              <div>⚡ <b>Shift:</b> Sprint on foot</div>
              <div>🖱️ <b>Mouse Drag:</b> Orbit camera 360°</div>
              <div>📱 <b>P:</b> Open Phone & Messages</div>
              <div>🗺️ <b>M:</b> Open Full GPS Map</div>
              <div>🍛 <b>B:</b> Buy Food at Buka</div>
            </div>
          )}
        </div>

        {/* Bottom Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-zinc-950 shadow-md hover:bg-amber-400 transition"
          >
            Done & Resume
          </button>
        </div>
      </div>
    </div>
  );
};
