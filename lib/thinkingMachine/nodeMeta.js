export const REASONING_NODE_TYPES = [
  "Who",
  "When",
  "Where",
  "What",
  "Why",
  "How",
  "Problem",
];

export const NODE_SOURCE_TYPES = ["user", "agent", "mixed", "context"];
export const NODE_VISIBILITY_STATES = ["private", "candidate", "shared", "reviewed", "agreed"];
export const NODE_VISIBILITY_FLOW = ["private", "candidate", "shared", "reviewed", "agreed"];
export const NODE_CONFIDENCE_LEVELS = ["low", "medium", "high"];
export const NODE_LAYER_ORIGINS = ["personal", "team"];
export const NODE_CONFLICT_STATES = ["none", "tension", "contradictory"];
export const NODE_PHASES = ["Idea", "Research", "Solution", "Decision", "Action"];
export const SUGGESTION_REASONING_TAGS = ["Insight", "Problem", "Constraint", "Decision", "Idea", "Action", "Risk", "Reference"];
export const SUGGESTION_LENS_TAGS = ["User", "Team", "AI", "Brand", "Market", "Product", "Space", "Operation"];
export const SUGGESTION_QUESTION_TAGS = ["Why", "What", "How", "When", "Where", "Who"];
export const COLLABORATION_ROLES = ["owner", "editor", "viewer"];
export const REASONING_FOCUS_VALUES = ["research", "design"];
export const REASONING_BREADTH_VALUES = ["diverge", "converge"];
export const REASONING_STAGE_VALUES = [
  "Idea",
  "Research",
  "Solution",
  "Decision",
  "Action",
];
export const RELATION_LABELS = [
  "supports",
  "contradicts",
  "causes",
  "refines",
  "depends_on",
  "proposes",
  "blocks",
];

export const LEGACY_CATEGORY_MAP = {
  Who: "Who",
  When: "When",
  Where: "Where",
  What: "What",
  Why: "Why",
  How: "How",
};

export const REASONING_TYPE_META = {
  Who: {
    color: "#F5C96A",
    tint: "bg-amber-50",
    bg: "bg-amber-50",
    header: "bg-amber-100/60",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-400",
    accent: "#F5C96A",
  },
  When: {
    color: "#60A5FA",
    tint: "bg-sky-50",
    bg: "bg-sky-50",
    header: "bg-sky-100/60",
    border: "border-sky-200",
    text: "text-sky-700",
    dot: "bg-sky-400",
    accent: "#60A5FA",
  },
  Where: {
    color: "#CBD5E1",
    tint: "bg-slate-50",
    bg: "bg-slate-50",
    header: "bg-slate-100/60",
    border: "border-slate-200",
    text: "text-slate-700",
    dot: "bg-slate-400",
    accent: "#CBD5E1",
  },
  What: {
    color: "#6EE7B7",
    tint: "bg-emerald-50",
    bg: "bg-emerald-50",
    header: "bg-emerald-100/60",
    border: "border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
    accent: "#6EE7B7",
  },
  Why: {
    color: "#F59E8B",
    tint: "bg-rose-50",
    bg: "bg-rose-50",
    header: "bg-rose-100/60",
    border: "border-rose-200",
    text: "text-rose-700",
    dot: "bg-rose-400",
    accent: "#F59E8B",
  },
  How: {
    color: "#A78BFA",
    tint: "bg-violet-50",
    bg: "bg-violet-50",
    header: "bg-violet-100/60",
    border: "border-violet-200",
    text: "text-violet-700",
    dot: "bg-violet-400",
    accent: "#A78BFA",
  },
  Problem: {
    color: "#F59E8B",
    tint: "bg-rose-50",
    bg: "bg-rose-50",
    header: "bg-rose-100/60",
    border: "border-rose-200",
    text: "text-rose-700",
    dot: "bg-rose-400",
    accent: "#F59E8B",
  },
};

