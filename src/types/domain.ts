/**
 * Career Quest — Core Domain Types
 * Source: DATABASE_SCHEMA_Career_Quest_v1.1_PERFECT.md
 */

import { NodeStatus, NodeType, EdgeType } from "./graph";

export type Role = "USER" | "ADMIN";

export type QuestStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "SKIPPED";

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareerProfile {
  id: string;
  userId: string;
  targetRole: string;
  currentRole?: string;
  targetLevel?: string;
  weeklyHours: number;
  experienceYears?: number;
  learningPace?: string;
  careerPreferences?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  category?: string;
  description?: string;
  standardProficiencyLevels?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  proficiencyLevel: number;
  isKnown: boolean;
  verifiedAt?: string;
  updatedAt: string;
}

export interface Roadmap {
  id: string;
  userId: string;
  targetRole: string;
  version: number;
  revision: number;
  title: string;
  description?: string;
  weeklyHours: number;
  estimatedWeeks: number;
  isActive: boolean;
  rawAiOutput?: Record<string, unknown>;
  normalizedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Phase {
  id: string;
  roadmapId: string;
  phaseNumber: number;
  title: string;
  description?: string;
  estimatedHours: number;
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapNode {
  id: string;
  roadmapId: string;
  phaseId: string;
  skillId?: string;
  title: string;
  type: NodeType;
  status: NodeStatus;
  priority: number;
  requiredProficiency: number;
  currentProficiency: number;
  estimatedHours: number;
  description?: string;
  verificationCriteria?: string;
  completedAt?: string;
  masteredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NodeDependency {
  id: string;
  roadmapId: string;
  sourceNodeId: string;
  targetNodeId: string;
  dependencyType: EdgeType;
  isRequired: boolean;
  createdAt: string;
}

export interface Quest {
  id: string;
  roadmapNodeId: string;
  roadmapId: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  difficultyLevel: number;
  submissionRequirements?: string;
  status: QuestStatus;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
