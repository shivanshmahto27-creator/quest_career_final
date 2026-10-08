/**
 * Career Quest — Graph Cycle Detector & Topological Sort
 * Implements Kahn's Algorithm for deterministic DAG validation.
 * Source: GRAPH_ENGINE_SPECIFICATION_Career_Quest_v1.0.md §10-§13
 */

import type { GraphNode, GraphEdge } from "../../types/graph";

export interface ValidationIssue {
  type: "CYCLE" | "SELF_EDGE" | "DANGLING_EDGE" | "DUPLICATE_EDGE" | "INVALID_NODE";
  message: string;
  nodeIds?: string[];
  edgeIds?: string[];
}

export interface GraphValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  sortedNodeIds?: string[];
}

/**
 * Validates graph integrity:
 * 1. Checks node validity and uniqueness
 * 2. Rejects self-loops (source === target)
 * 3. Rejects dangling edges (source or target not found)
 * 4. Deduplicates redundant edges
 * 5. Uses Kahn's algorithm to detect cycles and compute topological ordering
 */
export function validateGraphDAG(
  nodes: GraphNode[],
  edges: GraphEdge[]
): GraphValidationResult {
  const issues: ValidationIssue[] = [];
  const nodeMap = new Map<string, GraphNode>();

  for (const node of nodes) {
    if (!node.id || !node.title) {
      issues.push({
        type: "INVALID_NODE",
        message: `Node has missing id or title: ${JSON.stringify(node)}`,
        nodeIds: node.id ? [node.id] : [],
      });
    }
    if (nodeMap.has(node.id)) {
      issues.push({
        type: "INVALID_NODE",
        message: `Duplicate node ID detected: ${node.id}`,
        nodeIds: [node.id],
      });
    }
    nodeMap.set(node.id, node);
  }

  // Validate edges
  const seenEdges = new Set<string>();
  const validEdges: GraphEdge[] = [];

  for (const edge of edges) {
    if (edge.sourceNodeId === edge.targetNodeId) {
      issues.push({
        type: "SELF_EDGE",
        message: `Self-edge detected on node ${edge.sourceNodeId}`,
        nodeIds: [edge.sourceNodeId],
        edgeIds: [edge.id],
      });
      continue;
    }

    if (!nodeMap.has(edge.sourceNodeId)) {
      issues.push({
        type: "DANGLING_EDGE",
        message: `Edge source ${edge.sourceNodeId} does not exist in nodes`,
        edgeIds: [edge.id],
      });
      continue;
    }

    if (!nodeMap.has(edge.targetNodeId)) {
      issues.push({
        type: "DANGLING_EDGE",
        message: `Edge target ${edge.targetNodeId} does not exist in nodes`,
        edgeIds: [edge.id],
      });
      continue;
    }

    const edgeKey = `${edge.sourceNodeId}->${edge.targetNodeId}:${edge.type}`;
    if (seenEdges.has(edgeKey)) {
      issues.push({
        type: "DUPLICATE_EDGE",
        message: `Duplicate edge detected between ${edge.sourceNodeId} and ${edge.targetNodeId}`,
        edgeIds: [edge.id],
      });
      continue;
    }

    seenEdges.add(edgeKey);
    validEdges.push(edge);
  }

  // If there are structural edge errors, cannot perform topological sort
  if (issues.some((i) => i.type === "SELF_EDGE" || i.type === "DANGLING_EDGE")) {
    return {
      isValid: false,
      issues,
    };
  }

  // Kahn's Algorithm for cycle detection and topological ordering
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const edge of validEdges) {
    // Only required edges determine strict DAG prerequisite ordering
    if (edge.required) {
      inDegree.set(edge.targetNodeId, (inDegree.get(edge.targetNodeId) || 0) + 1);
      adjacency.get(edge.sourceNodeId)?.push(edge.targetNodeId);
    }
  }

  // Roots with in-degree 0
  const queue: string[] = [];
  for (const [nodeId, degree] of inDegree.entries()) {
    if (degree === 0) {
      queue.push(nodeId);
    }
  }

  // Deterministic sort: priority asc, then stable ID asc
  const sortDeterministic = (idA: string, idB: string) => {
    const nodeA = nodeMap.get(idA);
    const nodeB = nodeMap.get(idB);
    const prioA = nodeA?.priority ?? 0;
    const prioB = nodeB?.priority ?? 0;
    if (prioA !== prioB) {
      return prioA - prioB;
    }
    return idA.localeCompare(idB);
  };

  queue.sort(sortDeterministic);

  const sortedNodeIds: string[] = [];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    sortedNodeIds.push(currentId);

    const neighbors = adjacency.get(currentId) || [];
    neighbors.sort(sortDeterministic);

    for (const neighborId of neighbors) {
      const updatedDegree = (inDegree.get(neighborId) || 1) - 1;
      inDegree.set(neighborId, updatedDegree);
      if (updatedDegree === 0) {
        queue.push(neighborId);
        queue.sort(sortDeterministic);
      }
    }
  }

  // Cycle check: if sorted count < total nodes, a cycle exists
  if (sortedNodeIds.length !== nodes.length) {
    const cycleNodeIds = nodes
      .map((n) => n.id)
      .filter((id) => !sortedNodeIds.includes(id));

    issues.push({
      type: "CYCLE",
      message: `Cycle detected in graph among nodes: ${cycleNodeIds.join(", ")}`,
      nodeIds: cycleNodeIds,
    });

    return {
      isValid: false,
      issues,
    };
  }

  return {
    isValid: issues.length === 0,
    issues,
    sortedNodeIds,
  };
}
