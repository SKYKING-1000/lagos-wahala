import { FoodItem, InventoryItem, PlayerStats, WahalaEvent } from '../types/game';

export const LAGOS_FOOD_MENU: FoodItem[] = [
  {
    id: 'jollof_chicken',
    name: 'Party Jollof Rice & Fried Chicken',
    category: 'meal',
    price: 1800,
    hungerRestore: 45,
    energyRestore: 30,
    description: 'Smoky firewood party jollof with tender seasoned fried chicken and fried dodo (plantain).',
    vendorType: 'buka',
  },
  {
    id: 'amala_ewedu',
    name: 'Amala, Ewedu & Assorted Goat Meat',
    category: 'swallow',
    price: 2200,
    hungerRestore: 55,
    energyRestore: 35,
    description: 'Hot fluffy black amala drenched in green ewedu and yellow gbegiri, topped with shaki and goat meat.',
    vendorType: 'buka',
  },
  {
    id: 'eba_egusi',
    name: 'Ijebu Garri Eba & Rich Egusi Soup',
    category: 'swallow',
    price: 1500,
    hungerRestore: 50,
    energyRestore: 25,
    description: 'Yellow eba served with melon egusi loaded with smoked fish and bitterleaf.',
    vendorType: 'buka',
  },
  {
    id: 'akara_bread',
    name: 'Hot Akara & Warm Agege Bread',
    category: 'snack',
    price: 600,
    hungerRestore: 25,
    energyRestore: 20,
    description: 'Freshly fried golden bean cakes stuffed inside pillowy sweet Agege bread.',
    vendorType: 'hawker',
  },
  {
    id: 'gala_lacasera',
    name: 'Gala Sausage Roll & Cold LaCasera',
    category: 'snack',
    price: 500,
    hungerRestore: 20,
    energyRestore: 15,
    description: 'The indisputable king of Lagos traffic snacks. Best eaten while stuck in Third Mainland go-slow.',
    vendorType: 'hawker',
  },
  {
    id: 'spicy_suya',
    name: 'Spicy Beef Suya with Onions',
    category: 'meal',
    price: 1600,
    hungerRestore: 35,
    energyRestore: 25,
    description: 'Thinly sliced charcoal-grilled beef spiced with Yaji pepper, served with red onions and tomatoes.',
    vendorType: 'buka',
  },
  {
    id: 'meatpie_malt',
    name: 'Flaky Meat Pie & Chilled Maltina',
    category: 'snack',
    price: 900,
    hungerRestore: 30,
    energyRestore: 20,
    description: 'Crispy butter pastry stuffed with seasoned minced meat and potatoes, washed down with dark malt.',
    vendorType: 'fastfood',
  },
  {
    id: 'swan_water',
    name: 'Chilled Bottled Spring Water',
    category: 'drink',
    price: 200,
    hungerRestore: 5,
    energyRestore: 15,
    description: 'Pure cold water to beat the Lagos midday tropical sun.',
    vendorType: 'hawker',
  },
];

