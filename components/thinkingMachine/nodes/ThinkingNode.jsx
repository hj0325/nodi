"use client";

import { useMemo, useState } from "react";
import { Handle, Position } from "reactflow";
import { motion } from "framer-motion";
import { getTypeMeta, normalizeNodeCategory, normalizeJobTag, getJobTagMeta, getTopicTagMeta, resolveTopicTagForNode, normalizeVisibility, splitOriginalSpeechParagraphs, ORIGINAL_SPEECH_HIGHLIGHT_PHRASE } from "@/lib/thinkingMachine/nodeMeta";
import { getParticipantMeta } from "@/lib/thinkingMachine/participantMeta";
import { NODE_PORT_LAYOUT } from "@/lib/thinkingMachine/reactflowTransforms";
import { NEW_NODE_ENTRANCE_DELAY_S } from "@/lib/thinkingMachine/connectorEdges";
import ConflictPopover from "@/components/thinkingMachine/conflicts/ConflictPopover";

const HANDLE_STYLE = {
  top: NODE_PORT_LAYOUT.sidePortY,
  width: 1,
  height: 1,
  border: "none",
  background: "transparent",
  opacity: 0,
  pointerEvents: "none",
};

const VERTICAL_HANDLE_STYLE = {
  width: 1,
  height: 1,
  border: "none",
  background: "transparent",
  opacity: 0,
  pointerEvents: "none",
};

const VERTICAL_HANDLE_STYLE_TOP = {
  width: 1,
  height: 1,
  border: "none",
  background: "transparent",
  opacity: 0,
  pointerEvents: "none",
  position: "absolute",
  top: `${NODE_PORT_LAYOUT.toggleHeight + NODE_PORT_LAYOUT.headerGap}px`,
  left: "50%",
  transform: "translate(-50%, -50%)",
};

const VERTICAL_HANDLE_STYLE_BOTTOM = {
  width: 1,
  height: 1,
  border: "none",
  background: "transparent",
  opacity: 0,
  pointerEvents: "none",
  position: "absolute",
  bottom: `-${NODE_PORT_LAYOUT.portRingOffset}px`,
  left: "50%",
  transform: "translate(-50%, 50%)",
};

function getPortColor(category) {
  return getTypeMeta(normalizeNodeCategory(category)).color;
}

function AnchorPortRing({ isOffMeeting }) {
  return (
    <div
      className="relative flex h-[8.9px] w-[8.9px] items-center justify-center rounded-full"
      style={{
        backgroundColor: isOffMeeting ? "#C8D0F5" : "#A0D2E7",
      }}
    >
      <div className="h-[4.45px] w-[4.45px] rounded-full bg-white" />
    </div>
  );
}

function AnchorPort({ side, isOffMeeting }) {
  if (side === "top") {
    return (
      <div
        className="pointer-events-none absolute left-1/2 top-[-7.23px] z-[40] flex h-[14.46px] w-[14.46px] -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.08)]"
        aria-hidden
      >
        <AnchorPortRing isOffMeeting={isOffMeeting} />
      </div>
    );
  }

  if (side === "bottom") {
    return (
      <div
        className="pointer-events-none absolute bottom-[-7.23px] left-1/2 z-[40] flex h-[14.46px] w-[14.46px] -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.08)]"
        aria-hidden
      >
        <AnchorPortRing isOffMeeting={isOffMeeting} />
      </div>
    );
  }

  const sideClass = side === "left" ? "left-[-7.23px]" : "right-[-7.23px]";

  return (
    <div
      className={`pointer-events-none absolute ${sideClass} z-[40] flex h-[14.46px] w-[14.46px] items-center justify-center rounded-full bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.08)]`}
      style={{ top: `${NODE_PORT_LAYOUT.sidePortY}px`, transform: "translateY(-50%)" }}
      aria-hidden
    >
      <AnchorPortRing isOffMeeting={isOffMeeting} />
    </div>
  );
}

