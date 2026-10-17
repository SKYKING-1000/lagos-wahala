import * as THREE from 'three';

/**
 * Procedural 3D Models for Lagos Survival Mode.
 * Composed of 3-12 part THREE.Groups with distinct materials and zero external asset dependencies.
 */

// Procedural Canvas Texture Generators
export function createAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark asphalt base
  ctx.fillStyle = '#22252a';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle aggregate speckles
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const gray = 40 + Math.floor(Math.random() * 35);
    ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 10);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createCurbTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;

  // Lagos alternating Black and Yellow curb stripes
  const stripeW = 32;
  for (let i = 0; i < 256; i += stripeW * 2) {
    ctx.fillStyle = '#facc15'; // Lagos Taxi Yellow
    ctx.fillRect(i, 0, stripeW, 32);
    ctx.fillStyle = '#18181b'; // Black
    ctx.fillRect(i + stripeW, 0, stripeW, 32);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Lagos Danfo Bus (Iconic Yellow Volkswagen Van with 2 Black Stripes)
export function createDanfoBusMesh(): THREE.Group {
  const group = new THREE.Group();

  const yellowMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Amber / Danfo Yellow
    roughness: 0.35,
    metalness: 0.15,
  });

  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.4,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x60a5fa,
    roughness: 0.1,
    transmission: 0.85,
    transparent: true,
    opacity: 0.8,
  });

  const blackMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.8,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    metalness: 0.9,
    roughness: 0.2,
  });

  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfef08a,
    emissiveIntensity: 0.6,
  });

  const tailLightMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 0.5,
  });

  // 1. Main body cabin
  const bodyGeo = new THREE.BoxGeometry(2.1, 1.6, 4.4);
  const bodyMesh = new THREE.Mesh(bodyGeo, yellowMat);
  bodyMesh.position.y = 1.2;
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // 2. Danfo twin black stripes (Iconic Lagos livery)
  const stripeGeo = new THREE.BoxGeometry(2.12, 0.12, 4.41);
  const stripe1 = new THREE.Mesh(stripeGeo, stripeMat);
  stripe1.position.y = 1.05;
  group.add(stripe1);

  const stripe2 = new THREE.Mesh(stripeGeo, stripeMat);
  stripe2.position.y = 1.25;
  group.add(stripe2);

  // 3. Windshield & Windows
  const windGeo = new THREE.BoxGeometry(2.0, 0.7, 0.1);
  const frontWind = new THREE.Mesh(windGeo, glassMat);
  frontWind.position.set(0, 1.45, 2.21);
  frontWind.rotation.x = -0.15;
  group.add(frontWind);

  const backWind = new THREE.Mesh(windGeo, glassMat);
  backWind.position.set(0, 1.45, -2.21);
  group.add(backWind);

  // 4. Roof Carrier / Luggage rack (Danfo classic)
  const rackGeo = new THREE.BoxGeometry(1.8, 0.2, 3.2);
  const rackMesh = new THREE.Mesh(rackGeo, blackMat);
  rackMesh.position.y = 2.1;
  group.add(rackMesh);

  // 5. Front bumper & Grille
  const bumperGeo = new THREE.BoxGeometry(2.2, 0.35, 0.4);
  const frontBumper = new THREE.Mesh(bumperGeo, chromeMat);
  frontBumper.position.set(0, 0.5, 2.25);
  frontBumper.castShadow = true;
  group.add(frontBumper);

  // 6. Headlights
  const lightGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.1, 12);
  lightGeo.rotateX(Math.PI / 2);
  const lightL = new THREE.Mesh(lightGeo, lightMat);
  lightL.position.set(-0.75, 1.0, 2.22);
  group.add(lightL);

  const lightR = new THREE.Mesh(lightGeo, lightMat);
  lightR.position.set(0.75, 1.0, 2.22);
  group.add(lightR);

  // Taillights
  const tailL = new THREE.Mesh(lightGeo, tailLightMat);
  tailL.position.set(-0.8, 0.9, -2.22);
  group.add(tailL);

  const tailR = new THREE.Mesh(lightGeo, tailLightMat);
  tailR.position.set(0.8, 0.9, -2.22);
  group.add(tailR);

  // 7. Wheels (4 wheels)
  const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 16);
  wheelGeo.rotateZ(Math.PI / 2);

  const wheelPositions = [
    [-1.05, 0.42, 1.4],
    [1.05, 0.42, 1.4],
    [-1.05, 0.42, -1.4],
    [1.05, 0.42, -1.4],
  ];

  wheelPositions.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, blackMat);
    wheel.position.set(wx, wy, wz);
    wheel.castShadow = true;

    // Hubcap
    const capGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.36, 8);
    capGeo.rotateZ(Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, chromeMat);
    wheel.add(cap);

    group.add(wheel);
  });

  return group;
}

// Procedural Keke Napep (3-wheeled Tricycle)
export function createKekeMesh(): THREE.Group {
  const group = new THREE.Group();

  const yellowMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.3,
  });
  const blackCanvasMat = new THREE.MeshStandardMaterial({
    color: 0x1c1917,
    roughness: 0.9,
  });
  const blackRubberMat = new THREE.MeshStandardMaterial({
    color: 0x09090b,
    roughness: 0.8,
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    metalness: 0.8,
    roughness: 0.3,
  });
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfef08a,
    emissiveIntensity: 0.7,
  });

  // Lower chassis
  const bodyGeo = new THREE.BoxGeometry(1.4, 0.5, 2.4);
  const body = new THREE.Mesh(bodyGeo, yellowMat);
  body.position.y = 0.55;
  body.castShadow = true;
  group.add(body);

  // Canvas canopy roof
  const roofGeo = new THREE.BoxGeometry(1.36, 0.8, 1.8);
  const roof = new THREE.Mesh(roofGeo, blackCanvasMat);
  roof.position.set(0, 1.35, -0.2);
  roof.castShadow = true;
  group.add(roof);

  // Slanted front windshield
  const frontNoseGeo = new THREE.BoxGeometry(1.1, 0.7, 0.7);
  const nose = new THREE.Mesh(frontNoseGeo, yellowMat);
  nose.position.set(0, 0.8, 0.95);
  group.add(nose);

  // Single front headlight
  const headGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.08, 12);
  headGeo.rotateX(Math.PI / 2);
  const head = new THREE.Mesh(headGeo, lightMat);
  head.position.set(0, 0.85, 1.32);
  group.add(head);

  // Handlebars
  const barGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8);
  barGeo.rotateZ(Math.PI / 2);
  const bar = new THREE.Mesh(barGeo, metalMat);
  bar.position.set(0, 0.95, 0.7);
  group.add(bar);

  // 3 Wheels (1 front center, 2 rear)
  const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 14);
  wheelGeo.rotateZ(Math.PI / 2);

  const frontWheel = new THREE.Mesh(wheelGeo, blackRubberMat);
  frontWheel.position.set(0, 0.3, 1.1);
  frontWheel.castShadow = true;
  group.add(frontWheel);

  const rearWheelL = new THREE.Mesh(wheelGeo, blackRubberMat);
  rearWheelL.position.set(-0.7, 0.3, -0.7);
  rearWheelL.castShadow = true;
  group.add(rearWheelL);

  const rearWheelR = new THREE.Mesh(wheelGeo, blackRubberMat);
  rearWheelR.position.set(0.7, 0.3, -0.7);
  rearWheelR.castShadow = true;
  group.add(rearWheelR);

  return group;
}

