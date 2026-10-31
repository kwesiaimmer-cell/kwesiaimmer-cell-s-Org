/**
 * AIMMER HOUSE TYCOON - Third-Person Player Character Controller
 * Multi-part animated humanoid character with smooth spring kinematics and camera control.
 */

import * as THREE from 'three';
import { sound } from './audio';

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
  interact: boolean;
  virtualStick: { x: number; y: number }; // -1 to 1 from joystick
}

export class CharacterController {
  public group: THREE.Group;
  public cameraTarget: THREE.Vector3 = new THREE.Vector3();
  
  // Limbs for procedural animation
  private leftArm!: THREE.Group;
  private rightArm!: THREE.Group;
  private leftLeg!: THREE.Group;
  private rightLeg!: THREE.Group;
  private torso!: THREE.Mesh;
  private head!: THREE.Group;

  // Movement physics
  public position: THREE.Vector3 = new THREE.Vector3(0, 0, 15);
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public rotationY: number = 0;
  public isMoving: boolean = false;
  public isRunning: boolean = false;

  private walkSpeed: number = 6.0;
  private runSpeed: number = 11.5;
  private animTimer: number = 0;
  private footstepTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'player';
    this.buildCharacterMesh();
    this.group.position.copy(this.position);
  }

  private buildCharacterMesh() {
    // 1. Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.6 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.4 });
    const jacketMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 }); // Aimmer Blue
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 }); // White sneakers

    // 2. Torso (Pivot at waist: 0.9m)
    const torsoGeo = new THREE.BoxGeometry(0.5, 0.65, 0.28);
    this.torso = new THREE.Mesh(torsoGeo, jacketMat);
    this.torso.position.y = 1.25;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Collar / shirt accent
    const shirt = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.2, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
    );
    shirt.position.set(0, 1.45, 0.14);
    this.group.add(shirt);

    // 3. Head & Hair
    this.head = new THREE.Group();
    this.head.position.set(0, 1.75, 0);

    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.35, 0.32), skinMat);
    headMesh.castShadow = true;
    this.head.add(headMesh);

    // Stylish Cap / Hair
    const hairMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.16, 0.36), hairMat);
    hairMesh.position.y = 0.15;
    this.head.add(hairMesh);

    // Cap Visor
    const visorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.16), hairMat);
    visorMesh.position.set(0, 0.12, 0.22);
    this.head.add(visorMesh);

    this.group.add(this.head);

    // 4. Arms (Pivoted at shoulders)
    const armGeo = new THREE.BoxGeometry(0.14, 0.55, 0.14);
    armGeo.translate(0, -0.25, 0);

    // Left Arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.35, 1.5, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, jacketMat);
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);
    // Left Hand
    const lHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), skinMat);
    lHand.position.set(0, -0.56, 0);
    this.leftArm.add(lHand);
    this.group.add(this.leftArm);

    // Right Arm
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.35, 1.5, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, jacketMat);
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);
    // Right Hand
    const rHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), skinMat);
    rHand.position.set(0, -0.56, 0);
    this.rightArm.add(rHand);
    this.group.add(this.rightArm);

    // 5. Legs (Pivoted at hips)
    const legGeo = new THREE.BoxGeometry(0.18, 0.65, 0.18);
    legGeo.translate(0, -0.32, 0);

    // Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.16, 0.9, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
    leftLegMesh.castShadow = true;
    this.leftLeg.add(leftLegMesh);
    // Left Sneaker
    const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.3), shoeMat);
    lShoe.position.set(0, -0.66, 0.05);
    lShoe.castShadow = true;
    this.leftLeg.add(lShoe);
    this.group.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.16, 0.9, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rightLegMesh.castShadow = true;
    this.rightLeg.add(rightLegMesh);
    // Right Sneaker
    const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.3), shoeMat);
    rShoe.position.set(0, -0.66, 0.05);
    rShoe.castShadow = true;
    this.rightLeg.add(rShoe);
    this.group.add(this.rightLeg);
  }

  public update(delta: number, input: InputState, cameraYaw: number) {
    // 1. Calculate desired movement vector
    let moveX = 0;
    let moveZ = 0;

    if (input.forward) moveZ -= 1;
    if (input.backward) moveZ += 1;
    if (input.left) moveX -= 1;
    if (input.right) moveX += 1;

    // Mobile virtual joystick input
    if (Math.abs(input.virtualStick.x) > 0.05 || Math.abs(input.virtualStick.y) > 0.05) {
      moveX = input.virtualStick.x;
      moveZ = -input.virtualStick.y;
    }

    const inputLength = Math.hypot(moveX, moveZ);
    this.isMoving = inputLength > 0.1;
    this.isRunning = input.run && this.isMoving;

    if (this.isMoving) {
      // Normalize
      const nx = moveX / Math.max(1, inputLength);
      const nz = moveZ / Math.max(1, inputLength);

      // Rotate movement vector by camera yaw
      const cosY = Math.cos(cameraYaw);
      const sinY = Math.sin(cameraYaw);
      const worldMoveX = nx * cosY + nz * sinY;
      const worldMoveZ = -nx * sinY + nz * cosY;

      const targetSpeed = this.isRunning ? this.runSpeed : this.walkSpeed;
      this.velocity.x = worldMoveX * targetSpeed;
      this.velocity.z = worldMoveZ * targetSpeed;

      // Face movement direction smoothly
      const targetAngle = Math.atan2(worldMoveX, worldMoveZ);
      let angleDiff = targetAngle - this.rotationY;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      this.rotationY += angleDiff * Math.min(1, delta * 14);
    } else {
      // Decelerate
      this.velocity.x *= Math.max(0, 1 - delta * 12);
      this.velocity.z *= Math.max(0, 1 - delta * 12);
    }

    // Apply movement
    this.position.x += this.velocity.x * delta;
    this.position.z += this.velocity.z * delta;

    // World boundary limits (-160 to 160)
    this.position.x = Math.max(-160, Math.min(160, this.position.x));
    this.position.z = Math.max(-160, Math.min(160, this.position.z));
    this.position.y = 0; // Ground level

    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotationY;

    // Camera target sits at character chest height
    this.cameraTarget.copy(this.position).add(new THREE.Vector3(0, 1.4, 0));

    // 2. Procedural Walking / Running Animation
    if (this.isMoving) {
      const animSpeed = this.isRunning ? 15 : 10;
      this.animTimer += delta * animSpeed;

      const swing = Math.sin(this.animTimer) * (this.isRunning ? 0.75 : 0.5);

      // Legs swing opposite
      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;

      // Arms swing opposite to legs
      this.leftArm.rotation.x = -swing * 0.9;
      this.rightArm.rotation.x = swing * 0.9;

      // Subtle torso bob & bounce
      this.torso.position.y = 1.25 + Math.abs(Math.sin(this.animTimer)) * 0.05;
      this.head.position.y = 1.75 + Math.abs(Math.sin(this.animTimer)) * 0.05;

      // Footstep sound sync
      this.footstepTimer += delta * animSpeed;
      if (this.footstepTimer > Math.PI) {
        this.footstepTimer = 0;
        sound.playFootstep(this.isRunning);
      }
    } else {
      // Smoothly return limbs to idle resting position
      this.animTimer = 0;
      this.footstepTimer = 0;
      this.leftLeg.rotation.x *= 0.8;
      this.rightLeg.rotation.x *= 0.8;
      this.leftArm.rotation.x *= 0.8;
      this.rightArm.rotation.x *= 0.8;
      this.torso.position.y = 1.25;
      this.head.position.y = 1.75;
    }
  }

  public setPosition(x: number, y: number, z: number) {
    this.position.set(x, y, z);
    this.group.position.copy(this.position);
    this.cameraTarget.copy(this.position).add(new THREE.Vector3(0, 1.4, 0));
  }
}