export const LAGOS_WAHALA_EVENTS: WahalaEvent[] = [
  {
    id: 'nepa_strike',
    title: 'Up NEPA! Power Outage in Ikeja',
    description: 'The National Grid just tripped. Your fans and AC powered down immediately. The estate sounds with the roar of generators.',
    severity: 'moderate',
    options: [
      {
        label: 'Switch on "I Better Pass My Neighbour" Generator (-₦1,500 fuel)',
        cost: 1500,
        effectMessage: 'Generator roared to life! Fan spinning, phone charging restored.',
      },
      {
        label: 'Endure the heat and sleep with windows open (-15 Energy)',
        staminaCost: 15,
        effectMessage: 'Mosquitoes and warm humid Lagos air reduced your sleep quality.',
      },
    ],
  },
  {
    id: 'traffic_jam',
    title: 'Serious Go-Slow on Ikorodu Road Corridor',
    description: 'A broken-down 40-foot container truck has locked 3 lanes ahead of Maryland. Horns are blaring everywhere!',
    severity: 'moderate',
    options: [
      {
        label: 'Follow Danfo bus driver taking service lane shortcut (+15 min delay)',
        timePenaltyMin: 15,
        effectMessage: 'The danfo driver squeezed through the ditch and bypassed the heaviest bottleneck!',
      },
      {
        label: 'Buy Gala & Lacasera from traffic hawkers (-₦500)',
        cost: 500,
        effectMessage: 'Hunger satisfied while you patiently waited in the air-conditioned car.',
      },
    ],
  },
  {
    id: 'lastma_stop',
    title: 'Vehicle Inspection Checkpoint Ahead',
    description: 'Officers are waving down private vehicles to check roadworthiness, fire extinguisher and valid MOT papers.',
    severity: 'minor',
    options: [
      {
        label: 'Present complete vehicle particulars politely',
        effectMessage: '"All papers complete, Oga. Safe journey and salute your family!"',
      },
      {
        label: 'Greet the officer warmly and offer cold bottled water (-₦200)',
        cost: 200,
        effectMessage: 'Officer smiled warmly: "Chairman! More blessings on your business today!"',
      },
    ],
  },
  {
    id: 'rain_storm',
    title: 'Sudden Tropical Lagos Downpour',
    description: 'Dark clouds opened up with thunder. Rain is pounding windshields, and roadside gutters are flowing fast.',
    severity: 'moderate',
    options: [
      {
        label: 'Drive at cautious 30 km/h with hazard lights on',
        timePenaltyMin: 10,
        effectMessage: 'Safe driving kept you out of roadside puddles and hydroplaning.',
      },
      {
        label: 'Pull over by Mama Put buka stall to wait out the worst of the rain',
        timePenaltyMin: 20,
        effectMessage: 'Enjoyed hot piping pepper soup while listening to rain hitting the zinc roof.',
      },
    ],
  },
];

const INITIAL_STATS: PlayerStats = {
  money: 35000, // ₦35,000 starting cash
  hunger: 20, // 20% hungry (need breakfast!)
  energy: 90, // rested from bed
  phoneBattery: 88,
  timeMinutes: 360, // 6:00 AM
  day: 1,
  workDoneToday: 0,
  salaryEarnedToday: 0,
  homePowerOn: true,
  generatorFuel: 70,
  isOnShift: false,
  shiftStartTime: null,
  shiftPunctualityBonus: 0,
  shiftLatePenalty: 0,
  shiftTasksCompleted: 0,
  shiftEarnings: 0,
  officePowerState: 'grid',
  deviceMode: 'laptop',
};

export class GameStateManager {
  private stats: PlayerStats = { ...INITIAL_STATS };
  private inventory: InventoryItem[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadState();
  }

  public getStats(): PlayerStats {
    return { ...this.stats };
  }

  public getInventory(): InventoryItem[] {
    return [...this.inventory];
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
    this.saveState();
  }

  public updateTime(deltaSeconds: number) {
    // 1 real second = 1.2 in-game minutes (full day ~ 20 real minutes)
    const minutesDelta = deltaSeconds * 1.2;
    this.stats.timeMinutes += minutesDelta;

    // Natural hunger build-up
    this.stats.hunger = Math.min(100, this.stats.hunger + deltaSeconds * 0.08);

    // Subtle phone battery drain
    this.stats.phoneBattery = Math.max(0, this.stats.phoneBattery - deltaSeconds * 0.02);

    // If past midnight (1440 min), advance day
    if (this.stats.timeMinutes >= 1440) {
      this.stats.timeMinutes -= 1440;
      this.stats.day += 1;
      this.stats.workDoneToday = 0;
      this.stats.salaryEarnedToday = 0;
      this.stats.isOnShift = false;
      this.stats.shiftStartTime = null;
      this.stats.shiftTasksCompleted = 0;
      this.stats.shiftEarnings = 0;
    }

    this.notify();
  }

