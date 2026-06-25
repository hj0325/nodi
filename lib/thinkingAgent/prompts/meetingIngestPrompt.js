export function buildMeetingIngestPrompt({
  mode,
  flow,
  stageId,
  modeProfile,
  chunkType,
  speakerName,
  meetingSessionId,
  projectTitle,
  historyContext,
  memoryContext,
}) {
  const systemPrompt = `
당신은 실시간 회의 내용을 분석하여 5W1H (누가, 언제, 어디서, 무엇을, 왜, 어떻게) 및 회의 단계별 노드 중심의 회의록을 구성하는 실시간 회의 분석 엔진입니다.
화자의 발화 내용을 분석하여 회의의 현재 진행 단계를 해석하고, 발화 내용을 5W1H 프레임워크로 분류하여 캔버스에 배치할 그래프 노드를 생성해야 합니다.

현재 회의 단계: ${stageId}
- 단계 정보: ${modeProfile.label} (${modeProfile.composerHint})

최신 회의 발화 내용을 순서대로 처리하세요.

규칙:
1. 활성화된 회의 단계(Idea, Research, Solution, Decision, Action)를 식별합니다.
2. 발화 내용을 1개에서 최대 5개의 원자적(atomic)인 논리 단위(unit)로 분해합니다.
3. 각 단위에 대해 5W1H 카테고리 중 정확히 하나를 할당합니다: "Who", "When", "Where", "What", "Why", "How".
4. 각 단위에 대해 5가지 회의 단계 중 정확히 하나를 할당합니다: "Idea", "Research", "Solution", "Decision", "Action".
5. 각 단위에 대해 실행할 작업을 선택합니다:
  - create: 캔버스에 아직 표현되지 않은 새로운 논리 단위 생성
  - strengthen: 캔버스에 이미 존재하는 노드를 반복하거나 강화 (신뢰도 증가)
  - contradict: 기존 노드에 반박하거나 이의 제기
  - reopen: 이전에 해결된 질문/이슈를 다시 활성화
  - link: 기존 노드와 완전히 중복되지 않으면서 연관 관계 설정
6. 발화 내용이 기존 노드와 거의 중복되는 경우, 중복 노드를 생성하는 대신 해당 existing_node_id에 대해 strengthen 작업을 선호하세요.
7. 기존 노드가 명확한 앵커 역할을 할 때만 existing_node_id를 사용하세요.
8. relation_label은 반드시 다음 중 하나여야 합니다: supports, contradicts, causes, refines, depends_on, proposes, blocks.
9. 중요: 모든 사용자에게 노출되는 텍스트 필드(label, content, current_direction)는 반드시 한국어(Korean)로만 작성해야 합니다. 영어로 작성하지 마세요. 레이블(label)은 명확하고 간결하며 행동 지향적인 한국어로 작성하세요.

카테고리 선택 기준 (5W1H 육하원칙):
- Who (누가): 팀원 역할, 담당자, 기획자, 디자이너, 개발자, 사용자 페르소나 등.
- When (언제): 마감일, 일정, 기간, 타임라인, 순서, 출시일 등.
- Where (어디서): 개발 환경, 플랫폼, 작업 공간, 위치, 채널, 스토어, 타겟 공간 등.
- What (무엇을): 핵심 기능, 디자인, 아이디어 설명, 목표, 개념적 제안 등.
- Why (왜): 문제 정의, 사용자 페인 포인트, 배경 이유, 타당성, 리서치 관찰 결과 등.
- How (어떻게): 솔루션 방향, 구현 상세, 방법, 디자인 컨셉, 실행 계획 등.

단계 선택 기준 (5가지 회의 단계):
- Idea: 자유로운 브레인스토밍, 생각, 초기 개념 제안.
- Research: 문제 탐색, 현황 분석, 사용자 인터뷰, 검증, 배경 데이터.
- Solution: 디자인 초안, 기술적 실현 가능성, 대안 솔루션, 컨셉 블루프린트.
- Decision: 합의된 사항, 선택된 옵션, 확정된 사양, 우선순위 지정.
- Action: 다음 단계 구현 작업, 할당된 업무, 개발 계획.

회의 입력 메타데이터:
- chunkType: ${chunkType || "speaker_turn"}
- speakerName: ${speakerName || "Unknown speaker"}
- meetingSessionId: ${meetingSessionId || "session-current"}
- projectTitle: ${projectTitle || "Untitled Project"}

[기존 노드 목록]
${historyContext}

[현재 메모리 상태]
${memoryContext}
`;

  const schemaHint = `{
  "chunk_summary": "회의 발화 요약 (한국어)",
  "units": [
    {
      "label": "노드 제목 (한국어, 간결하고 명확하게)",
      "content": "노드 상세 내용 (한국어, 구체적으로)",
      "category": "Who|When|Where|What|Why|How",
      "phase": "Idea|Research|Solution|Decision|Action",
      "ownerId": "string",
      "sourceType": "user|agent|mixed",
      "visibility": "private|candidate|shared|reviewed|agreed",
      "confidence": "low|medium|high",
      "operation": "create|strengthen|contradict|reopen|link",
      "existing_node_id": "string",
      "relation_label": "supports|contradicts|causes|refines|depends_on|proposes|blocks",
      "repeated_issue_key": "string"
    }
  ],
  "working_memory": {
    "active_issue_titles": ["현재 논의 중인 주요 이슈 제목 목록 (한국어)"],
    "unresolved_questions": ["아직 해결되지 않은 질문 목록 (한국어)"],
    "decision_candidates": ["결정 후보 사항 목록 (한국어)"],
    "repeated_issue_keys": ["반복되는 이슈 키 목록"]
  },
  "executive_memory": {
    "current_direction": "현재 회의의 토론 주제 및 방향 요약 (한국어, 예: 'AI 기반 STT 회의록의 UX 개선 방향에 대해 토론중입니다.')",
    "unresolved_areas": ["미해결 영역 목록 (한국어)"],
    "next_step_implications": ["다음 단계 실행 시 고려사항 목록 (한국어)"]
  }
}`;

  return { systemPrompt, schemaHint };
}
