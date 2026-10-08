/**
 * Career Quest — 4-Layer AI Roadmap Validation & Materialization Pipeline
 * Source: AI_ORCHESTRATION_SPECIFICATION §17-§18, GRAPH_ENGINE_SPECIFICATION §10
 *
 * Layers:
 * 1. Syntax: Valid JSON
 * 2. Schema: Zod contract validation
 * 3. Semantic: Phase references, uniqueness, domain bounds
 * 4. Graph: Kahn's cycle detection, topological validation, initial state evaluation via Phase 1 Graph Engine
 */

import {
  type AiRoadmapCandidate,
  type AiNode,
  type AiEdge,
  AiRoadmapCandidateSchema,
} from "./schemas.ts";
import type {
  CareerGraph,
  GraphNode,
  GraphEdge,
  GraphEvaluationResult,
} from "../../types/graph.ts";
import { validateGraphDAG, evaluateGraph } from "../graph/index.ts";

export interface MaterializedRoadmapResult {
  isValid: boolean;
  errors: string[];
  evaluated?: GraphEvaluationResult;
}

/**
 * Validates candidate AI output and materializes it into an active CareerGraph through the Graph Engine.
 */
export function validateAndMaterializeAiRoadmap(
  rawCandidate: unknown,
  weeklyHours: number = 10
): MaterializedRoadmapResult {
  const errors: string[] = [];

  // Layer 2: Schema validation via Zod
  const parseResult = AiRoadmapCandidateSchema.safeParse(rawCandidate);
  if (!parseResult.success) {
    const formatted = parseResult.error.errors
      .map((e: { path: (string | number)[]; message: string }) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    return {
      isValid: false,
      errors: [`[SCHEMA_VALIDATION_FAILED] ${formatted}`],
    };
  }

  const candidate: AiRoadmapCandidate = parseResult.data;

  // Layer 3: Semantic validation
  const phaseIds = new Set(candidate.phases.map((p: { id: string }) => p.id));
  const nodeMap = new Map<string, (typeof candidate.nodes)[0]>();

  for (const node of candidate.nodes) {
    if (!phaseIds.has(node.phaseId)) {
      errors.push(
        `[SEMANTIC_ERROR] Node '${node.id}' references non-existent phase '${node.phaseId}'`
      );
    }
    if (nodeMap.has(node.id)) {
      errors.push(`[SEMANTIC_ERROR] Duplicate node id detected: '${node.id}'`);
    }
    nodeMap.set(node.id, node);
  }

  for (const edge of candidate.edges) {
    if (!nodeMap.has(edge.source)) {
      errors.push(
        `[SEMANTIC_ERROR] Edge source '${edge.source}' does not exist in nodes`
      );
    }
    if (!nodeMap.has(edge.target)) {
      errors.push(
        `[SEMANTIC_ERROR] Edge target '${edge.target}' does not exist in nodes`
      );
    }
    if (edge.source === edge.target) {
      errors.push(
        `[SEMANTIC_ERROR] Self-edge detected from '${edge.source}' to '${edge.target}'`
      );
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  // Layer 4: Graph Engine conversion & DAG validation
  const graphNodes: GraphNode[] = candidate.nodes.map((node: AiNode) => ({
    id: node.id,
    skillId: node.skillId,
    type: node.type,
    title: node.title,
    description: node.description,
    requiredProficiency: node.requiredProficiency,
    currentProficiency: 0,
    estimatedHours: node.estimatedHours,
    phaseId: node.phaseId,
    priority: node.priority,
    status: "LOCKED" as const,
    metadata: node.rationale ? { rationale: node.rationale } : undefined,
  }));

  const graphEdges: GraphEdge[] = candidate.edges.map((edge: AiEdge, index: number) => ({
    id: `edge-${edge.source}-${edge.target}-${index}`,
    sourceNodeId: edge.source,
    targetNodeId: edge.target,
    type: edge.type,
    required: edge.required,
  }));

  const dagCheck = validateGraphDAG(graphNodes, graphEdges);
  if (!dagCheck.isValid) {
    return {
      isValid: false,
      errors: dagCheck.issues.map((i) => `[DAG_ERROR] ${i.type}: ${i.message}`),
    };
  }

  // Authoritative runtime state evaluation via Phase 1 Graph Engine
  const baseGraph: CareerGraph = {
    id: `roadmap-${Date.now()}`,
    roadmapId: `roadmap-${Date.now()}`,
    revision: 1,
    nodes: graphNodes,
    edges: graphEdges,
  };

  const evaluated = evaluateGraph(baseGraph, { weeklyHours });

  return {
    isValid: true,
    errors: [],
    evaluated,
  };
}