  public buyFood(item: FoodItem, quantity: number = 1): boolean {
    const totalCost = item.price * quantity;
    if (this.stats.money < totalCost) return false;

    this.stats.money -= totalCost;
    const existing = this.inventory.find((i) => i.foodId === item.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.inventory.push({
        id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        foodId: item.id,
        name: item.name,
        quantity,
      });
    }

    this.notify();
    return true;
  }

  public eatFood(inventoryItemId: string): boolean {
    const itemIdx = this.inventory.findIndex((i) => i.id === inventoryItemId);
    if (itemIdx === -1) return false;

    const inv = this.inventory[itemIdx];
    const food = LAGOS_FOOD_MENU.find((f) => f.id === inv.foodId);
    if (!food) return false;

    // Apply benefits
    this.stats.hunger = Math.max(0, this.stats.hunger - food.hungerRestore);
    this.stats.energy = Math.min(100, this.stats.energy + food.energyRestore);

    inv.quantity -= 1;
    if (inv.quantity <= 0) {
      this.inventory.splice(itemIdx, 1);
    }

    this.notify();
    return true;
  }

  public refuelVehicle(nairaAmount: number): number {
    const fuelLiters = Math.min(this.stats.money, nairaAmount);
    this.stats.money -= fuelLiters;
    this.notify();
    return fuelLiters;
  }

  public setDeviceMode(mode: 'mobile' | 'laptop') {
    this.stats.deviceMode = mode;
    try {
      localStorage.setItem('lagos_survival_device_mode', mode);
    } catch {
      // ignore
    }
    this.notify();
  }

  public clockInOffice(): { onTime: boolean; bonus: number; penalty: number; message: string } {
    if (this.stats.isOnShift) {
      return { onTime: true, bonus: 0, penalty: 0, message: 'Already clocked in for this shift!' };
    }

    this.stats.isOnShift = true;
    this.stats.shiftStartTime = this.stats.timeMinutes;
    this.stats.shiftTasksCompleted = 0;
    this.stats.shiftEarnings = 0;

    // 9:00 AM is 540 minutes from midnight
    const isEarlyOrOnTime = this.stats.timeMinutes <= 540;
    let bonus = 0;
    let penalty = 0;
    let msg = '';

    if (isEarlyOrOnTime) {
      bonus = 5000;
      this.stats.shiftPunctualityBonus = bonus;
      this.stats.shiftLatePenalty = 0;
      this.stats.money += bonus;
      msg = 'Punctual arrival! Boss Oga Femi applauded your dedication: +₦5,000 Early Arrival Bonus!';
      this.addGTBankNotification('CREDIT ALERT', 'Punctuality Bonus (PayLagos): +₦5,000');
    } else {
      const lateMins = Math.round(this.stats.timeMinutes - 540);
      penalty = 2500;
      this.stats.shiftPunctualityBonus = 0;
      this.stats.shiftLatePenalty = penalty;
      this.stats.money = Math.max(0, this.stats.money - penalty);
      msg = `Arrived ${lateMins} mins late due to Lagos traffic. Late deduction applied: -₦2,500.`;
      this.addGTBankNotification('DEBIT ALERT', 'Late Arrival Penalty (PayLagos): -₦2,500');
    }

    this.notify();
    return { onTime: isEarlyOrOnTime, bonus, penalty, message: msg };
  }

  public completeWorkTask(taskTitle: string, payout: number) {
    this.stats.money += payout;
    this.stats.salaryEarnedToday += payout;
    this.stats.workDoneToday += 1;
    this.stats.shiftTasksCompleted += 1;
    this.stats.shiftEarnings += payout;
    this.stats.energy = Math.max(8, this.stats.energy - 14);
    this.stats.timeMinutes += 40; // 40 minutes of productive office work
    this.addGTBankNotification('CREDIT ALERT', `Task Paid (${taskTitle.slice(0, 24)}...): +₦${payout.toLocaleString()}`);
    this.notify();
  }

