import { normalizeNodeCategory } from "@/lib/thinkingMachine/nodeMeta";
import { getEdgeContinuationFlag } from "@/lib/thinkingMachine/connectorEdges";
import {
  getThinkingNodeHeight,
  getThinkingNodeWidth,
  NODE_PORT_LAYOUT,
} from "@/lib/thinkingMachine/reactflowTransforms";

const CLUSTER_GAP_X = 140;
const CLUSTER_GAP_Y = 234;
const LAYOUT_COLUMN_GAP = 380;
const LAYOUT_ROW_GAP = 295;
const COLLISION_GAP_X = 32;
const COLLISION_GAP_Y = 48;
const MAX_COLLISION_ITERATIONS = 64;

const REASONING_ORDER = {
  Why: 2,
  What: 3,
  How: 4,
  Who: 5,
  When: 6,
  Where: 7,
  Problem: 10,
  Goal: 20,
  Constraint: 30,
  Assumption: 35,
  Evidence: 40,
  OpenQuestion: 45,
  Insight: 50,
  Idea: 60,
  Option: 70,
  Risk: 80,
  Conflict: 85,
  Decision: 90,
};

export function computeNodeBounds(nodeList) {
  const list = Array.isArray(nodeList) ? nodeList : [];
  if (list.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  list.forEach((n) => {
    const x = n?.position?.x ?? 0;
    const y = n?.position?.y ?? 0;
    const w = getThinkingNodeWidth(n);
    const h = getThinkingNodeHeight(n);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);
  });
  return { minX, minY, maxX, maxY };
}

function getNodeRect(node) {
  const x = node?.position?.x ?? 0;
  const y = node?.position?.y ?? 0;
  const w = getThinkingNodeWidth(node);
  const h = getThinkingNodeHeight(node);
  return { x, y, w, h, maxX: x + w, maxY: y + h };
}

function rectsOverlap(a, b, gapX = COLLISION_GAP_X, gapY = COLLISION_GAP_Y) {
  return !(
    a.maxX + gapX <= b.x ||
    b.maxX + gapX <= a.x ||
    a.maxY + gapY <= b.y ||
    b.maxY + gapY <= a.y
  );
}

export function resolveIncomingNodeCollisions(existingNodes, incomingNodes, options = {}) {
  const existing = Array.isArray(existingNodes) ? existingNodes : [];
  const incoming = Array.isArray(incomingNodes) ? incomingNodes : [];
  if (!incoming.length) return incoming;

  const gapX = options.gapX ?? COLLISION_GAP_X;
  const gapY = options.gapY ?? COLLISION_GAP_Y;
  const preferVertical = options.preferVertical !== false;
  const occupiedRects = existing.map(getNodeRect);

  return incoming.map((node) => {
    let rect = getNodeRect(node);
    let iterations = 0;

    while (iterations < MAX_COLLISION_ITERATIONS) {
      const blocker = occupiedRects.find((other) => rectsOverlap(rect, other, gapX, gapY));
      if (!blocker) break;

      const shiftDown = blocker.maxY + gapY - rect.y;
      const shiftRight = blocker.maxX + gapX - rect.x;

      if (preferVertical && shiftDown > 0 && shiftDown <= shiftRight) {
        rect = {
          ...rect,
          y: rect.y + shiftDown,
          maxY: rect.maxY + shiftDown,
        };
      } else if (shiftRight > 0) {
        rect = {
          ...rect,
          x: rect.x + shiftRight,
          maxX: rect.maxX + shiftRight,
        };
      } else if (shiftDown > 0) {
        rect = {
          ...rect,
          y: rect.y + shiftDown,
          maxY: rect.maxY + shiftDown,
        };
      } else {
        rect = {
          ...rect,
          y: rect.y + gapY,
          maxY: rect.maxY + gapY,
        };
      }

      iterations += 1;
    }

    const resolved = {
      ...node,
      position: { x: rect.x, y: rect.y },
    };
    occupiedRects.push(rect);
    return resolved;
  });
}

function collectContinuationDescendants(anchorId, allNodes, existingEdges) {
  const nodeMap = new Map((Array.isArray(allNodes) ? allNodes : []).map((node) => [node.id, node]));
  const descendants = [];
  const visited = new Set([anchorId]);
  const queue = [anchorId];

  while (queue.length) {
    const currentId = queue.shift();
    (Array.isArray(existingEdges) ? existingEdges : []).forEach((edge) => {
      if (edge?.source !== currentId || !getEdgeContinuationFlag(edge)) return;
      if (visited.has(edge.target)) return;
      visited.add(edge.target);
      const child = nodeMap.get(edge.target);
      if (child) {
        descendants.push(child);
        queue.push(edge.target);
      }
    });
  }

  return descendants;
}

