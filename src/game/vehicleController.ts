/**
 * AIMMER HOUSE TYCOON - Drivable Vehicle Controller
 * Realistic vehicle driving mechanics with turning wheels, headlights, and engine sound.
 */

import * as THREE from 'three';
import { sound } from './audio';
import { InputState } from './character';
import { VehicleData } from './types';

export class VehicleController {
  public group: THREE.Group;
  public position: THREE.Vector3 = new THREE.Vector3(6, 0, 15);
  public cameraTarget: THREE.Vector3 = new THREE.Vector3();
  public rotationY: number = 0;
  public currentSpeed: number = 0;
  public steerAngle: number = 0;

  public isOccupied: boolean = false;
  public vehicleData: VehicleData;

  // Wheel meshes for rotation animation
  private frontLeftWheel!: THREE.Group;
  private frontRightWheel!: THREE.Group;
  private rearLeftWheel!: THREE.Group;
  private rearRightWheel!: THREE.Group;

  // Headlights & Taillights
  public headlights: THREE.SpotLight[] = [];
  private headlightMeshes: THREE.Mesh[] = [];
  private taillightMeshes: THREE.Mesh[] = [];

  constructor(data: VehicleData) {
    this.vehicleData = data;
    this.group = new THREE.Group();
    this.group.name = `vehicle_${data.id}`;
    this.buildCarMesh();
    this.group.position.copy(this.position);
  }

