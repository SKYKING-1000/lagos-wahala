import * as THREE from 'three';
import { AITrafficVehicle, RoadNode, TrafficCondition } from '../types/game';
import { LAGOS_ROAD_NODES } from '../city/lagosGeography';
import {
  createDanfoBusMesh,
  createSedanMesh,
  createKekeMesh,
  createBRTBusMesh,
  createDispatchBikeMesh,
} from '../city/proceduralModels';
import { soundEngine } from '../audio/soundEngine';

// Computes dynamic Lagos traffic and road congestion based on the time of day
export function getLagosTrafficCondition(timeMinutes: number): TrafficCondition {
  const normTime = ((timeMinutes % 1440) + 1440) % 1440;

  // 1. Morning Rush Hour: 06:30 - 09:45 AM (390 - 585 min)
  if (normTime >= 390 && normTime < 585) {
    const peak = 1.0 - Math.abs(normTime - 480) / 105; // Peak around 08:00 AM
    const level = 0.75 + peak * 0.22;
    return {
      level,
      status: 'Heavy Rush Hour',
      speedMultiplier: Math.max(0.28, 0.5 - peak * 0.22),
      description: 'Morning Rush: Heavy Mainland-to-Island Go-Slow on Third Mainland Bridge & Yaba',
      isRushHour: true,
      peakCorridor: 'Third Mainland Bridge & Ikorodu Corridor',
    };
  }

  // 2. Midday Commercial Movement: 09:45 - 16:15 PM (585 - 975 min)
  if (normTime >= 585 && normTime < 975) {
    return {
      level: 0.42,
      status: 'Moderate Traffic',
      speedMultiplier: 0.88,
      description: 'Midday Commercial Flow: Steady movement with slow spots at Sabo Market & Allen',
      isRushHour: false,
      peakCorridor: 'Yaba Sabo & Ikeja Commercial Districts',
    };
  }

  // 3. Evening Peak Rush Hour / The Legendary Lagos Go-Slow: 16:15 - 20:45 PM (975 - 1245 min)
  if (normTime >= 975 && normTime < 1245) {
    const peak = 1.0 - Math.abs(normTime - 1110) / 135; // Peak around 18:30 PM
    const level = 0.82 + peak * 0.18;
    return {
      level,
      status: 'Lagos Go-Slow Gridlock',
      speedMultiplier: Math.max(0.22, 0.42 - peak * 0.2),
      description: 'Evening Gridlock: Island to Mainland exodus bumper-to-bumper queue',
      isRushHour: true,
      peakCorridor: 'Ozumba Mbadiwe & Lekki Expressway',
    };
  }

  // 4. Late Night / Early Morning Free Flow: 20:45 - 06:30 AM (1245 - 390 min)
  return {
    level: 0.12,
    status: 'Free Flow',
    speedMultiplier: 1.25,
    description: 'Late Night Free Flow: Expressways clear, fast cruising speeds',
    isRushHour: false,
    peakCorridor: 'All Expressways Wide Open',
  };
}

export class TrafficSystem {
  public vehicles: {
    data: AITrafficVehicle;
    mesh: THREE.Group;
    hazardLights?: THREE.Mesh[];
    brakeLights?: THREE.Mesh[];
  }[] = [];
  private nodeMap = new Map<string, RoadNode>();
  private scene: THREE.Scene | null = null;
  private lastGlobalHornTime = 0;
  private currentTrafficCondition: TrafficCondition = getLagosTrafficCondition(360);

  constructor() {
    LAGOS_ROAD_NODES.forEach((n) => this.nodeMap.set(n.id, n));
  }

  public getCondition(): TrafficCondition {
    return this.currentTrafficCondition;
  }