function highlightSpeechPhrase(text, phrase = ORIGINAL_SPEECH_HIGHLIGHT_PHRASE) {
  if (typeof text !== "string" || !text.includes(phrase)) return text;
  const start = text.indexOf(phrase);
  return (
    <>
      {text.slice(0, start)}
      <span
        style={{
          backgroundColor: "#F4FC8B",
          borderRadius: "2px",
          padding: "0 1px",
        }}
      >
        {phrase}
      </span>
      {text.slice(start + phrase.length)}
    </>
  );
}

function RefinedNodeSummary({ title, content, isOffMeeting }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "5px",
        width: "205px",
        height: "49px",
      }}
    >
      <div
        className="line-clamp-1 font-semibold"
        style={{
          width: "205px",
          height: "16px",
          fontFamily: "'Pretendard Variable', sans-serif",
          fontSize: "12px",
          lineHeight: "130%",
          color: isOffMeeting ? "#7280C4" : "#34849C",
        }}
      >
        {title}
      </div>
      <div
        className="line-clamp-2 font-normal"
        style={{
          width: "205px",
          height: "28px",
          fontFamily: "'Pretendard Variable', sans-serif",
          fontSize: "10px",
          lineHeight: "138%",
          color: "#444859",
        }}
      >
        {content}
      </div>
    </div>
  );
}

function OriginalSpeechContent({ content }) {
  const paragraphs = splitOriginalSpeechParagraphs(content);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "8px",
        width: "205px",
      }}
    >
      {paragraphs.map((paragraph, index) => (
        <p
          key={`${index}-${paragraph.slice(0, 12)}`}
          style={{
            margin: 0,
            width: "205px",
            fontFamily: "'Pretendard Variable', sans-serif",
            fontStyle: "normal",
            fontWeight: 400,
            fontSize: "10px",
            lineHeight: "138%",
            color: "#444859",
          }}
        >
          {highlightSpeechPhrase(paragraph)}
        </p>
      ))}
    </div>
  );
}

