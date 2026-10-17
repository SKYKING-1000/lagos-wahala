import * as THREE from 'three';
import { VehicleState } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

export interface CollisionBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  name?: string;
}

export interface CollisionCylinder {
  x: number;
  z: number;
  radius: number;
  name?: string;
}

export interface DynamicObstacle {
  id: string;
  x: number;
  z: number;
  radius: number;
  name?: string;
  isVehicle?: boolean;
}

export class PhysicsSystem {
  public collisionBoxes: CollisionBox[] = [];
  public collisionCylinders: CollisionCylinder[] = [];
  public dynamicObstacles: DynamicObstacle[] = [];
  public onVehicleCrash?: (intensity: number) => void;
  public onPlayerHit?: (message: string) => void;
  public onTrafficHit?: (vehicleId: string, impactVel: { x: number; z: number }) => void;

  private lastCrashSoundTime = 0;

  public clear() {
    this.collisionBoxes = [];
    this.collisionCylinders = [];
    this.dynamicObstacles = [];
  }

  // Register static rectangular collision boxes (walls, buildings, compound fences, barriers)
  public addBox(minX: number, maxX: number, minZ: number, maxZ: number, name?: string) {
    this.collisionBoxes.push({
      minX: Math.min(minX, maxX),
      maxX: Math.max(minX, maxX),
      minZ: Math.min(minZ, maxZ),
      maxZ: Math.max(minZ, maxZ),
      name,
    });
  }

  // Register static circular collision pillars (electric poles, trees, gas station columns)
  public addCylinder(x: number, z: number, radius: number, name?: string) {
    this.collisionCylinders.push({ x, z, radius, name });
  }

  // Update list of dynamic obstacles (AI cars, Danfos, Keke) each frame
  public updateDynamicObstacles(obstacles: DynamicObstacle[]) {
    this.dynamicObstacles = obstacles;
  }

  // Check character movement with smooth sliding along obstacles
  public checkCharacterCollision(newX: number, newZ: number, radius: number = 0.45): { x: number; z: number } {
    let finalX = newX;
    let finalZ = newZ;

    // 1. Static Boxes (Walls, gates, furniture)
    for (const b of this.collisionBoxes) {
      if (
        finalX > b.minX - radius &&
        finalX < b.maxX + radius &&
        finalZ > b.minZ - radius &&
        finalZ < b.maxZ + radius
      ) {
        const dLeft = Math.abs(finalX - (b.minX - radius));
        const dRight = Math.abs(finalX - (b.maxX + radius));
        const dTop = Math.abs(finalZ - (b.minZ - radius));
        const dBottom = Math.abs(finalZ - (b.maxZ + radius));

        const min = Math.min(dLeft, dRight, dTop, dBottom);
        if (min === dLeft) finalX = b.minX - radius;
        else if (min === dRight) finalX = b.maxX + radius;
        else if (min === dTop) finalZ = b.minZ - radius;
        else finalZ = b.maxZ + radius;
      }
    }

    // 2. Static Cylinders (Poles, columns)
    for (const c of this.collisionCylinders) {
      const dx = finalX - c.x;
      const dz = finalZ - c.z;
      const distSq = dx * dx + dz * dz;
      const minDist = radius + c.radius;
      if (distSq < minDist * minDist) {
        const dist = Math.sqrt(distSq) || 0.001;
        const push = minDist - dist;
        finalX += (dx / dist) * push;
        finalZ += (dz / dist) * push;
      }
    }

    // 3. Dynamic Obstacles (Vehicles, Danfos)
    for (const dyn of this.dynamicObstacles) {
      const dx = finalX - dyn.x;
      const dz = finalZ - dyn.z;
      const distSq = dx * dx + dz * dz;
      const minDist = radius + dyn.radius;
      if (distSq < minDist * minDist) {
        const dist = Math.sqrt(distSq) || 0.001;
        const push = minDist - dist;
        finalX += (dx / dist) * push;
        finalZ += (dz / dist) * push;

        if (dyn.isVehicle && Math.random() < 0.05) {
          soundEngine.playDanfoHorn();
          if (this.onPlayerHit) {
            this.onPlayerHit('Oga! Watch the road before Danfo crush you!');
          }
        }
      }
    }

    return { x: finalX, z: finalZ };
  }

