/**
 * Career Quest — Skill Feature Service
 * Source: BACKEND_ARCHITECTURE_SPECIFICATION §9, API_SPECIFICATION §14-§17
 */

import { SEED_SKILLS, type SkillFixture } from "../../lib/db/fixtures.ts";
import { getRoadmap, rerouteRoadmap } from "../roadmap/service.ts";

export interface StoredUserSkill {
  skillId: string;
  name: string;
  proficiency: number;
  status: "ACTIVE" | "ALREADY_KNOWN" | "UNKNOWN";
  source: string;
  lastAssessedAt: string;
  revision: number;
}

// In-memory store for user skills: user_id -> skillId -> StoredUserSkill (shared across route bundles)
const globalSkillStore = globalThis as unknown as {
  __careerQuestSkillStore?: Map<string, Map<string, StoredUserSkill>>;
};

if (!globalSkillStore.__careerQuestSkillStore) {
  globalSkillStore.__careerQuestSkillStore = new Map<string, Map<string, StoredUserSkill>>();
}

export const userSkillStore = globalSkillStore.__careerQuestSkillStore;

function getUserMap(userId: string): Map<string, StoredUserSkill> {
  if (!userSkillStore.has(userId)) {
    userSkillStore.set(userId, new Map<string, StoredUserSkill>());
  }
  return userSkillStore.get(userId)!;
}

export async function listSkills(query?: string): Promise<SkillFixture[]> {
  if (!query) {
    return SEED_SKILLS;
  }
  const q = query.toLowerCase();
  return SEED_SKILLS.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q)
  );
}

export async function getSkill(skillId: string): Promise<SkillFixture | null> {
  return (
    SEED_SKILLS.find((s) => s.id === skillId || s.slug === skillId) || null
  );
}

export async function getUserSkills(userId: string): Promise<StoredUserSkill[]> {
  const map = getUserMap(userId);
  return Array.from(map.values());
}

export async function updateUserSkill(
  userId: string,
  skillId: string,
  proficiency: number,
  status: "ACTIVE" | "ALREADY_KNOWN" = "ACTIVE",
  expectedRevision?: number
): Promise<{
  skill: StoredUserSkill;
  roadmapImpact: {
    roadmapChanged: boolean;
    nodesUnlocked: number;
    timelineChanged: boolean;
    nextActionChanged: boolean;
  };
  roadmap: unknown;
}> {
  if (proficiency < 0 || proficiency > 5) {
    throw new Error(`Proficiency must be between 0 and 5, received: ${proficiency}`);
  }

  const skillInfo = await getSkill(skillId);
  const skillName = skillInfo?.name || skillId;

  const userMap = getUserMap(userId);
  const existing = userMap.get(skillId);

  // Concurrency check if expectedRevision provided (API_SPEC §17)
  if (expectedRevision !== undefined && existing && existing.revision !== expectedRevision) {
    throw new Error(
      `[CONFLICT] Revision mismatch: expected revision ${expectedRevision}, but current revision is ${existing.revision}.`
    );
  }

  const updatedSkill: StoredUserSkill = {
    skillId,
    name: skillName,
    proficiency,
    status: proficiency >= 3 ? "ALREADY_KNOWN" : status,
    source: "USER_UPDATE",
    lastAssessedAt: new Date().toISOString(),
    revision: (existing?.revision || 0) + 1,
  };

  userMap.set(skillId, updatedSkill);

  // Check if active roadmap exists to trigger deterministic rerouting
  const activeRoadmap = await getRoadmap(userId);
  let roadmapImpact = {
    roadmapChanged: false,
    nodesUnlocked: 0,
    timelineChanged: false,
    nextActionChanged: false,
  };
  let updatedRoadmap = null;

  if (activeRoadmap) {
    const previousResult = activeRoadmap.graphResult;
    const rerouted = await rerouteRoadmap(userId, activeRoadmap.id, {
      skillId,
      proficiency,
      isKnown: updatedSkill.status === "ALREADY_KNOWN",
    });

    const newResult = rerouted.graphResult;
    const previouslyLocked = previousResult.graph.nodes.filter((n) => n.status === "LOCKED").length;
    const nowLocked = newResult.graph.nodes.filter((n) => n.status === "LOCKED").length;

    roadmapImpact = {
      roadmapChanged: true,
      nodesUnlocked: Math.max(0, previouslyLocked - nowLocked),
      timelineChanged: previousResult.timeline.remainingHours !== newResult.timeline.remainingHours,
      nextActionChanged: previousResult.nextBestAction?.nodeId !== newResult.nextBestAction?.nodeId,
    };
    updatedRoadmap = rerouted;
  }

  return {
    skill: updatedSkill,
    roadmapImpact,
    roadmap: updatedRoadmap,
  };
}
