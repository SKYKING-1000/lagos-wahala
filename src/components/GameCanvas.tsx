import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildLagosCity, BuiltWorld } from '../city/cityBuilder';
import { createPlayerMesh } from '../city/proceduralModels';
import { physicsSystem } from '../game/physics';
import { trafficSystem } from '../game/trafficSystem';
import { soundEngine } from '../audio/soundEngine';
import { gameState } from '../game/gameState';
import { LAGOS_LANDMARKS, LAGOS_ZONES } from '../city/lagosGeography';
import { calculateGPSRoute, RouteResult } from '../game/routing';
import { VehicleState } from '../types/game';

interface GameCanvasProps {
  onInteractionPromptChange: (prompt: string | null) => void;
  onActiveRouteChange: (route: RouteResult | null) => void;
  onCurrentZoneChange: (zoneName: string) => void;
  onVehicleStateChange: (vehicle: VehicleState | null) => void;
  onOpenBuka: (vendorName?: string) => void;
  onOpenOffice: () => void;
  onOpenFuel?: (stationName?: string) => void;
  onOpenTransfer?: (contactId?: string) => void;
  onOpenElevator?: (currentFloor: number) => void;
  officeFloor?: number;
  activeWahalaId?: string | null;
  onTriggerWahala: () => void;
  activeDestinationId: string | null;
  onRegisterInteractAction: (fn: () => void) => void;
  onPlayerTransformChange?: (pos: { x: number; z: number }, heading: number) => void;
  mobileMove: { x: number; y: number };
  mobileJump?: boolean;
  mobileSprint?: boolean;
  mobileGas?: number;
  mobileBrake?: number;
  mobileHandbrake?: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  onInteractionPromptChange,
  onActiveRouteChange,
  onCurrentZoneChange,
  onVehicleStateChange,
  onOpenBuka,
  onOpenOffice,
  onOpenFuel,
  onOpenTransfer,
  onOpenElevator,
  officeFloor = 0,
  activeWahalaId = null,
  onTriggerWahala,
  activeDestinationId,
  onRegisterInteractAction,
  onPlayerTransformChange,
  mobileMove,
  mobileJump = false,
  mobileSprint = false,
  mobileGas = 0,
  mobileBrake = 0,
  mobileHandbrake = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Mutable refs to prevent re-instantiating scene across React renders
  const stateRef = useRef({
    playerPos: { x: 42, y: 0, z: -478 }, // Inside bedroom initially
    playerRotY: 0,
    jumpVelocity: 0,
    isDriving: false,
    officeFloor: 0,
    drivingCamYaw: 0,
    cameraMode: 0, // 0: Normal, 1: Close, 2: Far
    keys: {
      w: false,
      a: false,
      s: false,
      d: false,
      shift: false,
      space: false,
    },
    cameraAngle: { yaw: 0, pitch: 0.25, distance: 4.5 },
    isMouseDown: false,
    prevMouseX: 0,
    prevMouseY: 0,
    walkCycle: 0,
    nearObject: null as string | null,
    wahalaCooldown: 45, // Seconds between possible random events
  });

  const activeWahalaRef = useRef(activeWahalaId);
  activeWahalaRef.current = activeWahalaId;

  // React to elevator floor changes
  useEffect(() => {
    if (officeFloor !== undefined && officeFloor !== stateRef.current.officeFloor) {
      stateRef.current.officeFloor = officeFloor;
      stateRef.current.playerPos.y = officeFloor * 4.2;
      stateRef.current.playerPos.x = 49.5;
      stateRef.current.playerPos.z = 26.0;
    }
  }, [officeFloor]);

  const activeDestRef = useRef(activeDestinationId);
  activeDestRef.current = activeDestinationId;

  const mobileMoveRef = useRef(mobileMove);
  mobileMoveRef.current = mobileMove;

  const mobileJumpRef = useRef(mobileJump);
  mobileJumpRef.current = mobileJump;