// Procedural Player Sedan / Commuter Car
export function createSedanMesh(colorHex: number = 0x2563eb): THREE.Group {
  const group = new THREE.Group();

  const carPaintMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.2,
    metalness: 0.7,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x93c5fd,
    roughness: 0.1,
    transmission: 0.9,
    transparent: true,
    opacity: 0.8,
  });

  const blackMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.7,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.15,
  });

  const headLightMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.8,
  });

  const tailLightMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    emissive: 0xdc2626,
    emissiveIntensity: 0.6,
  });

  // Lower chassis
  const chassisGeo = new THREE.BoxGeometry(1.9, 0.65, 4.3);
  const chassis = new THREE.Mesh(chassisGeo, carPaintMat);
  chassis.position.y = 0.55;
  chassis.castShadow = true;
  group.add(chassis);

  // Cabin / Glass roof
  const cabinGeo = new THREE.BoxGeometry(1.65, 0.65, 2.2);
  const cabin = new THREE.Mesh(cabinGeo, glassMat);
  cabin.position.set(0, 1.15, -0.15);
  cabin.castShadow = true;
  group.add(cabin);

  // Metal roof top
  const roofGeo = new THREE.BoxGeometry(1.55, 0.08, 1.9);
  const roof = new THREE.Mesh(roofGeo, carPaintMat);
  roof.position.set(0, 1.5, -0.15);
  group.add(roof);

  // Grille & Headlights
  const grilleGeo = new THREE.BoxGeometry(1.3, 0.3, 0.1);
  const grille = new THREE.Mesh(grilleGeo, chromeMat);
  grille.position.set(0, 0.5, 2.16);
  group.add(grille);

  const headGeo = new THREE.BoxGeometry(0.35, 0.18, 0.1);
  const headL = new THREE.Mesh(headGeo, headLightMat);
  headL.position.set(-0.7, 0.62, 2.16);
  group.add(headL);

  const headR = new THREE.Mesh(headGeo, headLightMat);
  headR.position.set(0.7, 0.62, 2.16);
  group.add(headR);

  // Taillights
  const tailGeo = new THREE.BoxGeometry(0.4, 0.16, 0.08);
  const tailL = new THREE.Mesh(tailGeo, tailLightMat);
  tailL.position.set(-0.7, 0.65, -2.16);
  group.add(tailL);

  const tailR = new THREE.Mesh(tailGeo, tailLightMat);
  tailR.position.set(0.7, 0.65, -2.16);
  group.add(tailR);

  // 4 Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 16);
  wheelGeo.rotateZ(Math.PI / 2);

  const wheelPositions = [
    [-0.95, 0.36, 1.3],
    [0.95, 0.36, 1.3],
    [-0.95, 0.36, -1.3],
    [0.95, 0.36, -1.3],
  ];

  wheelPositions.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, blackMat);
    wheel.position.set(wx, wy, wz);
    wheel.castShadow = true;

    // Alloy Rim
    const rimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.29, 8);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, chromeMat);
    wheel.add(rim);

    group.add(wheel);
  });

  return group;
}

// Procedural Lagos Blue BRT Mass Transit Bus (Primero / LAMATA)
export function createBRTBusMesh(): THREE.Group {
  const group = new THREE.Group();

  const brtBlueMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8, // Vibrant Lagos BRT blue
    roughness: 0.35,
    metalness: 0.25,
  });

  const whiteRoofMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.4,
  });

  const windowGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e293b,
    roughness: 0.1,
    transmission: 0.85,
    transparent: true,
    opacity: 0.88,
  });

  const blackMat = new THREE.MeshStandardMaterial({
    color: 0x09090b,
    roughness: 0.8,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.9,
    roughness: 0.2,
  });

  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.85,
  });

  const tailMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 0.75,
  });

  // 1. Lower Chassis
  const bodyGeo = new THREE.BoxGeometry(2.3, 1.4, 6.8);
  const body = new THREE.Mesh(bodyGeo, brtBlueMat);
  body.position.y = 1.1;
  body.castShadow = true;
  group.add(body);

  // 2. White Roof
  const roofGeo = new THREE.BoxGeometry(2.26, 0.45, 6.7);
  const roof = new THREE.Mesh(roofGeo, whiteRoofMat);
  roof.position.set(0, 1.95, 0);
  roof.castShadow = true;
  group.add(roof);

  // Roof AC Units
  const acGeo = new THREE.BoxGeometry(1.4, 0.22, 1.6);
  const ac = new THREE.Mesh(acGeo, whiteRoofMat);
  ac.position.set(0, 2.25, -0.8);
  group.add(ac);

  // 3. Side & Front Window Bands
  const sideGlassGeo = new THREE.BoxGeometry(2.32, 0.65, 5.2);
  const sideGlass = new THREE.Mesh(sideGlassGeo, windowGlassMat);
  sideGlass.position.set(0, 1.45, -0.4);
  group.add(sideGlass);

  // Front Windshield
  const frontWindshieldGeo = new THREE.BoxGeometry(2.24, 0.9, 0.1);
  const frontWindshield = new THREE.Mesh(frontWindshieldGeo, windowGlassMat);
  frontWindshield.position.set(0, 1.45, 3.41);
  group.add(frontWindshield);

  // Destination LED Route Sign ("TBS / MARINA EXPRESS")
  const ledSignGeo = new THREE.BoxGeometry(1.6, 0.22, 0.1);
  const ledSignMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.9,
  });
  const ledSign = new THREE.Mesh(ledSignGeo, ledSignMat);
  ledSign.position.set(0, 1.95, 3.41);
  group.add(ledSign);

  // Headlights
  const headGeo = new THREE.BoxGeometry(0.35, 0.2, 0.1);
  const headL = new THREE.Mesh(headGeo, lightMat);
  headL.position.set(-0.85, 0.7, 3.42);
  group.add(headL);

  const headR = new THREE.Mesh(headGeo, lightMat);
  headR.position.set(0.85, 0.7, 3.42);
  group.add(headR);

  // Taillights
  const tailGeo = new THREE.BoxGeometry(0.35, 0.35, 0.1);
  const tailL = new THREE.Mesh(tailGeo, tailMat);
  tailL.position.set(-0.9, 0.9, -3.42);
  group.add(tailL);

  const tailR = new THREE.Mesh(tailGeo, tailMat);
  tailR.position.set(0.9, 0.9, -3.42);
  group.add(tailR);

  // 6 Wheels (2 front, 4 rear tandem)
  const wheelGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.35, 16);
  wheelGeo.rotateZ(Math.PI / 2);

  const wheelPositions = [
    [-1.15, 0.44, 2.3],
    [1.15, 0.44, 2.3],
    [-1.15, 0.44, -1.7],
    [1.15, 0.44, -1.7],
    [-1.15, 0.44, -2.6],
    [1.15, 0.44, -2.6],
  ];

  wheelPositions.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, blackMat);
    wheel.position.set(wx, wy, wz);
    wheel.castShadow = true;

    const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.36, 8);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, chromeMat);
    wheel.add(rim);

    group.add(wheel);
  });

  return group;
}