  public init(scene: THREE.Scene) {
    this.scene = scene;

    // Rich initial fleet of Lagos vehicles across all corridors
    const initialSpawns: {
      type: 'danfo' | 'sedan' | 'keke' | 'brt' | 'bike';
      startNodeId: string;
      targetNodeId: string;
      lane: number;
      personality: 'aggressive' | 'cautious' | 'standard' | 'commercial';
    }[] = [
      // Mainland - Ikeja & Allen Avenue
      { type: 'danfo', startNodeId: 'ik_res_1', targetNodeId: 'ik_allen_north', lane: 1.8, personality: 'commercial' },
      { type: 'danfo', startNodeId: 'ik_allen_north', targetNodeId: 'ik_allen_mid', lane: 1.8, personality: 'aggressive' },
      { type: 'sedan', startNodeId: 'ik_allen_mid', targetNodeId: 'ik_allen_roundabout', lane: -1.8, personality: 'standard' },
      { type: 'bike', startNodeId: 'ik_allen_roundabout', targetNodeId: 'ik_exp_south_1', lane: 1.2, personality: 'aggressive' },
      { type: 'danfo', startNodeId: 'ik_exp_south_1', targetNodeId: 'ik_exp_south_2', lane: 2.2, personality: 'commercial' },

      // Yaba Tech Corridor & Sabo Roundabout
      { type: 'keke', startNodeId: 'yb_macaulay_north', targetNodeId: 'yb_sabo_roundabout', lane: 1.5, personality: 'cautious' },
      { type: 'danfo', startNodeId: 'yb_sabo_roundabout', targetNodeId: 'yb_tech_corridor', lane: 1.8, personality: 'commercial' },
      { type: 'bike', startNodeId: 'yb_tech_corridor', targetNodeId: 'yb_commercial_east', lane: -1.3, personality: 'aggressive' },
      { type: 'sedan', startNodeId: 'yb_commercial_east', targetNodeId: 'yb_sabo_roundabout', lane: 2.0, personality: 'standard' },

      // Third Mainland Bridge (Inbound & Outbound spans)
      { type: 'brt', startNodeId: 'tmb_span_1', targetNodeId: 'tmb_span_2', lane: 2.6, personality: 'commercial' },
      { type: 'sedan', startNodeId: 'tmb_span_1', targetNodeId: 'tmb_span_2', lane: -2.4, personality: 'standard' },
      { type: 'danfo', startNodeId: 'tmb_span_2', targetNodeId: 'tmb_span_3', lane: 2.4, personality: 'aggressive' },
      { type: 'danfo', startNodeId: 'tmb_span_3', targetNodeId: 'tmb_span_4', lane: -2.4, personality: 'commercial' },
      { type: 'sedan', startNodeId: 'tmb_span_4', targetNodeId: 'tmb_island_landing', lane: 2.4, personality: 'standard' },

      // Victoria Island & Lekki Toll Expressway
      { type: 'brt', startNodeId: 'vi_ozumba_west', targetNodeId: 'vi_ozumba_mid', lane: 2.5, personality: 'commercial' },
      { type: 'sedan', startNodeId: 'vi_ozumba_mid', targetNodeId: 'vi_adeola_junction', lane: -2.0, personality: 'standard' },
      { type: 'keke', startNodeId: 'lk_admiralty_way', targetNodeId: 'lk_admiralty_roundabout', lane: 1.5, personality: 'cautious' },
      { type: 'sedan', startNodeId: 'lk_epe_exp_1', targetNodeId: 'lk_waterfront', lane: 2.2, personality: 'aggressive' },
      { type: 'bike', startNodeId: 'lk_waterfront', targetNodeId: 'lk_admiralty_way', lane: -1.2, personality: 'aggressive' },
    ];

    initialSpawns.forEach((spawn, idx) => {
      const nodeA = this.nodeMap.get(spawn.startNodeId);
      const nodeB = this.nodeMap.get(spawn.targetNodeId);
      if (!nodeA || !nodeB) return;

      let mesh: THREE.Group;
      if (spawn.type === 'danfo') {
        mesh = createDanfoBusMesh();
      } else if (spawn.type === 'brt') {
        mesh = createBRTBusMesh();
      } else if (spawn.type === 'keke') {
        mesh = createKekeMesh();
      } else if (spawn.type === 'bike') {
        mesh = createDispatchBikeMesh();
      } else {
        const colors = [0xef4444, 0x2563eb, 0x10b981, 0x7c3aed, 0x0f172a, 0xffffff, 0xd97706];
        mesh = createSedanMesh(colors[idx % colors.length]);
      }

      // Add blinking amber hazard lights
      const hazardGeo = new THREE.SphereGeometry(0.12, 8, 8);
      const hazardMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, visible: false });
      const hazardFL = new THREE.Mesh(hazardGeo, hazardMat);
      hazardFL.position.set(-0.9, 0.7, 1.8);
      const hazardFR = new THREE.Mesh(hazardGeo, hazardMat);
      hazardFR.position.set(0.9, 0.7, 1.8);
      const hazardRL = new THREE.Mesh(hazardGeo, hazardMat);
      hazardRL.position.set(-0.9, 0.7, -1.8);
      const hazardRR = new THREE.Mesh(hazardGeo, hazardMat);
      hazardRR.position.set(0.9, 0.7, -1.8);
      mesh.add(hazardFL, hazardFR, hazardRL, hazardRR);
      const hazardLights = [hazardFL, hazardFR, hazardRL, hazardRR];

      // Add rear brake lights (Glow bright red when slowing down or queued)
      const brakeGeo = new THREE.BoxGeometry(0.35, 0.18, 0.08);
      const brakeMat = new THREE.MeshBasicMaterial({ color: 0xff0000, visible: false });
      const brakeL = new THREE.Mesh(brakeGeo, brakeMat);
      brakeL.position.set(-0.75, 0.8, -2.15);
      const brakeR = new THREE.Mesh(brakeGeo, brakeMat);
      brakeR.position.set(0.75, 0.8, -2.15);
      mesh.add(brakeL, brakeR);
      const brakeLights = [brakeL, brakeR];

      const dx = nodeB.x - nodeA.x;
      const dz = nodeB.z - nodeA.z;
      const segLen = Math.hypot(dx, dz) || 1;
      const dirX = dx / segLen;
      const dirZ = dz / segLen;
      const perpX = -dirZ;
      const perpZ = dirX;

      const progress = Math.random() * 0.85;
      const startX = nodeA.x + dirX * (progress * segLen) + perpX * spawn.lane;
      const startZ = nodeA.z + dirZ * (progress * segLen) + perpZ * spawn.lane;
      const rotY = Math.atan2(dirX, dirZ);

      mesh.position.set(startX, 0, startZ);
      mesh.rotation.y = rotY;
      scene.add(mesh);

      // Base maximum speeds by vehicle type
      let baseMax = 16;
      if (spawn.type === 'keke') baseMax = 9.5;
      else if (spawn.type === 'brt') baseMax = 13.0;
      else if (spawn.type === 'danfo') baseMax = 14.5;
      else if (spawn.type === 'bike') baseMax = 18.0;
      else baseMax = 17.0; // Sedan

      // Personality adjustment
      if (spawn.personality === 'aggressive') baseMax *= 1.15;
      else if (spawn.personality === 'cautious') baseMax *= 0.82;

      const data: AITrafficVehicle = {
        id: `ai_veh_${idx}`,
        type: spawn.type,
        currentNodeId: nodeA.id,
        targetNodeId: nodeB.id,
        nodeIndex: 0,
        x: startX,
        y: 0,
        z: startZ,
        rotationY: rotY,
        speed: baseMax * 0.6,
        maxSpeed: baseMax,
        laneOffset: spawn.lane,
        segmentProgress: progress,
        isAccident: false,
        accidentTimer: 0,
        impactVelocity: { x: 0, z: 0 },
        hazardBlinking: false,
        driverPersonality: spawn.personality,
        passengerStopTimer: 0,
        isPassengerStopping: false,
        isBraking: false,
      };

      this.vehicles.push({ data, mesh, hazardLights, brakeLights });
    });
  }

  // Trigger accident when high-speed impact occurs
  public triggerAccident(vehicleId: string, impactVelocity: { x: number; z: number }) {
    const item = this.vehicles.find((v) => v.data.id === vehicleId);
    if (!item) return;

    item.data.isAccident = true;
    item.data.accidentTimer = 15; // Stays at accident scene for 15 seconds
    item.data.impactVelocity = {
      x: impactVelocity.x * 0.85,
      z: impactVelocity.z * 0.85,
    };
    item.data.speed = 0;

    const now = performance.now();
    if (now - this.lastGlobalHornTime > 900) {
      this.lastGlobalHornTime = now;
      if (item.data.type === 'danfo' || item.data.type === 'brt') {
        soundEngine.playDanfoHorn();
      } else {
        soundEngine.playCarHorn();
      }
    }
  }

  public update(
    delta: number,
    playerPos: { x: number; z: number },
    playerCarState?: { x: number; z: number; isDriving: boolean },
    timeMinutes: number = 360
  ) {
    // 1. Update active Lagos traffic condition based on time of day
    this.currentTrafficCondition = getLagosTrafficCondition(timeMinutes);
    const speedMult = this.currentTrafficCondition.speedMultiplier;
    const isRushHour = this.currentTrafficCondition.isRushHour;

    for (let i = 0; i < this.vehicles.length; i++) {
      const item = this.vehicles[i];
      const { data, mesh, hazardLights, brakeLights } = item;

      // =====================================================================
      // 1. ACCIDENT STATE: Vehicle was hit in a crash!
      // =====================================================================
      if (data.isAccident) {
        data.accidentTimer -= delta;

        if (data.impactVelocity) {
          data.x += data.impactVelocity.x * delta;
          data.z += data.impactVelocity.z * delta;
          data.impactVelocity.x *= Math.max(0, 1 - delta * 2.8);
          data.impactVelocity.z *= Math.max(0, 1 - delta * 2.8);
        }

        // Amber hazard flasher
        const isBlinkOn = Math.floor(data.accidentTimer * 4) % 2 === 0;
        if (hazardLights) {
          hazardLights.forEach((hl) => (hl.visible = isBlinkOn));
        }

        mesh.position.set(data.x, 0, data.z);

        if (data.accidentTimer <= 0) {
          data.isAccident = false;
          if (hazardLights) hazardLights.forEach((hl) => (hl.visible = false));
          data.impactVelocity = { x: 0, z: 0 };
        }
        continue;
      }

      // =====================================================================
      // 2. DANFO / COMMERCIAL BUS PASSENGER STOP ROUTINE
      // =====================================================================
      if (data.type === 'danfo' || data.type === 'brt') {
        if (data.isPassengerStopping) {
          data.passengerStopTimer = (data.passengerStopTimer || 0) - delta;
          data.speed = THREE.MathUtils.damp(data.speed, 0, 5, delta);

          // Blink hazard/indicator lights while picking up passengers
          const blink = Math.floor(data.passengerStopTimer * 3.5) % 2 === 0;
          if (hazardLights) hazardLights.forEach((hl) => (hl.visible = blink));
          if (brakeLights) brakeLights.forEach((bl) => (bl.visible = true));

          if (data.passengerStopTimer <= 0) {
            data.isPassengerStopping = false;
            if (hazardLights) hazardLights.forEach((hl) => (hl.visible = false));
          }
          continue;
        } else {
          // Occasional random passenger stop in commercial areas
          if (Math.random() < delta * 0.015 && data.speed > 4.0) {
            data.isPassengerStopping = true;
            data.passengerStopTimer = 3.5 + Math.random() * 2.5; // Stops for ~4 seconds
          }
        }
      }

      // =====================================================================
      // 3. NORMAL TRAFFIC ON ROAD SEGMENTS
      // =====================================================================
      const nodeA = this.nodeMap.get(data.currentNodeId);
      const nodeB = this.nodeMap.get(data.targetNodeId);
      if (!nodeA || !nodeB) continue;

      const dx = nodeB.x - nodeA.x;
      const dz = nodeB.z - nodeA.z;
      const segLen = Math.hypot(dx, dz) || 1;
      const dirX = dx / segLen;
      const dirZ = dz / segLen;
      const perpX = -dirZ;
      const perpZ = dirX;

      // Base target speed influenced by Time of Day Congestion
      let desiredSpeed = data.maxSpeed * speedMult;

      // Queueing & Anti-Collision: Check distance to vehicle ahead
      let isQueued = false;
      const followLimit = isRushHour ? 15.0 : 12.0;

      for (let j = 0; j < this.vehicles.length; j++) {
        if (i === j) continue;
        const other = this.vehicles[j].data;
        const distToOther = Math.hypot(other.x - data.x, other.z - data.z);

        if (distToOther < followLimit) {
          const toOtherX = other.x - data.x;
          const toOtherZ = other.z - data.z;
          const forwardDot = toOtherX * dirX + toOtherZ * dirZ;

          if (forwardDot > 0 && forwardDot < followLimit) {
            if (other.isAccident) {
              // Steer around accident scene slowly
              desiredSpeed = Math.min(desiredSpeed, 3.0);
            } else if (forwardDot < 4.2) {
              // Bumper-to-bumper Lagos queue: complete stop behind vehicle ahead
              desiredSpeed = 0;
              isQueued = true;
            } else if (forwardDot < 7.5) {
              // Slow down significantly to match leader
              desiredSpeed = Math.min(desiredSpeed, Math.max(1.5, other.speed * 0.8));
              isQueued = true;
            } else {
              desiredSpeed = Math.min(desiredSpeed, other.speed);
            }
          }
        }
      }

      // Check player car or player on foot
      const checkPos =
        playerCarState && playerCarState.isDriving
          ? { x: playerCarState.x, z: playerCarState.z }
          : playerPos;

      const distToPlayer = Math.hypot(checkPos.x - data.x, checkPos.z - data.z);
      if (distToPlayer < 10.0) {
        const toPlayerX = checkPos.x - data.x;
        const toPlayerZ = checkPos.z - data.z;
        const forwardDot = toPlayerX * dirX + toPlayerZ * dirZ;
        if (forwardDot > 0 && forwardDot < 7.8) {
          desiredSpeed = 0;
          isQueued = true;

          // Impatient Lagos driver honks if blocked
          const now = performance.now();
          if (now - this.lastGlobalHornTime > (isRushHour ? 2500 : 4500)) {
            this.lastGlobalHornTime = now;
            if (data.type === 'danfo' || data.type === 'brt') soundEngine.playDanfoHorn();
            else soundEngine.playCarHorn();
          }
        }
      }

      // Smooth acceleration & braking
      const prevSpeed = data.speed;
      data.speed = THREE.MathUtils.damp(data.speed, desiredSpeed, desiredSpeed === 0 ? 5.5 : 2.8, delta);

      // Red brake lights when decelerating or queued in go-slow
      const isDecelerating = data.speed < prevSpeed - 0.2 || isQueued || desiredSpeed === 0;
      if (brakeLights) {
        brakeLights.forEach((bl) => (bl.visible = isDecelerating));
      }

      // Advance progress strictly along road segment
      data.segmentProgress += (data.speed * delta) / segLen;

      // When reaching end of road segment (Junction / Intersection)
      if (data.segmentProgress >= 1.0) {
        data.segmentProgress = 0;
        data.currentNodeId = nodeB.id;

        const connections = nodeB.connections.filter((cId) => cId !== nodeA.id);
        const validChoices = connections.length > 0 ? connections : nodeB.connections;

        if (validChoices.length > 0) {
          let bestTarget = validChoices[0];
          let bestDot = -2;

          for (const candId of validChoices) {
            const candNode = this.nodeMap.get(candId);
            if (!candNode) continue;
            const nextDx = candNode.x - nodeB.x;
            const nextDz = candNode.z - nodeB.z;
            const nextLen = Math.hypot(nextDx, nextDz) || 1;
            const dot = dirX * (nextDx / nextLen) + dirZ * (nextDz / nextLen);
            if (dot > bestDot) {
              bestDot = dot;
              bestTarget = candId;
            }
          }

          const goodChoices = validChoices.filter((cId) => {
            const cNode = this.nodeMap.get(cId);
            if (!cNode) return false;
            const nDx = cNode.x - nodeB.x;
            const nDz = cNode.z - nodeB.z;
            const nLen = Math.hypot(nDx, nDz) || 1;
            return dirX * (nDx / nLen) + dirZ * (nDz / nLen) > -0.3;
          });

          if (goodChoices.length > 0) {
            data.targetNodeId = goodChoices[Math.floor(Math.random() * goodChoices.length)];
          } else {
            data.targetNodeId = bestTarget;
          }
        }
      }

      // Calculate exact physical position locked to road lane
      const currProgress = Math.min(1.0, Math.max(0, data.segmentProgress));
      data.x = nodeA.x + dirX * (currProgress * segLen) + perpX * data.laneOffset;
      data.z = nodeA.z + dirZ * (currProgress * segLen) + perpZ * data.laneOffset;

      // Target smooth heading
      const targetRotY = Math.atan2(dirX, dirZ);
      let diff = targetRotY - data.rotationY;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      data.rotationY += diff * Math.min(1.0, delta * 4.5);

      // Update 3D mesh
      mesh.position.set(data.x, 0, data.z);
      mesh.rotation.y = data.rotationY;
    }
  }

  public cleanup() {
    if (this.scene) {
      this.vehicles.forEach((v) => {
        this.scene?.remove(v.mesh);
      });
    }
    this.vehicles = [];
  }
}

export const trafficSystem = new TrafficSystem();
