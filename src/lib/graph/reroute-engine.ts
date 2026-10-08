/**
 * Career Quest — Graph Rerouting Engine
 * Recomputes graph state, unlocks dependent paths, and adjusts timeline when skills change.
 * Source: GRAPH_ENGINE_SPECIFICATION_Career_Quest_v1.0.md §23-§25
 */

import type {
  CareerGraph,
  GraphNode,
  GraphEvaluationResult,
  UserSkillInput,
} from "../../types/graph";
import { validateGraphDAG } from "./cycle-detector.ts";
import { evaluateNodeStatuses } from "./status-evaluator.ts";
import { calculateTimelineAndProgress, type TimelineCalculationOptions } from "./timeline-calculator.ts";
import { selectNextBestAction } from "./next-best-action.ts";

export interface RerouteOptions extends TimelineCalculationOptions {}

/**
 * Evaluates the full graph deterministically given user state.
 */
export function evaluateGraph(
  graph: CareerGraph,
  options: RerouteOptions = {}
): GraphEvaluationResult {
  // 1. Validate DAG acyclicity & compute topological order
  const validation = validateGraphDAG(graph.nodes, graph.edges);
  if (!validation.isValid || !validation.sortedNodeIds) {
    const errorDetails = validation.issues.map((i) => i.message).join("; ");
    throw new Error(`Graph evaluation aborted due to invalid DAG: ${errorDetails}`);
  }

  // 2. Evaluate statuses in topological order
  const { updatedNodes, impactedNodeIds } = evaluateNodeStatuses(
    graph.nodes,
    graph.edges,
    validation.sortedNodeIds
  );

  // 3. Compute timeline & progress metrics
  const timeline = calculateTimelineAndProgress(updatedNodes, options);

  // 4. Select Next Best Action
  const nextBestAction = selectNextBestAction(updatedNodes, graph.edges);

  return {
    graph: {
      ...graph,
      nodes: updatedNodes,
    },
    timeline,
    nextBestAction,
    impactedNodeIds,
  };
}

/**
 * Handles the "Already Known" skill event:
 * - Updates node proficiencies for matching skill
 * - Marks satisfying nodes as ALREADY_KNOWN
 * - Recalculates downstream node availability
 * - Recalculates timeline and Next Best Action
 * - Increments graph revision
 */
export function applySkillUpdate(
  graph: CareerGraph,
  skillUpdate: UserSkillInput,
  options: RerouteOptions = {}
): GraphEvaluationResult {
  const { skillId, proficiency, isKnown } = skillUpdate;

  // Clone nodes to maintain immutability
  const clonedNodes: GraphNode[] = graph.nodes.map((node) => {
    // If node matches skillId or title corresponds to this skill
    const matchesSkill = node.skillId === skillId || node.id === skillId;
    if (!matchesSkill) {
      return { ...node };
    }

    const updatedNode = { ...node };
    updatedNode.currentProficiency = proficiency;

    // Mark as ALREADY_KNOWN if explicitly indicated or if proficiency satisfies requirements
    if (isKnown === true || proficiency >= node.requiredProficiency) {
      updatedNode.status = "ALREADY_KNOWN";
    }

    return updatedNode;
  });

  const directlyUpdatedNodeIds = clonedNodes
    .filter(
      (n, idx) =>
        n.status !== graph.nodes[idx].status ||
        n.currentProficiency !== graph.nodes[idx].currentProficiency
    )
    .map((n) => n.id);

  const updatedGraph: CareerGraph = {
    ...graph,
    revision: graph.revision + 1,
    nodes: clonedNodes,
  };

  const evalResult = evaluateGraph(updatedGraph, options);

  return {
    ...evalResult,
    impactedNodeIds: Array.from(
      new Set([...directlyUpdatedNodeIds, ...evalResult.impactedNodeIds])
    ),
  };
}

/**
 * Transitions an AVAILABLE node to IN_PROGRESS.
 */
export function markNodeInProgress(
  graph: CareerGraph,
  nodeId: string,
  options: RerouteOptions = {}
): GraphEvaluationResult {
  const clonedNodes: GraphNode[] = graph.nodes.map((node) => {
    if (node.id === nodeId) {
      if (node.status === "LOCKED") {
        throw new Error(`Cannot start node ${nodeId}: prerequisites are locked.`);
      }
      return { ...node, status: "IN_PROGRESS" as const };
    }
    return { ...node };
  });

  const updatedGraph: CareerGraph = {
    ...graph,
    revision: graph.revision + 1,
    nodes: clonedNodes,
  };

  const evalResult = evaluateGraph(updatedGraph, options);

  return {
    ...evalResult,
    impactedNodeIds: Array.from(new Set([nodeId, ...evalResult.impactedNodeIds])),
  };
}

/**
 * Transitions an IN_PROGRESS or AVAILABLE node to COMPLETED.
 */
export function markNodeCompleted(
  graph: CareerGraph,
  nodeId: string,
  options: RerouteOptions = {}
): GraphEvaluationResult {
  const clonedNodes: GraphNode[] = graph.nodes.map((node) => {
    if (node.id === nodeId) {
      return {
        ...node,
        status: "COMPLETED" as const,
        currentProficiency: Math.max(node.currentProficiency, node.requiredProficiency),
      };
    }
    return { ...node };
  });

  const updatedGraph: CareerGraph = {
    ...graph,
    revision: graph.revision + 1,
    nodes: clonedNodes,
  };

  const evalResult = evaluateGraph(updatedGraph, options);

  return {
    ...evalResult,
    impactedNodeIds: Array.from(new Set([nodeId, ...evalResult.impactedNodeIds])),
  };
}