// Procedural Lagos Dispatch Rider Motorcycle (Okada / Dispatch Bike)
export function createDispatchBikeMesh(): THREE.Group {
  const group = new THREE.Group();

  const bikeRedMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.3,
    metalness: 0.5,
  });

  const blackMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.8,
  });

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.85,
    roughness: 0.2,
  });

  const boxYellowMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Yellow/Amber delivery box
    roughness: 0.4,
  });

  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfef08a,
    emissiveIntensity: 0.8,
  });

  // Bike Frame & Engine block
  const frameGeo = new THREE.BoxGeometry(0.35, 0.45, 1.4);
  const frame = new THREE.Mesh(frameGeo, bikeRedMat);
  frame.position.set(0, 0.6, 0);
  frame.castShadow = true;
  group.add(frame);

  // Black Leather Seat
  const seatGeo = new THREE.BoxGeometry(0.32, 0.12, 0.65);
  const seat = new THREE.Mesh(seatGeo, blackMat);
  seat.position.set(0, 0.88, -0.1);
  group.add(seat);

  // Rear Delivery Dispatch Box
  const boxGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
  const box = new THREE.Mesh(boxGeo, boxYellowMat);
  box.position.set(0, 1.05, -0.65);
  box.castShadow = true;
  group.add(box);

  // Handlebars
  const handleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8);
  handleGeo.rotateZ(Math.PI / 2);
  const handle = new THREE.Mesh(handleGeo, metalMat);
  handle.position.set(0, 1.0, 0.5);
  group.add(handle);

  // Front Headlight
  const headGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.06, 12);
  headGeo.rotateX(Math.PI / 2);
  const head = new THREE.Mesh(headGeo, lightMat);
  head.position.set(0, 0.9, 0.75);
  group.add(head);

  // Front & Rear Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.12, 14);
  wheelGeo.rotateZ(Math.PI / 2);

  const frontWheel = new THREE.Mesh(wheelGeo, blackMat);
  frontWheel.position.set(0, 0.32, 0.85);
  frontWheel.castShadow = true;
  group.add(frontWheel);

  const rearWheel = new THREE.Mesh(wheelGeo, blackMat);
  rearWheel.position.set(0, 0.32, -0.85);
  rearWheel.castShadow = true;
  group.add(rearWheel);

  return group;
}

// Procedural Controllable 3D Player Character
export function createPlayerMesh(): {
  group: THREE.Group;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
} {
  const group = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0x5c3a21, // Deep bronze skin tone
    roughness: 0.6,
  });

  const shirtMat = new THREE.MeshStandardMaterial({
    color: 0x059669, // Emerald green Nigerian print polo
    roughness: 0.5,
  });

  const jeansMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b, // Dark navy trousers
    roughness: 0.7,
  });

  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // White sneakers
    roughness: 0.3,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.9,
  });

  // Torso
  const torsoGeo = new THREE.BoxGeometry(0.5, 0.65, 0.28);
  const torso = new THREE.Mesh(torsoGeo, shirtMat);
  torso.position.y = 1.15;
  torso.castShadow = true;
  group.add(torso);

  // Head
  const headGeo = new THREE.BoxGeometry(0.26, 0.28, 0.26);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 1.62;
  head.castShadow = true;
  group.add(head);

  // Hair / Cap
  const hairGeo = new THREE.BoxGeometry(0.28, 0.1, 0.28);
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.y = 1.76;
  group.add(hair);

  // Arms
  const armGeo = new THREE.BoxGeometry(0.14, 0.55, 0.14);
  armGeo.translate(0, -0.22, 0);

  const leftArm = new THREE.Mesh(armGeo, shirtMat);
  leftArm.position.set(-0.34, 1.4, 0);
  leftArm.castShadow = true;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, shirtMat);
  rightArm.position.set(0.34, 1.4, 0);
  rightArm.castShadow = true;
  group.add(rightArm);

  // Legs
  const legGeo = new THREE.BoxGeometry(0.18, 0.7, 0.18);
  legGeo.translate(0, -0.35, 0);

  const leftLeg = new THREE.Mesh(legGeo, jeansMat);
  leftLeg.position.set(-0.14, 0.75, 0);
  leftLeg.castShadow = true;

  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.28), shoeMat);
  leftShoe.position.set(0, -0.68, 0.05);
  leftLeg.add(leftShoe);

  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, jeansMat);
  rightLeg.position.set(0.14, 0.75, 0);
  rightLeg.castShadow = true;

  const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.28), shoeMat);
  rightShoe.position.set(0, -0.68, 0.05);
  rightLeg.add(rightShoe);

  group.add(rightLeg);

  return { group, leftLeg, rightLeg, leftArm, rightArm };
}

// Procedural Nigerian Home Compound (Bedroom, Gate, Gen House, Water Tank)
export function createHomeCompoundMesh(): {
  group: THREE.Group;
  door: THREE.Mesh;
  compoundGate: THREE.Mesh;
  alarmClock: THREE.Mesh;
  generator: THREE.Mesh;
} {
  const group = new THREE.Group();

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9, // Cream/white painted plaster
    roughness: 0.8,
  });

  const compoundWallMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // Concrete compound perimeter
    roughness: 0.9,
  });

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x78350f, // Dark mahogany wood
    roughness: 0.5,
  });

  const sheetMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8, // Sky blue duvet
    roughness: 0.8,
  });

  const gateMat = new THREE.MeshStandardMaterial({
    color: 0x14532d, // Dark green Nigerian iron security gate
    metalness: 0.6,
    roughness: 0.4,
  });

  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b, // Red corrugated roof sheet
    roughness: 0.6,
  });

  const tankMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a, // Black GeePee water tank
    roughness: 0.4,
  });

  // Main House Building (Interior reachable)
  const houseWalls = new THREE.Group();

  // Floor
  const floorGeo = new THREE.BoxGeometry(10, 0.2, 10);
  const floor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 }));
  floor.position.set(0, 0.1, 0);
  floor.receiveShadow = true;
  houseWalls.add(floor);

  // Exterior Bedroom Walls (leaving door opening)
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(10, 3.2, 0.3), wallMat);
  backWall.position.set(0, 1.7, -5);
  houseWalls.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 10), wallMat);
  leftWall.position.set(-5, 1.7, 0);
  houseWalls.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 10), wallMat);
  rightWall.position.set(5, 1.7, 0);
  houseWalls.add(rightWall);

  // Front Wall with Doorway
  const frontWallL = new THREE.Mesh(new THREE.BoxGeometry(3.8, 3.2, 0.3), wallMat);
  frontWallL.position.set(-3.1, 1.7, 5);
  houseWalls.add(frontWallL);

  const frontWallR = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.2, 0.3), wallMat);
  frontWallR.position.set(2.9, 1.7, 5);
  houseWalls.add(frontWallR);

  // Roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(8, 2.5, 4), roofMat);
  roof.position.set(0, 4.4, 0);
  roof.rotation.y = Math.PI / 4;
  houseWalls.add(roof);

  group.add(houseWalls);

  // Door
  const doorGeo = new THREE.BoxGeometry(1.6, 2.5, 0.1);
  const door = new THREE.Mesh(doorGeo, woodMat);
  door.position.set(-0.3, 1.35, 5);
  group.add(door);

  // Bed inside Bedroom
  const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 2.8), woodMat);
  bedFrame.position.set(-3.2, 0.3, -3.2);
  bedFrame.castShadow = true;
  group.add(bedFrame);

  const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.25, 2.6), sheetMat);
  mattress.position.set(-3.2, 0.6, -3.2);
  group.add(mattress);

  const pillow = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.6), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  pillow.position.set(-3.2, 0.8, -4.1);
  group.add(pillow);

  // Bedside Table & Alarm Clock
  const table = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), woodMat);
  table.position.set(-1.6, 0.45, -4.3);
  table.castShadow = true;
  group.add(table);

  const alarmClock = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.2, 0.15),
    new THREE.MeshStandardMaterial({ color: 0xd97706, emissive: 0xd97706, emissiveIntensity: 0.6 })
  );
  alarmClock.position.set(-1.6, 0.9, -4.3);
  group.add(alarmClock);

  // Wardrobe
  const wardrobe = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.6, 0.9), woodMat);
  wardrobe.position.set(3.4, 1.4, -3.8);
  wardrobe.castShadow = true;
  group.add(wardrobe);

  // Standing Fan
  const fanPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4), new THREE.MeshStandardMaterial({ color: 0x334155 }));
  fanPole.position.set(3.4, 0.8, 2.0);
  const fanBlade = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.1), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
  fanBlade.position.set(3.4, 1.5, 2.0);
  fanBlade.rotateX(Math.PI / 2);
  group.add(fanPole);
  group.add(fanBlade);

  // Outside Compound Wall (Surrounding the yard)
  const compoundLength = 24;
  const compoundWidth = 20;

  // Rear compound wall
  const compRear = new THREE.Mesh(new THREE.BoxGeometry(compoundWidth, 2.4, 0.4), compoundWallMat);
  compRear.position.set(0, 1.2, -9);
  group.add(compRear);

  // Left compound wall
  const compLeft = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.4, compoundLength), compoundWallMat);
  compLeft.position.set(-compoundWidth / 2, 1.2, 3);
  group.add(compLeft);

  // Right compound wall
  const compRight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.4, compoundLength), compoundWallMat);
  compRight.position.set(compoundWidth / 2, 1.2, 3);
  group.add(compRight);

  // Front compound wall with Gate opening
  const compFrontL = new THREE.Mesh(new THREE.BoxGeometry(7, 2.4, 0.4), compoundWallMat);
  compFrontL.position.set(-6.5, 1.2, 15);
  group.add(compFrontL);

  const compFrontR = new THREE.Mesh(new THREE.BoxGeometry(7, 2.4, 0.4), compoundWallMat);
  compFrontR.position.set(6.5, 1.2, 15);
  group.add(compFrontR);

  // Green Security Gate
  const compoundGate = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.4, 0.15), gateMat);
  compoundGate.position.set(0, 1.2, 15);
  compoundGate.castShadow = true;
  group.add(compoundGate);

  // Black GeePee Water Tank on Scaffolding
  const scaffoldGeo = new THREE.CylinderGeometry(0.08, 0.08, 4.5);
  for (let i = 0; i < 4; i++) {
    const leg = new THREE.Mesh(scaffoldGeo, new THREE.MeshStandardMaterial({ color: 0x475569 }));
    const sx = 7 + (i % 2) * 1.6;
    const sz = 8 + Math.floor(i / 2) * 1.6;
    leg.position.set(sx, 2.25, sz);
    group.add(leg);
  }
  const tankGeo = new THREE.CylinderGeometry(1.0, 1.0, 1.8, 16);
  const tank = new THREE.Mesh(tankGeo, tankMat);
  tank.position.set(7.8, 5.2, 8.8);
  tank.castShadow = true;
  group.add(tank);

  // Small Generator Shed & Generator ("I better pass my neighbour")
  const genGeo = new THREE.BoxGeometry(1.0, 0.7, 0.8);
  const generator = new THREE.Mesh(genGeo, new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 }));
  generator.position.set(-7.5, 0.4, 8);
  generator.castShadow = true;
  group.add(generator);

  return { group, door, compoundGate, alarmClock, generator };
}

