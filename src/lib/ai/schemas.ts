/**
 * Career Quest — AI Output Validation Schemas
 * Source: AI_ORCHESTRATION_SPECIFICATION_Career_Quest_v1.1_PERFECT.md §15-§16
 */

import { z } from "zod";

export const AiPhaseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  sequence: z.number().int().min(1),
  estimatedMinWeeks: z.number().int().min(0).optional(),
  estimatedMaxWeeks: z.number().int().min(0).optional(),
});

export const AiNodeSchema = z.object({
  id: z.string().min(1),
  skillId: z.string().optional(),
  type: z.enum(["SKILL", "PROJECT", "MILESTONE", "INTERVIEW", "EXPERIENCE"]).default("SKILL"),
  title: z.string().min(1),
  description: z.string().optional(),
  requiredProficiency: z.number().int().min(0).max(5).default(3),
  estimatedHours: z.number().min(0).default(10),
  phaseId: z.string().min(1),
  priority: z.number().int().min(1).max(5).default(1),
  rationale: z.string().optional(),
});

export const AiEdgeSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  type: z.enum(["PREREQUISITE", "UNLOCKS", "RECOMMENDED"]).default("PREREQUISITE"),
  required: z.boolean().default(true),
});

export const AiRoadmapCandidateSchema = z.object({
  targetRole: z.string().min(1),
  summary: z.string().optional(),
  phases: z.array(AiPhaseSchema).min(1),
  nodes: z.array(AiNodeSchema).min(1),
  edges: z.array(AiEdgeSchema),
});

export type AiRoadmapCandidate = z.infer<typeof AiRoadmapCandidateSchema>;
export type AiNode = z.infer<typeof AiNodeSchema>;
export type AiPhase = z.infer<typeof AiPhaseSchema>;
export type AiEdge = z.infer<typeof AiEdgeSchema>;

export const AiQuestTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  sequence: z.number().int().min(1),
  estimatedMinutes: z.number().int().min(0).optional(),
});

export const AiQuestCandidateSchema = z.object({
  title: z.string().min(1),
  objective: z.string().min(1),
  estimatedHours: z.number().min(1),
  tasks: z.array(AiQuestTaskSchema).min(1),
  githubIdea: z.string().optional(),
  interviewQuestions: z.array(z.string()).optional(),
});

export type AiQuestCandidate = z.infer<typeof AiQuestCandidateSchema>;

export const AiAssistantProposalSchema = z.object({
  proposalType: z.enum([
    "UPDATE_PROFICIENCY",
    "ADD_SKILL",
    "REMOVE_SKILL",
    "REORDER_PATH",
    "CHANGE_CONSTRAINT",
    "REGENERATE_ROADMAP",
  ]),
  payload: z.record(z.unknown()),
  explanation: z.string().min(1),
});

export type AiAssistantProposal = z.infer<typeof AiAssistantProposalSchema>;
