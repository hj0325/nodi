import { normalizeNodeCategory, normalizeNodePhase } from "./nodeMeta";

export function getAiRecommendations(nodes = [], edges = []) {
  const list = (Array.isArray(nodes) ? nodes : []).filter((n) => n?.type === "thinkingNode");
  const linkSuggestions = [];
  const supplementAlerts = [];
  const roleAlerts = [];

  // 1. 연관 노드 상기 (Link Suggestion)
  // "지금 발화하는 내용이 이전 노드와 연관이 있다고 판단될 때 상기시켜준다."
  if (list.length > 1) {
    const latestNode = list[list.length - 1];
    const wordsLatest = new Set(
      `${latestNode.data?.title || ""} ${latestNode.data?.content || ""}`
        .toLowerCase()
        .split(/[\s,.\-()?/]+/)
        .filter((w) => w.length >= 2)
    );

    // Compare with older nodes (excluding the latest one)
    for (let i = 0; i < list.length - 1; i += 1) {
      const oldNode = list[i];
      const wordsOld = `${oldNode.data?.title || ""} ${oldNode.data?.content || ""}`
        .toLowerCase()
        .split(/[\s,.\-()?/]+/)
        .filter((w) => w.length >= 2);

      let overlapCount = 0;
      for (const w of wordsOld) {
        if (wordsLatest.has(w)) {
          overlapCount += 1;
        }
      }

      // If there is keyword overlap, suggest linking them
      if (overlapCount >= 1) {
        linkSuggestions.push({
          id: `link-${latestNode.id}-${oldNode.id}`,
          type: "link",
          sourceId: latestNode.id,
          sourceTitle: latestNode.data?.title || "",
          targetId: oldNode.id,
          targetTitle: oldNode.data?.title || "",
          reason: `"${oldNode.data?.title || ""}" 노드와 관련이 있습니다. 논의를 연결하실래요?`,
          tags: ["Discussion", "Memory", "UX"],
        });
      }
    }
  }

  // 2 & 3. 직군별 검토 알림 & 약한 부분 디벨롭 필요 상기
  list.forEach((node) => {
    const title = (node.data?.title || "").toLowerCase();
    const content = (node.data?.content || "").toLowerCase();
    const text = `${title} ${content}`;
    const category = normalizeNodeCategory(node.data?.category);
    const phase = normalizeNodePhase(node.data?.phase, category);

    // 3. 약한 부분 디벨롭 필요 상기 (Supplement Gaps)
    // "노드에서 약한 부분이 있을 때 디벨롭이 필요하다고 상기시켜준다."
    if (phase === "Idea" || category === "Why") {
      supplementAlerts.push({
        id: `supp-research-${node.id}`,
        nodeId: node.id,
        nodeTitle: node.data?.title || "Untitled",
        title: `* ${category} 노드 리서치 필요`,
        advice: `"${node.data?.title || "Untitled"}" 노드가 리서치를 통한 검증이 필요합니다! UX 리서치 단계에서 참고해주세요.`,
        tags: ["Research", "Validation", "UX"],
      });
    } else if (phase === "Solution" && !text.includes("how") && !text.includes("implement") && !text.includes("어떻게") && !text.includes("구현")) {
      supplementAlerts.push({
        id: `supp-detail-${node.id}`,
        nodeId: node.id,
        nodeTitle: node.data?.title || "Untitled",
        title: `* ${category} 노드 구체화 필요`,
        advice: `"${node.data?.title || "Untitled"}" 노드가 솔루션 구체화를 위해 구현 방법(How)과 액션 항목의 상세 정의가 보완되어야 합니다.`,
        tags: ["Solution", "Action", "Detail"],
      });
    }

    // 2. 직군별 검토 알림 (Role-based Alerts)
    // "노드에서 각 직군(디자이너, 기획자, 개발자)이 검토가 필요한 아이디어일 때 검토하라고 알려준다."
    const devKeywords = /\b(api|db|database|server|code|develop|backend|frontend|performance|data|system|security|scale|infra|hosting|architecture|stack|개발|서버|데이터베이스|코드|프론트|백엔드|구현|기술)\b/i;
    const designKeywords = /\b(ui|ux|design|screen|color|layout|button|font|flow|prototype|pixel|css|styled|animation|icon|visual|interaction|디자인|화면|레이아웃|색상|버튼|폰트|시각|경험|사용성)\b/i;
    const pmKeywords = /\b(schedule|deadline|milestone|launch|scope|cost|business|feature|prioritize|market|customer|planner|pm|timeline|launch|phase|sprint|기획|일정|마감|비즈니스|요구사항|우선순위|시장|고객|회의록)\b/i;

    if (devKeywords.test(text)) {
      roleAlerts.push({
        id: `role-dev-${node.id}`,
        nodeId: node.id,
        nodeTitle: node.data?.title || "Untitled",
        role: "Developer",
        title: "* 개발 관점 검토 필요",
        reason: `"${node.data?.title || "Untitled"}" 노드가 개발 관점 검토가 필요합니다! TaeEun의 의견을 요청해보세요.`,
        tags: ["Developer", "Review", "Tech"],
      });
    }
    if (designKeywords.test(text)) {
      roleAlerts.push({
        id: `role-design-${node.id}`,
        nodeId: node.id,
        nodeTitle: node.data?.title || "Untitled",
        role: "Designer",
        title: "* 디자인 관점 검토 필요",
        reason: `"${node.data?.title || "Untitled"}" 노드가 디자인 관점 검토가 필요합니다! HyeonJi의 의견을 요청해보세요.`,
        tags: ["Designer", "Review", "UX/UI"],
      });
    }
    if (pmKeywords.test(text)) {
      roleAlerts.push({
        id: `role-pm-${node.id}`,
        nodeId: node.id,
        nodeTitle: node.data?.title || "Untitled",
        role: "PM",
        title: "* 기획 관점 검토 필요",
        reason: `"${node.data?.title || "Untitled"}" 노드가 기획 관점 검토가 필요합니다! SangHun의 의견을 요청해보세요.`,
        tags: ["PM", "Review", "Business"],
      });
    }
  });

  return {
    linkSuggestions: linkSuggestions.slice(0, 5),
    supplementAlerts: supplementAlerts.slice(0, 5),
    roleAlerts: roleAlerts.slice(0, 5),
  };
}