  const mobileSprintRef = useRef(mobileSprint);
  mobileSprintRef.current = mobileSprint;

  const mobileGasRef = useRef(mobileGas);
  mobileGasRef.current = mobileGas;

  const mobileBrakeRef = useRef(mobileBrake);
  mobileBrakeRef.current = mobileBrake;

  const mobileHandbrakeRef = useRef(mobileHandbrake);
  mobileHandbrakeRef.current = mobileHandbrake;

  const cameraShakeRef = useRef(0);

  useEffect(() => {
    if (!mountRef.current) return;

    physicsSystem.onVehicleCrash = (intensity) => {
      cameraShakeRef.current = Math.min(0.6, intensity * 0.05);
      onInteractionPromptChange('GBAM! Vehicle collision! Watch the road, Oga!');
      setTimeout(() => onInteractionPromptChange(null), 2500);
    };

    physicsSystem.onPlayerHit = (msg) => {
      onInteractionPromptChange(msg);
      setTimeout(() => onInteractionPromptChange(null), 2500);
    };

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x93c5fd); // Morning sky blue
    scene.fog = new THREE.FogExp2(0x93c5fd, 0.0018);

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );

    // 2. Renderer
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // 3. Mandatory Studio Environment Map (RoomEnvironment)
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 4. Lighting Rig (Warm sun + cool hemisphere fill)
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x475569, 0.6);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfef08a, 1.2);
    sunLight.position.set(100, 150, -100);
    sunLight.castShadow = !isHeadless;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 400;
    sunLight.shadow.camera.left = -80;
    sunLight.shadow.camera.right = 80;
    sunLight.shadow.camera.top = 80;
    sunLight.shadow.camera.bottom = -80;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // 5. Build 3D Lagos City & Player Car
    const world: BuiltWorld = buildLagosCity(scene);

    // 6. Build Character Mesh
    const playerParts = createPlayerMesh();
    scene.add(playerParts.group);
    playerParts.group.position.set(stateRef.current.playerPos.x, 0, stateRef.current.playerPos.z);

    // 7. Initialize AI Traffic System
    trafficSystem.init(scene);

    // Physics accident callbacks (triggers realistic vehicle accident state on high-speed crash)
    physicsSystem.onVehicleCrash = (intensity) => {
      cameraShakeRef.current = Math.min(0.8, intensity * 0.06);
    };
    physicsSystem.onTrafficHit = (vehicleId, impactVel) => {
      trafficSystem.triggerAccident(vehicleId, impactVel);
    };

    // Play morning alarm beep on first load
    setTimeout(() => {
      soundEngine.playAlarmBeep();
    }, 800);

    // 8. Input Event Listeners
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') stateRef.current.keys.w = true;
      if (k === 'a' || k === 'arrowleft') stateRef.current.keys.a = true;
      if (k === 's' || k === 'arrowdown') stateRef.current.keys.s = true;
      if (k === 'd' || k === 'arrowright') stateRef.current.keys.d = true;
      if (e.key === 'Shift') stateRef.current.keys.shift = true;

      // Space key to interact when near an object or person
      if (e.key === ' ' || e.code === 'Space') {
        if (stateRef.current.nearObject) {
          e.preventDefault();
          performInteract();
        } else {
          stateRef.current.keys.space = true;
        }
      }

      // Quick interact keys (E and F)
      if (k === 'e' || k === 'f') {
        performInteract();
      }
      // Camera cycle key [C]
      if (k === 'c') {
        stateRef.current.cameraMode = (stateRef.current.cameraMode + 1) % 3;
        if (stateRef.current.cameraMode === 0) {
          stateRef.current.cameraAngle.distance = 4.5;
          stateRef.current.cameraAngle.pitch = 0.25;
          onInteractionPromptChange('Camera: Standard View');
        } else if (stateRef.current.cameraMode === 1) {
          stateRef.current.cameraAngle.distance = 2.6;
          stateRef.current.cameraAngle.pitch = 0.15;
          onInteractionPromptChange('Camera: Close View');
        } else {
          stateRef.current.cameraAngle.distance = 8.5;
          stateRef.current.cameraAngle.pitch = 0.38;
          onInteractionPromptChange('Camera: Panoramic View');
        }
        setTimeout(() => onInteractionPromptChange(null), 1800);
      }
      // Vehicle horn [H]
      if (k === 'h' && stateRef.current.isDriving) {
        soundEngine.playCarHorn();
      }
      // Vehicle lights toggle [L]
      if (k === 'l' && stateRef.current.isDriving) {
        world.playerCarState.headlightsOn = !world.playerCarState.headlightsOn;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') stateRef.current.keys.w = false;
      if (k === 'a' || k === 'arrowleft') stateRef.current.keys.a = false;
      if (k === 's' || k === 'arrowdown') stateRef.current.keys.s = false;
      if (k === 'd' || k === 'arrowright') stateRef.current.keys.d = false;
      if (e.key === 'Shift') stateRef.current.keys.shift = false;
      if (e.key === ' ') stateRef.current.keys.space = false;
    };

    const onMouseDown = (e: MouseEvent) => {
      // Support both left-click and right-click drag for camera rotation
      if (e.button === 0 || e.button === 2) {
        stateRef.current.isMouseDown = true;
        stateRef.current.prevMouseX = e.clientX;
        stateRef.current.prevMouseY = e.clientY;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!stateRef.current.isMouseDown) return;
      const dx = e.clientX - stateRef.current.prevMouseX;
      const dy = e.clientY - stateRef.current.prevMouseY;
      stateRef.current.prevMouseX = e.clientX;
      stateRef.current.prevMouseY = e.clientY;

      stateRef.current.cameraAngle.yaw -= dx * 0.005;
      stateRef.current.cameraAngle.pitch = Math.max(
        0.05,
        Math.min(1.2, stateRef.current.cameraAngle.pitch + dy * 0.004)
      );
    };

    const onMouseUp = () => {
      stateRef.current.isMouseDown = false;
    };

    const onWheel = (e: WheelEvent) => {
      stateRef.current.cameraAngle.distance = Math.max(
        2.2,
        Math.min(12.0, stateRef.current.cameraAngle.distance + e.deltaY * 0.005)
      );
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Prevent default browser context menu to allow clean right-click drag
    };

    // Mobile / Touch Camera Orbit
    let touchLookId: number | null = null;
    let prevTouchX = 0;
    let prevTouchY = 0;

    const onTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        // If touch starts in upper half or right 65% of screen (outside joystick area)
        if (t.clientX > window.innerWidth * 0.32 || t.clientY < window.innerHeight * 0.5) {
          touchLookId = t.identifier;
          prevTouchX = t.clientX;
          prevTouchY = t.clientY;
          break;
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchLookId === null) return;
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        if (t.identifier === touchLookId) {
          const dx = t.clientX - prevTouchX;
          const dy = t.clientY - prevTouchY;
          prevTouchX = t.clientX;
          prevTouchY = t.clientY;

          stateRef.current.cameraAngle.yaw -= dx * 0.007;
          stateRef.current.cameraAngle.pitch = Math.max(
            0.05,
            Math.min(1.2, stateRef.current.cameraAngle.pitch + dy * 0.005)
          );
          break;
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchLookId === null) return;
      let exists = false;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === touchLookId) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        touchLookId = null;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    // Interaction execution
    const performInteract = () => {
      const near = stateRef.current.nearObject;
      if (!near) return;

      if (near === 'car') {
        // Toggle vehicle enter / exit
        stateRef.current.isDriving = !stateRef.current.isDriving;
        world.playerCarState.isPlayerInside = stateRef.current.isDriving;
        world.playerCarState.isEngineOn = stateRef.current.isDriving;

        soundEngine.playDoorSound();
        if (stateRef.current.isDriving) {
          playerParts.group.visible = false;
          onVehicleStateChange(world.playerCarState);
        } else {
          playerParts.group.visible = true;
          // Position player safely next to car driver door
          stateRef.current.playerPos.x = world.playerCarState.x - 2.0;
          stateRef.current.playerPos.z = world.playerCarState.z;
          onVehicleStateChange(null);
        }
      } else if (near === 'alarm') {
        soundEngine.playDoorSound();
        onInteractionPromptChange('Alarm dismissed! Time to prepare for Lagos day.');
      } else if (near === 'bed') {
        gameState.sleepAtHome();
        soundEngine.playDoorSound();
        onInteractionPromptChange('Rested peacefully. Day advanced to 6:00 AM!');
      } else if (near === 'workstation' || near === 'reception' || near === 'oga_femi' || near === 'tayo' || near === 'office') {
        onOpenOffice();
      } else if (near === 'coffee') {
        const ok = gameState.officeCoffeeBreak();
        if (ok) {
          soundEngine.playEatSound();
          onInteractionPromptChange('Drank rich hot coffee! Restored 20 Energy.');
        } else {
          onInteractionPromptChange('Already fully energized (95%+)!');
        }
      } else if (near === 'gen_switch') {
        const mode = gameState.toggleOfficeGenerator();
        soundEngine.playDoorSound();
        onInteractionPromptChange(`Office power switched to: ${mode.toUpperCase()}`);
      } else if (near.startsWith('fuel')) {
        if (onOpenFuel) {
          const station = near.includes('total') ? 'TotalEnergies Lekki Station' : 'Oando Filling Station (Ikeja)';
          onOpenFuel(station);
        }
      } else if (near === 'baba_segun') {
        if (onOpenTransfer) {
          onOpenTransfer('baba_segun');
        }
      } else if (near.includes('buka')) {
        const lm = LAGOS_LANDMARKS.find((l) => l.id === near);
        onOpenBuka(lm ? lm.name : "Mama Ngozi's Buka");
      }
    };

    onRegisterInteractAction(performInteract);

    // 9. Resize Handler
    const onResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // 10. Animation Game Loop
    const clock = new THREE.Clock();
    let animId: number;

    const tick = () => {
      animId = requestAnimationFrame(tick);
      const delta = Math.min(clock.getDelta(), 0.1);

      // Advance world time and stats
      gameState.updateTime(delta);
      const currentStats = gameState.getStats();

      // Update Lagos Day/Night Lighting
      const timeHours = currentStats.timeMinutes / 60;
      // Solar angle: 6 AM = 0, 12 PM = PI/2, 6 PM = PI, Night = > PI
      const sunAngle = ((timeHours - 6) / 12) * Math.PI;
      sunLight.position.x = Math.cos(sunAngle) * 180;
      sunLight.position.y = Math.max(10, Math.sin(sunAngle) * 160);

      if (timeHours >= 6 && timeHours <= 18) {
        // Daytime
        const daylightIntensity = Math.sin(sunAngle);
        sunLight.intensity = 0.5 + daylightIntensity * 0.9;
        scene.background = new THREE.Color(0x93c5fd);
      } else {
        // Night
        sunLight.intensity = 0.15;
        scene.background = new THREE.Color(0x090d16);
      }

      // Check current Zone
      const pCoord = stateRef.current.isDriving
        ? { x: world.playerCarState.x, z: world.playerCarState.z }
        : stateRef.current.playerPos;

      let closestZone = LAGOS_ZONES[0];
      let minZoneDist = Infinity;
      LAGOS_ZONES.forEach((z) => {
        const d = Math.hypot(z.center.x - pCoord.x, z.center.z - pCoord.z);
        if (d < minZoneDist) {
          minZoneDist = d;
          closestZone = z;
        }
      });
      onCurrentZoneChange(`${closestZone.name} (${closestZone.subtitle})`);

      // Wahala random event cooldown check
      stateRef.current.wahalaCooldown -= delta;
      if (stateRef.current.wahalaCooldown <= 0) {
        stateRef.current.wahalaCooldown = 90 + Math.random() * 60;
        onTriggerWahala();
      }

      // Sync dynamic traffic obstacles into physics system
      const trafficObstacles = trafficSystem.vehicles.map((v) => ({
        id: v.data.id,
        x: v.data.x,
        z: v.data.z,
        radius: v.data.type === 'danfo' ? 1.9 : 1.4,
        name: v.data.type === 'danfo' ? 'Yellow Danfo Bus' : v.data.type === 'keke' ? 'Keke Napep' : 'Commuter Car',
        isVehicle: true,
      }));

      if (!stateRef.current.isDriving) {
        trafficObstacles.push({
          id: world.playerCarState.id,
          x: world.playerCarState.x,
          z: world.playerCarState.z,
          radius: 1.6,
          name: 'Your Parked Sedan',
          isVehicle: true,
        });
      }

      physicsSystem.updateDynamicObstacles(trafficObstacles);

      // Driving vs Walking Physics & Camera
      if (stateRef.current.isDriving) {
        // Driving Input from Keyboard, Mobile Joystick, and Mobile Pedals
        const mob = mobileMoveRef.current;
        let throttle = 0;
        let steer = 0;

        if (stateRef.current.keys.w || stateRef.current.keys.s) {
          if (stateRef.current.keys.w) throttle += 1;
          if (stateRef.current.keys.s) throttle -= 1;
        }
        if (stateRef.current.keys.a) steer += 1;
        if (stateRef.current.keys.d) steer -= 1;

        // Mobile Pedals (Gas & Brake)
        if (mobileGasRef.current > 0) throttle += mobileGasRef.current;
        if (mobileBrakeRef.current > 0) throttle -= mobileBrakeRef.current;

        // Mobile Joystick
        if (Math.abs(mob.y) > 0.1) throttle -= mob.y;
        if (Math.abs(mob.x) > 0.1) steer -= mob.x;

        const isBraking = stateRef.current.keys.s || mobileBrakeRef.current > 0.3;
        const isHandbraking = stateRef.current.keys.space || mobileHandbrakeRef.current;

        physicsSystem.updateVehicle(
          world.playerCarState,
          {
            throttle,
            steering: steer,
            brake: isBraking,
            handbrake: isHandbraking,
          },
          delta,
          trafficObstacles
        );

        // Update Car Mesh
        world.playerCarMesh.position.set(world.playerCarState.x, 0, world.playerCarState.z);
        world.playerCarMesh.rotation.y = world.playerCarState.rotationY;

        // Engine sound modulation
        const normSpeed = Math.abs(world.playerCarState.speed) / 32;
        soundEngine.updateEngineSound(true, normSpeed);
        onVehicleStateChange({ ...world.playerCarState });

        // Driving Chase Camera with Reverse Gear Swivel & Optimal Road Angle
        const isReversing = world.playerCarState.speed < -0.3;
        const chaseDist = stateRef.current.cameraMode === 1 ? 4.5 : stateRef.current.cameraMode === 2 ? 8.5 : 6.0;
        const chaseHeight = stateRef.current.cameraMode === 1 ? 2.0 : stateRef.current.cameraMode === 2 ? 3.6 : 2.5;

        // Smooth swivel when reversing so player can see behind vehicle
        const camYawOffset = isReversing ? Math.PI : 0;
        const currentCarAngle = world.playerCarState.rotationY + camYawOffset;

        const backX = world.playerCarState.x - Math.sin(currentCarAngle) * chaseDist;
        const backZ = world.playerCarState.z - Math.cos(currentCarAngle) * chaseDist;

        camera.position.x = THREE.MathUtils.damp(camera.position.x, backX, 6, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, chaseHeight, 6, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, backZ, 6, delta);

        if (cameraShakeRef.current > 0.001) {
          camera.position.x += (Math.random() - 0.5) * cameraShakeRef.current;
          camera.position.y += (Math.random() - 0.5) * cameraShakeRef.current;
          cameraShakeRef.current = THREE.MathUtils.damp(cameraShakeRef.current, 0, 8, delta);
        }

        const lookAheadDist = isReversing ? -3.5 : 5.0;
        const lookTarget = new THREE.Vector3(
          world.playerCarState.x + Math.sin(world.playerCarState.rotationY) * lookAheadDist,
          1.15,
          world.playerCarState.z + Math.cos(world.playerCarState.rotationY) * lookAheadDist
        );
        camera.lookAt(lookTarget);
      } else {
        // Walking Character Physics
        soundEngine.updateEngineSound(false, 0);

        const mob = mobileMoveRef.current;
        let inputX = 0;
        let inputZ = 0;
        if (stateRef.current.keys.w) inputZ += 1;
        if (stateRef.current.keys.s) inputZ -= 1;
        if (stateRef.current.keys.a) inputX += 1;
        if (stateRef.current.keys.d) inputX -= 1;

        if (Math.abs(mob.x) > 0.1) inputX -= mob.x;
        if (Math.abs(mob.y) > 0.1) inputZ -= mob.y;

        const isSprinting = stateRef.current.keys.shift || mobileSprintRef.current;
        const isMoving = Math.abs(inputX) > 0.1 || Math.abs(inputZ) > 0.1;
        const speed = isSprinting ? 7.5 : 4.2;

        // Jump physics & Gravity
        const isGrounded = stateRef.current.playerPos.y <= 0.05;
        const wantJump = stateRef.current.keys.space || mobileJumpRef.current;
        if (wantJump && isGrounded && stateRef.current.jumpVelocity <= 0) {
          stateRef.current.jumpVelocity = 6.4;
          soundEngine.playFootstep();
        }

        if (stateRef.current.jumpVelocity !== 0 || stateRef.current.playerPos.y > 0) {
          stateRef.current.playerPos.y += stateRef.current.jumpVelocity * delta;
          stateRef.current.jumpVelocity -= 18.0 * delta; // Gravity
          if (stateRef.current.playerPos.y <= 0) {
            stateRef.current.playerPos.y = 0;
            stateRef.current.jumpVelocity = 0;
          }
        }

        if (isMoving) {
          // Camera relative direction
          const camYaw = stateRef.current.cameraAngle.yaw;
          const moveAngle = Math.atan2(inputX, inputZ) + camYaw;

          const dx = Math.sin(moveAngle) * speed * delta;
          const dz = Math.cos(moveAngle) * speed * delta;

          // Check X axis then Z axis to enable smooth wall-sliding
          const resolvedX = physicsSystem.checkCharacterCollision(
            stateRef.current.playerPos.x + dx,
            stateRef.current.playerPos.z,
            0.42
          );
          const resolvedZ = physicsSystem.checkCharacterCollision(
            resolvedX.x,
            stateRef.current.playerPos.z + dz,
            0.42
          );

          stateRef.current.playerPos.x = resolvedZ.x;
          stateRef.current.playerPos.z = resolvedZ.z;
          stateRef.current.playerRotY = moveAngle;

          // Leg & Arm swinging animation
          stateRef.current.walkCycle += delta * (isSprinting ? 16 : 10);
          const swing = Math.sin(stateRef.current.walkCycle) * 0.6;
          playerParts.leftLeg.rotation.x = swing;
          playerParts.rightLeg.rotation.x = -swing;
          playerParts.leftArm.rotation.x = -swing * 0.8;
          playerParts.rightArm.rotation.x = swing * 0.8;

          // Footstep audio trigger
          if (Math.sin(stateRef.current.walkCycle) > 0.95 && isGrounded) {
            soundEngine.playFootstep();
          }
        } else {
          // Idle legs
          playerParts.leftLeg.rotation.x = 0;
          playerParts.rightLeg.rotation.x = 0;
          playerParts.leftArm.rotation.x = 0;
          playerParts.rightArm.rotation.x = 0;
        }

        // Update player mesh with vertical position (jump)
        playerParts.group.position.set(
          stateRef.current.playerPos.x,
          stateRef.current.playerPos.y,
          stateRef.current.playerPos.z
        );
        playerParts.group.rotation.y = stateRef.current.playerRotY;

        // Third Person Orbit Camera with Adaptive Indoor Clearance
        const isInsideHome = Math.hypot(stateRef.current.playerPos.x - 42, stateRef.current.playerPos.z - (-475)) < 6.5;
        const isInsideOffice =
          stateRef.current.playerPos.x >= 35 &&
          stateRef.current.playerPos.x <= 55 &&
          stateRef.current.playerPos.z >= 16 &&
          stateRef.current.playerPos.z <= 34;
        const isIndoors = isInsideHome || isInsideOffice;

        const { yaw, pitch, distance } = stateRef.current.cameraAngle;
        const effDist = isIndoors ? Math.min(2.8, distance) : Math.min(distance, 4.8);
        const effPitch = isIndoors ? Math.max(0.26, pitch) : pitch;

        const camX = stateRef.current.playerPos.x - Math.sin(yaw) * Math.cos(effPitch) * effDist;
        const camY = stateRef.current.playerPos.y + 1.5 + Math.sin(effPitch) * effDist;
        const camZ = stateRef.current.playerPos.z - Math.cos(yaw) * Math.cos(effPitch) * effDist;

        camera.position.x = THREE.MathUtils.damp(camera.position.x, camX, 8, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, camY, 8, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, camZ, 8, delta);

        camera.lookAt(
          stateRef.current.playerPos.x,
          stateRef.current.playerPos.y + 1.25,
          stateRef.current.playerPos.z
        );
      }

      // Autonomous Traffic Update (syncing player car state so traffic avoids player & reacts to collisions)
      trafficSystem.update(delta, pCoord, {
        x: world.playerCarState.x,
        z: world.playerCarState.z,
        isDriving: stateRef.current.isDriving,
      });

      // Check Proximity to Usable Objects and NPCs
      let currentPrompt: string | null = null;
      let nearObj: string | null = null;

      // Distance to Player's Car
      const dstCar = Math.hypot(pCoord.x - world.playerCarState.x, pCoord.z - world.playerCarState.z);
      if (stateRef.current.isDriving) {
        if (Math.abs(world.playerCarState.speed) < 1.2) {
          currentPrompt = 'Exit Car [Space / E]';
          nearObj = 'car';
        }
      } else if (dstCar < 3.2) {
        currentPrompt = 'Enter Personal Car [Space / E]';
        nearObj = 'car';
      }

      // Check bedroom & home compound objects
      if (!stateRef.current.isDriving) {
        // Bed at Home
        const dstBed = Math.hypot(pCoord.x - 38.8, pCoord.z - (-478.2));
        if (dstBed < 2.5) {
          currentPrompt = 'Sleep & Rest (Advance Day to 6:00 AM) [Space / E]';
          nearObj = 'bed';
        }
        // Alarm Clock
        const dstAlarm = Math.hypot(pCoord.x - 40.4, pCoord.z - (-479.3));
        if (dstAlarm < 2.2) {
          currentPrompt = 'Dismiss Alarm [Space / E]';
          nearObj = 'alarm';
        }
        // Baba Segun (Estate Gate Security Guard)
        const dstBaba = Math.hypot(pCoord.x - 42.0, pCoord.z - (-460.5));
        if (dstBaba < 3.2 && !nearObj) {
          currentPrompt = 'Talk to Baba Segun (Security Guard) [Space / E]';
          nearObj = 'baba_segun';
        }

        // Inside or at PayLagos Tech Hub Office (x: 45, z: 25)
        const ox = 45;
        const oz = 25;
        const distOffice = Math.hypot(pCoord.x - ox, pCoord.z - oz);

        if (distOffice < 13.0) {
          // 1. Your Assigned Workstation Desk (x: 49, z: 25)
          const dstMyDesk = Math.hypot(pCoord.x - 49.0, pCoord.z - 25.0);
          if (dstMyDesk < 2.4 && !nearObj) {
            currentPrompt = 'Work at Workstation (PayLagos Dev) [Space / E]';
            nearObj = 'workstation';
          }

          // 2. Receptionist Amina (x: 45, z: 30.5)
          const dstReception = Math.hypot(pCoord.x - 45.0, pCoord.z - 30.5);
          if (dstReception < 2.5 && !nearObj) {
            currentPrompt = 'Clock In / Out Shift (Amina at Reception) [Space / E]';
            nearObj = 'reception';
          }

          // 3. Oga Femi in Manager Glass Office (x: 38.5, z: 19.2)
          const dstOga = Math.hypot(pCoord.x - 38.5, pCoord.z - 19.2);
          if (dstOga < 2.5 && !nearObj) {
            currentPrompt = 'Talk to Oga Femi (Manager) [Space / E]';
            nearObj = 'oga_femi';
          }

          // 4. Tayo (Frontend Dev) (x: 41, z: 25)
          const dstTayo = Math.hypot(pCoord.x - 41.0, pCoord.z - 25.0);
          if (dstTayo < 2.2 && !nearObj) {
            currentPrompt = 'Chat with Tayo (Frontend Dev) [Space / E]';
            nearObj = 'tayo';
          }

          // 5. Break Room Coffee / Water Dispenser (x: 50.5, z: 18.2)
          const dstCoffee = Math.hypot(pCoord.x - 50.5, pCoord.z - 18.2);
          if (dstCoffee < 2.2 && !nearObj) {
            currentPrompt = 'Drink Coffee & Refresh (Restore 20 Energy) [Space / E]';
            nearObj = 'coffee';
          }

          // 6. Office Generator Switch (x: 45, z: 17.5)
          const dstGen = Math.hypot(pCoord.x - 45.0, pCoord.z - 17.5);
          if (dstGen < 2.2 && !nearObj) {
            currentPrompt = 'Toggle Office Generator / Grid Power [Space / E]';
            nearObj = 'gen_switch';
          }
        }
      }

      // Check Mapped Landmarks (Fuel Stations and Buka Stalls)
      LAGOS_LANDMARKS.forEach((lm) => {
        const d = Math.hypot(pCoord.x - lm.position.x, pCoord.z - lm.position.z);
        if (lm.type === 'fuel') {
          // Fuel pumps can be used when parked in car or on foot
          if (d < 7.0 && !nearObj) {
            currentPrompt = `Buy Fuel at ${lm.name} [Space / E]`;
            nearObj = `fuel_${lm.id}`;
          }
        } else if (lm.type === 'buka') {
          if (d < 4.8 && !nearObj && !stateRef.current.isDriving) {
            currentPrompt = `Order Food at ${lm.name} [Space / E]`;
            nearObj = lm.id;
          }
        }
      });

      stateRef.current.nearObject = nearObj;
      onInteractionPromptChange(currentPrompt);

      // Send real-time player position and heading for GPS Minimap
      if (onPlayerTransformChange) {
        const heading = stateRef.current.isDriving
          ? world.playerCarState.rotationY
          : stateRef.current.playerRotY;
        onPlayerTransformChange(pCoord, heading);
      }

      // Calculate GPS Route Turn-by-Turn Text Instructions (Route lines not drawn on ground)
      if (activeDestRef.current) {
        const route = calculateGPSRoute(pCoord, activeDestRef.current);
        if (route) {
          world.updateRouteLine(route.pathPoints);
          onActiveRouteChange(route);
        } else {
          world.updateRouteLine([]);
          onActiveRouteChange(null);
        }
      } else {
        world.updateRouteLine([]);
        onActiveRouteChange(null);
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);
      trafficSystem.cleanup();
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="h-full w-full cursor-grab active:cursor-grabbing" />;
};