export const VISIBILITY_META = {
  private: { label: "Private", className: "bg-slate-100 text-slate-600" },
  candidate: { label: "Candidate", className: "bg-amber-100 text-amber-700" },
  shared: { label: "Shared", className: "bg-sky-100 text-sky-700" },
  reviewed: { label: "Reviewed", className: "bg-violet-100 text-violet-700" },
  agreed: { label: "Agreed", className: "bg-emerald-100 text-emerald-700" },
};

export const VISIBILITY_CARD_META = {
  private: {
    borderColor: "rgba(148, 163, 184, 0.42)",
    boxShadow: "0 10px 24px -18px rgba(15, 23, 42, 0.18), 0 1px 0 rgba(255,255,255,0.72) inset",
    background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.92) 100%)",
  },
  candidate: {
    borderColor: "rgba(245, 158, 11, 0.34)",
    boxShadow: "0 10px 24px -18px rgba(245, 158, 11, 0.22), 0 1px 0 rgba(255,255,255,0.78) inset",
    background: "linear-gradient(180deg, rgba(255,251,235,0.96) 0%, rgba(255,255,255,0.93) 100%)",
  },
  shared: {
    borderColor: "rgba(56, 189, 248, 0.34)",
    boxShadow: "0 10px 24px -18px rgba(56, 189, 248, 0.18), 0 1px 0 rgba(255,255,255,0.78) inset",
    background: "linear-gradient(180deg, rgba(240,249,255,0.96) 0%, rgba(255,255,255,0.93) 100%)",
  },
  reviewed: {
    borderColor: "rgba(167, 139, 250, 0.34)",
    boxShadow: "0 10px 24px -18px rgba(167, 139, 250, 0.18), 0 1px 0 rgba(255,255,255,0.78) inset",
    background: "linear-gradient(180deg, rgba(245,243,255,0.96) 0%, rgba(255,255,255,0.93) 100%)",
  },
  agreed: {
    borderColor: "rgba(52, 211, 153, 0.36)",
    boxShadow: "0 10px 24px -18px rgba(52, 211, 153, 0.2), 0 1px 0 rgba(255,255,255,0.8) inset",
    background: "linear-gradient(180deg, rgba(236,253,245,0.97) 0%, rgba(255,255,255,0.93) 100%)",
  },
};

export const CONFIDENCE_META = {
  low: { label: "Low confidence", className: "bg-rose-100 text-rose-700" },
  medium: { label: "Medium confidence", className: "bg-amber-100 text-amber-700" },
  high: { label: "High confidence", className: "bg-emerald-100 text-emerald-700" },
};

export const CONFLICT_STATE_META = {
  none: {
    label: "No conflict",
    className: "bg-slate-100 text-slate-500",
    accentClassName: "text-slate-400",
  },
  tension: {
    label: "Tension",
    className: "bg-amber-100 text-amber-700",
    accentClassName: "text-amber-500",
  },
  contradictory: {
    label: "Contradictory",
    className: "bg-rose-100 text-rose-700",
    accentClassName: "text-rose-500",
  },
};

export const SOURCE_TYPE_META = {
  user: { label: "User", className: "bg-[#426099] text-white" },
  agent: { label: "Agent", className: "bg-indigo-100 text-indigo-700" },
  mixed: { label: "Mixed", className: "bg-fuchsia-100 text-fuchsia-700" },
  context: { label: "Context", className: "bg-fuchsia-100 text-fuchsia-700" },
};

export const ROLE_META = {
  owner: { label: "Owner", className: "bg-slate-900 text-white" },
  editor: { label: "Editor", className: "bg-sky-100 text-sky-700" },
  viewer: { label: "Viewer", className: "bg-slate-100 text-slate-600" },
};

