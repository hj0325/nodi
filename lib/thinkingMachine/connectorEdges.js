import {
  normalizeNodeCategory,
  normalizeNodePhase,
  normalizeRelationLabel,
} from "@/lib/thinkingMachine/nodeMeta";
import {
  getAlignmentVisualMeta,
  inferFallbackEdgeAlignment,
} from "@/lib/thinkingMachine/reasoningAlignment";

/** Initial hydrate: edges and nodes start together (delay 0). */
export const GRAPH_ENTRANCE_EDGE_DELAY_MS = 0;
/** draw-path duration (1100ms) + buffer */
export const GRAPH_ENTRANCE_ANIMATION_MS = 1300;
/** Delay before newly created nodes animate in. */
export const NEW_NODE_ENTRANCE_DELAY_S = 0.25;

export const SOURCE_HANDLE_ID = "right-source";
export const TARGET_HANDLE_ID = "left-target";
export const BOTTOM_SOURCE_HANDLE_ID = "bottom-source";
export const TOP_TARGET_HANDLE_ID = "top-target";

const FANOUT_STEP = 26;
const FANOUT_MAX = 104;

const EDGE_CLEARANCE_X = 20;
const EDGE_LINE_WIDTH = 1.65;
const EDGE_LINE_COLOR = "rgba(255, 255, 255, 0.68)";
const EDGE_LANE_GAP = 80;
const EDGE_CURVE_TENSION = 0.42;

export function getEdgeContinuationFlag(edge) {
  return Boolean(edge?.isContinuation ?? edge?.data?.isContinuation);
}

export function isVerticalConnectorEdge(edge) {
  if (
    edge?.sourceHandle === BOTTOM_SOURCE_HANDLE_ID ||
    edge?.targetHandle === TOP_TARGET_HANDLE_ID
  ) {
    return true;
  }
  return getEdgeContinuationFlag(edge);
}

function countExistingBySide(currentEdges) {
  const sourceCounts = new Map();
  const targetCounts = new Map();
  currentEdges.forEach((edge) => {
    sourceCounts.set(edge.source, (sourceCounts.get(edge.source) || 0) + 1);
    targetCounts.set(edge.target, (targetCounts.get(edge.target) || 0) + 1);
  });
  return { sourceCounts, targetCounts };
}

export function getNodeAbsolutePosition(node, nodeMap) {
  if (!node) return { x: 0, y: 0 };
  let x = Number.isFinite(node.position?.x) ? node.position.x : 0;
  let y = Number.isFinite(node.position?.y) ? node.position.y : 0;
  let current = node;
  const visited = new Set();
  while (current?.parentNode && !visited.has(current.parentNode)) {
    visited.add(current.parentNode);
    const parent = nodeMap.get(current.parentNode);
    if (!parent) break;
    x += Number.isFinite(parent.position?.x) ? parent.position.x : 0;
    y += Number.isFinite(parent.position?.y) ? parent.position.y : 0;
    current = parent;
  }
  return { x, y };
}

function getNodeY(node, nodeMap) {
  return getNodeAbsolutePosition(node, nodeMap).y;
}

function getNodeCenterX(node, nodeMap) {
  const abs = getNodeAbsolutePosition(node, nodeMap);
  const w = node?.style?.width;
  return Number.isFinite(w) ? abs.x + Number(w) / 2 : abs.x;
}

function computeFanoutOffset(slot, total) {
  if (!Number.isFinite(slot) || !Number.isFinite(total) || total <= 1) return 0;
  const center = (total - 1) / 2;
  const raw = (slot - center) * FANOUT_STEP;
  return Math.max(-FANOUT_MAX, Math.min(FANOUT_MAX, raw));
}

function assignSideMeta(normalizedEdges, nodeMap, currentEdges) {
  const { sourceCounts, targetCounts } = countExistingBySide(currentEdges);
  const sourceMeta = new Map();
  const targetMeta = new Map();

  const sourceGroups = new Map();
  const targetGroups = new Map();

  normalizedEdges.forEach((edge) => {
    const s = sourceGroups.get(edge.source) || [];
    s.push(edge);
    sourceGroups.set(edge.source, s);

    const t = targetGroups.get(edge.target) || [];
    t.push(edge);
    targetGroups.set(edge.target, t);
  });

  sourceGroups.forEach((list, nodeId) => {
    const base = sourceCounts.get(nodeId) || 0;
    const sorted = [...list].sort((a, b) => {
      const ay = getNodeY(nodeMap.get(a.target), nodeMap);
      const by = getNodeY(nodeMap.get(b.target), nodeMap);
      if (ay === by) return String(a.id).localeCompare(String(b.id));
      return ay - by;
    });
    const total = base + sorted.length;
    sorted.forEach((edge, idx) => {
      sourceMeta.set(edge.id, { slot: base + idx, total });
    });
  });

  targetGroups.forEach((list, nodeId) => {
    const base = targetCounts.get(nodeId) || 0;
    const sorted = [...list].sort((a, b) => {
      const ay = getNodeY(nodeMap.get(a.source), nodeMap);
      const by = getNodeY(nodeMap.get(b.source), nodeMap);
      if (ay === by) return String(a.id).localeCompare(String(b.id));
      return ay - by;
    });
    const total = base + sorted.length;
    sorted.forEach((edge, idx) => {
      targetMeta.set(edge.id, { slot: base + idx, total });
    });
  });

  return { sourceMeta, targetMeta };
}

