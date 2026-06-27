"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  getDefaultTeamMembers,
  getParticipantMeta,
  sortParticipants,
} from "@/lib/thinkingMachine/participantMeta";

const AVATAR_FADE = { duration: 0.22, ease: "easeInOut" };
const PILL_SPRING = { type: "spring", stiffness: 360, damping: 30, mass: 0.8 };
const SPEAKER_PILL_WIDTH = 56;
const ROSTER_GAP = 5;
const ROSTER_WIDTH_COMPACT = 111;
const ROSTER_WIDTH_FULL = 134;

function VoiceIndicator({ intense = false, left = "31px" }) {
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
        left,
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

function ParticipantAvatar({ member, showGlow = false, className = "", style = {} }) {
  const meta = getParticipantMeta(member);

  return (
    <motion.div
      className={`flex items-center justify-center text-white ${className}`}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{
        opacity: 1,
        scale: 1,
        boxShadow: showGlow ? "0px 0px 17.8px rgba(194, 255, 169, 0.8)" : "0px 0px 0px rgba(194, 255, 169, 0)",
      }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={AVATAR_FADE}
      style={{
        width: "26px",
        height: "26px",
        background: meta.bg,
        borderRadius: "15.5px",
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
  isSimulationCompleted = false,
}) {
  const members = useMemo(() => {
    let source = Array.isArray(teamMembers) && teamMembers.length ? teamMembers : getDefaultTeamMembers();
    if (isSimulationCompleted) {
      source = source.filter((member) => {
        const meta = getParticipantMeta(member);
        return meta.id === "user-hyeonji" || meta.initial === "H";
      });
    }
    return sortParticipants(
      source.map((member) => {
        const meta = getParticipantMeta(member);
        return { ...meta, ...member, bg: meta.bg };
      })
    );
  }, [teamMembers, isSimulationCompleted]);

  const isSoloParticipant = members.length <= 1;

  const activeMember = useMemo(() => {
    if (!isSpeaking || !activeSpeakerId) return null;
    return (
      members.find((member) => member.id === activeSpeakerId) ||
      getParticipantMeta(activeSpeakerId)
    );
  }, [activeSpeakerId, isSpeaking, members]);

  const showSpeakerSplit = isSpeaking && activeMember && !isSoloParticipant;

  const rosterMembers = useMemo(() => {
    if (showSpeakerSplit && activeMember?.id) {
      return members.filter((member) => member.id !== activeMember.id);
    }
    return members;
  }, [activeMember, showSpeakerSplit, members]);

  const rosterWidth = useMemo(() => {
    if (showSpeakerSplit) return ROSTER_WIDTH_COMPACT;
    if (rosterMembers.length <= 1) return 64;
    return ROSTER_WIDTH_FULL;
  }, [showSpeakerSplit, rosterMembers.length]);

  const totalWidth = showSpeakerSplit
    ? SPEAKER_PILL_WIDTH + ROSTER_GAP + rosterWidth
    : rosterWidth;

  const chevronLeft = useMemo(() => {
    if (rosterMembers.length >= 4) return 105;
    if (rosterMembers.length <= 1) return 38;
    return 83;
  }, [rosterMembers.length]);

  return (
    <motion.div
      className="pointer-events-auto flex flex-row items-center"
      animate={{ width: totalWidth }}
      transition={PILL_SPRING}
      style={{ height: "36px", gap: `${ROSTER_GAP}px` }}
    >
      <AnimatePresence mode="popLayout">
        {showSpeakerSplit && activeMember ? (
          <motion.div
            key="active-speaker-pill"
            className="relative shrink-0 overflow-visible"
            initial={{ opacity: 0, width: SPEAKER_PILL_WIDTH, scale: 0.96 }}
            animate={{ opacity: 1, width: SPEAKER_PILL_WIDTH, scale: 1 }}
            exit={{ opacity: 0, width: SPEAKER_PILL_WIDTH, scale: 0.96 }}
            transition={AVATAR_FADE}
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
            <AnimatePresence mode="wait">
              <ParticipantAvatar
                key={activeMember.id || activeMember.initial}
                member={activeMember}
                showGlow={hasSpeechActivity}
                style={{ position: "absolute", left: "9px", top: "4px" }}
              />
            </AnimatePresence>
            <AnimatePresence>
              {hasSpeechActivity ? (
                <VoiceIndicator key="voice-indicator" intense={hasSpeechActivity} />
              ) : null}
            </AnimatePresence>
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
        <AnimatePresence mode="popLayout">
          {rosterMembers.map((member, index) => (
            <ParticipantAvatar
              key={member.id || member.initial}
              member={member}
              showGlow={isSoloParticipant && isSpeaking && member.id === activeMember?.id && hasSpeechActivity}
              style={{
                position: "absolute",
                left: `${7 + index * 22}px`,
                top: "4px",
                border: "1px solid #FFFFFF",
              }}
            />
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {isSoloParticipant && isSpeaking && activeMember && hasSpeechActivity ? (
            <VoiceIndicator key="solo-voice-indicator" intense={hasSpeechActivity} left="29px" />
          ) : null}
        </AnimatePresence>

        <div
          className="absolute flex items-center justify-center"
          style={{ width: "20px", height: "20px", left: `${chevronLeft}px`, top: "7px" }}
        >
          <ChevronDown className="h-3.5 w-3.5 text-[#C5C5C5]" />
        </div>
      </motion.div>
    </motion.div>
  );
}
