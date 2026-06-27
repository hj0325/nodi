"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { Handle, Position } from "reactflow";
import { motion } from "framer-motion";
import { NEW_NODE_ENTRANCE_DELAY_S } from "@/lib/thinkingMachine/connectorEdges";

const HANDLE_STYLE = {
  top: 46,
  width: 1,
  height: 1,
  border: "none",
  background: "transparent",
  opacity: 0,
  pointerEvents: "none",
};

export default function IdeaGroupNode({ id, data, selected }) {
  const mode = data?.mode === "raw" ? "raw" : "nodes";
  const title = typeof data?.title === "string" && data.title.trim() ? data.title : "Idea bundle";
  const onToggle = data?.onToggle;

  const isRaw = mode === "raw";
  const entranceDelay = data?.isHydratedNode ? 0 : NEW_NODE_ENTRANCE_DELAY_S;

  return (
    <div className="relative h-full w-full">
      {/* Static unscaled Handles for React Flow */}
      <Handle id="right-source" type="source" position={Position.Right} style={{ ...HANDLE_STYLE }} isConnectable={false} />
      <Handle id="left-target" type="target" position={Position.Left} style={{ ...HANDLE_STYLE }} isConnectable={false} />

      {!isRaw ? (
        <motion.div
          className={`relative h-full w-full rounded-[24px] border ${
            selected ? "border-teal-300/80 ring-2 ring-teal-200/40" : "border-[#CBD5E1]/60"
          } bg-[#E2E8F0]/30 shadow-[0_12px_28px_rgba(0,0,0,0.05),inset_1px_1px_0px_rgba(255,255,255,0.5)] backdrop-blur-[6px]`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 15,
            delay: entranceDelay,
          }}
        />
      ) : (
        <motion.div
          className={`relative h-full w-full rounded-[24px] border ${
            selected ? "border-teal-300/70 ring-2 ring-teal-200/50" : "border-white/45"
          } bg-white/12 shadow-[0_12px_28px_rgba(0,0,0,0.10)]`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 15,
            delay: entranceDelay,
          }}
        >
          <div className="absolute left-3 top-2.5 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggle?.(id)}
              className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/55 px-2.5 py-1 text-[10px] font-semibold text-slate-700 shadow-sm transition hover:bg-white/70 active:scale-[0.99]"
              aria-label="Toggle raw ideas view"
              title="Toggle raw ideas"
            >
              {isRaw ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              {isRaw ? "Raw ideas" : "Nodes"}
            </button>
            <span className="text-[10px] font-semibold tracking-[-0.01em] text-slate-700/80">{title}</span>
          </div>

          <div className="pointer-events-none absolute inset-0 rounded-[24px] ring-0 ring-teal-300/20 transition" />
          <span className="pointer-events-none absolute left-[-4px] top-[39px] z-[30] h-[10px] w-[10px] rounded-full border border-white/45 bg-white/70 shadow-[0_3px_8px_rgba(15,23,42,0.06)]" />
          <span className="pointer-events-none absolute right-[-4px] top-[39px] z-[30] h-[10px] w-[10px] rounded-full border border-white/45 bg-white/70 shadow-[0_3px_8px_rgba(15,23,42,0.06)]" />
        </motion.div>
      )}
    </div>
  );
}