function buildNodeCategoryMap(nodeList) {
  const map = new Map();
  nodeList.forEach((node) => {
    if (!node?.id) return;
    const category = node?.data?.category;
    if (typeof category === "string" && category) {
      map.set(node.id, normalizeNodeCategory(category));
    }
  });
  return map;
}

function buildNodeMap(nodeList) {
  const map = new Map();
  nodeList.forEach((node) => {
    if (node?.id) map.set(node.id, node);
  });
  return map;
}

function buildOffMeetingMap(nodeList, edgeList = []) {
  const map = new Map();
  const nodeMap = buildNodeMap(nodeList);
  nodeList.forEach((node) => {
    if (node?.data?.isOffMeeting) map.set(node.id, true);
  });
  edgeList.forEach((edge) => {
    if (getEdgeContinuationFlag(edge) && edge?.target) {
      const targetNode = nodeMap.get(edge.target);
      if (targetNode?.data?.isOffMeeting !== false) {
        map.set(edge.target, true);
      }
    }
  });
  let changed = true;
  while (changed) {
    changed = false;
    edgeList.forEach((edge) => {
      if (isVerticalConnectorEdge(edge)) return;
      if (map.get(edge.source) && edge?.target && !map.get(edge.target)) {
        const targetNode = nodeMap.get(edge.target);
        if (targetNode?.data?.isOffMeeting !== false) {
          map.set(edge.target, true);
          changed = true;
        }
      }
    });
  }
  return map;
}

function getNodeX(node, nodeMap) {
  return getNodeCenterX(node, nodeMap);
}

function shouldUseVerticalHandles(edge, sourceNode, targetNode, nodeMap, sourceIsOffMeeting, targetIsOffMeeting) {
  const sourceAbs = getNodeAbsolutePosition(sourceNode, nodeMap);
  const targetAbs = getNodeAbsolutePosition(targetNode, nodeMap);
  const dy = targetAbs.y - sourceAbs.y;
  if (dy <= 40) return false;

  if (getEdgeContinuationFlag(edge)) return true;

  if (sourceIsOffMeeting && targetIsOffMeeting) {
    return true;
  }

  return false;
}

function normalizeEdgeDirection(edge, nodeMap) {
  const sourceNode = nodeMap.get(edge.source);
  const targetNode = nodeMap.get(edge.target);
  if (!sourceNode || !targetNode) return edge;

  const sourceY = getNodeY(sourceNode, nodeMap);
  const targetY = getNodeY(targetNode, nodeMap);
  const sourceIsOffMeeting = Boolean(sourceNode?.data?.isOffMeeting);
  const targetIsOffMeeting = Boolean(targetNode?.data?.isOffMeeting);

  if (getEdgeContinuationFlag(edge) && targetY > sourceY + 40) {
    return edge;
  }

  if (sourceIsOffMeeting && targetIsOffMeeting && targetY > sourceY + 40) {
    return edge;
  }

  const sourcePhase = normalizeNodePhase(sourceNode?.data?.phase, sourceNode?.data?.category);
  const targetPhase = normalizeNodePhase(targetNode?.data?.phase, targetNode?.data?.category);
  const sourceX = getNodeX(sourceNode, nodeMap);
  const targetX = getNodeX(targetNode, nodeMap);

  let shouldSwap = false;

  // Problem -> Solution 흐름을 우선 적용
  if (sourcePhase === "Solution" && targetPhase === "Problem") {
    shouldSwap = true;
  } else if (sourceX > targetX) {
    // 좌->우 시각 흐름 유지 (동일 phase 포함)
    shouldSwap = true;
  }

  if (!shouldSwap) return edge;
  return {
    ...edge,
    source: edge.target,
    target: edge.source,
  };
}

