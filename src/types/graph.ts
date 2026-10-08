/**
 * Career Quest — Graph Types Specification
 * Pure deterministic types for the DAG Brain
 * Source: GRAPH_ENGINE_SPECIFICATION_Career_Quest_v1.0.md §5-§7
 */

export type NodeStatus =
  | "LOCKED"
  | "AVAILABLE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "MASTERED"
  | "ALREADY_KNOWN";

export type NodeType =
  | "SKILL"
  | "MILESTONE"
  | "PROJECT"
  | "INTERVIEW"
  | "EXPERIENCE";

export type EdgeType =
  | "PREREQUISITE"
  | "UNLOCKS"
  | "RECOMMENDED";

export type ProficiencyLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface GraphNode {
  id: string;
  roadmapNodeId?: string;
  skillId?: string;
  type: NodeType;
  title: string;
  description?: string;
  requiredProficiency: number;
  currentProficiency: number;
  estimatedHours: number;
  phaseId: string;
  priority: number;
  status: NodeStatus;
  blockedBy?: string[];
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: EdgeType;
  required: boolean;
  weight?: number;
}

export interface CareerGraph {
  id: string;
  roadmapId: string;
  revision: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface NextBestAction {
  nodeId: string;
  title: string;
  reason: string;
  estimatedHours: number;
  priority: number;
  unlockCount: number;
  status: NodeStatus;
}

export interface TimelineSummary {
  totalEstimatedHours: number;
  remainingHours: number;
  completedHours: number;
  progressPercentage: number;
  minWeeks: number;
  maxWeeks: number;
  weeklyHours: number;
  assumptions: {
    weeklyHours: number;
    bufferMultiplier: number;
    progressModel: "WEIGHTED_CRITICALITY" | "LINEAR_HOURS";
  };
}

export interface GraphEvaluationResult {
  graph: CareerGraph;
  timeline: TimelineSummary;
  nextBestAction: NextBestAction | null;
  impactedNodeIds: string[];
}

export interface UserSkillInput {
  skillId: string;
  proficiency: number;
  isKnown?: boolean;
}
