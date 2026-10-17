import { LAGOS_ROAD_NODES, LAGOS_LANDMARKS } from '../city/lagosGeography';
import { RoadNode, Landmark } from '../types/game';

export interface RouteResult {
  nodes: RoadNode[];
  pathPoints: { x: number; y: number; z: number }[];
  totalDistanceMeters: number;
  estimatedMinutes: number;
  instructions: string[];
}

// Find nearest road node to any (x, z) world coordinate
export function findNearestRoadNode(x: number, z: number): RoadNode {
  let nearest = LAGOS_ROAD_NODES[0];
  let minDstSq = Infinity;

  for (const node of LAGOS_ROAD_NODES) {
    const dx = node.x - x;
    const dz = node.z - z;
    const dstSq = dx * dx + dz * dz;
    if (dstSq < minDstSq) {
      minDstSq = dstSq;
      nearest = node;
    }
  }

  return nearest;
}

// Dijkstra / A* graph solver along the real Lagos road network
export function calculateGPSRoute(
  startPos: { x: number; z: number },
  targetLandmarkId: string
): RouteResult | null {
  const targetLandmark = LAGOS_LANDMARKS.find((l) => l.id === targetLandmarkId);
  if (!targetLandmark) return null;

  const startNode = findNearestRoadNode(startPos.x, startPos.z);
  const endNode = findNearestRoadNode(targetLandmark.position.x, targetLandmark.position.z);

  const nodeMap = new Map<string, RoadNode>();
  LAGOS_ROAD_NODES.forEach((n) => nodeMap.set(n.id, n));

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>();

  LAGOS_ROAD_NODES.forEach((n) => {
    distances.set(n.id, Infinity);
    previous.set(n.id, null);
    unvisited.add(n.id);
  });

  distances.set(startNode.id, 0);

  while (unvisited.size > 0) {
    // Find node in unvisited with smallest distance
    let currentId: string | null = null;
    let smallestDist = Infinity;

    unvisited.forEach((id) => {
      const dist = distances.get(id)!;
      if (dist < smallestDist) {
        smallestDist = dist;
        currentId = id;
      }
    });

    if (currentId === null || smallestDist === Infinity) break;
    if (currentId === endNode.id) break;

    unvisited.delete(currentId);
    const currentNode = nodeMap.get(currentId)!;

    for (const neighborId of currentNode.connections) {
      if (!unvisited.has(neighborId)) continue;
      const neighbor = nodeMap.get(neighborId);
      if (!neighbor) continue;

      const dx = neighbor.x - currentNode.x;
      const dz = neighbor.z - currentNode.z;
      const stepDist = Math.hypot(dx, dz);
      const alt = distances.get(currentId)! + stepDist;

      if (alt < distances.get(neighborId)!) {
        distances.set(neighborId, alt);
        previous.set(neighborId, currentId);
      }
    }
  }

  // Reconstruct path
  const pathNodeIds: string[] = [];
  let curr: string | null = endNode.id;

  while (curr !== null) {
    pathNodeIds.unshift(curr);
    curr = previous.get(curr) || null;
  }

  if (pathNodeIds.length === 0 || pathNodeIds[0] !== startNode.id) {
    // Direct line fallback if graph disconnected
    pathNodeIds.splice(0, pathNodeIds.length, startNode.id, endNode.id);
  }

  const nodes = pathNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);

  // Generate 3D polyline including start pos, nodes, and landmark pos
  const pathPoints: { x: number; y: number; z: number }[] = [
    { x: startPos.x, y: 0.1, z: startPos.z },
    ...nodes.map((n) => ({ x: n.x, y: 0.15, z: n.z })),
    { x: targetLandmark.position.x, y: 0.1, z: targetLandmark.position.z },
  ];

  // Calculate total distance
  let totalDistanceMeters = 0;
  for (let i = 0; i < pathPoints.length - 1; i++) {
    const p1 = pathPoints[i];
    const p2 = pathPoints[i + 1];
    totalDistanceMeters += Math.hypot(p2.x - p1.x, p2.z - p1.z);
  }

  // Generate turn instructions based on node names
  const instructions: string[] = [];
  if (nodes.length <= 1) {
    instructions.push(`Proceed directly to ${targetLandmark.name}`);
  } else {
    instructions.push(`Head toward ${nodes[0].name || 'the main road'}`);
    for (let i = 1; i < nodes.length; i++) {
      const prev = nodes[i - 1];
      const cur = nodes[i];
      if (cur.name && cur.name !== prev.name) {
        instructions.push(`Continue onto ${cur.name}`);
      }
    }
    instructions.push(`Arrive at ${targetLandmark.name}`);
  }

  // Lagos travel time estimate (incorporating typical Lagos traffic pace)
  // Scaling 1 world meter = ~8 real meters scale factor
  const estSpeedMps = 14; // ~50 km/h avg
  const estimatedMinutes = Math.max(2, Math.round((totalDistanceMeters / estSpeedMps) * 0.4));

  return {
    nodes,
    pathPoints,
    totalDistanceMeters: Math.round(totalDistanceMeters * 8), // Real-world equivalent meters
    estimatedMinutes,
    instructions,
  };
}
