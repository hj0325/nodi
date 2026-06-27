"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
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
  onClose,
  isSimulationActive = false,
  simulationSpeaker = "",
  simulationText = "",
  isSeededProject = false,
  isSimulationCompleted = false,
  isMeetingCaptureLoading = false,
  onStartSimulation,
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

  const getTagStyle = (tag) => {
    const t = tag.toLowerCase();
    if (t === "discussion" || t === "developer" || t === "pm") {
      return { bg: "#D1FFEB", color: "rgba(93, 107, 110, 0.8)" };
    } else if (t === "memory" || t === "designer" || t === "research") {
      return { bg: "#D4CDF1", color: "rgba(93, 107, 110, 0.8)" };
    } else {
      return { bg: "#FFD7FE", color: "rgba(93, 107, 110, 0.8)" };
    }
  };

  // Unify all alerts, suggestions, and recommendations into a single timeline
  const timelineItems = useMemo(() => {
    const items = [];

    // 1. 연관 노드 상기 (Link Suggestion)
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
        header: `* ${alert.role === "Developer" ? "개발" : alert.role === "Designer" ? "디자인" : "기획"} 관점 검토 필요`,
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
    recommendations.supplementAlerts.forEach((alert) => {
      if (dismissedAlertIds.has(alert.id)) return;
      items.push({
        id: alert.id,
        type: "supplement",
        header: `* Why 노드 리서치 필요`,
        title: `"${alert.nodeTitle}" 노드가 검증이 필요합니다!`,
        description: alert.advice.split("! ")[1] || alert.advice,
        tags: alert.tags || ["Research", "Validation", "UX"],
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

  const showMeetingFlowBanner = isSeededProject && isSimulationCompleted && !isSimulationActive;
  const [pinnedSttText, setPinnedSttText] = useState("");

  useEffect(() => {
    const live = `${sttTranscript || ""} ${interimTranscript || ""}`.trim();
    if (live) setPinnedSttText(live);
    if (!isListening && !isMeetingCaptureLoading) setPinnedSttText("");
  }, [sttTranscript, interimTranscript, isListening, isMeetingCaptureLoading]);

  const meetingFlowBannerStatus = useMemo(() => {
    if (isMeetingCaptureLoading) return "generating";
    if (isListening && (sttTranscript || interimTranscript || pinnedSttText)) return "stt";
    return "idle";
  }, [isMeetingCaptureLoading, isListening, sttTranscript, interimTranscript, pinnedSttText]);

  const meetingFlowBannerStyle = useMemo(() => {
    if (meetingFlowBannerStatus === "generating") {
      return {
        height: 56,
        background: "rgba(189, 254, 255, 0.22)",
        boxShadow:
          "inset 0px 4px 10.9px #FFFFFF, inset 0px -1px 18.8px rgba(0, 255, 85, 0.48)",
      };
    }
    if (meetingFlowBannerStatus === "stt") {
      return {
        height: 56,
        background: "rgba(255, 255, 255, 0.22)",
        boxShadow:
          "inset 0px 0px 25.5px #5CF3CB, inset 0px -6px 9.6px rgba(255, 255, 255, 0.61)",
      };
    }
    return {
      height: 75,
      background: "rgba(130, 216, 208, 0.22)",
      boxShadow:
        "inset 0px 4px 10.9px #FFFFFF, inset 0px -6px 9.6px rgba(255, 255, 255, 0.61)",
    };
  }, [meetingFlowBannerStatus]);

  const liveSttText = `${sttTranscript || ""}${interimTranscript ? `${sttTranscript ? " " : ""}${interimTranscript}` : ""}`.trim();
  const displaySttText = liveSttText || pinnedSttText;

  return (
    <div className="pointer-events-none absolute inset-0 z-[45]">
      <motion.div
        className="absolute right-[25px] top-[86px] w-[290px] h-[517px] flex flex-col gap-[10px] pointer-events-none select-none"
        initial={{ x: 44, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 44, opacity: 0 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Frame 1410167790 (Header) */}
        <div
          className="relative w-[290px] h-[54px] flex-none pointer-events-auto overflow-hidden flex items-center justify-between"
          style={{
            background: "linear-gradient(180deg, rgba(113, 146, 150, 0.64) 0%, rgba(151, 199, 191, 0.64) 100%)",
            border: "1px solid #CDE9E9",
            boxShadow: "inset 0px -2px 6.6px rgba(255, 255, 255, 0.85), inset 0px 4px 7.5px rgba(255, 255, 255, 0.49)",
            borderRadius: "17px",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Ellipse 2943 */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: "216px",
              height: "19px",
              left: "37px",
              top: "35px",
              background: "linear-gradient(90deg, #6AD0C4 0%, #E7FFFC 100%)",
              opacity: 0.69,
              filter: "blur(16.05px)",
            }}
          />

          {/* Frame 1410167813 (Inner Content Row) */}
          <div
            className="absolute flex flex-row justify-between items-start"
            style={{
              height: "30px",
              left: "15px",
              right: "10px",
              top: "12px",
              gap: "23px",
            }}
          >
            {/* AI Topic Direction Text */}
            <p
              style={{
                width: "182px",
                height: "30px",
                fontFamily: "'Pretendard Variable', sans-serif",
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "126%",
                color: "#FFFFFF",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {currentDirection || "분석을 진행할 예정입니다. 음성 인식을 켜고 회의를 시작해 보세요!"}
            </p>

            {/* Frame 1410167812 (Close Button) */}
            <button
              type="button"
              onClick={onClose}
              className="flex flex-row justify-center items-center hover:brightness-95 transition active:scale-95 shrink-0"
              style={{
                width: "50px",
                height: "20px",
                background: "rgba(205, 224, 222, 0.79)",
                borderRadius: "7px",
                padding: "1px 10px 2px 9px",
              }}
            >
              <span
                style={{
                  fontFamily: "'Pretendard Variable', sans-serif",
                  fontWeight: 500,
                  fontSize: "12px",
                  lineHeight: "138%",
                  color: "rgba(255, 255, 255, 0.73)",
                }}
              >
                Close
              </span>
            </button>
          </div>
        </div>

        {/* Frame 1410167762 (Main Body Panel) */}
        <div
          className="relative w-[289px] h-[453px] flex-none pointer-events-auto overflow-hidden"
          style={{
            background: "linear-gradient(249.98deg, rgba(179, 236, 236, 0.12) -3.67%, rgba(168, 255, 208, 0.0708) 95.87%)",
            border: "0.762799px solid #CDE9E9",
            boxShadow: "0.508532px 0.508532px 10.1706px 0.571051px rgba(171, 171, 171, 0.3)",
            borderRadius: "19px",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Frame 1410167879 (Absolute Wrapper inside Panel) */}
          <div
            className="absolute flex flex-col items-start"
            style={{
              width: "272px",
              height: "417px",
              left: "9px",
              top: "14px",
              gap: "20px",
            }}
          >
            {/* Row 1: Meeting Controller Row (Frame 1410167871) */}
            <div
              className="flex flex-row justify-between items-center w-full"
              style={{ height: "33px" }}
            >
              {/* Timer Pill (Frame 1410167787) */}
              <div
                className="flex flex-col items-start justify-center"
                style={{
                  width: "79px",
                  height: "32px",
                  background: "rgba(255, 255, 255, 0.64)",
                  border: "1px solid #FFFFFF",
                  boxShadow: "3px 3px 6px rgba(0, 0, 0, 0.05)",
                  borderRadius: "35px",
                  padding: "4px 6px",
                }}
              >
                <div
                  className="flex flex-row items-center justify-center w-full"
                  style={{ gap: "6px" }}
                >
                  <Clock className="h-3.5 w-3.5 text-[#324158]" />
                  <span
                    style={{
                      fontFamily: "'Pretendard Variable', sans-serif",
                      fontWeight: 500,
                      fontSize: "12px",
                      lineHeight: "126%",
                      color: "#667081",
                    }}
                  >
                    {formatTime(meetingSeconds)}
                  </span>
                </div>
              </div>

              {/* Mic & Pause buttons container (Frame 1410167870) */}
              <div
                className="flex flex-row items-center"
                style={{ width: "70px", height: "33px", gap: "4px" }}
              >
                {/* Mic Button (Frame 1410167861) */}
                <button
                  type="button"
                  onClick={isSimulationActive ? undefined : onToggleListening}
                  disabled={isSimulationActive}
                  className="relative flex items-center justify-center transition active:scale-95 hover:bg-white/80 shrink-0"
                  style={{
                    width: "33px",
                    height: "33px",
                    background: isListening ? "rgba(209, 255, 235, 0.85)" : "rgba(255, 255, 255, 0.69)",
                    boxShadow: "2.37604px 2.37604px 4.75208px 0.475208px rgba(0, 0, 0, 0.05)",
                    borderRadius: "16.5px",
                    border: isListening ? "1px solid rgba(164, 220, 205, 0.8)" : "none",
                    opacity: isSimulationActive ? 0.4 : 1,
                    cursor: isSimulationActive ? "not-allowed" : "pointer",
                  }}
                  title={isSimulationActive ? "시뮬레이션 중에는 마이크가 비활성화됩니다" : (isListening ? "음성 인식 중지" : "음성 인식 시작")}
                >
                  {isListening ? (
                    <>
                      <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-20 animate-ping" />
                      <Mic className="h-[18px] w-[18px] text-[#324158]" />
                    </>
                  ) : (
                    <MicOff className="h-[18px] w-[18px] text-[#324158]" />
                  )}
                </button>

                {/* Add glowing style block if in initial state */}
                {isSeededProject && !isSimulationActive && !isSimulationCompleted && meetingState === "ended" && (
                  <style dangerouslySetInnerHTML={{__html: `
                    @keyframes tm-glow-play {
                      0% {
                        box-shadow: 0 0 0 0 rgba(98, 184, 170, 0.4);
                        transform: scale(1);
                      }
                      50% {
                        box-shadow: 0 0 15px 6px rgba(98, 184, 170, 0.8), 0 0 2px 2px rgba(98, 184, 170, 0.4);
                        transform: scale(1.08);
                      }
                      100% {
                        box-shadow: 0 0 0 0 rgba(98, 184, 170, 0);
                        transform: scale(1);
                      }
                    }
                    .tm-play-glowing {
                      animation: tm-glow-play 2s infinite ease-in-out !important;
                      background: rgb(209, 250, 229) !important; /* light emerald/teal */
                      border: 1.5px solid rgb(52, 211, 153) !important;
                    }
                  `}} />
                )}

                {/* Pause Button (Frame 1410167860) */}
                <button
                  type="button"
                  onClick={isSimulationActive ? undefined : onToggleMeetingState}
                  disabled={isSimulationActive}
                  className={`flex items-center justify-center transition active:scale-95 hover:bg-white/80 shrink-0 ${
                    isSeededProject && !isSimulationActive && !isSimulationCompleted && meetingState === "ended"
                      ? "tm-play-glowing"
                      : ""
                  }`}
                  style={{
                    width: "33px",
                    height: "33px",
                    background: "rgba(255, 255, 255, 0.69)",
                    boxShadow: "2.37604px 2.37604px 4.75208px 0.475208px rgba(0, 0, 0, 0.05)",
                    borderRadius: "16.5px",
                    opacity: isSimulationActive ? 0.4 : 1,
                    cursor: isSimulationActive ? "not-allowed" : "pointer",
                  }}
                  title={isSimulationActive ? "시뮬레이션 중에는 회의 조율이 불가합니다" : (meetingState === "active" ? "회의 일시정지" : "회의 재개")}
                >
                  {meetingState === "active" ? (
                    <Pause className="h-[15.45px] w-[18.4px] text-[#324158]" strokeWidth={2} fill="#324158" />
                  ) : (
                    <Play className="h-[15.45px] w-[18.4px] text-[#324158]" strokeWidth={2} fill="#324158" />
                  )}
                </button>
              </div>
            </div>

            {/* Simulation speech or unified post-meeting flow banner */}
            {isSimulationActive ? (
              <motion.div
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="w-full shrink-0 overflow-hidden rounded-[14px] border border-sky-200 bg-sky-50 px-3 py-2 shadow-[0_2px_6px_rgba(0,0,0,0.02)]"
              >
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-500" />
                  <span className="text-[10px] font-bold text-sky-600">
                    [{simulationSpeaker}] 발화 및 기록 중...
                  </span>
                </div>
                <p className="max-h-[50px] overflow-y-auto text-[10px] font-medium leading-relaxed text-slate-800">
                  {simulationText}
                </p>
              </motion.div>
            ) : showMeetingFlowBanner ? (
              <motion.div
                layout
                className="relative flex shrink-0 flex-col items-start overflow-hidden"
                initial={false}
                animate={{
                  height: meetingFlowBannerStyle.height,
                  background: meetingFlowBannerStyle.background,
                  boxShadow: meetingFlowBannerStyle.boxShadow,
                }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  width: "261px",
                  padding: "13px 19px",
                  gap: "10px",
                  borderRadius: "21px",
                  isolation: "isolate",
                  backdropFilter: "blur(1.6px)",
                  WebkitBackdropFilter: "blur(1.6px)",
                  filter: "drop-shadow(0px 4px 26.5px rgba(132, 132, 132, 0.19))",
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {meetingFlowBannerStatus === "generating" ? (
                    <motion.div
                      key="generating"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-start"
                      style={{ width: "194px", gap: "2px" }}
                    >
                      <span
                        style={{
                          fontFamily: "'Pretendard Variable', sans-serif",
                          fontStyle: "normal",
                          fontWeight: 400,
                          fontSize: "9px",
                          lineHeight: "15px",
                          color: "#A1B1B6",
                        }}
                      >
                        AI 노드 생성중...
                      </span>
                      <span
                        style={{
                          fontFamily: "'Pretendard Variable', sans-serif",
                          fontStyle: "normal",
                          fontWeight: 400,
                          fontSize: "11px",
                          lineHeight: "15px",
                          color: "#139D8C",
                        }}
                      >
                        Nodi가 회의록에 아이디어를 추가중입니다!
                      </span>
                    </motion.div>
                  ) : meetingFlowBannerStatus === "stt" ? (
                    <motion.div
                      key="stt"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-start"
                      style={{ width: "194px", gap: "2px" }}
                    >
                      <span
                        style={{
                          fontFamily: "'Pretendard Variable', sans-serif",
                          fontWeight: 400,
                          fontSize: "9px",
                          lineHeight: "15px",
                          color: "#A1B1B6",
                        }}
                      >
                        AI 인식중...
                      </span>
                      <p
                        className="max-h-[30px] overflow-y-auto"
                        style={{
                          width: "194px",
                          margin: 0,
                          fontFamily: "'Pretendard Variable', sans-serif",
                          fontWeight: 400,
                          fontSize: "11px",
                          lineHeight: "15px",
                          color: "#139D8C",
                        }}
                      >
                        {displaySttText}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-start"
                      style={{ width: "194px", gap: "2px" }}
                    >
                      <span
                        style={{
                          fontFamily: "'Pretendard Variable', sans-serif",
                          fontWeight: 400,
                          fontSize: "9px",
                          lineHeight: "15px",
                          color: "#A1B1B6",
                        }}
                      >
                        회의 종료
                      </span>
                      <span
                        style={{
                          fontFamily: "'Pretendard Variable', sans-serif",
                          fontWeight: 400,
                          fontSize: "11px",
                          lineHeight: "14px",
                          color: "#444859",
                        }}
                      >
                        현재 Nodi에 팀원이 함께 있지 않습니다.
                      </span>
                      <span
                        style={{
                          fontFamily: "'Pretendard Variable', sans-serif",
                          fontWeight: 400,
                          fontSize: "11px",
                          lineHeight: "14px",
                          color: "#139D8C",
                        }}
                      >
                        보이스로 아이디어를 공유해주세요!
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : null}

            {/* Row 2: Timeline Scroll List (Frame 1410167878 & Frame 1410167877) */}
            <div
              className="flex flex-col overflow-y-auto overflow-x-hidden pr-1 pb-24 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-white/40 [&::-webkit-scrollbar-track]:rounded-[17px] [&::-webkit-scrollbar-thumb]:bg-[#A4DCCD] [&::-webkit-scrollbar-thumb]:rounded-[17px]"
              style={{
                width: "264px",
                height: isSimulationActive ? "230px" : showMeetingFlowBanner ? "279px" : "364px",
                gap: "10px",
                scrollbarWidth: "thin",
              }}
            >
              {/* Simulation Start / Retry Banner Card */}
              {isSeededProject && !isSimulationActive && !isSimulationCompleted && (
                <div
                  className="w-full rounded-[14px] bg-gradient-to-r from-teal-400/20 to-sky-400/20 border border-teal-200 p-3 flex flex-col gap-2 shrink-0 mb-1"
                  style={{
                    boxShadow: "0px 4px 12px rgba(114, 114, 114, 0.08)",
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                    <span className="text-[10px] font-bold text-teal-700">회의 상황 시뮬레이션</span>
                  </div>
                  <p className="text-[9.5px] text-slate-600 leading-normal">
                    우측 상단의 <b>플레이(▶)</b> 버튼을 누르면, 가상 팀원들이 회의를 진행하며 실시간으로 캔버스 노드를 구성하는 과정이 시작됩니다!
                  </p>
                </div>
              )}

              {timelineItems.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center border border-dashed border-[#CDE9E9] bg-white/10 p-6 text-center"
                  style={{
                    borderRadius: "21px",
                    height: showMeetingFlowBanner ? "230px" : "300px",
                    width: "261px",
                  }}
                >
                  <Sparkles className="h-5 w-5 text-[#8FA3A9]/60 mb-2" />
                  <p
                    style={{
                      fontFamily: "'Pretendard Variable', sans-serif",
                      fontWeight: 400,
                      fontSize: "11px",
                      lineHeight: "15px",
                      color: "#8FA3A9",
                    }}
                  >
                    회의를 계속 진행해 주세요.
                    <br />
                    실시간으로 아이디어 제안 및
                    <br />
                    검토 알림이 생성됩니다.
                  </p>
                </div>
              ) : (
                timelineItems.map((item, index) => {
                  const isOldItem = index >= 2;
                  
                  // Parse title to extract double-quoted node titles for teal highlighting
                  const titleParts = item.title.split('"');
                  const hasQuotes = titleParts.length >= 3;
                  const quotedText = hasQuotes ? titleParts[1] : "";
                  const restText = hasQuotes ? titleParts.slice(2).join('"') : item.title;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-row justify-between items-start transition-all duration-300"
                      style={{
                        width: "261px",
                        gap: "7px",
                        opacity: isOldItem ? 0.54 : 1.0,
                      }}
                    >
                      {/* Left Box: Glassy Content Card */}
                      <div
                        className="flex flex-col items-start relative overflow-hidden shrink-0"
                        style={{
                          width: "232px",
                          background: "rgba(255, 255, 255, 0.55)",
                          boxShadow: "inset 0px 4px 10.9px #FFFFFF, inset 0px -6px 9.6px rgba(255, 255, 255, 0.4)",
                          borderRadius: "21px",
                          backdropFilter: "blur(1.6px)",
                          filter: "drop-shadow(0px 4px 26.5px rgba(132, 132, 132, 0.19))",
                          padding: "13px 19px",
                          gap: "10px",
                        }}
                      >
                        {/* Text Content */}
                        <div className="flex flex-col items-start text-left w-full" style={{ gap: "2px" }}>
                          {/* Header */}
                          <span
                            style={{
                              fontFamily: "'Pretendard Variable', sans-serif",
                              fontWeight: 400,
                              fontSize: "10px",
                              lineHeight: "15px",
                              color: "#8FA3A9",
                            }}
                          >
                            {item.header}
                          </span>

                          {/* Quoted Node Title (Figma Teal Highlight) */}
                          {hasQuotes && quotedText && (
                            <span
                              style={{
                                fontFamily: "'Pretendard Variable', sans-serif",
                                fontWeight: 600,
                                fontSize: "11.5px",
                                lineHeight: "16px",
                                color: "#139D8C",
                              }}
                            >
                              &quot;{quotedText}&quot;
                            </span>
                          )}

                          {/* Rest of Title Text */}
                          <span
                            style={{
                              fontFamily: "'Pretendard Variable', sans-serif",
                              fontWeight: 400,
                              fontSize: "11px",
                              lineHeight: "16px",
                              color: "#8FA3A9",
                            }}
                          >
                            {restText.trim()}
                          </span>

                          {/* Description */}
                          <p
                            style={{
                              fontFamily: "'Pretendard Variable', sans-serif",
                              fontWeight: 400,
                              fontSize: "11px",
                              lineHeight: "16px",
                              color: "#8FA3A9",
                              marginTop: "10px",
                            }}
                          >
                            {item.description}
                          </p>
                        </div>

                        {/* Tags list */}
                        <div
                          className="flex flex-row items-center flex-wrap"
                          style={{ gap: "5px", height: "17px" }}
                        >
                          {item.tags.map((tag) => {
                            const tagStyle = getTagStyle(tag);
                            return (
                              <div
                                key={tag}
                                className="flex items-center justify-center shrink-0"
                                style={{
                                  background: tagStyle.bg,
                                  borderRadius: "9.17845px",
                                  height: "17px",
                                  padding: "0 8px",
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily: "'Pretendard Variable', sans-serif",
                                    fontWeight: 600,
                                    fontSize: "9.17845px",
                                    lineHeight: "130%",
                                    color: tagStyle.color,
                                    textAlign: "center",
                                  }}
                                >
                                  {tag}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Box: Actions buttons */}
                      <div
                        className="flex flex-col items-center justify-center shrink-0 self-center"
                        style={{
                          width: "22px",
                          gap: "8px",
                        }}
                      >
                        {/* Accept Button */}
                        <button
                          type="button"
                          onClick={item.onAccept}
                          className="flex items-center justify-center transition active:scale-95 hover:bg-[#F0FDF4] shrink-0"
                          style={{
                            width: "22px",
                            height: "21px",
                            background: "#FFFFFF",
                            borderRadius: "29.6526px",
                            filter: "drop-shadow(0px 4px 26.5px rgba(132, 132, 132, 0.2))",
                            backdropFilter: "blur(4px)",
                            border: "none",
                          }}
                          title="수락"
                        >
                          <Check className="h-2.5 w-2.5 text-black" strokeWidth={1.5} />
                        </button>

                        {/* Discard Button */}
                        <button
                          type="button"
                          onClick={item.onDiscard}
                          className="flex items-center justify-center transition active:scale-95 hover:bg-[#FEF2F2] shrink-0"
                          style={{
                            width: "22px",
                            height: "21px",
                            background: "#FFFFFF",
                            borderRadius: "29.6526px",
                            filter: "drop-shadow(0px 4px 26.5px rgba(132, 132, 132, 0.2))",
                            backdropFilter: "blur(4px)",
                            border: "none",
                          }}
                          title="거절"
                        >
                          <X className="h-2.5 w-2.5 text-black" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom Fade Mask Gradient Overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              height: "113px",
              background: "linear-gradient(180deg, rgba(237, 248, 247, 0) 0%, rgba(233, 245, 243, 0.49) 100%)",
              borderRadius: "0px 0px 19px 19px",
              zIndex: 10,
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
