import React, { useState } from 'react';
import { Utensils, X, ShoppingBag, Zap, Heart } from 'lucide-react';
import { LAGOS_FOOD_MENU, gameState } from '../game/gameState';
import { FoodItem } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface BukaShopModalProps {
  onClose: () => void;
  vendorName?: string;
}

export const BukaShopModal: React.FC<BukaShopModalProps> = ({ onClose, vendorName = "Mama Ngozi's Buka" }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'meal' | 'swallow' | 'snack' | 'drink'>('all');
  const [message, setMessage] = useState<string | null>(null);
  const stats = gameState.getStats();

  const filteredItems = selectedCategory === 'all'
    ? LAGOS_FOOD_MENU
    : LAGOS_FOOD_MENU.filter((f) => f.category === selectedCategory);

  const handleBuyAndEat = (item: FoodItem) => {
    if (stats.money < item.price) {
      setMessage(`Oga, your money no reach! You need ₦${item.price.toLocaleString()}`);
      return;
    }

    const bought = gameState.buyFood(item, 1);
    if (bought) {
      const inv = gameState.getInventory();
      const lastItem = inv[inv.length - 1];
      if (lastItem) {
        gameState.eatFood(lastItem.id);
      }
      soundEngine.playEatSound();
      soundEngine.playCashSound();
      setMessage(`Delicious! You enjoyed ${item.name}. Hunger reduced!`);
    }
  };

  const handleBuyToBag = (item: FoodItem) => {
    if (stats.money < item.price) {
      setMessage(`Oga, your money no reach! You need ₦${item.price.toLocaleString()}`);
      return;
    }

    const bought = gameState.buyFood(item, 1);
    if (bought) {
      soundEngine.playCashSound();
      setMessage(`Packed ${item.name} into your bag.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-amber-500/40 bg-zinc-900 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-amber-950/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-inner">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-amber-200">{vendorName}</h2>
              <p className="text-xs text-amber-400/80">Hot Lagos Street Delicacies • Fast Service</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-zinc-800 px-3 py-1.5 font-mono text-sm font-semibold text-emerald-400 border border-emerald-500/30">
              ₦{stats.money.toLocaleString()}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {message && (
          <div className="bg-amber-500/20 px-6 py-2.5 text-xs font-medium text-amber-200 border-b border-amber-500/30">
            {message}
          </div>
        )}

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto border-b border-zinc-800 px-6 py-3">
          {(['all', 'meal', 'swallow', 'snack', 'drink'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Items' : cat}
            </button>
          ))}
        </div>

        {/* Food Items List */}
        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-800/50 p-4 transition hover:border-amber-500/40 sm:flex-row sm:items-center"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-zinc-100">{item.name}</h4>
                  <span className="rounded-md bg-amber-900/60 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                    {item.category}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">{item.description}</p>
                <div className="mt-2 flex items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Heart className="h-3.5 w-3.5" /> -{item.hungerRestore}% Hunger
                  </span>
                  <span className="flex items-center gap-1 text-sky-400">
                    <Zap className="h-3.5 w-3.5" /> +{item.energyRestore}% Energy
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                <div className="font-mono text-base font-bold text-amber-300">
                  ₦{item.price.toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBuyToBag(item)}
                    className="flex items-center gap-1 rounded-lg bg-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-600"
                    title="Pack in inventory"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" /> Pack
                  </button>
                  <button
                    onClick={() => handleBuyAndEat(item)}
                    className="flex items-center gap-1 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-500"
                  >
                    <Utensils className="h-3.5 w-3.5" /> Eat Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between border-t border-zinc-800 bg-zinc-950 px-6 py-3 text-xs text-zinc-400">
          <span>Hunger: {Math.round(stats.hunger)}% (High = Hungry)</span>
          <span>Energy: {Math.round(stats.energy)}%</span>
        </div>
      </div>
    </div>
  );
};
