import React, { useRef, useEffect, useState } from 'react';
import { Navigation, ZoomIn, ZoomOut, ChevronUp, ChevronDown, MapPin, X } from 'lucide-react';
import { LAGOS_ROAD_NODES, LAGOS_LANDMARKS } from '../city/lagosGeography';
import { Landmark } from '../types/game';
import { RouteResult } from '../game/routing';

interface MinimapProps {
  playerPos: { x: number; z: number };
  playerHeading: number; // In radians (rotation.y)
  activeRoute: RouteResult | null;
  activeDestinationId: string | null;
  onClearDestination: () => void;
  onOpenFullMap: () => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  playerPos,
  playerHeading,
  activeRoute,
  activeDestinationId,
  onClearDestination,
  onOpenFullMap,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(250); // Radar radius in world meters
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Active target landmark
  const targetLandmark = LAGOS_LANDMARKS.find((l) => l.id === activeDestinationId);

  // Calculate turn-by-turn prompt based on distance to next waypoint
  let turnInstruction = 'Continue straight.';
  let distanceText = '';
  let estimatedTimeText = '';

  if (activeRoute && targetLandmark) {
    const distToTarget = Math.hypot(
      playerPos.x - targetLandmark.position.x,
      playerPos.z - targetLandmark.position.z
    );
    const scaledDistMeters = Math.round(distToTarget * 8);

    if (scaledDistMeters < 35) {
      turnInstruction = `You have arrived at ${targetLandmark.name}!`;
    } else if (scaledDistMeters < 85) {
      turnInstruction = `Destination nearby: ${targetLandmark.name} is ahead.`;
    } else if (activeRoute.instructions.length > 0) {
      turnInstruction = activeRoute.instructions[0];
    }

    distanceText =
      scaledDistMeters > 1000
        ? `${(scaledDistMeters / 1000).toFixed(1)} km`
        : `${scaledDistMeters} m`;
    estimatedTimeText = `~${activeRoute.estimatedMinutes} min`;
  }

  // Draw the real-time canvas minimap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isMinimized) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 4;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Save for clipping to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();

    // Map Background (dark Lagos nocturnal asphalt tint)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Subtle radar grid rings
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.45, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.85, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.stroke();

    // Helper to transform 3D world (x, z) to 2D canvas coords relative to player
    const worldToCanvas = (wx: number, wz: number) => {
      const dx = wx - playerPos.x;
      const dz = wz - playerPos.z;
      // Scale: zoomLevel meters = radius pixels
      const scale = radius / zoomLevel;
      const screenX = centerX + dx * scale;
      const screenY = centerY + dz * scale;
      return { x: screenX, y: screenY, dist: Math.hypot(dx, dz) };
    };

    // 1. Draw Nearby Real Road Network (from LAGOS_ROAD_NODES)
    const nodeMap = new Map<string, (typeof LAGOS_ROAD_NODES)[0]>();
    LAGOS_ROAD_NODES.forEach((n) => nodeMap.set(n.id, n));

    const drawnPairs = new Set<string>();

    LAGOS_ROAD_NODES.forEach((node) => {
      const p1 = worldToCanvas(node.x, node.z);

      node.connections.forEach((connId) => {
        const neighbor = nodeMap.get(connId);
        if (!neighbor) return;

        const pairKey = [node.id, neighbor.id].sort().join('--');
        if (drawnPairs.has(pairKey)) return;
        drawnPairs.add(pairKey);

        const p2 = worldToCanvas(neighbor.x, neighbor.z);

        // Only draw if at least one node is within 1.5x zoom range
        if (p1.dist < zoomLevel * 1.5 || p2.dist < zoomLevel * 1.5) {
          // Draw road casing (dark border)
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineWidth = 7;
          ctx.strokeStyle = '#334155';
          ctx.lineCap = 'round';
          ctx.stroke();

          // Draw road surface (lighter asphalt)
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#64748b';
          ctx.stroke();
        }
      });
    });

