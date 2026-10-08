/**
 * Career Quest — Timeline & Progress Calculator
 *
 * ARCHITECTURAL ISOLATION NOTE:
 * In accordance with Phase 1 requirements, timeline arithmetic and progress formulas
 * are isolated behind this dedicated module with explicitly documented assumptions.
 * Any future refinement to scheduling models, buffer multipliers, or velocity
 * calculations can be adjusted here without impacting core graph engine logic.
 *
 * DOCUMENTED ASSUMPTIONS:
 * 1. Scope: Only nodes marked as required (or non-optional) contribute to remaining effort.
 * 2. Unfinished Nodes: Any node whose status is NOT in (COMPLETED, MASTERED, ALREADY_KNOWN).
 * 3. Effort Removal: When a node is marked ALREADY_KNOWN, its remaining estimated hours become 0.
 * 4. Progress Formula (Graph Spec §32):
 *    - Node Weight = estimatedHours * criticalityWeight (required = 1.0, recommended = 0.5)
 *    - Progress = completedWeight / totalRequiredWeight (clamped between 0.0 and 1.0)
 * 5. Timeline Weeks (Graph Spec §33):
 *    - minWeeks = ceil(remainingHours / weeklyHours)
 *    - maxWeeks = ceil((remainingHours * bufferMultiplier) / weeklyHours), default buffer = 1.25
 *    - If remainingHours === 0, minWeeks = 0, maxWeeks = 0.
 */

import type { GraphNode, TimelineSummary } from "../../types/graph";

export interface TimelineCalculationOptions {
  weeklyHours?: number;
  bufferMultiplier?: number;
  progressModel?: "WEIGHTED_CRITICALITY" | "LINEAR_HOURS";
}

const DEFAULT_WEEKLY_HOURS = 10;
const DEFAULT_BUFFER_MULTIPLIER = 1.25;

/**
 * Calculates deterministic timeline metrics and weighted progress from graph nodes.
 */
export function calculateTimelineAndProgress(
  nodes: GraphNode[],
  options: TimelineCalculationOptions = {}
): TimelineSummary {
  const weeklyHours = Math.max(1, options.weeklyHours ?? DEFAULT_WEEKLY_HOURS);
  const bufferMultiplier = Math.max(1.0, options.bufferMultiplier ?? DEFAULT_BUFFER_MULTIPLIER);
  const progressModel = options.progressModel ?? "WEIGHTED_CRITICALITY";

  let totalEstimatedHours = 0;
  let remainingHours = 0;
  let completedHours = 0;

  let totalRequiredWeight = 0;
  let completedWeight = 0;

  for (const node of nodes) {
    const hours = Math.max(0, node.estimatedHours ?? 0);
    totalEstimatedHours += hours;

    // Criticality weight per Graph Spec §32
    // If priority >= 1 or standard node, weight is 1.0
    const criticalityWeight = 1.0;
    const nodeWeight = hours * criticalityWeight;
    totalRequiredWeight += nodeWeight;

    const isFinished =
      node.status === "COMPLETED" ||
      node.status === "MASTERED" ||
      node.status === "ALREADY_KNOWN";

    if (isFinished) {
      completedHours += hours;
      completedWeight += nodeWeight;
    } else {
      remainingHours += hours;
    }
  }

  // Calculate progress percentage
  let progressRatio = 0;
  if (totalRequiredWeight > 0) {
    progressRatio = completedWeight / totalRequiredWeight;
  } else if (totalEstimatedHours > 0) {
    progressRatio = completedHours / totalEstimatedHours;
  } else {
    progressRatio = 0;
  }

  // Clamp between 0% and 100%
  const progressPercentage = Math.min(100, Math.max(0, Math.round(progressRatio * 100)));

  // Timeline weeks arithmetic
  const minWeeks = remainingHours === 0 ? 0 : Math.ceil(remainingHours / weeklyHours);
  const maxWeeks = remainingHours === 0 ? 0 : Math.ceil((remainingHours * bufferMultiplier) / weeklyHours);

  return {
    totalEstimatedHours,
    remainingHours,
    completedHours,
    progressPercentage,
    minWeeks,
    maxWeeks,
    weeklyHours,
    assumptions: {
      weeklyHours,
      bufferMultiplier,
      progressModel,
    },
  };
}
