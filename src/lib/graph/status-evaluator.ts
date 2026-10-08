/**
 * Career Quest — Graph Status Evaluator
 * Evaluates node statuses deterministically based on dependencies and user achievements.
 * Source: GRAPH_ENGINE_SPECIFICATION_Career_Quest_v1.0.md §17-§28, §30
 */

import type { GraphNode, GraphEdge, NodeStatus } from "../../types/graph";

export interface StatusEvaluationResult {
  updatedNodes: GraphNode[];
  impactedNodeIds: string[];
}

/**
 * Checks if a specific prerequisite edge is satisfied by its source node.
 * Evaluates terminal states and required proficiency thresholds.
 */
export function isPrerequisiteSatisfied(
  edge: GraphEdge,
  sourceNode: GraphNode
): boolean {
  if (!edge.required) {
    return true; // Optional/recommended dependencies do not block progress
  }

  const isSatisfiedStatus =
    sourceNode.status === "COMPLETED" ||
    sourceNode.status === "MASTERED" ||
    sourceNode.status === "ALREADY_KNOWN";

  if (!isSatisfiedStatus) {
    return false;
  }

  // If node defines a required proficiency target, verify current proficiency meets it
  if (sourceNode.type === "SKILL" && sourceNode.requiredProficiency > 0) {
    return sourceNode.currentProficiency >= sourceNode.requiredProficiency;
  }

  return true;
}

/**
 * Evaluates all node states in topological order.
 * Preserves user-confirmed facts (ALREADY_KNOWN, MASTERED, COMPLETED).
 * Correctly transitions uncompleted nodes between LOCKED and AVAILABLE.
 */
export function evaluateNodeStatuses(
  nodes: GraphNode[],
  edges: GraphEdge[],
  sortedNodeIds: string[]
): StatusEvaluationResult {
  const nodeMap = new Map<string, GraphNode>();
  const originalStatusMap = new Map<string, NodeStatus>();

  for (const node of nodes) {
    // Clone node to maintain immutability of inputs
    nodeMap.set(node.id, { ...node, blockedBy: [] });
    originalStatusMap.set(node.id, node.status);
  }

  // Pre-index incoming required edges
  const incomingRequiredEdges = new Map<string, GraphEdge[]>();
  for (const node of nodes) {
    incomingRequiredEdges.set(node.id, []);
  }

  for (const edge of edges) {
    if (edge.required) {
      incomingRequiredEdges.get(edge.targetNodeId)?.push(edge);
    }
  }

  const impactedNodeIds: string[] = [];

  // Evaluate strictly in topological order so prerequisites are evaluated first
  for (const nodeId of sortedNodeIds) {
    const node = nodeMap.get(nodeId);
    if (!node) continue;

    // Preserved terminal facts: cannot be demoted back to locked/available
    if (
      node.status === "ALREADY_KNOWN" ||
      node.status === "MASTERED" ||
      node.status === "COMPLETED"
    ) {
      node.blockedBy = [];
      continue;
    }

    const incoming = incomingRequiredEdges.get(nodeId) || [];
    const blockedBy: string[] = [];

    for (const edge of incoming) {
      const source = nodeMap.get(edge.sourceNodeId);
      if (!source || !isPrerequisiteSatisfied(edge, source)) {
        blockedBy.push(edge.sourceNodeId);
      }
    }

    node.blockedBy = blockedBy;

    let nextStatus: NodeStatus = node.status;

    if (blockedBy.length > 0) {
      // At least one prerequisite is unsatisfied
      nextStatus = "LOCKED";
    } else {
      // All prerequisites are satisfied
      if (node.status === "LOCKED") {
        nextStatus = "AVAILABLE";
      } else if (node.status === "IN_PROGRESS") {
        nextStatus = "IN_PROGRESS";
      } else {
        nextStatus = "AVAILABLE";
      }
    }

    if (nextStatus !== originalStatusMap.get(nodeId)) {
      impactedNodeIds.push(nodeId);
    }
    node.status = nextStatus;
  }

  return {
    updatedNodes: Array.from(nodeMap.values()),
    impactedNodeIds,
  };
}