export const SUGGESTION_TAG_META = {
  reasoning: {
    Insight: { className: "bg-[#CEFBB4] text-[#4F4F4F]" },
    Problem: { className: "bg-[#CEFBB4] text-[#4F4F4F]" },
    Constraint: { className: "bg-[#CEFBB4] text-[#4F4F4F]" },
    Decision: { className: "bg-[#CEFBB4] text-[#4F4F4F]" },
    Idea: { className: "bg-[#CEFBB4] text-[#4F4F4F]" },
    Action: { className: "bg-[#CEFBB4] text-[#4F4F4F]" },
    Risk: { className: "bg-[#CEFBB4] text-[#4F4F4F]" },
    Reference: { className: "bg-[#CEFBB4] text-[#4F4F4F]" },
  },
  lens: {
    User: { className: "bg-[#B9CDFA] text-[#4F4F4F]" },
    Team: { className: "bg-[#B9CDFA] text-[#4F4F4F]" },
    AI: { className: "bg-[#B9CDFA] text-[#4F4F4F]" },
    Brand: { className: "bg-[#B9CDFA] text-[#4F4F4F]" },
    Market: { className: "bg-[#B9CDFA] text-[#4F4F4F]" },
    Product: { className: "bg-[#B9CDFA] text-[#4F4F4F]" },
    Space: { className: "bg-[#B9CDFA] text-[#4F4F4F]" },
    Operation: { className: "bg-[#B9CDFA] text-[#4F4F4F]" },
  },
  question: {
    Why: { className: "bg-[#9FE8F4] text-[#4F4F4F]" },
    What: { className: "bg-[#9FE8F4] text-[#4F4F4F]" },
    How: { className: "bg-[#9FE8F4] text-[#4F4F4F]" },
    When: { className: "bg-[#9FE8F4] text-[#4F4F4F]" },
    Where: { className: "bg-[#9FE8F4] text-[#4F4F4F]" },
    Who: { className: "bg-[#9FE8F4] text-[#4F4F4F]" },
  },
};

export const REASONING_MODE_PROFILES = {
  "Idea": {
    focus: "Idea",
    breadth: "diverge",
    label: "1단계 - 아이디어 (Idea)",
    nodeBias: ["What", "Why"],
    composerPlaceholder: "자유롭게 아이디어를 논의해 보세요.",
    composerHint: "이 단계에서는 자유롭게 생각을 공유하고 발언합니다.",
    candidateHint: "브레인스토밍 아이디어 후보군을 표시합니다.",
    selectedNodePrompt: "이 아이디어를 좀 더 구체화해 보세요.",
    selectedNodeActions: ["What", "Why"],
  },
  "Research": {
    focus: "Research",
    breadth: "diverge",
    label: "2단계 - 리서치 (Research)",
    nodeBias: ["Why", "When", "Where"],
    composerPlaceholder: "필요한 정보나 리서치 내용을 공유해 주세요.",
    composerHint: "이 단계에서는 근거나 데이터, 현황 리서치를 진행합니다.",
    candidateHint: "수집된 리서치 자료와 분석 내용을 노드로 연결합니다.",
    selectedNodePrompt: "리서치 내용과 관련된 사실을 검증하세요.",
    selectedNodeActions: ["Why", "When", "Where"],
  },
  "Solution": {
    focus: "Solution",
    breadth: "diverge",
    label: "3단계 - 솔루션 (Solution)",
    nodeBias: ["How", "What"],
    composerPlaceholder: "구체적인 솔루션이나 제안을 제안해 주세요.",
    composerHint: "아이디어를 어떻게 구현할 것인지 구체적인 대안을 세웁니다.",
    candidateHint: "기획/디자인/개발 관점의 다양한 솔루션을 도출합니다.",
    selectedNodePrompt: "이 솔루션의 구현 방안이나 디자인 방향을 도출하세요.",
    selectedNodeActions: ["How", "What"],
  },
  "Decision": {
    focus: "Decision",
    breadth: "converge",
    label: "4단계 - 결정 (Decision)",
    nodeBias: ["How", "Why", "What"],
    composerPlaceholder: "의결사항이나 합의된 결정 내용을 입력하세요.",
    composerHint: "도출한 솔루션 중 어떤 안을 선택하고 합의할지 논의합니다.",
    candidateHint: "최종적으로 합의 및 선택된 노드들입니다.",
    selectedNodePrompt: "결정의 구체적인 내용과 근거를 기록하세요.",
    selectedNodeActions: ["How", "Why"],
  },
  "Action": {
    focus: "Action",
    breadth: "converge",
    label: "5단계 - 실행 (Action)",
    nodeBias: ["Who", "When", "How", "Where"],
    composerPlaceholder: "담당자 및 구체적인 실행 계획을 논의하세요.",
    composerHint: "결정된 사항을 누가, 언제, 어떻게 실행할지 계획을 세웁니다.",
    candidateHint: "향후 액션 아이템 노드들입니다.",
    selectedNodePrompt: "실행 항목에 대한 담당자와 일정을 구체화하세요.",
    selectedNodeActions: ["Who", "When", "How", "Where"],
  },
};

