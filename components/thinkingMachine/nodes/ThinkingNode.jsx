"use client";

import { useMemo, useState } from "react";
import { Handle, Position } from "reactflow";
import { getTypeMeta, normalizeNodeCategory, normalizeJobTag, getJobTagMeta, getTopicTagMeta, resolveTopicTagForNode, normalizeVisibility } from "@/lib/thinkingMachine/nodeMeta";
import ConflictPopover from "@/components/thinkingMachine/conflicts/ConflictPopover";

const HANDLE_STYLE = {
  top: 53,
  width: 1,
  height: 1,
  border: "none",
  background: "transparent",
  opacity: 0,
  pointerEvents: "none",
};

function getPortColor(category) {
  return getTypeMeta(normalizeNodeCategory(category)).color;
}

function AnchorPort({ side }) {
  const sideClass = side === "left" ? "left-[-7.23px]" : "right-[-7.23px]";

  return (
    <div
      className={`pointer-events-none absolute ${sideClass} z-[40] flex h-[14.46px] w-[14.46px] items-center justify-center rounded-full bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.08)]`}
      style={{ top: "53px", transform: "translateY(-50%)" }}
      aria-hidden
    >
      <div
        className="relative flex h-[8.9px] w-[8.9px] items-center justify-center rounded-full bg-[#A0D2E7]"
      >
        <div className="h-[4.45px] w-[4.45px] rounded-full bg-white" />
      </div>
    </div>
  );
}

function getSpeakerMeta(name) {
  const cleanName = typeof name === "string" ? name.trim() : "";
  if (!cleanName) {
    return { initial: "U", bg: "#2E3A59" }; // Default User (Dark Navy)
  }
  const firstChar = cleanName.charAt(0).toUpperCase();
  
  if (firstChar === "H") {
    return { initial: "H", bg: "#FFA6E9" }; // Hyeonji (Pink)
  }
  if (firstChar === "T") {
    return { initial: "T", bg: "#62B8AA" }; // TaeEun (Teal)
  }
  if (firstChar === "J") {
    return { initial: "J", bg: "#60A5FA" }; // Jimin / JaeWon (Sky Blue)
  }
  if (firstChar === "S") {
    return { initial: "S", bg: "#A78BFA" }; // Sooyun / SangHun (Purple)
  }
  if (cleanName.toLowerCase() === "ai" || cleanName.toLowerCase() === "agent") {
    return { initial: "AI", bg: "#818CF8" }; // AI (Indigo)
  }
  
  return { initial: firstChar, bg: "#2E3A59" }; // Default (Dark Navy)
}

export default function ThinkingNode({ id, data = {} }) {
  const portColor = getPortColor(data.category);
  const hasLeftPort = Boolean(data.hasLeftPort);
  const hasRightPort = Boolean(data.hasRightPort);


  // Tag 1: Discussion / Accepted / Rejected
  const isPreExistingMeetNode = id && id.startsWith("node-meet-");
  const visibility = normalizeVisibility(data.visibility);
  
  let visibilityLabel = "Discussion";
  let visibilityBg = "#F4FC8B";

  if (isPreExistingMeetNode) {
    visibilityLabel = "Accepted";
    visibilityBg = "#D1FFEB";
  } else if (visibility === "shared" || visibility === "reviewed" || visibility === "agreed") {
    visibilityLabel = "Accepted";
    visibilityBg = "#D1FFEB";
  } else if (visibility === "rejected") {
    visibilityLabel = "Rejected";
    visibilityBg = "#FFE0D4";
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

  const speakerMeta = useMemo(() => getSpeakerMeta(data.editedBy), [data.editedBy]);

  const [isOriginal, setIsOriginal] = useState(false);

  const displayTitle = isOriginal && data.originalTitle ? data.originalTitle : (data.title || data.label || "Untitled Node");
  const displayContent = isOriginal && data.originalContent ? data.originalContent : (data.content || "");
  const hasOriginal = Boolean(data.originalContent && data.originalContent.trim());

  return (
    <div className="relative h-full w-full">
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
          height: "195.76px",
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
          title={hasOriginal ? (isOriginal ? "AI 요약본 보기" : "STT 원문 보기") : "원문 없음"}
        >
          <div
            style={{
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              padding: !isOriginal
                ? "3.37255px 2.52941px 21.9216px"
                : "21.9216px 2.52941px 3.37255px",
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
                background: !isOriginal
                  ? "#62B8AA"
                  : "#CBD5E1",
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
            height: "165px",
            background: "linear-gradient(249.98deg, rgba(179, 236, 236, 0.12) -3.67%, rgba(168, 255, 208, 0.0708) 95.87%)",
            border: "0.843545px solid #CDE9E9",
            boxShadow: "0.562363px 0.562363px 11.2473px 0.631499px rgba(171,171,171,0.3)",
            borderRadius: "12.2695px",
            flex: "none",
            order: 1,
            alignSelf: "stretch",
            flexGrow: 0,
          }}
        >
          {/* Frame 1410167803 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              padding: "0px",
              gap: "7px",
              width: "229px",
              height: "143px",
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
                    color: "#2C6068",
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
                height: "112px",
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
                  gap: visibility !== "candidate" ? (isOriginal ? "0px" : "28px") : "0px",
                  width: "205px",
                  height: "94px",
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
                    height: isOriginal ? "77px" : "49px",
                    flex: "none",
                    order: 0,
                    alignSelf: "stretch",
                    flexGrow: 0,
                  }}
                >
                  {/* Title */}
                  <div
                    className="line-clamp-1 font-semibold"
                    style={{
                      width: "205px",
                      height: "16px",
                      fontFamily: "'Pretendard Variable', sans-serif",
                      fontStyle: "normal",
                      fontSize: "12px",
                      lineHeight: "130%",
                      color: "#34849C",
                      flex: "none",
                      order: 0,
                      alignSelf: "stretch",
                      flexGrow: 0,
                    }}
                  >
                    {displayTitle}
                  </div>

                  {/* Content */}
                  <div
                    className={`${isOriginal ? "line-clamp-4 overflow-y-auto pr-0.5" : "line-clamp-2"} font-normal`}
                    style={{
                      width: "205px",
                      height: isOriginal ? "56px" : "28px",
                      fontFamily: "'Pretendard Variable', sans-serif",
                      fontStyle: "normal",
                      fontSize: "10px",
                      lineHeight: "138%",
                      color: "#444859",
                      flex: "none",
                      order: 1,
                      alignSelf: "stretch",
                      flexGrow: 0,
                    }}
                  >
                    {displayContent}
                  </div>
                </div>

                {/* Tags Container (Frame 1410167796) */}
                {visibility !== "candidate" && (
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

                    {/* Tag 2 (Source) */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "2.05663px 8px 3.42771px",
                        gap: "6.86px",
                        minWidth: "52px",
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
                          minWidth: "36px",
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

      {hasLeftPort ? <AnchorPort side="left" /> : null}
      {hasRightPort ? <AnchorPort side="right" /> : null}
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
    </div>
  );
}
