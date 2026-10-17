import React, { useRef, useState, useEffect } from 'react';
import {
  Volume2,
  Car,
  LogOut,
  Lightbulb,
  ArrowUp,
  Compass,
  Camera,
  Navigation,
  Smartphone,
  Utensils,
  ChevronLeft,
  ChevronRight,
  Flame,
  Settings,
} from 'lucide-react';

interface MobileControlsProps {
  onMoveChange: (x: number, y: number) => void;
  onJumpStart: () => void;
  onJumpEnd: () => void;
  onToggleSprint: () => void;
  isSprinting: boolean;
  onGasStart: () => void;
  onGasEnd: () => void;
  onBrakeStart: () => void;
  onBrakeEnd: () => void;
  onHandbrakeStart: () => void;
  onHandbrakeEnd: () => void;
  onActionClick: () => void;
  onEnterExitCar: () => void;
  onHorn: () => void;
  onToggleLights: () => void;
  onCycleCamera: () => void;
  onOpenMap: () => void;
  onOpenPhone: () => void;
  onOpenBuka: () => void;
  onOpenSettings?: () => void;
  isDriving: boolean;
  nearVehicle: boolean;
  nearInteractable: string | null;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMoveChange,
  onJumpStart,
  onJumpEnd,
  onToggleSprint,
  isSprinting,
  onGasStart,
  onGasEnd,
  onBrakeStart,
  onBrakeEnd,
  onHandbrakeStart,
  onHandbrakeEnd,
  onActionClick,
  onEnterExitCar,
  onHorn,
  onToggleLights,
  onCycleCamera,
  onOpenMap,
  onOpenPhone,
  onOpenBuka,
  onOpenSettings,
  isDriving,
  nearVehicle,
  nearInteractable,
}) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  // Virtual analog joystick
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !joystickRef.current || touchIdRef.current === null) return;
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        if (touch.identifier === touchIdRef.current) {
          const rect = joystickRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          let dx = touch.clientX - centerX;
          let dy = touch.clientY - centerY;
          const maxRadius = rect.width / 2;
          const dist = Math.hypot(dx, dy);

          if (dist > maxRadius) {
            dx = (dx / dist) * maxRadius;
            dy = (dy / dist) * maxRadius;
          }

          setKnobPos({ x: dx, y: dy });
          // Normalize -1 to 1
          onMoveChange(dx / maxRadius, dy / maxRadius);
          break;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchIdRef.current === null) return;
      let stillActive = false;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === touchIdRef.current) {
          stillActive = true;
          break;
        }
      }
      if (!stillActive) {
        setIsDragging(false);
        touchIdRef.current = null;
        setKnobPos({ x: 0, y: 0 });
        onMoveChange(0, 0);
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isDragging, onMoveChange]);

  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.touches[0];
    touchIdRef.current = touch.identifier;
    setIsDragging(true);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-40 select-none overflow-hidden touch-none">
      {/* Top-Right Quick Mobile Bar (Map, Phone, Food, Camera, Settings) */}
      <div className="absolute top-16 right-4 pointer-events-auto flex flex-col gap-2">
        <button
          onClick={onOpenMap}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-500/40 bg-zinc-900/90 text-sky-400 shadow-xl backdrop-blur-xs active:scale-95"
          title="Open Lagos GPS Map"
        >
          <Navigation className="h-5 w-5" />
        </button>

        <button
          onClick={onOpenPhone}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/40 bg-zinc-900/90 text-emerald-400 shadow-xl backdrop-blur-xs active:scale-95"
          title="Open Smartphone"
        >
          <Smartphone className="h-5 w-5" />
        </button>

        <button
          onClick={onOpenBuka}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-500/40 bg-zinc-900/90 text-amber-400 shadow-xl backdrop-blur-xs active:scale-95"
          title="Order Food at Buka"
        >
          <Utensils className="h-5 w-5" />
        </button>

        <button
          onClick={onCycleCamera}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-500/40 bg-zinc-900/90 text-purple-400 shadow-xl backdrop-blur-xs active:scale-95"
          title="Switch Camera View"
        >
          <Camera className="h-5 w-5" />
        </button>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900/90 text-zinc-300 shadow-xl backdrop-blur-xs active:scale-95"
            title="Open Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Touch Look Hint Banner (subtle floating text in top middle) */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-[10px] font-medium text-zinc-300 pointer-events-none backdrop-blur-xs border border-white/10">
        👆 Swipe anywhere to look around 360°
      </div>

      {/* --- BOTTOM CONTROLS --- */}
      {isDriving ? (
        /* VEHICLE DRIVING CONTROLS */
        <div className="absolute bottom-6 inset-x-6 flex items-end justify-between pointer-events-none">
          {/* Left: Steering Controls & Horn/Lights */}
          <div className="pointer-events-auto flex flex-col gap-3">
            <div className="flex gap-2">
              <button
                onClick={onHorn}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-950/80 text-amber-300 shadow-xl active:scale-95"
              >
                <Volume2 className="h-6 w-6" />
              </button>
              <button
                onClick={onToggleLights}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-500/40 bg-sky-950/80 text-sky-300 shadow-xl active:scale-95"
              >
                <Lightbulb className="h-6 w-6" />
              </button>
            </div>

            {/* Steering Left / Right Buttons */}
            <div className="flex gap-2">
              <button
                onTouchStart={() => onMoveChange(1, 0)}
                onTouchEnd={() => onMoveChange(0, 0)}
                onMouseDown={() => onMoveChange(1, 0)}
                onMouseUp={() => onMoveChange(0, 0)}
                className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-zinc-600 bg-zinc-900/90 text-white shadow-xl active:bg-zinc-700 active:scale-95"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onTouchStart={() => onMoveChange(-1, 0)}
                onTouchEnd={() => onMoveChange(0, 0)}
                onMouseDown={() => onMoveChange(-1, 0)}
                onMouseUp={() => onMoveChange(0, 0)}
                className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-zinc-600 bg-zinc-900/90 text-white shadow-xl active:bg-zinc-700 active:scale-95"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </div>
          </div>

          {/* Right: Pedals (Brake/Reverse, Handbrake, Gas) + Exit Car */}
          <div className="pointer-events-auto flex items-end gap-3">
            {/* Exit Car */}
            <button
              onClick={onEnterExitCar}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-red-500/50 bg-red-950/80 text-red-300 shadow-xl active:scale-95"
              title="Exit Vehicle"
            >
              <LogOut className="h-6 w-6" />
            </button>

            {/* Handbrake Drift */}
            <button
              onTouchStart={onHandbrakeStart}
              onTouchEnd={onHandbrakeEnd}
              onMouseDown={onHandbrakeStart}
              onMouseUp={onHandbrakeEnd}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-yellow-500 bg-yellow-950/80 text-yellow-300 font-black text-xs shadow-xl active:scale-95"
            >
              DRIFT
            </button>

            {/* Foot Brake / Reverse Pedal */}
            <button
              onTouchStart={onBrakeStart}
              onTouchEnd={onBrakeEnd}
              onMouseDown={onBrakeStart}
              onMouseUp={onBrakeEnd}
              className="flex h-20 w-16 flex-col items-center justify-center rounded-2xl border-2 border-red-400 bg-red-600 font-black text-white shadow-2xl active:bg-red-700 active:scale-95"
            >
              <span className="text-[10px] tracking-wider">BRAKE</span>
              <span className="text-[9px] opacity-80">REV</span>
            </button>

            {/* Accelerator Gas Pedal */}
            <button
              onTouchStart={onGasStart}
              onTouchEnd={onGasEnd}
              onMouseDown={onGasStart}
              onMouseUp={onGasEnd}
              className="flex h-24 w-18 flex-col items-center justify-center rounded-2xl border-2 border-emerald-400 bg-emerald-600 font-black text-white shadow-2xl active:bg-emerald-700 active:scale-95"
            >
              <Flame className="h-6 w-6 mb-1 fill-white" />
              <span className="text-xs tracking-wider">GAS</span>
            </button>
          </div>
        </div>
      ) : (
        /* ON-FOOT WALKING CONTROLS */
        <div className="absolute bottom-6 inset-x-6 flex items-end justify-between pointer-events-none">
          {/* Left: Virtual Analog Movement Joystick */}
          <div className="pointer-events-auto">
            <div
              ref={joystickRef}
              onTouchStart={handleJoystickTouchStart}
              className="relative flex h-32 w-32 items-center justify-center rounded-full border-2 border-white/25 bg-black/50 backdrop-blur-xs shadow-2xl"
            >
              <div
                style={{
                  transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
                }}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-gradient-to-br from-zinc-200 to-zinc-400 shadow-md transition-transform duration-75"
              >
                <Compass className="h-6 w-6 text-zinc-800" />
              </div>
            </div>
          </div>

          {/* Right: Jump, Sprint, Use, Enter Car */}
          <div className="pointer-events-auto flex items-end gap-3">
            {/* Action / Use Button */}
            {nearInteractable && (
              <button
                onClick={onActionClick}
                className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border-2 border-amber-400 bg-amber-600 font-black text-white shadow-2xl active:scale-95"
              >
                <span className="text-xs">USE</span>
                <span className="text-[9px] opacity-90 truncate max-w-[50px]">[E]</span>
              </button>
            )}

            {/* Enter Car Button */}
            {nearVehicle && (
              <button
                onClick={onEnterExitCar}
                className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border-2 border-emerald-400 bg-emerald-600 font-black text-white shadow-2xl active:scale-95"
              >
                <Car className="h-6 w-6" />
                <span className="text-[10px]">ENTER</span>
              </button>
            )}

            {/* Sprint Toggle */}
            <button
              onClick={onToggleSprint}
              className={`flex h-14 w-14 flex-col items-center justify-center rounded-2xl border shadow-xl active:scale-95 ${
                isSprinting
                  ? 'border-sky-400 bg-sky-600 text-white font-bold'
                  : 'border-zinc-700 bg-zinc-900/90 text-zinc-300'
              }`}
            >
              <Flame className="h-5 w-5" />
              <span className="text-[9px] uppercase font-bold">{isSprinting ? 'RUN' : 'WALK'}</span>
            </button>

            {/* Jump Button */}
            <button
              onTouchStart={onJumpStart}
              onTouchEnd={onJumpEnd}
              onMouseDown={onJumpStart}
              onMouseUp={onJumpEnd}
              className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border-2 border-emerald-400 bg-emerald-600 font-black text-white shadow-2xl active:bg-emerald-700 active:scale-95"
            >
              <ArrowUp className="h-6 w-6 stroke-[3]" />
              <span className="text-[10px]">JUMP</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
