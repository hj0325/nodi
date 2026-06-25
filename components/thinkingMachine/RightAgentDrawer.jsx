"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Check,
  X,
  Sparkles,
  StickyNote,
  Image as ImageIcon,
  AlertCircle,
  GitMerge,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import {
  getTypeMeta,
  normalizeReasoningStage,
  normalizeNodeData,
} from "@/lib/thinkingMachine/nodeMeta";
import NodeDetailCard from "@/components/thinkingMachine/cards/NodeDetailCard";
import CandidateGraphCard from "@/components/thinkingMachine/cards/CandidateGraphCard";
import AlignmentSummaryCard from "@/components/thinkingMachine/cards/AlignmentSummaryCard";
import { getAiRecommendations } from "@/lib/thinkingMachine/recommendations";

function parseStage(stage) {
  const value = normalizeReasoningStage(stage);
  const isDesign = value.startsWith("design-");
  const isConverge = value.endsWith("-converge");
  return {
    mode: isDesign ? "design" : "research",
    flow: isConverge ? "converge" : "diverge",
  };
}

export default function RightAgentDrawer({
  isOpen,
  stage = "Idea",
  suggestions = [],
  onStageChange,
  activeSuggestion,
  selectedNode,
  linkedNodes,
  candidateGraph,
  alignmentSummary,
  currentUserRole = "owner",
  isListening = false,
  onToggleListening,
  sttTranscript = "",
  interimTranscript = "",
  meetingSeconds = 0,
  meetingState = "active",
  onToggleMeetingState,
  currentDirection = "",
  onDismissSuggestion,
  onCommitCandidateNodes,
  onCommitCandidateNodesAsPrivate,
  onDiscardCandidateNodes,
  onPromoteSelectedNode,
  onDemoteSelectedNode,
  onSetNodeVisibility,
  onChatContextSelect,
  modeLabel,
  candidateHint,
  selectedNodeQuickActions,
  onClearSelectedNode,
  onAddPostit,
  onAddImage,
  nodes = [],
  edges = [],
  onMergeNodes,
  onLinkNodes,
}) {
  const { mode: thinkingMode, flow: thinkingFlow } = parseStage(stage);
  const recommendations = getAiRecommendations(nodes, edges);
  const [dismissedAlertIds, setDismissedAlertIds] = useState(new Set());

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, "0");
    const date = d.getDate().toString().padStart(2, "0");
    return `${y}.${m}.${date}`;
  }, []);

  // Unify all alerts, suggestions, and recommendations into a single timeline
  const timelineItems = useMemo(() => {
    const items = [];

    // 1. 연관 노드 상기 (Link Suggestion)
    // "지금 발화하는 내용이 이전 노드와 연관이 있다고 판단될 때 상기시켜준다."
    recommendations.linkSuggestions.forEach((rec) => {
      if (dismissedAlertIds.has(rec.id)) return;
      items.push({
        id: rec.id,
        type: "link",
        header: todayStr,
        title: `"${rec.targetTitle}" 노드와 관련이 있습니다.`,
        description: "논의를 연결하실래요?",
        tags: ["Discussion", "Memory", "UX"],
        color: "border-indigo-100 bg-indigo-50/40 text-indigo-700",
        icon: <Sparkles className="h-3.5 w-3.5 text-indigo-500" />,
        onAccept: () => {
          onLinkNodes?.(rec.sourceId, rec.targetId);
          setDismissedAlertIds((prev) => {
            const next = new Set(prev);
            next.add(rec.id);
            return next;
          });
        },
        onDiscard: () => {
          setDismissedAlertIds((prev) => {
            const next = new Set(prev);
            next.add(rec.id);
            return next;
          });
        },
      });
    });

    // 2. 직군별 검토 알림 (Role-based Review)
    // "노드에서 각 직군(디자이너, 기획자, 개발자)이 검토가 필요한 아이디어일 때 검토하라고 알려준다."
    recommendations.roleAlerts.forEach((alert) => {
      if (dismissedAlertIds.has(alert.id)) return;
      const isDev = alert.role === "Developer";
      const isDesign = alert.role === "Designer";
      const colorClass = isDev
        ? "border-amber-100 bg-amber-50/40 text-amber-700"
        : isDesign
        ? "border-pink-100 bg-pink-50/40 text-pink-700"
        : "border-blue-100 bg-blue-50/40 text-blue-700";

      items.push({
        id: alert.id,
        type: "role",
        header: alert.title,
        title: `"${alert.nodeTitle}" 노드가 ${alert.role === "Developer" ? "개발" : alert.role === "Designer" ? "디자인" : "기획"} 관점 검토가 필요합니다!`,
        description: alert.reason.split("! ")[1] || alert.reason,
        tags: isDev ? ["Developer", "Review"] : isDesign ? ["Designer", "Review"] : ["PM", "Review"],
        color: colorClass,
        icon: <HelpCircle className="h-3.5 w-3.5 text-slate-500" />,
        onAccept: () => {
          setDismissedAlertIds((prev) => {
            const next = new Set(prev);
            next.add(alert.id);
            return next;
          });
        },
        onDiscard: () => {
          setDismissedAlertIds((prev) => {
            const next = new Set(prev);
            next.add(alert.id);
            return next;
          });
        },
      });
    });

    // 3. 약한 부분 디벨롭 필요 상기 (Develop/Supplement Alert)
    // "노드에서 약한 부분이 있을 때 디벨롭이 필요하다고 상기시켜준다."
    recommendations.supplementAlerts.forEach((alert) => {
      if (dismissedAlertIds.has(alert.id)) return;
      items.push({
        id: alert.id,
        type: "supplement",
        header: alert.title,
        title: `"${alert.nodeTitle}" 노드가 검증이 필요합니다!`,
        description: alert.advice.split("! ")[1] || alert.advice,
        tags: alert.tags || ["Research", "Validation"],
        color: "border-rose-100 bg-rose-50/40 text-rose-700",
        icon: <AlertCircle className="h-3.5 w-3.5 text-rose-500" />,
        onAccept: () => {
          setDismissedAlertIds((prev) => {
            const next = new Set(prev);
            next.add(alert.id);
            return next;
          });
        },
        onDiscard: () => {
          setDismissedAlertIds((prev) => {
            const next = new Set(prev);
            next.add(alert.id);
            return next;
          });
        },
      });
    });

    return items;
  }, [recommendations, dismissedAlertIds, todayStr, onLinkNodes]);

  return (
    <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-[45] overflow-visible">
      <div className="relative flex h-full w-[365px] transform-gpu sm:w-[385px] lg:w-[397px]">
        <motion.div
          className="relative h-full w-full overflow-hidden rounded-none pointer-events-auto opacity-100 shadow-[-10px_0_30px_rgba(0,0,0,0.04)]"
          initial={{ x: 44, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 44, opacity: 0 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: "linear-gradient(169.55deg, rgba(239, 248, 245, 0.95) 9.44%, rgba(229, 243, 243, 0.95) 97.4%)",
            backdropBlur: "18px",
          }}
        >
          <div className="relative z-10 flex h-full min-h-0 flex-col px-5 pb-4 pt-4">
            
            {/* 1. Top Topic Status Card */}
            <div className="mb-4">
              <div className="rounded-2xl border border-[#D0E5DF] bg-white/85 p-3.5 shadow-[0_4px_16px_rgba(123,165,146,0.06)] backdrop-blur-md">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#7BA592] animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#558A72]">Current Topic</span>
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400">Close</span>
                </div>
                <p className="mt-2 text-[12.5px] font-semibold leading-relaxed text-slate-700">
                  {currentDirection || "AI가 실시간으로 회의 내용을 분석하여 중심 주제를 파악하고 있습니다."}
                </p>
              </div>
            </div>

            {/* 2. Central Meeting Controller */}
            <div className="mb-4 rounded-2xl border border-white/70 bg-white/50 p-4 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Meeting Duration</span>
                  <span className="text-2xl font-bold tracking-tight text-slate-700 font-mono mt-0.5">
                    {formatTime(meetingSeconds)}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  {/* Mic Toggle Button */}
                  <button
                    type="button"
                    onClick={onToggleListening}
                    className={`relative inline-flex h-11 w-11 items-center justify-center rounded-full border transition-all active:scale-95 ${
                      isListening
                        ? "border-emerald-200 bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                    title={isListening ? "음성 인식 중지" : "음성 인식 시작"}
                  >
                    {isListening ? (
                      <>
                        <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-25 animate-ping" />
                        <Mic className="h-5 w-5" />
                      </>
                    ) : (
                      <MicOff className="h-5 w-5" />
                    )}
                  </button>

                  {/* Pause/Play Button */}
                  <button
                    type="button"
                    onClick={onToggleMeetingState}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 active:scale-95"
                    title={meetingState === "active" ? "회의 일시정지" : "회의 재개"}
                  >
                    {meetingState === "active" ? (
                      <Pause className="h-4 w-4 fill-slate-600 text-slate-600" />
                    ) : (
                      <Play className="h-4 w-4 fill-slate-600 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Real-time STT Preview Bubble */}
              {isListening && (sttTranscript || interimTranscript) && (
                <div className="mt-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100/50 px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-600">STT 실시간 인식 중</span>
                  </div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-slate-600 font-medium">
                    {sttTranscript} <span className="text-emerald-500/80">{interimTranscript}</span>
                  </p>
                </div>
              )}
            </div>

            {/* 3. Main Content Area */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[22px] border border-white/70 bg-[rgba(255,255,255,0.34)] px-3.5 pb-3 pt-4 shadow-[0_14px_28px_rgba(88,116,104,0.09)] backdrop-blur-[16px]">
              <div className="min-h-0 flex-1 overflow-hidden text-sm text-slate-700">
                <div className="flex h-full min-h-0 flex-col">
                  <div
                    className="min-h-0 flex-1 overflow-y-auto px-1"
                    style={{ scrollbarWidth: "none" }}
                  >
                    <div className="flex flex-col gap-3 pb-2">
                      
                      {/* Node Detail Card (when a node is selected) */}
                      {selectedNode && (
                        <NodeDetailCard
                          selectedNode={selectedNode}
                          linkedNodes={linkedNodes}
                          currentUserRole={currentUserRole}
                          modeLabel={modeLabel}
                          quickActions={selectedNodeQuickActions}
                          onPromote={onPromoteSelectedNode}
                          onDemote={onDemoteSelectedNode}
                          onShare={() => onSetNodeVisibility?.(selectedNode?.id, "shared")}
                          onSetVisibility={(nextVisibility) => onSetNodeVisibility?.(selectedNode?.id, nextVisibility)}
                          onClearSelection={onClearSelectedNode}
                        />
                      )}

                      {selectedNode && alignmentSummary && (
                        <AlignmentSummaryCard selectedNode={selectedNode} summary={alignmentSummary} />
                      )}

                      {/* Candidate Graph Card (when suggestion is selected and pending commit) */}
                      {candidateGraph && (
                        <CandidateGraphCard
                          candidateGraph={candidateGraph}
                          candidateHint={candidateHint}
                          onCommit={onCommitCandidateNodes}
                          onCommitAsPrivate={onCommitCandidateNodesAsPrivate}
                          onDiscard={onDiscardCandidateNodes}
                        />
                      )}

                      {/* Unified Timeline / Alerts & Suggestions */}
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-1.5 border-b border-dashed border-slate-200 pb-2">
                          <Sparkles className="h-4 w-4 text-[#7BA592]" />
                          <span className="font-bold text-slate-700 text-[13px]">실시간 분석 및 제안 타임라인</span>
                        </div>

                        {timelineItems.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-slate-200 bg-white/50 p-4 text-center">
                            <p className="text-[11.5px] text-slate-400">회의를 계속 진행해 주세요.<br />실시간으로 아이디어 제안 및 검토 알림이 생성됩니다.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {timelineItems.map((item) => (
                              <div
                                key={item.id}
                                className={`rounded-[16px] border bg-white/80 p-3.5 shadow-sm transition hover:shadow-md flex flex-col gap-1.5`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex flex-col gap-1">
                                    <span className={`text-[10px] font-bold ${
                                      item.type === "link"
                                        ? "text-slate-400"
                                        : item.type === "role"
                                        ? "text-amber-600"
                                        : "text-rose-600"
                                    }`}>
                                      {item.header}
                                    </span>
                                    <span className="text-[12px] font-bold text-slate-800 leading-snug">
                                      {item.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={item.onAccept}
                                      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition"
                                      title="수락"
                                    >
                                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={item.onDiscard}
                                      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 transition"
                                      title="거절"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-[11.5px] text-slate-600 leading-relaxed font-medium">
                                  {item.description}
                                </p>
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {item.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="rounded-full bg-slate-100 px-2 py-0.5 text-[9.5px] font-semibold text-slate-500"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Quick Action Tools (Note, Image) Removed */}

                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
