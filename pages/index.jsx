import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
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
    editedText: "Edited 2 minute ago",
  },
];

export default function Home() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(2); // Default to "AI 회의록 기획 토론"
  const [scale, setScale] = useState(1);
  const [isPortrait, setIsPortrait] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Responsive scaling & orientation detection
  useEffect(() => {
    const handleResize = () => {
      const portrait = window.innerHeight > window.innerWidth || window.innerWidth < 768;
      setIsPortrait(portrait);

      if (portrait) {
        setScale(1);
      } else {
        const baseWidth = 1128;
        const baseHeight = 610;
        
        const paddingX = 48; // 24px padding on each side
        const paddingY = 140; // Top and bottom padding
        
        const availableWidth = window.innerWidth - paddingX;
        const availableHeight = window.innerHeight - paddingY;
        
        const scaleX = availableWidth / baseWidth;
        const scaleY = availableHeight / baseHeight;
        
        // Fit to screen by choosing the smaller scale factor, capped at 1.1
        const newScale = Math.min(scaleX, scaleY);
        setScale(Math.min(Math.max(newScale, 0.35), 1.1));
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : SEEDED_PROJECTS.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < SEEDED_PROJECTS.length - 1 ? prev + 1 : 0));
  };

  const handleEnterProject = (projectId) => {
    console.log("Entering project workspace with ID:", projectId);
    void router.push(`/projects/${projectId}`);
  };

  return (
    <main className={`relative min-h-screen ${isPortrait ? "overflow-y-auto pb-24" : "overflow-hidden"} bg-[#D5E4E6] text-slate-900 flex flex-col justify-start py-12 px-6`}>
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[#D5E4E6]" />
      <div className="pointer-events-none absolute inset-0 z-8 opacity-45">
        <ColorBends
          colors={["#6FB1BD", "#FFFFFF", "#358A9C60", "#9BE3EB", "#2B798A40", "#FFFFFF80"]}
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
        className="pointer-events-none absolute inset-0 z-[30] bg-[#D5E4E6]/35 backdrop-blur-[6px]"
        aria-hidden
      />

      {/* Main Container (Frame 1410167874) */}
      <div
        className={`${
          isPortrait 
            ? "relative mx-auto flex flex-col items-center justify-start z-40 w-full max-w-[400px] gap-12 mt-8" 
            : "absolute left-1/2 top-1/2 flex flex-col items-center justify-start z-40 transition-all duration-300 ease-out"
        }`}
        style={
          isPortrait 
            ? {} 
            : {
                width: "1128px",
                height: "610px",
                gap: "103px",
                transform: `translate(-50%, -50%) scale(${scale})`,
                transformOrigin: "center center",
              }
        }
      >
        {/* Header Section (Frame 1410167853) */}
        <div
          className="flex flex-col items-center justify-start"
          style={
            isPortrait 
              ? { width: "100%", gap: "20px" } 
              : { width: "536px", height: "160px", gap: "32px" }
          }
        >
          {/* Visual node Program Pill (Frame 1410167826) */}
          <div
            className="flex flex-col items-start justify-center"
            style={{
              width: "172.8px",
              height: "30.4px",
              padding: "7.2px 16px 8px",
              background: "rgba(255, 255, 255, 0.32)",
              borderRadius: "17px",
            }}
          >
            <div
              className="flex flex-row items-end"
              style={{
                width: "141px",
                height: "15.2px",
                gap: "6.4px",
              }}
            >
              {/* Vector (Icon) */}
              <Sparkles
                style={{
                  width: "13.7px",
                  height: "15px",
                  color: "#576E78",
                }}
              />
              {/* Text */}
              <span
                style={{
                  width: "120.8px",
                  height: "15.2px",
                  fontFamily: "'Pretendard Variable', sans-serif",
                  fontStyle: "normal",
                  fontWeight: "500",
                  fontSize: "12.8px",
                  lineHeight: "15.2px",
                  textAlign: "center",
                  color: "#576E78",
                }}
              >
                Visual node Program
              </span>
            </div>
          </div>

          {/* Title & Subtitle Container (Frame 1410167852) */}
          <div
            className="flex flex-col items-center justify-start"
            style={
              isPortrait 
                ? { width: "100%", gap: "8px" } 
                : { width: "536px", height: "97.6px", gap: "8px" }
            }
          >
            {/* Nodi */}
            <h1
              style={{
                width: "100%",
                fontFamily: "'Instrument Sans', sans-serif",
                fontStyle: "normal",
                fontWeight: "600",
                fontSize: isPortrait ? "44px" : "51.2px",
                lineHeight: isPortrait ? "52px" : "62.4px",
                textAlign: "center",
                color: "#0D3040",
              }}
            >
              Nodi
            </h1>
            {/* Subtitle */}
            <p
              style={{
                width: "100%",
                fontFamily: "'Instrument Sans', sans-serif",
                fontStyle: "normal",
                fontWeight: "400",
                fontSize: isPortrait ? "18px" : "22.4px",
                lineHeight: isPortrait ? "24px" : "27.2px",
                textAlign: "center",
                color: "#4C656F",
              }}
            >
              Generative AI-Powered Node-Based Meeting Notes
            </p>
          </div>
        </div>

        {/* Carousel Section (Frame 1410167856) */}
        <div
          className="flex flex-col items-center justify-start"
          style={
            isPortrait 
              ? { width: "100%", gap: "24px" } 
              : { width: "1128px", height: "346.4px", gap: "20.8px" }
          }
        >
          {/* Cards Container (Frame 1410167851) */}
          <div
            className={`relative flex ${isPortrait ? "flex-col" : "flex-row"} items-center justify-center`}
            style={
              isPortrait 
                ? { width: "100%", gap: "28px", padding: "20px 0" } 
                : { width: "1128px", height: "289.6px", gap: "16px" }
            }
          >
            {/* Background line (Horizontal for landscape, Vertical for portrait) */}
            {isPortrait ? (
              <div className="absolute top-0 bottom-0 left-1/2 w-[1px] border-l border-dashed border-[#7BA592]/30 z-0" />
            ) : (
              <div className="absolute left-0 right-0 top-1/2 h-[1px] border-t border-dashed border-[#7BA592]/30 z-0" />
            )}

            {SEEDED_PROJECTS.map((project, idx) => {
              const isActive = isPortrait ? (hoveredIndex === idx || (hoveredIndex === null && idx === 2)) : (idx === activeIndex);
              const distance = Math.abs(idx - activeIndex);

              // Dynamic styles based on distance & orientation
              let cardWidth, cardHeight, cardOpacity, cardRadius, cardShadow, cardPadding, cardGap;
              let innerBg, innerRadius, innerPadding, innerGap;
              let titleGap, titleFontSize, titleLineHeight, subtitleFontSize, subtitleLineHeight;
              let tagsGap, tagPadding, tagFontSize, tagLineHeight;
              let footerWidth, footerHeight, footerFontSize, footerLineHeight, arrowBtnSize, arrowBtnRadius;

              if (isPortrait) {
                // Optimized vertical card sizes for portrait screen
                cardWidth = 280;
                cardHeight = 320;
                cardOpacity = 0.95;
                cardRadius = "24px";
                cardShadow = isActive 
                  ? "0px 16px 40px rgba(114, 114, 114, 0.18)" 
                  : "0px 10px 24px rgba(0, 0, 0, 0.04)";
                cardPadding = "10px";
                cardGap = "8px";

                innerBg = isActive ? "#CEF8F1" : "#EEF5F3";
                innerRadius = "18px";
                innerPadding = "20px 24px";
                innerGap = "44px";

                titleGap = "4px";
                titleFontSize = "18px";
                titleLineHeight = "22px";
                subtitleFontSize = "13px";
                subtitleLineHeight = "16px";

                tagsGap = "3px";
                tagPadding = "4px 10px";
                tagFontSize = "11px";
                tagLineHeight = "13px";

                footerWidth = "220px";
                footerHeight = "30px";
                footerFontSize = "11px";
                footerLineHeight = "13px";
                arrowBtnSize = "30px";
                arrowBtnRadius = "6px";
              } else {
                // Landscape dynamic sizing (Scaled by 0.8)
                cardWidth = isActive ? 253 : (distance === 1 ? 221.6 : 183.8);
                cardHeight = isActive ? 289.6 : (distance === 1 ? 253.6 : 210.4);
                cardOpacity = isActive ? 1 : (distance === 1 ? 0.75 : 0.38);
                cardRadius = isActive ? "27.4px" : (distance === 1 ? "24px" : "19.9px");
                cardShadow = isActive
                  ? "0px 20.1px 51.8px rgba(114, 114, 114, 0.21)"
                  : (distance === 1
                    ? "0px 17.6px 45.4px rgba(114, 114, 114, 0.14)"
                    : "0px 14.6px 37.6px rgba(114, 114, 114, 0.14)");
                cardPadding = isActive
                  ? "9.1px 9.1px 11.9px"
                  : (distance === 1 ? "8px 8px 10.4px" : "6.6px 6.6px 8.6px");
                cardGap = isActive ? "9.1px" : (distance === 1 ? "8px" : "6.6px");

                innerBg = isActive ? "#CEF8F1" : "#EEF5F3";
                innerRadius = isActive ? "21px" : (distance === 1 ? "18.4px" : "15.2px");
                innerPadding = isActive
                  ? "22px 30px 25px 16px"
                  : (distance === 1 ? "19.2px 26.4px 22.4px 14.4px" : "15.9px 21.9px 18.6px 11.9px");
                innerGap = isActive ? "59.4px" : (distance === 1 ? "52px" : "43.1px");

                titleGap = isActive ? "5.5px" : (distance === 1 ? "4.8px" : "4px");
                titleFontSize = isActive ? "20.1px" : (distance === 1 ? "17.6px" : "14.6px");
                titleLineHeight = isActive ? "24px" : (distance === 1 ? "20.8px" : "17.6px");
                subtitleFontSize = isActive ? "14.6px" : (distance === 1 ? "12.8px" : "10.6px");
                subtitleLineHeight = isActive ? "17.6px" : (distance === 1 ? "15.2px" : "12.8px");

                tagsGap = isActive ? "3.6px" : (distance === 1 ? "3.2px" : "2.6px");
                tagPadding = isActive
                  ? "4.5px 12.8px 5.5px"
                  : (distance === 1 ? "4px 11.2px 4.8px" : "3.3px 9.3px 4px");
                tagFontSize = isActive ? "12.8px" : (distance === 1 ? "11.2px" : "9.3px");
                tagLineHeight = isActive ? "15.2px" : (distance === 1 ? "13.6px" : "11.2px");

                footerWidth = isActive ? "205.5px" : (distance === 1 ? "180px" : "149.3px");
                footerHeight = isActive ? "33.8px" : (distance === 1 ? "29.6px" : "24.6px");
                footerFontSize = isActive ? "12.8px" : (distance === 1 ? "11.2px" : "9.3px");
                footerLineHeight = isActive ? "15.2px" : (distance === 1 ? "13.6px" : "11.2px");
                arrowBtnSize = isActive ? "33.8px" : (distance === 1 ? "29.6px" : "24.6px");
                arrowBtnRadius = isActive ? "6.4px" : (distance === 1 ? "5.6px" : "4.6px");
              }

              return (
                <motion.div
                  key={project.id}
                  onClick={() => {
                    console.log("Card clicked:", project.id, "isActive:", isActive);
                    handleEnterProject(project.id);
                  }}
                  onMouseEnter={() => isPortrait && setHoveredIndex(idx)}
                  onMouseLeave={() => isPortrait && setHoveredIndex(null)}
                  animate={
                    isPortrait 
                      ? { scale: isActive ? 1.03 : 1, y: 0 }
                      : { width: cardWidth, height: cardHeight, opacity: cardOpacity }
                  }
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    background: "#FFFFFF",
                    boxShadow: cardShadow,
                    borderRadius: cardRadius,
                    padding: cardPadding,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "relative",
                  }}
                  className="select-none z-10 shrink-0"
                >
                  {/* Connector dots (Top/Bottom for Portrait, Left/Right for Landscape) */}
                  {isPortrait ? (
                    <>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#7BA592]/50 border border-white" />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-[#7BA592]/50 border border-white" />
                    </>
                  ) : (
                    <>
                      <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#7BA592]/50 border border-white" />
                      <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#7BA592]/50 border border-white" />
                    </>
                  )}

                  {/* Frame 1410167839 (Inner Container) */}
                  <div
                    className="flex flex-col items-center"
                    style={{
                      width: "100%",
                      height: "100%",
                      gap: cardGap,
                    }}
                  >
                    {/* Frame 1410167836 (Main Content Block) */}
                    <div
                      className="flex flex-col items-start justify-start"
                      style={{
                        width: "100%",
                        height: "calc(100% - " + footerHeight + "px - " + cardGap + "px)",
                        background: innerBg,
                        borderRadius: innerRadius,
                        padding: innerPadding,
                      }}
                    >
                      {/* Frame 1410167835 */}
                      <div
                        className="flex flex-col items-start justify-start"
                        style={{
                          width: "100%",
                          height: "100%",
                          gap: innerGap,
                        }}
                      >
                        {/* Frame 1410167831 (Title & Subtitle) */}
                        <div
                          className="flex flex-col items-start justify-start"
                          style={{
                            width: "100%",
                            gap: titleGap,
                          }}
                        >
                          {/* Title */}
                          <h3
                            style={{
                              width: "100%",
                              fontFamily: "'Pretendard Variable', sans-serif",
                              fontStyle: "normal",
                              fontWeight: "500",
                              fontSize: titleFontSize,
                              lineHeight: titleLineHeight,
                              color: "#0D3040",
                            }}
                            className="line-clamp-1"
                          >
                            {project.title}
                          </h3>
                          {/* Subtitle */}
                          <p
                            style={{
                              width: "100%",
                              fontFamily: "'Pretendard Variable', sans-serif",
                              fontStyle: "normal",
                              fontWeight: "400",
                              fontSize: subtitleFontSize,
                              lineHeight: subtitleLineHeight,
                              color: "#576E78",
                            }}
                            className="line-clamp-2"
                          >
                            {project.subtitle}
                          </p>
                        </div>

                        {/* Frame 1410167834 (Members/Tags) */}
                        <div
                          className="flex flex-col items-start justify-start"
                          style={{
                            width: "100%",
                            gap: tagsGap,
                          }}
                        >
                          {/* Row 1 (Frame 1410167832) */}
                          <div
                            className="flex flex-row items-center"
                            style={{
                              width: "100%",
                              gap: tagsGap,
                            }}
                          >
                            {project.members.slice(0, 3).map((member, mIdx) => (
                              <div
                                key={member}
                                className="flex flex-row justify-center items-center"
                                style={{
                                  background: mIdx === 0 ? "#79DBC9" : "#BFDDD8",
                                  borderRadius: "28px",
                                  padding: tagPadding,
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily: "'Pretendard Variable', sans-serif",
                                    fontStyle: "normal",
                                    fontWeight: "400",
                                    fontSize: tagFontSize,
                                    lineHeight: tagLineHeight,
                                    color: "#576E78",
                                  }}
                                >
                                  {member}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Row 2 (Frame 1410167833) */}
                          {project.members.length > 3 && (
                            <div
                              className="flex flex-row items-center"
                              style={{
                                width: "100%",
                                gap: tagsGap,
                              }}
                            >
                              {project.members.slice(3).map((member) => (
                                <div
                                  key={member}
                                  className="flex flex-row justify-center items-center"
                                  style={{
                                    background: "#BFDDD8",
                                    borderRadius: "28px",
                                    padding: tagPadding,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontFamily: "'Pretendard Variable', sans-serif",
                                      fontStyle: "normal",
                                      fontWeight: "400",
                                      fontSize: tagFontSize,
                                      lineHeight: tagLineHeight,
                                      color: "#576E78",
                                    }}
                                  >
                                    {member}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Frame 1410167838 (Footer) */}
                    <div
                      className="flex flex-row justify-between items-center"
                      style={{
                        width: footerWidth,
                        height: footerHeight,
                      }}
                    >
                      {/* Edited Text */}
                      <span
                        style={{
                          fontFamily: "'Pretendard Variable', sans-serif",
                          fontStyle: "normal",
                          fontWeight: "400",
                          fontSize: footerFontSize,
                          lineHeight: footerLineHeight,
                          color: "#757E82",
                        }}
                      >
                        {project.editedText}
                      </span>

                      {/* Arrow Button (Frame 1410167837) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Arrow button clicked:", project.id);
                          handleEnterProject(project.id);
                        }}
                        className="flex flex-col items-center justify-center hover:opacity-80 transition-opacity"
                        style={{
                          width: arrowBtnSize,
                          height: arrowBtnSize,
                          background: "#F4F4F4",
                          borderRadius: arrowBtnRadius,
                          border: "none",
                          padding: "0",
                        }}
                      >
                        <svg
                          width={isActive ? 11.88 : (distance === 1 ? 10.4 : 8.6)}
                          height="10"
                          viewBox="0 0 15 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1 6H14M14 6L9 1M14 6L9 11"
                            stroke="#0D3040"
                            strokeWidth={isActive ? 1.71293 : (distance === 1 ? 1.5 : 1.24448)}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Navigation Controls (Frame 1410167855 - Hidden in Portrait Mode) */}
          {!isPortrait && (
            <div
              className="flex flex-col justify-center items-center"
              style={{
                width: "109.6px",
                height: "36px",
                background: "rgba(255, 255, 255, 0.36)",
                borderRadius: "24px",
                padding: "9.6px 12px 10.4px",
              }}
            >
              {/* Frame 1410167854 */}
              <div
                className="flex flex-row justify-between items-center"
                style={{
                  width: "85.6px",
                  height: "21.6px",
                }}
              >
                {/* chevron-left */}
                <button
                  onClick={handlePrev}
                  className="flex items-center justify-center hover:opacity-70 transition-opacity"
                  style={{
                    width: "21.6px",
                    height: "21.6px",
                    background: "none",
                    border: "none",
                    padding: "0",
                    cursor: "pointer",
                  }}
                  aria-label="Previous"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.5 2L3.5 6L8.5 10"
                      stroke="#0D3040"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Divider (Rectangle 240655900) */}
                <div
                  style={{
                    width: "1px",
                    height: "21.6px",
                    background: "#C3CFD4",
                  }}
                />

                {/* chevron-right */}
                <button
                  onClick={handleNext}
                  className="flex items-center justify-center hover:opacity-70 transition-opacity"
                  style={{
                    width: "21.6px",
                    height: "21.6px",
                    background: "none",
                    border: "none",
                    padding: "0",
                    cursor: "pointer",
                  }}
                  aria-label="Next"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.5 2L8.5 6L3.5 10"
                      stroke="#0D3040"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