// Procedural Mama Put / Buka Stall (Parasol, Wooden Benches, Food Display)
export function createBukaStallMesh(name: string): THREE.Group {
  const group = new THREE.Group();

  const woodMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.7 });
  const umbrellaMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });

  // Wooden counter table
  const counter = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.0, 1.2), woodMat);
  counter.position.y = 0.5;
  counter.castShadow = true;
  group.add(counter);

  // Large round Parasol Umbrella
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2), metalMat);
  pole.position.set(0, 1.6, 0);
  group.add(pole);

  const canopy = new THREE.Mesh(new THREE.ConeGeometry(2.4, 0.8, 16), umbrellaMat);
  canopy.position.set(0, 3.0, 0);
  group.add(canopy);

  // 3 Food Warmers / Cooler basins on counter (Jollof, Stew, Soups)
  for (let i = 0; i < 3; i++) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.28, 0.25, 12), metalMat);
    pot.position.set(-1.0 + i * 1.0, 1.15, 0);
    group.add(pot);
  }

  // Wooden Benches for customers
  const benchGeo = new THREE.BoxGeometry(2.6, 0.45, 0.5);
  const bench = new THREE.Mesh(benchGeo, woodMat);
  bench.position.set(0, 0.25, 1.8);
  bench.castShadow = true;
  group.add(bench);

  // Signboard
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = '#991b1b';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(name.slice(0, 18), 128, 40);

  const signTex = new THREE.CanvasTexture(canvas);
  signTex.colorSpace = THREE.SRGBColorSpace;
  const signMesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 0.08), new THREE.MeshBasicMaterial({ map: signTex }));
  signMesh.position.set(0, 2.3, 0.6);
  group.add(signMesh);

  return group;
}

// Procedural Office Complex / Tech Hub (Multi-story, Glass curtain wall)
export function createOfficeBuildingMesh(floors: number = 5, color: number = 0x0284c7): THREE.Group {
  const group = new THREE.Group();

  const floorHeight = 3.6;
  const buildingHeight = floors * floorHeight;
  const width = 16;
  const depth = 16;

  // Concrete pillars / frames
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color,
    transmission: 0.7,
    roughness: 0.15,
    metalness: 0.4,
    transparent: true,
    opacity: 0.85,
  });

  const core = new THREE.Mesh(new THREE.BoxGeometry(width, buildingHeight, depth), glassMat);
  core.position.y = buildingHeight / 2;
  core.castShadow = true;
  group.add(core);

  // Floor dividers
  for (let f = 0; f <= floors; f++) {
    const divider = new THREE.Mesh(new THREE.BoxGeometry(width + 0.4, 0.35, depth + 0.4), concreteMat);
    divider.position.y = f * floorHeight;
    group.add(divider);
  }

  // Entrance Lobby Canopy
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 4), concreteMat);
  canopy.position.set(0, 3.4, depth / 2 + 2);
  canopy.castShadow = true;
  group.add(canopy);

  return group;
}

// Procedural Petrol Station (Oando / Total)
export function createPetrolStationMesh(): THREE.Group {
  const group = new THREE.Group();

  const canopyMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
  const pumpMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.3 }); // Green pump

  // Overhead high canopy
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(16, 0.8, 12), canopyMat);
  canopy.position.set(0, 5.2, 0);
  canopy.castShadow = true;
  group.add(canopy);

  // 4 Support Pillars
  const pillarGeo = new THREE.CylinderGeometry(0.35, 0.35, 5.0, 12);
  const pillarPos = [
    [-6, 2.5, -4],
    [6, 2.5, -4],
    [-6, 2.5, 4],
    [6, 2.5, 4],
  ];
  pillarPos.forEach(([px, py, pz]) => {
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(px, py, pz);
    pillar.castShadow = true;
    group.add(pillar);
  });

  // 2 Dual Petrol Pumps
  for (let i = -1; i <= 1; i += 2) {
    const pumpIsland = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 4.0), pillarMat);
    pumpIsland.position.set(i * 3.5, 0.12, 0);
    group.add(pumpIsland);

    const pump = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 1.4), pumpMat);
    pump.position.set(i * 3.5, 1.0, 0);
    pump.castShadow = true;
    group.add(pump);
  }

  return group;
}

// Procedural Lagos Electric Pole with Crossbars & Street Lamp
export function createElectricPoleMesh(): THREE.Group {
  const group = new THREE.Group();

  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 });
  const woodCrossMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.8 });
  const lampGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfef08a,
    emissiveIntensity: 0.8,
  });

  // Tall concrete pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 7.5, 8), concreteMat);
  pole.position.y = 3.75;
  pole.castShadow = true;
  group.add(pole);

  // Crossarms with insulators
  const crossarm = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.12), woodCrossMat);
  crossarm.position.y = 7.0;
  group.add(crossarm);

  // Streetlamp arm
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6), woodCrossMat);
  arm.position.set(0.6, 6.4, 0);
  arm.rotation.z = Math.PI / 4;
  group.add(arm);

  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.1, 0.2), lampGlowMat);
  lamp.position.set(1.2, 5.8, 0);
  group.add(lamp);

  return group;
}