export function normalizeNodeCategory(value) {
  if (typeof value !== "string" || !value.trim()) return "What";
  const trimmed = value.trim();
  const direct = REASONING_NODE_TYPES.find((item) => item === trimmed);
  if (direct) return direct;
  const legacy = LEGACY_CATEGORY_MAP[trimmed];
  if (legacy) return legacy;
  const lowered = trimmed.toLowerCase();
  const found = REASONING_NODE_TYPES.find((item) => item.toLowerCase() === lowered);
  return found || "What";
}

export function normalizeReasoningStage(value) {
  if (typeof value !== "string") return "Idea";
  const trimmed = value.trim();
  const found = REASONING_STAGE_VALUES.find((item) => item.toLowerCase() === trimmed.toLowerCase());
  return found || "Idea";
}

export function parseReasoningStage(value) {
  const stage = normalizeReasoningStage(value);
  return { stage, focus: stage, breadth: "converge" };
}

export function getReasoningModeProfile(value) {
  const stage = normalizeReasoningStage(value);
  return REASONING_MODE_PROFILES[stage] || REASONING_MODE_PROFILES["Idea"];
}

export function inferPhaseFromCategory(category) {
  return "Idea";
}

export function normalizeNodePhase(value, category) {
  if (typeof value === "string") {
    const direct = NODE_PHASES.find((item) => item.toLowerCase() === value.trim().toLowerCase());
    if (direct) return direct;
  }
  return inferPhaseFromCategory(category);
}

export function normalizeSourceType(value) {
  if (typeof value !== "string") return "mixed";
  return NODE_SOURCE_TYPES.find((item) => item === value.trim().toLowerCase()) || "mixed";
}

export function normalizeVisibility(value) {
  if (typeof value !== "string") return "shared";
  return NODE_VISIBILITY_STATES.find((item) => item === value.trim().toLowerCase()) || "shared";
}

export function inferLayerOriginFromVisibility(value) {
  const normalizedVisibility = normalizeVisibility(value);
  return ["shared", "reviewed", "agreed"].includes(normalizedVisibility) ? "team" : "personal";
}

export function normalizeLayerOrigin(value, fallbackVisibility = "private") {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    const found = NODE_LAYER_ORIGINS.find((item) => item === normalized);
    if (found) return found;
  }
  return inferLayerOriginFromVisibility(fallbackVisibility);
}

export function getVisibilityIndex(value) {
  return NODE_VISIBILITY_FLOW.indexOf(normalizeVisibility(value));
}

export function getNextVisibility(value) {
  const index = getVisibilityIndex(value);
  return NODE_VISIBILITY_FLOW[Math.min(index + 1, NODE_VISIBILITY_FLOW.length - 1)];
}