function resolveConnectorEdge(edge, nodeMap, offMeetingMap, categoryMap, sourceMeta, targetMeta) {
  const normalizedEdge = normalizeEdgeDirection(edge, nodeMap);
  const sourceNode = nodeMap.get(normalizedEdge.source);
  const targetNode = nodeMap.get(normalizedEdge.target);
  const sourceIsOffMeeting = Boolean(
    offMeetingMap.get(normalizedEdge.source) || sourceNode?.data?.isOffMeeting
  );
  const targetIsOffMeeting = Boolean(
    offMeetingMap.get(normalizedEdge.target) || targetNode?.data?.isOffMeeting
  );
  const useVerticalHandles = shouldUseVerticalHandles(
    normalizedEdge,
    sourceNode,
    targetNode,
    nodeMap,
    sourceIsOffMeeting,
    targetIsOffMeeting
  );
  const sourceHandle = useVerticalHandles && sourceIsOffMeeting
    ? BOTTOM_SOURCE_HANDLE_ID
    : SOURCE_HANDLE_ID;
  const targetHandle = useVerticalHandles && targetIsOffMeeting
    ? TOP_TARGET_HANDLE_ID
    : TARGET_HANDLE_ID;
  const source = sourceMeta?.get(normalizedEdge.id) || { slot: 0, total: 1 };
  const target = targetMeta?.get(normalizedEdge.id) || { slot: 0, total: 1 };

  return {
    ...edge,
    id: normalizedEdge.id,
    source: normalizedEdge.source,
    target: normalizedEdge.target,
    label: normalizeRelationLabel(normalizedEdge.label ?? edge.label),
    type: edge.type || "connectorEdge",
    animated: false,
    sourceHandle,
    targetHandle,
    data: {
      ...(edge.data || {}),
      label: normalizeRelationLabel(normalizedEdge.label ?? edge.label ?? edge.data?.label),
      sourceCategory: categoryMap.get(normalizedEdge.source) || edge.data?.sourceCategory || "Idea",
      targetCategory: categoryMap.get(normalizedEdge.target) || edge.data?.targetCategory || "Idea",
      sourceOffsetY: computeFanoutOffset(source.slot, source.total),
      targetOffsetY: computeFanoutOffset(target.slot, target.total),
      clearanceX: EDGE_CLEARANCE_X,
      lineWidth: EDGE_LINE_WIDTH,
      lineColor: EDGE_LINE_COLOR,
      laneGap: EDGE_LANE_GAP,
      curveTension: EDGE_CURVE_TENSION,
      isContinuation: getEdgeContinuationFlag(normalizedEdge),
      sourceIsOffMeeting,
      targetIsOffMeeting,
    },
  };
}

export function toConnectorEdges(rawEdges, nodeList, currentEdges = []) {
  const categoryMap = buildNodeCategoryMap(nodeList);
  const nodeMap = buildNodeMap(nodeList);
  const normalizedEdges = rawEdges.map((edge) => normalizeEdgeDirection(edge, nodeMap));
  const { sourceMeta, targetMeta } = assignSideMeta(normalizedEdges, nodeMap, currentEdges);
  const allEdges = [...currentEdges, ...normalizedEdges];
  const offMeetingMap = buildOffMeetingMap(nodeList, allEdges);

  return normalizedEdges.map((normalizedEdge) =>
    resolveConnectorEdge(normalizedEdge, nodeMap, offMeetingMap, categoryMap, sourceMeta, targetMeta)
  );
}

export function decorateConnectorEdges(edges = [], alignmentAnalysis = null, nodeList = []) {
  const nodeMap = buildNodeMap(nodeList);
  const offMeetingMap = buildOffMeetingMap(nodeList, edges);
  const categoryMap = buildNodeCategoryMap(nodeList);
  const normalizedEdges = (Array.isArray(edges) ? edges : []).map((edge) => normalizeEdgeDirection(edge, nodeMap));
  const { sourceMeta, targetMeta } = assignSideMeta(normalizedEdges, nodeMap, edges);

  return (Array.isArray(edges) ? edges : []).map((edge) => {
    const resolved = resolveConnectorEdge(edge, nodeMap, offMeetingMap, categoryMap, sourceMeta, targetMeta);
    const alignment =
      alignmentAnalysis?.edgeStatesById?.[edge?.id] ||
      inferFallbackEdgeAlignment(edge);
    const visualMeta = getAlignmentVisualMeta(alignment?.state);

    return {
      ...resolved,
      data: {
        ...(resolved.data || {}),
        alignmentState: alignment?.state || "unresolved",
        alignmentScore: alignment?.score ?? 0,
        alignmentLabel: alignment?.displayLabel || visualMeta.label,
        alignmentReason: alignment?.summary || "",
        alignmentStroke: visualMeta.stroke,
        alignmentLabelBackground: visualMeta.labelBackground,
        alignmentLineDash:
          resolved.data?.isContinuation ||
          offMeetingMap.get(resolved.source) ||
          offMeetingMap.get(resolved.target)
            ? "5 5"
            : visualMeta.lineDash || undefined,
      },
    };
  });
}
