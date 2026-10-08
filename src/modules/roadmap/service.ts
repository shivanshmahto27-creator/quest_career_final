/**
 * Career Quest — Roadmap Feature Service
 * Source: BACKEND_ARCHITECTURE_SPECIFICATION §9, API_SPECIFICATION §18-§21
 */

import { MockAIProvider } from "../../lib/ai/mock-provider.ts";
import { validateAndMaterializeAiRoadmap } from "../../lib/ai/validator.ts";
import { applySkillUpdate } from "../../lib/graph/index.ts";
import type { CareerGraph, GraphEvaluationResult } from "../../types/graph.ts";

export interface CreateRoadmapInput {
  targetRole: string;
  currentSkills?: Array<{
    skillId: string;
    proficiency: number;
    name?: string;
  }>;
  weeklyHours: number;
  targetSpecialization?: string;
  targetCompanyType?: string;
}

export interface StoredRoadmap {
  id: string;
  userId: string;
  targetRole: string;
  weeklyHours: number;
  revision: number;
  status: "ACTIVE" | "SUPERSEDED";
  graphResult: GraphEvaluationResult;
  createdAt: string;
  updatedAt: string;
}

// In-memory persistent store for active user roadmaps (shared across Next.js route bundles via globalThis)
const globalStore = globalThis as unknown as {
  __careerQuestRoadmapStore?: Map<string, StoredRoadmap>;
};

if (!globalStore.__careerQuestRoadmapStore) {
  globalStore.__careerQuestRoadmapStore = new Map<string, StoredRoadmap>();
}

export const roadmapStore = globalStore.__careerQuestRoadmapStore;

export async function createRoadmap(
  userId: string,
  input: CreateRoadmapInput
): Promise<StoredRoadmap> {
  const provider = new MockAIProvider();

  // 1. AI proposes candidate structure
  const candidate = provider.buildSampleRoadmap(input.targetRole);

  // 2. 4-Layer validation & Graph Engine materialization
  const validation = validateAndMaterializeAiRoadmap(candidate, input.weeklyHours);
  if (!validation.isValid || !validation.evaluated) {
    throw new Error(
      `Roadmap generation failed validation: ${validation.errors.join("; ")}`
    );
  }

  let finalEvaluation = validation.evaluated;

  // 3. Apply user's current known skills if specified
  if (input.currentSkills && input.currentSkills.length > 0) {
    for (const skill of input.currentSkills) {
      if (skill.proficiency > 0) {
        finalEvaluation = applySkillUpdate(
          finalEvaluation.graph,
          {
            skillId: skill.skillId,
            proficiency: skill.proficiency,
            isKnown: skill.proficiency >= 3,
          },
          { weeklyHours: input.weeklyHours }
        );
      }
    }
  }

  const roadmapId = `rm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  finalEvaluation.graph.id = roadmapId;
  finalEvaluation.graph.roadmapId = roadmapId;

  const stored: StoredRoadmap = {
    id: roadmapId,
    userId,
    targetRole: input.targetRole,
    weeklyHours: input.weeklyHours,
    revision: finalEvaluation.graph.revision,
    status: "ACTIVE",
    graphResult: finalEvaluation,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  roadmapStore.set(roadmapId, stored);
  // Also index as user's latest active roadmap
  roadmapStore.set(`user_active_${userId}`, stored);

  return stored;
}

export async function getRoadmap(
  userId: string,
  roadmapId?: string
): Promise<StoredRoadmap | null> {
  if (roadmapId) {
    const rm = roadmapStore.get(roadmapId);
    if (!rm || rm.userId !== userId) return null;
    return rm;
  }

  // Get active roadmap
  return roadmapStore.get(`user_active_${userId}`) || null;
}

export async function rerouteRoadmap(
  userId: string,
  roadmapId: string,
  skillUpdate: { skillId: string; proficiency: number; isKnown?: boolean }
): Promise<StoredRoadmap> {
  const existing = await getRoadmap(userId, roadmapId);
  if (!existing) {
    throw new Error(`Roadmap '${roadmapId}' not found for user '${userId}'`);
  }

  const newResult = applySkillUpdate(
    existing.graphResult.graph,
    skillUpdate,
    { weeklyHours: existing.weeklyHours }
  );

  const updated: StoredRoadmap = {
    ...existing,
    revision: newResult.graph.revision,
    graphResult: newResult,
    updatedAt: new Date().toISOString(),
  };

  roadmapStore.set(roadmapId, updated);
  roadmapStore.set(`user_active_${userId}`, updated);

  return updated;
}