export function shiftClusterRightOfExisting(existingNodes, incomingNodes) {
  const existing = Array.isArray(existingNodes) ? existingNodes : [];
  const incoming = Array.isArray(incomingNodes) ? incomingNodes : [];
  if (!incoming.length) return incoming;

  const existingBounds = computeNodeBounds(existing);
  const incomingBounds = computeNodeBounds(incoming);
  let placed = incoming;

  if (existingBounds && incomingBounds) {
    const desiredMinX = existingBounds.maxX + CLUSTER_GAP_X;
    const deltaX = desiredMinX - incomingBounds.minX;
    if (Number.isFinite(deltaX) && deltaX > 0) {
      placed = incoming.map((n) => ({
        ...n,
        position: { x: (n.position?.x ?? 0) + deltaX, y: n.position?.y ?? 0 },
      }));
    }
  }

  return resolveIncomingNodeCollisions(existing, placed);
}

function getNodeOrderScore(node) {
  const rawCategory = node?.data?.category;
  const category = normalizeNodeCategory(typeof rawCategory === "string" ? rawCategory : "");
  return REASONING_ORDER[category] ?? REASONING_ORDER.Idea;
}

function getClusterAverageOrder(nodeList) {
  const list = Array.isArray(nodeList) ? nodeList : [];
  if (!list.length) return REASONING_ORDER.Idea;
  const total = list.reduce((sum, node) => sum + getNodeOrderScore(node), 0);
  return total / list.length;
}

function getPhaseWeight(node) {
  return node?.data?.phase === "Solution" ? 4 : 0;
}

function getBaseLayoutRank(node) {
  const order = getNodeOrderScore(node);
  const phase = getPhaseWeight(node);
  return phase + Math.round(order / 15);
}

export function relayoutTopLevelThinkingNodes(nodeList, edgeList = []) {
  const nodes = Array.isArray(nodeList) ? nodeList : [];
  const edges = Array.isArray(edgeList) ? edgeList : [];
  const topLevelThinkingNodes = nodes.filter((node) => node?.type === "thinkingNode" && !node?.parentNode);
  if (topLevelThinkingNodes.length <= 1) return nodes;

  const nodeMap = new Map(topLevelThinkingNodes.map((node) => [node.id, node]));
  const outgoing = new Map();
  const indegree = new Map();
  const incoming = new Map();

  topLevelThinkingNodes.forEach((node) => {
    outgoing.set(node.id, []);
    incoming.set(node.id, []);
    indegree.set(node.id, 0);
  });

  edges.forEach((edge) => {
    if (!nodeMap.has(edge?.source) || !nodeMap.has(edge?.target)) return;
    outgoing.get(edge.source)?.push(edge.target);
    incoming.get(edge.target)?.push(edge.source);
    indegree.set(edge.target, (indegree.get(edge.target) || 0) + 1);
  });

  const baseRank = new Map(topLevelThinkingNodes.map((node) => [node.id, getBaseLayoutRank(node)]));
  const rank = new Map(baseRank);
  const queue = topLevelThinkingNodes
    .filter((node) => (indegree.get(node.id) || 0) === 0)
    .sort((a, b) => (baseRank.get(a.id) || 0) - (baseRank.get(b.id) || 0));

  const visited = new Set();

  while (queue.length) {
    const current = queue.shift();
    if (!current || visited.has(current.id)) continue;
    visited.add(current.id);
    const currentRank = rank.get(current.id) || 0;
    (outgoing.get(current.id) || []).forEach((targetId) => {
      rank.set(targetId, Math.max(rank.get(targetId) || 0, currentRank + 1, baseRank.get(targetId) || 0));
      indegree.set(targetId, Math.max(0, (indegree.get(targetId) || 0) - 1));
      if ((indegree.get(targetId) || 0) === 0) {
        queue.push(nodeMap.get(targetId));
        queue.sort((a, b) => (rank.get(a.id) || 0) - (rank.get(b.id) || 0));
      }
    });
  }

  topLevelThinkingNodes.forEach((node) => {
    if (!visited.has(node.id)) {
      rank.set(node.id, Math.max(rank.get(node.id) || 0, baseRank.get(node.id) || 0));
    }
  });

  const bounds = computeNodeBounds(topLevelThinkingNodes);
  if (!bounds) return nodes;
  const originX = bounds.minX;
  const originY = bounds.minY;

  const columns = new Map();
  topLevelThinkingNodes.forEach((node) => {
    const column = rank.get(node.id) || 0;
    const list = columns.get(column) || [];
    list.push(node);
    columns.set(column, list);
  });

  const nodeOrder = new Map(nodes.map((node, index) => [node.id, index]));

  const nextPositions = new Map();
  const sortedColumns = [...columns.entries()].sort((a, b) => a[0] - b[0]);
  sortedColumns.forEach(([column, list], sequentialIndex) => {
    const sorted = [...list].sort((a, b) => {
      const aNeighbors = incoming.get(a.id) || [];
      const bNeighbors = incoming.get(b.id) || [];
      const aHint =
        aNeighbors.reduce((sum, id) => sum + (nodeMap.get(id)?.position?.y ?? a.position?.y ?? 0), 0) /
          (aNeighbors.length || 1) || 0;
      const bHint =
        bNeighbors.reduce((sum, id) => sum + (nodeMap.get(id)?.position?.y ?? b.position?.y ?? 0), 0) /
          (bNeighbors.length || 1) || 0;
      if (aHint !== bHint) return aHint - bHint;

      const aParentKey = [...aNeighbors].sort().join(",");
      const bParentKey = [...bNeighbors].sort().join(",");
      if (aParentKey && aParentKey === bParentKey) {
        return (nodeOrder.get(a.id) ?? 0) - (nodeOrder.get(b.id) ?? 0);
      }

      return (a.position?.y ?? 0) - (b.position?.y ?? 0);
    });

    sorted.forEach((node, index) => {
      nextPositions.set(node.id, {
        x: originX + sequentialIndex * LAYOUT_COLUMN_GAP,
        y: originY + index * LAYOUT_ROW_GAP,
      });
    });
  });

  const fixedNodes = nodes.filter((node) => node?.type === "thinkingNode" && !nextPositions.has(node.id));
  const relaidTopLevelNodes = topLevelThinkingNodes.map((node) => ({
    ...node,
    position: nextPositions.get(node.id) ?? node.position,
  }));
  const resolvedTopLevelNodes = resolveIncomingNodeCollisions(fixedNodes, relaidTopLevelNodes, {
    preferVertical: false,
  });
  const resolvedPositions = new Map(resolvedTopLevelNodes.map((node) => [node.id, node.position]));

  return nodes.map((node) => {
    if (!resolvedPositions.has(node.id)) return node;
    return {
      ...node,
      position: resolvedPositions.get(node.id),
    };
  });
}