// Procedural Lagos NPC Characters (Pedestrians, Colleagues, Guards, Attendants)
export function createNPCMesh(
  shirtColor: number = 0x2563eb,
  pantsColor: number = 0x1e293b,
  isSitting: boolean = false,
  roleLabel?: string
): THREE.Group {
  const group = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.6 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.5 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.7 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.62, 0.26), shirtMat);
  torso.position.y = isSitting ? 0.75 : 1.15;
  torso.castShadow = true;
  group.add(torso);

  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.26, 0.25), skinMat);
  head.position.y = isSitting ? 1.2 : 1.6;
  head.castShadow = true;
  group.add(head);

  // Hair
  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.08, 0.27), hairMat);
  hair.position.y = isSitting ? 1.34 : 1.74;
  group.add(hair);

  if (isSitting) {
    // Sitting thighs & shins
    const thighL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.42), pantsMat);
    thighL.position.set(-0.13, 0.45, 0.2);
    group.add(thighL);
    const thighR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.42), pantsMat);
    thighR.position.set(0.13, 0.45, 0.2);
    group.add(thighR);

    const shinL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.16), pantsMat);
    shinL.position.set(-0.13, 0.21, 0.41);
    group.add(shinL);
    const shinR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.16), pantsMat);
    shinR.position.set(0.13, 0.21, 0.41);
    group.add(shinR);

    // Arms on desk
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.4), shirtMat);
    armL.position.set(-0.3, 0.82, 0.2);
    group.add(armL);
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.4), shirtMat);
    armR.position.set(0.3, 0.82, 0.2);
    group.add(armR);
  } else {
    // Standing legs
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.68, 0.16), pantsMat);
    legL.position.set(-0.13, 0.42, 0);
    legL.castShadow = true;
    group.add(legL);
    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.68, 0.16), pantsMat);
    legR.position.set(0.13, 0.42, 0);
    legR.castShadow = true;
    group.add(legR);

    // Standing arms
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.52, 0.12), shirtMat);
    armL.position.set(-0.32, 1.1, 0);
    group.add(armL);
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.52, 0.12), shirtMat);
    armR.position.set(0.32, 1.1, 0);
    group.add(armR);
  }

  // Floating Role Tag Canvas
  if (roleLabel) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.roundRect(4, 4, 248, 56, 12);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(roleLabel, 128, 38);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.y = isSitting ? 1.7 : 2.1;
    sprite.scale.set(1.4, 0.35, 1);
    group.add(sprite);
  }

  return group;
}

