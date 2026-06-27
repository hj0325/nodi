import { useCallback } from "react";
import { analyze } from "@/lib/thinkingMachine/apiClient";
import { toConnectorEdges, getEdgeContinuationFlag } from "@/lib/thinkingMachine/connectorEdges";
import { toReactFlowNode } from "@/lib/thinkingMachine/reactflowTransforms";
import { getNodeSnapshot } from "@/components/thinkingMachine/utils/graphSnapshots";
import { mergeSuggestionUnique } from "@/components/thinkingMachine/utils/suggestionUtils";
import {
  relayoutTopLevelThinkingNodes,
  shiftClusterBelowAnchor,
  shiftClusterRelativeToAnchor,
  shiftClusterRightOfExisting,
} from "@/lib/thinkingMachine/graphMerge";
import { normalizeRelationLabel, normalizeVisibility } from "@/lib/thinkingMachine/nodeMeta";

export function useThinkingAiAnalyze({
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
  currentUserName = "Hyeonji",
  meetingState = "active",
}) {
  const handleInputSubmit = useCallback(
    async ({ text, preferredType, selectedNode: inputContextNode } = {}) => {
      const rawText = typeof text === "string" ? text.trim() : "";
      if (!rawText) return;
      setIsAnalyzing(true);

      try {
        const contextualText = inputContextNode
          ? [
              `Project: ${projectTitle}`,
              `Selected node context: [${inputContextNode.data?.category}] ${inputContextNode.data?.title} - ${
                inputContextNode.data?.content || ""
              }`,
              preferredType ? `Preferred new node type: ${preferredType}.` : "",
              `User follow-up: ${rawText}`,
            ]
              .filter(Boolean)
              .join("\n")
          : [projectTitle ? `Project: ${projectTitle}` : "", rawText].filter(Boolean).join("\n");

        const payload = {
          text: contextualText,
          history: nodes.map((n) => ({
            id: n.id,
            data: {
              title: n.data.title,
              category: n.data.category,
              phase: n.data.phase,
            },
            position: n.position,
          })),
          stage,
          meetingState,
        };

        const data = await analyze(payload);

        const suggestionNodeData = data.nodes.find((n) => n.data.is_ai_generated);
        const userNodeDatas = data.nodes
          .filter((n) => !n.data.is_ai_generated)
          .map((n) => ({
            ...n,
            data: {
              ...n.data,
              ownerId: currentUserId,
              editedBy: currentUserName,
              visibility: "private",
            },
          }));

        const suggestEdge = data.edges.find((e) => e.id.startsWith("e-suggest-"));
        const highlightedMainNodeId = suggestEdge ? suggestEdge.source : null;
        const rawEdges = data.edges.filter((e) => !e.id.startsWith("e-suggest-"));
        const crossAnchorEdge = rawEdges.find(
          (edge) => getEdgeContinuationFlag(edge) && nodes.some((node) => node.id === edge.source)
        );
        const crossAnchorNode = crossAnchorEdge
          ? nodes.find((node) => node.id === crossAnchorEdge.source)
          : null;
        const isOffMeeting = meetingState === "ended";

        const rawNewNodes = userNodeDatas.map((n) =>
          toReactFlowNode(
            {
              ...n,
              data: {
                ...n.data,
                isOffMeeting: isOffMeeting || Boolean(n.data?.isOffMeeting),
              },
            },
            highlightedMainNodeId
          )
        );

        let enrichedNodes;
        if (inputContextNode) {
          enrichedNodes = isOffMeeting
            ? shiftClusterBelowAnchor(inputContextNode, rawNewNodes, nodes, edges)
            : shiftClusterRelativeToAnchor(inputContextNode, rawNewNodes, undefined, nodes);
        } else if (isOffMeeting && crossAnchorNode) {
          enrichedNodes = shiftClusterBelowAnchor(crossAnchorNode, rawNewNodes, nodes, [...edges, ...rawEdges]);
        } else if (nodes.length) {
          enrichedNodes = shiftClusterRightOfExisting(nodes, rawNewNodes);
        } else {
          enrichedNodes = rawNewNodes;
        }
        const viewportTargets = inputContextNode ? [inputContextNode, ...enrichedNodes] : enrichedNodes;

        if (suggestionNodeData) {
          const newSuggestion = {
            id: `suggestion-${Date.now()}`,
            title: suggestionNodeData.data.label,
            content: suggestionNodeData.data.content,
            category: suggestionNodeData.data.category,
            phase: suggestionNodeData.data.phase,
            sourceType: suggestionNodeData.data.sourceType,
            visibility: normalizeVisibility(suggestionNodeData.data.visibility),
            confidence: suggestionNodeData.data.confidence,
            ownerId: suggestionNodeData.data.ownerId,
            suggestionTags: suggestionNodeData.data.suggestionTags || null,
            relatedNodeId: highlightedMainNodeId,
          };
          setSuggestions((prev) => mergeSuggestionUnique(prev, newSuggestion));
          if (highlightedMainNodeId) {
            setHighlightedNodeIds((prev) => new Set([...prev, highlightedMainNodeId]));
          }
        }

        const updatedExistingNodes = nodes.map((n) => ({
          ...n,
          className: n.className || "",
        }));
        const mergedNodes = [...updatedExistingNodes, ...enrichedNodes];
        const newReactFlowEdges = toConnectorEdges(
          rawEdges.map((e) => ({
            ...e,
            label: normalizeRelationLabel(e?.label),
          })),
          mergedNodes,
          edges
        );
        const nextEdges = [...edges, ...newReactFlowEdges];
        const shouldRelayout = !(isOffMeeting && (inputContextNode || crossAnchorNode));
        const relaidNodes = shouldRelayout
          ? relayoutTopLevelThinkingNodes(mergedNodes, nextEdges)
          : mergedNodes;
        const insertedIds = new Set(enrichedNodes.map((node) => node.id));
        const relaidViewportTargets = inputContextNode
          ? relaidNodes.filter((node) => node.id === inputContextNode.id || insertedIds.has(node.id))
          : relaidNodes.filter((node) => insertedIds.has(node.id));

        setNodes(relaidNodes);
        setEdges(nextEdges);
        animateViewportToNodes(relaidViewportTargets.length ? relaidViewportTargets : viewportTargets);
        setDrawerMode("tip");
        setIsDrawerOpen(true);
        userNodeDatas.forEach((node) => {
          const targetNode = relaidNodes.find((item) => item.id === node.id);
          const snapshot = getNodeSnapshot(targetNode, nextEdges);
          void recordProjectActivity("node_created", {
            nodeId: node.id,
            nodeTitle: node?.data?.label,
            nodeType: node?.data?.category,
            before: null,
            after: snapshot,
            relatedNodeIds: snapshot?.linkedNodeIds || [],
            stage,
          });
          if (node?.data?.category === "Conflict") {
            void recordProjectActivity("conflict_created", {
              nodeId: node.id,
              nodeTitle: node?.data?.label,
              nodeType: node?.data?.category,
              before: null,
              after: snapshot,
              relatedNodeIds: snapshot?.linkedNodeIds || [],
              stage,
            });
          }
        });
      } catch (error) {
        console.error("Failed to analyze input:", error);
        const serverMsg =
          error?.response?.data?.error ||
          error?.response?.data?.detail ||
          error?.message;
        alert(serverMsg ? `AI Agent error: ${serverMsg}` : "AI Agent error. Please try again.");
      } finally {
        setIsAnalyzing(false);
      }
    },
    [
      animateViewportToNodes,
      currentUserId,
      currentUserName,
      edges,
      nodes,
      projectTitle,
      recordProjectActivity,
      setDrawerMode,
      setEdges,
      setHighlightedNodeIds,
      setIsAnalyzing,
      setIsDrawerOpen,
      setNodes,
      setSuggestions,
      stage,
      meetingState,
    ]
  );

  return { handleInputSubmit };
}

