"use client";

import { useMemo } from "react";
import { Handle, Position } from "reactflow";
import { getTypeMeta, normalizeNodeCategory, getSourceTypeMeta, normalizeVisibility } from "@/lib/thinkingMachine/nodeMeta";
import ConflictPopover from "@/components/thinkingMachine/conflicts/ConflictPopover";

const HANDLE_STYLE = {
  top: 113,
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

function getPhaseLabelFromData(data = {}) {
  const phase = data.phase || "Idea";
  const enMap = {
    Idea: "Idea",
    Research: "Research",
    Solution: "Solution",
    Decision: "Decision",
    Action: "Action",
  };
  return enMap[phase] || phase;
}

function AnchorPort({ side, color }) {
  const sideClass = side === "left" ? "left-[-5px]" : "right-[-5px]";

  return (
    <span
      className={`pointer-events-none absolute ${sideClass} top-[113px] z-[40] flex h-[14px] w-[14px] items-center justify-center rounded-full border border-white/55 bg-white/82 shadow-[0_4px_12px_rgba(15,23,42,0.08)] backdrop-blur-sm`}
      aria-hidden
    >
      <span
        className="absolute h-[8px] w-[8px] rounded-full opacity-30"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative h-[3px] w-[3px] rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 0 1px ${color}22` }}
      />
    </span>
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

export default function ThinkingNode({ data = {} }) {
  const portColor = getPortColor(data.category);
  const hasLeftPort = Boolean(data.hasLeftPort);
  const hasRightPort = Boolean(data.hasRightPort);

  const sourceMeta = getSourceTypeMeta(data.sourceType);
  const phaseLabel = getPhaseLabelFromData(data);

  // Map visibility to a beautiful status label
  const visibility = normalizeVisibility(data.visibility);
  const visibilityLabel = visibility === "shared" ? "Accepted" : visibility === "reviewed" ? "Reviewed" : visibility === "agreed" ? "Agreed" : "Candidate";

  // Map source type to a beautiful meta label
  const sourceLabel = sourceMeta.label === "AI" ? "AI" : sourceMeta.label === "User" ? "User" : "Memory";

  // Dynamic backgrounds for tags
  const visibilityBg = visibility === "shared"
    ? "#D1FFEB"
    : visibility === "reviewed"
    ? "#E8F0FE"
    : visibility === "agreed"
    ? "#F3E8FF"
    : "#FEF7E0";

  const sourceBg = sourceMeta.label === "AI"
    ? "#F3E8FF"
    : sourceMeta.label === "User"
    ? "#E8F0FE"
    : "#EFEBFF";

  const phaseBg = data.phase === "Idea"
    ? "#FCE7F3"
    : data.phase === "Research"
    ? "#E0F8DB"
    : data.phase === "Solution"
    ? "#E0F2FE"
    : data.phase === "Decision"
    ? "#FEF3C7"
    : data.phase === "Action"
    ? "#F5F3FF"
    : "#FCE7F3"; // fallback

  const speakerMeta = useMemo(() => getSpeakerMeta(data.editedBy), [data.editedBy]);

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
      
      {/* Outer Container (Frame 1410167816) */}
      <div className="flex h-full w-full flex-col items-start gap-2">
        
        {/* Capsule / Pill (Frame 1410167809) */}
        <div
          className="flex flex-row items-start rounded-[30.0831px] border border-white bg-white/61 shadow-sm backdrop-blur-[4px]"
          style={{
            boxSizing: "border-box",
            padding: "3.37255px 2.52941px 21.9216px",
            gap: "8.43px",
            width: "22.76px",
            height: "43px",
            transform: "rotate(-90deg)",
            transformOrigin: "center",
          }}
        >
          {/* Ellipse 173 */}
          <div
            className="rounded-full"
            style={{
              width: "17.71px",
              height: "17.71px",
              backgroundColor: "#62B8AA",
              boxShadow: "inset -0.843137px -1.68627px 3.20392px rgba(98, 98, 98, 0.25), inset 0px 3.37255px 2.52941px rgba(255, 255, 255, 0.26)",
              transform: "rotate(-90deg)",
            }}
          />
        </div>

        {/* Main Card (Frame 1410167804) */}
        <div
          className="flex flex-col items-start gap-2.5 rounded-[12.2695px] shadow-[0.562363px_0.562363px_11.2473px_0.631499px_rgba(171,171,171,0.3)] backdrop-blur-[10px] transition-all duration-300 hover:shadow-[0.562363px_0.562363px_16px_1px_rgba(171,171,171,0.4)]"
          style={{
            width: "257px",
            minHeight: "165px",
            background: "linear-gradient(249.98deg, rgba(179, 236, 236, 0.12) -3.67%, rgba(168, 255, 208, 0.0708) 95.87%)",
            border: "0.843545px solid #CDE9E9",
            padding: "10px 14px 12px",
          }}
        >
          {/* Frame 1410167803 */}
          <div className="flex w-full flex-col gap-[7px]">
            {/* Frame 1410167802 - Relative container to center category and place speaker on far right */}
            <div className="relative flex w-full h-6 flex-row items-center justify-center">
              {/* Category Label (e.g. Why, What, Who) - Centered */}
              <span
                className="font-bold text-center"
                style={{
                  fontFamily: "'Pretendard Variable', sans-serif",
                  fontSize: "11px",
                  lineHeight: "20px",
                  color: "#2C6068",
                  width: "43px",
                  height: "20px",
                }}
              >
                {data.category || "Node"}
              </span>

              {/* Speaker Initial Circle (Frame 1410167784) - Absolute on far right */}
              <div
                className="absolute right-0 flex h-6 w-6 items-center justify-center rounded-full border border-white shadow-[0px_3.09677px_23.2258px_rgba(171,171,171,0.25)]"
                style={{
                  backgroundColor: speakerMeta.bg,
                  width: "24px",
                  height: "24px",
                }}
                title={`Edited by ${data.editedBy || "Unknown"}`}
              >
                <span
                  className="font-normal"
                  style={{
                    fontFamily: "'Pretendard Variable', sans-serif",
                    fontSize: "11.6129px",
                    lineHeight: "14px",
                    color: "#FFFFFF",
                  }}
                >
                  {speakerMeta.initial}
                </span>
              </div>
            </div>

            {/* Inner White Box (Frame 1410167758) */}
            <div
              className="flex w-full flex-col gap-2 bg-white"
              style={{
                borderRadius: "11.9483px",
                padding: "9px 12px",
                minHeight: "112.35px",
              }}
            >
              {/* Title and Content Container (Frame 1410167795) */}
              <div className="flex flex-col gap-[5px]">
                {/* Title */}
                <div
                  className="line-clamp-1 font-bold"
                  style={{
                    fontFamily: "'Pretendard Variable', sans-serif",
                    fontSize: "12px",
                    lineHeight: "1.3",
                    color: "#34849C",
                  }}
                >
                  {data.title || "Untitled Node"}
                </div>
                {/* Content */}
                <div
                  className="line-clamp-2 font-medium"
                  style={{
                    fontFamily: "'Pretendard Variable', sans-serif",
                    fontSize: "10px",
                    lineHeight: "1.38",
                    color: "#444859",
                  }}
                >
                  {data.content}
                </div>
              </div>

              {/* Tags Container (Frame 1410167796) */}
              <div className="mt-auto flex flex-row items-center gap-1.5">
                {/* Tag 1 (Visibility) */}
                <div
                  className="flex items-center justify-center rounded-[9.17845px]"
                  style={{
                    backgroundColor: visibilityBg,
                    padding: "2.06px 8px 3.43px",
                  }}
                >
                  <span
                    className="font-semibold text-center"
                    style={{
                      fontFamily: "'Pretendard Variable', sans-serif",
                      fontSize: "9.17845px",
                      lineHeight: "1.3",
                      color: "rgba(93, 107, 110, 0.8)",
                    }}
                  >
                    {visibilityLabel}
                  </span>
                </div>

                {/* Tag 2 (Source) */}
                <div
                  className="flex items-center justify-center rounded-[9.17845px]"
                  style={{
                    backgroundColor: sourceBg,
                    padding: "2.06px 8px 3.43px",
                  }}
                >
                  <span
                    className="font-semibold text-center"
                    style={{
                      fontFamily: "'Pretendard Variable', sans-serif",
                      fontSize: "9.17845px",
                      lineHeight: "1.3",
                      color: "rgba(93, 107, 110, 0.8)",
                    }}
                  >
                    {sourceLabel}
                  </span>
                </div>

                {/* Tag 3 (Phase) */}
                <div
                  className="flex items-center justify-center rounded-[9.17845px]"
                  style={{
                    backgroundColor: phaseBg,
                    padding: "2.06px 8px 3.43px",
                  }}
                >
                  <span
                    className="font-semibold text-center"
                    style={{
                      fontFamily: "'Pretendard Variable', sans-serif",
                      fontSize: "9.17845px",
                      lineHeight: "1.3",
                      color: "rgba(93, 107, 110, 0.8)",
                    }}
                  >
                    {phaseLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasLeftPort ? <AnchorPort side="left" color={portColor} /> : null}
      {hasRightPort ? <AnchorPort side="right" color={portColor} /> : null}
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
