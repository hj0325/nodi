export function buildChatToNodesPrompt({
  mode,
  flow,
  stageId,
  modeProfile,
  suggestion_category,
  suggestion_phase,
  suggestion_title,
  suggestion_content,
  conversationText,
  attachedContext,
  historyContext,
}) {
  const systemPrompt = `
You are an AI assistant that structures a meeting-related conversation into reasoning nodes.
You operate on a node-centric meeting minutes graph based on the 5W1H (Who, When, Where, What, Why, How) framework across 5 phases of meeting progress.

Analyze the conversation below and extract 1 to 4 core nodes matching the discussion.
Each node must include:
- label (short action-oriented title in English)
- content (one sentence in English)
- category: exactly one of: "Who", "When", "Where", "What", "Why", "How"
- phase: exactly one of: "Idea", "Research", "Solution", "Decision", "Action"
- jobTag: exactly one of: "Business", "UX", "Tech"
- topicTag: choose a context-appropriate topic tag for this meeting (e.g. Research, Validation, Insight, Reference, Decision, Action). Do NOT use Context/Memory/STT here; those are for STT live meeting minutes only.
- ownerId (string, e.g., "mock-user-1")
- sourceType (user|agent|mixed)
- visibility (private|candidate|shared|reviewed|agreed)
- confidence (low|medium|high)
- All relation labels must be exactly one of: supports, contradicts, causes, refines, depends_on, proposes, blocks.

Current Meeting Phase: ${stageId}
- Phase Info: ${modeProfile.label} (${modeProfile.composerHint})

**Category selection criteria (5W1H 육하원칙):**
- Who (누가): Teammate role, responsible person, planner, designer, developer, or user persona.
- When (언제): Deadlines, schedules, duration, timeline, sequence, or release dates.
- Where (어디서): Environment, platform, workspace, location, channel, store, or target space.
- What (무엇을): Core feature, design, idea description, objective, goal, or conceptual proposal.
- Why (왜): Problem definition, pain point, background reason, justification, research observation, or validation source.
- How (어떻게): Solution direction, implementation detail, method, design concept, or execution plan.

**Phase selection criteria (5 meeting phases):**
- Idea: Free brainstorming, thoughts, early conceptual propositions.
- Research: Problem exploration, current state analysis, user interviews, validation, background data.
- Solution: Design drafts, technical feasibility, alternative solutions, concept blueprints.
- Decision: Reached alignments, chosen options, committed specs, prioritizations.
- Action: Next-step implementation tasks, assigned assignments, development plans.

**Job family selection criteria (jobTag, 3 job families):**
- Business: Business model, planning direction, requirements, marketability, or business value.
- UX: User experience, UI design, user convenience, wireframe, or interaction.
- Tech: Technical feasibility, development specs, infrastructure, database, or system architecture.

**Topic tag selection criteria (topicTag, not STT meeting):**
- Choose a topic tag that fits the current meeting context (e.g. Research, Validation, Insight, Reference, Decision, Action, Input, Collaboration, AI).
- Do NOT use Context/Memory/STT here; those apply only to STT-based live meeting minutes.

[Original Suggestion Card]
${suggestion_category}/${suggestion_phase}: ${suggestion_title} - ${suggestion_content}

[Conversation]
${conversationText}

${attachedContext ? `[Attached Nodes]\n${attachedContext}\n\nUse these as additional grounding context.\n\n` : ""}## Existing nodes (for cross_connections)
${historyContext}
`;

  const schemaHint = `{
  "user_nodes": [
    {
      "label": "string",
      "content": "string",
      "category": "Who|When|Where|What|Why|How",
      "phase": "Idea|Research|Solution|Decision|Action",
      "jobTag": "Business|UX|Tech",
      "topicTag": "string",
      "ownerId": "string",
      "sourceType": "user|agent|mixed",
      "visibility": "private|candidate|shared|reviewed|agreed",
      "confidence": "low|medium|high"
    }
  ],
  "cross_connections": [
    {
      "existing_node_id": "string",
      "new_node_index": 0,
      "connection_label": "supports|contradicts|causes|refines|depends_on|proposes|blocks"
    }
  ]
}`;

  return {
    schemaHint,
    strictPrompt: `${systemPrompt}

Return JSON only, strictly matching this schema:
${schemaHint}
`,
  };
}