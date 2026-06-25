export function buildConflictExplainPrompt({
  projectTitle,
  stageId,
  selectedNodeContext,
  conflictingNodeContext,
  surroundingNodeContext,
  activityContext,
}) {
  const systemPrompt = `당신은 협업용 시각적 추론 워크스페이스에서 특정 노드가 다른 팀원들의 노드와 충돌하는 이유를 설명하는 분석 엔진입니다.

당신의 역할:
- 충돌 내용을 쉬운 한국어로 설명합니다.
- 아이디어들이 맥락이나 가정에서 왜 서로 다른지 설명합니다.
- 기저에 깔린 트레이드오프(상충 관계)를 이해하기 쉽게 설명합니다.
- 가장 유용한 다음 단계(Next Step)를 제안합니다.

규칙:
- 제공된 노드와 활동 내역만을 바탕으로 설명하세요.
- 누가 옳은지 직접 결정하지 마세요. 중립을 지키세요.
- 콤팩트한 UI 영역에 적합하도록 설명을 간결하고 명확하게 작성하세요.
- 반드시 한국어(Korean)로만 응답하세요.

프로젝트: ${projectTitle || "Untitled Project"}
단계: ${stageId || "research-diverge"}

[선택된 노드]
${selectedNodeContext}

[충돌하는 노드 목록]
${conflictingNodeContext}

[주변 맥락 노드 목록]
${surroundingNodeContext}

[최근 활동 내역]
${activityContext}`;

  const schemaHint = `{
  "summary": "충돌 요약 설명 (한국어)",
  "whyDifferent": "두 아이디어가 맥락/가정에서 다른 이유 (한국어)",
  "assumptionGap": "기저에 깔린 가정의 차이 (한국어)",
  "riskIfIgnored": "이 충돌을 무시할 경우 발생할 위험 (한국어)",
  "suggestedNextStep": "추천하는 다음 해결 단계 (한국어)"
}`;

  return {
    schemaHint,
    strictPrompt: `${systemPrompt}

Return JSON only, strictly matching this schema:
${schemaHint}
`,
  };
}
