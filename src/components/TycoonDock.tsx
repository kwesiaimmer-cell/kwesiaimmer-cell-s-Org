/**
 * AIMMER HOUSE TYCOON - Collapsible Bottom Dock (Zero Viewport Occlusion)
 * Strictly follows the Three.js skill guidelines for clean ergonomics and cinema mode.
 */

import React, { useState } from 'react';
import { PlotData, VehicleData, BusinessData, MissionData, PlayerStats } from '../game/types';
import { STAGE_TITLES } from '../game/economy';
import { sound } from '../game/audio';
import confetti from 'canvas-confetti';
import {
  Home,
  Hammer,
  Car,
  TrendingUp,
  Award,
  Settings,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  DollarSign,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  RotateCcw,
} from 'lucide-react';

interface TycoonDockProps {
  stats: PlayerStats;
  plots: PlotData[];
  vehicles: VehicleData[];
  businesses: BusinessData[];
  missions: MissionData[];
  activeVehicleId: string | null;
  dayNightTime: number;
  autoTime: boolean;
  onSelectPlot: (plot: PlotData) => void;
  onBuyVehicle: (vehicleId: string) => void;
  onSelectVehicle: (vehicleId: string) => void;
  onInvestBusiness: (businessId: string) => void;
  onClaimMissionReward: (missionId: string) => void;
  onCollectAllRent: () => void;
  onSetTimeOfDay: (time: number) => void;
  onToggleAutoTime: () => void;
  onResetGame: () => void;
}