  // Update vehicle driving physics with realistic multi-point vehicle collision detection
  public updateVehicle(
    v: VehicleState,
    inputs: { throttle: number; steering: number; brake: boolean; handbrake: boolean },
    delta: number,
    extraDynamicObstacles: DynamicObstacle[] = []
  ): void {
    if (!v.isPlayerInside) {
      v.speed *= Math.max(0, 1 - delta * 2.5);
      if (Math.abs(v.speed) < 0.05) v.speed = 0;
      return;
    }

    if (v.fuel <= 0) {
      v.isEngineOn = false;
    }

    if (!v.isEngineOn) {
      v.speed *= Math.max(0, 1 - delta * 3.0);
      return;
    }

    const maxSpeed = v.model === 'sedan' ? 32 : v.model === 'danfo' ? 24 : 16;
    const accelRate = v.model === 'sedan' ? 14 : v.model === 'danfo' ? 10 : 8;
    const reverseMaxSpeed = 7;

    // Acceleration & Braking
    if (inputs.throttle > 0) {
      v.speed += inputs.throttle * accelRate * delta;
      if (v.speed > maxSpeed) v.speed = maxSpeed;
      v.fuel = Math.max(0, v.fuel - delta * 0.08);
    } else if (inputs.throttle < 0) {
      if (v.speed > 0.5) {
        v.speed -= accelRate * 1.5 * delta;
      } else {
        v.speed -= accelRate * 0.6 * delta;
        if (v.speed < -reverseMaxSpeed) v.speed = -reverseMaxSpeed;
      }
    } else {
      v.speed *= Math.max(0, 1 - delta * 1.2);
    }

    // Footbrake
    if (inputs.brake) {
      v.speed *= Math.max(0, 1 - delta * 4.5);
    }

    // Handbrake drift
    if (inputs.handbrake) {
      v.speed *= Math.max(0, 1 - delta * 6.0);
    }

    // Immediate responsive steering (no deadzone from standstill)
    const steerResponse = Math.max(0.85, Math.min(1.2, Math.abs(v.speed) / 2.2));
    const steerDir = v.speed >= -0.2 ? 1 : -1;
    v.rotationY -= inputs.steering * 2.4 * steerResponse * steerDir * delta;

    const forwardX = Math.sin(v.rotationY);
    const forwardZ = Math.cos(v.rotationY);

    let nextX = v.x + forwardX * v.speed * delta;
    let nextZ = v.z + forwardZ * v.speed * delta;

    // Multi-Point Collision Check for Vehicle Body
    // Front bumper, center, and rear bumper points
    const halfLen = v.model === 'danfo' ? 2.1 : 1.9;
    const carRadius = 1.05;

    const checkPoints = [
      { x: nextX + forwardX * halfLen, z: nextZ + forwardZ * halfLen, type: 'front' },
      { x: nextX, z: nextZ, type: 'center' },
      { x: nextX - forwardX * halfLen, z: nextZ - forwardZ * halfLen, type: 'rear' },
    ];

    let hasCollided = false;
    let pushbackX = 0;
    let pushbackZ = 0;
    let crashName: string | undefined;
    let crashDynId: string | undefined;

    // Test each point against static boxes
    for (const pt of checkPoints) {
      for (const b of this.collisionBoxes) {
        if (
          pt.x > b.minX - carRadius &&
          pt.x < b.maxX + carRadius &&
          pt.z > b.minZ - carRadius &&
          pt.z < b.maxZ + carRadius
        ) {
          hasCollided = true;
          crashName = b.name;

          const dLeft = Math.abs(pt.x - (b.minX - carRadius));
          const dRight = Math.abs(pt.x - (b.maxX + carRadius));
          const dTop = Math.abs(pt.z - (b.minZ - carRadius));
          const dBottom = Math.abs(pt.z - (b.maxZ + carRadius));

          const min = Math.min(dLeft, dRight, dTop, dBottom);
          if (min === dLeft) pushbackX -= dLeft;
          else if (min === dRight) pushbackX += dRight;
          else if (min === dTop) pushbackZ -= dTop;
          else pushbackZ += dBottom;
        }
      }

      // Test against static cylinders (poles, pillars)
      for (const c of this.collisionCylinders) {
        const dx = pt.x - c.x;
        const dz = pt.z - c.z;
        const distSq = dx * dx + dz * dz;
        const minDist = carRadius + c.radius;
        if (distSq < minDist * minDist) {
          hasCollided = true;
          crashName = c.name;
          const dist = Math.sqrt(distSq) || 0.001;
          const overlap = minDist - dist;
          pushbackX += (dx / dist) * overlap;
          pushbackZ += (dz / dist) * overlap;
        }
      }

      // Test against Dynamic Vehicles (AI Traffic & others)
      const allDynamics = [...this.dynamicObstacles, ...extraDynamicObstacles];
      for (const dyn of allDynamics) {
        if (dyn.id === v.id) continue;
        const dx = pt.x - dyn.x;
        const dz = pt.z - dyn.z;
        const distSq = dx * dx + dz * dz;
        const minDist = carRadius + dyn.radius;
        if (distSq < minDist * minDist) {
          hasCollided = true;
          crashName = dyn.name || 'Traffic Vehicle';
          crashDynId = dyn.id;
          const dist = Math.sqrt(distSq) || 0.001;
          const overlap = minDist - dist;
          pushbackX += (dx / dist) * overlap * 1.2;
          pushbackZ += (dz / dist) * overlap * 1.2;
        }
      }
    }

    if (hasCollided) {
      const impactSpeed = Math.abs(v.speed);

      // Apply positional pushback
      nextX += pushbackX * 0.8;
      nextZ += pushbackZ * 0.8;

      // Realistic Elastic Rebound
      if (impactSpeed > 2.0) {
        v.speed = -v.speed * 0.45; // Bounce backwards

        // Play crash sound with rate limiter (at most once every 350ms)
        const now = performance.now();
        if (now - this.lastCrashSoundTime > 350) {
          this.lastCrashSoundTime = now;
          soundEngine.playCrashSound();
        }

        if (this.onVehicleCrash) {
          this.onVehicleCrash(impactSpeed);
        }

        if (this.onTrafficHit && crashDynId) {
          this.onTrafficHit(crashDynId, {
            x: forwardX * (impactSpeed * 1.5 + 4),
            z: forwardZ * (impactSpeed * 1.5 + 4),
          });
        }
      } else {
        v.speed = 0;
      }
    }

    v.x = nextX;
    v.z = nextZ;
  }
}

export const physicsSystem = new PhysicsSystem();