  public clockOutOffice(): { totalPayout: number; tasksCount: number } {
    const earnings = this.stats.shiftEarnings;
    const count = this.stats.shiftTasksCompleted;
    this.stats.isOnShift = false;
    this.stats.shiftStartTime = null;
    this.stats.timeMinutes += 15; // packing up bag
    this.notify();
    return { totalPayout: earnings, tasksCount: count };
  }

  public officeCoffeeBreak(): boolean {
    if (this.stats.energy >= 95) return false;
    this.stats.energy = Math.min(100, this.stats.energy + 20);
    this.stats.timeMinutes += 10;
    this.notify();
    return true;
  }

  public boostEnergy(amount: number) {
    this.stats.energy = Math.min(100, this.stats.energy + amount);
    this.notify();
  }

  public officePantrySnack(): boolean {
    if (this.stats.hunger <= 10) return false;
    this.stats.hunger = Math.max(5, this.stats.hunger - 25);
    this.stats.energy = Math.min(100, this.stats.energy + 10);
    this.stats.timeMinutes += 15;
    this.notify();
    return true;
  }

  public toggleOfficeGenerator(): 'grid' | 'generator' | 'blackout' {
    if (this.stats.officePowerState === 'blackout') {
      this.stats.officePowerState = 'generator';
    } else if (this.stats.officePowerState === 'generator') {
      this.stats.officePowerState = 'grid';
    } else {
      this.stats.officePowerState = 'blackout';
    }
    this.notify();
    return this.stats.officePowerState;
  }

  // Bank notifications and transfer history
  private bankAlerts: { id: string; type: string; details: string; time: string }[] = [];
  private transferHistory: any[] = [];

  public getBankAlerts() {
    return [...this.bankAlerts];
  }

  public getTransferHistory() {
    return [...this.transferHistory];
  }

  public transferMoney(
    recipientName: string,
    bankName: string,
    accountNumber: string,
    amount: number,
    narration: string = 'Transfer via GTWorld',
    fee: number = 10
  ): { success: boolean; message: string; record?: any } {
    const totalDeduction = amount + fee;
    if (this.stats.money < totalDeduction) {
      return {
        success: false,
        message: `Insufficient funds. Needed: ₦${totalDeduction.toLocaleString()}, Balance: ₦${this.stats.money.toLocaleString()}`,
      };
    }

    this.stats.money -= totalDeduction;
    const ref = `TRF/GTB/${Date.now().toString().slice(-6)}/${Math.floor(1000 + Math.random() * 9000)}`;
    const time = this.getFormattedTime();

    const record = {
      id: `trf_${Date.now()}`,
      reference: ref,
      recipientName,
      bankName,
      accountNumber,
      amount,
      fee,
      narration,
      timestamp: time,
      status: 'SUCCESSFUL',
    };

    this.transferHistory.unshift(record);
    if (this.transferHistory.length > 25) this.transferHistory.pop();

    const maskedAcct = `${accountNumber.slice(0, 3)}****${accountNumber.slice(-3)}`;
    this.addGTBankNotification(
      'DEBIT ALERT',
      `TRF to ${recipientName} (${bankName} - ${maskedAcct}): -₦${amount.toLocaleString()} (Fee: ₦${fee}). Bal: ₦${this.stats.money.toLocaleString()}`
    );

    this.notify();
    return { success: true, message: 'Transfer successful!', record };
  }

  public buyFuelStation(
    nairaAmount: number,
    paymentMethod: 'cash' | 'transfer' = 'cash'
  ): { success: boolean; liters: number; cost: number; message: string } {
    if (this.stats.money < nairaAmount) {
      return {
        success: false,
        liters: 0,
        cost: 0,
        message: `Insufficient funds! Needed: ₦${nairaAmount.toLocaleString()}, You have: ₦${this.stats.money.toLocaleString()}`,
      };
    }

    const pricePerLiter = 850; // Current Lagos PMS pump price ₦850/L
    const liters = Number((nairaAmount / pricePerLiter).toFixed(2));
    this.stats.money -= nairaAmount;

    if (paymentMethod === 'transfer') {
      this.addGTBankNotification(
        'DEBIT ALERT',
        `POS / Web Pay (Oando Filling Station): -₦${nairaAmount.toLocaleString()} for ${liters}L PMS. Bal: ₦${this.stats.money.toLocaleString()}`
      );
    }

    this.notify();
    return {
      success: true,
      liters,
      cost: nairaAmount,
      message: `Dispensed ${liters} Litres of PMS fuel!`,
    };
  }

