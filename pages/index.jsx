import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";

const DotGrid = dynamic(() => import("@/components/DotGrid/DotGrid"), { ssr: false });
const ColorBends = dynamic(() => import("@/components/ColorBends/ColorBends"), { ssr: false });

const SEEDED_PROJECTS = [
  {
    id: "project-ai-search",
    title: "AI 검색 기능 정의",
    subtitle: "사용자의 검색 맥락을 이해하는 생성형 검색 경험 설계",
    members: ["Hyeonji", "Jinki", "Taeeun", "Eunsol"],
    editedText: "Edited 7 days ago",
  },
  {
    id: "project-smart-home",
    title: "공감지능 스마트 홈",
    subtitle: "에이전트를 탑재한 스마트 홈 비전을 통한 IoT 기기 조율 기획",
    members: ["Hyeonji", "Sooyun", "Jimin", "Eunsol", "Taeeun"],
    editedText: "Edited 6 days ago",
  },
  {
    id: "project-ai-meeting",
    title: "AI 회의록 기획 토론",
    subtitle: "온라인 상에서의 회의를 도와주는 STT AI 회의록 서비스",
    members: ["Hyeonji", "Sooyun", "Jimin", "Taeeun"],
    editedText: "Edited 2 days ago",
  },
  {
    id: "project-onboarding-ux",
    title: "신규 온보딩 UX 개선",
    subtitle: "첫 사용자의 진입 장벽을 줄이기 위한 서비스 구조 개선 논의",
    members: ["Hyeonji", "Jiyu", "Taeeun"],
    editedText: "Edited 1 days ago",
  },
  {
    id: "project-dashboard-design",
    title: "프로젝트 대시보드 설계",
    subtitle: "팀의 업무 현황을 한눈에 파악할 수 있는 관리 인터페이스 기획",
    members: ["Hyeonji", "Sooyun", "Jimin", "Taeeun"],
    editedText: "Edited 2 minutes ago",
  },
];

export default function Home() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(2); // Default to "AI 회의록 기획 토론"

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : SEEDED_PROJECTS.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < SEEDED_PROJECTS.length - 1 ? prev + 1 : 0));
  };

  const handleEnterProject = (projectId) => {
    void router.push(`/projects/${projectId}`);
  };

  return (
    <main className="relative h-dvh overflow-hidden bg-[#F3F8F8] text-slate-900 flex flex-col justify-between py-12">
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[#F3F8F8]" />
      <div className="pointer-events-none absolute inset-0 z-8 opacity-30">
        <ColorBends
          colors={["#7BA592", "#8FDDAF", "#349B6D73", "#9DE7CB", "#349B6D73", "#76D7A1"]}
          rotation={100}
          speed={0.32}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          parallax={0.5}
          noise={0}
          transparent
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-20 opacity-10">
        <DotGrid
          dotSize={2}
          gap={10}
          baseColor="#6d8ea5"
          activeColor="#cce8ff"
          proximity={130}
          shockRadius={260}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-[30] bg-[#F3F8F8]/20 backdrop-blur-[10px]"
        aria-hidden
      />

      {/* Header Section */}
      <div className="relative z-40 mx-auto text-center select-none caret-transparent px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/60 px-4 py-1.5 text-[11px] font-semibold text-[#557A6C] shadow-[0_8px_24px_rgba(123,165,146,0.12)] backdrop-blur-md"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#7BA592]" />
          Visual node Program
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="mt-6 text-5xl font-bold tracking-[-0.03em] text-[#1E3E3F] sm:text-6xl"
        >
          Nodi
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="mt-4 text-sm font-medium text-[#557A6C] sm:text-base"
        >
          Generative AI-Powered Node-Based Meeting Notes
        </motion.p>
      </div>

      {/* Carousel Section */}
      <div className="relative z-40 w-full overflow-hidden flex flex-col items-center justify-center my-auto">
        {/* Background horizontal line */}
        <div className="absolute left-0 right-0 top-1/2 h-[1px] border-t border-dashed border-[#7BA592]/30 z-0" />

        <div className="relative w-full flex justify-center items-center h-[380px] overflow-visible">
          <div className="absolute flex justify-center items-center">
            <motion.div
              animate={{ x: (2 - activeIndex) * 324 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="flex gap-6 items-center"
            >
              {SEEDED_PROJECTS.map((project, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <motion.div
                    key={project.id}
                    onClick={() => {
                      if (isActive) {
                        handleEnterProject(project.id);
                      } else {
                        setActiveIndex(idx);
                      }
                    }}
                    animate={{
                      scale: isActive ? 1.05 : 0.9,
                      opacity: isActive ? 1 : 0.6,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`relative w-[300px] h-[340px] shrink-0 rounded-[28px] cursor-pointer flex flex-col justify-between transition-all duration-300 select-none z-10 ${
                      isActive
                        ? "bg-[#D2F6EC] shadow-[0_20px_50px_rgba(123,165,146,0.25)]"
                        : "bg-white/80 border border-white/40 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:bg-white/90"
                    }`}
                  >
                    {/* Left connector dot */}
                    <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#7BA592]/50 border border-white" />
                    {/* Right connector dot */}
                    <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#7BA592]/50 border border-white" />

                    {/* Card Body */}
                    <div className="p-6 flex-1 flex flex-col justify-start">
                      <h3 className={`text-xl font-bold tracking-[-0.02em] ${isActive ? "text-[#1B3B32]" : "text-slate-800"}`}>
                        {project.title}
                      </h3>
                      <p className={`mt-2 text-xs leading-relaxed ${isActive ? "text-[#4A6E55]" : "text-slate-500"}`}>
                        {project.subtitle}
                      </p>
                      
                      {/* Members/Tags */}
                      <div className="mt-6 flex flex-wrap gap-1.5">
                        {project.members.map((member) => (
                          <span
                            key={member}
                            className={`px-3 py-1 rounded-full text-[11px] font-medium ${
                              isActive
                                ? "bg-[#B5EFE4] text-[#1B3B32]"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div
                      className={`px-6 py-4 flex items-center justify-between ${
                        isActive
                          ? "bg-white rounded-b-[28px] border-t border-slate-100"
                          : "border-t border-slate-100/50"
                      }`}
                    >
                      <span className={`text-[11px] font-medium ${isActive ? "text-[#7BA592]" : "text-slate-400"}`}>
                        {project.editedText}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnterProject(project.id);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isActive
                            ? "bg-slate-100 hover:bg-[#D2F6EC] text-slate-800"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="relative z-40 mx-auto flex justify-center px-6">
        <div className="flex items-center gap-4 rounded-full border border-slate-200/60 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-md">
          <button
            onClick={handlePrev}
            className="text-slate-600 hover:text-slate-900 transition p-1"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="h-4 w-[1px] bg-slate-300" />
          <button
            onClick={handleNext}
            className="text-slate-600 hover:text-slate-900 transition p-1"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
