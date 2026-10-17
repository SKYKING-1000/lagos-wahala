import React from 'react';
import { ArrowUp, ArrowDown, Building2, Server, ShieldCheck, Sun, CheckCircle, X } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface ElevatorModalProps {
  currentFloor: number; // 0, 1, 2, 3
  onSelectFloor: (floor: number) => void;
  onClose: () => void;
}

export const ElevatorModal: React.FC<ElevatorModalProps> = ({
  currentFloor,
  onSelectFloor,
  onClose,
}) => {
  const floors = [
    {
      level: 3,
      code: '3',
      name: 'Rooftop Sky Lab & Lounge',
      desc: 'Photovoltaic Solar Array, 5G Telecom Dish, Outdoor Suya Grill & Lagos Lagoon View',
      icon: Sun,
      color: 'from-amber-500 to-orange-600',
      tag: 'Innovation & Chill',
    },
    {
      level: 2,
      code: '2',
      name: 'C-Suite & CBN Compliance',
      desc: 'Dr. Mrs. Adeleke (CFO), Kayode (Compliance Lead), CBN Treasury & Executive Suites',
      icon: ShieldCheck,
      color: 'from-purple-500 to-indigo-600',
      tag: 'Executive & Legal',
    },
    {
      level: 1,
      code: '1',
      name: 'Fintech Datacenter & Boardroom',
      desc: 'Core Server Racks (48 microservices online), Funmi (UI/UX), Segun (DevOps), ₦4.2B Live Board',
      icon: Server,
      color: 'from-blue-500 to-cyan-600',
      tag: 'Infrastructure',
    },
    {
      level: 0,
      code: 'G',
      name: 'Ground Lobby & Dev Floor',
      desc: 'Amina (Reception), Tayo (Frontend), Chidinma (QA), Your Workstation Desk & Coffee Pantry',
      icon: Building2,
      color: 'from-emerald-500 to-teal-600',
      tag: 'Core Engineering',
    },
  ];

  const handleFloorClick = (level: number) => {
    if (level === currentFloor) return;
    soundEngine.playElevatorMove();
    setTimeout(() => {
      soundEngine.playElevatorChime();
    }, 1200);
    onSelectFloor(level);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-zinc-700 bg-zinc-950 p-6 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">PayLagos Hub Elevator</h3>
              <p className="text-xs text-zinc-400">Select floor destination</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Floor Indicator */}
        <div className="my-4 flex items-center justify-between rounded-2xl bg-zinc-900/90 px-4 py-3 border border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400">Current Position:</span>
          <span className="flex items-center gap-1.5 font-mono text-sm font-bold text-sky-400">
            {currentFloor === 0 ? 'Ground Floor (G)' : `Floor ${currentFloor}`}
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </span>
        </div>

        {/* Floor Selection List */}
        <div className="space-y-2.5">
          {floors.map((fl) => {
            const isCurrent = fl.level === currentFloor;
            const Icon = fl.icon;
            return (
              <button
                key={fl.level}
                onClick={() => handleFloorClick(fl.level)}
                disabled={isCurrent}
                className={`group flex w-full items-center justify-between rounded-2xl border p-3.5 text-left transition-all ${
                  isCurrent
                    ? 'border-emerald-500/50 bg-emerald-950/20 opacity-80 cursor-default'
                    : 'border-zinc-800 bg-zinc-900/70 hover:border-sky-500/60 hover:bg-zinc-850 hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-mono text-lg font-black shadow-md ${
                      isCurrent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-br ' + fl.color + ' text-white group-hover:shadow-lg'
                    }`}
                  >
                    {fl.code}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-100">{fl.name}</span>
                      <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400 uppercase">
                        {fl.tag}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400 leading-snug">{fl.desc}</p>
                  </div>
                </div>

                <div className="ml-2 shrink-0">
                  {isCurrent ? (
                    <span className="text-xs font-bold text-emerald-400">HERE</span>
                  ) : fl.level > currentFloor ? (
                    <ArrowUp className="h-5 w-5 text-sky-400 group-hover:translate-y-[-2px] transition-transform" />
                  ) : (
                    <ArrowDown className="h-5 w-5 text-amber-400 group-hover:translate-y-[2px] transition-transform" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-zinc-500">
            Powered by PayLagos Hub Solar & Dedicated Grid Inverter
          </p>
        </div>
      </div>
    </div>
  );
};
