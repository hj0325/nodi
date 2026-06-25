import {
  getSourceTypeMeta,
  getTypeMeta,
  getVisibilityCardMeta,
  getVisibilityMeta,
  normalizeNodeData,
  normalizeNodeCategory,
} from "@/lib/thinkingMachine/nodeMeta";

export const NODE_CARD_TOKENS = {
  width: 257,
  minHeight: 195.76,
  radius: "22px",
  imageRadius: "16px",
  borderWidth: "1px",
  paddingX: "12px",
  paddingTop: "12px",
  paddingBottom: "11px",
  contentGap: "8px",
  chipFontSize: "10px",
  chipPaddingX: "8px",
  chipPaddingY: "5px",
  metaFontSize: "9px",
  metaPaddingX: "7px",
  metaPaddingY: "4px",
  titleFontSize: "13px",
  bodyFontSize: "11px",
};

export function extractNodeImageUrl(rawData) {
  if (!rawData) return "";
  if (typeof rawData.imageUrl === "string" && rawData.imageUrl.trim()) {
    return rawData.imageUrl.trim();
  }
  if (typeof rawData.image_url === "string" && rawData.image_url.trim()) {
    return rawData.image_url.trim();
  }
  return "";
}

const FIVE_WH_LABELS = {
  Who: "Who",
  What: "What",
  When: "When",
  Where: "Where",
  Why: "Why",
  How: "How",
};

const LEGACY_5WH = new Set(["Who", "What", "When", "Where", "Why", "How"]);

function getFiveWhLabel(category, legacyCategory) {
  if (legacyCategory && LEGACY_5WH.has(legacyCategory)) return legacyCategory;
  const normalized = normalizeNodeCategory(category);
  return FIVE_WH_LABELS[normalized] || "How";
}

// ReactFlow node renderer expects `data.label` to be renderable content (JSX).
// Since we are using a custom React component (ThinkingNode) for rendering the node,
// we don't need to build a complex JSX structure in reactflowTransforms.js.
// However, ReactFlow might still render data.label if the custom component doesn't override it,
// but our custom ThinkingNode component completely ignores `data.label` and draws everything from scratch using `data`.
// To keep things compatible and lightweight, we can return a simple placeholder or the title.
export function buildNodeLabel(nodeData) {
  return nodeData.title || "Untitled node";
}

export function buildNodeStyle(nodeData) {
  return {
    background: "transparent",
    border: "none",
    borderRadius: "12px",
    padding: "0",
    width: NODE_CARD_TOKENS.width,
    minHeight: NODE_CARD_TOKENS.minHeight,
    display: "flex",
    flexDirection: "column",
    overflow: "visible",
    boxShadow: "none",
    zIndex: 20,
  };
}

export function toReactFlowNode(n, highlightedId) {
  const normalizedData = normalizeNodeData(n.data);
  const nodeData = {
    title: n.data.label || n.data.title || "",
    content: n.data.content,
    phase: normalizedData.phase,
    category: normalizedData.category,
    ownerId: normalizedData.ownerId,
    editedBy: normalizedData.editedBy,
    sourceType: normalizedData.sourceType,
    visibility: normalizedData.visibility,
    confidence: normalizedData.confidence,
    legacyCategory:
      typeof n.data?.category === "string" && n.data.category !== normalizedData.category
        ? n.data.category
        : null,
    imageUrl: extractNodeImageUrl(n.data),
    layerOrigin: normalizedData.layerOrigin,
    promotedFromVisibility: normalizedData.promotedFromVisibility,
    promotedAt: normalizedData.promotedAt,
    promotedBy: normalizedData.promotedBy,
    conflictState: normalizedData.conflictState,
    conflictSummary: normalizedData.conflictSummary,
    conflictLinkedNodeIds: normalizedData.conflictLinkedNodeIds,
    conflictUpdatedAt: normalizedData.conflictUpdatedAt,
    is_ai_suggestion: false,
  };
  const rfNode = {
    id: n.id,
    type: "thinkingNode",
    position: n.position,
    className: `tm-node-shell ${n.id === highlightedId ? "node-highlighted" : ""}`.trim(),
    data: { ...nodeData },
    style: buildNodeStyle(nodeData),
  };
  // ReactFlow node renderer expects `data.label` to be renderable content (JSX).
  // Keep the raw text in `data.content` for AI + exports.
  rfNode.data.label = buildNodeLabel(nodeData);
  return rfNode;
}
