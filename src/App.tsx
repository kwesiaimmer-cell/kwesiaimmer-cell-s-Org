/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GameEngine } from './game/GameEngine';
import { sound } from './game/audio';
import { EconomyManager } from './game/economy';
import { PlotData, VehicleData, BusinessData, MissionData, PlayerStats, PlotStage } from './game/types';
import { TopBar } from './components/TopBar';
import { Minimap } from './components/Minimap';
import { TycoonDock } from './components/TycoonDock';
import { PlotModal } from './components/PlotModal';
import { MobileControls } from './components/MobileControls';
import confetti from 'canvas-confetti';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Tycoon State
  const [stats, setStats] = useState<PlayerStats>(() => EconomyManager.getDefaultStats());
  const [plots, setPlots] = useState<PlotData[]>([]);
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [missions, setMissions] = useState<MissionData[]>([]);
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>('veh_sedan');

  // UI & Interaction State
  const [selectedPlot, setSelectedPlot] = useState<PlotData | null>(null);
  const [promptText, setPromptText] = useState<string | null>(null);
  const [promptAction, setPromptAction] = useState<(() => void) | null>(null);
  const [isDriving, setIsDriving] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [dayNightTime, setDayNightTime] = useState<number>(0.25);
  const [autoTime, setAutoTime] = useState<boolean>(true);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  // Player & Vehicle transforms for Minimap
  const [playerPos, setPlayerPos] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 15));
  const [playerRotY, setPlayerRotY] = useState<number>(0);
  const [vehiclePos, setVehiclePos] = useState<THREE.Vector3 | undefined>(undefined);

  // Initialize Game Data & Engine
  useEffect(() => {
    // 1. Detect Touch Device
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);

    // 2. Load Saved Game State
    const saved = EconomyManager.loadState();
    setStats(saved.stats);
    setPlots(saved.plots);
    setVehicles(saved.vehicles);
    setBusinesses(saved.businesses);
    setMissions(saved.missions);
    setActiveVehicleId(saved.activeVehicleId);

    // 3. Mount Three.js Engine
    if (canvasMountRef.current && !engineRef.current) {
      const engine = new GameEngine(canvasMountRef.current);
      engineRef.current = engine;

      // Populate neighborhood with loaded plots
      engine.populatePlots(saved.plots);

      // Spawn starter car
      const activeCar = saved.vehicles.find((v) => v.id === saved.activeVehicleId && v.isOwned) || saved.vehicles[0];
      if (activeCar) {
        engine.spawnVehicle(activeCar);
      }

      // Link callbacks
      engine.onContextActionChange = (text, action) => {
        setPromptText(text);
        setPromptAction(() => action);
      };

      engine.onPlayerMove = (pos, rotY) => {
        setPlayerPos(pos.clone());
        setPlayerRotY(rotY);
        setIsDriving(engine.isDriving);
      };

      engine.onVehicleMove = (vPos) => {
        setVehiclePos(vPos.clone());
      };

      engine.onTimeChange = (t) => {
        setDayNightTime(t);
      };

      // Start rendering loop
      engine.start();
    }

    // Custom Event for opening plot modal from 3D world
    const handleOpenPlotEvent = (e: CustomEvent<string>) => {
      const plotId = e.detail;
      setPlots((currentPlots) => {
        const found = currentPlots.find((p) => p.id === plotId);
        if (found) setSelectedPlot(found);
        return currentPlots;
      });
    };

    window.addEventListener('aimmer_open_plot', handleOpenPlotEvent as EventListener);

    return () => {
      window.removeEventListener('aimmer_open_plot', handleOpenPlotEvent as EventListener);
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, []);

  // 1-Second Tycoon Economy & Progression Tick
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Passive rent accumulation for rented properties
      setPlots((prevPlots) =>
        prevPlots.map((p) => {
          if (p.isOwned && p.rented) {
            const added = p.rentPerMin / 60;
            return {
              ...p,
              accumulatedRent: (p.accumulatedRent || 0) + added,
            };
          }
          return p;
        })
      );

      // 2. Passive commercial business revenue
      setBusinesses((prevBiz) => {
        let earnedFromBiz = 0;
        prevBiz.forEach((b) => {
          if (b.isOwned) {
            earnedFromBiz += b.incomePerMin / 60;
          }
        });

        if (earnedFromBiz > 0) {
          setStats((prev) => ({
            ...prev,
            money: Math.round(prev.money + earnedFromBiz),
          }));
        }
        return prevBiz;
      });

      // 3. Keep selectedPlot synced if open
      setSelectedPlot((curr) => {
        if (!curr) return null;
        return plots.find((p) => p.id === curr.id) || null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [plots]);

  // Periodic Auto-Save
  useEffect(() => {
    const saveTimer = setInterval(() => {
      if (plots.length > 0) {
        EconomyManager.saveState({
          stats,
          plots,
          vehicles,
          businesses,
          missions,
          activeVehicleId,
        });
      }
    }, 4000);

    return () => clearInterval(saveTimer);
  }, [stats, plots, vehicles, businesses, missions, activeVehicleId]);

  // Check & Update Missions and Level Progressions
  const checkMissions = useCallback(
    (currentStats: PlayerStats, currentPlots: PlotData[], currentVehicles: VehicleData[], currentBiz: BusinessData[]) => {
      const ownedPlotsCount = currentPlots.filter((p) => p.isOwned).length;
      const builtHousesCount = currentPlots.filter((p) => p.isOwned && p.stage >= 3).length;
      const rentedHousesCount = currentPlots.filter((p) => p.isOwned && p.rented).length;
      const luxuryCount = currentPlots.filter((p) => p.isOwned && p.stage === 5).length;
      const ownedBizCount = currentBiz.filter((b) => b.isOwned).length;

      let awardedMoney = 0;
      let awardedXp = 0;

      setMissions((prevMissions) =>
        prevMissions.map((m) => {
          if (m.isCompleted) return m;

          let shouldComplete = false;
          if (m.id === 'm_1_buy_land' && ownedPlotsCount >= 1) shouldComplete = true;
          if (m.id === 'm_1_foundation' && currentPlots.some((p) => p.stage >= 1)) shouldComplete = true;
          if (m.id === 'm_2_complete_house' && builtHousesCount >= 1) shouldComplete = true;
          if (m.id === 'm_2_furnish_rent' && rentedHousesCount >= 1) shouldComplete = true;
          if (m.id === 'm_3_multi_property' && ownedPlotsCount >= 3) shouldComplete = true;
          if (m.id === 'm_3_invest_biz' && ownedBizCount >= 1) shouldComplete = true;
          if (m.id === 'm_4_luxury_pool' && luxuryCount >= 1) shouldComplete = true;
          if (m.id === 'm_5_millionaire' && currentStats.money >= 500000) shouldComplete = true;

          if (shouldComplete) {
            awardedMoney += m.rewardMoney;
            awardedXp += m.rewardXp;
            return { ...m, isCompleted: true, progress: m.maxProgress };
          }
          return m;
        })
      );

      if (awardedMoney > 0 || awardedXp > 0) {
        sound.playLevelUp();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });

        setStats((prev) => {
          let newXp = prev.xp + awardedXp;
          let newLvl = prev.level;
          let newXpNeeded = prev.xpNeeded;
          let newStage = prev.currentStage;

          while (newXp >= newXpNeeded) {
            newXp -= newXpNeeded;
            newLvl += 1;
            newXpNeeded = Math.round(newXpNeeded * 1.5);
            newStage = Math.min(5, Math.floor(newLvl / 2) + 1);
          }

          return {
            ...prev,
            money: prev.money + awardedMoney,
            xp: newXp,
            level: newLvl,
            xpNeeded: newXpNeeded,
            currentStage: newStage,
          };
        });
      }
    },
    []
  );

  // --- Tycoon Actions ---

  const handleBuyPlot = (plotId: string) => {
    const targetPlot = plots.find((p) => p.id === plotId);
    if (!targetPlot || stats.money < targetPlot.price) return;

    const newMoney = stats.money - targetPlot.price;
    const updatedPlot: PlotData = {
      ...targetPlot,
      isOwned: true,
      stage: 0,
      marketValue: targetPlot.price,
    };

    const newPlots = plots.map((p) => (p.id === plotId ? updatedPlot : p));
    setPlots(newPlots);
    setSelectedPlot(updatedPlot);

    const newStats: PlayerStats = {
      ...stats,
      money: newMoney,
      totalSpent: stats.totalSpent + targetPlot.price,
      totalPropertiesOwned: stats.totalPropertiesOwned + 1,
    };
    setStats(newStats);

    // Update 3D scene mesh
    if (engineRef.current) {
      engineRef.current.updatePlotMesh(updatedPlot);
    }

    checkMissions(newStats, newPlots, vehicles, businesses);
  };

  const handleUpgradeStage = (plotId: string, nextStage: PlotStage) => {
    const targetPlot = plots.find((p) => p.id === plotId);
    if (!targetPlot) return;

    const stageCost = [0, 8000, 12000, 16000, 14000, 22000][nextStage];
    if (stats.money < stageCost) return;

    const baseValuationInc = stageCost * 1.6;
    const baseRentInc = [0, 0, 0, 350, 400, 800][nextStage];

    const updatedPlot: PlotData = {
      ...targetPlot,
      stage: nextStage,
      marketValue: targetPlot.marketValue + baseValuationInc,
      rentPerMin: targetPlot.rentPerMin + baseRentInc,
    };

    const newPlots = plots.map((p) => (p.id === plotId ? updatedPlot : p));
    setPlots(newPlots);
    setSelectedPlot(updatedPlot);

    const newStats: PlayerStats = {
      ...stats,
      money: stats.money - stageCost,
      totalSpent: stats.totalSpent + stageCost,
      totalHousesBuilt: nextStage >= 3 ? stats.totalHousesBuilt + 1 : stats.totalHousesBuilt,
    };
    setStats(newStats);

    // Rebuild 3D mesh for the house
    if (engineRef.current) {
      engineRef.current.updatePlotMesh(updatedPlot);
    }

    checkMissions(newStats, newPlots, vehicles, businesses);
  };

  const handleCustomizeColors = (plotId: string, wallColor: string, roofColor: string) => {
    const targetPlot = plots.find((p) => p.id === plotId);
    if (!targetPlot) return;

    const updatedPlot: PlotData = {
      ...targetPlot,
      wallColor,
      roofColor,
    };

    const newPlots = plots.map((p) => (p.id === plotId ? updatedPlot : p));
    setPlots(newPlots);
    setSelectedPlot(updatedPlot);

    if (engineRef.current) {
      engineRef.current.updatePlotMesh(updatedPlot);
    }
  };

  const handleRentOut = (plotId: string, tenantName: string, rent: number) => {
    const targetPlot = plots.find((p) => p.id === plotId);
    if (!targetPlot) return;

    const updatedPlot: PlotData = {
      ...targetPlot,
      rented: true,
      tenantName,
      rentPerMin: rent,
      lastRentCollectedTime: Date.now(),
    };

    const newPlots = plots.map((p) => (p.id === plotId ? updatedPlot : p));
    setPlots(newPlots);
    setSelectedPlot(updatedPlot);

    checkMissions(stats, newPlots, vehicles, businesses);
  };

  const handleCollectRent = (plotId: string) => {
    const targetPlot = plots.find((p) => p.id === plotId);
    if (!targetPlot || targetPlot.accumulatedRent <= 0) return;

    const rentCash = Math.round(targetPlot.accumulatedRent);
    const updatedPlot: PlotData = {
      ...targetPlot,
      accumulatedRent: 0,
      lastRentCollectedTime: Date.now(),
    };

    setPlots((prev) => prev.map((p) => (p.id === plotId ? updatedPlot : p)));
    setSelectedPlot(updatedPlot);

    setStats((prev) => ({
      ...prev,
      money: prev.money + rentCash,
      totalRentEarned: prev.totalRentEarned + rentCash,
    }));
  };

  const handleCollectAllRent = () => {
    let totalCash = 0;
    const newPlots = plots.map((p) => {
      if (p.isOwned && p.rented && p.accumulatedRent > 0) {
        totalCash += Math.round(p.accumulatedRent);
        return { ...p, accumulatedRent: 0, lastRentCollectedTime: Date.now() };
      }
      return p;
    });

    if (totalCash > 0) {
      setPlots(newPlots);
      setStats((prev) => ({
        ...prev,
        money: prev.money + totalCash,
        totalRentEarned: prev.totalRentEarned + totalCash,
      }));
    }
  };

  const handleRenovate = (plotId: string) => {
    const targetPlot = plots.find((p) => p.id === plotId);
    if (!targetPlot) return;

    const cost = Math.round(targetPlot.marketValue * 0.08);
    if (stats.money < cost) return;

    const updatedPlot: PlotData = {
      ...targetPlot,
      renovations: (targetPlot.renovations || 0) + 1,
      marketValue: Math.round(targetPlot.marketValue * 1.25),
      rentPerMin: Math.round(targetPlot.rentPerMin * 1.2),
    };

    const newPlots = plots.map((p) => (p.id === plotId ? updatedPlot : p));
    setPlots(newPlots);
    setSelectedPlot(updatedPlot);

    setStats((prev) => ({
      ...prev,
      money: prev.money - cost,
      totalSpent: prev.totalSpent + cost,
    }));
  };

  const handleSellPlot = (plotId: string) => {
    const targetPlot = plots.find((p) => p.id === plotId);
    if (!targetPlot) return;

    const payout = targetPlot.marketValue;
    const resetPlot: PlotData = {
      ...targetPlot,
      isOwned: false,
      stage: 0,
      rented: false,
      tenantName: undefined,
      accumulatedRent: 0,
      renovations: 0,
    };

    const newPlots = plots.map((p) => (p.id === plotId ? resetPlot : p));
    setPlots(newPlots);
    setSelectedPlot(null);

    setStats((prev) => ({
      ...prev,
      money: prev.money + payout,
      totalPropertiesOwned: Math.max(0, prev.totalPropertiesOwned - 1),
    }));

    if (engineRef.current) {
      engineRef.current.updatePlotMesh(resetPlot);
    }
  };

  const handleBuyVehicle = (vehicleId: string) => {
    const targetVeh = vehicles.find((v) => v.id === vehicleId);
    if (!targetVeh || stats.money < targetVeh.price) return;

    const updatedVehicles = vehicles.map((v) =>
      v.id === vehicleId ? { ...v, isOwned: true } : v
    );
    setVehicles(updatedVehicles);
    setActiveVehicleId(vehicleId);

    setStats((prev) => ({
      ...prev,
      money: prev.money - targetVeh.price,
      totalSpent: prev.totalSpent + targetVeh.price,
    }));

    if (engineRef.current) {
      engineRef.current.spawnVehicle(targetVeh);
    }
  };

  const handleSelectVehicle = (vehicleId: string) => {
    const targetVeh = vehicles.find((v) => v.id === vehicleId && v.isOwned);
    if (!targetVeh) return;

    setActiveVehicleId(vehicleId);
    if (engineRef.current) {
      engineRef.current.spawnVehicle(targetVeh);
    }
    sound.playCarHorn();
  };

  const handleInvestBusiness = (businessId: string) => {
    const targetBiz = businesses.find((b) => b.id === businessId);
    if (!targetBiz || stats.money < targetBiz.cost) return;

    const updatedBiz = businesses.map((b) =>
      b.id === businessId ? { ...b, isOwned: true } : b
    );
    setBusinesses(updatedBiz);

    const newStats: PlayerStats = {
      ...stats,
      money: stats.money - targetBiz.cost,
      totalSpent: stats.totalSpent + targetBiz.cost,
    };
    setStats(newStats);

    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    checkMissions(newStats, plots, vehicles, updatedBiz);
  };

  const handleClaimMissionReward = (missionId: string) => {
    // Already claimed on checkMissions
  };

  const handleSetTimeOfDay = (time: number) => {
    setDayNightTime(time);
    setAutoTime(false);
    if (engineRef.current) {
      engineRef.current.dayNightTime = time;
      engineRef.current.autoTime = false;
    }
  };

  const handleToggleAutoTime = () => {
    const next = !autoTime;
    setAutoTime(next);
    if (engineRef.current) {
      engineRef.current.autoTime = next;
    }
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleResetGame = () => {
    EconomyManager.resetGame();
    window.location.reload();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={canvasMountRef} className="absolute inset-0 z-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD Bar */}
      <TopBar
        stats={stats}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        dayNightTime={dayNightTime}
        promptText={promptText}
        promptAction={promptAction}
        isDriving={isDriving}
      />

      {/* Minimap (Top Left below top bar) */}
      <div className="fixed top-18 left-4 z-20">
        <Minimap
          playerPos={playerPos}
          playerRotation={playerRotY}
          vehiclePos={vehiclePos}
          plots={plots}
          onSelectPlot={(p) => setSelectedPlot(p)}
        />
      </div>

      {/* Mobile Virtual Controls */}
      {isTouchDevice && (
        <MobileControls
          onMove={(stick) => {
            if (engineRef.current) {
              engineRef.current.input.virtualStick = stick;
            }
          }}
          onRunToggle={(running) => {
            if (engineRef.current) {
              engineRef.current.input.run = running;
            }
          }}
          onInteract={() => {
            if (promptAction) promptAction();
          }}
          onDriveToggle={() => {
            if (engineRef.current) {
              engineRef.current.toggleDrive();
            }
          }}
          isDriving={isDriving}
          canInteract={!!promptText}
          interactLabel={promptText || 'INTERACT'}
          canDrive={promptText === 'Drive Vehicle'}
        />
      )}

      {/* Collapsible Bottom Tycoon Dock */}
      <TycoonDock
        stats={stats}
        plots={plots}
        vehicles={vehicles}
        businesses={businesses}
        missions={missions}
        activeVehicleId={activeVehicleId}
        dayNightTime={dayNightTime}
        autoTime={autoTime}
        onSelectPlot={(p) => setSelectedPlot(p)}
        onBuyVehicle={handleBuyVehicle}
        onSelectVehicle={handleSelectVehicle}
        onInvestBusiness={handleInvestBusiness}
        onClaimMissionReward={handleClaimMissionReward}
        onCollectAllRent={handleCollectAllRent}
        onSetTimeOfDay={handleSetTimeOfDay}
        onToggleAutoTime={handleToggleAutoTime}
        onResetGame={handleResetGame}
      />

      {/* Interactive Plot Construction & Property Modal */}
      {selectedPlot && (
        <PlotModal
          plot={selectedPlot}
          playerMoney={stats.money}
          onClose={() => setSelectedPlot(null)}
          onBuyPlot={handleBuyPlot}
          onUpgradeStage={handleUpgradeStage}
          onCustomizeColors={handleCustomizeColors}
          onRentOut={handleRentOut}
          onCollectRent={handleCollectRent}
          onRenovate={handleRenovate}
          onSellPlot={handleSellPlot}
        />
      )}
    </div>
  );
}
