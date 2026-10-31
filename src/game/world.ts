/**
 * AIMMER HOUSE TYCOON - 3D Open World Neighborhood
 * Features residential streets, sidewalks, commercial buildings, trees, streetlights, and parks.
 */

import * as THREE from 'three';
import { PlotData } from './types';
import { getRoadTexture, getSidewalkTexture, getGrassTexture } from './textures';

export interface WorldObjects {
  scene: THREE.Scene;
  sunLight: THREE.DirectionalLight;
  hemiLight: THREE.HemisphereLight;
  streetLights: THREE.PointLight[];
  streetLightBulbs: THREE.Mesh[];
  buildingWindowLights: THREE.Mesh[];
  interactableColliders: { id: string; type: 'plot' | 'car' | 'shop'; x: number; z: number; radius: number }[];
}

export class WorldBuilder {
  public static createNeighborhood(scene: THREE.Scene, plots: PlotData[]): WorldObjects {
    const streetLights: THREE.PointLight[] = [];
    const streetLightBulbs: THREE.Mesh[] = [];
    const buildingWindowLights: THREE.Mesh[] = [];
    const interactableColliders: { id: string; type: 'plot' | 'car' | 'shop'; x: number; z: number; radius: number }[] = [];

    // 1. Vast Terrain (Lush green landscape extending to the horizon)
    const terrainGeo = new THREE.PlaneGeometry(360, 360, 32, 32);
    terrainGeo.rotateX(-Math.PI / 2);
    const grassTex = getGrassTexture();
    grassTex.repeat.set(70, 70);
    const terrainMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.95,
      metalness: 0.05,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.position.y = 0;
    terrain.receiveShadow = true;
    scene.add(terrain);

    // Distant perimeter hills so world doesn't end abruptly
    this.createDistantHills(scene);

    // 2. Lighting Setup
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x1e3a1f, 0.7);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    sunLight.position.set(60, 80, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 250;
    const shadowD = 85;
    sunLight.shadow.camera.left = -shadowD;
    sunLight.shadow.camera.right = shadowD;
    sunLight.shadow.camera.top = shadowD;
    sunLight.shadow.camera.bottom = -shadowD;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    // 3. Road Network
    this.createRoadNetwork(scene);

    // 4. Commercial District (Shops & Aimmer HQ)
    this.createCommercialBuildings(scene, buildingWindowLights, interactableColliders);

    // 5. Town Square Central Park
    this.createTownPark(scene);

    // 6. Streetlights with actual glowing bulbs & point lights
    this.createStreetlights(scene, streetLights, streetLightBulbs);

    // 7. Decorative Trees & Benches along sidewalks
    this.createVegetationAndProps(scene);

    // 8. Register Plot Interaction Colliders
    plots.forEach((p) => {
      interactableColliders.push({
        id: p.id,
        type: 'plot',
        x: p.x,
        z: p.z + p.depth / 2 - 1.5,
        radius: 4.5,
      });
    });

    return {
      scene,
      sunLight,
      hemiLight,
      streetLights,
      streetLightBulbs,
      buildingWindowLights,
      interactableColliders,
    };
  }

  private static createDistantHills(scene: THREE.Scene) {
    const hillMat = new THREE.MeshStandardMaterial({
      color: 0x1e4620,
      roughness: 0.9,
    });

    const hillPositions = [
      [0, -140, 24, 60],
      [140, 0, 30, 70],
      [-140, 0, 26, 65],
      [0, 140, 28, 65],
      [-120, -120, 35, 80],
      [120, 120, 32, 75],
    ];

    hillPositions.forEach(([x, z, h, r]) => {
      const hill = new THREE.Mesh(new THREE.ConeGeometry(r, h, 16), hillMat);
      hill.position.set(x, h / 2, z);
      scene.add(hill);
    });
  }

