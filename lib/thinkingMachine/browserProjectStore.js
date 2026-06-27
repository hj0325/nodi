"use client";

import { getDefaultMeetingMemory, sanitizeMeetingMemory } from "@/lib/thinkingMachine/meetingMemory";
import {
  createActivityEntry,
  createSanitizeMember,
  createSanitizeProject,
  createUpsertMember,
  getProjectSummary,
  MAX_PROJECT_ACTIVITY_ITEMS,
} from "@/lib/thinkingMachine/projectStoreShared";

const STORE_KEY = "thinking-machine-browser-store-v2";
const MAX_ACTIVITY_ITEMS = MAX_PROJECT_ACTIVITY_ITEMS;

const DEFAULT_STORE = {
  projects: {},
};

function nowIso() {
  return new Date().toISOString();
}

function generateId(prefix = "id") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readStore() {
  if (!canUseStorage()) return { ...DEFAULT_STORE };
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    const seeded = getSeededStore();
    if (!raw) {
      writeStore(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw);
    const projects = parsed?.projects && typeof parsed.projects === "object" ? parsed.projects : {};
    
    // Ensure all seeded projects are always present in the store and up-to-date
    let needsUpdate = false;
    for (const key of Object.keys(seeded.projects)) {
      if (!projects[key] || key === "project-ai-meeting") {
        projects[key] = seeded.projects[key];
        needsUpdate = true;
      }
    }
    
    if (needsUpdate) {
      const updatedStore = { ...parsed, projects };
      writeStore(updatedStore);
      return updatedStore;
    }
    
    return { projects };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

function getSeededStore() {
  const now = Date.now();
  const date7DaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const date6DaysAgo = new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString();
  const date2DaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString();
  const date1DayAgo = new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString();
  const date2MinsAgo = new Date(now - 2 * 60 * 1000).toISOString();

  const projects = {
    "project-ai-search": {
      id: "project-ai-search",
      title: "AI 검색 기능 정의",
      createdAt: date7DaysAgo,
      updatedAt: date7DaysAgo,
      members: [
        { id: "user-hyeonji", name: "Hyeonji", role: "owner" },
        { id: "user-jinki", name: "Jinki", role: "editor" },
        { id: "user-taeeun", name: "Taeeun", role: "editor" },
        { id: "user-eunsol", name: "Eunsol", role: "editor" },
      ],
      graph: {
        stage: "Idea",
        updatedAt: date7DaysAgo,
        nodes: [
          {
            id: "node-search-1",
            type: "thinkingNode",
            position: { x: 150, y: 150 },
            data: {
              title: "검색 이탈률 감소 필요성",
              content: "현재 단순 키워드 매칭 검색의 실패율이 38%에 달해, 사용자가 원하는 결과를 찾지 못하고 이탈하는 현상 발생.",
              category: "Why",
              phase: "Idea",
              sourceType: "user",
              visibility: "agreed",
              confidence: "high",
            },
          },
          {
            id: "node-search-2",
            type: "thinkingNode",
            position: { x: 500, y: 150 },
            data: {
              title: "생성형 시맨틱 검색 도입",
              content: "사용자의 검색 질문에 담긴 의도와 맥락을 이해하고, 가장 적합한 답변 요약과 연관 노드를 함께 제공하는 생성형 검색 경험 설계.",
              category: "What",
              phase: "Idea",
              sourceType: "agent",
              visibility: "shared",
              confidence: "high",
            },
          },
          {
            id: "node-search-3",
            type: "thinkingNode",
            position: { x: 500, y: 400 },
            data: {
              title: "임베딩 모델 및 벡터 DB 구축",
              content: "OpenAI Text-Embedding-3 모델을 사용하여 회의록 텍스트를 벡터화하고, Pinecone 벡터 데이터베이스에 저장하여 유사도 검색 구현.",
              category: "How",
              phase: "Solution",
              sourceType: "mixed",
              visibility: "shared",
              confidence: "medium",
            },
          },
          {
            id: "node-search-4",
            type: "thinkingNode",
            position: { x: 150, y: 400 },
            data: {
              title: "AI 개발 및 인프라 담당",
              content: "Jinki님이 벡터 DB 구축 및 LLM 파이프라인 연동을 담당하고, Taeeun님이 프론트엔드 검색 UI 컴포넌트 개발을 담당하기로 함.",
              category: "Who",
              phase: "Action",
              sourceType: "user",
              visibility: "agreed",
              confidence: "high",
            },
          },
        ],
        edges: [
          {
            id: "edge-search-1",
            source: "node-search-1",
            target: "node-search-2",
            label: "proposes",
          },
          {
            id: "edge-search-2",
            source: "node-search-2",
            target: "node-search-3",
            label: "depends_on",
          },
          {
            id: "edge-search-3",
            source: "node-search-3",
            target: "node-search-4",
            label: "supports",
          },
        ],
      },
      activity: [],
    },
    "project-smart-home": {
      id: "project-smart-home",
      title: "공감지능 스마트 홈",
      createdAt: date6DaysAgo,
      updatedAt: date6DaysAgo,
      members: [
        { id: "user-hyeonji", name: "Hyeonji", role: "owner" },
        { id: "user-sooyun", name: "Sooyun", role: "editor" },
        { id: "user-jimin", name: "Jimin", role: "editor" },
        { id: "user-eunsol", name: "Eunsol", role: "editor" },
        { id: "user-taeeun", name: "Taeeun", role: "editor" },
      ],
      graph: {
        stage: "Idea",
        updatedAt: date6DaysAgo,
        nodes: [
          {
            id: "node-home-1",
            type: "thinkingNode",
            position: { x: 150, y: 150 },
            data: {
              title: "감정 및 상황 인지 부재",
              content: "기존 스마트홈은 단순 켜고 끄는 규칙 기반에 그침. 사용자의 피로도나 기분에 맞춰 조명과 음악을 섬세하게 조율하는 공감형 제어가 필요함.",
              category: "Why",
              phase: "Idea",
              jobTag: "UX",
              topicTag: "Research",
              sourceType: "user",
              visibility: "agreed",
              confidence: "high",
            },
          },
          {
            id: "node-home-2",
            type: "thinkingNode",
            position: { x: 500, y: 150 },
            data: {
              title: "멀티모달 감정 인식 에이전트",
              content: "거실 카메라의 표정 분석, 마이크의 음성 톤 분석, 그리고 스마트워치의 생체 데이터(심박수)를 종합하여 사용자의 감정 상태를 5단계로 분류.",
              category: "What",
              phase: "Research",
              jobTag: "Tech",
              topicTag: "Insight",
              sourceType: "agent",
              visibility: "candidate",
              confidence: "medium",
            },
          },
          {
            id: "node-home-3",
            type: "thinkingNode",
            position: { x: 500, y: 400 },
            data: {
              title: "온디바이스 AI 및 홈 서버 연동",
              content: "개인정보 보호를 위해 영상 및 음성 분석은 온디바이스(Raspberry Pi 5 + NPU)로 처리하고, 최종 감정 상태만 홈 서버로 전송하여 IoT 기기 제어.",
              category: "How",
              phase: "Solution",
              jobTag: "Tech",
              topicTag: "Reference",
              sourceType: "mixed",
              visibility: "shared",
              confidence: "high",
            },
          },
        ],
        edges: [
          {
            id: "edge-home-1",
            source: "node-home-1",
            target: "node-home-2",
            label: "proposes",
          },
          {
            id: "edge-home-2",
            source: "node-home-2",
            target: "node-home-3",
            label: "depends_on",
          },
        ],
      },
      activity: [],
    },
    "project-ai-meeting": {
      id: "project-ai-meeting",
      title: "AI 회의록 기획 토론",
      createdAt: date2DaysAgo,
      updatedAt: date2DaysAgo,
      members: [
        { id: "user-hyeonji", name: "Hyeonji", role: "owner" },
        { id: "user-sooyun", name: "Sooyun", role: "editor" },
        { id: "user-jimin", name: "Jimin", role: "editor" },
        { id: "user-taeeun", name: "Taeeun", role: "editor" },
      ],
      graph: {
        stage: "Idea",
        updatedAt: date2DaysAgo,
        nodes: [
          {
            id: "node-meet-group",
            type: "ideaGroup",
            position: { x: 30, y: 110 },
            data: {
              title: "Problem & Who Group",
              isMeetGroup: true,
            },
            style: { width: 590, height: 252, background: "transparent", border: "none", zIndex: 0 },
          },
          {
            id: "node-meet-problem",
            type: "thinkingNode",
            parentNode: "node-meet-group",
            extent: "parent",
            position: { x: 24, y: 28 },
            data: {
              title: "온라인 회의에서의 맥락 확장 문제",
              content: "온라인 회의 상황에서 회의가 종료되면 프로젝트 맥락을 확장하기 어려움",
              originalTitle: "온라인 회의에서의 맥락 확장 문제 (원문)",
              originalContent: "저희가 온라인 회의를 할 때 회의가 종료되면 프로젝트 맥락을 확장하기가 너무 어렵더라고요. 회의가 끝나고 나면 논의했던 맥락들이 다 사라져버리는 느낌이에요.",
              category: "Problem",
              phase: "Idea",
              jobTag: "Business",
              topicTag: "Context",
              sourceType: "context",
              visibility: "shared",
              confidence: "high",
              editedBy: "Hyeonji"
            },
          },
          {
            id: "node-meet-who",
            type: "thinkingNode",
            parentNode: "node-meet-group",
            extent: "parent",
            position: { x: 305, y: 28 },
            data: {
              title: "협업 팀의 서로 다른 사고 맥락",
              content: "기획자, 디자이너, 개발자 등이 속한 협업팀은 각자 추구하는 방향이 다르고 맥락 파악에 어려움이 있음",
              originalTitle: "협업 팀의 서로 다른 사고 맥락 (원문)",
              originalContent: "기획자, 디자이너, 개발자 등이 같이 일하는 협업팀에서는 각자 생각하는 방향이나 추구하는 가치가 너무 달라서 서로 맥락을 파악하고 맞추는 게 진짜 쉽지 않더라고요.",
              category: "Who",
              phase: "Idea",
              jobTag: "Business",
              topicTag: "Memory",
              sourceType: "mixed",
              visibility: "shared",
              confidence: "high",
              editedBy: "Hyeonji"
            },
          },
          {
            id: "node-meet-why",
            type: "thinkingNode",
            position: { x: 670, y: 50 },
            data: {
              title: "텍스트 기반 정리인 기존의 회의록",
              content: "과거 회의 내용을 검색할 수는 있지만, 논리 흐름과 연결 관계는 파악하기 어려움",
              originalTitle: "텍스트 기반 정리인 기존의 회의록 (원문)",
              originalContent: "기존 회의록은 그냥 텍스트로만 쭉 정리되어 있으니까 나중에 검색은 할 수 있어도, 그때 어떤 논리 흐름으로 얘기가 흘러갔고 노드 간에 어떤 연결 관계가 있는지 파악하기는 진짜 어렵더라고요.",
              category: "Why",
              phase: "Research",
              jobTag: "UX",
              topicTag: "Memory",
              sourceType: "mixed",
              visibility: "shared",
              confidence: "high",
              editedBy: "Sooyun"
            },
          },
          {
            id: "node-meet-when",
            type: "thinkingNode",
            position: { x: 670, y: 350 },
            data: {
              title: "따로 있더라도 아이디어 확장이 필요",
              content: "회의 종료 후에도 떠오른 아이디어를 맥락과 함께 팀에 공유하기 어려움",
              originalTitle: "따로 있더라도 아이디어 확장이 필요 (원문)",
              originalContent: "저희가 회의를 할 때도 새 아이디어가 생각나지만, 회의가 끝난 후에도 생각이 새록새록 나잖아요? 이런 경우에는 다음 회의 때 아이디어를 공유하게 되는데, 그럼 경우 각자의 생각 맥락 때문에 정확하게 이해시키기가 어렵더라고요. 따로 있더라도 생각 맥락을 공유하는 기능이 있으면 좋지 않을까요?",
              category: "When",
              phase: "Idea",
              jobTag: "UX",
              topicTag: "STT",
              sourceType: "user",
              visibility: "candidate",
              confidence: "medium",
              editedBy: "Jimin"
            },
          },
          {
            id: "node-meet-what",
            type: "thinkingNode",
            position: { x: 1020, y: 200 },
            data: {
              title: "회의를 연결된 사고 흐름으로 관리",
              content: "AI가 회의 내용을 노드화하여 아이디어, 근거, 의사결정을 하나의 맥락으로 연결함",
              originalTitle: "회의를 연결된 사고 흐름으로 관리 (원문)",
              originalContent: "AI가 우리가 회의한 내용들을 자동으로 노드화해주고, 아이디어랑 그에 대한 근거, 최종 의사결정까지 하나의 연결된 사고 흐름 맥락으로 관리해줄 수 있으면 좋겠어요.",
              category: "What",
              phase: "Solution",
              jobTag: "UX",
              topicTag: "Memory",
              sourceType: "mixed",
              visibility: "shared",
              confidence: "high",
              editedBy: "Sooyun"
            },
          },
          {
            id: "node-meet-how-1",
            type: "thinkingNode",
            position: { x: 960, y: 580 },
            data: {
              title: "회의록 개발 과정을 시각적으로 탐색",
              content: "회의록이 어떻게 만들어지는지 개발 과정을 캔버스에서 시각적으로 따라갈 수 있게 함",
              originalTitle: "회의록 개발 과정을 시각적으로 탐색 (원문)",
              originalContent: "회의록이 실제로 어떤 과정으로 만들어지는지, 개발 흐름을 캔버스에서 시각적으로 탐색할 수 있으면 좋겠어요.",
              category: "How",
              phase: "Research",
              jobTag: "UX",
              topicTag: "Memory",
              sourceType: "user",
              visibility: "candidate",
              confidence: "medium",
              editedBy: "Sooyun",
              isOffMeeting: true
            },
          },
          {
            id: "node-meet-how-2",
            type: "thinkingNode",
            position: { x: 1240, y: 580 },
            data: {
              title: "AI가 과거 회의와 연결을 제안",
              content: "새 아이디어 발언 시 AI가 관련된 과거 회의 노드와의 연결을 자동으로 제안함",
              originalTitle: "AI가 과거 회의와 연결을 제안 (원문)",
              originalContent: "회의가 끝난 뒤에도 아이디어를 말하면, AI가 과거 회의에서 비슷했던 논의와 연결해주면 좋겠어요.",
              category: "How",
              phase: "Solution",
              jobTag: "Business",
              topicTag: "Memory",
              sourceType: "user",
              visibility: "candidate",
              confidence: "medium",
              editedBy: "Hyeonji",
              isOffMeeting: true
            },
          },
          {
            id: "node-meet-how-3",
            type: "thinkingNode",
            position: { x: 1520, y: 580 },
            data: {
              title: "미해결 안건을 다음 회의로 이어가기",
              content: "회의 종료 후에도 미해결 안건을 맥락과 함께 다음 회의 아젠다로 자연스럽게 이어감",
              originalTitle: "미해결 안건을 다음 회의로 이어가기 (원문)",
              originalContent: "회의가 끝나도 해결되지 않은 안건을 맥락과 함께 다음 회의 아젠다로 자연스럽게 이어갈 수 있으면 좋겠어요.",
              category: "How",
              phase: "Solution",
              jobTag: "UX",
              topicTag: "Memory",
              sourceType: "user",
              visibility: "candidate",
              confidence: "medium",
              editedBy: "Hyeonji",
              isOffMeeting: true
            },
          },
        ],
        edges: [
          {
            id: "edge-meet-1",
            source: "node-meet-problem",
            target: "node-meet-who",
            label: "proposes",
          },
          {
            id: "edge-meet-2",
            source: "node-meet-who",
            target: "node-meet-why",
            label: "proposes",
          },
          {
            id: "edge-meet-3",
            source: "node-meet-who",
            target: "node-meet-when",
            label: "proposes",
          },
          {
            id: "edge-meet-4",
            source: "node-meet-why",
            target: "node-meet-what",
            label: "depends_on",
          },
          {
            id: "edge-meet-5",
            source: "node-meet-when",
            target: "node-meet-what",
            label: "depends_on",
          },
          {
            id: "edge-meet-6",
            source: "node-meet-what",
            target: "node-meet-how-1",
            label: "refines",
            isContinuation: true,
          },
          {
            id: "edge-meet-7",
            source: "node-meet-what",
            target: "node-meet-how-2",
            label: "refines",
            isContinuation: true,
          },
          {
            id: "edge-meet-8",
            source: "node-meet-how-2",
            target: "node-meet-how-3",
            label: "refines",
          },
        ],
      },
      activity: [],
    },
    "project-onboarding-ux": {
      id: "project-onboarding-ux",
      title: "신규 온보딩 UX 개선",
      createdAt: date1DayAgo,
      updatedAt: date1DayAgo,
      members: [
        { id: "user-hyeonji", name: "Hyeonji", role: "owner" },
        { id: "user-jiyu", name: "Jiyu", role: "editor" },
        { id: "user-taeeun", name: "Taeeun", role: "editor" },
      ],
      graph: {
        stage: "Idea",
        updatedAt: date1DayAgo,
        nodes: [
          {
            id: "node-onboard-1",
            type: "thinkingNode",
            position: { x: 150, y: 150 },
            data: {
              title: "초기 이탈률 45% 극복",
              content: "사용자가 가입 후 첫 3분 동안 서비스의 핵심 가치(Aha-moment)를 경험하지 못하고 이탈함. 초기 진입 장벽을 대폭 낮춰야 함.",
              category: "Why",
              phase: "Idea",
              sourceType: "user",
              visibility: "agreed",
              confidence: "high",
            },
          },
          {
            id: "node-onboard-2",
            type: "thinkingNode",
            position: { x: 500, y: 150 },
            data: {
              title: "인터랙티브 퀵 가이드",
              content: "복잡한 설명서 대신, 사용자가 직접 샘플 프로젝트를 조작해보며 5개의 핵심 기능을 자연스럽게 익힐 수 있는 대화형 온보딩 흐름 도입.",
              category: "What",
              phase: "Research",
              sourceType: "agent",
              visibility: "shared",
              confidence: "medium",
            },
          },
          {
            id: "node-onboard-3",
            type: "thinkingNode",
            position: { x: 500, y: 400 },
            data: {
              title: "가입 즉시 템플릿 로드",
              content: "가입 완료 화면 직후 빈 화면 대신 미리 채워진 '웰컴 가이드 템플릿'을 자동으로 로드하여 사용자가 즉시 시각적 흥미를 느끼도록 유도.",
              category: "How",
              phase: "Solution",
              sourceType: "mixed",
              visibility: "shared",
              confidence: "high",
            },
          },
        ],
        edges: [
          {
            id: "edge-onboard-1",
            source: "node-onboard-1",
            target: "node-onboard-2",
            label: "proposes",
          },
          {
            id: "edge-onboard-2",
            source: "node-onboard-2",
            target: "node-onboard-3",
            label: "depends_on",
          },
        ],
      },
      activity: [],
    },
    "project-dashboard-design": {
      id: "project-dashboard-design",
      title: "프로젝트 대시보드 설계",
      createdAt: date2MinsAgo,
      updatedAt: date2MinsAgo,
      members: [
        { id: "user-hyeonji", name: "Hyeonji", role: "owner" },
        { id: "user-sooyun", name: "Sooyun", role: "editor" },
        { id: "user-jimin", name: "Jimin", role: "editor" },
        { id: "user-taeeun", name: "Taeeun", role: "editor" },
      ],
      graph: {
        stage: "Idea",
        updatedAt: date2MinsAgo,
        nodes: [
          {
            id: "node-dash-1",
            type: "thinkingNode",
            position: { x: 150, y: 150 },
            data: {
              title: "다중 프로젝트 관리의 어려움",
              content: "여러 프로젝트가 병렬로 진행될 때, 각 프로젝트의 실시간 마일스톤 상태와 병목 지점을 한눈에 파악할 수 있는 통합 뷰가 부재함.",
              category: "Why",
              phase: "Idea",
              jobTag: "Business",
              topicTag: "Research",
              sourceType: "user",
              visibility: "agreed",
              confidence: "high",
            },
          },
          {
            id: "node-dash-2",
            type: "thinkingNode",
            position: { x: 500, y: 150 },
            data: {
              title: "통합 마일스톤 및 리소스 뷰",
              content: "각 프로젝트의 진척도, 마일스톤 타임라인, 담당자별 업무 로드 및 AI 기반 병목 예측 알림을 제공하는 웹 대시보드 인터페이스.",
              category: "What",
              phase: "Research",
              jobTag: "UX",
              topicTag: "Insight",
              sourceType: "agent",
              visibility: "candidate",
              confidence: "medium",
            },
          },
          {
            id: "node-dash-3",
            type: "thinkingNode",
            position: { x: 500, y: 400 },
            data: {
              title: "Recharts 기반 시각화 컴포넌트",
              content: "React 환경에서 Recharts 라이브러리를 활용하여 담당자별 업무 로드를 차트로 시각화하고, Tailwind CSS를 통해 반응형 레이아웃 구현.",
              category: "How",
              phase: "Solution",
              jobTag: "Tech",
              topicTag: "Reference",
              sourceType: "mixed",
              visibility: "shared",
              confidence: "high",
            },
          },
        ],
        edges: [
          {
            id: "edge-dash-1",
            source: "node-dash-1",
            target: "node-dash-2",
            label: "proposes",
          },
          {
            id: "edge-dash-2",
            source: "node-dash-2",
            target: "node-dash-3",
            label: "depends_on",
          },
        ],
      },
      activity: [],
    },
  };

  return { projects };
}

function writeStore(store) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

const sanitizeMember = createSanitizeMember({
  generateId,
  nowIso,
});

const sanitizeProject = createSanitizeProject({
  sanitizeMember,
  nowIso,
  maxActivityItems: MAX_ACTIVITY_ITEMS,
  generateProjectId: generateId,
});

const upsertMember = createUpsertMember({ sanitizeMember, nowIso });

function mutateProject(projectId, updater) {
  const store = readStore();
  const existing = sanitizeProject(store.projects[projectId] || { id: projectId });
  const nextProject = sanitizeProject(updater(existing));
  store.projects[projectId] = nextProject;
  writeStore(store);
  return nextProject;
}

function normalizeProjectListQuery({ currentUserId = "", query = "", scope = "member" } = {}) {
  return {
    currentUserId: typeof currentUserId === "string" ? currentUserId.trim() : "",
    query: typeof query === "string" ? query.trim().toLowerCase() : "",
    scope: scope === "discover" ? "discover" : "member",
  };
}

function isProjectMember(project, currentUserId) {
  if (!currentUserId) return false;
  return Array.isArray(project?.members) && project.members.some((member) => member?.id === currentUserId);
}

export function listBrowserProjects(options = {}) {
  const { currentUserId, query, scope } = normalizeProjectListQuery(options);
  const store = readStore();
  return Object.values(store.projects)
    .map((project) => sanitizeProject(project))
    .filter((project) => {
      if (query && !String(project?.title || "").toLowerCase().includes(query)) return false;
      if (scope === "member" && currentUserId) return isProjectMember(project, currentUserId);
      return true;
    })
    .map((project) => getProjectSummary(project, currentUserId))
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
}

export function createBrowserProject({ title, actor } = {}) {
  const timestamp = nowIso();
  const id = generateId("project");
  const member = sanitizeMember({ ...actor, role: "owner" });
  const project = sanitizeProject({
    id,
    title,
    createdAt: timestamp,
    updatedAt: timestamp,
    graph: {
      nodes: [],
      edges: [],
      stage: "Idea",
      updatedAt: timestamp,
    },
    activity: [],
    members: [member],
  });
  const store = readStore();
  store.projects[id] = project;
  writeStore(store);
  return project;
}

export function getBrowserProject(projectId) {
  if (!projectId) return null;
  const store = readStore();
  const project = store.projects[projectId];
  return project ? sanitizeProject(project) : null;
}

export function updateBrowserProject(projectId, patch = {}) {
  return mutateProject(projectId, (project) => {
    if (patch.actor) upsertMember(project, patch.actor);
    const timestamp = nowIso();
    return {
      ...project,
      title: typeof patch.title === "string" && patch.title.trim() ? patch.title.trim() : project.title,
      updatedAt: timestamp,
      graph: {
        ...project.graph,
        updatedAt: project.graph?.updatedAt || timestamp,
      },
    };
  });
}

export function getBrowserProjectGraph(projectId) {
  const project = getBrowserProject(projectId);
  if (!project) return null;
  return {
    project: getProjectSummary(project),
    graph: project.graph,
    meetingMemory: project.meetingMemory,
  };
}

export function saveBrowserProjectGraph(projectId, graph = {}, actor) {
  const nextProject = mutateProject(projectId, (project) => {
    if (actor) upsertMember(project, actor);
    const timestamp = nowIso();
    return {
      ...project,
      updatedAt: timestamp,
      graph: {
        nodes: Array.isArray(graph.nodes) ? graph.nodes : [],
        edges: Array.isArray(graph.edges) ? graph.edges : [],
        stage: typeof graph.stage === "string" ? graph.stage : project.graph?.stage || "Idea",
        updatedAt: timestamp,
      },
      meetingMemory: sanitizeMeetingMemory(graph?.meetingMemory || project.meetingMemory || getDefaultMeetingMemory()),
    };
  });
  return {
    project: getProjectSummary(nextProject),
    graph: nextProject.graph,
    meetingMemory: nextProject.meetingMemory,
  };
}

export function getBrowserProjectActivity(projectId) {
  const project = getBrowserProject(projectId);
  return project?.activity || [];
}

export function appendBrowserProjectActivity(projectId, activity = {}) {
  const nextProject = mutateProject(projectId, (project) => {
    if (activity.actor) upsertMember(project, activity.actor);
    const timestamp = nowIso();
    const entry = createActivityEntry({
      activity,
      timestamp,
      stage: project.graph?.stage || "Idea",
      generateId,
    });
    return {
      ...project,
      updatedAt: timestamp,
      activity: [entry, ...project.activity].slice(0, MAX_ACTIVITY_ITEMS),
    };
  });
  return nextProject.activity[0] || null;
}

export function getBrowserProjectMembers(projectId) {
  const project = getBrowserProject(projectId);
  return project?.members || [];
}

export function registerBrowserProjectMember(projectId, member) {
  const nextProject = mutateProject(projectId, (project) => {
    upsertMember(project, member);
    return {
      ...project,
      updatedAt: nowIso(),
    };
  });
  return nextProject.members;
}

const SEEDED_MEMBERS = {
  "project-ai-search": [
    { id: "user-hyeonji", name: "Hyeonji", role: "owner" },
    { id: "user-jinki", name: "Jinki", role: "editor" },
    { id: "user-taeeun", name: "Taeeun", role: "editor" },
    { id: "user-eunsol", name: "Eunsol", role: "editor" },
  ],
  "project-smart-home": [
    { id: "user-hyeonji", name: "Hyeonji", role: "owner" },
    { id: "user-sooyun", name: "Sooyun", role: "editor" },
    { id: "user-jimin", name: "Jimin", role: "editor" },
    { id: "user-eunsol", name: "Eunsol", role: "editor" },
    { id: "user-taeeun", name: "Taeeun", role: "editor" },
  ],
  "project-ai-meeting": [
    { id: "user-hyeonji", name: "Hyeonji", role: "owner" },
    { id: "user-sooyun", name: "Sooyun", role: "editor" },
    { id: "user-jimin", name: "Jimin", role: "editor" },
    { id: "user-taeeun", name: "Taeeun", role: "editor" },
  ],
  "project-onboarding-ux": [
    { id: "user-hyeonji", name: "Hyeonji", role: "owner" },
    { id: "user-jiyu", name: "Jiyu", role: "editor" },
    { id: "user-taeeun", name: "Taeeun", role: "editor" },
  ],
  "project-dashboard-design": [
    { id: "user-hyeonji", name: "Hyeonji", role: "owner" },
    { id: "user-sooyun", name: "Sooyun", role: "editor" },
    { id: "user-jimin", name: "Jimin", role: "editor" },
    { id: "user-taeeun", name: "Taeeun", role: "editor" },
  ]
};

export function leaveAllOtherMembers(projectId, keepUserId) {
  const nextProject = mutateProject(projectId, (project) => {
    const keptMembers = (project.members || []).filter((m) => m.id === keepUserId);
    // If the keeping user isn't in members, make sure we keep at least user-hyeonji or whatever is owner
    if (keptMembers.length === 0) {
      const owner = (project.members || []).find((m) => m.role === "owner" || m.id === "user-hyeonji");
      if (owner) {
        keptMembers.push(owner);
      }
    }
    return {
      ...project,
      members: keptMembers,
      updatedAt: nowIso(),
    };
  });
  return nextProject.members;
}

export function restoreOriginalMembers(projectId) {
  const nextProject = mutateProject(projectId, (project) => {
    const original = SEEDED_MEMBERS[projectId] || project.members || [];
    return {
      ...project,
      members: original,
      updatedAt: nowIso(),
    };
  });
  return nextProject.members;
}