    // 2. Draw Road Junction Nodes
    LAGOS_ROAD_NODES.forEach((node) => {
      const p = worldToCanvas(node.x, node.z);
      if (p.dist < zoomLevel * 1.3) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#94a3b8';
        ctx.fill();
      }
    });

    // 3. Draw Nearby Landmarks (Icons/Dots)
    LAGOS_LANDMARKS.forEach((lm) => {
      const p = worldToCanvas(lm.position.x, lm.position.z);
      if (p.dist < zoomLevel) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);

        if (lm.type === 'home') ctx.fillStyle = '#38bdf8'; // Sky blue
        else if (lm.type === 'office') ctx.fillStyle = '#10b981'; // Emerald
        else if (lm.type === 'buka') ctx.fillStyle = '#f97316'; // Orange
        else if (lm.type === 'fuel') ctx.fillStyle = '#eab308'; // Yellow
        else ctx.fillStyle = '#a855f7'; // Purple

        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }
    });

    // 4. Draw Selected Destination Pin (NO ROUTE LINE DRAWN)
    if (targetLandmark) {
      const tp = worldToCanvas(targetLandmark.position.x, targetLandmark.position.z);
      if (tp.dist < zoomLevel - 8) {
        // Destination is within the visible circle
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Pulsing inner ring
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, 11, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        // Destination is outside visible circle: Draw border pointer indicator
        const angle = Math.atan2(tp.y - centerY, tp.x - centerX);
        const edgeX = centerX + Math.cos(angle) * (radius - 12);
        const edgeY = centerY + Math.sin(angle) * (radius - 12);

        ctx.beginPath();
        ctx.arc(edgeX, edgeY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }
    }

    // 5. Draw Player Marker (Prominent Glowing Arrow at Center)
    ctx.save();
    ctx.translate(centerX, centerY);
    // Heading in radians; 3D rotationY is clockwise from south/z
    ctx.rotate(playerHeading);

    // Glowing halo
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.fill();

    // Directional Arrow
    ctx.beginPath();
    ctx.moveTo(0, -9); // Pointing forward
    ctx.lineTo(6, 6);
    ctx.lineTo(0, 3);
    ctx.lineTo(-6, 6);
    ctx.closePath();
    ctx.fillStyle = '#38bdf8'; // Cyan
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.restore();

    // Restore clip
    ctx.restore();

    // Outer Bezel / Border ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    // North Compass Indicator (N)
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', centerX, 13);
  }, [playerPos, playerHeading, zoomLevel, targetLandmark, isMinimized]);

  return (
    <div className="pointer-events-auto flex flex-col items-end gap-1.5 select-none">
      {/* Top turn-by-turn guidance card if destination is active */}
      {targetLandmark && !isMinimized && (
        <div className="flex max-w-[240px] items-start gap-2 rounded-xl border border-sky-500/40 bg-zinc-950/90 p-2.5 text-white shadow-xl backdrop-blur-md">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-600/30 text-sky-400 border border-sky-500/40">
            <Navigation className="h-4 w-4" />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">
                GPS Turn-by-Turn
              </span>
              <button
                onClick={onClearDestination}
                className="text-zinc-400 hover:text-white"
                title="Cancel Navigation"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <p className="mt-0.5 text-xs font-semibold leading-tight text-zinc-100 line-clamp-2">
              {turnInstruction}
            </p>
            <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-sky-300">
              <span className="font-bold">{distanceText}</span>
              {estimatedTimeText && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span>{estimatedTimeText}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Circular Minimap Container */}
      <div className="relative flex flex-col items-center">
        {!isMinimized && (
          <div
            onClick={onOpenFullMap}
            className="group relative cursor-pointer overflow-hidden rounded-full border-2 border-zinc-700 bg-zinc-950 p-1 shadow-2xl transition hover:border-sky-400"
            title="Click to open Full GPS Map [M]"
          >
            <canvas
              ref={canvasRef}
              width={160}
              height={160}
              className="h-[150px] w-[150px] rounded-full sm:h-[160px] sm:w-[160px]"
            />

            {/* Tap to expand prompt overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition">
              <span className="rounded-md bg-zinc-900/90 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                Full Map [M]
              </span>
            </div>
          </div>
        )}

        {/* Floating Zoom & Toggle Buttons */}
        <div className="mt-1 flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950/80 px-2 py-1 shadow-lg backdrop-blur-xs text-xs">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-zinc-400 hover:text-white px-1"
            title={isMinimized ? 'Show Minimap' : 'Hide Minimap'}
          >
            {isMinimized ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-sky-400">
                <Navigation className="h-3 w-3" /> Show GPS
              </span>
            ) : (
              <ChevronUp className="h-3.5 w-3.5" />
            )}
          </button>

          {!isMinimized && (
            <>
              <div className="h-3 w-px bg-zinc-700" />
              <button
                onClick={() => setZoomLevel((prev) => Math.max(120, prev - 80))}
                className="text-zinc-300 hover:text-sky-400 px-1"
                title="Zoom In"
              >
                <ZoomIn className="h-3 w-3" />
              </button>
              <button
                onClick={() => setZoomLevel((prev) => Math.min(480, prev + 80))}
                className="text-zinc-300 hover:text-sky-400 px-1"
                title="Zoom Out"
              >
                <ZoomOut className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