  private static createRoadNetwork(scene: THREE.Scene) {
    const roadTex = getRoadTexture();
    const sidewalkTex = getSidewalkTexture();

    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: 0.8,
      metalness: 0.1,
    });

    const swMat = new THREE.MeshStandardMaterial({
      map: sidewalkTex,
      roughness: 0.85,
    });

    // Helper to create straight road segment with sidewalks
    const addRoad = (x: number, z: number, w: number, d: number, isVertical: boolean) => {
      // Asphalt road
      const rTex = roadTex.clone();
      rTex.repeat.set(isVertical ? 1 : d / 10, isVertical ? d / 10 : 1);
      const rMat = roadMat.clone();
      rMat.map = rTex;

      const road = new THREE.Mesh(new THREE.PlaneGeometry(w, d), rMat);
      road.rotateX(-Math.PI / 2);
      road.position.set(x, 0.03, z);
      road.receiveShadow = true;
      scene.add(road);

      // Sidewalks on both sides
      const swW = 2.2;
      const curbH = 0.12;

      if (isVertical) {
        // Left & Right sidewalks
        [-w / 2 - swW / 2, w / 2 + swW / 2].forEach((swX) => {
          const sw = new THREE.Mesh(new THREE.BoxGeometry(swW, curbH, d), swMat);
          sw.position.set(x + swX, curbH / 2, z);
          sw.receiveShadow = true;
          sw.castShadow = true;
          scene.add(sw);
        });
      } else {
        // Top & Bottom sidewalks
        [-d / 2 - swW / 2, d / 2 + swW / 2].forEach((swZ) => {
          const sw = new THREE.Mesh(new THREE.BoxGeometry(w, curbH, swW), swMat);
          sw.position.set(x, curbH / 2, z + swZ);
          sw.receiveShadow = true;
          sw.castShadow = true;
          scene.add(sw);
        });
      }
    };

    // Main Avenue (North-South) - 10m wide road, 180m long
    addRoad(0, 0, 10, 180, true);

    // Residential Boulevard (East-West) - crosses at center
    addRoad(0, 0, 180, 10, false);

    // North Residential Street
    addRoad(0, -50, 160, 8, false);

    // South Luxury Crest Street
    addRoad(0, 50, 160, 8, false);
  }

  private static createCommercialBuildings(
    scene: THREE.Scene,
    windowLights: THREE.Mesh[],
    interactables: { id: string; type: 'plot' | 'car' | 'shop'; x: number; z: number; radius: number }[]
  ) {
    const buildings = [
      {
        id: 'bank',
        name: 'AIMMER COMMERCIAL BANK',
        x: -28,
        z: -26,
        w: 18,
        h: 12,
        d: 14,
        color: 0x1e293b,
        accentColor: 0xeab308, // Gold
      },
      {
        id: 'agency',
        name: 'AIMMER REALTY HQ',
        x: 28,
        z: -26,
        w: 16,
        h: 10,
        d: 14,
        color: 0x0f172a,
        accentColor: 0x3b82f6, // Blue
      },
      {
        id: 'cafe',
        name: 'SUNSET CAFE & BAKERY',
        x: -28,
        z: 26,
        w: 14,
        h: 6.5,
        d: 12,
        color: 0x451a03,
        accentColor: 0xf97316, // Orange
      },
      {
        id: 'dealership',
        name: 'LUXURY MOTORS SHOWROOM',
        x: 28,
        z: 26,
        w: 18,
        h: 8.5,
        d: 16,
        color: 0x18181b,
        accentColor: 0xef4444, // Red
      },
    ];

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85,
    });

    const windowLightMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
    });

    buildings.forEach((b) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(b.x, 0, b.z);

      // Main structural block
      const bodyMat = new THREE.MeshStandardMaterial({
        color: b.color,
        roughness: 0.4,
        metalness: 0.2,
      });
      const body = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), bodyMat);
      body.position.y = b.h / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      bGroup.add(body);

      // Large Glass Storefront Front
      const glassFront = new THREE.Mesh(new THREE.PlaneGeometry(b.w * 0.8, b.h * 0.4), glassMat);
      glassFront.position.set(0, b.h * 0.3, b.d / 2 + 0.05);
      bGroup.add(glassFront);

      // Night Window Glow Interior Mesh
      const winGlow = new THREE.Mesh(new THREE.PlaneGeometry(b.w * 0.78, b.h * 0.38), windowLightMat);
      winGlow.position.set(0, b.h * 0.3, b.d / 2 + 0.04);
      winGlow.visible = false;
      bGroup.add(winGlow);
      windowLights.push(winGlow);

      // Roof Fascia / Accent Trim
      const trim = new THREE.Mesh(
        new THREE.BoxGeometry(b.w + 0.8, 0.6, b.d + 0.8),
        new THREE.MeshStandardMaterial({ color: b.accentColor, roughness: 0.3, metalness: 0.5 })
      );
      trim.position.y = b.h + 0.3;
      trim.castShadow = true;
      bGroup.add(trim);

      // Entrance canopy
      const canopy = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 0.2, 2.5),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
      );
      canopy.position.set(0, 3.2, b.d / 2 + 1.2);
      canopy.castShadow = true;
      bGroup.add(canopy);

      // Shop Signboard
      const signMesh = new THREE.Mesh(
        new THREE.BoxGeometry(b.w * 0.6, 1.2, 0.2),
        new THREE.MeshStandardMaterial({ color: b.accentColor, roughness: 0.3 })
      );
      signMesh.position.set(0, b.h * 0.75, b.d / 2 + 0.15);
      signMesh.castShadow = true;
      bGroup.add(signMesh);

      scene.add(bGroup);

      // Add shop interactable collider
      interactables.push({
        id: b.id,
        type: 'shop',
        x: b.x,
        z: b.z + b.d / 2 + 1.5,
        radius: 4.5,
      });
    });
  }

  private static createTownPark(scene: THREE.Scene) {
    const parkGroup = new THREE.Group();
    parkGroup.position.set(0, 0, 0);

    // Circular stone fountain in central roundabout / park
    const fountainBase = new THREE.Mesh(
      new THREE.CylinderGeometry(5.5, 6.0, 0.9, 24),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 })
    );
    fountainBase.position.y = 0.45;
    fountainBase.castShadow = true;
    fountainBase.receiveShadow = true;
    parkGroup.add(fountainBase);

    // Water surface inside fountain
    const water = new THREE.Mesh(
      new THREE.CylinderGeometry(5.0, 5.0, 0.1, 24),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85,
      })
    );
    water.position.y = 0.75;
    parkGroup.add(water);

    // Fountain Center Spire
    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.9, 3.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6 })
    );
    spire.position.y = 1.6;
    spire.castShadow = true;
    parkGroup.add(spire);

    // Tier bowl
    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 1.4, 0.5, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 })
    );
    bowl.position.y = 2.4;
    bowl.castShadow = true;
    parkGroup.add(bowl);

    scene.add(parkGroup);
  }

  private static createStreetlights(
    scene: THREE.Scene,
    lights: THREE.PointLight[],
    bulbs: THREE.Mesh[]
  ) {
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.7,
      roughness: 0.3,
    });

    const lampBulbMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfef08a,
      emissiveIntensity: 0.8,
      roughness: 0.1,
    });

    // Streetlight positions along main avenue & streets
    const positions: [number, number][] = [
      [-6.5, -60],
      [6.5, -40],
      [-6.5, -20],
      [6.5, 20],
      [-6.5, 40],
      [6.5, 60],
      [-40, -6.5],
      [40, 6.5],
      [-60, -6.5],
      [60, 6.5],
    ];

    positions.forEach(([x, z]) => {
      const poleGroup = new THREE.Group();
      poleGroup.position.set(x, 0, z);

      // Vertical steel pole (6m tall)
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 5.8, 8), poleMat);
      pole.position.y = 2.9;
      pole.castShadow = true;
      poleGroup.add(pole);

      // Curved arm reaching toward road
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.6), poleMat);
      arm.position.set(0, 5.6, x > 0 ? -0.8 : 0.8);
      poleGroup.add(arm);

      // Lamp housing
      const housing = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.3, 8), poleMat);
      housing.position.set(0, 5.5, x > 0 ? -1.5 : 1.5);
      poleGroup.add(housing);

      // Glowing bulb
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), lampBulbMat);
      bulb.position.set(0, 5.35, x > 0 ? -1.5 : 1.5);
      poleGroup.add(bulb);
      bulbs.push(bulb);

      // Light source
      const ptLight = new THREE.PointLight(0xfef08a, 0.8, 16);
      ptLight.position.set(0, 5.2, x > 0 ? -1.5 : 1.5);
      ptLight.castShadow = false;
      poleGroup.add(ptLight);
      lights.push(ptLight);

      scene.add(poleGroup);
    });
  }

  private static createVegetationAndProps(scene: THREE.Scene) {
    // Tree trunk & foliage materials
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.9 });
    const foliageMat1 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });
    const foliageMatPine = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.85 });

    const createOakTree = (x: number, z: number, scale: number = 1.0) => {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);

      // Trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * scale, 0.45 * scale, 2.8 * scale, 8), trunkMat);
      trunk.position.y = 1.4 * scale;
      trunk.castShadow = true;
      tree.add(trunk);

      // Foliage clusters (3 layered canopy spheres for organic volume)
      const c1 = new THREE.Mesh(new THREE.SphereGeometry(1.8 * scale, 8, 8), foliageMat1);
      c1.position.set(0, 3.6 * scale, 0);
      c1.castShadow = true;
      tree.add(c1);

      const c2 = new THREE.Mesh(new THREE.SphereGeometry(1.4 * scale, 8, 8), foliageMat2);
      c2.position.set(0.6 * scale, 4.4 * scale, 0.4 * scale);
      c2.castShadow = true;
      tree.add(c2);

      const c3 = new THREE.Mesh(new THREE.SphereGeometry(1.2 * scale, 8, 8), foliageMat1);
      c3.position.set(-0.5 * scale, 4.2 * scale, -0.4 * scale);
      c3.castShadow = true;
      tree.add(c3);

      scene.add(tree);
    };

    const createPineTree = (x: number, z: number, scale: number = 1.0) => {
      const pine = new THREE.Group();
      pine.position.set(x, 0, z);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * scale, 0.35 * scale, 2.2 * scale, 8), trunkMat);
      trunk.position.y = 1.1 * scale;
      trunk.castShadow = true;
      pine.add(trunk);

      // 3 Conical foliage tiers
      [
        { r: 2.2 * scale, h: 2.4 * scale, y: 2.5 * scale },
        { r: 1.7 * scale, h: 2.0 * scale, y: 3.8 * scale },
        { r: 1.1 * scale, h: 1.8 * scale, y: 5.0 * scale },
      ].forEach((tier) => {
        const c = new THREE.Mesh(new THREE.ConeGeometry(tier.r, tier.h, 8), foliageMatPine);
        c.position.y = tier.y;
        c.castShadow = true;
        pine.add(c);
      });

      scene.add(pine);
    };

    // Plant trees along sidewalks, parks, and estate borders
    const treeCoords: [number, number, 'oak' | 'pine', number][] = [
      // Along north avenue
      [-14, -68, 'oak', 1.1],
      [14, -72, 'pine', 1.2],
      [-14, -42, 'oak', 0.95],
      [14, -38, 'oak', 1.0],
      // Around Town Park
      [-12, -12, 'oak', 1.15],
      [12, -12, 'oak', 1.0],
      [-12, 12, 'pine', 1.3],
      [12, 12, 'oak', 1.1],
      // Along south boulevard
      [-14, 42, 'oak', 1.0],
      [14, 42, 'pine', 1.2],
      [-14, 72, 'pine', 1.1],
      [14, 68, 'oak', 1.05],
      // Side streets
      [-65, -14, 'oak', 1.1],
      [-45, -14, 'pine', 1.0],
      [45, -14, 'oak', 0.9],
      [65, -14, 'pine', 1.2],
      [-65, 14, 'pine', 1.1],
      [65, 14, 'oak', 1.2],
    ];

    treeCoords.forEach(([x, z, type, s]) => {
      if (type === 'oak') createOakTree(x, z, s);
      else createPineTree(x, z, s);
    });

    // Park Benches
    const benchPositions: [number, number, number][] = [
      [-6, -6, 0],
      [6, -6, Math.PI],
      [-6, 6, 0],
      [6, 6, Math.PI],
    ];

    const benchWoodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const benchLegMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });

    benchPositions.forEach(([bx, bz, rotY]) => {
      const bench = new THREE.Group();
      bench.position.set(bx, 0, bz);
      bench.rotation.y = rotY;

      // Legs
      [-0.7, 0.7].forEach((lx) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.45), benchLegMat);
        leg.position.set(lx, 0.25, 0);
        bench.add(leg);
      });

      // Wooden Seat Slats
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.5), benchWoodMat);
      seat.position.set(0, 0.48, 0);
      seat.castShadow = true;
      bench.add(seat);

      // Backrest
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 0.06), benchWoodMat);
      back.position.set(0, 0.72, -0.22);
      back.castShadow = true;
      bench.add(back);

      scene.add(bench);
    });
  }
}
