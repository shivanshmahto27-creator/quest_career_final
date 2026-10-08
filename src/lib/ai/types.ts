/**
 * Career Quest — AI Orchestration Types & Provider Contract
 * Source: AI_ORCHESTRATION_SPECIFICATION_Career_Quest_v1.1_PERFECT.md §5-§11
 */

import { z } from "zod";

export interface AIModelConfig {
  provider: string;
  model: string;
  temperature?: number;
  maxOutputTokens?: number;
  requestTimeoutMs?: number;
  maxRetries?: number;
}

export interface StructuredGenerationRequest<T> {
  operation: "ROADMAP_GENERATION" | "QUEST_GENERATION" | "ASSISTANT_RESPONSE" | "ROADMAP_REGENERATION";
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodSchema<T>;
  context?: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface StructuredGenerationResult<T> {
  data: T;
  rawText: string;
  modelProvider: string;
  modelName: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface TextGenerationRequest {
  systemPrompt: string;
  userPrompt: string;
  context?: Record<string, unknown>;
}

export interface TextGenerationResult {
  text: string;
  modelProvider: string;
  modelName: string;
}

export interface AIProvider {
  name: string;
  generateStructured<T>(
    request: StructuredGenerationRequest<T>
  ): Promise<StructuredGenerationResult<T>>;
  generateText(request: TextGenerationRequest): Promise<TextGenerationResult>;
}

export interface RoadmapGenerationInput {
  targetRole: string;
  currentSkills?: Array<{
    skillId: string;
    name: string;
    proficiency: number;
  }>;
  weeklyHours: number;
  targetSpecialization?: string;
  targetCompanyType?: string;
  deadline?: string;
  experienceSummary?: string;
}

export interface QuestGenerationInput {
  nodeId: string;
  nodeTitle: string;
  requiredProficiency: number;
  targetRole: string;
  userExperience?: string;
}
