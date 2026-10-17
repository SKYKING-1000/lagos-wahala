import * as THREE from 'three';
import { LAGOS_ROAD_NODES, LAGOS_LANDMARKS } from './lagosGeography';
import {
  createAsphaltTexture,
  createCurbTexture,
  createHomeCompoundMesh,
  createBukaStallMesh,
  createOfficeBuildingMesh,
  createInteractiveOfficeMesh,
  createNPCMesh,
  createPetrolStationMesh,
  createElectricPoleMesh,
  createSedanMesh,
  createBrokenContainerTruckMesh,
  createLASTMACheckpointMesh,
} from './proceduralModels';
import { physicsSystem } from '../game/physics';
import { VehicleState } from '../types/game';

export interface BuiltWorld {
  rootGroup: THREE.Group;
  homeObjects: {
    door: THREE.Mesh;
    compoundGate: THREE.Mesh;
    alarmClock: THREE.Mesh;
    generator: THREE.Mesh;
  };
  playerCarMesh: THREE.Group;
  playerCarState: VehicleState;
  routeLineMesh: THREE.Line;
  updateRouteLine: (points: { x: number; y: number; z: number }[]) => void;
}

export function buildLagosCity(scene: THREE.Scene): BuiltWorld {
  physicsSystem.clear();
  const rootGroup = new THREE.Group();
  scene.add(rootGroup);

  // 1. Terrain Ground
  const terrainGeo = new THREE.PlaneGeometry(1200, 1200);
  terrainGeo.rotateX(-Math.PI / 2);
  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x3f3f46, // Urban warm grey soil / concrete ground
    roughness: 0.9,
  });
  const ground = new THREE.Mesh(terrainGeo, terrainMat);
  ground.position.y = -0.05;
  ground.receiveShadow = true;
  rootGroup.add(ground);

  // Lagos Lagoon Water Surface (between Yaba and Island)
  const lagoonGeo = new THREE.PlaneGeometry(500, 400);
  lagoonGeo.rotateX(-Math.PI / 2);
  const lagoonMat = new THREE.MeshStandardMaterial({
    color: 0x0369a1,
    roughness: 0.1,
    metalness: 0.8,
  });
  const lagoon = new THREE.Mesh(lagoonGeo, lagoonMat);
  lagoon.position.set(130, -1.2, 230);
  rootGroup.add(lagoon);

  // 2. Road Network Generation
  const asphaltTex = createAsphaltTexture();
  const roadMat = new THREE.MeshStandardMaterial({
    map: asphaltTex,
    roughness: 0.85,
    metalness: 0.1,
  });

  const curbTex = createCurbTexture();
  const curbMat = new THREE.MeshStandardMaterial({
    map: curbTex,
    roughness: 0.6,
  });

  const bridgePillarMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.7,
  });

  // Track connected road segments to avoid duplicates
  const drawnEdges = new Set<string>();

  LAGOS_ROAD_NODES.forEach((node) => {
    node.connections.forEach((connId) => {
      const neighbor = LAGOS_ROAD_NODES.find((n) => n.id === connId);
      if (!neighbor) return;

      const edgeKey = [node.id, connId].sort().join('___');
      if (drawnEdges.has(edgeKey)) return;
      drawnEdges.add(edgeKey);

      const dx = neighbor.x - node.x;
      const dz = neighbor.z - node.z;
      const length = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);
      const midX = (node.x + neighbor.x) / 2;
      const midZ = (node.z + neighbor.z) / 2;

      const isExpressway = node.id.includes('tmb') || node.id.includes('exp') || node.id.includes('lekki_bridge');
      const roadWidth = isExpressway ? 14 : 9;

      // Road Segment Mesh
      const roadGeo = new THREE.PlaneGeometry(roadWidth, length);
      roadGeo.rotateX(-Math.PI / 2);
      const roadMesh = new THREE.Mesh(roadGeo, roadMat);
      roadMesh.position.set(midX, 0.02, midZ);
      roadMesh.rotation.y = angle;
      roadMesh.receiveShadow = true;
      rootGroup.add(roadMesh);

      // Curbs along edges
      const curbLeft = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, length), curbMat);
      curbLeft.position.set(midX - Math.cos(angle) * (roadWidth / 2 + 0.25), 0.12, midZ + Math.sin(angle) * (roadWidth / 2 + 0.25));
      curbLeft.rotation.y = angle;
      rootGroup.add(curbLeft);

      const curbRight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, length), curbMat);
      curbRight.position.set(midX + Math.cos(angle) * (roadWidth / 2 + 0.25), 0.12, midZ - Math.sin(angle) * (roadWidth / 2 + 0.25));
      curbRight.rotation.y = angle;
      rootGroup.add(curbRight);

      // Third Mainland Bridge Elevated Pillars over Lagoon
      if (node.id.includes('tmb') || neighbor.id.includes('tmb')) {
        const pillarGeo = new THREE.CylinderGeometry(0.8, 0.8, 6, 8);
        const pillar1 = new THREE.Mesh(pillarGeo, bridgePillarMat);
        pillar1.position.set(midX - 4, -1.8, midZ);
        rootGroup.add(pillar1);
        const pillar2 = new THREE.Mesh(pillarGeo, bridgePillarMat);
        pillar2.position.set(midX + 4, -1.8, midZ);
        rootGroup.add(pillar2);
      }
    });

    // Add street electric pole at node with cylinder collision
    const pole = createElectricPoleMesh();
    pole.position.set(node.x + 6, 0, node.z + 2);
    rootGroup.add(pole);
    physicsSystem.addCylinder(node.x + 6, node.z + 2, 0.4, `Electric Pole (${node.id})`);
  });

  // Third Mainland Bridge Guardrails (Protecting cars on the bridge from falling into the lagoon)
  const tmbRailMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
  const railLeft = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 190), tmbRailMat);
  railLeft.position.set(88, 0.6, 220);
  rootGroup.add(railLeft);
  physicsSystem.addBox(87, 89, 125, 315, 'Third Mainland Bridge Left Guardrail');

  const railRight = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 190), tmbRailMat);
  railRight.position.set(128, 0.6, 220);
  rootGroup.add(railRight);
  physicsSystem.addBox(127, 129, 125, 315, 'Third Mainland Bridge Right Guardrail');

  // 3. Build Player Home Compound (in Ikeja GRA)
  const homeLandmark = LAGOS_LANDMARKS.find((l) => l.id === 'player_home')!;
  const home = createHomeCompoundMesh();
  home.group.position.set(homeLandmark.position.x, 0, homeLandmark.position.z);
  rootGroup.add(home.group);

  const hx = homeLandmark.position.x;
  const hz = homeLandmark.position.z;

  // Detailed Bedroom Room Walls (leaving door opening at x: hx - 1.2 to hx + 0.8 at z = hz + 5)
  physicsSystem.addBox(hx - 5.0, hx + 5.0, hz - 5.2, hz - 4.8, 'Bedroom Back Wall');
  physicsSystem.addBox(hx - 5.2, hx - 4.8, hz - 5.0, hz + 5.0, 'Bedroom Left Wall');
  physicsSystem.addBox(hx + 4.8, hx + 5.2, hz - 5.0, hz + 5.0, 'Bedroom Right Wall');
  physicsSystem.addBox(hx - 5.0, hx - 1.2, hz + 4.8, hz + 5.2, 'Bedroom Front Wall Left');
  physicsSystem.addBox(hx + 0.8, hx + 5.0, hz + 4.8, hz + 5.2, 'Bedroom Front Wall Right');

  // Bedroom Furniture Colliders
  physicsSystem.addBox(hx - 4.4, hx - 2.0, hz - 4.6, hz - 1.8, 'Master Bed');
  physicsSystem.addBox(hx - 1.95, hx - 1.25, hz - 4.65, hz - 3.95, 'Bedside Table');
  physicsSystem.addBox(hx + 2.3, hx + 4.5, hz - 4.25, hz - 3.35, 'Wardrobe');

  // Compound Perimeter Walls (leaving open security gate from hx - 3.0 to hx + 3.0 at z = hz + 15)
  physicsSystem.addBox(hx - 10.0, hx + 10.0, hz - 9.3, hz - 8.7, 'Compound Rear Wall');
  physicsSystem.addBox(hx - 10.3, hx - 9.7, hz - 9.0, hz + 15.0, 'Compound Left Wall');
  physicsSystem.addBox(hx + 9.7, hx + 10.3, hz - 9.0, hz + 15.0, 'Compound Right Wall');
  physicsSystem.addBox(hx - 10.0, hx - 3.0, hz + 14.7, hz + 15.3, 'Compound Front Wall Left');
  physicsSystem.addBox(hx + 3.0, hx + 10.0, hz + 14.7, hz + 15.3, 'Compound Front Wall Right');

  // Compound Yard Objects (Generator & Water Tank Scaffolding)
  physicsSystem.addBox(hx - 8.2, hx - 6.8, hz + 7.5, hz + 8.5, 'Generator Shed');
  physicsSystem.addBox(hx + 7.0, hx + 8.6, hz + 8.0, hz + 9.6, 'GeePee Water Tank Scaffold');

  // Compound Security Guard NPC (Baba Segun) standing at the compound gate
  const babaSegunNPC = createNPCMesh(0x1e3a8a, 0x0f172a, false, 'Baba Segun (Security Guard)');
  babaSegunNPC.position.set(hx, 0, hz + 14.5);
  rootGroup.add(babaSegunNPC);
  physicsSystem.addCylinder(hx, hz + 14.5, 0.4, 'Baba Segun');

  // 4. Build Landmarks
  LAGOS_LANDMARKS.forEach((lm) => {
    if (lm.type === 'buka') {
      const buka = createBukaStallMesh(lm.name);
      buka.position.set(lm.position.x, 0, lm.position.z);
      rootGroup.add(buka);
      physicsSystem.addBox(lm.position.x - 2.2, lm.position.x + 2.2, lm.position.z - 1.2, lm.position.z + 1.2, lm.name);

      // Mama Put / Cook NPC behind counter
      const cookNPC = createNPCMesh(0xd97706, 0x1e293b, false, 'Mama Ngozi (Chef)');
      cookNPC.position.set(lm.position.x, 0, lm.position.z - 0.4);
      rootGroup.add(cookNPC);

      // Customer NPC eating on bench
      const customerNPC = createNPCMesh(0x0284c7, 0x1e293b, true, 'Customer');
      customerNPC.position.set(lm.position.x + 0.6, 0, lm.position.z + 1.4);
      customerNPC.rotation.y = Math.PI;
      rootGroup.add(customerNPC);
    } else if (lm.type === 'office') {
      if (lm.id === 'tech_office') {
        // *** 100% PHYSICALLY ENTERABLE PAYLAGOS TECH HUB ***
        const interactiveOffice = createInteractiveOfficeMesh();
        interactiveOffice.position.set(lm.position.x, 0, lm.position.z);
        rootGroup.add(interactiveOffice);

        const ox = lm.position.x;
        const oz = lm.position.z;

        // Perimeter Outer Walls (Leaving Front Doorway completely open from ox - 2.2 to ox + 2.2 at oz + 8)
        physicsSystem.addBox(ox - 9.0, ox + 9.0, oz - 8.2, oz - 7.8, 'PayLagos Back Wall');
        physicsSystem.addBox(ox - 9.2, ox - 8.8, oz - 8.0, oz + 8.0, 'PayLagos Left Wall');
        physicsSystem.addBox(ox + 8.8, ox + 9.2, oz - 8.0, oz + 8.0, 'PayLagos Right Wall');
        // Front wall left wing
        physicsSystem.addBox(ox - 9.0, ox - 2.2, oz + 7.8, oz + 8.2, 'PayLagos Front Wall Left');
        // Front wall right wing
        physicsSystem.addBox(ox + 2.2, ox + 9.0, oz + 7.8, oz + 8.2, 'PayLagos Front Wall Right');

        // Reception Desk collider (interior)
        physicsSystem.addBox(ox - 2.1, ox + 2.1, oz + 5.0, oz + 6.0, 'Reception Counter');

        // Central Workstation Desks colliders
        physicsSystem.addBox(ox - 5.3, ox - 2.7, oz - 0.6, oz + 0.6, "Tayo's Workstation Desk");
        physicsSystem.addBox(ox - 5.3, ox - 2.7, oz - 3.6, oz - 2.4, "Chidinma's Workstation Desk");
        physicsSystem.addBox(ox + 2.6, ox + 5.4, oz - 0.7, oz + 0.7, 'Your Assigned Workstation Desk');

        // Manager Office Partition Wall & Executive Desk colliders
        physicsSystem.addBox(ox - 7.7, ox - 5.3, oz - 6.4, oz - 5.2, "Oga Femi's Executive Desk");
        physicsSystem.addBox(ox - 8.8, ox - 4.0, oz - 4.1, oz - 3.9, 'Manager Glass Wall');

        // Break Room Kitchen Counter collider
        physicsSystem.addBox(ox + 4.4, ox + 8.6, oz - 7.5, oz - 6.5, 'Break Room Kitchen Counter');
      } else {
        // High-rise glass tower (Zenith Tower in VI)
        const office = createOfficeBuildingMesh(8, 0x0284c7);
        office.position.set(lm.position.x, 0, lm.position.z);
        rootGroup.add(office);
        physicsSystem.addBox(lm.position.x - 8.5, lm.position.x + 8.5, lm.position.z - 8.5, lm.position.z + 8.5, lm.name);
      }
    } else if (lm.type === 'fuel') {
      const fuelStation = createPetrolStationMesh();
      fuelStation.position.set(lm.position.x, 0, lm.position.z);
      rootGroup.add(fuelStation);

      const px = lm.position.x;
      const pz = lm.position.z;

      // Canopy 4 Support Columns (Cylinders)
      physicsSystem.addCylinder(px - 6, pz - 4, 0.45, `${lm.name} Column NW`);
      physicsSystem.addCylinder(px + 6, pz - 4, 0.45, `${lm.name} Column NE`);
      physicsSystem.addCylinder(px - 6, pz + 4, 0.45, `${lm.name} Column SW`);
      physicsSystem.addCylinder(px + 6, pz + 4, 0.45, `${lm.name} Column SE`);

      // 2 Pump Islands (allowing vehicles to drive between and on either side to refuel)
      physicsSystem.addBox(px - 4.3, px - 2.7, pz - 2.0, pz + 2.0, `${lm.name} Pump Island 1`);
      physicsSystem.addBox(px + 2.7, px + 4.3, pz - 2.0, pz + 2.0, `${lm.name} Pump Island 2`);

      // Fuel Attendant NPC (Ibrahim) standing by the pump
      const attendantNPC = createNPCMesh(0x15803d, 0x1e293b, false, 'Fuel Attendant');
      attendantNPC.position.set(px, 0, pz + 1.2);
      rootGroup.add(attendantNPC);
    } else if (lm.type === 'market') {
      const market = createOfficeBuildingMesh(3, 0xd97706);
      market.position.set(lm.position.x, 0, lm.position.z);
      rootGroup.add(market);
      physicsSystem.addBox(lm.position.x - 8.5, lm.position.x + 8.5, lm.position.z - 8.5, lm.position.z + 8.5, lm.name);

      // Market Street Hawkers / Traders
      const trader1 = createNPCMesh(0xec4899, 0x0f172a, false, 'Market Trader');
      trader1.position.set(lm.position.x + 8.8, 0, lm.position.z + 3);
      const trader2 = createNPCMesh(0x06b6d4, 0x1e293b, false, 'Tejuosho Shopper');
      trader2.position.set(lm.position.x - 8.8, 0, lm.position.z + 3);
      rootGroup.add(trader1, trader2);
    } else if (lm.type === 'landmark' && lm.id === 'alausa_secretariat') {
      const alausa = createOfficeBuildingMesh(6, 0x059669);
      alausa.position.set(lm.position.x, 0, lm.position.z);
      rootGroup.add(alausa);
      physicsSystem.addBox(lm.position.x - 8.5, lm.position.x + 8.5, lm.position.z - 8.5, lm.position.z + 8.5, lm.name);
    } else if (lm.type === 'landmark' && lm.id === 'lekki_toll_gate') {
      const tollPlaza = new THREE.Mesh(new THREE.BoxGeometry(22, 5.5, 4), new THREE.MeshStandardMaterial({ color: 0x334155 }));
      tollPlaza.position.set(lm.position.x, 2.75, lm.position.z);
      rootGroup.add(tollPlaza);
      physicsSystem.addBox(lm.position.x - 11, lm.position.x - 4, lm.position.z - 2, lm.position.z + 2, 'Lekki Toll Booth North');
      physicsSystem.addBox(lm.position.x + 4, lm.position.x + 11, lm.position.z - 2, lm.position.z + 2, 'Lekki Toll Booth South');

      // Toll Collector NPC
      const tollGuy = createNPCMesh(0x3b82f6, 0x1e293b, false, 'LCC Toll Officer');
      tollGuy.position.set(lm.position.x - 3.5, 0, lm.position.z);
      rootGroup.add(tollGuy);
    }
  });

  // Street Pedestrians walking along sidewalks in Ikeja and Yaba
  const ped1 = createNPCMesh(0xef4444, 0x334155, false, 'Pedestrian');
  ped1.position.set(6, 0, -350);
  const ped2 = createNPCMesh(0x8b5cf6, 0x1e293b, false, 'Pedestrian');
  ped2.position.set(24, 0, -35);
  const ped3 = createNPCMesh(0x10b981, 0x334155, false, 'Gala Hawker');
  ped3.position.set(38, 0, 395);
  rootGroup.add(ped1, ped2, ped3);

  // REAL LAGOS SITUATION 1: Broken 40-Foot Container Truck on Ikorodu Corridor (Causes Real Go-Slow!)
  const containerTruck = createBrokenContainerTruckMesh();
  containerTruck.position.set(13.5, 0, -185.0);
  containerTruck.rotation.y = 0.08; // Slightly skewed blocking lane
  rootGroup.add(containerTruck);
  physicsSystem.addBox(13.5 - 1.5, 13.5 + 1.5, -185.0 - 5.5, -185.0 + 5.5, 'Broken 40ft Container Truck');

  // REAL LAGOS SITUATION 2: Official LASTMA Vehicle Inspection Checkpoint near Victoria Island
  const lastmaStation = createLASTMACheckpointMesh();
  lastmaStation.position.set(-36.0, 0, 265.0);
  lastmaStation.rotation.y = Math.PI / 6;
  rootGroup.add(lastmaStation);
  physicsSystem.addBox(-36.0 - 2.5, -36.0 + 2.5, 265.0 - 0.6, 265.0 + 0.6, 'LASTMA Inspection Checkpoint');

  // 5. Player's Car (Parked right in front of home driveway)
  const playerCarMesh = createSedanMesh(0x1d4ed8); // Royal Blue commuter sedan
  const carInitialPos = { x: 40, y: 0, z: -455 };
  playerCarMesh.position.set(carInitialPos.x, carInitialPos.y, carInitialPos.z);
  playerCarMesh.rotation.y = 0;
  rootGroup.add(playerCarMesh);

  const playerCarState: VehicleState = {
    id: 'player_sedan',
    model: 'sedan',
    x: carInitialPos.x,
    y: 0,
    z: carInitialPos.z,
    rotationY: 0,
    speed: 0,
    steering: 0,
    fuel: 85, // 85% full
    maxFuel: 100,
    isPlayerInside: false,
    isEngineOn: false,
    headlightsOn: false,
  };

  // 6. Navigation Route Line (Disabled on 3D ground as requested - route lines removed in favor of GPS minimap)
  const routeLineGeo = new THREE.BufferGeometry();
  const routeLineMat = new THREE.LineBasicMaterial({
    color: 0x22c55e,
    transparent: true,
    opacity: 0,
    visible: false,
  });
  const routeLineMesh = new THREE.Line(routeLineGeo, routeLineMat);
  routeLineMesh.visible = false;
  // Intentionally not adding to rootGroup or keeping invisible to respect "no route lines across game map"

  const updateRouteLine = (_points: { x: number; y: number; z: number }[]) => {
    // Pure turn-by-turn text and minimap destination indicator used instead of 3D line
    routeLineMesh.visible = false;
  };

  return {
    rootGroup,
    homeObjects: home,
    playerCarMesh,
    playerCarState,
    routeLineMesh,
    updateRouteLine,
  };
}
