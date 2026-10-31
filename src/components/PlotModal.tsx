/**
 * AIMMER HOUSE TYCOON - Interactive Plot Construction & Property Modal
 */

import React, { useState } from 'react';
import { PlotData, PlotStage } from '../game/types';
import { CONSTRUCTION_COSTS } from '../game/economy';
import confetti from 'canvas-confetti';
import { sound } from '../game/audio';
import {
  X,
  Home,
  Hammer,
  DollarSign,
  TrendingUp,
  UserCheck,
  Paintbrush,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface PlotModalProps {
  plot: PlotData;
  playerMoney: number;
  onClose: () => void;
  onBuyPlot: (plotId: string) => void;
  onUpgradeStage: (plotId: string, nextStage: PlotStage) => void;
  onCustomizeColors: (plotId: string, wallColor: string, roofColor: string) => void;
  onRentOut: (plotId: string, tenantName: string, rent: number) => void;
  onCollectRent: (plotId: string) => void;
  onRenovate: (plotId: string) => void;
  onSellPlot: (plotId: string) => void;
}

export const PlotModal: React.FC<PlotModalProps> = ({
  plot,
  playerMoney,
  onClose,
  onBuyPlot,
  onUpgradeStage,
  onCustomizeColors,
  onRentOut,
  onCollectRent,
  onRenovate,
  onSellPlot,
}) => {
  const [activeTab, setActiveTab] = useState<'build' | 'manage' | 'customize'>('build');
  const [selectedWallColor, setSelectedWallColor] = useState(plot.wallColor);
  const [selectedRoofColor, setSelectedRoofColor] = useState(plot.roofColor);
  const [isBuildingAnimation, setIsBuildingAnimation] = useState(false);

  const nextStage = (plot.stage + 1) as PlotStage;
  const nextStageInfo = CONSTRUCTION_COSTS[nextStage];
  const canAffordPurchase = playerMoney >= plot.price;
  const canAffordBuild = nextStageInfo ? playerMoney >= nextStageInfo.cost : false;
  const renovationCost = Math.round(plot.marketValue * 0.08);

  const wallColors = [
    { label: 'Modern Pure White', hex: '#f8fafc' },
    { label: 'Architectural Gray', hex: '#64748b' },
    { label: 'Nordic Charcoal', hex: '#1e293b' },
    { label: 'Warm Sand', hex: '#fed7aa' },
    { label: 'Coastal Mist', hex: '#e0f2fe' },
    { label: 'Tuscan Peach', hex: '#fbcfe8' },
  ];

  const roofColors = [
    { label: 'Slate Charcoal', hex: '#1e293b' },
    { label: 'Obsidian Black', hex: '#09090b' },
    { label: 'Terracotta Red', hex: '#991b1b' },
    { label: 'Ocean Bronze', hex: '#1e3a5f' },
  ];

  const handleBuild = () => {
    if (!nextStageInfo || !canAffordBuild || isBuildingAnimation) return;

    setIsBuildingAnimation(true);
    sound.playHammerStrike();

    // Trigger audio sequence
    setTimeout(() => sound.playPowerDrill(), 400);
    setTimeout(() => sound.playHammerStrike(), 900);

    setTimeout(() => {
      onUpgradeStage(plot.id, nextStage);
      setIsBuildingAnimation(false);
      sound.playCoin();
      if (nextStage >= 4) {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
      }
    }, 1400);
  };

  const handleApplyColors = () => {
    onCustomizeColors(plot.id, selectedWallColor, selectedRoofColor);
    sound.playPowerDrill();
  };

  const handleTenantSelect = (tenantName: string, rentModifier: number) => {
    const finalRent = Math.round(plot.rentPerMin * rentModifier);
    onRentOut(plot.id, tenantName, finalRent);
    sound.playCashRegister();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-none pointer-events-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {plot.isOwned ? 'Owned Property' : 'Land For Sale'}
              </span>
              <span className="text-xs text-slate-400 font-mono">{plot.address}</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1 tracking-tight flex items-center gap-2">
              {plot.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors border border-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Unowned Plot View */}
          {!plot.isOwned ? (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">Plot Dimensions</span>
                  <span className="font-mono text-white font-bold">{plot.width}m × {plot.depth}m (Zone A)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">Neighborhood Style</span>
                  <span className="capitalize font-semibold text-cyan-400">{plot.style.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-700/60 pt-3">
                  <span className="text-sm text-slate-300">Purchase Price</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    ${plot.price.toLocaleString()}
                  </span>
                </div>
              </div>

              {canAffordPurchase ? (
                <button
                  onClick={() => {
                    onBuyPlot(plot.id);
                    sound.playCashRegister();
                    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
                  }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-lg shadow-xl shadow-emerald-900/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <DollarSign size={22} />
                  PURCHASE LAND PLOT (${plot.price.toLocaleString()})
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 flex items-center gap-3">
                  <AlertCircle size={22} className="shrink-0" />
                  <div>
                    <div className="font-bold">Insufficient Funds</div>
                    <div className="text-xs text-red-400">
                      You need ${(plot.price - playerMoney).toLocaleString()} more to acquire this plot.
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Owned Plot View */
            <div className="space-y-5">
              {/* Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-950/60 border border-slate-800">
                <button
                  onClick={() => setActiveTab('build')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'build' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Hammer size={14} /> Construction ({plot.stage}/5)
                </button>
                <button
                  onClick={() => setActiveTab('manage')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'manage' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TrendingUp size={14} /> Financials & Rent
                </button>
                <button
                  onClick={() => setActiveTab('customize')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'customize' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Paintbrush size={14} /> Design
                </button>
              </div>

              {/* TAB 1: BUILD */}
              {activeTab === 'build' && (
                <div className="space-y-4">
                  {/* Stage Progress Bar */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                    <div className="flex justify-between items-center text-xs text-slate-300 mb-2">
                      <span className="font-semibold">Building Phase Progress</span>
                      <span className="font-mono text-cyan-400 font-bold">Stage {plot.stage} / 5</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-700 overflow-hidden flex">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`flex-1 border-r border-slate-900 transition-all ${
                            lvl <= plot.stage ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-5 text-[10px] text-slate-400 mt-2 text-center">
                      <span>Found.</span>
                      <span>Walls</span>
                      <span>Roof</span>
                      <span>Interior</span>
                      <span>Luxury</span>
                    </div>
                  </div>

                  {/* Next Step Construction Card */}
                  {plot.stage < 5 ? (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/80 border border-blue-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-blue-400 font-bold uppercase tracking-wider">Next Upgrade</div>
                          <div className="text-base font-bold text-white mt-0.5">
                            {nextStageInfo.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Expense</div>
                          <div className="text-lg font-black font-mono text-emerald-400">
                            ${nextStageInfo.cost.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleBuild}
                        disabled={!canAffordBuild || isBuildingAnimation}
                        className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                          isBuildingAnimation
                            ? 'bg-amber-600 text-white cursor-wait animate-pulse'
                            : canAffordBuild
                            ? 'bg-blue-600 hover:bg-blue-500 text-white active:scale-98'
                            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isBuildingAnimation ? (
                          <>
                            <Hammer size={18} className="animate-bounce" />
                            Constructing Phase...
                          </>
                        ) : canAffordBuild ? (
                          <>
                            <Hammer size={18} />
                            BUILD PHASE {nextStage} (${nextStageInfo.cost.toLocaleString()})
                          </>
                        ) : (
                          <>Need ${(nextStageInfo.cost - playerMoney).toLocaleString()} More</>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-3">
                      <CheckCircle2 size={24} className="shrink-0 text-emerald-400" />
                      <div>
                        <div className="font-bold text-white">Full Luxury Estate Complete!</div>
                        <div className="text-xs text-emerald-400">
                          This estate has reached maximum development with a luxury pool, patio deck and manicured garden.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MANAGE & FINANCIALS */}
              {activeTab === 'manage' && (
                <div className="space-y-4">
                  {/* Property Valuation */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-400">Appraised Market Value</div>
                      <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                        ${plot.marketValue.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Renovations Level</div>
                      <div className="text-xl font-black font-mono text-cyan-400 mt-1">
                        +{plot.renovations} (+{plot.renovations * 20}% Yield)
                      </div>
                    </div>
                  </div>

                  {/* Renovation Button */}
                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-1.5">
                        <Sparkles size={16} className="text-amber-400" /> Modernize & Renovate
                      </div>
                      <div className="text-xs text-slate-400">
                        Boosts property value & rental yield by 20%
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (playerMoney >= renovationCost) {
                          onRenovate(plot.id);
                          sound.playHammerStrike();
                        }
                      }}
                      disabled={playerMoney < renovationCost}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-white font-bold text-xs shadow-md transition-all"
                    >
                      Renovate (${renovationCost.toLocaleString()})
                    </button>
                  </div>

                  {/* Rental System */}
                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                    <div className="text-sm font-bold text-white flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <UserCheck size={16} className="text-emerald-400" /> Rental Status
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          plot.rented
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {plot.rented ? `Rented to ${plot.tenantName}` : 'Vacant'}
                      </span>
                    </div>

                    {plot.stage < 3 ? (
                      <div className="text-xs text-amber-400 bg-amber-950/30 p-2.5 rounded-xl border border-amber-500/20">
                        Complete at least Stage 3 (Walls, Windows & Roof) to qualify for virtual tenants.
                      </div>
                    ) : plot.rented ? (
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <div className="text-xs text-slate-400">Accumulated Rent</div>
                          <div className="text-lg font-black font-mono text-emerald-400">
                            ${Math.round(plot.accumulatedRent).toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            onCollectRent(plot.id);
                            sound.playCashRegister();
                          }}
                          disabled={plot.accumulatedRent <= 0}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold text-xs shadow-md transition-all"
                        >
                          Collect Cash
                        </button>
                      </div>
                    ) : (
                      /* Sign Tenant List */
                      <div className="space-y-2 pt-1">
                        <div className="text-xs text-slate-300">Select a Virtual Tenant Agreement:</div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleTenantSelect('Tech Engineer', 1.0)}
                            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition-colors"
                          >
                            <div className="text-xs font-bold text-white">Tech Specialist</div>
                            <div className="text-[11px] text-emerald-400 font-mono font-semibold">
                              ${plot.rentPerMin}/min
                            </div>
                          </button>
                          <button
                            onClick={() => handleTenantSelect('Executive Family', 1.25)}
                            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition-colors"
                          >
                            <div className="text-xs font-bold text-white">Executive Family</div>
                            <div className="text-[11px] text-emerald-400 font-mono font-semibold">
                              ${Math.round(plot.rentPerMin * 1.25)}/min
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sell House to Real Estate Market */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onSellPlot(plot.id);
                        sound.playCashRegister();
                        confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
                      }}
                      className="w-full py-3 rounded-xl border border-red-500/40 bg-red-950/20 hover:bg-red-950/40 text-red-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      Sell Property on Market for ${plot.marketValue.toLocaleString()}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: CUSTOMIZE DESIGN */}
              {activeTab === 'customize' && (
                <div className="space-y-4">
                  {/* Wall Color */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
                    <div className="text-xs font-bold text-slate-300">Exterior Wall Finish</div>
                    <div className="grid grid-cols-3 gap-2">
                      {wallColors.map((c) => (
                        <button
                          key={c.hex}
                          onClick={() => setSelectedWallColor(c.hex)}
                          className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                            selectedWallColor === c.hex
                              ? 'border-cyan-400 bg-cyan-950/30 text-white'
                              : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full border border-slate-600" style={{ backgroundColor: c.hex }} />
                          <span className="truncate">{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Roof Color */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
                    <div className="text-xs font-bold text-slate-300">Roofing Color</div>
                    <div className="grid grid-cols-2 gap-2">
                      {roofColors.map((r) => (
                        <button
                          key={r.hex}
                          onClick={() => setSelectedRoofColor(r.hex)}
                          className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                            selectedRoofColor === r.hex
                              ? 'border-cyan-400 bg-cyan-950/30 text-white'
                              : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full border border-slate-600" style={{ backgroundColor: r.hex }} />
                          <span className="truncate">{r.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleApplyColors}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-colors"
                  >
                    Apply Architectural Paint Finishes
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
