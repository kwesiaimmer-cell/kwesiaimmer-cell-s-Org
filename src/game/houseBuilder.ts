/**
 * AIMMER HOUSE TYCOON - Procedural House & Property Builder
 * Builds realistic, multi-part 3D properties from foundation to luxury mansions.
 */

import * as THREE from 'three';
import { PlotData } from './types';
import {
  getGrassTexture,
  getWoodFloorTexture,
  getModernWallTexture,
  getRoofTexture,
  getPoolWaterTexture,
  getSignTexture,
} from './textures';

export class HouseBuilder {
  /**
   * Builds or updates the 3D group for a given plot based on its current stage.
   */
  public static buildPlot(plot: PlotData): THREE.Group {
    const group = new THREE.Group();
    group.name = `plot_${plot.id}`;
    group.position.set(plot.x, 0, plot.z);

    // 1. Lot Terrain Base (Lawn & Boundaries)
    const lotBaseGeo = new THREE.PlaneGeometry(plot.width, plot.depth);
    lotBaseGeo.rotateX(-Math.PI / 2);
    const grassTex = getGrassTexture().clone();
    grassTex.repeat.set(plot.width / 4, plot.depth / 4);
    const lotBaseMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.9,
      metalness: 0.05,
    });
    const lotBase = new THREE.Mesh(lotBaseGeo, lotBaseMat);
    lotBase.position.y = 0.02; // Grounded flush above road
    lotBase.receiveShadow = true;
    group.add(lotBase);

    // Stone Curb Boundary border
    this.addBoundaryBorder(group, plot);

    // 2. Stage-Specific Construction
    if (plot.stage === 0) {
      this.buildStage0(group, plot);
    } else if (plot.stage === 1) {
      this.buildStage1(group, plot);
    } else if (plot.stage === 2) {
      this.buildStage2(group, plot);
    } else if (plot.stage === 3) {
      this.buildStage3(group, plot);
    } else if (plot.stage === 4) {
      this.buildStage4(group, plot);
    } else if (plot.stage === 5) {
      this.buildStage5(group, plot);
    }

    return group;
  }

  private static addBoundaryBorder(group: THREE.Group, plot: PlotData) {
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.8,
    });
    const h = 0.12;
    const t = 0.25;

    // North & South
    const nsGeo = new THREE.BoxGeometry(plot.width, h, t);
    const nBorder = new THREE.Mesh(nsGeo, borderMat);
    nBorder.position.set(0, h / 2, -plot.depth / 2);
    const sBorder = new THREE.Mesh(nsGeo, borderMat);
    sBorder.position.set(0, h / 2, plot.depth / 2);

    // East & West
    const ewGeo = new THREE.BoxGeometry(t, h, plot.depth);
    const eBorder = new THREE.Mesh(ewGeo, borderMat);
    eBorder.position.set(plot.width / 2, h / 2, 0);
    const wBorder = new THREE.Mesh(ewGeo, borderMat);
    wBorder.position.set(-plot.width / 2, h / 2, 0);

    group.add(nBorder, sBorder, eBorder, wBorder);
  }

  // Stage 0: Empty Plot with For Sale / Owned Sign and Survey Stakes
  private static buildStage0(group: THREE.Group, plot: PlotData) {
    // 4 Corner survey stakes with orange ribbon
    const stakeGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
    const stakeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
    const corners = [
      [-plot.width / 2 + 0.6, -plot.depth / 2 + 0.6],
      [plot.width / 2 - 0.6, -plot.depth / 2 + 0.6],
      [-plot.width / 2 + 0.6, plot.depth / 2 - 0.6],
      [plot.width / 2 - 0.6, plot.depth / 2 - 0.6],
    ];

    corners.forEach(([cx, cz]) => {
      const stake = new THREE.Mesh(stakeGeo, stakeMat);
      stake.position.set(cx, 0.4, cz);
      stake.castShadow = true;
      group.add(stake);

      // Survey flag ribbon
      const flagGeo = new THREE.ConeGeometry(0.12, 0.2, 4);
      flagGeo.rotateZ(Math.PI / 2);
      const flagMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const flag = new THREE.Mesh(flagGeo, flagMat);
      flag.position.set(cx + 0.08, 0.75, cz);
      group.add(flag);
    });

    // Real estate sign in front
    const signGroup = new THREE.Group();
    signGroup.position.set(0, 0, plot.depth / 2 - 1.5);

    // Post
    const postGeo = new THREE.BoxGeometry(0.12, 1.8, 0.12);
    const postMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.y = 0.9;
    post.castShadow = true;
    signGroup.add(post);

    // Signboard
    const boardGeo = new THREE.BoxGeometry(1.6, 1.0, 0.08);
    const signTex = plot.isOwned
      ? getSignTexture('OWNED', 'PLOT RESERVED', '#16a34a')
      : getSignTexture('FOR SALE', `$${plot.price.toLocaleString()}`, '#dc2626');
    const boardMat = new THREE.MeshStandardMaterial({
      map: signTex,
      roughness: 0.4,
    });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, 1.6, 0);
    board.castShadow = true;
    signGroup.add(board);

    group.add(signGroup);
  }

  // Stage 1: Poured Foundation Slab & Rebar
  private static buildStage1(group: THREE.Group, plot: PlotData) {
    const houseW = plot.width * 0.72;
    const houseD = plot.depth * 0.68;
    const slabH = 0.45;

    // Concrete slab
    const slabGeo = new THREE.BoxGeometry(houseW, slabH, houseD);
    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.85,
    });
    const slab = new THREE.Mesh(slabGeo, slabMat);
    slab.position.set(0, slabH / 2, -1);
    slab.receiveShadow = true;
    slab.castShadow = true;
    group.add(slab);

    // Rebar Pillars sticking out at corners & walls
    const rebarMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.8,
      roughness: 0.4,
    });
    const rebarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6);

    const rebarPositions = [
      [-houseW / 2 + 0.3, -houseD / 2 + 0.3],
      [houseW / 2 - 0.3, -houseD / 2 + 0.3],
      [-houseW / 2 + 0.3, houseD / 2 - 0.3],
      [houseW / 2 - 0.3, houseD / 2 - 0.3],
      [0, -houseD / 2 + 0.3],
      [0, houseD / 2 - 0.3],
    ];

    rebarPositions.forEach(([rx, rz]) => {
      const rebar = new THREE.Mesh(rebarGeo, rebarMat);
      rebar.position.set(rx, slabH + 0.9, -1 + rz);
      rebar.castShadow = true;
      group.add(rebar);
    });

    // Construction Cones & Pallets of Bricks
    this.addConstructionProps(group, plot);
  }

  // Stage 2: Framing & Wall Structure
  private static buildStage2(group: THREE.Group, plot: PlotData) {
    this.buildStage1(group, plot);

    const houseW = plot.width * 0.72;
    const houseD = plot.depth * 0.68;
    const wallH = 2.8;
    const slabH = 0.45;

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Timber frame wood
      roughness: 0.7,
    });

    // Wall frames
    const frameWall = (w: number, h: number, d: number, x: number, y: number, z: number) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), frameMat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    };

    // Back wall
    frameWall(houseW, wallH, 0.25, 0, slabH + wallH / 2, -1 - houseD / 2 + 0.12);
    // Left wall
    frameWall(0.25, wallH, houseD, -houseW / 2 + 0.12, slabH + wallH / 2, -1);
    // Right wall
    frameWall(0.25, wallH, houseD, houseW / 2 - 0.12, slabH + wallH / 2, -1);
    // Front wall with door opening in middle
    const frontHalfW = (houseW - 1.8) / 2;
    frameWall(frontHalfW, wallH, 0.25, -houseW / 2 + frontHalfW / 2, slabH + wallH / 2, -1 + houseD / 2 - 0.12);
    frameWall(frontHalfW, wallH, 0.25, houseW / 2 - frontHalfW / 2, slabH + wallH / 2, -1 + houseD / 2 - 0.12);
    // Lintel over door
    frameWall(1.8, 0.5, 0.25, 0, slabH + wallH - 0.25, -1 + houseD / 2 - 0.12);

    // Scaffolding tower outside
    const scaffMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.7, roughness: 0.3 });
    const scaffH = 3.6;
    const scaffPostGeo = new THREE.CylinderGeometry(0.05, 0.05, scaffH, 8);
    [
      [houseW / 2 + 0.8, -1 - houseD / 4],
      [houseW / 2 + 1.8, -1 - houseD / 4],
      [houseW / 2 + 0.8, -1 + houseD / 4],
      [houseW / 2 + 1.8, -1 + houseD / 4],
    ].forEach(([sx, sz]) => {
      const p = new THREE.Mesh(scaffPostGeo, scaffMat);
      p.position.set(sx, scaffH / 2, sz);
      p.castShadow = true;
      group.add(p);
    });

    // Scaffolding wood plank platform
    const plankMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 });
    const plank = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 2.4), plankMat);
    plank.position.set(houseW / 2 + 1.3, 2.2, -1);
    plank.castShadow = true;
    group.add(plank);
  }

  // Stage 3: Exterior Siding, Windows, Front Door & Pitched/Flat Roof
  private static buildStage3(group: THREE.Group, plot: PlotData) {
    const houseW = plot.width * 0.72;
    const houseD = plot.depth * 0.68;
    const wallH = 3.2;
    const slabH = 0.45;

    // 1. Concrete Foundation
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(houseW + 0.4, slabH, houseD + 0.4),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 })
    );
    slab.position.set(0, slabH / 2, -1);
    slab.castShadow = true;
    slab.receiveShadow = true;
    group.add(slab);

    // 2. Main Wall Body
    const wallTex = getModernWallTexture(plot.wallColor);
    wallTex.repeat.set(4, 2);
    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.5,
      metalness: 0.05,
    });
    const mainHouse = new THREE.Mesh(
      new THREE.BoxGeometry(houseW, wallH, houseD),
      wallMat
    );
    mainHouse.position.set(0, slabH + wallH / 2, -1);
    mainHouse.castShadow = true;
    mainHouse.receiveShadow = true;
    group.add(mainHouse);

    // 3. Modern Glass Windows (Reflective)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transmission: 0.85,
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.8,
    });
    const frameTrimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });

    // Front large modern picture windows
    [-houseW * 0.3, houseW * 0.3].forEach((wx) => {
      // Window Frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 0.15), frameTrimMat);
      frame.position.set(wx, slabH + 1.8, -1 + houseD / 2 + 0.05);
      group.add(frame);

      // Glass Pane
      const glass = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 0.05), glassMat);
      glass.position.set(wx, slabH + 1.8, -1 + houseD / 2 + 0.06);
      group.add(glass);
    });

    // 4. Stylish Front Door with handle & steps
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.3, 0.2), frameTrimMat);
    doorFrame.position.set(0, slabH + 1.15, -1 + houseD / 2 + 0.05);
    group.add(doorFrame);

    const doorMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 }); // Rich Walnut Door
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.15, 0.1), doorMat);
    door.position.set(0, slabH + 1.15, -1 + houseD / 2 + 0.08);
    door.castShadow = true;
    group.add(door);

    // Silver door handle
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), handleMat);
    handle.position.set(0.4, slabH + 1.15, -1 + houseD / 2 + 0.15);
    group.add(handle);

    // Entrance Porch Steps
    const stepGeo = new THREE.BoxGeometry(2.0, 0.22, 1.0);
    const stepMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
    const step = new THREE.Mesh(stepGeo, stepMat);
    step.position.set(0, 0.11, -1 + houseD / 2 + 0.5);
    step.castShadow = true;
    step.receiveShadow = true;
    group.add(step);

    // 5. Roof: Modern architectural roof overhang with slate tiles
    const roofTex = getRoofTexture();
    roofTex.repeat.set(3, 3);
    const roofMat = new THREE.MeshStandardMaterial({
      map: roofTex,
      color: new THREE.Color(plot.roofColor),
      roughness: 0.6,
    });

    if (plot.style === 'modern') {
      // Modern cantilever flat roof with trim
      const roofMesh = new THREE.Mesh(
        new THREE.BoxGeometry(houseW + 1.2, 0.4, houseD + 1.2),
        roofMat
      );
      roofMesh.position.set(0, slabH + wallH + 0.2, -1);
      roofMesh.castShadow = true;
      group.add(roofMesh);

      // Upper parapet accent
      const upperTrim = new THREE.Mesh(
        new THREE.BoxGeometry(houseW * 0.6, 0.8, houseD * 0.5),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 })
      );
      upperTrim.position.set(-houseW * 0.15, slabH + wallH + 0.6, -1);
      upperTrim.castShadow = true;
      group.add(upperTrim);
    } else {
      // Pitched Gable Roof
      const roofHeight = 2.0;
      const roofGeo = new THREE.ConeGeometry((houseW + 1.5) * 0.7, roofHeight, 4);
      roofGeo.rotateY(Math.PI / 4);
      const pitchedRoof = new THREE.Mesh(roofGeo, roofMat);
      pitchedRoof.position.set(0, slabH + wallH + roofHeight / 2, -1);
      pitchedRoof.scale.set(1.1, 1, (houseD + 1.5) / (houseW + 1.5));
      pitchedRoof.castShadow = true;
      group.add(pitchedRoof);
    }

    // Porch Outdoor Light Sconce
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 0.2), lampMat);
    lamp.position.set(0.8, slabH + 1.8, -1 + houseD / 2 + 0.12);
    group.add(lamp);

    // Warm light glow
    const porchLight = new THREE.PointLight(0xfef08a, 1.2, 6);
    porchLight.position.set(0.8, slabH + 1.8, -1 + houseD / 2 + 0.3);
    group.add(porchLight);
  }

  // Stage 4: Furnished Interior (Wood Flooring, Sofa, Dining, Flat Screen TV, Indoor Plants)
  private static buildStage4(group: THREE.Group, plot: PlotData) {
    this.buildStage3(group, plot);

    const houseW = plot.width * 0.72;
    const houseD = plot.depth * 0.68;
    const slabH = 0.45;

    // Hardwood Flooring
    const floorGeo = new THREE.PlaneGeometry(houseW - 0.2, houseD - 0.2);
    floorGeo.rotateX(-Math.PI / 2);
    const floorTex = getWoodFloorTexture();
    floorTex.repeat.set(2, 2);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.3,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, slabH + 0.02, -1);
    floor.receiveShadow = true;
    group.add(floor);

    // Modern Interior Furniture
    // L-Shaped Sofa (Nordic Grey)
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.9), sofaMat);
    sofaBase.position.set(-houseW * 0.2, slabH + 0.23, -1);
    sofaBase.castShadow = true;
    group.add(sofaBase);

    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.25), sofaMat);
    sofaBack.position.set(-houseW * 0.2, slabH + 0.6, -1 - 0.35);
    group.add(sofaBack);

    // Coffee table
    const tableMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.4 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.6), tableMat);
    table.position.set(-houseW * 0.2, slabH + 0.18, -1 + 0.75);
    table.castShadow = true;
    group.add(table);

    // Mounted Flat-screen TV
    const tvMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.1, metalness: 0.8 });
    const tv = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 0.08), tvMat);
    tv.position.set(-houseW * 0.2, slabH + 1.6, -1 + houseD * 0.42);
    group.add(tv);

    // Indoor Dining Table & Chairs
    const diningMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const diningTable = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.75, 1.0), diningMat);
    diningTable.position.set(houseW * 0.22, slabH + 0.38, -1);
    diningTable.castShadow = true;
    group.add(diningTable);

    // Potted Fiddle Leaf Fig Plant
    const potMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.45, 12), potMat);
    pot.position.set(-houseW * 0.42, slabH + 0.23, -1 - houseD * 0.35);
    group.add(pot);

    const plantLeaves = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 })
    );
    plantLeaves.position.set(-houseW * 0.42, slabH + 0.6, -1 - houseD * 0.35);
    group.add(plantLeaves);
  }

  // Stage 5: Luxury Estate (Swimming Pool, Pool Deck, Sun Loungers, Hedges, Paver Driveway)
  private static buildStage5(group: THREE.Group, plot: PlotData) {
    this.buildStage4(group, plot);

    // 1. Turquoise Swimming Pool
    const poolW = Math.min(plot.width * 0.42, 6.0);
    const poolD = Math.min(plot.depth * 0.36, 5.0);
    const poolX = plot.width * 0.24;
    const poolZ = plot.depth * 0.24;

    // Pool surround coping stone
    const copingMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
    const coping = new THREE.Mesh(new THREE.BoxGeometry(poolW + 0.8, 0.15, poolD + 0.8), copingMat);
    coping.position.set(poolX, 0.08, poolZ);
    coping.receiveShadow = true;
    group.add(coping);

    // Pool Water Surface
    const poolWaterMat = new THREE.MeshPhysicalMaterial({
      map: getPoolWaterTexture(),
      color: 0x38bdf8,
      transmission: 0.6,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
      metalness: 0.1,
    });
    const poolWater = new THREE.Mesh(new THREE.PlaneGeometry(poolW, poolD), poolWaterMat);
    poolWater.rotateX(-Math.PI / 2);
    poolWater.position.set(poolX, 0.1, poolZ);
    group.add(poolWater);

    // Underwater illumination
    const poolLight = new THREE.PointLight(0x38bdf8, 2.0, 8);
    poolLight.position.set(poolX, 0.2, poolZ);
    group.add(poolLight);

    // 2. Reclining Sun Loungers & Parasol
    const loungerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    [-1.2, 1.2].forEach((lx) => {
      const lounger = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 1.8), loungerMat);
      lounger.position.set(poolX + lx, 0.18, poolZ + poolD / 2 + 1.2);
      lounger.castShadow = true;
      group.add(lounger);
    });

    // Sun Umbrella (Parasol)
    const umbrellaPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
    );
    umbrellaPole.position.set(poolX, 1.2, poolZ + poolD / 2 + 1.2);
    umbrellaPole.castShadow = true;
    group.add(umbrellaPole);

    const umbrellaCanopy = new THREE.Mesh(
      new THREE.ConeGeometry(1.4, 0.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 })
    );
    umbrellaCanopy.position.set(poolX, 2.4, poolZ + poolD / 2 + 1.2);
    umbrellaCanopy.castShadow = true;
    group.add(umbrellaCanopy);

    // 3. Manicured Cedar Hedges along rear
    const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.9 });
    const hedgeGeo = new THREE.BoxGeometry(plot.width * 0.8, 1.2, 0.6);
    const hedge = new THREE.Mesh(hedgeGeo, hedgeMat);
    hedge.position.set(0, 0.6, -plot.depth / 2 + 0.6);
    hedge.castShadow = true;
    group.add(hedge);

    // 4. Paver Driveway for cars
    const drivewayGeo = new THREE.PlaneGeometry(3.6, plot.depth * 0.55);
    drivewayGeo.rotateX(-Math.PI / 2);
    const drivewayMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
    const driveway = new THREE.Mesh(drivewayGeo, drivewayMat);
    driveway.position.set(-plot.width * 0.28, 0.03, plot.depth * 0.2);
    driveway.receiveShadow = true;
    group.add(driveway);
  }

  // Props helper for Stage 1 construction (cones, bricks)
  private static addConstructionProps(group: THREE.Group, plot: PlotData) {
    // 2 Warning Cones
    const coneGeo = new THREE.ConeGeometry(0.2, 0.6, 12);
    const coneMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 });
    [
      [plot.width / 2 - 1.2, plot.depth / 2 - 1.0],
      [-plot.width / 2 + 1.2, plot.depth / 2 - 1.0],
    ].forEach(([cx, cz]) => {
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(cx, 0.3, cz);
      cone.castShadow = true;
      group.add(cone);
    });

    // Brick Pallet
    const pallet = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.6, 1.0),
      new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.9 })
    );
    pallet.position.set(plot.width / 2 - 2.5, 0.3, plot.depth / 2 - 1.5);
    pallet.castShadow = true;
    group.add(pallet);
  }
}
