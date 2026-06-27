"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Square } from "lucide-react";
import {
    useNodesState,
    useEdgesState,
    getViewportForBounds,
} from "reactflow";
import { AnimatePresence, motion } from "framer-motion";
import NodeMap from "./NodeMap";
import RightAgentDrawer from "./RightAgentDrawer";
import TopBar from "./TopBar";
import { getNodeSnapshot, getRelatedNodeIds } from "@/components/thinkingMachine/utils/graphSnapshots";
import {
    GRAPH_ENTRANCE_ANIMATION_MS,
    decorateConnectorEdges,
    toConnectorEdges,
} from "@/lib/thinkingMachine/connectorEdges";
import { toReactFlowNode } from "@/lib/thinkingMachine/reactflowTransforms";
import { computeNodeBounds, relayoutTopLevelThinkingNodes, shiftClusterRightOfExisting } from "@/lib/thinkingMachine/graphMerge";
import { useAdminMode } from "@/hooks/useAdminMode";
import { useDraftGrouping } from "@/components/thinkingMachine/hooks/useDraftGrouping";
import { useThinkingCollaboration } from "@/components/thinkingMachine/hooks/useThinkingCollaboration";
import { useThinkingGraphState } from "@/components/thinkingMachine/hooks/useThinkingGraphState";
import { useThinkingAiAnalyze } from "@/components/thinkingMachine/hooks/useThinkingAiAnalyze";
import { useRightDrawerChat } from "@/components/thinkingMachine/hooks/useRightDrawerChat";
import { useProjectGraphSync } from "@/components/thinkingMachine/hooks/useProjectGraphSync";
import { useChatGraphIngest } from "@/components/thinkingMachine/hooks/useChatGraphIngest";
import { useMeetingCaptureFlow } from "@/components/thinkingMachine/hooks/useMeetingCaptureFlow";
import { useTeamContextSummary } from "@/components/thinkingMachine/hooks/useTeamContextSummary";
import {
    buildMeetingMemoryReadout,
    getDefaultMeetingMemory,
    mergeMeetingMemory,
} from "@/lib/thinkingMachine/meetingMemory";
import { readCurrentUser } from "@/lib/thinkingMachine/clientUser";
import {
    getParticipantMeta,
    resolveTeamMember,
} from "@/lib/thinkingMachine/participantMeta";
import { buildReasoningAlignmentAnalysis } from "@/lib/thinkingMachine/reasoningAlignment";
import { buildTeamConflictAnalysis } from "@/lib/thinkingMachine/conflictAnalysis";
import { explainConflict, leaveAllOtherMembers, restoreOriginalMembers } from "@/lib/thinkingMachine/apiClient";
import {
    getReasoningModeProfile,
    getRoleMeta,
    getNextVisibility,
    getPreviousVisibility,
    normalizeLayerOrigin,
    normalizeReasoningStage,
    normalizeRelationLabel,
    normalizeVisibility,
} from "@/lib/thinkingMachine/nodeMeta";

const INITIAL_NODES = [];
const INITIAL_EDGES = [];
const ADMIN_MODE_STORAGE_KEY = "vtm-admin-mode-enabled";
const ADMIN_HINT_DISMISSED_KEY = "vtm-admin-shortcut-hint-dismissed";
const MOCK_CURRENT_USER_ID = "user-hyeonji";
const MOCK_CURRENT_USER_ROLE = "owner";
const AUTO_FIT_MAX_ZOOM = 1;

const SIMULATION_SCRIPTS = {
  "project-ai-search": [
    { speaker: "Jinki", text: "사용자가 검색어를 입력하기 전에 검색 의도를 정교하게 예측하면 좋겠어요." },
    { speaker: "Taeeun", text: "맞아요. 단순 검색 결과 리스트보다, 사용자가 관련 아이디어를 유기적으로 헤쳐 나가는 탐색 경험 자체가 중요하지 않을까요?" },
    { speaker: "Eunsol", text: "그렇다면 사용자가 따로 액션을 취하기 전에, AI가 흐름에 맞는 관련 콘텐츠나 노드를 먼저 제안하는 방식도 가능할 것 같습니다." },
    { speaker: "Taeeun", text: "좋습니다. 검색창 아래에 최근 탐색한 맥락에 맞춤 추천 노드들을 배치해 탐색 진입 장벽을 대폭 줄여봐요." },
    { speaker: "Jinki", text: "훌륭한 아이디어네요! 그럼 저는 의도 예측 모델을 구현하고, Taeeun님은 탐색 노드 UI 레이아웃 기획안을 다듬어 보시죠." }
  ],
  "project-smart-home": [
    { speaker: "Sooyun", text: "현재의 스마트홈은 단순 끄고 켜는 제어 위주인데, 집이 사용자의 전반적인 상태를 먼저 깊게 이해하면 좋겠어요." },
    { speaker: "Jimin", text: "동감합니다. 예를 들어 조명이나 가전제품들이 사용자의 표정이나 맥락, 감정에 따라 부드럽게 반응하면 어떨까요?" },
    { speaker: "Eunsol", text: "좋은 생각이네요. 센서 데이터들을 종합해서 AI 에이전트가 상황에 맞는 행동을 먼저 제안하는 흐름이면 더 완벽하겠습니다." },
    { speaker: "Taeeun", text: "개인 정보가 중요하니 영상이나 목소리 분석은 온디바이스 AI로 기기 내부에서만 안전하게 동작해야 해요." },
    { speaker: "Sooyun", text: "핵심 요소를 잘 짚어주셨어요! 그럼 에이전트 자동화 제안 시나리오를 구성하고 온디바이스 구현 가능성 검토에 착수합시다." }
  ],
  "project-ai-meeting": [
    { speaker: "Sooyun", text: "회의를 기록하는 데서 끝나는 게 아니라 회의록 자체가 AI를 통해 생각의 유기적인 흐름을 보여주면 좋겠어요." },
    { speaker: "Jimin", text: "맞아요! 발화 내용을 분석해서 중요한 아이디어나 연관 정보를 노드로 자동 생성할 수 있으면 좋겠습니다." },
    { speaker: "Taeeun", text: "그리고 이번 논의뿐만 아니라 이전에 나눴던 과거의 회의 내용들과도 연결된다면 훨씬 유용한 지식 그래프가 될 거예요." },
    { speaker: "Sooyun", text: "회의가 끝난 후 사용자가 혼자 남았을 때도 음성 아이디어를 보라색 노드로 추가 확장하는 오프라인 기능도 꼭 기획합시다." },
    { speaker: "Jimin", text: "좋습니다. 그럼 AI 회의 노드 기획의 핵심 가치를 요약하고 지식 그래프 연동 모듈 초안을 정립해 볼까요?" }
  ],
  "project-onboarding-ux": [
    { speaker: "Jiyu", text: "신규 가입 유저의 데이터 분석 결과, 첫 온보딩 화면에서의 이탈률이 대략 45%로 매우 높게 나타나고 있어요." },
    { speaker: "Taeeun", text: "첫 진입 장벽을 낮춰야 합니다. 복잡한 튜토리얼을 생략하고 핵심 가치를 더 빨리 직접 경험하게 하는 게 관건이에요." },
    { speaker: "Jiyu", text: "동의합니다. 가입 단계를 3단계 이하로 파격적으로 줄이고, 대신 AI 비서가 부드럽게 말로 안내해 주는 건 어떨까요?" },
    { speaker: "Taeeun", text: "좋네요. 가입과 동시에 즉시 체험용 캔버스를 띄우고 실시간 AI 도우미가 단계별 꿀팁을 동적으로 노출해 주는 구조가 적절해 보입니다." },
    { speaker: "Jiyu", text: "완벽하네요! 이 구성으로 온보딩 플로우 와이어프레임을 2가지 시안으로 설계해 보겠습니다." }
  ],
  "project-dashboard-design": [
    { speaker: "Sooyun", text: "우리 프로젝트가 거대해지면서 팀원들이 각자의 진행 상태를 일목요연하게 한 화면에서 보고 싶어 하는 목소리가 큽니다." },
    { speaker: "Jimin", text: "우선순위 관리가 복잡해지지 않게 각 태스크의 우선순위가 업무 데드라인과 연동되어 자동으로 수시 정리되면 편리하겠어요." },
    { speaker: "Taeeun", text: "거기에 더해, 특정 태스크가 지연될 기미가 보이면 AI가 위험 요소를 미리 감지해서 경고나 인사이트를 알려주는 대시보드면 좋겠네요." },
    { speaker: "Sooyun", text: "매우 혁신적인 접근이네요. 칸반 보드 뷰와 AI 인사이트 분석 위젯을 중앙에 배치하는 구조가 어울릴 것 같습니다." },
    { speaker: "Jimin", text: "네! 그럼 이 레이아웃 구성안을 기반으로 화면 설계를 구체화해 보죠." }
  ]
};