export function shiftClusterBelowAnchor(anchorNode, incomingNodes, allNodes = [], existingEdges = []) {
  const existing = Array.isArray(allNodes) ? allNodes : [];
  const incoming = Array.isArray(incomingNodes) ? incomingNodes : [];
  const anchorBounds = computeNodeBounds(anchorNode ? [anchorNode] : []);
  const incomingBounds = computeNodeBounds(incoming);
  if (!anchorBounds || !incomingBounds || !anchorNode) {
    return resolveIncomingNodeCollisions(existing, incoming, { preferVertical: true });
  }

  const anchorId = anchorNode.id;
  const stackNodes = [
    anchorNode,
    ...collectContinuationDescendants(anchorId, existing, existingEdges),
  ];
  const stackBounds = computeNodeBounds(stackNodes);
  const anchorCenterX = (anchorBounds.minX + anchorBounds.maxX) / 2;
  const incomingCenterX = (incomingBounds.minX + incomingBounds.maxX) / 2;
  const baseY = (stackBounds?.maxY ?? anchorBounds.maxY) + NODE_PORT_LAYOUT.continuationGapY;
  const deltaY = baseY - incomingBounds.minY;
  const fanStep = 280;

  const placed = incoming.map((node, index) => ({
    ...node,
    position: {
      x:
        (node.position?.x ?? 0) +
        (anchorCenterX - incomingCenterX) +
        (index - (incoming.length - 1) / 2) * fanStep,
      y: (node.position?.y ?? 0) + deltaY,
    },
  }));

  return resolveIncomingNodeCollisions(existing, placed, { preferVertical: true });
}

export function shiftClusterRelativeToAnchor(anchorNode, incomingNodes, preferredSide, allNodes = []) {
  const existing = Array.isArray(allNodes) ? allNodes : anchorNode ? [anchorNode] : [];
  const incoming = Array.isArray(incomingNodes) ? incomingNodes : [];
  const incomingBounds = computeNodeBounds(incoming);
  const anchorBounds = computeNodeBounds(anchorNode ? [anchorNode] : []);
  if (!incomingBounds || !anchorBounds || !anchorNode) {
    return resolveIncomingNodeCollisions(existing, incoming);
  }

  const clusterOrder = getClusterAverageOrder(incoming);
  const anchorOrder = getNodeOrderScore(anchorNode);
  const resolvedSide =
    preferredSide || (clusterOrder < anchorOrder ? "left" : "right");

  const incomingCenterY = (incomingBounds.minY + incomingBounds.maxY) / 2;
  const anchorCenterY = (anchorBounds.minY + anchorBounds.maxY) / 2;
  const deltaY = anchorCenterY - incomingCenterY;

  let deltaX = 0;
  if (resolvedSide === "left") {
    const desiredMaxX = anchorBounds.minX - CLUSTER_GAP_X;
    deltaX = desiredMaxX - incomingBounds.maxX;
  } else {
    const desiredMinX = anchorBounds.maxX + CLUSTER_GAP_X;
    deltaX = desiredMinX - incomingBounds.minX;
  }

  const placed = incoming.map((node) => ({
    ...node,
    position: {
      x: (node.position?.x ?? 0) + deltaX,
      y: (node.position?.y ?? 0) + deltaY,
    },
  }));

  const collisionTargets = existing.filter((node) => node?.id !== anchorNode.id);
  return resolveIncomingNodeCollisions(collisionTargets, placed);
}
