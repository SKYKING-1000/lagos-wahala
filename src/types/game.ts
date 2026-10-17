export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export type ZoneId = 'ikeja' | 'yaba' | 'vi' | 'lekki';

export interface ZoneInfo {
  id: ZoneId;
  name: string;
  subtitle: string;
  center: Position3D;
  description: string;
  color: string;
}

export interface RoadNode {
  id: string;
  x: number;
  z: number;
  connections: string[];
  zone: ZoneId;
  name?: string;
}

export interface Landmark {
  id: string;
  name: string;
  zone: ZoneId;
  type: 'home' | 'office' | 'buka' | 'fuel' | 'market' | 'mechanic' | 'bank' | 'landmark';
  position: Position3D;
  description: string;
  icon?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: 'meal' | 'swallow' | 'snack' | 'drink';
  price: number; // In Naira
  hungerRestore: number;
  energyRestore: number;
  description: string;
  vendorType: 'buka' | 'hawker' | 'fastfood' | 'bar';
}

export interface InventoryItem {
  id: string;
  foodId: string;
  name: string;
  quantity: number;
}

export interface VehicleState {
  id: string;
  model: 'sedan' | 'danfo' | 'keke' | 'suv';
  x: number;
  y: number;
  z: number;
  rotationY: number;
  speed: number;
  steering: number;
  fuel: number; // 0 - 100%
  maxFuel: number;
  isPlayerInside: boolean;
  isEngineOn: boolean;
  headlightsOn: boolean;
}

export interface TrafficCondition {
  level: number; // 0.0 (empty) to 1.0 (heavy go-slow)
  status: 'Free Flow' | 'Moderate Traffic' | 'Heavy Rush Hour' | 'Lagos Go-Slow Gridlock';
  speedMultiplier: number;
  description: string;
  isRushHour: boolean;
  peakCorridor: string;
}

export interface AITrafficVehicle {
  id: string;
  type: 'danfo' | 'sedan' | 'keke' | 'brt' | 'bike';
  nodeIndex: number;
  targetNodeId: string;
  currentNodeId: string;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  speed: number;
  maxSpeed: number;
  laneOffset: number; // Offset from road centerline (-2.2m to +2.2m)
  segmentProgress: number; // 0.0 to 1.0 along current road segment
  isAccident: boolean;
  accidentTimer: number;
  impactVelocity?: { x: number; z: number };
  hazardBlinking?: boolean;
  driverPersonality?: 'aggressive' | 'cautious' | 'standard' | 'commercial';
  passengerStopTimer?: number;
  isPassengerStopping?: boolean;
  isBraking?: boolean;
}

export interface WahalaEvent {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'major';
  options: {
    label: string;
    cost?: number;
    staminaCost?: number;
    timePenaltyMin?: number;
    effectMessage: string;
  }[];
}

export type WeatherType = 'clear' | 'sunny' | 'cloudy' | 'rain' | 'heavy_rain';

export interface PlayerStats {
  money: number; // In Naira ₦
  hunger: number; // 0 (full) to 100 (starving)
  energy: number; // 0 to 100
  phoneBattery: number; // 0 to 100
  timeMinutes: number; // 360 = 6:00 AM (minutes since midnight)
  day: number;
  workDoneToday: number;
  salaryEarnedToday: number;
  homePowerOn: boolean;
  generatorFuel: number; // 0 - 100%
  // Workplace shift state
  isOnShift: boolean;
  shiftStartTime: number | null;
  shiftPunctualityBonus: number;
  shiftLatePenalty: number;
  shiftTasksCompleted: number;
  shiftEarnings: number;
  officePowerState: 'grid' | 'generator' | 'blackout';
  deviceMode: 'mobile' | 'laptop';
}

export type DeviceMode = 'mobile' | 'laptop';

export interface ChatMessage {
  id: string;
  from: 'them' | 'me' | 'system';
  text: string;
  time: string;
}

export interface ChatReplyOption {
  text: string;
  replyResponse: string;
  moneyChange?: number;
  energyChange?: number;
  callbackAction?: string;
}

export interface ChatContact {
  id: string;
  name: string;
  category: 'nearby' | 'distant';
  role: string;
  locationTag?: string; // e.g. "Ikeja GRA Estate", "Yaba Tech Hub", "Street Vendor"
  avatarBg: string;
  preview: string;
  unread: boolean;
  messages: ChatMessage[];
}

export interface BankTransferRecord {
  id: string;
  reference: string;
  recipientName: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  fee: number;
  narration: string;
  timestamp: string;
  status: 'SUCCESSFUL' | 'PENDING' | 'FAILED';
}

export interface TransferBeneficiary {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  tag: string;
  avatarBg: string;
  category: 'family' | 'work' | 'artisan' | 'bills';
  suggestedAmounts: number[];
  note: string;
  responseMessage: string;
  energyBonus?: number;
}
