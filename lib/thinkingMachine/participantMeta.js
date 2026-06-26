export const DEFAULT_IDLE_SPEAKER_ID = "user-taeeun";

export const PARTICIPANT_PROFILES = {
  "user-hyeonji": { id: "user-hyeonji", name: "Hyeonji", initial: "H", bg: "#FFA6E9" },
  "user-jimin": { id: "user-jimin", name: "Jimin", initial: "J", bg: "#99B8E0" },
  "user-sooyun": { id: "user-sooyun", name: "Sooyun", initial: "S", bg: "#2C3E81" },
  "user-taeeun": { id: "user-taeeun", name: "Taeeun", initial: "T", bg: "#A2E1E4" },
};

const NAME_LOOKUP = Object.values(PARTICIPANT_PROFILES).reduce((acc, profile) => {
  acc[profile.name.toLowerCase()] = profile;
  return acc;
}, {});

export function getParticipantMeta(source) {
  if (!source) {
    return { initial: "U", bg: "#2E3A59", name: "Unknown", id: "" };
  }

  if (typeof source === "string") {
    const trimmed = source.trim();
    if (PARTICIPANT_PROFILES[trimmed]) return PARTICIPANT_PROFILES[trimmed];
    const byName = NAME_LOOKUP[trimmed.toLowerCase()];
    if (byName) return byName;
    const initial = trimmed.charAt(0).toUpperCase() || "U";
    return { initial, bg: "#2E3A59", name: trimmed, id: trimmed };
  }

  if (typeof source === "object") {
    if (source.id && PARTICIPANT_PROFILES[source.id]) {
      return { ...PARTICIPANT_PROFILES[source.id], ...source, bg: PARTICIPANT_PROFILES[source.id].bg };
    }
    if (source.name) {
      const byName = NAME_LOOKUP[String(source.name).trim().toLowerCase()];
      if (byName) return { ...byName, ...source, bg: byName.bg };
    }
    const name = typeof source.name === "string" ? source.name.trim() : "";
    const initial = name ? name.charAt(0).toUpperCase() : "U";
    return { initial, bg: "#2E3A59", name: name || "Unknown", id: source.id || "" };
  }

  return { initial: "U", bg: "#2E3A59", name: "Unknown", id: "" };
}

export function resolveTeamMember(teamMembers = [], { id, name } = {}) {
  const members = Array.isArray(teamMembers) ? teamMembers : [];
  if (id) {
    const byId = members.find((member) => member?.id === id);
    if (byId) return byId;
    if (PARTICIPANT_PROFILES[id]) return PARTICIPANT_PROFILES[id];
  }
  if (name) {
    const normalized = String(name).trim().toLowerCase();
    const byName = members.find((member) => String(member?.name || "").trim().toLowerCase() === normalized);
    if (byName) return byName;
    if (NAME_LOOKUP[normalized]) return NAME_LOOKUP[normalized];
  }
  return null;
}

export function getDefaultTeamMembers() {
  return Object.values(PARTICIPANT_PROFILES);
}

export const PARTICIPANT_DISPLAY_ORDER = [
  "user-hyeonji",
  "user-jimin",
  "user-sooyun",
  "user-taeeun",
];

export function sortParticipants(members = []) {
  const order = PARTICIPANT_DISPLAY_ORDER;
  return [...members].sort((a, b) => {
    const aIndex = order.indexOf(a?.id);
    const bIndex = order.indexOf(b?.id);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
}
