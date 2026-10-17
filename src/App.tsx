import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { PhoneModal } from './components/PhoneModal';
import { BukaShopModal } from './components/BukaShopModal';
import { OfficeModal } from './components/OfficeModal';
import { MapModal } from './components/MapModal';
import { WahalaDialog } from './components/WahalaDialog';
import { MobileControls } from './components/MobileControls';
import { DeviceSelectionModal } from './components/DeviceSelectionModal';
import { SettingsModal } from './components/SettingsModal';
import { FuelStationModal } from './components/FuelStationModal';
import { MoneyTransferModal } from './components/MoneyTransferModal';
import { gameState, LAGOS_WAHALA_EVENTS } from './game/gameState';
import { soundEngine } from './audio/soundEngine';
import { PlayerStats, VehicleState, WahalaEvent, DeviceMode } from './types/game';
import { RouteResult } from './game/routing';
import { Compass, Sparkles, Play } from 'lucide-react';

export default function App() {
  const [stats, setStats] = useState<PlayerStats>(gameState.getStats());
  const [isDriving, setIsDriving] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleState | null>(null);
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(null);
  const [activeDestinationId, setActiveDestinationId] = useState<string | null>('tech_office');
  const [currentZoneName, setCurrentZoneName] = useState('Ikeja (State Capital & Mainland Hub)');
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(stats.deviceMode || 'laptop');
  const [touchControlsEnabled, setTouchControlsEnabled] = useState(false);
  const [mobileMove, setMobileMove] = useState({ x: 0, y: 0 });
  const [mobileJump, setMobileJump] = useState(false);
  const [mobileSprint, setMobileSprint] = useState(false);
  const [mobileGas, setMobileGas] = useState(0);
  const [mobileBrake, setMobileBrake] = useState(0);
  const [mobileHandbrake, setMobileHandbrake] = useState(false);

  // Real-time player transform for GPS Minimap
  const [playerPos, setPlayerPos] = useState({ x: 42, z: -478 });
  const [playerHeading, setPlayerHeading] = useState(0);

  // Modals state
  const [showDeviceSelection, setShowDeviceSelection] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isBukaOpen, setIsBukaOpen] = useState(false);
  const [bukaVendorName, setBukaVendorName] = useState("Mama Ngozi's Buka");
  const [isOfficeOpen, setIsOfficeOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isFuelOpen, setIsFuelOpen] = useState(false);
  const [fuelStationName, setFuelStationName] = useState('Oando Filling Station (Ikeja)');
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferBeneficiaryId, setTransferBeneficiaryId] = useState<string | undefined>(undefined);
  const [currentWahala, setCurrentWahala] = useState<WahalaEvent | null>(null);
  const [latestNotification, setLatestNotification] = useState<{ sender: string; text: string } | null>({
    sender: 'Oga Femi (PayLagos Lead)',
    text: 'Morning sprint starts 09:00 AM sharp. Avoid Third Mainland go-slow!',
  });

  const interactActionRef = useRef<() => void>(() => {});

  // Subscribe to gameState changes
  useEffect(() => {
    const unsub = gameState.subscribe(() => {
      const current = gameState.getStats();
      setStats(current);
      if (current.deviceMode) {
        setDeviceMode(current.deviceMode);
      }
    });
    return unsub;
  }, []);

  // Detect touch screens
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024;
    setIsTouchDevice(isTouch);
  }, []);

  // Global hotkeys (M, P, B, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showDeviceSelection) return;
      const k = e.key.toLowerCase();

      if (k === 'escape') {
        setIsPhoneOpen(false);
        setIsBukaOpen(false);
        setIsOfficeOpen(false);
        setIsMapOpen(false);
        setIsSettingsOpen((prev) => !prev);
      } else if (k === 'm') {
        setIsMapOpen((prev) => !prev);
      } else if (k === 'p') {
        setIsPhoneOpen((prev) => !prev);
      } else if (k === 'b') {
        setIsBukaOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDeviceSelection]);

  const handleDeviceSelection = (mode: DeviceMode) => {
    setDeviceMode(mode);
    setTouchControlsEnabled(mode === 'mobile');
    gameState.setDeviceMode(mode);
    setShowDeviceSelection(false);
    soundEngine.playCarHorn();
  };

  const handleDeviceModeChange = (mode: DeviceMode) => {
    setDeviceMode(mode);
    setTouchControlsEnabled(mode === 'mobile');
    gameState.setDeviceMode(mode);
  };

  const handlePlayerTransformChange = useCallback((pos: { x: number; z: number }, heading: number) => {
    setPlayerPos(pos);
    setPlayerHeading(heading);
  }, []);

  const handleOpenBuka = useCallback((vendorName?: string) => {
    if (vendorName) setBukaVendorName(vendorName);
    setIsBukaOpen(true);
  }, []);

  const handleOpenOffice = useCallback(() => {
    setIsOfficeOpen(true);
  }, []);

  const handleOpenFuel = useCallback((stationName?: string) => {
    if (stationName) setFuelStationName(stationName);
    setIsFuelOpen(true);
  }, []);

  const handleOpenTransfer = useCallback((beneficiaryId?: string) => {
    setTransferBeneficiaryId(beneficiaryId);
    setIsTransferOpen(true);
  }, []);

  const handleTriggerWahala = useCallback(() => {
    const randomEvent = LAGOS_WAHALA_EVENTS[Math.floor(Math.random() * LAGOS_WAHALA_EVENTS.length)];
    setCurrentWahala(randomEvent);
  }, []);

  const handleVehicleStateChange = useCallback((v: VehicleState | null) => {
    setVehicle(v);
    setIsDriving(!!v);
  }, []);

  const handleToggleAudio = () => {
    const muted = soundEngine.toggleMute();
    setIsAudioMuted(muted);
  };

  const handleMobileMoveChange = useCallback((x: number, y: number) => {
    setMobileMove({ x, y });
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black font-sans select-none">
      {/* 3D WebGL Canvas */}
      <GameCanvas
        onInteractionPromptChange={setInteractionPrompt}
        onActiveRouteChange={setActiveRoute}
        onCurrentZoneChange={setCurrentZoneName}
        onVehicleStateChange={handleVehicleStateChange}
        onOpenBuka={handleOpenBuka}
        onOpenOffice={handleOpenOffice}
        onOpenFuel={handleOpenFuel}
        onOpenTransfer={handleOpenTransfer}
        onTriggerWahala={handleTriggerWahala}
        activeDestinationId={activeDestinationId}
        onPlayerTransformChange={handlePlayerTransformChange}
        onRegisterInteractAction={(fn) => {
          interactActionRef.current = fn;
        }}
        mobileMove={mobileMove}
        mobileJump={mobileJump}
        mobileSprint={mobileSprint}
        mobileGas={mobileGas}
        mobileBrake={mobileBrake}
        mobileHandbrake={mobileHandbrake}
      />

      {/* Main HUD overlay */}
      {!showDeviceSelection && (
        <HUD
          stats={stats}
          isDriving={isDriving}
          vehicle={vehicle}
          activeRoute={activeRoute}
          activeDestinationId={activeDestinationId}
          currentZoneName={currentZoneName}
          interactionPrompt={interactionPrompt}
          playerPos={playerPos}
          playerHeading={playerHeading}
          onClearDestination={() => setActiveDestinationId(null)}
          onOpenMap={() => setIsMapOpen(true)}
          onOpenPhone={() => {
            setIsPhoneOpen(true);
            setLatestNotification(null);
          }}
          onOpenBuka={() => setIsBukaOpen(true)}
          onOpenOffice={() => setIsOfficeOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onInteract={() => interactActionRef.current()}
          isAudioMuted={isAudioMuted}
          onToggleAudio={handleToggleAudio}
          onCycleCamera={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c' }))}
          showTouchControls={touchControlsEnabled}
          onToggleTouchControls={() => setTouchControlsEnabled((prev) => !prev)}
          deviceMode={deviceMode}
          latestNotification={latestNotification}
        />
      )}

      {/* Mobile Touch Controls */}
      {!showDeviceSelection && touchControlsEnabled && (
        <MobileControls
          onMoveChange={handleMobileMoveChange}
          onJumpStart={() => setMobileJump(true)}
          onJumpEnd={() => setMobileJump(false)}
          onToggleSprint={() => setMobileSprint((prev) => !prev)}
          isSprinting={mobileSprint}
          onGasStart={() => setMobileGas(1)}
          onGasEnd={() => setMobileGas(0)}
          onBrakeStart={() => setMobileBrake(1)}
          onBrakeEnd={() => setMobileBrake(0)}
          onHandbrakeStart={() => setMobileHandbrake(true)}
          onHandbrakeEnd={() => setMobileHandbrake(false)}
          onActionClick={() => interactActionRef.current()}
          onEnterExitCar={() => interactActionRef.current()}
          onHorn={() => soundEngine.playCarHorn()}
          onToggleLights={() => {
            if (vehicle) vehicle.headlightsOn = !vehicle.headlightsOn;
          }}
          onCycleCamera={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c' }))}
          onOpenMap={() => setIsMapOpen(true)}
          onOpenPhone={() => {
            setIsPhoneOpen(true);
            setLatestNotification(null);
          }}
          onOpenBuka={() => setIsBukaOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isDriving={isDriving}
          nearVehicle={!!interactionPrompt?.includes('Car')}
          nearInteractable={interactionPrompt}
        />
      )}

      {/* Modals */}
      {isPhoneOpen && (
        <PhoneModal
          currentZoneName={currentZoneName}
          onClose={() => setIsPhoneOpen(false)}
          onOpenTransfer={handleOpenTransfer}
        />
      )}

      {isFuelOpen && (
        <FuelStationModal
          stationName={fuelStationName}
          vehicleState={vehicle}
          onClose={() => setIsFuelOpen(false)}
          onRefueledVehicle={(newFuelPercent) => {
            if (vehicle) {
              vehicle.fuel = newFuelPercent;
              setVehicle({ ...vehicle });
            }
          }}
        />
      )}

      {isTransferOpen && (
        <MoneyTransferModal
          initialBeneficiaryId={transferBeneficiaryId}
          onClose={() => setIsTransferOpen(false)}
        />
      )}

      {isBukaOpen && (
        <BukaShopModal
          vendorName={bukaVendorName}
          onClose={() => setIsBukaOpen(false)}
        />
      )}

      {isOfficeOpen && <OfficeModal onClose={() => setIsOfficeOpen(false)} />}

      {isMapOpen && (
        <MapModal
          onClose={() => setIsMapOpen(false)}
          activeDestinationId={activeDestinationId}
          onSelectDestination={(id) => {
            setActiveDestinationId(id);
            setIsMapOpen(false);
          }}
          playerPos={playerPos}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          currentDeviceMode={deviceMode}
          onDeviceModeChange={handleDeviceModeChange}
          isAudioMuted={isAudioMuted}
          onToggleAudio={handleToggleAudio}
        />
      )}

      {currentWahala && (
        <WahalaDialog
          event={currentWahala}
          onClose={(result) => {
            setCurrentWahala(null);
            setInteractionPrompt(result);
            setTimeout(() => setInteractionPrompt(null), 4000);
          }}
        />
      )}

      {/* Device Selection Screen (Opens before gameplay begins) */}
      {showDeviceSelection && (
        <DeviceSelectionModal
          onSelectDevice={handleDeviceSelection}
          isTouchDetected={isTouchDevice}
        />
      )}
    </div>
  );
}