export default function ThinkingNode({ id, data = {} }) {
  const speakerMeta = useMemo(() => getParticipantMeta(data.editedBy), [data.editedBy]);
  const portColor = getPortColor(data.category);
  const hasLeftPort = Boolean(data.hasLeftPort);
  const hasRightPort = Boolean(data.hasRightPort);
  const hasTopPort = Boolean(data.hasTopPort);
  const hasBottomPort = Boolean(data.hasBottomPort);

  const transformOrigin = useMemo(() => {
    if (hasLeftPort) return "left center";
    if (hasTopPort) return "center top";
    if (hasBottomPort) return "center bottom";
    if (hasRightPort) return "right center";
    return "center center";
  }, [hasLeftPort, hasTopPort, hasBottomPort, hasRightPort]);


  // Tag 1: Discussion / Accepted / Rejected
  const isPreExistingMeetNode = id && id.startsWith("node-meet-");
  const visibility = normalizeVisibility(data.visibility);
  
  let visibilityLabel = "Discussion";
  let visibilityBg = "#F4FC8B";

  if (visibility === "rejected") {
    visibilityLabel = "Rejected";
    visibilityBg = "#FFE0D4";
  } else if (visibility === "shared" || visibility === "reviewed" || visibility === "agreed") {
    visibilityLabel = "Accepted";
    visibilityBg = "#D1FFEB";
  } else if (
    isPreExistingMeetNode &&
    visibility !== "candidate" &&
    visibility !== "private"
  ) {
    visibilityLabel = "Accepted";
    visibilityBg = "#D1FFEB";
  } else {
    visibilityLabel = "Discussion";
    visibilityBg = "#F4FC8B";
  }

  // Tag 2: topic tag — STT meeting uses Context/Memory/STT; other scenarios use context-specific tags
  const topicTag = resolveTopicTagForNode({ nodeId: id, data });
  const topicTagMeta = getTopicTagMeta(topicTag);

  // Tag 3: Business / UX / Tech
  const jobTag = normalizeJobTag(data.jobTag, {
    category: data.category,
    phase: data.phase,
    title: data.title,
    content: data.content,
  });
  const jobTagMeta = getJobTagMeta(jobTag);

  const [isOriginal, setIsOriginal] = useState(false);

  const displayTitle = data.title || data.label || "Untitled Node";
  const refinedContent = data.content || "";
  const originalContent = data.originalContent || "";
  const hasOriginal = Boolean(originalContent.trim());
  const showingOriginal = hasOriginal && isOriginal;
  const showTags = !showingOriginal;
  const entranceDelay = data?.isHydratedNode ? 0 : NEW_NODE_ENTRANCE_DELAY_S;

  return (
    <div className="relative h-full w-full">
      {/* Invisible stable Handles for React Flow (Must not be scaled/animated) */}
      <Handle
        id="top-target"
        type="target"
        position={Position.Top}
        style={VERTICAL_HANDLE_STYLE_TOP}
        isConnectable={false}
      />
      <Handle
        id="bottom-source"
        type="source"
        position={Position.Bottom}
        style={VERTICAL_HANDLE_STYLE_BOTTOM}
        isConnectable={false}
      />
      <Handle
        id="right-source"
        type="source"
        position={Position.Right}
        style={{ ...HANDLE_STYLE }}
        isConnectable={false}
      />
      <Handle
        id="left-target"
        type="target"
        position={Position.Left}
        style={{ ...HANDLE_STYLE }}
        isConnectable={false}
      />

      {/* Animated visual wrapper */}
      <motion.div
        className="h-full w-full"
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 160,
          damping: 14,
          delay: entranceDelay,
        }}
        style={{ transformOrigin }}
      >
        <ConflictPopover
          nodeId={data.nodeId}
          state={data.conflictState}
          summary={data.conflictSummary}
          linkedNodeTitles={data.conflictLinkedNodeTitles}
          explanation={data.conflictExplanation}
          isOpen={Boolean(data.isConflictPopoverOpen)}
          isLoading={Boolean(data.isConflictExplainLoading)}
          onToggle={data.onToggleConflictPopover}
          onExplain={data.onExplainConflict}
        />
        
        {/* Outer Container (Frame 1410167818) */}
        <div
          className="flex flex-col items-start"
          style={{
            padding: "0px",
            gap: "8px",
            width: "257px",
            minHeight: showingOriginal ? "228px" : "195.76px",
          }}
        >
          {/* Toggle (Frame 1410167810) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (hasOriginal) setIsOriginal(!isOriginal);
            }}
            className={hasOriginal ? "cursor-pointer" : "cursor-default opacity-60"}
            style={{
              width: "43px",
              height: "22.76px",
              position: "relative",
              flex: "none",
              order: 0,
              flexGrow: 0,
            }}
            title={hasOriginal ? (showingOriginal ? "AI 정제 노드 보기" : "STT 원문 보기") : "원문 없음"}
          >
            <div
              style={{
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                padding: showingOriginal
                  ? "21.9216px 2.52941px 3.37255px"
                  : "3.37255px 2.52941px 21.9216px",
                gap: "8.43px",
                width: "22.76px",
                height: "43px",
                background: "rgba(255, 255, 255, 0.61)",
                border: "0.843137px solid #FFFFFF",
                borderRadius: "30.0831px",
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%) rotate(-90deg)",
                transition: "padding 0.2s ease-in-out",
              }}
            >
              {/* Ellipse 173 */}
              <div
                style={{
                  width: "17.71px",
                  height: "17.71px",
                  borderRadius: "50%",
                  flex: "none",
                  flexShrink: 0,
                  background: showingOriginal ? "#CBD5E1" : "#62B8AA",
                  boxShadow: "inset -0.843137px -1.68627px 3.20392px rgba(98, 98, 98, 0.25), inset 0px 3.37255px 2.52941px rgba(255, 255, 255, 0.26)",
                  transition: "background-color 0.2s ease-in-out",
                }}
              />
            </div>
          </div>

          {/* Main Card (Frame 1410167805) */}
          <div
            className="relative flex flex-col items-start backdrop-blur-[10px] transition-all duration-300 hover:shadow-[0.562363px_0.562363px_16px_1px_rgba(171,171,171,0.4)]"
            style={{
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "10px 14px 12px",
              gap: "10px",
              width: "257px",
              minHeight: showingOriginal ? "198px" : "165px",
              height: showingOriginal ? "auto" : "165px",
              background: data.isOffMeeting
                ? "linear-gradient(249.98deg, rgba(148, 177, 255, 0.08) -3.67%, rgba(103, 115, 244, 0.045) 95.87%)"
                : "linear-gradient(249.98deg, rgba(179, 236, 236, 0.12) -3.67%, rgba(168, 255, 208, 0.0708) 95.87%)",
              border: data.isOffMeeting
                ? "0.843545px solid #E0E4FA"
                : "0.843545px solid #CDE9E9",
              boxShadow: "0.562363px 0.562363px 11.2473px 0.631499px rgba(171,171,171,0.3)",
              borderRadius: "12.2695px",
              flex: "none",
              order: 1,
              alignSelf: "stretch",
              flexGrow: 0,
            }}
          >
            {hasTopPort ? <AnchorPort side="top" isOffMeeting={data.isOffMeeting} /> : null}
            {hasBottomPort ? <AnchorPort side="bottom" isOffMeeting={data.isOffMeeting} /> : null}
            
            {/* Frame 1410167803 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                padding: "0px",
                gap: "7px",
                width: "229px",
                minHeight: showingOriginal ? "176px" : "143px",
                height: showingOriginal ? "auto" : "143px",
                flex: "none",
                order: 0,
                flexGrow: 0,
              }}
            >
              {/* Frame 1410167802 */}
              <div
                style={{
                  width: "134px",
                  height: "24px",
                  position: "relative",
                  flex: "none",
                  order: 0,
                  flexGrow: 0,
                }}
              >
                {/* Frame 1410167858 */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0px",
                    gap: "79px",
                    position: "absolute",
                    width: "127px",
                    height: "24px",
                    left: "7px",
                    top: "0px",
                  }}
                >
                  {/* Why (Category) */}
                  <span
                    style={{
                      width: "24px",
                      height: "20px",
                      fontFamily: "'Pretendard Variable', sans-serif",
                      fontStyle: "normal",
                      fontWeight: 700,
                      fontSize: "11px",
                      lineHeight: "180%",
                      textAlign: "center",
                      color: data.isOffMeeting ? "#525A80" : "#2C6068",
                      flex: "none",
                      order: 0,
                      flexGrow: 0,
                    }}
                  >
                    {data.category || "Node"}
                  </span>

                  {/* Speaker Initial Circle (Frame 1410167784) */}
                  <div
                    style={{
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "5.41935px 7.74194px 4.64516px 8.51613px",
                      gap: "7.74px",
                      width: "24px",
                      height: "24px",
                      backgroundColor: speakerMeta.bg,
                      border: "0.774194px solid #FFFFFF",
                      borderRadius: "12px",
                      flex: "none",
                      order: 1,
                      flexGrow: 0,
                    }}
                    title={`Edited by ${data.editedBy || "Unknown"}`}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "14px",
                        fontFamily: "'Pretendard Variable', sans-serif",
                        fontStyle: "normal",
                        fontWeight: 400,
                        fontSize: "11.6129px",
                        lineHeight: "14px",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {speakerMeta.initial}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inner White Box (Frame 1410167758) */}
              <div
                className="bg-white"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "9px 12px",
                  gap: "10px",
                  width: "229px",
                  minHeight: showingOriginal ? "148px" : "112px",
                  height: showingOriginal ? "auto" : "112px",
                  borderRadius: "11.9483px",
                  flex: "none",
                  order: 1,
                  alignSelf: "stretch",
                  flexGrow: 0,
                }}
              >
                {/* Frame 1410167798 */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "0px",
                    gap: showTags ? "28px" : "0px",
                    width: "205px",
                    minHeight: showingOriginal ? "126px" : "94px",
                    height: showingOriginal ? "auto" : "94px",
                    flex: "none",
                    order: 0,
                    alignSelf: "stretch",
                    flexGrow: 0,
                  }}
                >
                  {/* Frame 1410167795 */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      padding: "0px",
                      gap: "5px",
                      width: "205px",
                      minHeight: showingOriginal ? "108px" : "49px",
                      height: showingOriginal ? "auto" : "49px",
                      flex: "none",
                      order: 0,
                      alignSelf: "stretch",
                      flexGrow: 0,
                    }}
                  >
                    {/* Title + body */}
                    {showingOriginal ? (
                      <>
                        <div
                          className="line-clamp-1 font-semibold"
                          style={{
                            width: "205px",
                            height: "16px",
                            fontFamily: "'Pretendard Variable', sans-serif",
                            fontStyle: "normal",
                            fontSize: "12px",
                            lineHeight: "130%",
                            color: data.isOffMeeting ? "#7280C4" : "#34849C",
                            flex: "none",
                            order: 0,
                            alignSelf: "stretch",
                            flexGrow: 0,
                          }}
                        >
                          {displayTitle}
                        </div>
                        <OriginalSpeechContent content={originalContent} />
                      </>
                    ) : (
                      <RefinedNodeSummary title={displayTitle} content={refinedContent} isOffMeeting={data.isOffMeeting} />
                    )}
                  </div>

                  {/* Tags Container (Frame 1410167796) */}
                  {showTags && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        padding: "0px",
                        gap: "5px",
                        width: "149px",
                        height: "17px",
                        flex: "none",
                        order: 1,
                        flexGrow: 0,
                      }}
                    >
                      {/* Tag 1 (Visibility) */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          padding: "2.05663px 8px 3.42771px",
                          gap: "6.86px",
                          minWidth: "57px",
                          height: "17px",
                          backgroundColor: visibilityBg,
                          borderRadius: "9.17845px",
                          flex: "none",
                          order: 0,
                          flexGrow: 0,
                        }}
                      >
                        <span
                          style={{
                            minWidth: "42px",
                            height: "12px",
                            fontFamily: "'Pretendard Variable', sans-serif",
                            fontStyle: "normal",
                            fontWeight: 600,
                            fontSize: "9.17845px",
                            lineHeight: "130%",
                            textAlign: "center",
                            color: "rgba(93, 107, 110, 0.8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {visibilityLabel}
                        </span>
                      </div>

                      {/* Tag 2 (Topic) */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          padding:
                            topicTag.length <= 3 ? "2px 6px 3px" : "2px 8px 3px",
                          gap: "6.86px",
                          height: "17px",
                          backgroundColor: topicTagMeta.bg,
                          borderRadius: "9.17845px",
                          flex: "none",
                          order: 1,
                          flexGrow: 0,
                        }}
                      >
                        <span
                          style={{
                            height: "12px",
                            fontFamily: "'Pretendard Variable', sans-serif",
                            fontStyle: "normal",
                            fontWeight: 600,
                            fontSize: "9.17845px",
                            lineHeight: "130%",
                            textAlign: "center",
                            color: "rgba(93, 107, 110, 0.8)",
                            opacity: topicTag === "Memory" ? 0.9 : 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {topicTag}
                        </span>
                      </div>

                      {/* Tag 3 (Job) */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          padding: "4px 8.2265px 3.42771px 8px",
                          gap: "6.86px",
                          minWidth: "30px",
                          height: "17px",
                          backgroundColor: jobTagMeta.bg,
                          borderRadius: "9.17845px",
                          flex: "none",
                          order: 2,
                          flexGrow: 0,
                        }}
                      >
                        <span
                          style={{
                            minWidth: "13px",
                            height: "12px",
                            fontFamily: "'Pretendard Variable', sans-serif",
                            fontStyle: "normal",
                            fontWeight: 600,
                            fontSize: "9.17845px",
                            lineHeight: "130%",
                            color: "rgba(93, 107, 110, 0.8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {jobTag}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {hasLeftPort ? <AnchorPort side="left" isOffMeeting={data.isOffMeeting} /> : null}
        {hasRightPort ? <AnchorPort side="right" isOffMeeting={data.isOffMeeting} /> : null}
      </motion.div>
    </div>
  );
}