export function getPreviousVisibility(value) {
  const index = getVisibilityIndex(value);
  return NODE_VISIBILITY_FLOW[Math.max(index - 1, 0)];
}

export function normalizeConfidence(value) {
  if (typeof value !== "string") return "medium";
  return NODE_CONFIDENCE_LEVELS.find((item) => item === value.trim().toLowerCase()) || "medium";
}

export function normalizeConflictState(value) {
  if (typeof value !== "string") return "none";
  const normalized = value.trim().toLowerCase();
  return NODE_CONFLICT_STATES.find((item) => item === normalized) || "none";
}

export function normalizeRelationLabel(value) {
  if (typeof value !== "string" || !value.trim()) return "refines";
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "_");
  return RELATION_LABELS.find((item) => item === normalized) || "refines";
}

export function normalizeRole(value) {
  if (typeof value !== "string") return "owner";
  return COLLABORATION_ROLES.find((item) => item === value.trim().toLowerCase()) || "owner";
}

export function normalizeOwnerId(value) {
  if (typeof value !== "string" || !value.trim()) return "mock-user-1";
  return value.trim();
}

export function normalizeEditedBy(value) {
  if (typeof value !== "string" || !value.trim()) return "You";
  return value.trim();
}

function normalizeSuggestionEnum(value, allowed, fallback) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  const direct = allowed.find((item) => item === trimmed);
  if (direct) return direct;
  const lowered = trimmed.toLowerCase();
  const found = allowed.find((item) => item.toLowerCase() === lowered);
  return found || fallback;
}

function inferSuggestionReasoning(category) {
  const normalized = normalizeNodeCategory(category);
  if (normalized === "Evidence") return "Reference";
  if (normalized === "Option" || normalized === "Goal") return "Action";
  if (normalized === "Conflict") return "Risk";
  if (normalized === "Assumption" || normalized === "OpenQuestion") return "Insight";
  if (SUGGESTION_REASONING_TAGS.includes(normalized)) return normalized;
  return "Idea";
}

function inferSuggestionLens({ sourceType, title, content } = {}) {
  const text = `${title || ""} ${content || ""}`.toLowerCase();
  if (/\b(ai|agent|model|automation|automated|llm)\b/.test(text)) return "AI";
  if (/\b(team|internal|stakeholder|collaboration|collaborative)\b/.test(text)) return "Team";
  if (/\b(brand|identity|tone|campaign|message)\b/.test(text)) return "Brand";
  if (/\b(market|competitor|industry|segment|trend|demand)\b/.test(text)) return "Market";
  if (/\b(product|feature|service|platform|app|experience|ux|ui)\b/.test(text)) return "Product";
  if (/\b(space|store|place|environment|layout|plaza|location)\b/.test(text)) return "Space";
  if (/\b(operation|operations|process|workflow|staff|logistics|execution)\b/.test(text)) return "Operation";
  if (normalizeSourceType(sourceType) === "user") return "User";
  if (normalizeSourceType(sourceType) === "agent") return "AI";
  return "Team";
}

function inferSuggestionQuestion({ category, title, content, phase } = {}) {
  const text = `${title || ""} ${content || ""}`.toLowerCase();
  if (/\bwhen|timeline|deadline|schedule|sequence|launch\b/.test(text)) return "When";
  if (/\bwhere|location|space|place|environment|store\b/.test(text)) return "Where";
  if (/\bwho|user|customer|audience|stakeholder|team\b/.test(text)) return "Who";
  if (/\bhow|approach|process|flow|execute|implementation|deliver\b/.test(text)) return "How";
  if (/\bwhy|reason|because|motivation|pain|problem|need\b/.test(text)) return "Why";
  const normalizedCategory = normalizeNodeCategory(category);
  if (normalizedCategory === "Problem" || normalizedCategory === "Insight" || normalizedCategory === "Assumption") return "Why";
  if (normalizedCategory === "Constraint" || normalizedCategory === "Risk" || normalizedCategory === "Evidence") return "What";
  if (normalizedCategory === "Idea" || normalizedCategory === "Option" || normalizedCategory === "Decision" || normalizeNodePhase(phase, normalizedCategory) === "Solution") {
    return "How";
  }
  return "What";
}

