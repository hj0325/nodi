"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Folder,
  FileText,
  Calendar,
  Lightbulb,
  Search,
  MessageSquare,
  Zap,
  ChevronRight,
} from "lucide-react";

const TOPBAR_TEXT_STYLE = {
  fontFamily: '"Pretendard Variable", "Instrument Sans", sans-serif',
  lineHeight: "110%",
  letterSpacing: "-0.32px",
};

export default function TopBar({
  projectTitle = "Thinking Machine",
  onProjectTitleChange,
  projectMetaHref = "/projects",
  projectMetaLabel = "Project workspace",
  teamMembers = [],
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(projectTitle);

  useEffect(() => {
    setDraftTitle(projectTitle);
  }, [projectTitle]);

  const commitTitle = () => {
    const nextTitle = draftTitle.trim() || "Untitled Project";
    setDraftTitle(nextTitle);
    onProjectTitleChange?.(nextTitle);
    setIsEditingTitle(false);
  };

  // Get current date formatted as MM.DD
  const currentDateLabel = (() => {
    const d = new Date();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const date = d.getDate().toString().padStart(2, "0");
    return `${month}.${date} 회의록`;
  })();

  // Default avatars as shown in the second image
  const defaultAvatars = [
    { label: "T", name: "TaeEun", bg: "bg-teal-400 text-teal-900" },
    { label: "H", name: "HyeonJi", bg: "bg-pink-400 text-pink-900" },
    { label: "J", name: "JaeWon", bg: "bg-sky-400 text-sky-900" },
    { label: "S", name: "SangHun", bg: "bg-purple-400 text-purple-900" },
  ];

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-[60] px-6 py-4">
      <div className="flex items-center justify-between w-full">
        
        {/* Left: Project Breadcrumb & Date Button */}
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200/60 bg-white/80 px-3.5 py-2 shadow-sm backdrop-blur-md">
            <Folder className="h-4 w-4 text-[#7BA592]" />
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-600" style={TOPBAR_TEXT_STYLE}>
              <Link href={projectMetaHref} className="transition hover:text-slate-900">
                {projectMetaLabel}
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <div className="min-w-0 max-w-[150px]">
                {isEditingTitle ? (
                  <input
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    onBlur={commitTitle}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        commitTitle();
                      }
                      if (event.key === "Escape") {
                        setDraftTitle(projectTitle || "Untitled Project");
                        setIsEditingTitle(false);
                      }
                    }}
                    autoFocus
                    className="w-full border-none bg-transparent p-0 text-[13px] font-bold text-slate-800 outline-none shadow-none"
                    style={TOPBAR_TEXT_STYLE}
                    aria-label="Project title"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingTitle(true)}
                    className="w-full truncate text-left text-[13px] font-bold text-slate-700 transition hover:text-slate-900"
                    style={TOPBAR_TEXT_STYLE}
                    title="Rename project"
                  >
                    {projectTitle || "Untitled Project"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Date Button */}
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200/60 bg-white/80 px-3.5 py-2 text-[12.5px] font-bold text-slate-600 shadow-sm backdrop-blur-md transition hover:bg-white"
          >
            <FileText className="h-4 w-4 text-[#7BA592]" />
            <span>{currentDateLabel}</span>
          </button>
        </div>

        {/* Center: Quick Action Icons */}
        <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-slate-200/60 bg-white/80 p-1 shadow-sm backdrop-blur-md">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            title="AI 제안"
          >
            <Lightbulb className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            title="검색 및 확대"
          >
            <Search className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            title="메시지"
          >
            <MessageSquare className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            title="퀵 액션"
          >
            <Zap className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Right: Team Member Avatars */}
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-2xl border border-slate-200/60 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-md">
          <div className="flex -space-x-1.5 overflow-hidden">
            {defaultAvatars.map((avatar) => (
              <div
                key={avatar.label}
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold shadow-sm ${avatar.bg}`}
                title={avatar.name}
              >
                {avatar.label}
              </div>
            ))}
          </div>
        </div>

      </div>
    </header>
  );
}