// 100% Physically Enterable 3D PayLagos Tech Hub Office
export function createInteractiveOfficeMesh(): THREE.Group {
  const group = new THREE.Group();

  const floorMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 }); // Polished corporate tile
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 }); // Slate office walls
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transmission: 0.85,
    roughness: 0.1,
    transparent: true,
    opacity: 0.6,
  });
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 }); // Warm wood desks
  const chairMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.6 });
  const monitorMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    emissive: 0x0284c7,
    emissiveIntensity: 0.6,
  });
  const greenScreenMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 0.8,
  });

  // 1. Floor (18m x 16m)
  const floor = new THREE.Mesh(new THREE.BoxGeometry(18, 0.15, 16), floorMat);
  floor.position.set(0, 0.08, 0);
  floor.receiveShadow = true;
  group.add(floor);

  // Ceiling with recessed LED light panels
  const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(18, 0.2, 16),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
  );
  ceiling.position.set(0, 4.1, 0);
  group.add(ceiling);

  // Recessed warm LED panels
  for (let x = -5; x <= 5; x += 5) {
    for (let z = -4; z <= 4; z += 4) {
      const led = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.05, 1.2),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfef08a, emissiveIntensity: 0.9 })
      );
      led.position.set(x, 3.98, z);
      group.add(led);
    }
  }

  // 2. Perimeter Outer Walls (Leaving Front Doorway completely open)
  // Back Wall at Z = -8
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(18, 4.0, 0.3), wallMat);
  backWall.position.set(0, 2.0, -8);
  group.add(backWall);

  // Left Wall at X = -9
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.0, 16), wallMat);
  leftWall.position.set(-9, 2.0, 0);
  group.add(leftWall);

  // Right Wall at X = +9
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.0, 16), wallMat);
  rightWall.position.set(9, 2.0, 0);
  group.add(rightWall);

  // Front Wall Left Wing (X: -9 to -2.2)
  const frontWallL = new THREE.Mesh(new THREE.BoxGeometry(6.8, 4.0, 0.3), wallMat);
  frontWallL.position.set(-5.6, 2.0, 8);
  group.add(frontWallL);

  // Front Wall Right Wing (X: +2.2 to +9)
  const frontWallR = new THREE.Mesh(new THREE.BoxGeometry(6.8, 4.0, 0.3), wallMat);
  frontWallR.position.set(5.6, 2.0, 8);
  group.add(frontWallR);

  // Front Open Double Doorway Frame & Glass Panels (from X: -2.2 to +2.2 at Z: 8)
  const doorHeader = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.8, 0.4), wallMat);
  doorHeader.position.set(0, 3.6, 8);
  group.add(doorHeader);

  // Exterior Entrance Canopy & 3D Signboard
  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(6.5, 0.3, 3.0),
    new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.4 })
  );
  canopy.position.set(0, 3.8, 9.5);
  group.add(canopy);

  // Illuminated Signboard over entrance
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 512;
  signCanvas.height = 128;
  const sCtx = signCanvas.getContext('2d')!;
  sCtx.fillStyle = '#064e3b';
  sCtx.fillRect(0, 0, 512, 128);
  sCtx.fillStyle = '#34d399';
  sCtx.font = 'bold 36px sans-serif';
  sCtx.textAlign = 'center';
  sCtx.fillText('PAYLAGOS TECHNOLOGIES', 256, 52);
  sCtx.fillStyle = '#ffffff';
  sCtx.font = '22px sans-serif';
  sCtx.fillText('YABA TECH HUB & FINTECH LAB', 256, 92);

  const signTex = new THREE.CanvasTexture(signCanvas);
  signTex.colorSpace = THREE.SRGBColorSpace;
  const signMesh = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.2, 0.1), new THREE.MeshBasicMaterial({ map: signTex }));
  signMesh.position.set(0, 4.6, 8.2);
  group.add(signMesh);

  // 3. RECEPTION AREA (Front Lobby, Z = 5.5)
  // Curved Reception Counter
  const receptionDesk = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 1.1, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
  );
  receptionDesk.position.set(0, 0.55, 5.5);
  group.add(receptionDesk);

  // Reception laptop
  const recLaptop = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.35), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
  recLaptop.position.set(0, 1.12, 5.5);
  group.add(recLaptop);

  // Receptionist NPC (Amina)
  const aminaNPC = createNPCMesh(0x0284c7, 0x1e293b, true, 'Amina (Reception)');
  aminaNPC.position.set(0, 0, 4.8);
  aminaNPC.rotation.y = 0;
  group.add(aminaNPC);

  // Waiting Lounge Sofa & Glass Table
  const sofa = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 0.9), new THREE.MeshStandardMaterial({ color: 0x334155 }));
  sofa.position.set(5.5, 0.35, 5.5);
  group.add(sofa);

  const potGeo = new THREE.CylinderGeometry(0.3, 0.25, 0.7, 8);
  const pot = new THREE.Mesh(potGeo, new THREE.MeshStandardMaterial({ color: 0x78350f }));
  pot.position.set(7.5, 0.35, 7.0);
  group.add(pot);
  const palm = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.8, 6), new THREE.MeshStandardMaterial({ color: 0x15803d }));
  palm.position.set(7.5, 1.5, 7.0);
  group.add(palm);

  // 4. CENTRAL ENGINEERING FLOOR (Z = -2 to +2)
  // Workstation 1: Tayo (Frontend Dev) at X = -4, Z = 0
  const desk1 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.8, 1.2), deskMat);
  desk1.position.set(-4.0, 0.4, 0);
  group.add(desk1);

  const mon1a = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.05), monitorMat);
  mon1a.position.set(-4.3, 1.05, 0.1);
  const mon1b = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.05), monitorMat);
  mon1b.position.set(-3.6, 1.05, 0.1);
  mon1b.rotation.y = -0.15;
  group.add(mon1a, mon1b);

  const tayoNPC = createNPCMesh(0xf59e0b, 0x1e293b, true, 'Tayo (Frontend Dev)');
  tayoNPC.position.set(-4.0, 0, -0.6);
  tayoNPC.rotation.y = 0;
  group.add(tayoNPC);

  // Workstation 2: Chidinma (QA Engineer) at X = -4, Z = -3
  const desk2 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.8, 1.2), deskMat);
  desk2.position.set(-4.0, 0.4, -3.0);
  group.add(desk2);

  const mon2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.05), monitorMat);
  mon2.position.set(-4.0, 1.05, -2.9);
  group.add(mon2);

  const chidinmaNPC = createNPCMesh(0x8b5cf6, 0x1e293b, true, 'Chidinma (QA Lead)');
  chidinmaNPC.position.set(-4.0, 0, -3.6);
  group.add(chidinmaNPC);

  // Workstation 3: *** YOUR ASSIGNED WORKSTATION (Player's Desk) *** at X = 4.0, Z = 0
  const playerDesk = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.8, 1.4), deskMat);
  playerDesk.position.set(4.0, 0.4, 0);
  group.add(playerDesk);

  // Dual Curved Glowing Screens
  const pMon1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.05), greenScreenMat);
  pMon1.position.set(3.6, 1.1, 0.15);
  pMon1.rotation.y = 0.15;
  const pMon2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.05), greenScreenMat);
  pMon2.position.set(4.4, 1.1, 0.15);
  pMon2.rotation.y = -0.15;
  group.add(pMon1, pMon2);

  // Mechanical Keyboard & Coffee Mug
  const pKb = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.22), chairMat);
  pKb.position.set(4.0, 0.82, -0.2);
  const pMug = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.14, 8), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
  pMug.position.set(4.8, 0.88, -0.1);
  group.add(pKb, pMug);

  // Office Chair for Player
  const pChair = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.6), chairMat);
  pChair.position.set(4.0, 0.45, -0.7);
  group.add(pChair);

  // Floating Desk Nameplate
  const deskCanvas = document.createElement('canvas');
  deskCanvas.width = 256;
  deskCanvas.height = 64;
  const dCtx = deskCanvas.getContext('2d')!;
  dCtx.fillStyle = 'rgba(6, 78, 59, 0.9)';
  dCtx.roundRect(4, 4, 248, 56, 12);
  dCtx.fill();
  dCtx.fillStyle = '#34d399';
  dCtx.font = 'bold 22px sans-serif';
  dCtx.textAlign = 'center';
  dCtx.fillText('YOUR WORKSTATION', 128, 38);

  const deskTex = new THREE.CanvasTexture(deskCanvas);
  deskTex.colorSpace = THREE.SRGBColorSpace;
  const deskSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: deskTex }));
  deskSprite.position.set(4.0, 1.75, 0);
  deskSprite.scale.set(1.6, 0.4, 1);
  group.add(deskSprite);

  // 5. MANAGER'S GLASS OFFICE (Oga Femi) at X: -6.5, Z: -5.5
  // Glass partition walls with doorway
  const mgGlassWallBack = new THREE.Mesh(new THREE.BoxGeometry(5.0, 3.8, 0.1), glassMat);
  mgGlassWallBack.position.set(-6.5, 1.9, -4.0);
  group.add(mgGlassWallBack);

  const mgGlassWallSide = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.8, 3.8), glassMat);
  mgGlassWallSide.position.set(-4.0, 1.9, -5.9);
  group.add(mgGlassWallSide);

  // Executive Mahogany Desk
  const execDesk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.85, 1.2), new THREE.MeshStandardMaterial({ color: 0x451a03 }));
  execDesk.position.set(-6.5, 0.42, -5.8);
  group.add(execDesk);

  const execLaptop = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.4), new THREE.MeshStandardMaterial({ color: 0xd4d4d8 }));
  execLaptop.position.set(-6.5, 0.88, -5.8);
  group.add(execLaptop);

  // Oga Femi NPC
  const ogaFemiNPC = createNPCMesh(0x047857, 0x0f172a, true, 'Oga Femi (Engineering Lead)');
  ogaFemiNPC.position.set(-6.5, 0, -6.6);
  ogaFemiNPC.rotation.y = 0;
  group.add(ogaFemiNPC);

  // 6. BREAK ROOM & PANTRY at X: +6.5, Z: -5.5
  // Kitchen Counter
  const kitchenCounter = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.9, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
  );
  kitchenCounter.position.set(6.5, 0.45, -7.0);
  group.add(kitchenCounter);

  // Classic Nigerian Office Blue Water Dispenser (with 20L bottle!)
  const dispenserBase = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.0, 0.4), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
  dispenserBase.position.set(4.8, 0.5, -6.8);
  const waterBottle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.6, 12),
    new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.8, transparent: true, opacity: 0.8 })
  );
  waterBottle.position.set(4.8, 1.3, -6.8);
  group.add(dispenserBase, waterBottle);

  // Espresso Machine & Snack tray
  const espresso = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.35), new THREE.MeshStandardMaterial({ color: 0x09090b }));
  espresso.position.set(5.8, 1.15, -7.0);
  const snackPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.05, 12), new THREE.MeshStandardMaterial({ color: 0xfef08a }));
  snackPlate.position.set(6.8, 0.93, -7.0);
  group.add(espresso, snackPlate);

  // 8. 4-STORY GLASS & STEEL ELEVATOR SHAFT (X = 6.8, Z = 1.0)
  const elevatorShaftGeo = new THREE.BoxGeometry(2.6, 14.2, 2.6);
  const shaftMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transmission: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.45,
  });
  const shaftMesh = new THREE.Mesh(elevatorShaftGeo, shaftMat);
  shaftMesh.position.set(6.8, 7.1, 1.0);
  group.add(shaftMesh);

  // Steel Corner Columns for Elevator Shaft
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.2 });
  const colGeo = new THREE.BoxGeometry(0.18, 14.2, 0.18);
  [
    [-1.25, -1.25],
    [1.25, -1.25],
    [-1.25, 1.25],
    [1.25, 1.25],
  ].forEach(([cx, cz]) => {
    const col = new THREE.Mesh(colGeo, steelMat);
    col.position.set(6.8 + cx, 7.1, 1.0 + cz);
    group.add(col);
  });

  // Elevator Door frames and Floor Indicator Displays on each level (0, 4.2, 8.4, 12.6)
  const floorLevels = [
    { y: 0, label: 'LIFT: G - LOBBY & DEV DESKS' },
    { y: 4.2, label: 'LIFT: 1 - FINTECH DATACENTER' },
    { y: 8.4, label: 'LIFT: 2 - C-SUITE & COMPLIANCE' },
    { y: 12.6, label: 'LIFT: 3 - ROOFTOP SKY LAB' },
  ];

  floorLevels.forEach((fl) => {
    // Sliding Brushed Steel Doors
    const doorL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.4, 0.9), steelMat);
    doorL.position.set(5.55, fl.y + 1.2, 0.55);
    const doorR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.4, 0.9), steelMat);
    doorR.position.set(5.55, fl.y + 1.2, 1.45);
    group.add(doorL, doorR);

    // Glowing Elevator Call Button & Floor Indicator
    const callButton = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.25, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.9 })
    );
    callButton.position.set(5.5, fl.y + 1.3, 2.1);
    group.add(callButton);

    // Digital Floor Display Canvas
    const dCanvas = document.createElement('canvas');
    dCanvas.width = 256;
    dCanvas.height = 64;
    const dCtx = dCanvas.getContext('2d')!;
    dCtx.fillStyle = '#0f172a';
    dCtx.fillRect(0, 0, 256, 64);
    dCtx.fillStyle = '#38bdf8';
    dCtx.font = 'bold 20px sans-serif';
    dCtx.textAlign = 'center';
    dCtx.fillText(fl.label, 128, 40);

    const dTex = new THREE.CanvasTexture(dCanvas);
    dTex.colorSpace = THREE.SRGBColorSpace;
    const dSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: dTex }));
    dSprite.position.set(5.5, fl.y + 2.65, 1.0);
    dSprite.scale.set(1.4, 0.35, 1);
    group.add(dSprite);
  });

  // =========================================================================
  // 9. FIRST FLOOR: FINTECH DATACENTER & PRODUCT DESIGN (Y = 4.2)
  // =========================================================================
  const f1Floor = new THREE.Mesh(new THREE.BoxGeometry(18, 0.2, 16), floorMat);
  f1Floor.position.set(0, 4.2, 0);
  group.add(f1Floor);

  // F1 Perimeter Glass Railing & Outer Walls
  const f1WallL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.0, 16), wallMat);
  f1WallL.position.set(-9, 6.2, 0);
  const f1WallR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.0, 16), wallMat);
  f1WallR.position.set(9, 6.2, 0);
  const f1WallBack = new THREE.Mesh(new THREE.BoxGeometry(18, 4.0, 0.3), wallMat);
  f1WallBack.position.set(0, 6.2, -8);
  const f1WallFront = new THREE.Mesh(new THREE.BoxGeometry(18, 4.0, 0.3), glassMat);
  f1WallFront.position.set(0, 6.2, 8);
  group.add(f1WallL, f1WallR, f1WallBack, f1WallFront);

  // Server Room Datacenter Enclosure (F1 Left Side)
  for (let i = 0; i < 4; i++) {
    const rack = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 2.8, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.6 })
    );
    rack.position.set(-6.5, 5.6, -5.5 + i * 1.5);
    group.add(rack);

    // Glowing blinking LEDs on server rack
    for (let l = 0; l < 5; l++) {
      const ledMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.04, 0.05),
        new THREE.MeshStandardMaterial({
          color: l % 2 === 0 ? 0x22c55e : 0x0284c7,
          emissive: l % 2 === 0 ? 0x22c55e : 0x0284c7,
          emissiveIntensity: 1.0,
        })
      );
      ledMesh.position.set(-5.78, 4.6 + l * 0.45, -5.5 + i * 1.5);
      group.add(ledMesh);
    }
  }

  // Segun (DevOps Engineer) NPC monitoring the servers
  const segunNPC = createNPCMesh(0x0284c7, 0x0f172a, false, 'Segun (DevOps / Infrastructure)');
  segunNPC.position.set(-4.5, 4.2, -2.5);
  group.add(segunNPC);

  // Boardroom Conference Suite on F1 (Right/Center)
  const confTable = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 0.85, 2.2),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 })
  );
  confTable.position.set(0, 4.65, 1.0);
  group.add(confTable);

  // 85-inch Wall Dashboard Presentation Screen
  const f1ScreenCanvas = document.createElement('canvas');
  f1ScreenCanvas.width = 512;
  f1ScreenCanvas.height = 256;
  const fsCtx = f1ScreenCanvas.getContext('2d')!;
  fsCtx.fillStyle = '#022c22';
  fsCtx.fillRect(0, 0, 512, 256);
  fsCtx.fillStyle = '#34d399';
  fsCtx.font = 'bold 28px sans-serif';
  fsCtx.fillText('PAYLAGOS REALTIME ENGINE', 20, 45);
  fsCtx.fillStyle = '#ffffff';
  fsCtx.font = '20px sans-serif';
  fsCtx.fillText('Daily Processed: ₦4,280,000,000', 20, 95);
  fsCtx.fillText('NIBSS Instant Payment Latency: 120ms', 20, 135);
  fsCtx.fillText('Active Microservices: 48 / 48 Online', 20, 175);
  fsCtx.fillStyle = '#38bdf8';
  fsCtx.fillText('System Status: 100% HEALTHY', 20, 220);

  const fsTex = new THREE.CanvasTexture(f1ScreenCanvas);
  fsTex.colorSpace = THREE.SRGBColorSpace;
  const f1ScreenMesh = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 2.2, 0.1),
    new THREE.MeshBasicMaterial({ map: fsTex })
  );
  f1ScreenMesh.position.set(0, 6.2, 7.85);
  group.add(f1ScreenMesh);

  // Funmi (Product Designer) at Workstation on F1
  const funmiDesk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 1.2), deskMat);
  funmiDesk.position.set(3.5, 4.6, -4.5);
  group.add(funmiDesk);
  const funmiMon = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.05), monitorMat);
  funmiMon.position.set(3.5, 5.3, -4.4);
  group.add(funmiMon);
  const funmiNPC = createNPCMesh(0xec4899, 0x1e293b, true, 'Funmi (Product Designer)');
  funmiNPC.position.set(3.5, 4.2, -5.2);
  group.add(funmiNPC);

  // =========================================================================
  // 10. SECOND FLOOR: C-SUITE EXECUTIVE SUITES & CBN COMPLIANCE (Y = 8.4)
  // =========================================================================
  const f2Floor = new THREE.Mesh(new THREE.BoxGeometry(18, 0.2, 16), floorMat);
  f2Floor.position.set(0, 8.4, 0);
  group.add(f2Floor);

  // F2 Perimeter Glass & Wood Walls
  const f2WallL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.0, 16), wallMat);
  f2WallL.position.set(-9, 10.4, 0);
  const f2WallR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.0, 16), wallMat);
  f2WallR.position.set(9, 10.4, 0);
  const f2WallBack = new THREE.Mesh(new THREE.BoxGeometry(18, 4.0, 0.3), wallMat);
  f2WallBack.position.set(0, 10.4, -8);
  const f2WallFront = new THREE.Mesh(new THREE.BoxGeometry(18, 4.0, 0.3), glassMat);
  f2WallFront.position.set(0, 10.4, 8);
  group.add(f2WallL, f2WallR, f2WallBack, f2WallFront);

  // Dr. Mrs. Adeleke (Chief Financial Officer) Executive Suite
  const cfoDesk = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.9, 1.4), new THREE.MeshStandardMaterial({ color: 0x451a03 }));
  cfoDesk.position.set(-4.5, 8.85, -4.0);
  group.add(cfoDesk);
  const cfoNPC = createNPCMesh(0x7c3aed, 0x0f172a, true, 'Dr. Mrs. Adeleke (CFO)');
  cfoNPC.position.set(-4.5, 8.4, -4.8);
  group.add(cfoNPC);

  // Kayode (Compliance Lead) Desk
  const compDesk = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.85, 1.2), deskMat);
  compDesk.position.set(3.5, 8.85, -4.0);
  group.add(compDesk);
  const kayodeNPC = createNPCMesh(0x059669, 0x1e293b, true, 'Kayode (CBN Compliance)');
  kayodeNPC.position.set(3.5, 8.4, -4.8);
  group.add(kayodeNPC);

  // Executive VIP Lounge Sofa
  const vipSofa = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.8, 1.2), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
  vipSofa.position.set(0, 8.8, 4.5);
  group.add(vipSofa);

  // =========================================================================
  // 11. THIRD FLOOR: ROOFTOP INNOVATION LAB & SKY LOUNGE (Y = 12.6)
  // =========================================================================
  const roofDeck = new THREE.Mesh(
    new THREE.BoxGeometry(18, 0.25, 16),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 }) // Teak outdoor deck
  );
  roofDeck.position.set(0, 12.6, 0);
  group.add(roofDeck);

  // Perimeter Tempered Glass Safety Railing (1.2m high)
  const railMat = new THREE.MeshPhysicalMaterial({ color: 0xe0f2fe, transmission: 0.9, transparent: true, opacity: 0.5 });
  const railFront = new THREE.Mesh(new THREE.BoxGeometry(18, 1.2, 0.1), railMat);
  railFront.position.set(0, 13.3, 8);
  const railBack = new THREE.Mesh(new THREE.BoxGeometry(18, 1.2, 0.1), railMat);
  railBack.position.set(0, 13.3, -8);
  const railLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 16), railMat);
  railLeft.position.set(-9, 13.3, 0);
  const railRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 16), railMat);
  railRight.position.set(9, 13.3, 0);
  group.add(railFront, railBack, railLeft, railRight);

  // Photovoltaic Solar Panel Array (Left Side of Rooftop)
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1 });
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 1.2), solarMat);
      panel.position.set(-6.5 + c * 2.2, 13.2, -5.0 + r * 1.8);
      panel.rotation.x = -0.3; // Tilted towards sunlight
      group.add(panel);
    }
  }

  // 5G Telecom Dish & Antenna Mast
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.15, 6.0, 8),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
  );
  mast.position.set(-7.5, 15.6, 6.0);
  group.add(mast);
  const dish = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 0.2, 0.3, 16),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
  );
  dish.position.set(-7.5, 17.5, 6.0);
  dish.rotation.x = Math.PI / 3;
  group.add(dish);

  // Rooftop Barbecue Suya Grill
  const grill = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.9, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8 })
  );
  grill.position.set(4.5, 13.15, -5.5);
  group.add(grill);

  // Chillout Lounge Beanbags on Rooftop
  const bagColors = [0xef4444, 0xf59e0b, 0x10b981, 0x06b6d4];
  bagColors.forEach((col, idx) => {
    const bag = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 12, 12),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.7 })
    );
    bag.position.set(1.5 + (idx % 2) * 1.8, 12.95, 3.5 + Math.floor(idx / 2) * 1.8);
    bag.scale.set(1.1, 0.6, 1.1);
    group.add(bag);
  });

  return group;
}

