"use client";

import { useCallback, useRef, useEffect } from "react";
import { ingestMeetingChunk } from "@/lib/thinkingMachine/apiClient";
import { mergeMeetingMemory } from "@/lib/thinkingMachine/meetingMemory";
import { toConnectorEdges, getEdgeContinuationFlag } from "@/lib/thinkingMachine/connectorEdges";
import { toReactFlowNode } from "@/lib/thinkingMachine/reactflowTransforms";
import {
  relayoutTopLevelThinkingNodes,
  shiftClusterBelowAnchor,
  shiftClusterRightOfExisting,
} from "@/lib/thinkingMachine/graphMerge";
import { normalizeVisibility } from "@/lib/thinkingMachine/nodeMeta";

export function useMeetingCaptureFlow({
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
  meetingState = "active",
}) {
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  const applyMeetingGraphPatch = useCallback((graphPatch = {}, captureMeetingState = meetingState, speakerName = null) => {
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;

    const incomingNodes = Array.isArray(graphPatch?.nodes) ? graphPatch.nodes : [];
    const incomingEdges = Array.isArray(graphPatch?.edges) ? graphPatch.edges : [];
    if (!incomingNodes.length && !incomingEdges.length) {
      return {
        nextNodes: currentNodes,
        nextEdges: currentEdges,
        createdNodeIds: [],
      };
    }

    const normalizedIncoming = incomingNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        ownerId: node?.data?.ownerId || currentUserId,
        editedBy: speakerName || node?.data?.editedBy || currentUserName,
        visibility: normalizeVisibility(node?.data?.visibility),
        isOffMeeting: node?.data?.isOffMeeting || captureMeetingState === "ended" || graphPatch?.placementMode === "below",
      },
    }));
    const rawNewNodes = normalizedIncoming.map((node) => toReactFlowNode(node, null));
    const isOffMeeting =
      graphPatch?.placementMode === "below" || captureMeetingState === "ended";
    const anchorEdge =
      incomingEdges.find((edge) => getEdgeContinuationFlag(edge)) || incomingEdges[0];
    const anchorNode = anchorEdge?.source
      ? currentNodes.find((node) => node.id === anchorEdge.source)
      : null;

    let placedNodes = rawNewNodes;
    if (currentNodes.length) {
      placedNodes =
        isOffMeeting && anchorNode
          ? shiftClusterBelowAnchor(anchorNode, rawNewNodes, currentNodes, currentEdges)
          : shiftClusterRightOfExisting(currentNodes, rawNewNodes);
    }

    const mergedNodes = [...currentNodes, ...placedNodes];
    const existingEdgeIds = new Set(currentEdges.map((edge) => edge.id));
    const nextRawEdges = incomingEdges.filter((edge) => edge?.id && !existingEdgeIds.has(edge.id));
    const nextConnectorEdges = toConnectorEdges(nextRawEdges, mergedNodes, currentEdges);
    const nextEdges = [...currentEdges, ...nextConnectorEdges];
    const relaidNodes = isOffMeeting
      ? mergedNodes
      : relayoutTopLevelThinkingNodes(mergedNodes, nextEdges);

    // Update Refs synchronously to prevent subsequent updates in the same tick from using stale graphs
    nodesRef.current = relaidNodes;
    edgesRef.current = nextEdges;

    setNodes(relaidNodes);
    setEdges(nextEdges);

    return {
      nextNodes: relaidNodes,
      nextEdges,
      createdNodeIds: placedNodes.map((node) => node.id),
    };
  }, [currentUserId, currentUserName, setEdges, setNodes, meetingState]);

  const handleMeetingCaptureSubmit = useCallback(async (chunkText, overrideSpeakerName = null) => {
    if (!projectId) return;

    const trimmedChunk = String(chunkText || "").trim();
    if (!trimmedChunk) return;

    const existingThinkingNodes = nodes
      .filter((node) => node?.type === "thinkingNode")
      .map((node) => ({
        id: node.id,
        data: {
          title: node?.data?.title || "",
          content: node?.data?.content || "",
          category: node?.data?.category,
          phase: node?.data?.phase,
        },
        position: node.position,
      }));

    setIsMeetingCaptureLoading(true);
    setTeamContextError("");
    try {
      const result = await ingestMeetingChunk(projectId, {
        projectTitle,
        chunkText: trimmedChunk,
        chunkType: "speaker_turn",
        speakerName: overrideSpeakerName || currentUserName,
        meetingSessionId: meetingSessionIdRef.current,
        existing_nodes: existingThinkingNodes,
        meeting_memory: {
          working: {
            activeIssueTitles: meetingMemoryReadout.activeIssues.map((item) => item.title),
            unresolvedQuestions: meetingMemoryReadout.unresolvedQuestions.map((item) => item.title),
            decisionCandidates: meetingMemoryReadout.decisionCandidates.map((item) => item.title),
            repeatedIssueKeys: meetingMemoryReadout.repeatedIssues,
          },
          executive: {
            currentDirection: meetingMemoryReadout.currentDirection,
            unresolvedAreas: meetingMemoryReadout.unresolvedAreas,
            nextStepImplications: meetingMemoryReadout.nextStepImplications,
          },
        },
        stage: normalizedStage,
        meetingState,
      });

      const mergeResult = applyMeetingGraphPatch(result?.graphPatch || {}, meetingState, overrideSpeakerName || currentUserName);
      const nextMeetingMemory = mergeMeetingMemory(meetingMemory, result?.memoryPatch || {});
      setMeetingMemory(nextMeetingMemory);
      setMeetingCaptureSummary(result?.meetingSummary || null);
      setIsTeamContextPanelOpen(true);

      const focusIds = result?.meetingSummary?.linkedNodeIds || mergeResult.createdNodeIds;
      if (focusIds?.length) {
        setHighlightedNodeIds(new Set(focusIds));
        const targetNodes = mergeResult.nextNodes.filter((node) => focusIds.includes(node.id));
        if (targetNodes.length) animateViewportToNodes(targetNodes);
      }

      void recordProjectActivity("meeting_chunk_ingested", {
        nodeTitle: result?.meetingSummary?.chunkSummary || trimmedChunk.slice(0, 80),
        nodeType: "MeetingChunk",
        relatedNodeIds: result?.meetingSummary?.linkedNodeIds || [],
        stage: normalizedStage,
        metadata: {
          chunkType: "speaker_turn",
          createdNodeIds: result?.meetingSummary?.createdNodeIds || [],
          strengthenedNodeIds: result?.meetingSummary?.strengthenedNodeIds || [],
          repeatedIssueKeys: result?.meetingSummary?.repeatedIssueKeys || [],
        },
      });
    } catch (error) {
      setTeamContextError(
        error?.response?.data?.error ||
        error?.message ||
        "Failed to ingest the meeting chunk."
      );
    } finally {
      setIsMeetingCaptureLoading(false);
    }
  }, [
    animateViewportToNodes,
    applyMeetingGraphPatch,
    currentUserName,
    meetingMemory,
    meetingMemoryReadout.activeIssues,
    meetingMemoryReadout.currentDirection,
    meetingMemoryReadout.decisionCandidates,
    meetingMemoryReadout.nextStepImplications,
    meetingMemoryReadout.repeatedIssues,
    meetingMemoryReadout.unresolvedAreas,
    meetingMemoryReadout.unresolvedQuestions,
    meetingSessionIdRef,
    meetingState,
    nodes,
    normalizedStage,
    projectId,
    projectTitle,
    recordProjectActivity,
    setHighlightedNodeIds,
    setIsMeetingCaptureLoading,
    setIsTeamContextPanelOpen,
    setMeetingCaptureSummary,
    setMeetingMemory,
    setTeamContextError,
  ]);

  return {
    applyMeetingGraphPatch,
    handleMeetingCaptureSubmit,
  };
}
