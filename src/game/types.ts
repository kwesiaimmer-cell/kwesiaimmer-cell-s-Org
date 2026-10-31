/**
 * AIMMER HOUSE TYCOON - Type Definitions
 */

export type PlotStage = 0 | 1 | 2 | 3 | 4 | 5;

export interface PlotData {
  id: string;
  name: string;
  address: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  price: number;
  isOwned: boolean;
  stage: PlotStage; // 0: Empty, 1: Foundation, 2: Framing, 3: Exterior & Roof, 4: Furnished, 5: Luxury Estate (Pool & Garden)
  style: 'modern' | 'craftsman' | 'coastal' | 'luxury_mansion';
  wallColor: string;
  roofColor: string;
  rented: boolean;
  tenantName?: string;
  tenantType?: string;
  rentPerMin: number;
  accumulatedRent: number;
  lastRentCollectedTime: number;
  marketValue: number;
  renovations: number;
}

export interface VehicleData {
  id: string;
  name: string;
  category: 'sedan' | 'sports' | 'suv' | 'hypercar';
  price: number;
  speed: number;
  acceleration: number;
  color: string;
  isOwned: boolean;
  unlockedLevel: number;
  description: string;
}

export interface BusinessData {
  id: string;
  name: string;
  category: string;
  cost: number;
  incomePerMin: number;
  isOwned: boolean;
  unlockedLevel: number;
  iconName: string;
  description: string;
}

export interface MissionData {
  id: string;
  stage: number; // 1 to 5
  title: string;
  description: string;
  rewardMoney: number;
  rewardXp: number;
  isCompleted: boolean;
  progress: number;
  maxProgress: number;
  targetType: 'buy_plot' | 'build_house' | 'furnish_house' | 'rent_house' | 'earn_money' | 'own_vehicles' | 'invest_business' | 'luxury_mansion';
}

export interface GameSettings {
  sfxVolume: number;
  musicVolume: number;
  dayNightSpeed: number; // 1 = normal (approx 3 min cycle), 0 = paused
  autoTime: boolean;
  graphicsQuality: 'high' | 'medium' | 'low';
}

export interface PlayerStats {
  money: number;
  level: number;
  xp: number;
  xpNeeded: number;
  currentStage: number; // 1: Beginner, 2: Homeowner, 3: Investor, 4: Developer, 5: Tycoon
  totalRentEarned: number;
  totalHousesBuilt: number;
  totalPropertiesOwned: number;
  totalSpent: number;
}
