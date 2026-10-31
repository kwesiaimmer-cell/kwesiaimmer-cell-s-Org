/**
 * AIMMER HOUSE TYCOON - Tycoon Economy, Progression & Save System
 */

import { PlotData, VehicleData, BusinessData, MissionData, PlayerStats } from './types';

export const INITIAL_MONEY = 50000;

export const INITIAL_PLOTS: PlotData[] = [
  {
    id: 'plot_1',
    name: 'Suburban Starter Lot',
    address: '10 Elm Way',
    x: -28,
    z: -68,
    width: 18,
    depth: 18,
    price: 28000,
    isOwned: false,
    stage: 0,
    style: 'modern',
    wallColor: '#f8fafc',
    roofColor: '#1e293b',
    rented: false,
    rentPerMin: 350,
    accumulatedRent: 0,
    lastRentCollectedTime: Date.now(),
    marketValue: 28000,
    renovations: 0,
  },
  {
    id: 'plot_2',
    name: 'Meadow View Lot',
    address: '14 Elm Way',
    x: 28,
    z: -68,
    width: 18,
    depth: 18,
    price: 32000,
    isOwned: false,
    stage: 0,
    style: 'craftsman',
    wallColor: '#fed7aa',
    roofColor: '#78350f',
    rented: false,
    rentPerMin: 400,
    accumulatedRent: 0,
    lastRentCollectedTime: Date.now(),
    marketValue: 32000,
    renovations: 0,
  },
  {
    id: 'plot_3',
    name: 'Maple Grove Lot',
    address: '22 Maple Dr',
    x: -56,
    z: -50,
    width: 20,
    depth: 20,
    price: 42000,
    isOwned: false,
    stage: 0,
    style: 'modern',
    wallColor: '#e2e8f0',
    roofColor: '#0f172a',
    rented: false,
    rentPerMin: 550,
    accumulatedRent: 0,
    lastRentCollectedTime: Date.now(),
    marketValue: 42000,
    renovations: 0,
  },
  {
    id: 'plot_4',
    name: 'Sunset Crest Lot',
    address: '28 Maple Dr',
    x: 56,
    z: -50,
    width: 20,
    depth: 20,
    price: 48000,
    isOwned: false,
    stage: 0,
    style: 'coastal',
    wallColor: '#e0f2fe',
    roofColor: '#0369a1',
    rented: false,
    rentPerMin: 650,
    accumulatedRent: 0,
    lastRentCollectedTime: Date.now(),
    marketValue: 48000,
    renovations: 0,
  },
  {
    id: 'plot_5',
    name: 'Grand Parkside Lot',
    address: '5 Park Plaza',
    x: -56,
    z: 50,
    width: 22,
    depth: 22,
    price: 68000,
    isOwned: false,
    stage: 0,
    style: 'modern',
    wallColor: '#f1f5f9',
    roofColor: '#1e293b',
    rented: false,
    rentPerMin: 900,
    accumulatedRent: 0,
    lastRentCollectedTime: Date.now(),
    marketValue: 68000,
    renovations: 0,
  },
  {
    id: 'plot_6',
    name: 'Riverfront Vista Lot',
    address: '12 Riverbank Way',
    x: 56,
    z: 50,
    width: 22,
    depth: 22,
    price: 85000,
    isOwned: false,
    stage: 0,
    style: 'luxury_mansion',
    wallColor: '#fef08a',
    roofColor: '#0f172a',
    rented: false,
    rentPerMin: 1200,
    accumulatedRent: 0,
    lastRentCollectedTime: Date.now(),
    marketValue: 85000,
    renovations: 0,
  },
  {
    id: 'plot_7',
    name: 'Hilltop Panorama Lot',
    address: '18 Skyline Ridge',
    x: -28,
    z: 68,
    width: 24,
    depth: 24,
    price: 110000,
    isOwned: false,
    stage: 0,
    style: 'luxury_mansion',
    wallColor: '#f8fafc',
    roofColor: '#18181b',
    rented: false,
    rentPerMin: 1650,
    accumulatedRent: 0,
    lastRentCollectedTime: Date.now(),
    marketValue: 110000,
    renovations: 0,
  },
  {
    id: 'plot_8',
    name: 'Aimmer Sovereign Estate',
    address: '1 Sovereign Hill',
    x: 28,
    z: 68,
    width: 26,
    depth: 26,
    price: 160000,
    isOwned: false,
    stage: 0,
    style: 'luxury_mansion',
    wallColor: '#f8fafc',
    roofColor: '#1e293b',
    rented: false,
    rentPerMin: 2400,
    accumulatedRent: 0,
    lastRentCollectedTime: Date.now(),
    marketValue: 160000,
    renovations: 0,
  },
];

