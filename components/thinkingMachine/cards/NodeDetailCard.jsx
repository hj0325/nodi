"use client";

import { Fragment } from "react";
import {
  getConflictStateMeta,
  getConfidenceMeta,
  getPreviousVisibility,
  getRoleMeta,
  getSourceTypeMeta,
  getVisibilityMeta,
  NODE_VISIBILITY_FLOW,
  normalizeNodeData,
} from "@/lib/thinkingMachine/nodeMeta";
import MetaPill from "@/components/thinkingMachine/ui/MetaPill";

function VisibilityStepper({ currentVisibility, onSetVisibility }) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-slate-500">Sharing flow</div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {NODE_VISIBILITY_FLOW.map((step) => {
          const meta = getVisibilityMeta(step);
          const isPrivate = step === "private";
          const breakBefore = step === "reviewed";
          return (
            <Fragment key={step}>
              {breakBefore ? (
                <div
                  aria-hidden
                  style={{ flexBasis: "100%", width: "100%", height: 0 }}
                />
              ) : null}
              <button
                type="button"
                onClick={() => onSetVisibility?.(step)}
                className={`rounded-full px-2 py-1 text-[10px] font-semibold transition ${
                  isPrivate ? "" : "bg-white text-slate-700"
                }`}
                style={{
                  ...(isPrivate
                    ? { backgroundColor: "#6FBCA4", color: "#FFFFFF" }
                    : { boxShadow: "0 0 0.5px 1px #8DDAD1" }),
                  ...(step === "private" || step === "candidate" || step === "shared"
                    ? { position: "relative", top: 3 }
                    : null),
                }}
              >
                {meta.label}
              </button>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default function NodeDetailCard({
  selectedNode,
  linkedNodes,
  currentUserRole,
  onPromote,
  onDemote,
  onShare,
  onSetVisibility,
  quickActions = [],
  modeLabel = "",
  onClearSelection,
}) {
  if (!selectedNode) return null;

  const data = normalizeNodeData(selectedNode.data || {});
  const sourceMeta = getSourceTypeMeta(data.sourceType);
  const visibilityMeta = getVisibilityMeta(data.visibility);
  const confidenceMeta = getConfidenceMeta(data.confidence);
  const conflictMeta = getConflictStateMeta(data.conflictState);
  const roleMeta = getRoleMeta(currentUserRole);
  const linked = Array.isArray(linkedNodes) ? linkedNodes : [];
  const canEdit = currentUserRole === "owner" || currentUserRole === "editor";

  return (
    <div className="rounded-2xl border border-white/70 bg-white/70 p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Selected node</div>
          <div className="mt-0.5 text-[11px] font-semibold text-slate-500">
            {data.phase === "Solution" ? "Solution side" : "Problem side"} · {data.category}
          </div>
        </div>
        <div className="flex items-start gap-1.5">
          {onClearSelection ? (
            <button
              type="button"
              onClick={onClearSelection}
              className="ml-0.5 -mt-2.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-[10px] font-bold text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
              aria-label="Clear selected node"
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>

      <div
        className="font-heading text-sm font-semibold text-slate-800"
        style={{ marginTop: 16 }}
      >
        {selectedNode.data?.title || "Untitled node"}
      </div>
      <div className="-mt-[5px] -ml-[8px] rounded-xl bg-slate-50/80 px-2.5 py-1.5 text-[11px] font-bold leading-relaxed text-slate-700">
        {selectedNode.data?.content && selectedNode.data.content.trim().length > 0
          ? selectedNode.data.content
          : "Add one clear sentence that captures what this node is about."}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <MetaPill style={{ backgroundColor: "#6FBCA4", color: "#FFFFFF" }}>{roleMeta.label}</MetaPill>
        <MetaPill style={{ backgroundColor: "#6FBCA4", color: "#FFFFFF" }}>{sourceMeta.label}</MetaPill>
        <MetaPill style={{ backgroundColor: "#6FBCA4", color: "#FFFFFF" }}>{visibilityMeta.label}</MetaPill>
        <MetaPill style={{ backgroundColor: "#6FBCA4", color: "#FFFFFF" }}>{confidenceMeta.label}</MetaPill>
        {data.conflictState !== "none" ? (
          <MetaPill style={{ backgroundColor: "#6FBCA4", color: "#FFFFFF" }}>{conflictMeta.label}</MetaPill>
        ) : null}
      </div>
      {data.conflictState !== "none" && data.conflictSummary ? (
        <div className="mt-2 rounded-xl border border-amber-200/80 bg-amber-50/80 px-2.5 py-2 text-[11px] leading-relaxed text-amber-800">
          {data.conflictSummary}
        </div>
      ) : null}
      {quickActions.length ? (
        <div
          className="rounded-xl border px-2.5 py-2"
          style={{
            marginTop: 19,
            backgroundColor: "#F3F9F6",
            borderColor: "#D2E4DE",
          }}
        >
          <div className="text-[11px] font-semibold text-slate-500">
            {modeLabel ? `${modeLabel} quick actions` : "Quick actions"}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {quickActions.map((item) => {
              const breakBefore =
                item === "Assumption" && quickActions.includes("Conflict");
              return (
                <Fragment key={item}>
                  {breakBefore ? (
                    <div
                      aria-hidden
                      style={{ flexBasis: "100%", width: "100%", height: 0 }}
                    />
                  ) : null}
                  <MetaPill
                    className="bg-white text-slate-700"
                    style={{
                      boxShadow: "0 0 0.5px 1px #8DDAD1",
                      ...(item === "Evidence" || item === "OpenQuestion"
                        ? { position: "relative", top: 3 }
                        : null),
                    }}
                  >
                    {item}
                  </MetaPill>
                </Fragment>
              );
            })}
          </div>
        </div>
      ) : null}
      <div className="mt-3 rounded-xl border border-slate-200/80 bg-slate-50/85 px-2.5 py-2">
        <VisibilityStepper currentVisibility={data.visibility} onSetVisibility={canEdit ? onSetVisibility : undefined} />
        <div
          className="mt-3 flex gap-2"
          style={{ position: "relative", top: 6 }}
        >
          <button
            type="button"
            onClick={onDemote}
            disabled={!canEdit || getPreviousVisibility(data.visibility) === data.visibility}
            className="flex-1 basis-0 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-80"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            Demote
          </button>
          {(() => {
            const promoteDisabled =
              !canEdit || getPreviousVisibility(data.visibility) === data.visibility;
            return (
              <button
                type="button"
                onClick={onPromote}
                disabled={promoteDisabled}
                className="flex-1 basis-0 inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed"
                style={{
                  backgroundColor: promoteDisabled
                    ? "rgba(168, 242, 208, 0.5)"
                    : "#A8F2D0",
                  color: "#047857",
                }}
              >
                Promote
              </button>
            );
          })()}
          <button
            type="button"
            onClick={onShare}
            disabled={!canEdit || data.visibility === "shared" || data.visibility === "reviewed" || data.visibility === "agreed"}
            className="flex-1 basis-0 inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "#A8F2D0", color: "#047857" }}
          >
            To team
          </button>
        </div>
        <div style={{ marginTop: 19 }}>
          <div
            className="text-[11px] font-semibold text-slate-500"
            style={{ position: "relative", top: 2, left: 2.5 }}
          >
            Linked nodes
          </div>
          {linked.length ? (
            <div className="mt-2 flex flex-col gap-1.5">
              {linked.map((item) => (
                <div key={`${item.id}-${item.relation}-${item.direction}`} className="rounded-xl border border-slate-200/80 bg-white/80 px-2.5 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="line-clamp-1 text-[12px] font-semibold text-slate-700">{item.title}</div>
                    <MetaPill className="bg-white text-slate-500">{item.category}</MetaPill>
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
                    {item.direction === "outgoing" ? "Outgoing" : "Incoming"} · {item.relation.replace(/_/g, " ")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-1 text-[11px] text-slate-400">No linked nodes yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