const SIMULATION_MOCK_RESPONSES = {
  "project-ai-search": [
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-search-0",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "검색 의도 선예측",
              label: "검색 의도 선예측",
              content: "사용자 행동 맥락을 실시간 분석해 검색 의도를 선측합니다.",
              category: "How",
              phase: "Research",
              jobTag: "Tech",
              topicTag: "Research",
              originalTitle: "검색 의도 선예측 (원문)",
              originalContent: "사용자가 검색어를 입력하기 전에 검색 의도를 정교하게 예측하면 좋겠어요.",
              ownerId: "user-jinki",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Jinki"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-search-0",
            source: "node-search-4",
            target: "sim-node-search-0",
            label: "proposes"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Jinki: 검색 의도 선예측 알고리즘 연구 제안",
        createdNodeIds: ["sim-node-search-0"],
        linkedNodeIds: ["sim-node-search-0"]
      }
    },
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-search-1",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "생성형 탐색 경험",
              label: "생성형 탐색 경험",
              content: "관련 아이디어를 유기적으로 탐색하는 캔버스 UI를 설계합니다.",
              category: "What",
              phase: "Idea",
              jobTag: "UX",
              topicTag: "Insight",
              originalTitle: "생성형 탐색 경험 (원문)",
              originalContent: "맞아요. 단순 검색 결과 리스트보다, 사용자가 관련 아이디어를 유기적으로 헤쳐 나가는 탐색 경험 자체가 중요하지 않을까요?",
              ownerId: "user-taeeun",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Taeeun"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-search-1",
            source: "sim-node-search-0",
            target: "sim-node-search-1",
            label: "refines"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Taeeun: 캔버스 형태의 생성형 탐색 경험 제안",
        createdNodeIds: ["sim-node-search-1"],
        linkedNodeIds: ["sim-node-search-1"]
      }
    },
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-search-2",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "AI 선제적 콘텐츠 제안",
              label: "AI 선제적 콘텐츠 제안",
              content: "검색 흐름에 부합하는 관련 콘텐츠와 노드를 자동 제안합니다.",
              category: "How",
              phase: "Solution",
              jobTag: "Tech",
              topicTag: "Reference",
              originalTitle: "AI 선제적 콘텐츠 제안 (원문)",
              originalContent: "그렇다면 사용자가 따로 액션을 취하기 전에, AI가 흐름에 맞는 관련 콘텐츠나 노드를 먼저 제안하는 방식도 가능할 것 같습니다.",
              ownerId: "user-eunsol",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Eunsol"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-search-2",
            source: "sim-node-search-1",
            target: "sim-node-search-2",
            label: "depends_on"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Eunsol: 실시간 맥락 파악 기반 콘텐츠 선제적 제안 기획",
        createdNodeIds: ["sim-node-search-2"],
        linkedNodeIds: ["sim-node-search-2"]
      }
    },
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-search-3",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "맥락 맞춤형 추천 레이아웃",
              label: "맥락 맞춤형 추천 레이아웃",
              content: "검색창 하단 영역에 맥락 맞춤 추천 노드들을 배치합니다.",
              category: "How",
              phase: "Solution",
              jobTag: "UX",
              topicTag: "Reference",
              originalTitle: "맥락 맞춤형 추천 레이아웃 (원문)",
              originalContent: "좋습니다. 검색창 아래에 최근 탐색한 맥락에 맞춤 추천 노드들을 배치해 탐색 진입 장벽을 대폭 줄여봐요.",
              ownerId: "user-taeeun",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Taeeun"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-search-3",
            source: "sim-node-search-2",
            target: "sim-node-search-3",
            label: "supports"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Taeeun: 검색창 하단 영역의 맥락 기반 추천 레이아웃 설계",
        createdNodeIds: ["sim-node-search-3"],
        linkedNodeIds: ["sim-node-search-3"]
      }
    },
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-search-4",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "역할 분담 및 기획 구체화",
              label: "역할 분담 및 기획 구체화",
              content: "의도 예측 모델을 구현하고 노드 UI 레이아웃을 기획합니다.",
              category: "Who",
              phase: "Action",
              jobTag: "Business",
              topicTag: "Context",
              originalTitle: "역할 분담 및 기획 구체화 (원문)",
              originalContent: "훌륭한 아이디어네요! 그럼 저는 의도 예측 모델을 구현하고, Taeeun님은 탐색 노드 UI 레이아웃 기획안을 다듬어 보시죠.",
              ownerId: "user-jinki",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Jinki"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-search-4",
            source: "sim-node-search-3",
            target: "sim-node-search-4",
            label: "supports"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Jinki: 역할 분배 및 개발/기획 착수",
        createdNodeIds: ["sim-node-search-4"],
        linkedNodeIds: ["sim-node-search-4"]
      }
    }
  ],
  "project-smart-home": [
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-home-0",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "공감형 가전 조율 필요성",
              label: "공감형 가전 조율 필요성",
              content: "사용자 상태를 감지하고 조율하는 공감형 스마트홈이 필요합니다.",
              category: "Why",
              phase: "Research",
              jobTag: "UX",
              topicTag: "Research",
              originalTitle: "공감형 가전 조율 필요성 (원문)",
              originalContent: "현재의 스마트홈은 단순 끄고 켜는 제어 위주인데, 집이 사용자의 전반적인 상태를 먼저 깊게 이해하면 좋겠어요.",
              ownerId: "user-sooyun",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Sooyun"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-home-0",
            source: "node-home-3",
            target: "sim-node-home-0",
            label: "proposes"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Sooyun: 사용자의 전반적인 상태 파악 공감 에이전트 필요성 제기",
        createdNodeIds: ["sim-node-home-0"],
        linkedNodeIds: ["sim-node-home-0"]
      }
    },
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-home-1",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "감정 반응형 스마트홈",
              label: "감정 반응형 스마트홈",
              content: "표정과 목소리 톤 등의 데이터를 연동해 부드럽게 반응하는 조명을 구성합니다.",
              category: "What",
              phase: "Solution",
              jobTag: "UX",
              topicTag: "Insight",
              originalTitle: "감정 반응형 스마트홈 (원문)",
              originalContent: "동감합니다. 예를 들어 조명이나 가전제품들이 사용자의 표정이나 맥락, 감정에 따라 부드럽게 반응하면 어떨까요?",
              ownerId: "user-jimin",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Jimin"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-home-1",
            source: "sim-node-home-0",
            target: "sim-node-home-1",
            label: "refines"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Jimin: 감정 및 표정 감지 기반 가전기기 반응형 연동 제안",
        createdNodeIds: ["sim-node-home-1"],
        linkedNodeIds: ["sim-node-home-1"]
      }
    },
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-home-2",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "상황 기반 선제 에이전트",
              label: "상황 기반 선제 에이전트",
              content: "실시간 센서 정보를 기반으로 AI가 맞춤 가전 제어를 선제 추천합니다.",
              category: "How",
              phase: "Solution",
              jobTag: "Tech",
              topicTag: "Reference",
              originalTitle: "상황 기반 선제 에이전트 (원문)",
              originalContent: "좋은 생각이네요. 센서 데이터들을 종합해서 AI 에이전트가 상황에 맞는 행동을 먼저 제안하는 흐름이면 더 완벽하겠습니다.",
              ownerId: "user-eunsol",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Eunsol"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-home-2",
            source: "sim-node-home-1",
            target: "sim-node-home-2",
            label: "depends_on"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Eunsol: 실시간 센서 정보 기반 AI의 선제 가전 행동 추천 기획",
        createdNodeIds: ["sim-node-home-2"],
        linkedNodeIds: ["sim-node-home-2"]
      }
    },
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-home-3",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "온디바이스 프라이버시 엔진",
              label: "온디바이스 프라이버시 엔진",
              content: "클라우드 전송 없이 기기 내부 허브에서 감정 분석 연산을 안전하게 처리합니다.",
              category: "How",
              phase: "Research",
              jobTag: "Tech",
              topicTag: "Reference",
              originalTitle: "온디바이스 프라이버시 엔진 (원문)",
              originalContent: "개인 정보가 중요하니 영상이나 목소리 분석은 온디바이스 AI로 기기 내부에서만 안전하게 동작해야 해요.",
              ownerId: "user-taeeun",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Taeeun"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-home-3",
            source: "sim-node-home-2",
            target: "sim-node-home-3",
            label: "supports"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Taeeun: 프라이버시 보호를 위한 스마트 허브 온디바이스 연산 설계",
        createdNodeIds: ["sim-node-home-3"],
        linkedNodeIds: ["sim-node-home-3"]
      }
    },
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-home-4",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "동작 시나리오 구체화 태스크",
              label: "동작 시나리오 구체화 태스크",
              content: "가전 자동화 반응 시나리오 기획과 온디바이스 구현 검토를 추진합니다.",
              category: "Who",
              phase: "Action",
              jobTag: "Business",
              topicTag: "Context",
              originalTitle: "동작 시나리오 구체화 태스크 (원문)",
              originalContent: "핵심 요소를 잘 짚어주셨어요! 그럼 에이전트 자동화 제안 시나리오를 구성하고 온디바이스 구현 가능성 검토에 착수합시다.",
              ownerId: "user-sooyun",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Sooyun"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-home-4",
            source: "sim-node-home-3",
            target: "sim-node-home-4",
            label: "supports"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Sooyun: 실질적인 시뮬레이션 동작 시나리오 구체화 및 역할 분담",
        createdNodeIds: ["sim-node-home-4"],
        linkedNodeIds: ["sim-node-home-4"]
      }
    }
  ],
  "project-ai-meeting": [
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-meet-0",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "생각의 흐름 시각화",
              label: "생각의 흐름 시각화",
              content: "대화 나열을 넘어 생각의 유기적 흐름을 캔버스 맵으로 가시화합니다.",
              category: "What",
              phase: "Idea",
              jobTag: "UX",
              topicTag: "Insight",
              originalTitle: "생각의 흐름 시각화 (원문)",
              originalContent: "회의를 기록하는 데서 끝나는 게 아니라 회의록 자체가 AI를 통해 생각의 유기적인 흐름을 보여주면 좋겠어요.",
              ownerId: "user-sooyun",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Sooyun"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-meet-0",
            source: "node-meet-how-3",
            target: "sim-node-meet-0",
            label: "proposes"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Sooyun: 단순 텍스트 회의록 대안으로 아이디어 논리 시각화 맵 제안",
        createdNodeIds: ["sim-node-meet-0"],
        linkedNodeIds: ["sim-node-meet-0"]
      }
    },
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-meet-1",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "실시간 아이디어 노드 자동 추출",
              label: "실시간 아이디어 노드 자동 추출",
              content: "음성 대화에서 중요한 아젠다를 추출해 캔버스 노드로 실시간 자동 생성합니다.",
              category: "How",
              phase: "Solution",
              jobTag: "Tech",
              topicTag: "Reference",
              originalTitle: "실시간 아이디어 노드 자동 추출 (원문)",
              originalContent: "맞아요! 발화 내용을 분석해서 중요한 아이디어나 연관 정보를 노드로 자동 생성할 수 있으면 좋겠습니다.",
              ownerId: "user-jimin",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Jimin"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-meet-1",
            source: "sim-node-meet-0",
            target: "sim-node-meet-1",
            label: "refines"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Jimin: 음성 발화에서의 실시간 아젠다 추출 및 캔버스 자동화 기획",
        createdNodeIds: ["sim-node-meet-1"],
        linkedNodeIds: ["sim-node-meet-1"]
      }
    },
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-meet-2",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "히스토리 지식 그래프 연결",
              label: "히스토리 지식 그래프 연결",
              content: "과거 회의 데이터와 유기적으로 하이퍼링크 엣지를 구축해 지식 그래프를 형성합니다.",
              category: "How",
              phase: "Solution",
              jobTag: "Tech",
              topicTag: "Reference",
              originalTitle: "히스토리 지식 그래프 연결 (원문)",
              originalContent: "그리고 이번 논의뿐만 아니라 이전에 나눴던 과거의 회의 내용들과도 연결된다면 훨씬 유용한 지식 그래프가 될 거예요.",
              ownerId: "user-taeeun",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Taeeun"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-meet-2",
            source: "sim-node-meet-0",
            target: "sim-node-meet-2",
            label: "depends_on"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Taeeun: 과거 회의 캔버스와의 연관 노드 및 히스토리 지식 그래프 연결 기획",
        createdNodeIds: ["sim-node-meet-2"],
        linkedNodeIds: ["sim-node-meet-2"]
      }
    },
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-meet-3",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "회의 종료 후 오프라인 아이디어 추가",
              label: "회의 종료 후 오프라인 아이디어 추가",
              content: "회의 종료 후 혼자 남은 사용자의 음성 아이디어를 보라색 노드로 추가 연결합니다.",
              category: "How",
              phase: "Idea",
              jobTag: "UX",
              topicTag: "Insight",
              originalTitle: "회의 종료 후 오프라인 아이디어 추가 (원문)",
              originalContent: "회의가 끝난 후 사용자가 혼자 남았을 때도 음성 아이디어를 보라색 노드로 추가 확장하는 오프라인 기능도 꼭 기획합시다.",
              ownerId: "user-sooyun",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Sooyun"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-meet-3",
            source: "sim-node-meet-0",
            target: "sim-node-meet-3",
            label: "supports"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Sooyun: 공식 회의 종료 후 혼자 남은 사용자 전용 음성 보라색 노드 제안",
        createdNodeIds: ["sim-node-meet-3"],
        linkedNodeIds: ["sim-node-meet-3"]
      }
    },
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-meet-4",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "구축 아키텍처 R&D 분담",
              label: "구축 아키텍처 R&D 분담",
              content: "핵심 가치 요약과 지식 그래프 연동 모듈 초안 작성을 분담하여 진행합니다.",
              category: "Who",
              phase: "Action",
              jobTag: "Business",
              topicTag: "Context",
              originalTitle: "구축 아키텍처 R&D 분담 (원문)",
              originalContent: "좋습니다. 그럼 AI 회의 노드 기획의 핵심 가치를 요약하고 지식 그래프 연동 모듈 초안을 정립해 볼까요?",
              ownerId: "user-jimin",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Jimin"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-meet-4-1",
            source: "sim-node-meet-1",
            target: "sim-node-meet-4",
            label: "supports"
          },
          {
            id: "edge-sim-meet-4-2",
            source: "sim-node-meet-2",
            target: "sim-node-meet-4",
            label: "supports"
          },
          {
            id: "edge-sim-meet-4-3",
            source: "sim-node-meet-3",
            target: "sim-node-meet-4",
            label: "supports"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Jimin: 핵심 가치 요약 및 본격 개발 아키텍처 수립과 업무 지정",
        createdNodeIds: ["sim-node-meet-4"],
        linkedNodeIds: ["sim-node-meet-4"]
      }
    }
  ],
  "project-onboarding-ux": [
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-onboard-0",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "초기 이탈률 45% 분석",
              label: "초기 이탈률 45% 분석",
              content: "인지적 피로로 인한 초기 이탈률 개선 및 진입 장벽 완화를 모색합니다.",
              category: "Problem",
              phase: "Research",
              jobTag: "UX",
              topicTag: "Insight",
              originalTitle: "초기 이탈률 45% 분석 (원문)",
              originalContent: "신규 가입 유저의 데이터 분석 결과, 첫 온보딩 화면에서의 이탈률이 대략 45%로 매우 높게 나타나고 있어요.",
              ownerId: "user-jiyu",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Jiyu"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-onboard-0",
            source: "node-onboard-3",
            target: "sim-node-onboard-0",
            label: "proposes"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Jiyu: 초기 온보딩 이탈 유저 약 45% 데이터 분석 결과 보고",
        createdNodeIds: ["sim-node-onboard-0"],
        linkedNodeIds: ["sim-node-onboard-0"]
      }
    },
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-onboard-1",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "아하 모먼트 단축의 중요성",
              label: "아하 모먼트 단축의 중요성",
              content: "가이드를 줄이고 핵심 가치 경험(아하 모먼트) 시점을 크게 단축시킵니다.",
              category: "Why",
              phase: "Idea",
              jobTag: "Business",
              topicTag: "Research",
              originalTitle: "아하 모먼트 단축의 중요성 (원문)",
              originalContent: "첫 진입 장벽을 낮춰야 합니다. 복잡한 튜토리얼을 생략하고 핵심 가치를 더 빨리 직접 경험하게 하는 게 관건이에요.",
              ownerId: "user-taeeun",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Taeeun"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-onboard-1",
            source: "sim-node-onboard-0",
            target: "sim-node-onboard-1",
            label: "refines"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Taeeun: 긴 가이드를 줄여 사용자의 아하 모먼트 체감 시점 단축 필요성 제기",
        createdNodeIds: ["sim-node-onboard-1"],
        linkedNodeIds: ["sim-node-onboard-1"]
      }
    },
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-onboard-2",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "AI 가이드 음성 안내 온보딩",
              label: "AI 가이드 음성 안내 온보딩",
              content: "가입 절차 축소 및 AI 비서 캐릭터의 음성 동선 안내를 결합합니다.",
              category: "What",
              phase: "Solution",
              jobTag: "UX",
              topicTag: "Insight",
              originalTitle: "AI 가이드 음성 안내 온보딩 (원문)",
              originalContent: "동의합니다. 가입 단계를 3단계 이하로 파격적으로 줄이고, 대신 AI 비서가 부드럽게 말로 안내해 주는 건 어떨까요?",
              ownerId: "user-jiyu",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Jiyu"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-onboard-2",
            source: "sim-node-onboard-1",
            target: "sim-node-onboard-2",
            label: "depends_on"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Jiyu: 가입 복잡도를 3단계 이하로 낮추고 AI 비서 보이스 안내 결합 제안",
        createdNodeIds: ["sim-node-onboard-2"],
        linkedNodeIds: ["sim-node-onboard-2"]
      }
    },
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-onboard-3",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "실시간 대화형 체험 캔버스",
              label: "실시간 대화형 체험 캔버스",
              content: "체험형 가상 협업 캔버스를 제공해 핵심 기능을 동적으로 학습하도록 유도합니다.",
              category: "How",
              phase: "Solution",
              jobTag: "Tech",
              topicTag: "Reference",
              originalTitle: "실시간 대화형 체험 캔버스 (원문)",
              originalContent: "좋네요. 가입과 동시에 즉시 체험용 캔버스를 띄우고 실시간 AI 도우미가 단계별 꿀팁을 동적으로 노출해 주는 구조가 적절해 보입니다.",
              ownerId: "user-taeeun",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Taeeun"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-onboard-3",
            source: "sim-node-onboard-2",
            target: "sim-node-onboard-3",
            label: "supports"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Taeeun: 대화식 인터랙션과 실시간 체험 템플릿 캔버스 구성 설계안 제안",
        createdNodeIds: ["sim-node-onboard-3"],
        linkedNodeIds: ["sim-node-onboard-3"]
      }
    },
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-onboard-4",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "UX 와이어프레임 설계 Task",
              label: "UX 와이어프레임 설계 Task",
              content: "보이스 가이드 UI 및 체험형 캔버스 프로토타입 시안을 도출합니다.",
              category: "Who",
              phase: "Action",
              jobTag: "Business",
              topicTag: "Context",
              originalTitle: "UX 와이어프레임 설계 Task (원문)",
              originalContent: "완벽하네요! 이 구성으로 온보딩 플로우 와이어프레임을 2가지 시안으로 설계해 보겠습니다.",
              ownerId: "user-jiyu",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Jiyu"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-onboard-4",
            source: "sim-node-onboard-3",
            target: "sim-node-onboard-4",
            label: "supports"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Jiyu: 신규 유저 온보딩 흐름 2종 기획서 및 와이어프레임 제작 업무 정의",
        createdNodeIds: ["sim-node-onboard-4"],
        linkedNodeIds: ["sim-node-onboard-4"]
      }
    }
  ],
  "project-dashboard-design": [
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-dash-0",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "진행 상태 한눈에 가시화 필요",
              label: "진행 상태 한눈에 가시화 필요",
              content: "다중 프로젝트의 실시간 진행 현황을 직관적으로 조망할 통합 대시보드를 기획합니다.",
              category: "Why",
              phase: "Research",
              jobTag: "UX",
              topicTag: "Research",
              originalTitle: "진행 상태 한눈에 가시화 필요 (원문)",
              originalContent: "우리 프로젝트가 거대해지면서 팀원들이 각자의 진행 상태를 일목요연하게 한 화면에서 보고 싶어 하는 목소리가 큽니다.",
              ownerId: "user-sooyun",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Sooyun"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-dash-0",
            source: "node-dash-3",
            target: "sim-node-dash-0",
            label: "proposes"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Sooyun: 다중 파트 협업을 위한 전체 업무 흐름 시각 대시보드 도입 요망",
        createdNodeIds: ["sim-node-dash-0"],
        linkedNodeIds: ["sim-node-dash-0"]
      }
    },
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-dash-1",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "마일스톤 연동 우선순위 오토 소팅",
              label: "마일스톤 연동 우선순위 오토 소팅",
              content: "데드라인과 연동해 오늘 해야 할 일을 실시간 우선순위 소팅하여 정렬합니다.",
              category: "What",
              phase: "Solution",
              jobTag: "UX",
              topicTag: "Insight",
              originalTitle: "마일스톤 연동 우선순위 오토 소팅 (원문)",
              originalContent: "우선순위 관리가 복잡해지지 않게 각 태스크의 우선순위가 업무 데드라인과 연동되어 자동으로 수시 정리되면 편리하겠어요.",
              ownerId: "user-jimin",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Jimin"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-dash-1",
            source: "sim-node-dash-0",
            target: "sim-node-dash-1",
            label: "refines"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Jimin: 마일리 리스트와 업무 데드라인 실시간 자동 재정렬 시스템 설계안",
        createdNodeIds: ["sim-node-dash-1"],
        linkedNodeIds: ["sim-node-dash-1"]
      }
    },
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-dash-2",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "AI 타임라인 리스크 인텔리전스",
              label: "AI 타임라인 리스크 인텔리전스",
              content: "작업 지연율을 예측하여 마일스톤에 미치는 병목 리스크를 자동 감지해 예보합니다.",
              category: "How",
              phase: "Solution",
              jobTag: "Tech",
              topicTag: "Reference",
              originalTitle: "AI 타임라인 리스크 인텔리전스 (원문)",
              originalContent: "거기에 더해, 특정 태스크가 지연될 기미가 보이면 AI가 위험 요소를 미리 감지해서 경고나 인사이트를 알려주는 대시보드면 좋겠네요.",
              ownerId: "user-taeeun",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Taeeun"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-dash-2",
            source: "sim-node-dash-1",
            target: "sim-node-dash-2",
            label: "depends_on"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Taeeun: 작업 완료 지연률 예측을 통한 핵심 타임라인 리스크 경고 기능",
        createdNodeIds: ["sim-node-dash-2"],
        linkedNodeIds: ["sim-node-dash-2"]
      }
    },
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-dash-3",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "AI 리스크 위젯 중심 대시보드 Layout",
              label: "AI 리스크 위젯 중심 대시보드 Layout",
              content: "AI 분석 알림 위젯과 칸반 보드, 타임라인을 유기적으로 결합해 구성합니다.",
              category: "What",
              phase: "Solution",
              jobTag: "UX",
              topicTag: "Insight",
              originalTitle: "AI 리스크 위젯 중심 대시보드 Layout (원문)",
              originalContent: "매우 혁신적인 접근이네요. 칸반 보드 뷰와 AI 인사이트 분석 위젯을 중앙에 배치하는 구조가 어울릴 것 같습니다.",
              ownerId: "user-sooyun",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Sooyun"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-dash-3",
            source: "sim-node-dash-2",
            target: "sim-node-dash-3",
            label: "supports"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Sooyun: 타임라인 위험 분석 신호등 대시보드 컴포넌트 레이아웃 구성안",
        createdNodeIds: ["sim-node-dash-3"],
        linkedNodeIds: ["sim-node-dash-3"]
      }
    },
    {
      graphPatch: {
        nodes: [
          {
            id: "sim-node-dash-4",
            type: "thinkingNode",
            position: { x: 500, y: 300 },
            data: {
              title: "대시보드 상세 기획 및 백엔드 설계 분담",
              label: "대시보드 상세 기획 및 백엔드 설계 분담",
              content: "리스크 대시보드 상세 기획 및 작업 소팅용 DB 스키마 개발에 착수합니다.",
              category: "Who",
              phase: "Action",
              jobTag: "Business",
              topicTag: "Context",
              originalTitle: "대시보드 상세 기획 및 백엔드 설계 분담 (원문)",
              originalContent: "네! 그럼 이 레이아웃 구성안을 기반으로 화면 설계를 구체화해 보죠.",
              ownerId: "user-jimin",
              sourceType: "user",
              visibility: "shared",
              confidence: "high",
              editedBy: "Jimin"
            }
          }
        ],
        edges: [
          {
            id: "edge-sim-dash-4",
            source: "sim-node-dash-3",
            target: "sim-node-dash-4",
            label: "supports"
          }
        ]
      },
      meetingSummary: {
        chunkSummary: "Jimin: 시안 상세화, 업무 보드 및 소팅 DB 스키마 구축 태스크 분배",
        createdNodeIds: ["sim-node-dash-4"],
        linkedNodeIds: ["sim-node-dash-4"]
      }
    }
  ]
};