export const INITIAL_VEHICLES: VehicleData[] = [
  {
    id: 'veh_sedan',
    name: 'Aimmer Cruiser 200',
    category: 'sedan',
    price: 15000,
    speed: 18,
    acceleration: 1.4,
    color: '#2563eb',
    isOwned: true, // Player starts with starter sedan!
    unlockedLevel: 1,
    description: 'Reliable city sedan with good handling and smooth suspension.',
  },
  {
    id: 'veh_suv',
    name: 'Aimmer Ridge AWD',
    category: 'suv',
    price: 45000,
    speed: 22,
    acceleration: 1.7,
    color: '#0f172a',
    isOwned: false,
    unlockedLevel: 2,
    description: 'Spacious all-wheel drive SUV with superior presence on estate roads.',
  },
  {
    id: 'veh_sports',
    name: 'Aimmer GT Roadster',
    category: 'sports',
    price: 95000,
    speed: 28,
    acceleration: 2.3,
    color: '#dc2626',
    isOwned: false,
    unlockedLevel: 3,
    description: 'High-performance V8 roadster built for precision cornering and speed.',
  },
  {
    id: 'veh_hyper',
    name: 'Aimmer Hyperion EV',
    category: 'hypercar',
    price: 240000,
    speed: 36,
    acceleration: 3.2,
    color: '#eab308',
    isOwned: false,
    unlockedLevel: 4,
    description: 'The pinnacle of tycoon luxury. 1,400 HP quad-motor electric hypercar.',
  },
];

export const INITIAL_BUSINESSES: BusinessData[] = [
  {
    id: 'biz_cafe',
    name: 'Sunset Cafe & Bakery',
    category: 'Hospitality',
    cost: 25000,
    incomePerMin: 220,
    isOwned: false,
    unlockedLevel: 1,
    iconName: 'Coffee',
    description: 'Charming neighborhood bakery with loyal morning customers.',
  },
  {
    id: 'biz_realty',
    name: 'Aimmer Realty HQ',
    category: 'Real Estate',
    cost: 65000,
    incomePerMin: 620,
    isOwned: false,
    unlockedLevel: 2,
    iconName: 'Building2',
    description: 'Brokerage agency generating property commission from local deals.',
  },
  {
    id: 'biz_bank',
    name: 'Aimmer Commercial Bank',
    category: 'Finance',
    cost: 140000,
    incomePerMin: 1450,
    isOwned: false,
    unlockedLevel: 3,
    iconName: 'Landmark',
    description: 'Regional financial branch collecting mortgage and loan interest.',
  },
  {
    id: 'biz_dealership',
    name: 'Luxury Motors Showroom',
    category: 'Automotive',
    cost: 280000,
    incomePerMin: 3200,
    isOwned: false,
    unlockedLevel: 4,
    iconName: 'Car',
    description: 'Exotic vehicle dealership serving the high-net-worth residents.',
  },
];

export const INITIAL_MISSIONS: MissionData[] = [
  {
    id: 'm_1_buy_land',
    stage: 1,
    title: 'First Plot of Land',
    description: 'Purchase your first residential plot in the neighborhood.',
    rewardMoney: 10000,
    rewardXp: 150,
    isCompleted: false,
    progress: 0,
    maxProgress: 1,
    targetType: 'buy_plot',
  },
  {
    id: 'm_1_foundation',
    stage: 1,
    title: 'Break Ground',
    description: 'Pour the concrete foundation on your owned lot.',
    rewardMoney: 8000,
    rewardXp: 180,
    isCompleted: false,
    progress: 0,
    maxProgress: 1,
    targetType: 'build_house',
  },
  {
    id: 'm_2_complete_house',
    stage: 2,
    title: 'Roof & Siding',
    description: 'Construct the walls, windows, and roof on a property (Stage 3).',
    rewardMoney: 15000,
    rewardXp: 300,
    isCompleted: false,
    progress: 0,
    maxProgress: 1,
    targetType: 'build_house',
  },
  {
    id: 'm_2_furnish_rent',
    stage: 2,
    title: 'Homeowner & Landlord',
    description: 'Furnish your house (Stage 4) and sign your first tenant.',
    rewardMoney: 20000,
    rewardXp: 400,
    isCompleted: false,
    progress: 0,
    maxProgress: 1,
    targetType: 'rent_house',
  },
  {
    id: 'm_3_multi_property',
    stage: 3,
    title: 'Real Estate Investor',
    description: 'Own at least 3 residential properties simultaneously.',
    rewardMoney: 35000,
    rewardXp: 600,
    isCompleted: false,
    progress: 0,
    maxProgress: 3,
    targetType: 'buy_plot',
  },
  {
    id: 'm_3_invest_biz',
    stage: 3,
    title: 'Commercial Pioneer',
    description: 'Invest in and own a local commercial business.',
    rewardMoney: 40000,
    rewardXp: 650,
    isCompleted: false,
    progress: 0,
    maxProgress: 1,
    targetType: 'invest_business',
  },
  {
    id: 'm_4_luxury_pool',
    stage: 4,
    title: 'Luxury Developer',
    description: 'Upgrade any house to Stage 5 with a swimming pool and patio garden.',
    rewardMoney: 50000,
    rewardXp: 850,
    isCompleted: false,
    progress: 0,
    maxProgress: 1,
    targetType: 'luxury_mansion',
  },
  {
    id: 'm_5_millionaire',
    stage: 5,
    title: 'Real Estate Tycoon',
    description: 'Reach a net worth / cash balance of $500,000.',
    rewardMoney: 100000,
    rewardXp: 1500,
    isCompleted: false,
    progress: 0,
    maxProgress: 500000,
    targetType: 'earn_money',
  },
];

