/**
 * Career Quest — Quest Feature Service
 * Source: BACKEND_ARCHITECTURE_SPECIFICATION §9, API_SPECIFICATION §23-§25
 */

import { MockAIProvider } from "../../lib/ai/mock-provider.ts";
import { markNodeInProgress, markNodeCompleted } from "../../lib/graph/index.ts";
import { getRoadmap } from "../roadmap/service.ts";
import type { AiQuestCandidate } from "../../lib/ai/schemas.ts";

export interface StoredQuest {
  id: string;
  userId: string;
  roadmapId: string;
  nodeId: string;
  title: string;
  objective: string;
  estimatedHours: number;
  status: "AVAILABLE" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
  tasks: Array<{
    title: string;
    description?: string;
    sequence: number;
    estimatedMinutes?: number;
    completed: boolean;
  }>;
  githubIdea?: string;
  interviewQuestions?: string[];
  createdAt: string;
  completedAt?: string;
}

const globalQuestStore = globalThis as unknown as {
  __careerQuestQuestStore?: Map<string, StoredQuest>;
};

if (!globalQuestStore.__careerQuestQuestStore) {
  globalQuestStore.__careerQuestQuestStore = new Map<string, StoredQuest>();
}

export const questStore = globalQuestStore.__careerQuestQuestStore;

export async function createQuestForNode(
  userId: string,
  roadmapId: string,
  nodeId: string
): Promise<StoredQuest> {
  const roadmap = await getRoadmap(userId, roadmapId);
  if (!roadmap) {
    throw new Error(`Roadmap '${roadmapId}' not found.`);
  }

  const node = roadmap.graphResult.graph.nodes.find((n) => n.id === nodeId);
  if (!node) {
    throw new Error(`Node '${nodeId}' not found in roadmap.`);
  }

  if (node.status === "LOCKED") {
    throw new Error(`Cannot generate quest for node '${nodeId}': node is currently LOCKED.`);
  }

  // Idempotency: Return existing active quest for this node if already in progress
  const existingQuest = Array.from(questStore.values()).find(
    (q) =>
      q.userId === userId &&
      q.roadmapId === roadmapId &&
      q.nodeId === nodeId &&
      q.status === "IN_PROGRESS"
  );
  if (existingQuest) {
    return existingQuest;
  }

  const provider = new MockAIProvider();
  const questData: AiQuestCandidate = provider.buildSampleQuest(node.title);

  const questId = `quest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const stored: StoredQuest = {
    id: questId,
    userId,
    roadmapId,
    nodeId,
    title: questData.title,
    objective: questData.objective,
    estimatedHours: questData.estimatedHours,
    status: "IN_PROGRESS",
    tasks: questData.tasks.map((t) => ({ ...t, completed: false })),
    githubIdea: questData.githubIdea,
    interviewQuestions: questData.interviewQuestions,
    createdAt: new Date().toISOString(),
  };

  questStore.set(questId, stored);

  // Mark node IN_PROGRESS in Graph Engine
  if (node.status === "AVAILABLE") {
    const updated = markNodeInProgress(
      roadmap.graphResult.graph,
      nodeId,
      { weeklyHours: roadmap.weeklyHours }
    );
    roadmap.graphResult = updated;
    roadmap.revision = updated.graph.revision;
  }

  return stored;
}

export async function getQuest(
  userId: string,
  questId: string
): Promise<StoredQuest | null> {
  const quest = questStore.get(questId);
  if (!quest || quest.userId !== userId) return null;
  return quest;
}

export async function completeQuest(
  userId: string,
  questId: string
): Promise<{
  quest: StoredQuest;
  nodesUnlocked: string[];
  roadmap: unknown;
}> {
  const quest = await getQuest(userId, questId);
  if (!quest) {
    throw new Error(`Quest '${questId}' not found.`);
  }

  quest.status = "COMPLETED";
  quest.completedAt = new Date().toISOString();
  quest.tasks.forEach((t) => (t.completed = true));

  // Mark node as COMPLETED in Graph Engine and unlock downstream nodes
  const roadmap = await getRoadmap(userId, quest.roadmapId);
  let nodesUnlocked: string[] = [];

  if (roadmap) {
    const previousLocked = roadmap.graphResult.graph.nodes
      .filter((n) => n.status === "LOCKED")
      .map((n) => n.id);

    const updated = markNodeCompleted(
      roadmap.graphResult.graph,
      quest.nodeId,
      { weeklyHours: roadmap.weeklyHours }
    );

    roadmap.graphResult = updated;
    roadmap.revision = updated.graph.revision;

    const nowLocked = new Set(
      updated.graph.nodes.filter((n) => n.status === "LOCKED").map((n) => n.id)
    );

    nodesUnlocked = previousLocked.filter((id) => !nowLocked.has(id));
  }

  return {
    quest,
    nodesUnlocked,
    roadmap,
  };
}
