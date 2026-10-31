/**
 * AIMMER HOUSE TYCOON - Main 3D Game Engine
 * Manages Three.js renderer, scene graph, cameras, loop, physics, day-night cycle, and audio.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { WorldBuilder, WorldObjects } from './world';
import { CharacterController, InputState } from './character';
import { VehicleController } from './vehicleController';
import { HouseBuilder } from './houseBuilder';
import { PlotData, VehicleData, PlotStage } from './types';
import { sound } from './audio';

export class GameEngine {
  private container: HTMLElement;
  public renderer!: THREE.WebGLRenderer;
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;

  private isSoftwareGl: boolean = false;
  private animFrameId: number = 0;
  private clock: THREE.Clock = new THREE.Clock();

  // Actors & World
  public character!: CharacterController;
  public vehicle: VehicleController | null = null;
  public world!: WorldObjects;
  private plotMeshes: Map<string, THREE.Group> = new Map();

  // Camera Orbit State
  public cameraYaw: number = 0;
  public cameraPitch: number = 0.35; // Looking down slightly
  public cameraDistance: number = 9.0;
  private targetCameraPos: THREE.Vector3 = new THREE.Vector3();

  // Inputs
  public input: InputState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    interact: false,
    virtualStick: { x: 0, y: 0 },
  };

  // State
  public isDriving: boolean = false;
  public dayNightTime: number = 0.25; // 0.25 is noon
  public autoTime: boolean = true;
  public dayNightSpeed: number = 0.008; // approx 2 mins full cycle

  // Event Callbacks to React HUD
  public onContextActionChange: ((text: string | null, action: (() => void) | null) => void) | null = null;
  public onPlayerMove: ((pos: THREE.Vector3, rotY: number) => void) | null = null;
  public onVehicleMove: ((pos: THREE.Vector3) => void) | null = null;
  public onTimeChange: ((time: number) => void) | null = null;

  // Track closest interactable
  private currentInteractable: { id: string; type: 'plot' | 'car' | 'shop' } | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init() {
    // 1. Detect Software WebGL
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 2. Initialize Renderer
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xbae6fd);
    this.scene.fog = new THREE.FogExp2(0xbae6fd, 0.007);

    this.camera = new THREE.PerspectiveCamera(52, w / h, 0.5, 350);

    // Procedural Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Character
    this.character = new CharacterController();
    this.scene.add(this.character.group);

    // Setup input listeners
    this.setupListeners();
  }

  public populatePlots(plots: PlotData[]) {
    // Build world
    this.world = WorldBuilder.createNeighborhood(this.scene, plots);

    // Build plot meshes
    plots.forEach((p) => {
      this.updatePlotMesh(p);
    });
  }

  public spawnVehicle(vData: VehicleData) {
    if (this.vehicle) {
      this.scene.remove(this.vehicle.group);
    }
    this.vehicle = new VehicleController(vData);
    this.vehicle.position.set(6, 0, 12);
    this.scene.add(this.vehicle.group);
  }

  public updatePlotMesh(plot: PlotData) {
    const existing = this.plotMeshes.get(plot.id);
    if (existing) {
      this.scene.remove(existing);
    }
    const newMesh = HouseBuilder.buildPlot(plot);
    this.scene.add(newMesh);
    this.plotMeshes.set(plot.id, newMesh);
  }

  public start() {
    this.clock.start();
    const tick = () => {
      const delta = Math.min(this.clock.getDelta(), 0.1);
      this.update(delta);
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.animFrameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.afterDraw(tick);
    } else {
      this.animFrameId = requestAnimationFrame(tick);
    }
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.animFrameId = window.setTimeout(poll, 5);
      } else {
        gl.deleteSync(sync);
        this.animFrameId = window.setTimeout(cb, 60);
      }
    };
    this.animFrameId = window.setTimeout(poll, 5);
  }

  private update(delta: number) {
    // 1. Day / Night Cycle
    if (this.autoTime) {
      this.dayNightTime = (this.dayNightTime + this.dayNightSpeed * delta) % 1.0;
    }
    this.updateLighting();

    if (this.onTimeChange) {
      this.onTimeChange(this.dayNightTime);
    }

    // 2. Character & Vehicle Updates
    if (this.isDriving && this.vehicle) {
      this.vehicle.update(delta, this.input);
      // Character hides inside vehicle
      this.character.position.copy(this.vehicle.position);
      this.character.group.position.copy(this.vehicle.position);
      this.character.group.visible = false;
    } else {
      this.character.group.visible = true;
      this.character.update(delta, this.input, this.cameraYaw);
      if (this.vehicle) {
        this.vehicle.update(delta, null);
      }
    }

    // 3. Smooth Chase / Orbit Camera
    const target = this.isDriving && this.vehicle
      ? this.vehicle.cameraTarget
      : this.character.cameraTarget;

    // Spherical orbit calculation around target
    const cosPitch = Math.cos(this.cameraPitch);
    const sinPitch = Math.sin(this.cameraPitch);
    const cosYaw = Math.cos(this.cameraYaw);
    const sinYaw = Math.sin(this.cameraYaw);

    const camX = target.x - this.cameraDistance * cosPitch * sinYaw;
    const camY = target.y + this.cameraDistance * sinPitch;
    const camZ = target.z - this.cameraDistance * cosPitch * cosYaw;

    this.targetCameraPos.set(camX, Math.max(0.8, camY), camZ);

    // Smooth exponential damping
    this.camera.position.lerp(this.targetCameraPos, Math.min(1, delta * 8));
    this.camera.lookAt(target);

    // 4. Check Proximity Interactions
    this.checkInteractions();

    // 5. Notify HUD Minimap
    if (this.onPlayerMove) {
      this.onPlayerMove(this.character.position, this.character.rotationY);
    }
    if (this.onVehicleMove && this.vehicle) {
      this.onVehicleMove(this.vehicle.position);
    }
  }

  private updateLighting() {
    if (!this.world) return;
    const { sunLight, hemiLight, streetLights, streetLightBulbs, buildingWindowLights } = this.world;

    // Angle 0 to 2PI (0 = sunrise, PI/2 = noon, PI = sunset, 3PI/2 = night)
    const angle = this.dayNightTime * Math.PI * 2;
    const sunY = Math.sin(angle);
    const sunX = Math.cos(angle);

    sunLight.position.set(sunX * 100, Math.max(-20, sunY * 100), 50);

    const isDay = sunY > 0.05;
    const isSunset = sunY >= -0.1 && sunY <= 0.2;

    // Colors
    let skyColor: THREE.Color;
    let groundColor: THREE.Color;

    if (isSunset) {
      skyColor = new THREE.Color(0xfdba74); // Warm sunset orange
      groundColor = new THREE.Color(0x78350f);
      sunLight.color.setHex(0xf97316);
      sunLight.intensity = Math.max(0.4, sunY * 1.5);
    } else if (isDay) {
      skyColor = new THREE.Color(0xbae6fd); // Daylight sky blue
      groundColor = new THREE.Color(0x1e3a1f);
      sunLight.color.setHex(0xfffaed);
      sunLight.intensity = 1.6;
    } else {
      skyColor = new THREE.Color(0x020617); // Night deep indigo
      groundColor = new THREE.Color(0x050b14);
      sunLight.color.setHex(0x38bdf8); // Moonlight
      sunLight.intensity = 0.25;
    }

    this.scene.background = skyColor;
    (this.scene.fog as THREE.FogExp2).color = skyColor;
    hemiLight.color = skyColor;
    hemiLight.groundColor = groundColor;

    // Night streetlights & windows glow
    const nightIntensity = isDay ? 0 : 1.2;
    streetLights.forEach((l) => (l.intensity = nightIntensity));
    streetLightBulbs.forEach((b) => ((b.material as THREE.MeshStandardMaterial).emissiveIntensity = isDay ? 0.1 : 1.0));
    buildingWindowLights.forEach((w) => (w.visible = !isDay));
  }

  private checkInteractions() {
    if (!this.world) return;

    // Car proximity check
    if (!this.isDriving && this.vehicle) {
      const distToCar = this.character.position.distanceTo(this.vehicle.position);
      if (distToCar < 3.2) {
        this.currentInteractable = { id: this.vehicle.vehicleData.id, type: 'car' };
        if (this.onContextActionChange) {
          this.onContextActionChange('Drive Vehicle', () => this.toggleDrive());
        }
        return;
      }
    }

    if (this.isDriving) {
      if (this.onContextActionChange) {
        this.onContextActionChange('Exit Vehicle', () => this.toggleDrive());
      }
      return;
    }

    // Plots proximity check
    let nearestPlot: { id: string; dist: number } | null = null;
    for (const c of this.world.interactableColliders) {
      if (c.type === 'plot') {
        const d = Math.hypot(this.character.position.x - c.x, this.character.position.z - c.z);
        if (d < c.radius) {
          if (!nearestPlot || d < nearestPlot.dist) {
            nearestPlot = { id: c.id, dist: d };
          }
        }
      }
    }

    if (nearestPlot) {
      this.currentInteractable = { id: nearestPlot.id, type: 'plot' };
      if (this.onContextActionChange) {
        this.onContextActionChange('Manage Plot', () => {
          window.dispatchEvent(new CustomEvent('aimmer_open_plot', { detail: nearestPlot!.id }));
        });
      }
      return;
    }

    // No interactables near
    this.currentInteractable = null;
    if (this.onContextActionChange) {
      this.onContextActionChange(null, null);
    }
  }

  public toggleDrive() {
    if (this.isDriving) {
      // Exit vehicle
      this.isDriving = false;
      if (this.vehicle) {
        this.vehicle.exit();
        this.character.position.set(
          this.vehicle.position.x - 2.5,
          0,
          this.vehicle.position.z
        );
        this.character.group.position.copy(this.character.position);
      }
    } else {
      // Enter vehicle
      if (this.vehicle) {
        const dist = this.character.position.distanceTo(this.vehicle.position);
        if (dist < 4.0) {
          this.isDriving = true;
          this.vehicle.enter();
        }
      }
    }
  }

  private setupListeners() {
    // Keyboard
    const onKeyDown = (e: KeyboardEvent) => {
      sound.init(); // Ensure Web Audio context is started on first user gesture!

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.input.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.input.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.input.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.input.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.input.run = true;
          break;
        case 'KeyE':
          if (this.currentInteractable) {
            if (this.currentInteractable.type === 'car') {
              this.toggleDrive();
            } else if (this.currentInteractable.type === 'plot') {
              window.dispatchEvent(new CustomEvent('aimmer_open_plot', { detail: this.currentInteractable.id }));
            }
          }
          break;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.input.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.input.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.input.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.input.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.input.run = false;
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Mouse Drag Camera Orbit
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      // Ignore clicks on UI elements
      if ((e.target as HTMLElement).closest('.pointer-events-auto')) return;
      isMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      sound.init();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      this.cameraYaw -= dx * 0.006;
      this.cameraPitch = Math.max(0.08, Math.min(1.2, this.cameraPitch + dy * 0.005));
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onWheel = (e: WheelEvent) => {
      this.cameraDistance = Math.max(4.5, Math.min(22, this.cameraDistance + e.deltaY * 0.01));
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('wheel', onWheel, { passive: true });

    // Window Resize
    const onResize = () => {
      const w = this.container.clientWidth || window.innerWidth;
      const h = this.container.clientHeight || window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);
  }

  public dispose() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      clearTimeout(this.animFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
    sound.stopEngine();
  }
}
