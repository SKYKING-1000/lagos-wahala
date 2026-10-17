import React from 'react';
import { AlertTriangle, Clock, Zap, DollarSign } from 'lucide-react';
import { WahalaEvent } from '../types/game';
import { gameState } from '../game/gameState';
import { soundEngine } from '../audio/soundEngine';

interface WahalaDialogProps {
  event: WahalaEvent;
  onClose: (resultMessage: string) => void;
}

export const WahalaDialog: React.FC<WahalaDialogProps> = ({ event, onClose }) => {
  const handleSelectOption = (opt: WahalaEvent['options'][0]) => {
    gameState.applyWahalaChoice(opt.cost, opt.staminaCost, opt.timePenaltyMin);
    if (opt.cost) {
      soundEngine.playCashSound();
    }
    onClose(opt.effectMessage);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="flex w-full max-w-lg flex-col rounded-2xl border-2 border-amber-500/60 bg-zinc-900 text-white shadow-2xl overflow-hidden">
        {/* Banner */}
        <div className="flex items-center gap-3 border-b border-amber-500/30 bg-amber-950/60 px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-zinc-950 shadow-inner">
            <AlertTriangle className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Everyday Lagos Wahala
            </span>
            <h3 className="text-lg font-bold text-white">{event.title}</h3>
          </div>
        </div>

        {/* Description */}
        <div className="p-6">
          <p className="text-sm leading-relaxed text-zinc-300">{event.description}</p>

          {/* Options */}
          <div className="mt-6 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              How do you handle this situation?
            </div>

            {event.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt)}
                className="w-full text-left rounded-xl border border-zinc-700 bg-zinc-800/80 p-3.5 transition hover:border-amber-400 hover:bg-zinc-800 group"
              >
                <div className="text-xs font-semibold text-zinc-100 group-hover:text-amber-300">
                  {opt.label}
                </div>
                <div className="mt-1.5 flex items-center gap-4 text-[11px] text-zinc-400">
                  {opt.cost && (
                    <span className="flex items-center gap-1 text-red-400">
                      <DollarSign className="h-3 w-3" /> -₦{opt.cost.toLocaleString()}
                    </span>
                  )}
                  {opt.staminaCost && (
                    <span className="flex items-center gap-1 text-sky-400">
                      <Zap className="h-3 w-3" /> -{opt.staminaCost}% Energy
                    </span>
                  )}
                  {opt.timePenaltyMin && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <Clock className="h-3 w-3" /> +{opt.timePenaltyMin} min delay
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
