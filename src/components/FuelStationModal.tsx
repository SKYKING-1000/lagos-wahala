import React, { useState } from 'react';
import {
  Fuel,
  X,
  CreditCard,
  Banknote,
  CheckCircle,
  AlertCircle,
  Zap,
  ArrowRight,
  Sparkles,
  Gauge,
  Droplet,
  Truck,
} from 'lucide-react';
import { gameState } from '../game/gameState';
import { soundEngine } from '../audio/soundEngine';
import { VehicleState } from '../types/game';

interface FuelStationModalProps {
  stationName?: string;
  vehicleState: VehicleState | null;
  onClose: () => void;
  onRefueledVehicle: (newFuelPercent: number) => void;
}

export const FuelStationModal: React.FC<FuelStationModalProps> = ({
  stationName = 'Oando Filling Station (Ikeja)',
  vehicleState,
  onClose,
  onRefueledVehicle,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<'car' | 'jerrycan'>('car');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [customAmount, setCustomAmount] = useState('');
  const [isDispensing, setIsDispensing] = useState(false);
  const [dispensedLiters, setDispensedLiters] = useState(0);
  const [dispensedCost, setDispensedCost] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const stats = gameState.getStats();
  const currentFuel = vehicleState ? vehicleState.fuel : 0;
  const pricePerLiter = 850; // Current Lagos PMS Pump Price ₦850/L

  // Quick fill preset amounts for vehicle
  const quickVehicleAmounts = [
    { label: '₦2,000', amount: 2000, liters: 2.35 },
    { label: '₦5,000', amount: 5000, liters: 5.88 },
    { label: '₦10,000', amount: 10000, liters: 11.76 },
    { label: '₦20,000', amount: 20000, liters: 23.53 },
  ];

  // Calculate cost to fill vehicle tank to brim (100%)
  const fuelNeededPercent = vehicleState ? Math.max(0, 100 - vehicleState.fuel) : 0;
  const litersNeeded = Number(((fuelNeededPercent / 100) * 60).toFixed(2)); // 60L capacity
  const costToFillBrim = Math.ceil(litersNeeded * pricePerLiter);

  const handleDispenseFuel = (amount: number) => {
    if (isDispensing) return;
    if (stats.money < amount) {
      setFeedback({
        type: 'error',
        message: `Insufficient money! You need ₦${amount.toLocaleString()} but have ₦${stats.money.toLocaleString()}`,
      });
      return;
    }

    if (selectedProduct === 'car' && vehicleState && vehicleState.fuel >= 99) {
      setFeedback({
        type: 'error',
        message: 'Your vehicle fuel tank is already 100% full to the brim!',
      });
      return;
    }

    setIsDispensing(true);
    setFeedback(null);
    soundEngine.playCarHorn();

    // Dispensing animation with live meter rolling
    let currentLiters = 0;
    const targetLiters = selectedProduct === 'jerrycan' ? 25 : Number((amount / pricePerLiter).toFixed(2));
    const step = targetLiters / 20;

    const interval = setInterval(() => {
      currentLiters += step;
      if (currentLiters >= targetLiters) {
        currentLiters = targetLiters;
        clearInterval(interval);
        finishDispensing(amount, targetLiters);
      }
      setDispensedLiters(Number(currentLiters.toFixed(2)));
      setDispensedCost(Math.round(currentLiters * pricePerLiter));
    }, 50);
  };

  const finishDispensing = (amount: number, liters: number) => {
    setIsDispensing(false);

    if (selectedProduct === 'car') {
      const res = gameState.buyFuelStation(amount, paymentMethod);
      if (res.success) {
        soundEngine.playCashSound();
        const fuelGainPercent = (liters / 60) * 100;
        const newFuel = Math.min(100, (vehicleState ? vehicleState.fuel : 0) + fuelGainPercent);
        onRefueledVehicle(newFuel);
        setFeedback({
          type: 'success',
          message: `Pump Attendant: "Oga tank don full with ${liters}L of PMS! Meter confirmed at ₦${amount.toLocaleString()}."`,
        });
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } else {
      // 25L Jerrycan for generator
      const res = gameState.buyGeneratorJerrycan(paymentMethod);
      if (res.success) {
        soundEngine.playCashSound();
        setFeedback({
          type: 'success',
          message: `25-Litre Jerrycan loaded! Home and office generator reserve filled to 100%.`,
        });
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-emerald-500/30 bg-zinc-950 text-white shadow-2xl">
        {/* Canopy Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-zinc-900 to-amber-900 px-6 py-5 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
                <Fuel className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-wide text-white">{stationName}</h2>
                <div className="flex items-center gap-2 text-xs text-emerald-300 font-mono">
                  <span>PMS: ₦{pricePerLiter}/Litre</span>
                  <span>•</span>
                  <span>METER CALIBRATED</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-zinc-800/80 p-2 text-zinc-400 hover:bg-zinc-700 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Target Product Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedProduct('car')}
              className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                selectedProduct === 'car'
                  ? 'border-emerald-500 bg-emerald-950/40 text-white ring-1 ring-emerald-500/50'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <Gauge className="h-5 w-5 text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-white">Car Fuel Tank</div>
                <div className="text-[10px] text-zinc-400">
                  {vehicleState ? `${Math.round(vehicleState.fuel)}% Full (60L Tank)` : 'Parked Sedan'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedProduct('jerrycan')}
              className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                selectedProduct === 'jerrycan'
                  ? 'border-amber-500 bg-amber-950/40 text-white ring-1 ring-amber-500/50'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <Droplet className="h-5 w-5 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-white">25L Jerrycan (Keg)</div>
                <div className="text-[10px] text-zinc-400">
                  Gen Reserve ({Math.round(stats.generatorFuel)}%)
                </div>
              </div>
            </button>
          </div>

          {/* Current Status Gauge Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                {selectedProduct === 'car' ? 'Vehicle Fuel Tank Level' : 'Home Generator Fuel'}
              </span>
              <span className="font-mono text-emerald-400 font-bold text-sm">
                {selectedProduct === 'car' ? `${Math.round(currentFuel)}%` : `${Math.round(stats.generatorFuel)}%`}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-2 h-3.5 w-full overflow-hidden rounded-full bg-zinc-950 border border-zinc-800">
              <div
                className={`h-full transition-all duration-500 ${
                  (selectedProduct === 'car' ? currentFuel : stats.generatorFuel) > 40
                    ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                    : (selectedProduct === 'car' ? currentFuel : stats.generatorFuel) > 15
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-red-600 to-rose-400 animate-pulse'
                }`}
                style={{
                  width: `${Math.min(100, Math.max(4, selectedProduct === 'car' ? currentFuel : stats.generatorFuel))}%`,
                }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>E (Empty)</span>
              <span>1/2 Tank</span>
              <span>F (Full)</span>
            </div>
          </div>

          {/* Interactive Dispensing Meter (When Dispensing) */}
          {isDispensing && (
            <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/30 p-5 text-center space-y-2 animate-pulse">
              <div className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                DISPENSING FUEL AT PUMP NOZZLE
              </div>
              <div className="flex items-center justify-center gap-6">
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase">Volume (Liters)</div>
                  <div className="font-mono text-3xl font-black text-white">{dispensedLiters} L</div>
                </div>
                <div className="h-8 w-px bg-zinc-800" />
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase">Amount Due</div>
                  <div className="font-mono text-3xl font-black text-amber-400">
                    ₦{dispensedCost.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-xs text-zinc-400 italic">"Attendant: Oga see meter dey roll smooth!"</div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400">Payment:</span>
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                paymentMethod === 'cash'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <Banknote className="h-3.5 w-3.5" /> Cash (₦{stats.money.toLocaleString()})
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('transfer')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                paymentMethod === 'transfer'
                  ? 'bg-amber-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" /> GTBank Transfer / POS
            </button>
          </div>

          {/* Product Purchase Options */}
          {selectedProduct === 'car' ? (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Select Purchase Amount:
              </div>

              {/* Quick Fill Preset Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                {quickVehicleAmounts.map((q) => (
                  <button
                    key={q.amount}
                    disabled={isDispensing || stats.money < q.amount}
                    onClick={() => handleDispenseFuel(q.amount)}
                    className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3 text-left transition hover:border-emerald-500 hover:bg-zinc-800 disabled:opacity-40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base font-black text-white">{q.label}</span>
                      <span className="rounded-md bg-emerald-950 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 font-mono">
                        +{q.liters} L
                      </span>
                    </div>
                    <span className="mt-1 text-[10px] text-zinc-400">
                      ~{Math.round((q.liters / 60) * 100)}% tank boost
                    </span>
                  </button>
                ))}
              </div>

              {/* Fill Tank to Brim Button */}
              {costToFillBrim > 0 && (
                <button
                  disabled={isDispensing || stats.money < costToFillBrim || currentFuel >= 98}
                  onClick={() => handleDispenseFuel(costToFillBrim)}
                  className="w-full flex items-center justify-between rounded-2xl border border-emerald-500/50 bg-gradient-to-r from-emerald-900/50 to-zinc-900 p-3.5 hover:from-emerald-900/80 hover:to-zinc-800 transition disabled:opacity-40"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-5 w-5 text-emerald-400" />
                    <div className="text-left">
                      <div className="text-xs font-bold text-white">Fill Tank to Brim (100%)</div>
                      <div className="text-[10px] text-emerald-300">
                        Needs {litersNeeded} Litres to reach full capacity
                      </div>
                    </div>
                  </div>
                  <div className="font-mono text-sm font-black text-white">
                    ₦{costToFillBrim.toLocaleString()}
                  </div>
                </button>
              )}

              {/* Custom Naira Amount */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  placeholder="Custom ₦ amount..."
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  disabled={isDispensing || !customAmount || Number(customAmount) < 500}
                  onClick={() => {
                    handleDispenseFuel(Number(customAmount));
                    setCustomAmount('');
                  }}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition disabled:opacity-40"
                >
                  Dispense
                </button>
              </div>
            </div>
          ) : (
            /* 25L Jerrycan for Generator */
            <div className="space-y-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white font-black">
                  25L
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Yellow 25-Litre Fuel Jerrycan (Keg)</h4>
                  <p className="mt-0.5 text-xs text-zinc-300">
                    Essential for Lagos living. Power your home generator during NEPA grid blackouts.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-zinc-900/80 p-3 border border-zinc-800">
                <span className="text-xs text-zinc-400">Total Price (25 Litres @ ₦850/L):</span>
                <span className="font-mono text-base font-black text-amber-400">₦21,250</span>
              </div>

              <button
                disabled={isDispensing || stats.money < 21250}
                onClick={() => handleDispenseFuel(21250)}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 py-3 text-xs font-bold text-white shadow-lg hover:from-amber-500 hover:to-amber-600 transition disabled:opacity-40"
              >
                {isDispensing ? 'Dispensing Jerrycan...' : 'Buy 25L Jerrycan & Fill Generator'}
              </button>
            </div>
          )}

          {/* Feedback message */}
          {feedback && (
            <div
              className={`rounded-2xl p-3.5 text-xs flex items-center gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/80 border border-red-500/40 text-red-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>

        {/* Footer Close Button */}
        <div className="bg-zinc-950 px-6 py-4 border-t border-zinc-900 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500">
            Current Cash in Wallet: <strong className="text-white">₦{stats.money.toLocaleString()}</strong>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-zinc-800 px-5 py-2 text-xs font-bold text-white hover:bg-zinc-700 transition"
          >
            Done & Leave Station
          </button>
        </div>
      </div>
    </div>
  );
};
