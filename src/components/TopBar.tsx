/**
 * AIMMER HOUSE TYCOON - Modern Top HUD & Context Action Prompt
 */

import React from 'react';
import { PlayerStats } from '../game/types';
import { STAGE_TITLES } from '../game/economy';
import {
  DollarSign,
  Volume2,
  VolumeX,
  Compass,
  Car,
  Hammer,
} from 'lucide-react';

interface TopBarProps {
  stats: PlayerStats;
  isMuted: boolean;
  onToggleMute: () => void;
  dayNightTime: number;
  promptText: string | null;
  promptAction: (() => void) | null;
  isDriving: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  stats,
  isMuted,
  onToggleMute,
  dayNightTime,
  promptText,
  promptAction,
  isDriving,
}) => {
  const stageInfo = STAGE_TITLES[stats.currentStage] || STAGE_TITLES[1];

  const getTimeLabel = (t: number) => {
    if (t < 0.2) return '🌅 Morning';
    if (t < 0.5) return '☀️ Noon';
    if (t < 0.7) return '🌇 Sunset';
    return '🌙 Night';
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="fixed top-3 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        {/* Left: Game Logo & Title */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-xl backdrop-blur-none">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-sm">
              👑
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest text-amber-400 uppercase leading-none">
                3D Real Estate Tycoon
              </div>
              <h1 className="text-sm font-black text-white tracking-tight leading-tight">
                AIMMER HOUSE TYCOON
              </h1>
            </div>
          </div>

          {/* Player Level & Stage Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-xl backdrop-blur-none">
            <span className="text-base">{stageInfo.icon}</span>
            <div>
              <div className="text-[9px] text-slate-400 uppercase font-semibold">
                Stage {stats.currentStage}
              </div>
              <div className="text-xs font-bold text-cyan-300">
                {stageInfo.name} <span className="text-slate-500 text-[10px] font-mono">Lv.{stats.level}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Money Balance, Time & Audio */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Virtual Money Balance */}
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-950/90 to-slate-900/90 border border-emerald-500/50 shadow-xl backdrop-blur-none">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              $
            </div>
            <div className="text-right">
              <div className="text-[9px] text-emerald-400/80 font-bold uppercase tracking-wider leading-none">
                Virtual Balance
              </div>
              <div className="text-base sm:text-lg font-black font-mono text-emerald-300 leading-tight">
                ${stats.money.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Time of Day */}
          <div className="hidden md:flex items-center px-3 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-xl text-xs font-semibold text-slate-300">
            {getTimeLabel(dayNightTime)}
          </div>

          {/* Audio Mute Button */}
          <button
            onClick={onToggleMute}
            aria-label="Toggle Sound"
            className="w-10 h-10 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 shadow-xl flex items-center justify-center text-slate-300 transition-colors"
          >
            {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
        </div>
      </header>

      {/* Floating Center Context Action Prompt */}
      {promptText && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => promptAction && promptAction()}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-slate-900/95 via-blue-950/95 to-slate-900/95 border-2 border-cyan-400 shadow-2xl text-white font-bold text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-none"
          >
            <span className="w-6 h-6 rounded-lg bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center">
              E
            </span>
            <span>{promptText}</span>
          </button>
        </div>
      )}

      {/* Driving Status Overlay (when in vehicle) */}
      {isDriving && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs font-bold shadow-xl">
            <Car size={16} />
            <span>DRIVING VEHICLE — Press [E] to exit</span>
          </div>
        </div>
      )}
    </>
  );
};