function cubicOut(t) {
    return 1 - Math.pow(1 - t, 3);
}

export default function ThinkingMachine({
    projectId = "",
    initialProjectTitle = "Thinking Machine",
    projectMetaHref = "/projects",
    projectMetaLabel = "Back to projects",
    currentUser: initialCurrentUser = null,
}) {
    const [nodes, setNodes, baseOnNodesChange] = useNodesState(INITIAL_NODES);
    const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(true);
    const [drawerMode, setDrawerMode] = useState("tip");
    const [stage, setStage] = useState("Idea");
    const [meetingState, setMeetingState] = useState(() => {
        if (typeof window !== "undefined" && projectId) {
            const isSeeded = [
                "project-ai-search",
                "project-smart-home",
                "project-ai-meeting",
                "project-onboarding-ux",
                "project-dashboard-design"
            ].includes(projectId);
            const isCompleted = localStorage.getItem(`simulation-completed-${projectId}`) === "true";
            if (isSeeded && !isCompleted) {
                return "ended";
            }
        }
        return "active";
    }); // "active" or "ended"
    const [projectTitle, setProjectTitle] = useState(initialProjectTitle);
    const [canvasMode, setCanvasMode] = useState("team");
    const [inputMode, setInputMode] = useState("workspace");
    const [isCanvasInteractive, setIsCanvasInteractive] = useState(true);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [pendingChatCandidateGraph, setPendingChatCandidateGraph] = useState(null);
    const [hasStartedInput, setHasStartedInput] = useState(false);
    const [currentUser] = useState(() => {
        if (initialCurrentUser) return initialCurrentUser;
        if (typeof window !== "undefined") return readCurrentUser();
        return null;
    });
    const [isGraphHydrating, setIsGraphHydrating] = useState(true);
    const [isGraphEntranceAnimating, setIsGraphEntranceAnimating] = useState(false);
    const [selectedTeamMemberId, setSelectedTeamMemberId] = useState(null);
    const [selectedActivityEventId, setSelectedActivityEventId] = useState(null);
    const [teamContextSummary, setTeamContextSummary] = useState(null);
    const [isTeamContextLoading, setIsTeamContextLoading] = useState(false);
    const [teamContextError, setTeamContextError] = useState("");
    const [isTeamContextPanelOpen, setIsTeamContextPanelOpen] = useState(false);
    const [meetingMemory, setMeetingMemory] = useState(() => getDefaultMeetingMemory());
    const [meetingCaptureSummary, setMeetingCaptureSummary] = useState(null);
    const [isMeetingCaptureLoading, setIsMeetingCaptureLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [sttTranscript, setSttTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");
    const [meetingSeconds, setMeetingSeconds] = useState(0);
    const [meetingSessionIdValue] = useState(() => `meeting-${Date.now()}`);
    const meetingSessionIdRef = useRef(meetingSessionIdValue);
    const lastSavedGraphRef = useRef("");
    const lastSyncedTitleRef = useRef(initialProjectTitle);
    const [openConflictNodeId, setOpenConflictNodeId] = useState(null);
    const [conflictExplainResultByNodeId, setConflictExplainResultByNodeId] = useState({});
    const [conflictExplainLoadingByNodeId, setConflictExplainLoadingByNodeId] = useState({});
    const previousConflictStateRef = useRef({});

    const { isAdminMode } = useAdminMode({
        storageKey: ADMIN_MODE_STORAGE_KEY,
        hintDismissedKey: ADMIN_HINT_DISMISSED_KEY,
    });

    const currentUserId = currentUser?.id || MOCK_CURRENT_USER_ID;
    const currentUserName = currentUser?.name || "Hyeonji";
    const currentUserRole = currentUser?.role || MOCK_CURRENT_USER_ROLE;
    const currentUserEmail = currentUser?.email || "";
    const currentUserPicture = currentUser?.picture || "";

    // AI 제안 패널
    const [suggestions, setSuggestions] = useState([]);
    const [dismissedSuggestionIds, setDismissedSuggestionIds] = useState(() => new Set());
    const [highlightedNodeIds, setHighlightedNodeIds] = useState(new Set());
    const nodeContextSuggestions = useMemo(() => {
        return [...nodes]
            .filter((node) => node?.type === "thinkingNode" && node?.id)
            .reverse()
            .map((node) => ({
                id: `node-context-${node.id}`,
                nodeId: node.id,
                _source: "node-context",
                type: "attachedNodes",
                title: node?.data?.title || "",
                content: node?.data?.content || "",
                category: node?.data?.category,
                phase: node?.data?.phase,
                sourceType: node?.data?.sourceType,
                visibility: node?.data?.visibility,
                confidence: node?.data?.confidence || "medium",
                attached_nodes: [
                    {
                        id: node.id,
                        title: node?.data?.title || "",
                        content: node?.data?.content || "",
                        category: node?.data?.category,
                        phase: node?.data?.phase,
                    },
                ],
            }));
    }, [nodes]);
    const drawerSuggestions = useMemo(() => {
        const combined = [...suggestions, ...nodeContextSuggestions];
        return combined.filter((item) => item?.id && !dismissedSuggestionIds.has(item.id));
    }, [dismissedSuggestionIds, nodeContextSuggestions, suggestions]);
    const unseenSuggestions = useMemo(
        () => drawerSuggestions,
        [drawerSuggestions]
    );

    // Chat state (Drawer Chat primary + optional legacy dialog fallback)
    const [, setAttachedNodes] = useState([]); // [{id,title,content,category,phase,sourceType,visibility,confidence}]
    const reactFlowRef = useRef(null);
    const previewNodesFromChatRef = useRef(null);
    const handlePreviewNodesFromChatProxy = useCallback((...args) => {
        return previewNodesFromChatRef.current?.(...args);
    }, []);

    const {
        activeSuggestion,
        setActiveSuggestion,
        chatMessages,
        chatInput,
        setChatInput,
        isChatLoading,
        isChatConverting,
        handleDrawerModeToggle,
        handleDrawerChatSubmit,
        handleDrawerChatConvertToNodes,
        handleDrawerContextSelect,
        resetChat,
    } = useRightDrawerChat({
        suggestions: unseenSuggestions,
        nodes,
        onPreviewNodesFromChat: handlePreviewNodesFromChatProxy,
        isDrawerOpen,
        setIsDrawerOpen,
        drawerMode,
        setDrawerMode,
        stage,
        meetingState,
    });

    const handleDrawerModeChange = useCallback((nextMode) => {
        handleDrawerModeToggle(nextMode);
        setIsDrawerOpen(true);
    }, [handleDrawerModeToggle]);

    const handleDrawerSuggestionSelect = useCallback((item) => {
        if (!item) return;
        if (item?.id && item?._source !== "node-auto") {
            setDismissedSuggestionIds((prev) => {
                const next = new Set(prev);
                next.add(item.id);
                return next;
            });
        }
        handleDrawerContextSelect(item);
    }, [handleDrawerContextSelect]);

    const {
        selectedDraftIds,
        showDraftConvertPrompt,
        setShowDraftConvertPrompt,
        draftConvertIdsRef,
        selectionBoxEnabled,
        draftSubmittingIds,
        createPostitDraft,
        createImageDraft,
        handlePostitChangeText,
        handleImageChangeCaption,
        handleImagePick,
        handleDraftSubmit,
        handleSelectionChange,
        convertDraftsToGroup,
        toggleIdeaGroupMode,
    } = useDraftGrouping({
        nodes,
        edges,
        setNodes,
        setEdges,
        isAnalyzing,
        setIsAnalyzing,
        setSuggestions,
        reactFlowRef,
        stage,
        currentUserId,
        currentUserName,
        meetingState,
    });

    const isChatDropActive = false;
    const ghostDrag = null;
    const chatButtonRef = useRef(null);
    const chatDropZoneRef = useRef(null);
    const filteredOnNodesChange = baseOnNodesChange;
    const handleNodeDragStart = null;
    const handleNodeDragUpdate = null;
    const handleNodeDragStop = null;

    const {
        projectLastUpdated,
        activityLog,
        teamMembers,
        currentMember,
        lastRefreshedAt,
        recordProjectActivity,
        refreshProjectCollaborationMeta,
    } = useThinkingCollaboration({
        projectId,
        currentUserId,
        currentUserRole,
        currentUserName,
        currentUserEmail,
        currentUserPicture,
    });
    const effectiveCurrentUserRole = currentMember?.role || currentUserRole;
    const currentRoleMeta = getRoleMeta(effectiveCurrentUserRole);
    const normalizedStage = useMemo(() => normalizeReasoningStage(stage), [stage]);
    const hasSpeechActivity = Boolean(interimTranscript.trim() || sttTranscript.trim());
    const activeSpeakerId = useMemo(() => {
        if (!isListening) return null;
        return (
            resolveTeamMember(teamMembers, { id: currentUserId, name: currentUserName })?.id ||
            "user-hyeonji"
        );
    }, [currentUserId, currentUserName, isListening, teamMembers]);
    const isActiveSpeakerTalking = isListening;

    useProjectGraphSync({
        projectId,
        nodes,
        edges,
        normalizedStage,
        meetingMemory,
        currentUserId,
        currentUserName,
        currentUserEmail,
        currentUserPicture,
        effectiveCurrentUserRole,
        isGraphHydrating,
        setNodes,
        setEdges,
        setStage,
        setMeetingMemory,
        setProjectTitle,
        setHasStartedInput,
        setIsGraphHydrating,
        setIsGraphEntranceAnimating,
        refreshProjectCollaborationMeta,
        lastSavedGraphRef,
        lastSyncedTitleRef,
        projectTitle,
    });

    useEffect(() => {
        setIsGraphEntranceAnimating(false);
    }, [projectId]);

    useEffect(() => {
        if (!isGraphEntranceAnimating) return undefined;
        const timer = window.setTimeout(() => {
            setIsGraphEntranceAnimating(false);
        }, GRAPH_ENTRANCE_ANIMATION_MS);
        return () => window.clearTimeout(timer);
    }, [isGraphEntranceAnimating, projectId]);

    const handleFlowInit = (instance) => {
        reactFlowRef.current = instance;
    };

    const animateViewportToNodes = useCallback((targetNodes) => {
        const inst = reactFlowRef?.current;
        const bounds = computeNodeBounds(targetNodes);
        if (!inst || !bounds) return;
        const canvasElement = document.querySelector(".tm-canvas-flow");
        const viewportWidth = canvasElement?.clientWidth ?? window.innerWidth;
        const viewportHeight = canvasElement?.clientHeight ?? window.innerHeight;
        if (typeof inst.setViewport === "function") {
            requestAnimationFrame(() => {
                const nextViewport = getViewportForBounds(
                    {
                        x: bounds.minX - 72,
                        y: bounds.minY - 72,
                        width: Math.max(260, bounds.maxX - bounds.minX) + 144,
                        height: Math.max(220, bounds.maxY - bounds.minY) + 144,
                    },
                    viewportWidth,
                    viewportHeight,
                    0.2,
                    AUTO_FIT_MAX_ZOOM,
                    0.18
                );
                nextViewport.zoom = Math.min(nextViewport.zoom, AUTO_FIT_MAX_ZOOM);
                inst.setViewport(nextViewport, {
                    duration: 700,
                    ease: cubicOut,
                });
            });
        }
    }, []);

    const handleStageChange = useCallback((nextStage) => {
        const safeStage = normalizeReasoningStage(nextStage);
        if (safeStage === normalizedStage) return;
        setStage(safeStage);
        void recordProjectActivity("stage_changed", {
            nodeTitle: safeStage,
            nodeType: "Stage",
            before: { stage: normalizedStage },
            after: { stage: safeStage },
            relatedNodeIds: [],
            metadata: {
                reason: "Canvas reasoning stage changed",
            },
            stage: safeStage,
        });
    }, [normalizedStage, recordProjectActivity]);

    const handleMergeNodes = useCallback((sourceId, targetId) => {
        const nodeA = nodes.find((n) => n.id === sourceId);
        const nodeB = nodes.find((n) => n.id === targetId);
        if (!nodeA || !nodeB) return;

        const mergedTitle = `${nodeB.data?.title || "Untitled"} & ${nodeA.data?.title || "Untitled"}`;
        const mergedContent = `${nodeB.data?.content || ""} (병합됨: ${nodeA.data?.content || ""})`;

        setNodes((prevNodes) =>
            prevNodes
                .map((n) => {
                    if (n.id === targetId) {
                        return {
                            ...n,
                            data: {
                                ...n.data,
                                title: mergedTitle,
                                content: mergedContent,
                            },
                        };
                    }
                    return n;
                })
                .filter((n) => n.id !== sourceId)
        );

        setEdges((prevEdges) =>
            prevEdges
                .map((e) => {
                    let nextEdge = { ...e };
                    if (e.source === sourceId) nextEdge.source = targetId;
                    if (e.target === sourceId) nextEdge.target = targetId;
                    return nextEdge;
                })
                .filter((e) => e.source !== e.target)
        );

        void recordProjectActivity("nodes_merged", {
            nodeTitle: mergedTitle,
            nodeType: nodeB.data?.category || "Idea",
            metadata: {
                reason: "User merged contextually redundant nodes",
                sourceNodeId: sourceId,
                targetNodeId: targetId,
            },
        });
    }, [nodes, setNodes, setEdges, recordProjectActivity]);

    const handleLinkNodes = useCallback((sourceId, targetId) => {
        const rawEdge = {
            id: `e-link-${sourceId}-${targetId}`,
            source: sourceId,
            target: targetId,
            label: "refines",
        };
        const nextConnectorEdges = toConnectorEdges([rawEdge], nodes, edges);
        setEdges((prev) => [...prev, ...nextConnectorEdges]);

        void recordProjectActivity("nodes_linked", {
            nodeTitle: nodes.find((n) => n.id === targetId)?.data?.title || "Linked nodes",
            nodeType: "Link",
            metadata: {
                reason: "User accepted AI link suggestion",
                sourceNodeId: sourceId,
                targetNodeId: targetId,
            },
        });
    }, [nodes, edges, setEdges, recordProjectActivity]);

    const {
        handleAddNodesFromChat,
        handlePreviewNodesFromChat,
        handleCommitCandidateNodes,
        handleCommitCandidateNodesAsPrivate,
        handleDiscardCandidateNodes,
        pendingCandidatePreview,
    } = useChatGraphIngest({
        nodes,
        edges,
        currentUserId,
        currentUserName,
        normalizedStage,
        setNodes,
        setEdges,
        setActiveSuggestion,
        pendingChatCandidateGraph,
        setPendingChatCandidateGraph,
        animateViewportToNodes,
        recordProjectActivity,
    });
    useEffect(() => {
        previewNodesFromChatRef.current = handlePreviewNodesFromChat;
    }, [handlePreviewNodesFromChat]);

    const handleSetNodeVisibility = useCallback((nodeId, nextVisibility) => {
        const normalizedNext = normalizeVisibility(nextVisibility);
        let previousVisibility = null;
        let previousLayerOrigin = "personal";
        let nextNodeTitle = "";
        let nextNodeType = "";
        let beforeSnapshot = null;
        let afterSnapshot = null;
        const relatedNodeIds = getRelatedNodeIds(nodeId, edges);
        setNodes((prevNodes) =>
            prevNodes.map((node) => {
                if (node.id !== nodeId || node.type !== "thinkingNode") return node;
                previousVisibility = normalizeVisibility(node.data?.visibility);
                previousLayerOrigin = normalizeLayerOrigin(node.data?.layerOrigin, previousVisibility);
                nextNodeTitle = node.data?.title || "";
                nextNodeType = node.data?.category || "";
                beforeSnapshot = getNodeSnapshot(node, edges);
                const isPromotingToTeam =
                    ["private", "candidate"].includes(previousVisibility) &&
                    ["shared", "reviewed", "agreed"].includes(normalizedNext);
                const updated = {
                    ...node,
                    data: {
                        ...node.data,
                        ownerId: currentUserId,
                        editedBy: currentUserName,
                        visibility: normalizedNext,
                        layerOrigin: isPromotingToTeam ? previousLayerOrigin : normalizeLayerOrigin(node.data?.layerOrigin, normalizedNext),
                        promotedFromVisibility: isPromotingToTeam ? previousVisibility : node.data?.promotedFromVisibility || "",
                        promotedAt: isPromotingToTeam ? new Date().toISOString() : node.data?.promotedAt || "",
                        promotedBy: isPromotingToTeam ? currentUserName : node.data?.promotedBy || "",
                    },
                };
                const rebuilt = toReactFlowNode({
                    id: updated.id,
                    position: updated.position,
                    data: {
                        label: updated.data?.title,
                        content: updated.data?.content,
                        category: updated.data?.category,
                        phase: updated.data?.phase,
                        ownerId: updated.data?.ownerId,
                        editedBy: updated.data?.editedBy,
                        sourceType: updated.data?.sourceType,
                        visibility: updated.data?.visibility,
                        confidence: updated.data?.confidence,
                        layerOrigin: updated.data?.layerOrigin,
                        promotedFromVisibility: updated.data?.promotedFromVisibility,
                        promotedAt: updated.data?.promotedAt,
                        promotedBy: updated.data?.promotedBy,
                        conflictState: updated.data?.conflictState,
                        conflictSummary: updated.data?.conflictSummary,
                        conflictLinkedNodeIds: updated.data?.conflictLinkedNodeIds,
                        conflictUpdatedAt: updated.data?.conflictUpdatedAt,
                    },
                }, null);
                afterSnapshot = getNodeSnapshot({ ...updated, ...rebuilt }, edges);
                return {
                    ...updated,
                    ...rebuilt,
                    parentNode: updated.parentNode,
                    extent: updated.extent,
                    hidden: updated.hidden,
                    selected: updated.selected,
                };
            })
        );
        void recordProjectActivity("node_visibility_changed", {
            nodeId,
            nodeTitle: nextNodeTitle,
            nodeType: nextNodeType,
            before: beforeSnapshot,
            after: afterSnapshot,
            relatedNodeIds,
            stage: normalizedStage,
        });
        if (["shared", "reviewed", "agreed"].includes(normalizedNext) && ["private", "candidate"].includes(previousVisibility || "")) {
            setCanvasMode("team");
            void recordProjectActivity("node_promoted_to_team", {
                nodeId,
                nodeTitle: nextNodeTitle,
                nodeType: nextNodeType,
                before: beforeSnapshot,
                after: afterSnapshot,
                relatedNodeIds,
                stage: normalizedStage,
                metadata: {
                    promotedFromVisibility: previousVisibility,
                },
            });
        }
        if (normalizedNext === "shared" && previousVisibility !== "shared") {
            void recordProjectActivity("node_shared", {
                nodeId,
                nodeTitle: nextNodeTitle,
                nodeType: nextNodeType,
                before: beforeSnapshot,
                after: afterSnapshot,
                relatedNodeIds,
                stage: normalizedStage,
            });
        }
    }, [currentUserId, currentUserName, edges, normalizedStage, recordProjectActivity, setCanvasMode, setNodes]);

    const handleNodeSelectionChange = useCallback(
        ({ nodes: selectedNodes = [] } = {}) => {
            handleSelectionChange?.({ nodes: selectedNodes });
            const firstThinkingNode = selectedNodes.find((node) => node?.type === "thinkingNode");
            if (firstThinkingNode?.id) {
                setSelectedNodeId(firstThinkingNode.id);
            }
        },
        [handleSelectionChange]
    );

    const {
        hasThinkingGraph,
        selectedNode,
        visibleCanvasNodeIds,
        canvasNodes,
        canvasEdges,
        selectedNodeLinkedNodes,
    } = useThinkingGraphState({
        nodes,
        edges,
        selectedNodeId,
        canvasMode,
        currentUserId,
    });
    const reasoningAlignmentAnalysis = useMemo(
        () => buildReasoningAlignmentAnalysis({
            nodes: canvasNodes,
            edges: canvasEdges,
            selectedNodeId,
        }),
        [canvasEdges, canvasNodes, selectedNodeId]
    );
    const teamConflictAnalysis = useMemo(
        () => buildTeamConflictAnalysis({
            nodes,
            edges,
        }),
        [edges, nodes]
    );
    const decoratedCanvasEdges = useMemo(
        () =>
            decorateConnectorEdges(canvasEdges, reasoningAlignmentAnalysis, canvasNodes).map((edge) => ({
                ...edge,
                data: {
                    ...(edge.data || {}),
                    graphEntranceAnimating: edge?.data?.isHydratedEdge ? isGraphEntranceAnimating : undefined,
                },
            })),
        [canvasEdges, canvasNodes, isGraphEntranceAnimating, reasoningAlignmentAnalysis]
    );
    const alignmentSummary = reasoningAlignmentAnalysis?.selectedSummary || {
        counts: reasoningAlignmentAnalysis?.counts || {},
        sections: reasoningAlignmentAnalysis?.sections || {},
    };
    const meetingMemoryReadout = useMemo(
        () => buildMeetingMemoryReadout(meetingMemory, nodes),
        [meetingMemory, nodes]
    );

    useEffect(() => {
        setNodes((prevNodes) => {
            let hasChanges = false;
            const nextNodes = prevNodes.map((node) => {
                if (node?.type !== "thinkingNode") return node;
                const conflictMeta = teamConflictAnalysis?.conflictByNodeId?.[node.id] || null;
                const nextConflictState = conflictMeta?.state || "none";
                const nextConflictSummary = conflictMeta?.summary || "";
                const nextConflictLinkedNodeIds = conflictMeta?.linkedNodeIds || [];
                const currentConflictLinkedNodeIds = Array.isArray(node?.data?.conflictLinkedNodeIds)
                    ? node.data.conflictLinkedNodeIds
                    : [];
                const idsChanged =
                    currentConflictLinkedNodeIds.length !== nextConflictLinkedNodeIds.length ||
                    currentConflictLinkedNodeIds.some((value, index) => value !== nextConflictLinkedNodeIds[index]);
                const summaryChanged = (node?.data?.conflictSummary || "") !== nextConflictSummary;
                const stateChanged = (node?.data?.conflictState || "none") !== nextConflictState;
                if (!idsChanged && !summaryChanged && !stateChanged) return node;
                hasChanges = true;
                return {
                    ...node,
                    data: {
                        ...node.data,
                        conflictState: nextConflictState,
                        conflictSummary: nextConflictSummary,
                        conflictLinkedNodeIds: nextConflictLinkedNodeIds,
                        conflictUpdatedAt: nextConflictState === "none"
                            ? ""
                            : node?.data?.conflictUpdatedAt || new Date().toISOString(),
                    },
                };
            });
            return hasChanges ? nextNodes : prevNodes;
        });
    }, [setNodes, teamConflictAnalysis]);

    useEffect(() => {
        if (isGraphHydrating) return;
        const previousStates = previousConflictStateRef.current || {};
        const nextStates = {};
        nodes.forEach((node) => {
            if (node?.type !== "thinkingNode") return;
            const nextConflict = teamConflictAnalysis?.conflictByNodeId?.[node.id] || null;
            const nextState = nextConflict?.state || "none";
            nextStates[node.id] = nextState;
        });
        if (Object.keys(previousStates).length === 0) {
            previousConflictStateRef.current = nextStates;
            return;
        }
        nodes.forEach((node) => {
            if (node?.type !== "thinkingNode") return;
            const nextConflict = teamConflictAnalysis?.conflictByNodeId?.[node.id] || null;
            const nextState = nextConflict?.state || "none";
            const previousState = previousStates[node.id] || "none";
            if (nextState !== "none" && previousState !== nextState) {
                void recordProjectActivity("node_conflict_detected", {
                    nodeId: node.id,
                    nodeTitle: node?.data?.title || "",
                    nodeType: node?.data?.category || "",
                    before: {
                        conflictState: previousState,
                    },
                    after: {
                        conflictState: nextState,
                        conflictSummary: nextConflict?.summary || "",
                    },
                    relatedNodeIds: nextConflict?.linkedNodeIds || [],
                    stage: normalizedStage,
                    metadata: {
                        conflictLabel: nextConflict?.label || "",
                    },
                });
            }
        });
        previousConflictStateRef.current = nextStates;
    }, [isGraphHydrating, nodes, normalizedStage, recordProjectActivity, teamConflictAnalysis]);

    useEffect(() => {
        if (selectedNodeId && !visibleCanvasNodeIds.has(selectedNodeId)) {
            const clearSelectionTimer = window.setTimeout(() => {
                setSelectedNodeId((currentId) => (currentId === selectedNodeId ? null : currentId));
            }, 0);
            return () => window.clearTimeout(clearSelectionTimer);
        }
    }, [selectedNodeId, visibleCanvasNodeIds]);

    // 선택된 노드를 기반으로 AI 의견이 항상 Workspace 상단에 보이도록
    // 자동 attachedNodes suggestion 을 만든다.
    useEffect(() => {
        if (!selectedNode) return;
        // 사용자가 명시적으로 선택한 제안(activeSuggestion)이 있으면 건드리지 않는다.
        if (activeSuggestion && activeSuggestion._source !== "node-auto") return;
        if (activeSuggestion && activeSuggestion._source === "node-auto" && activeSuggestion.nodeId === selectedNode.id) {
            return;
        }

        const autoSuggestion = {
            id: `node-auto-${selectedNode.id}`,
            nodeId: selectedNode.id,
            _source: "node-auto",
            type: "attachedNodes",
            title: selectedNode.data?.title || "",
            content: selectedNode.data?.content || "",
            category: selectedNode.data?.category,
            phase: selectedNode.data?.phase,
            attached_nodes: [
                {
                    id: selectedNode.id,
                    title: selectedNode.data?.title || "",
                    content: selectedNode.data?.content || "",
                    category: selectedNode.data?.category,
                    phase: selectedNode.data?.phase,
                },
            ],
        };

        const syncDrawerTimer = window.setTimeout(() => {
            setActiveSuggestion(autoSuggestion);
        }, 0);

        return () => window.clearTimeout(syncDrawerTimer);
    }, [activeSuggestion, selectedNode, setActiveSuggestion]);

    const handlePromoteSelectedNode = useCallback(() => {
        if (!selectedNodeId || !selectedNode) return;
        handleSetNodeVisibility(selectedNodeId, getNextVisibility(selectedNode.data?.visibility));
    }, [handleSetNodeVisibility, selectedNode, selectedNodeId]);

    const handleDemoteSelectedNode = useCallback(() => {
        if (!selectedNodeId || !selectedNode) return;
        handleSetNodeVisibility(selectedNodeId, getPreviousVisibility(selectedNode.data?.visibility));
    }, [handleSetNodeVisibility, selectedNode, selectedNodeId]);

    const handleClearSelectedNode = useCallback(() => {
        setSelectedNodeId(null);
        setActiveSuggestion(null);
        setOpenConflictNodeId(null);
    }, [setActiveSuggestion]);

    const reasoningModeProfile = useMemo(() => getReasoningModeProfile(normalizedStage), [normalizedStage]);
    const { handleInputSubmit } = useThinkingAiAnalyze({
        nodes,
        edges,
        stage,
        projectTitle,
        setNodes,
        setEdges,
        setSuggestions,
        setHighlightedNodeIds,
        setDrawerMode,
        setIsDrawerOpen,
        recordProjectActivity,
        animateViewportToNodes,
        setIsAnalyzing,
        currentUserId,
        currentUserName,
        meetingState,
    });
    const handleInputModeChange = useCallback((nextMode) => {
        setInputMode(nextMode);
        if (nextMode === "meeting") {
            setActiveSuggestion(null);
            resetChat?.();
            setDrawerMode("chat");
            setIsDrawerOpen(true);
        }
    }, [resetChat, setActiveSuggestion]);
    const { handleMeetingCaptureSubmit, applyMeetingGraphPatch } = useMeetingCaptureFlow({
        projectId,
        projectTitle,
        nodes,
        edges,
        currentUserId,
        currentUserName,
        normalizedStage,
        meetingMemory,
        meetingMemoryReadout,
        meetingSessionIdRef,
        setNodes,
        setEdges,
        setMeetingMemory,
        setMeetingCaptureSummary,
        setIsMeetingCaptureLoading,
        setTeamContextError,
        setIsTeamContextPanelOpen,
        setHighlightedNodeIds,
        animateViewportToNodes,
        recordProjectActivity,
        meetingState,
    });

    // IS_SEEDED_PROJECT check
    const IS_SEEDED_PROJECT = useMemo(() => {
        return [
            "project-ai-search",
            "project-smart-home",
            "project-ai-meeting",
            "project-onboarding-ux",
            "project-dashboard-design"
        ].includes(projectId);
    }, [projectId]);

    const [simulation, setSimulation] = useState({
        isActive: false,
        step: 0,
        speaker: "",
        text: "",
        fullText: "",
        typeIndex: 0,
    });

    const [isSimulationCompleted, setIsSimulationCompleted] = useState(false);

    // Reset simulation completed status on mount/project change so re-entering the canvas resets it
    useEffect(() => {
        if (typeof window !== "undefined" && projectId) {
            localStorage.removeItem(`simulation-completed-${projectId}`);
            setIsSimulationCompleted(false);

            const isSeeded = [
                "project-ai-search",
                "project-smart-home",
                "project-ai-meeting",
                "project-onboarding-ux",
                "project-dashboard-design"
            ].includes(projectId);

            if (isSeeded) {
                setMeetingState("ended");
                setMeetingSeconds(0);
            } else {
                setMeetingState("active");
                setMeetingSeconds(0);
            }

            // Restore original members on entry so that all 4-5 members are visible
            void restoreOriginalMembers(projectId).then(() => {
                if (typeof refreshProjectCollaborationMeta === "function") {
                    void refreshProjectCollaborationMeta();
                }
            }).catch((err) => {
                console.error("Failed to restore original members on entry:", err);
            });
        }
    }, [projectId, refreshProjectCollaborationMeta, setMeetingState, setMeetingSeconds]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsSimulationCompleted(localStorage.getItem(`simulation-completed-${projectId}`) === "true");
        }
    }, [projectId, simulation.isActive]);

    const handleSimulationStepBypass = useCallback(async (stepIndex) => {
        const responsesForProject = SIMULATION_MOCK_RESPONSES[projectId];
        if (!responsesForProject) return;

        const mockResponse = responsesForProject[stepIndex];
        if (!mockResponse) return;

        setIsMeetingCaptureLoading(true);
        // Add a tiny artificial delay to feel like the AI is working, but extremely fast!
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
            const script = SIMULATION_SCRIPTS[projectId];
            const currentTurn = script[stepIndex];
            const speakerName = currentTurn?.speaker || "You";

            const mergeResult = applyMeetingGraphPatch(mockResponse.graphPatch, meetingState, speakerName);
            const nextMeetingMemory = mergeMeetingMemory(meetingMemory, mockResponse.memoryPatch || {});
            setMeetingMemory(nextMeetingMemory);
            setMeetingCaptureSummary(mockResponse.meetingSummary || null);
            setIsTeamContextPanelOpen(true);

            const focusIds = mockResponse.meetingSummary?.linkedNodeIds || mergeResult.createdNodeIds;
            if (focusIds?.length) {
                setHighlightedNodeIds(new Set(focusIds));
                const targetNodes = mergeResult.nextNodes.filter((node) => focusIds.includes(node.id));
                if (targetNodes.length) {
                    animateViewportToNodes(targetNodes);
                }
            }

            void recordProjectActivity("meeting_chunk_ingested", {
                nodeTitle: mockResponse.meetingSummary?.chunkSummary || currentTurn.text.slice(0, 80),
                nodeType: "MeetingChunk",
                relatedNodeIds: mockResponse.meetingSummary?.linkedNodeIds || [],
                stage: normalizedStage,
                metadata: {
                    chunkType: "speaker_turn",
                    createdNodeIds: mockResponse.meetingSummary?.createdNodeIds || [],
                    strengthenedNodeIds: mockResponse.meetingSummary?.strengthenedNodeIds || [],
                    repeatedIssueKeys: mockResponse.meetingSummary?.repeatedIssueKeys || [],
                },
            });
        } catch (error) {
            console.error("Failed to run bypassed simulation step:", error);
        } finally {
            setIsMeetingCaptureLoading(false);
        }
    }, [
        projectId,
        meetingState,
        meetingMemory,
        applyMeetingGraphPatch,
        setMeetingMemory,
        setMeetingCaptureSummary,
        setIsTeamContextPanelOpen,
        setHighlightedNodeIds,
        animateViewportToNodes,
        recordProjectActivity,
        normalizedStage,
        setIsMeetingCaptureLoading,
    ]);

    const handleSimulationSubmitCurrentStep = useCallback(async () => {
        const script = SIMULATION_SCRIPTS[projectId];
        if (!script) return;

        const currentTurn = script[simulation.step];
        if (!currentTurn) return;

        try {
            await handleSimulationStepBypass(simulation.step);
        } catch (error) {
            console.error("Simulation step submit failed:", error);
        }

        const nextStep = simulation.step + 1;
        if (nextStep < script.length) {
            const nextTurn = script[nextStep];
            setSimulation({
                isActive: true,
                step: nextStep,
                speaker: nextTurn.speaker,
                text: "",
                fullText: nextTurn.text,
                typeIndex: 0,
            });
        } else {
            // End of simulation
            setSimulation({
                isActive: false,
                step: 0,
                speaker: "",
                text: "",
                fullText: "",
                typeIndex: 0,
            });
            localStorage.setItem(`simulation-completed-${projectId}`, "true");
            setMeetingState("ended");
            setIsSimulationCompleted(true);
            try {
                await leaveAllOtherMembers(projectId, currentUserId);
                if (typeof refreshProjectCollaborationMeta === "function") {
                    await refreshProjectCollaborationMeta();
                }
            } catch (err) {
                console.error("Failed to update members on simulation end:", err);
            }
        }
    }, [projectId, simulation.step, handleSimulationStepBypass, currentUserId, refreshProjectCollaborationMeta, setMeetingState, setIsSimulationCompleted]);

    useEffect(() => {
        let timer;
        if (simulation.isActive && simulation.fullText && simulation.typeIndex < simulation.fullText.length) {
            const isFirstCharacter = simulation.step === 0 && simulation.typeIndex === 0;
            timer = setTimeout(() => {
                setSimulation((prev) => ({
                    ...prev,
                    typeIndex: prev.typeIndex + 1,
                    text: prev.fullText.slice(0, prev.typeIndex + 1),
                }));
            }, isFirstCharacter ? 520 : 30);
        } else if (simulation.isActive && simulation.fullText && simulation.typeIndex === simulation.fullText.length) {
            timer = setTimeout(() => {
                void handleSimulationSubmitCurrentStep();
            }, 2500);
        }
        return () => clearTimeout(timer);
    }, [simulation.isActive, simulation.fullText, simulation.typeIndex, simulation.step, handleSimulationSubmitCurrentStep]);

    const simulationActiveSpeakerId = useMemo(() => {
        if (!simulation.isActive || !simulation.speaker) return null;
        const resolved = resolveTeamMember(teamMembers, { name: simulation.speaker });
        if (resolved?.id) return resolved.id;
        return getParticipantMeta(simulation.speaker).id || null;
    }, [simulation.isActive, simulation.speaker, teamMembers]);

    const participantsBarActiveSpeakerId = simulationActiveSpeakerId || activeSpeakerId;
    const participantsBarIsSpeaking = Boolean(simulationActiveSpeakerId)
        || (isActiveSpeakerTalking && hasSpeechActivity);
    const participantsBarHasSpeechActivity = simulation.isActive && simulation.speaker
        ? simulation.typeIndex < simulation.fullText.length
        : hasSpeechActivity;

    const handleStartSimulation = useCallback(async () => {
        const isCompleted = localStorage.getItem(`simulation-completed-${projectId}`) === "true";
        if (isCompleted) {
            alert("현재 Nodi에 다른 팀원이 함께 있지 않습니다. 보이스를 통해 아이디어를 공유해주세요!");
            return;
        }

        const script = SIMULATION_SCRIPTS[projectId];
        if (!script) return;

        try {
            await restoreOriginalMembers(projectId);
            if (typeof refreshProjectCollaborationMeta === "function") {
                await refreshProjectCollaborationMeta();
            }
        } catch (err) {
            console.error("Failed to restore original members:", err);
        }

        // Preserve the existing graph and memory, just activate meeting state
        setMeetingState("active");

        // Disable listening just in case
        setIsListening(false);

        const firstTurn = script[0];
        setSimulation({
            isActive: true,
            step: 0,
            speaker: firstTurn.speaker,
            text: "",
            fullText: firstTurn.text,
            typeIndex: 0,
        });
    }, [projectId, setMeetingState, setIsListening, refreshProjectCollaborationMeta]);

    const handleToggleMeetingState = useCallback(async () => {
        if (IS_SEEDED_PROJECT) {
            const isCompleted = localStorage.getItem(`simulation-completed-${projectId}`) === "true";
            if (!isCompleted) {
                await handleStartSimulation();
                return;
            } else {
                alert("현재 Nodi에 다른 팀원이 함께 있지 않습니다. 보이스를 통해 아이디어를 공유해주세요!");
                return;
            }
        }
        setMeetingState((prev) => (prev === "active" ? "ended" : "active"));
    }, [IS_SEEDED_PROJECT, projectId, handleStartSimulation]);

    const recognitionRef = useRef(null);
    const silenceTimeoutRef = useRef(null);
    const transcriptBufferRef = useRef("");

    const handleToggleListening = useCallback(() => {
        if (isListening) {
            const pending = transcriptBufferRef.current.trim();
            if (pending) {
                setIsMeetingCaptureLoading(true);
            }
        }
        setIsListening((prev) => !prev);
    }, [isListening]);

    // 최신 콜백과 상태값을 참조하기 위한 ref 정의 (의존성 변화로 인한 무한 리셋 방지)
    const handleMeetingCaptureSubmitRef = useRef(handleMeetingCaptureSubmit);
    useEffect(() => {
        handleMeetingCaptureSubmitRef.current = handleMeetingCaptureSubmit;
    }, [handleMeetingCaptureSubmit]);

    const isListeningRef = useRef(isListening);
    useEffect(() => {
        isListeningRef.current = isListening;
    }, [isListening]);

    useEffect(() => {
        let timerId;
        if (meetingState === "active") {
            timerId = setInterval(() => {
                setMeetingSeconds((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timerId);
    }, [meetingState]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            if (isListening) {
                alert("이 브라우저에서는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해 주세요.");
                setIsListening(false);
            }
            return;
        }

        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "ko-KR";

        rec.onresult = (event) => {
            let interim = "";
            let final = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }

            if (final) {
                transcriptBufferRef.current = (transcriptBufferRef.current + " " + final).trim();
                setSttTranscript(transcriptBufferRef.current);
            }
            setInterimTranscript(interim);

            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }

            silenceTimeoutRef.current = setTimeout(() => {
                const textToSubmit = transcriptBufferRef.current.trim();
                if (textToSubmit) {
                    console.log("Auto-submitting STT transcript due to silence:", textToSubmit);
                    void handleMeetingCaptureSubmitRef.current(textToSubmit);
                    transcriptBufferRef.current = "";
                    setSttTranscript("");
                    setInterimTranscript("");
                }
            }, 2500);
        };

        rec.onend = () => {
            if (isListeningRef.current) {
                try {
                    rec.start();
                } catch (e) {
                    console.error("Failed to restart speech recognition:", e);
                }
            }
        };

        rec.onerror = (e) => {
            console.error("Speech recognition error:", e);
            if (e.error === "no-speech" || e.error === "aborted") {
                return;
            }
            
            if (e.error === "not-allowed") {
                alert("음성 인식 권한이 차단되었거나, 보안 연결(HTTPS 또는 localhost)이 아닙니다.\n\n해결 방법:\n1. 로컬 환경에서 테스트 중이시라면 주소가 http://localhost:3000 인지 확인해 주세요 (IP 주소로 접속 시 크롬 브라우저는 보안상 마이크를 차단합니다).\n2. 브라우저 주소창 왼쪽의 자물쇠/마이크 아이콘을 클릭하여 마이크 권한을 '허용'으로 변경해 주세요.");
            } else if (e.error === "audio-capture") {
                alert("사용 가능한 마이크 하드웨어를 찾을 수 없습니다. 마이크 연결을 확인해 주세요.");
            } else if (e.error === "network") {
                alert("STT 음성 인식 네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.");
            } else {
                alert(`음성 인식 오류가 발생했습니다: ${e.error}`);
            }
            setIsListening(false);
        };

        recognitionRef.current = rec;

        if (isListening) {
            try {
                rec.start();
            } catch (e) {
                console.error("Failed to start speech recognition:", e);
            }
        } else {
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }
            const textToSubmit = transcriptBufferRef.current.trim();
            if (textToSubmit) {
                console.log("Submitting leftover STT transcript on stop listening:", textToSubmit);
                void handleMeetingCaptureSubmitRef.current(textToSubmit);
                transcriptBufferRef.current = "";
                setSttTranscript("");
                setInterimTranscript("");
            }
        }

        return () => {
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }
            try {
                rec.stop();
            } catch (e) {
                // 이미 종료된 마이크 리소스 제어 에러 방지
            }
        };
    }, [isListening]);

    // 우측 Drawer 하단 입력창 동작:
    // - 기본(컨텍스트 없음)일 때: 사용자 입력을 기반으로 /api/analyze 를 호출해 새 노드 + 제안 생성
    // - 제안 카드/attachedNodes 컨텍스트가 있을 때: 해당 컨텍스트를 anchor 로 /api/chat 경로를 사용
    const handleRightDrawerSubmit = useCallback(async () => {
        const trimmedText = chatInput.trim();
        if (!trimmedText) return;
        setHasStartedInput(true);

        if (inputMode === "meeting" && !isMeetingCaptureLoading) {
            await handleMeetingCaptureSubmit(trimmedText);
            setChatInput("");
            return;
        }

        if (!activeSuggestion && !isAnalyzing) {
            await handleInputSubmit({
                text: trimmedText,
                selectedNode,
            });
            setChatInput("");
            return;
        }

        await handleDrawerChatSubmit();
    }, [activeSuggestion, chatInput, handleDrawerChatSubmit, handleInputSubmit, handleMeetingCaptureSubmit, inputMode, isAnalyzing, isMeetingCaptureLoading, selectedNode, setChatInput]);

    const focusNodesByIds = useCallback((nodeIds = []) => {
        const ids = Array.from(new Set((Array.isArray(nodeIds) ? nodeIds : []).filter(Boolean)));
        if (!ids.length) return;
        setCanvasMode("team");
        setHighlightedNodeIds(new Set(ids));
        const targetNodes = nodes.filter((node) => ids.includes(node.id));
        if (targetNodes.length) {
            animateViewportToNodes(targetNodes);
            const firstTarget = targetNodes.find((node) => node?.type === "thinkingNode");
            if (firstTarget?.id) {
                setSelectedNodeId(firstTarget.id);
                setDrawerMode("chat");
                setIsDrawerOpen(true);
            }
        }
    }, [animateViewportToNodes, nodes]);
    const {
        filteredTeamActivity,
        handleSelectTeamMember,
        handleSelectActivity,
        handleExplainTeamContext,
    } = useTeamContextSummary({
        activityLog,
        teamMembers,
        selectedTeamMemberId,
        setSelectedTeamMemberId,
        selectedActivityEventId,
        setSelectedActivityEventId,
        setTeamContextSummary,
        setIsTeamContextLoading,
        setTeamContextError,
        nodes,
        focusNodesByIds,
        normalizedStage,
        projectId,
        projectTitle,
    });

    const handleToggleTeamContextPanel = useCallback(() => {
        setIsTeamContextPanelOpen((prev) => !prev);
    }, []);

    const handleToggleConflictPopover = useCallback((nodeId, nextOpen) => {
        if (nextOpen) {
            setSelectedNodeId(nodeId || null);
        }
        setOpenConflictNodeId(nextOpen ? nodeId : null);
    }, []);

    const handleExplainConflict = useCallback(async (nodeId) => {
        const conflictMeta = teamConflictAnalysis?.conflictByNodeId?.[nodeId];
        const selectedConflictNode = nodes.find((node) => node?.id === nodeId && node?.type === "thinkingNode");
        if (!conflictMeta || !selectedConflictNode) return;
        const conflictingNodes = nodes
            .filter((node) => conflictMeta.linkedNodeIds.includes(node.id) && node?.type === "thinkingNode")
            .map((node) => ({
                id: node.id,
                title: node?.data?.title || "",
                content: node?.data?.content || "",
                category: node?.data?.category,
                phase: node?.data?.phase,
            }));
        const surroundingNodeIds = new Set([
            ...getRelatedNodeIds(nodeId, edges),
            ...conflictMeta.linkedNodeIds.flatMap((relatedId) => getRelatedNodeIds(relatedId, edges)),
        ]);
        conflictMeta.linkedNodeIds.forEach((relatedId) => surroundingNodeIds.delete(relatedId));
        surroundingNodeIds.delete(nodeId);
        const surroundingNodes = nodes
            .filter((node) => surroundingNodeIds.has(node.id) && node?.type === "thinkingNode")
            .slice(0, 6)
            .map((node) => ({
                id: node.id,
                title: node?.data?.title || "",
                content: node?.data?.content || "",
                category: node?.data?.category,
                phase: node?.data?.phase,
            }));
        const relevantActivity = (Array.isArray(activityLog) ? activityLog : [])
            .filter((item) => item?.nodeId === nodeId || (item?.relatedNodeIds || []).some((relatedId) => conflictMeta.linkedNodeIds.includes(relatedId)))
            .slice(0, 6);

        setConflictExplainLoadingByNodeId((prev) => ({
            ...prev,
            [nodeId]: true,
        }));
        try {
            const result = await explainConflict({
                projectTitle,
                stage: normalizedStage,
                selectedNode: {
                    id: selectedConflictNode.id,
                    title: selectedConflictNode?.data?.title || "",
                    content: selectedConflictNode?.data?.content || "",
                    category: selectedConflictNode?.data?.category,
                    phase: selectedConflictNode?.data?.phase,
                },
                conflictingNodes,
                surroundingNodes,
                activityEvents: relevantActivity,
            });
            setConflictExplainResultByNodeId((prev) => ({
                ...prev,
                [nodeId]: result,
            }));
        } catch (error) {
            const message =
                error?.response?.data?.error ||
                error?.message ||
                "Failed to explain the conflict.";
            setConflictExplainResultByNodeId((prev) => ({
                ...prev,
                [nodeId]: {
                    summary: message,
                    whyDifferent: "The AI explanation could not be generated right now.",
                    assumptionGap: "",
                    riskIfIgnored: "",
                    suggestedNextStep: "Try again after the graph or network state stabilizes.",
                },
            }));
        } finally {
            setConflictExplainLoadingByNodeId((prev) => ({
                ...prev,
                [nodeId]: false,
            }));
        }
    }, [activityLog, edges, nodes, normalizedStage, projectTitle, teamConflictAnalysis]);

    return (
        <div className="w-full h-screen relative flex flex-col overflow-hidden bg-slate-50">
            <div
                className="pointer-events-none absolute bottom-7 left-6 z-[20] flex h-[24.5px] w-[157px] items-center whitespace-nowrap"
                style={{
                    fontFamily: '"Pretendard Variable", "Instrument Sans", sans-serif',
                    fontStyle: "normal",
                    fontWeight: 600,
                    fontSize: "13.59805px",
                    lineHeight: "180%",
                    letterSpacing: "0.14em",
                    color: "#4B5D7B",
                }}
            >
                THINKING MACHINE
            </div>
            <TopBar
                projectTitle={projectTitle}
                onProjectTitleChange={setProjectTitle}
                projectMetaHref={projectMetaHref}
                projectMetaLabel="Project workspace"
                teamMembers={teamMembers}
                activeSpeakerId={participantsBarActiveSpeakerId}
                isSpeaking={participantsBarIsSpeaking}
                hasSpeechActivity={participantsBarHasSpeechActivity}
                isSimulationCompleted={isSimulationCompleted}
            />

            <main className="flex-1 w-full h-full relative">
                {!hasThinkingGraph ? (
                    <div className="tm-canvas-bg h-full w-full" data-stage={stage}>
                        <div className="absolute inset-0 z-[5]" />
                    </div>
                ) : (
                    <>
                        <NodeMap
                            nodes={canvasNodes}
                            edges={decoratedCanvasEdges}
                            onNodesChange={filteredOnNodesChange}
                            onEdgesChange={onEdgesChange}
                            highlightedNodeIds={highlightedNodeIds}
                            onNodeDragStart={handleNodeDragStart}
                            onNodeDrag={handleNodeDragUpdate}
                            onNodeDragStop={handleNodeDragStop}
                            onInit={handleFlowInit}
                            onSelectionChange={handleNodeSelectionChange}
                            selectionBoxEnabled={selectionBoxEnabled}
                            isCanvasInteractive={isCanvasInteractive}
                            draftHandlers={{
                                onPostitChangeText: handlePostitChangeText,
                                onImagePick: handleImagePick,
                                onImageChangeCaption: handleImageChangeCaption,
                                onDraftSubmit: handleDraftSubmit,
                                onToggleIdeaGroup: toggleIdeaGroupMode,
                            }}
                            draftSubmittingIds={draftSubmittingIds}
                            canvasStage={stage}
                            conflictByNodeId={teamConflictAnalysis?.conflictByNodeId || {}}
                            openConflictNodeId={openConflictNodeId}
                            conflictExplainResultByNodeId={conflictExplainResultByNodeId}
                            conflictExplainLoadingByNodeId={conflictExplainLoadingByNodeId}
                            onToggleConflictPopover={handleToggleConflictPopover}
                            onExplainConflict={handleExplainConflict}
                        />

                    </>
                )}

                {showDraftConvertPrompt && (
                    <div className="pointer-events-none absolute inset-x-0 top-20 z-[75] flex justify-center">
                        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/70 bg-white/72 px-4 py-2 text-[12px] font-semibold text-slate-700 shadow-[0_12px_26px_rgba(0,0,0,0.14)] backdrop-blur-[12px]">
                            <span>
                                Convert {selectedDraftIds.length} drafts into nodes?
                            </span>
                            <button
                                type="button"
                                onClick={() => void convertDraftsToGroup(draftConvertIdsRef.current)}
                                className="inline-flex items-center justify-center rounded-full bg-teal-500 px-3 py-1 text-[12px] font-semibold text-white transition hover:bg-teal-600 disabled:opacity-55"
                                disabled={isAnalyzing}
                                aria-label="Confirm convert drafts"
                            >
                                ✓
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowDraftConvertPrompt(false)}
                                className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[12px] font-semibold text-slate-600 transition hover:bg-white/80"
                                aria-label="Cancel convert drafts"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                <AnimatePresence>
                    {isDrawerOpen ? (
                        <RightAgentDrawer
                            isOpen={isDrawerOpen}
                            onClose={() => setIsDrawerOpen(false)}
                            stage={normalizedStage}
                            suggestions={unseenSuggestions}
                            onStageChange={handleStageChange}
                            activeSuggestion={activeSuggestion}
                            selectedNode={selectedNode}
                            linkedNodes={selectedNodeLinkedNodes}
                            candidateGraph={pendingCandidatePreview}
                            alignmentSummary={alignmentSummary}
                            currentUserRole={effectiveCurrentUserRole}
                            isListening={isListening}
                            onToggleListening={handleToggleListening}
                            sttTranscript={sttTranscript}
                            interimTranscript={interimTranscript}
                            meetingSeconds={meetingSeconds}
                            meetingState={meetingState}
                            onToggleMeetingState={handleToggleMeetingState}
                            currentDirection={meetingMemory?.executive?.currentDirection || ""}
                            isSimulationActive={simulation.isActive}
                            simulationStep={simulation.step}
                            simulationSpeaker={simulation.speaker}
                            simulationText={simulation.text}
                            isSeededProject={IS_SEEDED_PROJECT}
                            isSimulationCompleted={isSimulationCompleted}
                            isMeetingCaptureLoading={isMeetingCaptureLoading}
                            onStartSimulation={handleStartSimulation}
                            onDismissSuggestion={(id) => {
                                setDismissedSuggestionIds((prev) => {
                                    const next = new Set(prev);
                                    next.add(id);
                                    return next;
                                });
                            }}
                            onCommitCandidateNodes={handleCommitCandidateNodes}
                            onCommitCandidateNodesAsPrivate={handleCommitCandidateNodesAsPrivate}
                            onDiscardCandidateNodes={handleDiscardCandidateNodes}
                            onPromoteSelectedNode={handlePromoteSelectedNode}
                            onDemoteSelectedNode={handleDemoteSelectedNode}
                            onSetNodeVisibility={handleSetNodeVisibility}
                            onChatContextSelect={handleDrawerSuggestionSelect}
                            modeLabel={reasoningModeProfile.label}
                            candidateHint={reasoningModeProfile.candidateHint}
                            selectedNodeQuickActions={reasoningModeProfile.selectedNodeActions}
                            onClearSelectedNode={handleClearSelectedNode}
                            onAddPostit={createPostitDraft}
                            onAddImage={createImageDraft}
                            nodes={nodes}
                            edges={edges}
                            onMergeNodes={handleMergeNodes}
                            onLinkNodes={handleLinkNodes}
                        />
                    ) : null}
                </AnimatePresence>

                <AnimatePresence>
                    {ghostDrag && (
                        <motion.div
                            key="ghost-drag"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{
                                opacity: ghostDrag.phase === "dropping" ? 0 : 0.55,
                                scale: ghostDrag.phase === "dropping" ? 0.72 : 1,
                                x: (ghostDrag.phase === "dropping" ? ghostDrag.targetX : ghostDrag.x) - 90,
                                y: (ghostDrag.phase === "dropping" ? ghostDrag.targetY : ghostDrag.y) - 40,
                            }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", damping: 26, stiffness: 420 }}
                            className="pointer-events-none fixed left-0 top-0 z-[90]"
                            style={{ width: 180, height: 80 }}
                        >
                            <div
                                className="h-full w-full rounded-[26px] border border-white/70 bg-white/35 shadow-[0_16px_38px_rgba(0,0,0,0.14)] backdrop-blur-[10px]"
                                aria-hidden
                            >
                                <div className="flex h-full w-full items-center justify-center px-4 text-[12px] font-semibold text-slate-800/80">
                                    {ghostDrag.count > 1 ? `${ghostDrag.count} nodes` : "1 node"}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </main>
        </div>
    );
}