  public buyGeneratorJerrycan(paymentMethod: 'cash' | 'transfer' = 'cash'): {
    success: boolean;
    cost: number;
    message: string;
  } {
    const cost = 21250; // 25 Litres @ ₦850/L
    if (this.stats.money < cost) {
      return {
        success: false,
        cost,
        message: `Insufficient money for 25L Jerrycan (₦${cost.toLocaleString()})`,
      };
    }

    this.stats.money -= cost;
    this.stats.generatorFuel = 100; // Tank brim filled
    this.stats.homePowerOn = true;

    if (paymentMethod === 'transfer') {
      this.addGTBankNotification(
        'DEBIT ALERT',
        `POS Fuel Station (25L Jerrycan Gen Fuel): -₦${cost.toLocaleString()}. Home & Office Gen topped to 100%!`
      );
    }

    this.notify();
    return {
      success: true,
      cost,
      message: '25L Jerrycan purchased! Generator fuel filled to 100%. Home power active!',
    };
  }

  private getFormattedTime(): string {
    const hours = Math.floor(this.stats.timeMinutes / 60) % 24;
    const minutes = Math.floor(this.stats.timeMinutes % 60);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  public addGTBankNotification(type: string, details: string) {
    const time = this.getFormattedTime();
    this.bankAlerts.unshift({
      id: `alert_${Date.now()}_${Math.random()}`,
      type,
      details,
      time,
    });
    if (this.bankAlerts.length > 25) this.bankAlerts.pop();
  }

  public sleepAtHome() {
    this.stats.hunger = Math.min(100, this.stats.hunger + 15);
    this.stats.energy = 100;
    this.stats.phoneBattery = 100; // Charged overnight
    this.stats.timeMinutes = 360; // 6:00 AM next morning
    this.stats.day += 1;
    this.stats.workDoneToday = 0;
    this.stats.salaryEarnedToday = 0;
    this.stats.isOnShift = false;
    this.stats.shiftStartTime = null;
    this.stats.shiftTasksCompleted = 0;
    this.stats.shiftEarnings = 0;
    this.notify();
  }

  public applyWahalaChoice(cost?: number, staminaCost?: number, timePenaltyMin?: number) {
    if (cost) this.stats.money = Math.max(0, this.stats.money - cost);
    if (staminaCost) this.stats.energy = Math.max(0, this.stats.energy - staminaCost);
    if (timePenaltyMin) this.stats.timeMinutes += timePenaltyMin;
    this.notify();
  }

  private saveState() {
    try {
      localStorage.setItem('lagos_survival_stats', JSON.stringify(this.stats));
      localStorage.setItem('lagos_survival_inventory', JSON.stringify(this.inventory));
      if (this.stats.deviceMode) {
        localStorage.setItem('lagos_survival_device_mode', this.stats.deviceMode);
      }
    } catch {
      // LocalStorage fallback
    }
  }

  private loadState() {
    try {
      const savedDevice = localStorage.getItem('lagos_survival_device_mode') as 'mobile' | 'laptop' | null;
      if (savedDevice === 'mobile' || savedDevice === 'laptop') {
        this.stats.deviceMode = savedDevice;
      }
      const savedStats = localStorage.getItem('lagos_survival_stats');
      if (savedStats) {
        this.stats = { ...INITIAL_STATS, ...JSON.parse(savedStats), ...(savedDevice ? { deviceMode: savedDevice } : {}) };
      }
      const savedInv = localStorage.getItem('lagos_survival_inventory');
      if (savedInv) {
        this.inventory = JSON.parse(savedInv);
      }
    } catch {
      // Fallback to fresh defaults
    }
  }
}

export const gameState = new GameStateManager();
