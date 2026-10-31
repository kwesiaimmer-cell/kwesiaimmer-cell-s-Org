/**
 * AIMMER HOUSE TYCOON - Interactive 2D Canvas Minimap
 */

import React, { useEffect, useRef } from 'react';
import { PlotData } from '../game/types';
import * as THREE from 'three';

interface MinimapProps {
  playerPos: THREE.Vector3;
  playerRotation: number;
  vehiclePos?: THREE.Vector3;
  plots: PlotData[];
  onSelectPlot?: (plot: PlotData) => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  playerPos,
  playerRotation,
  vehiclePos,
  plots,
  onSelectPlot,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Coordinate mapping: World (-90 to 90) -> Canvas (0 to w)
    const mapScale = w / 180;
    const toCanvasX = (worldX: number) => w / 2 + worldX * mapScale;
    const toCanvasY = (worldZ: number) => h / 2 + worldZ * mapScale;

    // 1. Draw Roads
    ctx.fillStyle = '#334155';
    // Main North-South Avenue (10m wide)
    ctx.fillRect(toCanvasX(-5), 0, 10 * mapScale, h);
    // Residential Boulevard East-West (10m wide)
    ctx.fillRect(0, toCanvasY(-5), w, 10 * mapScale);
    // North & South streets
    ctx.fillRect(0, toCanvasY(-54), w, 8 * mapScale);
    ctx.fillRect(0, toCanvasY(46), w, 8 * mapScale);

    // Central park circle
    ctx.fillStyle = '#1e3a1f';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 8 * mapScale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 4 * mapScale, 0, Math.PI * 2);
    ctx.fill();

    // 2. Draw Plots
    plots.forEach((p) => {
      const px = toCanvasX(p.x - p.width / 2);
      const py = toCanvasY(p.z - p.depth / 2);
      const pw = p.width * mapScale;
      const ph = p.depth * mapScale;

      // Fill style based on status
      if (p.isOwned) {
        if (p.rented) {
          ctx.fillStyle = 'rgba(22, 163, 74, 0.4)'; // Green for rented
          ctx.strokeStyle = '#22c55e';
        } else {
          ctx.fillStyle = 'rgba(37, 99, 235, 0.4)'; // Blue for owned
          ctx.strokeStyle = '#3b82f6';
        }
      } else {
        ctx.fillStyle = 'rgba(220, 38, 38, 0.25)'; // Red for sale
        ctx.strokeStyle = '#ef4444';
      }

      ctx.lineWidth = 1.5;
      ctx.fillRect(px, py, pw, ph);
      ctx.strokeRect(px, py, pw, ph);

      // Plot Stage Icon / Number
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = p.isOwned ? `S${p.stage}` : `$${Math.round(p.price / 1000)}k`;
      ctx.fillText(label, px + pw / 2, py + ph / 2);
    });

    // 3. Draw Vehicle (if exists)
    if (vehiclePos) {
      const vx = toCanvasX(vehiclePos.x);
      const vy = toCanvasY(vehiclePos.z);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(vx - 3, vy - 3, 6, 6);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(vx - 3, vy - 3, 6, 6);
    }

    // 4. Draw Player Heading Pointer
    const pX = toCanvasX(playerPos.x);
    const pY = toCanvasY(playerPos.z);

    ctx.save();
    ctx.translate(pX, pY);
    ctx.rotate(playerRotation);

    // Player arrow
    ctx.fillStyle = '#10b981'; // Vibrant emerald green
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 7);
    ctx.lineTo(-5, -6);
    ctx.lineTo(0, -3);
    ctx.lineTo(5, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }, [playerPos, playerRotation, vehiclePos, plots]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSelectPlot) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const w = canvas.width;
    const h = canvas.height;
    const mapScale = w / 180;
    const worldX = (clickX - w / 2) / mapScale;
    const worldZ = (clickY - h / 2) / mapScale;

    // Check if clicked inside any plot
    const clickedPlot = plots.find(
      (p) =>
        worldX >= p.x - p.width / 2 &&
        worldX <= p.x + p.width / 2 &&
        worldZ >= p.z - p.depth / 2 &&
        worldZ <= p.z + p.depth / 2
    );

    if (clickedPlot) {
      onSelectPlot(clickedPlot);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900/90 shadow-xl backdrop-blur-none p-1.5 pointer-events-auto">
      <div className="flex items-center justify-between pb-1 px-1">
        <span className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">Minimap</span>
        <span className="text-[10px] font-mono text-emerald-400 font-semibold">N ↑</span>
      </div>
      <canvas
        ref={canvasRef}
        width={150}
        height={150}
        onClick={handleClick}
        className="rounded-xl cursor-pointer block"
      />
      <div className="flex items-center justify-between mt-1 px-1 text-[9px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-red-500 inline-block"></span>Sale
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-blue-500 inline-block"></span>Owned
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block"></span>Rent
        </span>
      </div>
    </div>
  );
};
