/**
 * AIMMER HOUSE TYCOON - Procedural Texture Generator
 * Zero 404 dependencies - all textures rendered onto HTML5 Canvases
 */

import * as THREE from 'three';

const textureCache = new Map<string, THREE.CanvasTexture>();

function createProceduralTexture(
  key: string,
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.CanvasTexture {
  if (textureCache.has(key)) {
    return textureCache.get(key)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  draw(ctx, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache.set(key, texture);
  return texture;
}

// Asphalt Road with painted road marks
export function getRoadTexture(): THREE.CanvasTexture {
  return createProceduralTexture('road', 512, 512, (ctx, w, h) => {
    // Dark asphalt base with subtle noise
    ctx.fillStyle = '#26292e';
    ctx.fillRect(0, 0, w, h);

    // Fine aggregate noise
    ctx.fillStyle = '#1e2024';
    for (let i = 0; i < 4000; i++) {
      const rx = Math.random() * w;
      const ry = Math.random() * h;
      ctx.fillRect(rx, ry, 2, 2);
    }
    ctx.fillStyle = '#32363d';
    for (let i = 0; i < 3000; i++) {
      const rx = Math.random() * w;
      const ry = Math.random() * h;
      ctx.fillRect(rx, ry, 1, 1);
    }

    // Yellow dashed center line
    ctx.fillStyle = '#eab308';
    const dashLength = 60;
    const dashGap = 40;
    const centerX = w / 2;
    for (let y = 0; y < h; y += dashLength + dashGap) {
      ctx.fillRect(centerX - 4, y, 8, dashLength);
    }

    // White edge solid lines
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(16, 0, 8, h);
    ctx.fillRect(w - 24, 0, 8, h);
  });
}

// Concrete Sidewalk with tile seams
export function getSidewalkTexture(): THREE.CanvasTexture {
  return createProceduralTexture('sidewalk', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, w, h);

    // Subtle concrete grain
    ctx.fillStyle = '#8392a5';
    for (let i = 0; i < 2000; i++) {
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }

    // Tile seams
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, w - 4, h - 4);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
  });
}

// Grass with natural blade variations
export function getGrassTexture(): THREE.CanvasTexture {
  return createProceduralTexture('grass', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#2d6a36';
    ctx.fillRect(0, 0, w, h);

    // Varied green specks
    const greens = ['#23532a', '#347b3f', '#3b8b47', '#1e4824', '#47a155'];
    for (let i = 0; i < 8000; i++) {
      ctx.fillStyle = greens[Math.floor(Math.random() * greens.length)];
      ctx.fillRect(Math.random() * w, Math.random() * h, 3, 3);
    }
  });
}

// Hardwood Flooring
export function getWoodFloorTexture(): THREE.CanvasTexture {
  return createProceduralTexture('wood_floor', 512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#a16207';
    ctx.fillRect(0, 0, w, h);

    const plankHeight = 32;
    for (let y = 0; y < h; y += plankHeight) {
      const shade = Math.floor(130 + Math.random() * 50);
      ctx.fillStyle = `rgb(${shade + 20}, ${shade - 10}, ${Math.floor(shade * 0.4)})`;
      ctx.fillRect(0, y, w, plankHeight - 2);

      // Plank grain lines
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      for (let g = 0; g < 4; g++) {
        ctx.fillRect(0, y + 4 + g * 6, w, 1);
      }

      // Plank seams (horizontal and staggered vertical)
      ctx.fillStyle = '#451a03';
      ctx.fillRect(0, y + plankHeight - 2, w, 2);

      const stagger = (y / plankHeight) % 2 === 0 ? 0 : 128;
      for (let x = stagger; x < w; x += 256) {
        ctx.fillRect(x, y, 2, plankHeight);
      }
    }
  });
}

// Modern exterior facade wall pattern (light horizontal slats)
export function getModernWallTexture(baseColorHex: string = '#f1f5f9'): THREE.CanvasTexture {
  return createProceduralTexture(`modern_wall_${baseColorHex}`, 256, 256, (ctx, w, h) => {
    ctx.fillStyle = baseColorHex;
    ctx.fillRect(0, 0, w, h);

    // Subtle horizontal grooves
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let y = 0; y < h; y += 16) {
      ctx.fillRect(0, y, w, 2);
    }
  });
}

// Roof shingles
export function getRoofTexture(): THREE.CanvasTexture {
  return createProceduralTexture('roof_slate', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, w, h);

    const shingleH = 20;
    for (let y = 0; y < h; y += shingleH) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, y + shingleH - 2, w, 2);

      const offset = (y / shingleH) % 2 === 0 ? 0 : 25;
      for (let x = offset; x < w; x += 50) {
        ctx.fillRect(x, y, 2, shingleH);
      }
    }
  });
}

// Swimming Pool Water with caustics
export function getPoolWaterTexture(): THREE.CanvasTexture {
  return createProceduralTexture('pool_water', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, w, h);

    // Subtle caustic highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.arc(x, y, 15 + Math.random() * 25, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
      ctx.stroke();
    }
  });
}

// "FOR SALE" or "OWNED" Plot Signboard Texture
export function getSignTexture(title: string, sub: string, bgColor: string = '#dc2626'): THREE.CanvasTexture {
  const key = `sign_${title}_${sub}_${bgColor}`;
  return createProceduralTexture(key, 512, 256, (ctx, w, h) => {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 14;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 54px sans-serif';
    ctx.fillText(title, w / 2, h * 0.38);

    ctx.font = 'bold 36px monospace';
    ctx.fillText(sub, w / 2, h * 0.72);
  });
}