export const TycoonDock: React.FC<TycoonDockProps> = ({
  stats,
  plots,
  vehicles,
  businesses,
  missions,
  activeVehicleId,
  dayNightTime,
  autoTime,
  onSelectPlot,
  onBuyVehicle,
  onSelectVehicle,
  onInvestBusiness,
  onClaimMissionReward,
  onCollectAllRent,
  onSetTimeOfDay,
  onToggleAutoTime,
  onResetGame,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'construct' | 'garage' | 'invest' | 'missions' | 'settings'>('portfolio');

  const totalAccumulatedRent = plots.reduce((acc, p) => acc + (p.accumulatedRent || 0), 0);
  const ownedPlotsCount = plots.filter((p) => p.isOwned).length;
  const currentStageInfo = STAGE_TITLES[stats.currentStage] || STAGE_TITLES[1];

  return (
    <div
      style={{
        bottom: isCollapsed ? '-360px' : '16px',
        maxWidth: 'min(960px, 96vw)',
      }}
      className="fixed left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ease-in-out pointer-events-auto flex flex-col items-center"
    >
      {/* Collapse / Expand Cinema Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="px-4 py-1.5 rounded-t-xl bg-slate-900 border-t border-x border-slate-700/80 text-xs font-bold text-slate-300 hover:text-white shadow-xl flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        {isCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        <span>{isCollapsed ? 'Show Tycoon Dashboard [H]' : 'Hide Dock [H]'}</span>
      </button>

      {/* Main Glassmorphic Dock Container */}
      <div className="w-full rounded-2xl bg-slate-900/95 border border-slate-700/90 shadow-2xl overflow-hidden flex flex-col backdrop-blur-none">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950/70 overflow-x-auto">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'portfolio' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home size={14} /> Properties ({ownedPlotsCount}/8)
            </button>
            <button
              onClick={() => setActiveTab('construct')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'construct' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Hammer size={14} /> Build
            </button>
            <button
              onClick={() => setActiveTab('garage')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'garage' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Car size={14} /> Garage
            </button>
            <button
              onClick={() => setActiveTab('invest')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'invest' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp size={14} /> Investments
            </button>
            <button
              onClick={() => setActiveTab('missions')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'missions' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award size={14} /> Missions
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'settings' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings size={14} /> Settings
            </button>
          </div>

          {/* Quick Collect All Rent Button */}
          {totalAccumulatedRent > 0 && (
            <button
              onClick={() => {
                onCollectAllRent();
                sound.playCashRegister();
                confetti({ particleCount: 40, spread: 45, origin: { y: 0.8 } });
              }}
              className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all shrink-0 ml-2"
            >
              <DollarSign size={13} />
              Collect Rent (+${Math.round(totalAccumulatedRent).toLocaleString()})
            </button>
          )}
        </div>

        {/* Tab Panel Content (Height constrained for compact viewport) */}
        <div className="p-4 max-h-56 overflow-y-auto">
          {/* TAB: PROPERTIES */}
          {activeTab === 'portfolio' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {plots.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectPlot(p)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all hover:scale-102 ${
                    p.isOwned
                      ? p.rented
                        ? 'bg-slate-800/80 border-emerald-500/40 hover:border-emerald-400'
                        : 'bg-slate-800/80 border-blue-500/40 hover:border-blue-400'
                      : 'bg-slate-900/60 border-slate-700/60 opacity-80 hover:opacity-100 hover:border-red-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-white truncate">{p.name}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        p.isOwned
                          ? p.rented
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-blue-500/20 text-blue-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {p.isOwned ? `Stage ${p.stage}` : 'For Sale'}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono">{p.address}</div>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-700/40 text-[11px]">
                    <span className="text-slate-400">{p.isOwned ? 'Valuation' : 'Price'}</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ${(p.isOwned ? p.marketValue : p.price).toLocaleString()}
                    </span>
                  </div>

                  {p.isOwned && p.rented && p.accumulatedRent > 0 && (
                    <div className="mt-1 text-[10px] text-emerald-300 font-semibold flex items-center justify-between">
                      <span>Rent Ready:</span>
                      <span className="font-mono">+${Math.round(p.accumulatedRent)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB: CONSTRUCT */}
          {activeTab === 'construct' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-300 flex items-center justify-between">
                <span>Select any lot below to open architectural building operations:</span>
                <span className="text-cyan-400 font-semibold text-[11px]">Tip: Approach the plot in-world and press [E]</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {plots.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onSelectPlot(p)}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition-colors"
                  >
                    <div className="font-bold text-xs text-white truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {p.isOwned ? `Current: Stage ${p.stage}/5` : 'Vacant Land'}
                    </div>
                    <div className="text-[11px] font-mono font-bold text-cyan-400 mt-2">
                      {p.isOwned ? 'Upgrade / Manage →' : `Buy: $${(p.price / 1000).toFixed(0)}k`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB: GARAGE */}
          {activeTab === 'garage' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {vehicles.map((v) => {
                const isSelected = activeVehicleId === v.id;
                const canAfford = stats.money >= v.price;

                return (
                  <div
                    key={v.id}
                    className={`p-3 rounded-xl border flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-400'
                        : v.isOwned
                        ? 'bg-slate-800/80 border-slate-700'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{v.name}</span>
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-600" style={{ backgroundColor: v.color }} />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">{v.description}</div>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-300 font-mono">
                        <span>Speed: {v.speed * 4} mph</span>
                        <span>Accel: {v.acceleration}g</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-700/50">
                      {v.isOwned ? (
                        <button
                          onClick={() => onSelectVehicle(v.id)}
                          className={`w-full py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 hover:bg-slate-650 text-slate-200'
                          }`}
                        >
                          {isSelected ? 'Active Car' : 'Select Vehicle'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (canAfford) {
                              onBuyVehicle(v.id);
                              sound.playCashRegister();
                            }
                          }}
                          disabled={!canAfford}
                          className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-bold transition-colors"
                        >
                          Buy for ${v.price.toLocaleString()}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB: INVESTMENTS */}
          {activeTab === 'invest' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {businesses.map((b) => {
                const canAfford = stats.money >= b.cost;
                return (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl border flex flex-col justify-between ${
                      b.isOwned ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-800/70 border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white truncate">{b.name}</span>
                        <span className="text-[10px] font-mono text-cyan-400">+{b.incomePerMin}/m</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">{b.description}</div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-700/50">
                      {b.isOwned ? (
                        <div className="text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                          <CheckCircle2 size={13} /> Generating Revenue
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (canAfford) {
                              onInvestBusiness(b.id);
                              sound.playCashRegister();
                            }
                          }}
                          disabled={!canAfford}
                          className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-bold transition-colors"
                        >
                          Acquire (${b.cost.toLocaleString()})
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB: MISSIONS */}
          {activeTab === 'missions' && (
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{currentStageInfo.icon}</span>
                    <span>Stage {stats.currentStage}: {currentStageInfo.name}</span>
                  </div>
                  <div className="text-[10px] text-blue-300 mt-0.5">{currentStageInfo.subtitle}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">XP Progress</div>
                  <div className="text-xs font-mono font-bold text-cyan-400">
                    {stats.xp} / {stats.xpNeeded} XP
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {missions.map((m) => (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      m.isCompleted
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                        : 'bg-slate-800/70 border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {m.isCompleted && <CheckCircle2 size={13} className="text-emerald-400" />}
                        {m.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{m.description}</div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="text-[11px] font-mono font-bold text-emerald-400">
                        +${m.rewardMoney.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-cyan-400">+{m.rewardXp} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Time of Day */}
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-1.5">
                      {dayNightTime > 0.3 && dayNightTime < 0.7 ? <Moon size={14} /> : <Sun size={14} />} Time of Day
                    </span>
                    <button
                      onClick={onToggleAutoTime}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        autoTime ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {autoTime ? 'Auto Cycle' : 'Manual Time'}
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={dayNightTime}
                    onChange={(e) => onSetTimeOfDay(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Sunrise</span>
                    <span>Noon</span>
                    <span>Sunset</span>
                    <span>Night</span>
                  </div>
                </div>

                {/* PC Keyboard & Mouse Guide */}
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300 space-y-1">
                  <div className="font-bold text-white text-xs mb-1.5">PC Controls Guide</div>
                  <div><span className="font-mono bg-slate-700 px-1 py-0.5 rounded text-white">WASD</span>: Move character / Drive car</div>
                  <div><span className="font-mono bg-slate-700 px-1 py-0.5 rounded text-white">Shift</span>: Sprint / Brake</div>
                  <div><span className="font-mono bg-slate-700 px-1 py-0.5 rounded text-white">E</span>: Interact / Manage Plot / Enter Car</div>
                  <div><span className="font-mono bg-slate-700 px-1 py-0.5 rounded text-white">Mouse Drag</span>: Rotate camera orbit</div>
                  <div><span className="font-mono bg-slate-700 px-1 py-0.5 rounded text-white">H</span>: Toggle Cinema Mode HUD</div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    if (confirm('Reset game and start a new real estate tycoon empire?')) {
                      onResetGame();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl border border-red-500/40 text-red-400 text-xs font-bold hover:bg-red-950/30 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw size={13} /> Reset Save Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