export function normalizeSuggestionTags(tags = {}, fallback = {}) {
  return {
    reasoning: normalizeSuggestionEnum(
      tags?.reasoning || tags?.category || tags?.type,
      SUGGESTION_REASONING_TAGS,
      inferSuggestionReasoning(fallback?.category || tags?.reasoning)
    ),
    lens: normalizeSuggestionEnum(
      tags?.lens || tags?.perspective || tags?.actor,
      SUGGESTION_LENS_TAGS,
      inferSuggestionLens(fallback)
    ),
    question: normalizeSuggestionEnum(
      tags?.question || tags?.prompt || tags?.dimension,
      SUGGESTION_QUESTION_TAGS,
      inferSuggestionQuestion(fallback)
    ),
  };
}

export function getSuggestionTagMeta(axis, value) {
  const fallbackValue = axis === "reasoning" ? "Idea" : axis === "lens" ? "Team" : "What";
  const normalized = normalizeSuggestionEnum(
    value,
    axis === "reasoning" ? SUGGESTION_REASONING_TAGS : axis === "lens" ? SUGGESTION_LENS_TAGS : SUGGESTION_QUESTION_TAGS,
    fallbackValue
  );
  return SUGGESTION_TAG_META?.[axis]?.[normalized] || { className: "bg-slate-100 text-slate-700" };
}

export function getTypeMeta(category) {
  const normalized = normalizeNodeCategory(category);
  return REASONING_TYPE_META[normalized] || REASONING_TYPE_META.Idea;
}

export function getVisibilityMeta(value) {
  return VISIBILITY_META[normalizeVisibility(value)];
}

export function getVisibilityCardMeta(value) {
  return VISIBILITY_CARD_META[normalizeVisibility(value)];
}

export function getConfidenceMeta(value) {
  return CONFIDENCE_META[normalizeConfidence(value)];
}

export function getConflictStateMeta(value) {
  return CONFLICT_STATE_META[normalizeConflictState(value)];
}

export function getSourceTypeMeta(value) {
  return SOURCE_TYPE_META[normalizeSourceType(value)];
}

export function getRoleMeta(value) {
  return ROLE_META[normalizeRole(value)];
}

export function normalizeNodeData(data = {}) {
  const category = normalizeNodeCategory(data.category);
  const visibility = normalizeVisibility(data.visibility);
  return {
    ...data,
    category,
    phase: normalizeNodePhase(data.phase, category),
    sourceType: normalizeSourceType(data.sourceType),
    visibility,
    confidence: normalizeConfidence(data.confidence),
    ownerId: normalizeOwnerId(data.ownerId),
    editedBy: normalizeEditedBy(data.editedBy),
    layerOrigin: normalizeLayerOrigin(data.layerOrigin, visibility),
    promotedFromVisibility:
      typeof data.promotedFromVisibility === "string" && data.promotedFromVisibility.trim()
        ? normalizeVisibility(data.promotedFromVisibility)
        : "",
    promotedAt: typeof data.promotedAt === "string" ? data.promotedAt : "",
    promotedBy: typeof data.promotedBy === "string" ? data.promotedBy.trim() : "",
    conflictState: normalizeConflictState(data.conflictState),
    conflictSummary: typeof data.conflictSummary === "string" ? data.conflictSummary.trim() : "",
    conflictLinkedNodeIds: Array.isArray(data.conflictLinkedNodeIds)
      ? data.conflictLinkedNodeIds.filter((value) => typeof value === "string" && value.trim())
      : [],
    conflictUpdatedAt: typeof data.conflictUpdatedAt === "string" ? data.conflictUpdatedAt : "",
  };
}