// Procedural 40-Foot Articulated Broken Container Truck (Causes Real Lagos Traffic Go-Slow)
export function createBrokenContainerTruckMesh(): THREE.Group {
  const group = new THREE.Group();

  const cabMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 }); // Red Mack truck cab
  const containerMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.6 }); // Ocean shipping container
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.8 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 });
  const hazardMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.0,
  });

  // 1. Truck Cab
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.8, 3.2), cabMat);
  cab.position.set(0, 1.9, 5.0);
  cab.castShadow = true;
  group.add(cab);

  // Windshield
  const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 1.1, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1 })
  );
  windshield.position.set(0, 2.4, 6.61);
  group.add(windshield);

  // Chrome Exhaust Stacks
  const exhaustL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.2, 8), chromeMat);
  exhaustL.position.set(-1.25, 3.2, 3.6);
  const exhaustR = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.2, 8), chromeMat);
  exhaustR.position.set(1.25, 3.2, 3.6);
  group.add(exhaustL, exhaustR);

  // 2. 40-Foot Cargo Shipping Container (Length 9.5m, Height 2.8m)
  const container = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.7, 9.5), containerMat);
  container.position.set(0, 2.05, -1.8);
  container.castShadow = true;
  group.add(container);

  // Ribbed container corrugation stripes
  for (let z = -5.8; z <= 2.2; z += 0.8) {
    const rib = new THREE.Mesh(
      new THREE.BoxGeometry(2.56, 2.6, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x075985 })
    );
    rib.position.set(0, 2.05, z);
    group.add(rib);
  }

  // 3. Wheels (10 heavy duty wheels)
  const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.45, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelZPositions = [5.5, 3.8, -4.2, -5.4, -6.6];
  wheelZPositions.forEach((wz) => {
    const wL = new THREE.Mesh(wheelGeo, blackMat);
    wL.position.set(-1.3, 0.5, wz);
    const wR = new THREE.Mesh(wheelGeo, blackMat);
    wR.position.set(1.3, 0.5, wz);
    group.add(wL, wR);
  });

  // 4. Blinking Amber Hazard Lights
  const h1 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), hazardMat);
  h1.position.set(-1.2, 3.4, 5.0);
  const h2 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), hazardMat);
  h2.position.set(1.2, 3.4, 5.0);
  const h3 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), hazardMat);
  h3.position.set(-1.2, 3.3, -6.55);
  const h4 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), hazardMat);
  h4.position.set(1.2, 3.3, -6.55);
  group.add(h1, h2, h3, h4);

  // 5. Fluorescent Orange Traffic Cones Placed in Front & Behind Truck
  const coneGeo = new THREE.ConeGeometry(0.3, 0.8, 12);
  const coneMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });
  [-8.5, -10.5, -12.5, 8.0, 10.0].forEach((cz) => {
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(Math.sin(cz) * 0.8, 0.4, cz);
    group.add(cone);
  });

  return group;
}

