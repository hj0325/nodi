"use client";

import { useMemo } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  getDefaultTeamMembers,
  getParticipantMeta,
  sortParticipants,
} from "@/lib/thinkingMachine/participantMeta";

const AVATAR_SPRING = { type: "spring", stiffness: 420, damping: 32, mass: 0.7 };
const PILL_SPRING = { type: "spring", stiffness: 360, damping: 30, mass: 0.8 };
const SPEAKER_PILL_WIDTH = 56;
const ROSTER_GAP = 5;
const ROSTER_WIDTH_COMPACT = 111;
const ROSTER_WIDTH_FULL = 134;

function VoiceIndicator({ intense = false }) {
  const bars = [
    { height: 6, delay: 0 },
    { height: 10, delay: 0.12 },
    { height: 4.5, delay: 0.24 },
  ];

  return (
    <motion.div
      className="absolute flex flex-row items-start"
      style={{
        width: "16px",
        height: "16px",
        left: "31px",
        top: "3px",
        background: "#EBFFA3",
        borderRadius: "9px",
        padding: "2.5px 3.2px",
      }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-row items-center gap-[1.2px]" style={{ width: "9px", height: "10px" }}>
        {bars.map((bar, index) => (
          <motion.div
            key={index}
            className="rounded-[21px] bg-[#4FC4C4]"
            style={{ width: "2px" }}
            animate={{
              height: intense
                ? [bar.height * 0.55, bar.height, bar.height * 0.7, bar.height]
                : [bar.height * 0.7, bar.height * 0.95, bar.height * 0.75, bar.height * 0.9],
            }}
            transition={{
              duration: intense ? 0.75 : 1.1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: bar.delay,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function ParticipantAvatar({ member, active = false, className = "", style = {} }) {
  const meta = getParticipantMeta(member);

  return (
    <motion.div
      layoutId={`participant-${meta.id || meta.initial}`}
      layout
      transition={AVATAR_SPRING}
      className={`flex items-center justify-center text-white ${className}`}
      style={{
        width: "26px",
        height: "26px",
        background: meta.bg,
        borderRadius: "15.5px",
        boxShadow: active ? "0px 0px 17.8px rgba(194, 255, 169, 0.8)" : undefined,
        ...style,
      }}
      title={meta.name}
    >
      <span className="text-[13px] font-normal leading-[15px]">{meta.initial}</span>
    </motion.div>
  );
}

export default function MeetingParticipantsBar({
  teamMembers = [],
  activeSpeakerId = null,
  isSpeaking = false,
  hasSpeechActivity = false,
}) {
  const members = useMemo(() => {
    const source = Array.isArray(teamMembers) && teamMembers.length ? teamMembers : getDefaultTeamMembers();
    return sortParticipants(
      source.map((member) => {
        const meta = getParticipantMeta(member);
        return { ...meta, ...member, bg: meta.bg };
      })
    );
  }, [teamMembers]);

  const activeMember = useMemo(() => {
    if (!isSpeaking || !activeSpeakerId) return null;
    return (
      members.find((member) => member.id === activeSpeakerId) ||
      getParticipantMeta(activeSpeakerId)
    );
  }, [activeSpeakerId, isSpeaking, members]);

  const rosterMembers = useMemo(() => {
    if (isSpeaking && activeMember?.id) {
      return members.filter((member) => member.id !== activeMember.id);
    }
    return members;
  }, [activeMember, isSpeaking, members]);

  const rosterWidth = isSpeaking ? ROSTER_WIDTH_COMPACT : ROSTER_WIDTH_FULL;
  const totalWidth = isSpeaking
    ? SPEAKER_PILL_WIDTH + ROSTER_GAP + ROSTER_WIDTH_COMPACT
    : ROSTER_WIDTH_FULL;
  const chevronLeft = rosterMembers.length >= 4 ? 105 : 83;

  return (
    <LayoutGroup id="meeting-participants">
      <motion.div
        className="pointer-events-auto flex flex-row items-center"
        animate={{ width: totalWidth }}
        transition={PILL_SPRING}
        style={{ height: "36px", gap: `${ROSTER_GAP}px` }}
      >
        <AnimatePresence mode="popLayout">
          {isSpeaking && activeMember ? (
            <motion.div
              key="active-speaker-pill"
              className="relative shrink-0 overflow-visible"
              initial={{ opacity: 0, width: 0, scale: 0.92 }}
              animate={{ opacity: 1, width: SPEAKER_PILL_WIDTH, scale: 1 }}
              exit={{ opacity: 0, width: 0, scale: 0.92 }}
              transition={PILL_SPRING}
              style={{
                boxSizing: "border-box",
                height: "36px",
                background: "rgba(255, 255, 255, 0.64)",
                border: "1px solid #FFFFFF",
                boxShadow: "3px 3px 6px rgba(0, 0, 0, 0.05)",
                borderRadius: "35px",
                padding: "3px 9px",
              }}
            >
              <ParticipantAvatar
                member={activeMember}
                active
                style={{ position: "absolute", left: "9px", top: "4px" }}
              />
              <VoiceIndicator intense={hasSpeechActivity} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.div
          className="relative shrink-0"
          animate={{ width: rosterWidth }}
          transition={PILL_SPRING}
          style={{
            boxSizing: "border-box",
            height: "36px",
            background: "rgba(255, 255, 255, 0.64)",
            border: "1px solid #FFFFFF",
            boxShadow: "3px 3px 6px rgba(0, 0, 0, 0.05)",
            borderRadius: "35px",
          }}
        >
          {rosterMembers.map((member, index) => (
            <ParticipantAvatar
              key={member.id || member.initial}
              member={member}
              style={{
                position: "absolute",
                left: `${7 + index * 22}px`,
                top: "4px",
                border: "1px solid #FFFFFF",
              }}
            />
          ))}

          <div
            className="absolute flex items-center justify-center"
            style={{ width: "20px", height: "20px", left: `${chevronLeft}px`, top: "7px" }}
          >
            <ChevronDown className="h-3.5 w-3.5 text-[#C5C5C5]" />
          </div>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
}
