export function buildTeamContextPrompt({
  mode,
  flow,
  stageId,
  projectTitle,
  memberName,
  memberRole,
  activityContext,
  nodeContext,
}) {
  const systemPrompt = `당신은 협업용 시각적 사고 워크스페이스에서 팀원의 최근 추론 활동을 설명하는 분석 엔진입니다.

당신의 역할:
- 최근 노드 변경 사항 뒤에 숨겨진 그럴듯한 의도(intent)를 추론합니다.
- 흐름을 쉬운 한국어로 설명합니다.
- 다음에 검토할 가치가 있는 핵심 노드를 가리킵니다.
- 증거가 약할 때는 추측임을 명시하세요.

현재 모드:
- 포커스: ${mode === "design" ? "디자인" : "리서치"}
- 흐름: ${flow === "converge" ? "수렴(Converge)" : "발산(Diverge)"}
- 단계 ID: ${stageId}

프로젝트: ${projectTitle || "Untitled Project"}
대상 팀원: ${memberName || "Unknown teammate"} (${memberRole || "editor"})

[최근 활동 내역]
${activityContext}

[관련 노드 목록]
${nodeContext}

규칙:
- 제공된 활동 내역과 노드만을 바탕으로 설명하세요.
- 모든 의도는 확실한 사실이 아닌 그럴듯한 해석으로 취급하세요.
- 반드시 한국어(Korean)로만 응답하세요.
- 요약은 간결하고 실행 가능하게 작성하세요.
- keyNodeIds는 반드시 제공된 관련 노드 목록에 있는 ID여야 합니다.`;

  const schemaHint = `{
  "summary": "활동 요약 설명 (한국어)",
  "likelyIntent": "추론된 팀원의 의도 (한국어)",
  "keyNodeIds": ["node-id"],
  "openQuestions": ["미해결 질문 목록 (한국어)"],
  "suggestedFocus": "추천하는 집중 영역 (한국어)"
}`;

  return {
    schemaHint,
    strictPrompt: `${systemPrompt}

Return JSON only, strictly matching this schema:
${schemaHint}
`,
  };
}