export const STAGE_TITLES: Record<number, { name: string; subtitle: string; icon: string }> = {
  1: { name: 'Beginner', subtitle: 'Buy land & lay foundations', icon: '🌱' },
  2: { name: 'Homeowner', subtitle: 'Furnish and rent your first house', icon: '🏡' },
  3: { name: 'Investor', subtitle: 'Acquire multiple properties and businesses', icon: '📈' },
  4: { name: 'Developer', subtitle: 'Build luxury estates with swimming pools', icon: '💎' },
  5: { name: 'Tycoon', subtitle: 'Rule the real estate market with an empire', icon: '👑' },
};

export const CONSTRUCTION_COSTS: Record<number, { name: string; cost: number; timeSec: number }> = {
  1: { name: 'Pour Foundation & Footings', cost: 8000, timeSec: 2 },
  2: { name: 'Frame Structure & Wall Framing', cost: 12000, timeSec: 3 },
  3: { name: 'Exterior Siding, Roof & Glazing', cost: 16000, timeSec: 4 },
  4: { name: 'Interior Hardwood & Luxury Furnishing', cost: 14000, timeSec: 4 },
  5: { name: 'Swimming Pool, Patio & Garden Landscaping', cost: 22000, timeSec: 5 },
};

const STORAGE_KEY = 'aimmer_house_tycoon_save_v1';

export class EconomyManager {
  public static loadState(): {
    stats: PlayerStats;
    plots: PlotData[];
    vehicles: VehicleData[];
    businesses: BusinessData[];
    missions: MissionData[];
    activeVehicleId: string | null;
  } {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          stats: parsed.stats || this.getDefaultStats(),
          plots: parsed.plots || INITIAL_PLOTS,
          vehicles: parsed.vehicles || INITIAL_VEHICLES,
          businesses: parsed.businesses || INITIAL_BUSINESSES,
          missions: parsed.missions || INITIAL_MISSIONS,
          activeVehicleId: parsed.activeVehicleId || 'veh_sedan',
        };
      }
    } catch {
      // Fallback
    }

    return {
      stats: this.getDefaultStats(),
      plots: INITIAL_PLOTS.map((p) => ({ ...p })),
      vehicles: INITIAL_VEHICLES.map((v) => ({ ...v })),
      businesses: INITIAL_BUSINESSES.map((b) => ({ ...b })),
      missions: INITIAL_MISSIONS.map((m) => ({ ...m })),
      activeVehicleId: 'veh_sedan',
    };
  }

  public static saveState(data: {
    stats: PlayerStats;
    plots: PlotData[];
    vehicles: VehicleData[];
    businesses: BusinessData[];
    missions: MissionData[];
    activeVehicleId: string | null;
  }) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage error
    }
  }

  public static resetGame() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  public static getDefaultStats(): PlayerStats {
    return {
      money: INITIAL_MONEY,
      level: 1,
      xp: 0,
      xpNeeded: 250,
      currentStage: 1,
      totalRentEarned: 0,
      totalHousesBuilt: 0,
      totalPropertiesOwned: 0,
      totalSpent: 0,
    };
  }
}
