"use client";

import { Handle, Position } from "reactflow";
import { getTypeMeta, normalizeNodeCategory, getSourceTypeMeta, normalizeVisibility } from "@/lib/thinkingMachine/nodeMeta";
import ConflictPopover from "@/components/thinkingMachine/conflicts/ConflictPopover";

const HANDLE_STYLE = {
  top: 38,
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

function getFiveWhLabelFromData(data = {}) {
  const category = normalizeNodeCategory(data.category);
  const koMap = {
    Who: "누가 (Who)",
    When: "언제 (When)",
    Where: "어디서 (Where)",
    What: "무엇을 (What)",
    Why: "왜 (Why)",
    How: "어떻게 (How)",
  };
  return koMap[category] || category;
}

function getPhaseLabelFromData(data = {}) {
  const phase = data.phase || "Idea";
  const koMap = {
    Idea: "아이디어",
    Research: "리서치",
    Solution: "솔루션",
    Decision: "결정",
    Action: "실행",
  };
  return koMap[phase] || phase;
}

function MetaChip({ label, className, style }) {
  if (!label) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9.5px] font-bold leading-none tracking-tight ${className}`}
      style={style}
    >
      {label}
    </span>
  );
}

function AnchorPort({ side, color }) {
  const sideClass = side === "left" ? "left-[-5px]" : "right-[-5px]";

  return (
    <span
      className={`pointer-events-none absolute ${sideClass} top-[31px] z-[40] flex h-[14px] w-[14px] items-center justify-center rounded-full border border-white/55 bg-white/82 shadow-[0_4px_12px_rgba(15,23,42,0.08)] backdrop-blur-sm`}
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

export default function ThinkingNode({ data = {} }) {
  const portColor = getPortColor(data.category);
  const hasLeftPort = Boolean(data.hasLeftPort);
  const hasRightPort = Boolean(data.hasRightPort);

  const sourceMeta = getSourceTypeMeta(data.sourceType);
  const fiveWhLabel = getFiveWhLabelFromData(data);
  const phaseLabel = getPhaseLabelFromData(data);

  const titleLower = (data.title || "").toLowerCase();
  const contentLower = (data.content || "").toLowerCase();
  const textLower = `${titleLower} ${contentLower}`;

  const devKeywords = /\b(api|db|database|server|code|develop|backend|frontend|performance|data|system|security|scale|infra|hosting|architecture|stack)\b/;
  const designKeywords = /\b(ui|ux|design|screen|color|layout|button|font|flow|prototype|pixel|css|styled|animation|icon|visual|interaction)\b/;
  const pmKeywords = /\b(schedule|deadline|milestone|launch|scope|cost|business|feature|prioritize|market|customer|planner|pm|timeline|launch|phase|sprint)\b/;

  const needsDev = devKeywords.test(textLower);
  const needsDesign = designKeywords.test(textLower);
  const needsPm = pmKeywords.test(textLower);

  // Map visibility to a beautiful status label
  const visibility = normalizeVisibility(data.visibility);
  const visibilityLabel = visibility === "shared" ? "Accepted" : visibility === "reviewed" ? "Reviewed" : visibility === "agreed" ? "Agreed" : "Candidate";
  const visibilityClass = visibility === "shared"
    ? "bg-[#E6F4EA] text-[#137333]"
    : visibility === "reviewed"
    ? "bg-[#E8F0FE] text-[#1A73E8]"
    : visibility === "agreed"
    ? "bg-[#F3E8FF] text-[#6B21A8]"
    : "bg-[#FEF7E0] text-[#B06000]";

  // Map source type to a beautiful meta label
  const sourceLabel = sourceMeta.label === "AI" ? "AI" : sourceMeta.label === "User" ? "User" : "Memory";
  const sourceClass = sourceMeta.label === "AI"
    ? "bg-[#F3E8FF] text-[#6B21A8]"
    : "bg-[#E8F0FE] text-[#1A73E8]";

  // Map phase to a beautiful meta label
  const phaseClass = "bg-[#FCE7F3] text-[#9D174D]";

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
      <div className="flex h-full w-full flex-col">
        {/* Simple, modern white box style card */}
        <div className="relative w-full rounded-[24px] border border-slate-200/80 bg-white px-4.5 py-4.5 shadow-[0_12px_36px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_44px_rgba(15,23,42,0.10)] transition-all duration-300">
          
          {/* Card Header with circular dot and Korean-English mixed category */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="h-2.5 w-2.5 rounded-full shadow-sm"
              style={{ backgroundColor: portColor }}
            />
            <span className="text-[11.5px] font-bold text-slate-500 tracking-tight">
              {fiveWhLabel}
            </span>
          </div>

          {/* Card Body */}
          <div className="flex flex-col">
            <div
              className="font-heading line-clamp-2 font-bold tracking-tight text-slate-800"
              style={{ fontSize: 13.5, lineHeight: 1.3 }}
            >
              {data.title || "Untitled node"}
            </div>
            <div
              className="mt-1.5 font-node-body line-clamp-3 text-slate-500 font-medium"
              style={{ fontSize: 11.5, lineHeight: 1.45 }}
            >
              {data.content}
            </div>

            {/* Pastel colored meta tags */}
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              <MetaChip label={visibilityLabel} className={visibilityClass} />
              <MetaChip label={sourceLabel} className={sourceClass} />
              <MetaChip label={phaseLabel} className={phaseClass} />
            </div>

            {/* Role-based review badges */}
            {(needsDev || needsDesign || needsPm) && (
              <div className="mt-3 pt-2.5 border-t border-dashed border-slate-100 flex flex-wrap gap-1.5">
                {needsDev && (
                  <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 ring-1 ring-inset ring-amber-600/10">
                    ⚙️ 개발 검토
                  </span>
                )}
                {needsDesign && (
                  <span className="inline-flex items-center rounded-md bg-pink-50 px-2 py-0.5 text-[9px] font-bold text-pink-700 ring-1 ring-inset ring-pink-600/10">
                    🎨 디자인 검토
                  </span>
                )}
                {needsPm && (
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700 ring-1 ring-inset ring-blue-600/10">
                    📋 기획 검토
                  </span>
                )}
              </div>
            )}
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
