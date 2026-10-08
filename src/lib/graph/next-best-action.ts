/**
 * Career Quest — Next Best Action Engine
 * Deterministic selection and ranking of the user's immediate next learning task.
 * Source: GRAPH_ENGINE_SPECIFICATION_Career_Quest_v1.0.md §36-§39
 */

import type { GraphNode, GraphEdge, NextBestAction } from "../../types/graph";

/**
 * Computes how many locked downstream nodes directly or indirectly require this candidate node.
 */
function calculateUnlockImpact(
  candidateId: string,
  edges: GraphEdge[],
  nodeStatusMap: Map<string, string>
): number {
  const visited = new Set<string>();
  const queue: string[] = [candidateId];
  let unlockCount = 0;

  // Build outgoing required adjacency list
  const outgoingRequired = new Map<string, string[]>();
  for (const edge of edges) {
    if (edge.required) {
      if (!outgoingRequired.has(edge.sourceNodeId)) {
        outgoingRequired.set(edge.sourceNodeId, []);
      }
      outgoingRequired.get(edge.sourceNodeId)!.push(edge.targetNodeId);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const targets = outgoingRequired.get(current) || [];

    for (const targetId of targets) {
      if (!visited.has(targetId)) {
        visited.add(targetId);
        // If downstream target is currently locked, unlocking this candidate helps unblock it
        if (nodeStatusMap.get(targetId) === "LOCKED") {
          unlockCount++;
        }
        queue.push(targetId);
      }
    }
  }

  return unlockCount;
}

/**
 * Evaluates candidate nodes and selects the single highest-priority Next Best Action deterministically.
 */
export function selectNextBestAction(
  nodes: GraphNode[],
  edges: GraphEdge[]
): NextBestAction | null {
  // Status map lookup
  const nodeStatusMap = new Map<string, string>();
  for (const n of nodes) {
    nodeStatusMap.set(n.id, n.status);
  }

  // Filter valid candidate nodes: AVAILABLE or IN_PROGRESS
  const candidates = nodes.filter(
    (n) => n.status === "AVAILABLE" || n.status === "IN_PROGRESS"
  );

  if (candidates.length === 0) {
    return null;
  }

  interface ScoredCandidate {
    node: GraphNode;
    score: number;
    unlockCount: number;
    reason: string;
  }

  const scored: ScoredCandidate[] = candidates.map((node) => {
    let score = 0;
    const unlockCount = calculateUnlockImpact(node.id, edges, nodeStatusMap);

    // 1. IN_PROGRESS preference (+1000)
    if (node.status === "IN_PROGRESS") {
      score += 1000;
    }

    // 2. Prerequisite unlock impact (+100 per unblocked downstream node)
    score += unlockCount * 100;

    // 3. Node priority (+10 * priority)
    score += (node.priority ?? 1) * 10;

    // 4. Smaller estimated effort as tie-breaker (less hours = slight boost)
    const hours = Math.max(1, node.estimatedHours ?? 1);
    score -= hours * 0.1;

    // Generate human-readable reason
    let reason = "Recommended next milestone";
    if (node.status === "IN_PROGRESS") {
      reason = "Currently in progress — resume to maintain learning momentum";
    } else if (unlockCount > 0) {
      reason = `High leverage skill — unblocks ${unlockCount} downstream requirement${
        unlockCount > 1 ? "s" : ""
      }`;
    } else if (node.priority >= 3) {
      reason = "Critical path milestone for target role";
    } else {
      reason = "Foundational prerequisite ready to start";
    }

    return {
      node,
      score,
      unlockCount,
      reason,
    };
  });

  // Sort deterministically:
  // 1. Highest score first
  // 2. Tiebreaker: stable node ID alphabetically
  scored.sort((a, b) => {
    if (Math.abs(b.score - a.score) > 0.0001) {
      return b.score - a.score;
    }
    return a.node.id.localeCompare(b.node.id);
  });

  const winner = scored[0];
  return {
    nodeId: winner.node.id,
    title: winner.node.title,
    reason: winner.reason,
    estimatedHours: winner.node.estimatedHours,
    priority: winner.node.priority,
    unlockCount: winner.unlockCount,
    status: winner.node.status,
  };
}
