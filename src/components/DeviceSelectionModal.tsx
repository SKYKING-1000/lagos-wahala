import React, { useState } from 'react';
import { Smartphone, Laptop, Sparkles, Check, Info, ArrowRight } from 'lucide-react';
import { DeviceMode } from '../types/game';

interface DeviceSelectionModalProps {
  onSelectDevice: (mode: DeviceMode) => void;
  isTouchDetected: boolean;
}

export const DeviceSelectionModal: React.FC<DeviceSelectionModalProps> = ({
  onSelectDevice,
  isTouchDetected,
}) => {
  const [selected, setSelected] = useState<DeviceMode>(isTouchDetected ? 'mobile' : 'laptop');
  const [showTouchWarning, setShowTouchWarning] = useState(false);

  const handleConfirm = (mode: DeviceMode) => {
    if (mode === 'laptop' && isTouchDetected && !showTouchWarning) {
      setShowTouchWarning(true);
      setSelected('laptop');
      return;
    }
    onSelectDevice(mode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative my-auto flex w-full max-w-2xl flex-col rounded-3xl border-2 border-amber-500/40 bg-zinc-950 p-6 sm:p-8 text-white shadow-2xl">
        {/* Header Badge */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
            Open-World 3D Lagos Simulation
          </span>
        </div>

        {/* Title and Subtitle */}
        <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
          LAGOS SURVIVAL MODE
        </h1>
        <p className="mt-1 text-sm font-semibold text-zinc-300">
          Choose How You Want to Play
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          Select your device style. You can also switch this anytime later in Settings.
        </p>

        {/* Warning if selecting laptop on phone */}
        {showTouchWarning && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-950/40 p-4 text-xs text-amber-200">
            <Info className="h-5 w-5 shrink-0 text-amber-400" />
            <div className="flex-1">
              <span className="font-bold">Note for Touchscreen Players:</span> Laptop mode relies on physical keyboard bindings (WASD/Arrows to walk/drive, E to interact, Space to brake/jump). If you do not have an external keyboard attached, Phone mode is recommended.
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={() => onSelectDevice('laptop')}
                  className="rounded-lg bg-amber-500 px-3 py-1 font-bold text-zinc-950 hover:bg-amber-400 transition"
                >
                  Proceed with Laptop Mode
                </button>
                <button
                  onClick={() => {
                    setShowTouchWarning(false);
                    setSelected('mobile');
                  }}
                  className="rounded-lg bg-zinc-800 px-3 py-1 font-medium text-zinc-300 hover:bg-zinc-700 transition"
                >
                  Switch to Phone Mode
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Two Options Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* OPTION A: MOBILE PHONE */}
          <div
            onClick={() => {
              setSelected('mobile');
              setShowTouchWarning(false);
            }}
            className={`relative flex flex-col justify-between rounded-2xl border-2 p-5 transition cursor-pointer ${
              selected === 'mobile'
                ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-950/40'
                : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
            }`}
          >
            {isTouchDetected && (
              <span className="absolute -top-2.5 right-4 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black uppercase text-zinc-950">
                Recommended for Touch
              </span>
            )}

            <div>
              {/* Smartphone Illustration */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-emerald-400 border border-emerald-500/30">
                <Smartphone className="h-7 w-7" />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Play on Phone</h3>
                {selected === 'mobile' && <Check className="h-4 w-4 text-emerald-400" />}
              </div>

              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                Touch controls designed for Android and iPhone screens.
              </p>

              <ul className="mt-3 space-y-1 text-[11px] text-zinc-300">
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Smooth virtual walking joystick
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Touch gas & brake pedals for driving
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Big thumb-friendly interaction buttons
                </li>
              </ul>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleConfirm('mobile');
              }}
              className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition ${
                selected === 'mobile'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md hover:bg-emerald-400'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <span>SELECT PHONE</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* OPTION B: LAPTOP / DESKTOP */}
          <div
            onClick={() => {
              setSelected('laptop');
              setShowTouchWarning(false);
            }}
            className={`relative flex flex-col justify-between rounded-2xl border-2 p-5 transition cursor-pointer ${
              selected === 'laptop'
                ? 'border-sky-500 bg-sky-950/20 shadow-lg shadow-sky-950/40'
                : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
            }`}
          >
            {!isTouchDetected && (
              <span className="absolute -top-2.5 right-4 rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-black uppercase text-zinc-950">
                Recommended for Desktop
              </span>
            )}

            <div>
              {/* Laptop Illustration */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-sky-400 border border-sky-500/30">
                <Laptop className="h-7 w-7" />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Play on Laptop</h3>
                {selected === 'laptop' && <Check className="h-4 w-4 text-sky-400" />}
              </div>

              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                Keyboard and mouse controls for a bigger screen.
              </p>

              <ul className="mt-3 space-y-1 text-[11px] text-zinc-300">
                <li className="flex items-center gap-1.5">
                  <span className="text-sky-400">✓</span> WASD or Arrow Keys for movement
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-sky-400">✓</span> Smooth 3D mouse camera drag & orbit
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-sky-400">✓</span> E to interact, Space for jump/handbrake
                </li>
              </ul>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleConfirm('laptop');
              }}
              className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition ${
                selected === 'laptop'
                  ? 'bg-sky-500 text-zinc-950 shadow-md hover:bg-sky-400'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <span>SELECT LAPTOP</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Footer tip */}
        <div className="mt-6 flex flex-wrap items-center justify-between border-t border-zinc-800/80 pt-4 text-xs text-zinc-400 gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Saved progress and game world remain synchronized across both modes.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
