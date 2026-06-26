"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, ChevronDown } from "lucide-react";
import {
  ActionStepIcon,
  DecisionStepIcon,
  IdeaStepIcon,
  PhaseStepButton,
  ResearchStepIcon,
  SolutionStepIcon,
} from "@/components/thinkingMachine/ui/PhaseStepperIcons";

const TOPBAR_TEXT_STYLE = {
  fontFamily: '"Pretendard Variable", sans-serif',
  lineHeight: "180%",
  letterSpacing: "normal",
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

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-[60] px-[42px] pt-[20px]">
      <div className="flex flex-col items-start gap-2.5 w-full">
        
        {/* Main Top Bar Row (3-Column Responsive Layout) */}
        <div className="flex flex-row items-center w-full h-[36px]">
          
          {/* Left Column: Project Breadcrumb (Frame 1410167881) */}
          <div className="flex-1 flex justify-start">
            <div
              className="pointer-events-auto flex flex-row items-center"
              style={{
                width: "302.02px",
                height: "26px",
                gap: "10px",
              }}
            >
              {/* Home Icon (3dR2lv / Group / Vector) */}
              <Link
                href="/"
                className="hover:opacity-75 transition-opacity flex items-center justify-center cursor-pointer"
                style={{
                  width: "18px",
                  height: "15px",
                }}
                aria-label="Home"
              >
                <Home className="h-[15px] w-[18px] text-[#404045]" strokeWidth={2.2} />
              </Link>

              {/* Project workspace / Title Text */}
              <div
                className="flex items-center text-[14px] font-medium text-[#404045]"
                style={{
                  ...TOPBAR_TEXT_STYLE,
                  width: "269px",
                  height: "26px",
                }}
              >
                <Link href={projectMetaHref} className="transition hover:text-slate-900">
                  {projectMetaLabel}
                </Link>
                <span className="mx-1.5 text-slate-400">/</span>
                <div className="min-w-0 flex-1">
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
                      className="w-full border-none bg-transparent p-0 text-[14px] font-medium text-[#404045] outline-none shadow-none"
                      style={TOPBAR_TEXT_STYLE}
                      aria-label="Project title"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingTitle(true)}
                      className="w-full truncate text-left text-[14px] font-medium text-[#404045] transition hover:text-slate-900"
                      style={TOPBAR_TEXT_STYLE}
                      title="Rename project"
                    >
                      {projectTitle || "Untitled Project"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Phase Stepper (Frame 1410167788) */}
          <div className="flex justify-center">
            <div
              className="pointer-events-auto flex items-center justify-center"
              style={{
                boxSizing: "border-box",
                width: "268px",
                height: "42px",
                background: "rgba(255, 255, 255, 0.64)",
                boxShadow: "inset 0 0 0 1px #FFFFFF",
                borderRadius: "35px",
                padding: "5px 8px",
              }}
            >
              <div className="relative h-[32px] w-[252px] shrink-0 isolation-isolate">
                {/* Dashed connectors (Frame 1410167807) */}
                <div
                  className="absolute left-[35px] top-1/2 z-0 flex -translate-y-1/2 flex-row items-center"
                  style={{ width: "182px", height: 0, gap: "38px" }}
                >
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="border-t border-dashed border-[#C4CED1]"
                      style={{ width: "17px", height: 0 }}
                    />
                  ))}
                </div>

                {/* Phase buttons (Frame 1410167806) */}
                <div
                  className="absolute inset-0 z-10 flex flex-row items-center"
                  style={{ width: "252px", height: "32px", gap: "23px" }}
                >
                  <PhaseStepButton active title="Idea">
                    <IdeaStepIcon />
                  </PhaseStepButton>
                  <PhaseStepButton title="Research">
                    <ResearchStepIcon />
                  </PhaseStepButton>
                  <PhaseStepButton title="Solution">
                    <SolutionStepIcon />
                  </PhaseStepButton>
                  <PhaseStepButton title="Decision">
                    <DecisionStepIcon />
                  </PhaseStepButton>
                  <PhaseStepButton title="Action">
                    <ActionStepIcon />
                  </PhaseStepButton>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Members Panel (Frame 1410167793) */}
          <div className="flex-1 flex justify-end">
            <div
              className="pointer-events-auto flex flex-row items-center"
              style={{
                width: "172px",
                height: "36px",
                gap: "5px",
              }}
            >
              {/* Frame 1410167786 (Active Speaker / TaeEun) */}
              <div
                className="relative flex flex-col items-start"
                style={{
                  boxSizing: "border-box",
                  width: "56px",
                  height: "36px",
                  background: "rgba(255, 255, 255, 0.64)",
                  border: "1px solid #FFFFFF",
                  boxShadow: "3px 3px 6px rgba(0, 0, 0, 0.05)",
                  borderRadius: "35px",
                  padding: "3px 9px",
                  gap: "8px",
                }}
              >
                {/* Frame 1410167781 (Active Speaker Circle - T) */}
                <div
                  className="absolute flex items-center justify-center text-white"
                  style={{
                    width: "26px",
                    height: "26px",
                    left: "9px",
                    top: "4px",
                    background: "#A2E1E4",
                    boxShadow: "0px 0px 17.8px rgba(194, 255, 169, 0.8)",
                    borderRadius: "15.5px",
                  }}
                >
                  <span className="text-[13px] font-normal leading-[15px]">T</span>
                </div>

                {/* Frame 1410167792 (Voice/Audio Indicator) */}
                <div
                  className="absolute flex flex-row items-start"
                  style={{
                    width: "16px",
                    height: "16px",
                    left: "31px",
                    top: "3px",
                    background: "#EBFFA3",
                    borderRadius: "9px",
                    padding: "2.5px 3.2px",
                    gap: "6px",
                  }}
                >
                  {/* Frame 1410167791 (Equalizer Bars) */}
                  <div className="flex flex-row items-center gap-[1.2px]" style={{ width: "9px", height: "10px" }}>
                    <div className="bg-[#4FC4C4] rounded-[21px]" style={{ width: "2px", height: "6px" }} />
                    <div className="bg-[#4FC4C4] rounded-[21px]" style={{ width: "2px", height: "10px" }} />
                    <div className="bg-[#4FC4C4] rounded-[21px]" style={{ width: "2px", height: "4.5px" }} />
                  </div>
                </div>
              </div>

              {/* Frame 1410167785 (Other Team Members List) */}
              <div
                className="relative"
                style={{
                  boxSizing: "border-box",
                  width: "111px",
                  height: "36px",
                  background: "rgba(255, 255, 255, 0.64)",
                  border: "1px solid #FFFFFF",
                  boxShadow: "3px 3px 6px rgba(0, 0, 0, 0.05)",
                  borderRadius: "35px",
                }}
              >
                {/* Frame 1410167783 (Hyeonji - Pink) */}
                <div
                  className="absolute flex items-center justify-center text-white border border-white"
                  style={{
                    width: "26px",
                    height: "26px",
                    left: "7px",
                    top: "4px",
                    background: "#FFA6E9",
                    borderRadius: "15.5px",
                  }}
                >
                  <span className="text-[13px] font-normal leading-[15px]">H</span>
                </div>

                {/* Frame 1410167782 (Jimin - Blue) */}
                <div
                  className="absolute flex items-center justify-center text-white border border-white"
                  style={{
                    width: "26px",
                    height: "26px",
                    left: "29px",
                    top: "4px",
                    background: "#99B8E0",
                    borderRadius: "15.5px",
                  }}
                >
                  <span className="text-[13px] font-normal leading-[15px]">J</span>
                </div>

                {/* Frame 1410167780 (Sooyun - Dark Blue) */}
                <div
                  className="absolute flex items-center justify-center text-white border border-white"
                  style={{
                    width: "26px",
                    height: "26px",
                    left: "51px",
                    top: "4px",
                    background: "#2C3E81",
                    borderRadius: "15.5px",
                  }}
                >
                  <span className="text-[13px] font-normal leading-[15px]">S</span>
                </div>

                {/* Chevron Down (Dropdown Arrow) */}
                <div
                  className="absolute flex items-center justify-center"
                  style={{
                    width: "20px",
                    height: "20px",
                    left: "83px",
                    top: "7px",
                  }}
                >
                  <ChevronDown className="h-3.5 w-3.5 text-[#C5C5C5]" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Date Row: Date Button / Minutes Pill (Frame 1410167776) */}
        <div className="flex flex-row items-center justify-start w-full">
          <div
            className="pointer-events-auto flex flex-col items-start"
            style={{
              width: "112px",
              height: "32px",
              background: "rgba(255, 255, 255, 0.69)",
              boxShadow: "3.02016px 3.02016px 6.04032px 0.604032px rgba(0, 0, 0, 0.05)",
              borderRadius: "11px",
              padding: "8px 11px",
              gap: "8px",
              marginTop: "2px",
            }}
          >
            {/* Frame 1410167857 */}
            <div
              className="flex flex-row items-center"
              style={{
                width: "90px",
                height: "15px",
                gap: "10px",
              }}
            >
              {/* Date Text */}
              <span
                className="font-medium text-slate-500"
                style={{
                  fontFamily: '"Pretendard Variable", sans-serif',
                  fontSize: "11px",
                  lineHeight: "126%",
                  color: "#667081",
                  width: "63px",
                  height: "15px",
                }}
              >
                {currentDateLabel}
              </span>

              {/* Document Icon (Group 1410167618) */}
              <div
                className="relative"
                style={{
                  width: "14px",
                  height: "12px",
                }}
              >
                <div
                  className="absolute border border-[#667081]"
                  style={{
                    width: "14px",
                    height: "12px",
                    borderRadius: "2.5px",
                  }}
                />
                <div
                  className="absolute border-r border-[#667081] bg-[#667081]/15"
                  style={{
                    width: "5.8px",
                    height: "12px",
                    borderRadius: "2.5px 0px 0px 2.5px",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