// Procedural Official LASTMA Road Inspection Checkpoint
export function createLASTMACheckpointMesh(): THREE.Group {
  const group = new THREE.Group();

  const barrierMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 }); // Caution yellow
  const lastmaUniformMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.5 }); // LASTMA ochre yellow shirt
  const trousersMat = new THREE.MeshStandardMaterial({ color: 0x881337, roughness: 0.6 }); // LASTMA maroon trousers

  // 1. Reflective Traffic Barrier Barricade
  const barGeo = new THREE.BoxGeometry(4.2, 0.9, 0.25);
  const barrier = new THREE.Mesh(barGeo, barrierMat);
  barrier.position.set(0, 0.65, 0);
  barrier.castShadow = true;
  group.add(barrier);

  // Chevron Stripes on barrier
  for (let i = -1.6; i <= 1.6; i += 0.8) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.85, 0.27),
      new THREE.MeshStandardMaterial({ color: 0x0f172a })
    );
    stripe.position.set(i, 0.65, 0);
    group.add(stripe);
  }

  // Barricade Legs
  const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2), barrierMat);
  leg1.position.set(-1.8, 0.6, 0);
  const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2), barrierMat);
  leg2.position.set(1.8, 0.6, 0);
  group.add(leg1, leg2);

  // 2. LASTMA Official Inspection Signboard
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 256;
  signCanvas.height = 128;
  const sCtx = signCanvas.getContext('2d')!;
  sCtx.fillStyle = '#881337';
  sCtx.fillRect(0, 0, 256, 128);
  sCtx.fillStyle = '#fde047';
  sCtx.font = 'bold 24px sans-serif';
  sCtx.textAlign = 'center';
  sCtx.fillText('LASTMA CHECKPOINT', 128, 48);
  sCtx.fillStyle = '#ffffff';
  sCtx.font = '18px sans-serif';
  sCtx.fillText('SLOW DOWN - INSPECTION', 128, 88);

  const signTex = new THREE.CanvasTexture(signCanvas);
  signTex.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 0.08), new THREE.MeshBasicMaterial({ map: signTex }));
  sign.position.set(0, 1.8, 0);
  group.add(sign);

  // 3. Official Uniformed LASTMA Officer NPC Standing at Checkpoint
  const officerNPC = createNPCMesh(0xca8a04, 0x881337, false, 'Officer Kehinde (LASTMA)');
  officerNPC.position.set(2.8, 0, 0.8);
  officerNPC.rotation.y = -Math.PI / 4;
  group.add(officerNPC);

  // Traffic Cones leading into checkpoint
  const coneGeo = new THREE.ConeGeometry(0.28, 0.75, 12);
  const coneMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });
  [-5, -3, 3, 5].forEach((offset) => {
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(offset * 0.9, 0.38, offset * 1.2);
    group.add(cone);
  });

  return group;
}