  private buildCarMesh() {
    const isSports = this.vehicleData.category === 'sports' || this.vehicleData.category === 'hypercar';
    const isSUV = this.vehicleData.category === 'suv';

    const carLength = isSports ? 4.6 : isSUV ? 4.9 : 4.4;
    const carWidth = isSports ? 2.1 : isSUV ? 2.15 : 1.95;
    const carHeight = isSports ? 1.05 : isSUV ? 1.55 : 1.25;

    // Body Paint Material
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(this.vehicleData.color),
      roughness: 0.15,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.8,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transmission: 0.75,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.9,
    });

    // 1. Lower Chassis
    const chassisGeo = new THREE.BoxGeometry(carWidth, 0.45, carLength);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.42;
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    this.group.add(chassis);

    // Front Bumper / Grill
    const grill = new THREE.Mesh(new THREE.BoxGeometry(carWidth * 0.75, 0.25, 0.2), darkTrimMat);
    grill.position.set(0, 0.38, carLength / 2 + 0.05);
    this.group.add(grill);

    // 2. Cabin (Roof & Windows)
    const cabinLength = carLength * 0.55;
    const cabinWidth = carWidth * 0.85;
    const cabinGeo = new THREE.BoxGeometry(cabinWidth, carHeight * 0.65, cabinLength);
    const cabin = new THREE.Mesh(cabinGeo, bodyMat);
    cabin.position.set(0, 0.42 + 0.25 + (carHeight * 0.65) / 2, -carLength * 0.06);
    cabin.castShadow = true;
    this.group.add(cabin);

    // Windshield & Rear Windows
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(cabinWidth * 0.95, carHeight * 0.5, 0.08), glassMat);
    windshield.position.set(0, 0.85, cabinLength * 0.45);
    windshield.rotateX(0.35);
    this.group.add(windshield);

    const rearWindow = new THREE.Mesh(new THREE.BoxGeometry(cabinWidth * 0.95, carHeight * 0.5, 0.08), glassMat);
    rearWindow.position.set(0, 0.85, -cabinLength * 0.6);
    rearWindow.rotateX(-0.35);
    this.group.add(rearWindow);

    // 3. Wheels & Rims
    const wheelRadius = isSUV ? 0.45 : 0.38;
    const wheelWidth = 0.28;

    const createWheel = () => {
      const wGroup = new THREE.Group();
      // Rubber tire
      const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 18);
      tireGeo.rotateZ(Math.PI / 2);
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.castShadow = true;
      wGroup.add(tire);

      // Alloy Rim
      const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.65, wheelRadius * 0.65, wheelWidth + 0.02, 12);
      rimGeo.rotateZ(Math.PI / 2);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      wGroup.add(rim);

      return wGroup;
    };

    const halfW = carWidth / 2 - 0.05;
    const halfL = carLength / 2 - 0.7;

    this.frontLeftWheel = createWheel();
    this.frontLeftWheel.position.set(-halfW, wheelRadius, halfL);
    this.group.add(this.frontLeftWheel);

    this.frontRightWheel = createWheel();
    this.frontRightWheel.position.set(halfW, wheelRadius, halfL);
    this.group.add(this.frontRightWheel);

    this.rearLeftWheel = createWheel();
    this.rearLeftWheel.position.set(-halfW, wheelRadius, -halfL);
    this.group.add(this.rearLeftWheel);

    this.rearRightWheel = createWheel();
    this.rearRightWheel.position.set(halfW, wheelRadius, -halfL);
    this.group.add(this.rearRightWheel);

    // 4. Headlights (Functional SpotLights)
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.8,
    });

    [-carWidth * 0.35, carWidth * 0.35].forEach((hx) => {
      const hlMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.1), headlightMat);
      hlMesh.position.set(hx, 0.48, carLength / 2 + 0.02);
      this.group.add(hlMesh);
      this.headlightMeshes.push(hlMesh);

      const spot = new THREE.SpotLight(0xffffff, 2.5, 35, Math.PI / 5, 0.35);
      spot.position.set(hx, 0.5, carLength / 2);
      spot.target.position.set(hx, 0, carLength / 2 + 15);
      this.group.add(spot);
      this.group.add(spot.target);
      this.headlights.push(spot);
    });

    // 5. Taillights (Red)
    const taillightMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0xdc2626,
      emissiveIntensity: 0.6,
    });
    [-carWidth * 0.35, carWidth * 0.35].forEach((tx) => {
      const tlMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.1), taillightMat);
      tlMesh.position.set(tx, 0.52, -carLength / 2 - 0.02);
      this.group.add(tlMesh);
      this.taillightMeshes.push(tlMesh);
    });
  }

  public update(delta: number, input: InputState | null) {
    const maxSpeed = this.vehicleData.speed;
    const accel = this.vehicleData.acceleration * 14;
    const brakeDecel = 24.0;
    const coastDecel = 8.0;
    const maxSteer = 0.55; // Radians

    if (this.isOccupied && input) {
      // 1. Acceleration / Reversing
      let throttle = 0;
      if (input.forward) throttle += 1;
      if (input.backward) throttle -= 1;

      // Mobile joystick y
      if (Math.abs(input.virtualStick.y) > 0.1) {
        throttle = input.virtualStick.y;
      }

      if (throttle > 0) {
        this.currentSpeed = Math.min(maxSpeed, this.currentSpeed + accel * delta);
      } else if (throttle < 0) {
        // Reverse
        this.currentSpeed = Math.max(-maxSpeed * 0.4, this.currentSpeed - accel * delta);
      } else {
        // Coasting friction
        if (this.currentSpeed > 0) {
          this.currentSpeed = Math.max(0, this.currentSpeed - coastDecel * delta);
        } else if (this.currentSpeed < 0) {
          this.currentSpeed = Math.min(0, this.currentSpeed + coastDecel * delta);
        }
      }

      // Handbrake / Run key as brake
      if (input.run && Math.abs(this.currentSpeed) > 0.1) {
        const sign = Math.sign(this.currentSpeed);
        this.currentSpeed -= sign * brakeDecel * delta;
        if (Math.sign(this.currentSpeed) !== sign) this.currentSpeed = 0;
      }

      // 2. Steering
      let steerInput = 0;
      if (input.left) steerInput += 1;
      if (input.right) steerInput -= 1;

      if (Math.abs(input.virtualStick.x) > 0.1) {
        steerInput = -input.virtualStick.x;
      }

      this.steerAngle = steerInput * maxSteer;

      // Sound update
      const speedFraction = Math.abs(this.currentSpeed) / maxSpeed;
      sound.updateEngine(speedFraction);
    } else {
      // Idle decelerate
      if (this.currentSpeed > 0) {
        this.currentSpeed = Math.max(0, this.currentSpeed - coastDecel * delta);
      } else if (this.currentSpeed < 0) {
        this.currentSpeed = Math.min(0, this.currentSpeed + coastDecel * delta);
      }
      this.steerAngle *= 0.85;
    }

    // 3. Move car & rotate by steering
    if (Math.abs(this.currentSpeed) > 0.05) {
      // Rotate by speed and steer angle
      const turnFactor = (this.currentSpeed / maxSpeed) * 1.8;
      this.rotationY += this.steerAngle * turnFactor * delta;

      const forwardX = Math.sin(this.rotationY);
      const forwardZ = Math.cos(this.rotationY);

      this.position.x += forwardX * this.currentSpeed * delta;
      this.position.z += forwardZ * this.currentSpeed * delta;

      // Boundaries
      this.position.x = Math.max(-155, Math.min(155, this.position.x));
      this.position.z = Math.max(-155, Math.min(155, this.position.z));

      // Wheel spin based on velocity
      const wheelSpin = (this.currentSpeed / 0.4) * delta;
      this.frontLeftWheel.children[0].rotation.x += wheelSpin;
      this.frontRightWheel.children[0].rotation.x += wheelSpin;
      this.rearLeftWheel.children[0].rotation.x += wheelSpin;
      this.rearRightWheel.children[0].rotation.x += wheelSpin;
    }

    // Wheel steering turn (yaw)
    this.frontLeftWheel.rotation.y = this.steerAngle;
    this.frontRightWheel.rotation.y = this.steerAngle;

    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotationY;

    this.cameraTarget.copy(this.position).add(new THREE.Vector3(0, 1.2, 0));
  }

  public enter() {
    this.isOccupied = true;
    sound.startEngine();
  }

  public exit() {
    this.isOccupied = false;
    sound.stopEngine();
    this.currentSpeed = 0;
  }
}
