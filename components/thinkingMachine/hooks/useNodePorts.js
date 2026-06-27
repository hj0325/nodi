"use client";

import { useMemo } from "react";
import {
  getEdgeContinuationFlag,
  isVerticalConnectorEdge,
  SOURCE_HANDLE_ID,
  TARGET_HANDLE_ID,
  BOTTOM_SOURCE_HANDLE_ID,
  TOP_TARGET_HANDLE_ID,
} from "@/lib/thinkingMachine/connectorEdges";

export function useNodePorts({
  nodes,
  edges,
  highlightedNodeIds,
  draftHandlers,
  draftSubmittingIds,
  conflictByNodeId,
  openConflictNodeId,
  conflictExplainResultByNodeId,
  conflictExplainLoadingByNodeId,
  onToggleConflictPopover,
  onExplainConflict,
}) {
  const portVisibilityByNode = useMemo(() => {
    const map = new Map();
    edges.forEach((edge) => {
      if (edge?.source) {
        const current = map.get(edge.source) || {
          hasLeftPort: false,
          hasRightPort: false,
          hasTopPort: false,
          hasBottomPort: false,
        };
        if (edge.sourceHandle === BOTTOM_SOURCE_HANDLE_ID) {
          current.hasBottomPort = true;
        } else if (edge.sourceHandle === SOURCE_HANDLE_ID) {
          current.hasRightPort = true;
        } else {
          const isVertical = isVerticalConnectorEdge(edge);
          if (isVertical) {
            current.hasBottomPort = true;
          } else {
            current.hasRightPort = true;
          }
        }
        map.set(edge.source, current);
      }
      if (edge?.target) {
        const current = map.get(edge.target) || {
          hasLeftPort: false,
          hasRightPort: false,
          hasTopPort: false,
          hasBottomPort: false,
        };
        if (edge.targetHandle === TOP_TARGET_HANDLE_ID) {
          current.hasTopPort = true;
        } else if (edge.targetHandle === TARGET_HANDLE_ID) {
          current.hasLeftPort = true;
        } else {
          const isVertical = isVerticalConnectorEdge(edge);
          if (isVertical) {
            current.hasTopPort = true;
          } else {
            current.hasLeftPort = true;
          }
        }
        map.set(edge.target, current);
      }
    });
    return map;
  }, [edges]);

  const offMeetingByNodeId = useMemo(() => {
    const map = new Map();
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    nodes.forEach((node) => {
      if (node?.data?.isOffMeeting) map.set(node.id, true);
    });
    edges.forEach((edge) => {
      if (getEdgeContinuationFlag(edge) && edge?.target) {
        const targetNode = nodeMap.get(edge.target);
        if (targetNode?.data?.isOffMeeting !== false) {
          map.set(edge.target, true);
        }
      }
    });
    let changed = true;
    while (changed) {
      changed = false;
      edges.forEach((edge) => {
        if (isVerticalConnectorEdge(edge)) return;
        if (map.get(edge.source) && edge?.target && !map.get(edge.target)) {
          const targetNode = nodeMap.get(edge.target);
          if (targetNode?.data?.isOffMeeting !== false) {
            map.set(edge.target, true);
            changed = true;
          }
        }
      });
    }
    return map;
  }, [edges, nodes]);

  const displayNodes = useMemo(() => {
    const hasHighlightSet = highlightedNodeIds instanceof Set;
    return nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        hasLeftPort: portVisibilityByNode.get(n.id)?.hasLeftPort || false,
        hasRightPort: portVisibilityByNode.get(n.id)?.hasRightPort || false,
        hasTopPort: portVisibilityByNode.get(n.id)?.hasTopPort || false,
        hasBottomPort: portVisibilityByNode.get(n.id)?.hasBottomPort || false,
        ...(n.type === "postitDraft"
          ? {
              onChangeText: draftHandlers?.onPostitChangeText,
              onSubmit: draftHandlers?.onDraftSubmit,
              isSubmitting: Boolean(draftSubmittingIds?.has?.(n.id)),
            }
          : {}),
        ...(n.type === "imageDraft"
          ? {
              onPickImage: draftHandlers?.onImagePick,
              onChangeCaption: draftHandlers?.onImageChangeCaption,
              onSubmit: draftHandlers?.onDraftSubmit,
              isSubmitting: Boolean(draftSubmittingIds?.has?.(n.id)),
            }
          : {}),
        ...(n.type === "ideaGroup"
          ? {
              onToggle: draftHandlers?.onToggleIdeaGroup,
            }
          : {}),
        ...(n.type === "thinkingNode"
          ? {
              id: n.id,
              nodeId: n.id,
              isOffMeeting: Boolean(offMeetingByNodeId.get(n.id) || n.data?.isOffMeeting),
              conflictLinkedNodeTitles: conflictByNodeId?.[n.id]?.linkedNodeTitles || [],
              conflictExplanation: conflictExplainResultByNodeId?.[n.id] || null,
              isConflictPopoverOpen: openConflictNodeId === n.id,
              isConflictExplainLoading: Boolean(conflictExplainLoadingByNodeId?.[n.id]),
              onToggleConflictPopover,
              onExplainConflict,
            }
          : {}),
      },
      className: [n.className || "", hasHighlightSet && highlightedNodeIds.has(n.id) ? "node-highlighted" : ""]
        .filter(Boolean)
        .join(" "),
    }));
  }, [
    conflictByNodeId,
    conflictExplainLoadingByNodeId,
    conflictExplainResultByNodeId,
    draftHandlers,
    draftSubmittingIds,
    highlightedNodeIds,
    nodes,
    offMeetingByNodeId,
    onExplainConflict,
    onToggleConflictPopover,
    openConflictNodeId,
    portVisibilityByNode,
  ]);

  return { displayNodes };
}

