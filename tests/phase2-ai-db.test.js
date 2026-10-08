/**
 * Career Quest — Phase 2 Verification Suite
 * Verifies Prisma Schema, Database Client Guard, Mock AI Provider,
 * and 4-Layer AI Roadmap Validation Pipeline integrated with Phase 1 Graph Engine.
 * Source: TESTING_AND_QUALITY_STRATEGY_Career_Quest_v1.2_FINAL_SAFE.md §4, §6
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  getDbConfig,
  assertSafeEnvironmentForDestructiveOp,
  SEED_SKILLS,
  DEMO_USER,
} from "../src/lib/db/index.ts";
import {
  MockAIProvider,
  AiRoadmapCandidateSchema,
  AiQuestCandidateSchema,
  validateAndMaterializeAiRoadmap,
} from "../src/lib/ai/index.ts";

describe("Career Quest — Phase 2 (Database Schema & AI Orchestration)", () => {
  describe("1. Prisma Schema & Relational Model Integrity", () => {
    it("should have authoritative schema.prisma defining all core entities", () => {
      const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
      assert.ok(fs.existsSync(schemaPath), "prisma/schema.prisma must exist");

      const content = fs.readFileSync(schemaPath, "utf-8");

      // Verify core entities from DATABASE_SCHEMA_Career_Quest_v1.1_PERFECT.md
      const requiredModels = [
        "model User",
        "model CareerProfile",
        "model Skill",
        "model UserSkill",
        "model SkillStateHistory",
        "model Roadmap",
        "model RoadmapGeneration",
        "model RoadmapPhase",
        "model RoadmapNode",
        "model RoadmapNodeSkillSnapshot",
        "model RoadmapNodeDependency",
        "model RoadmapTimeline",
        "model RoadmapPhaseTimeline",
        "model NextBestAction",
        "model Quest",
        "model QuestTask",
        "model Evidence",
        "model ProficiencyAssessment",
        "model RoadmapChangeEvent",
        "model AssistantConversation",
        "model AssistantMessage",
        "model AssistantProposal",
      ];

      for (const model of requiredModels) {
        assert.ok(
          content.includes(model),
          `Prisma schema must define model: ${model}`
        );
      }
    });

    it("should define explicit unique constraints for revision and idempotency", () => {
      const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
      const content = fs.readFileSync(schemaPath, "utf-8");

      assert.ok(content.includes("@@unique([userId, skillId])"));
      assert.ok(content.includes("@@unique([userId, version])"));
      assert.ok(content.includes("@@unique([roadmapId, sequence])"));
      assert.ok(content.includes("@@unique([prerequisiteNodeId, dependentNodeId])"));
      assert.ok(content.includes("idempotencyKey      String    @unique"));
    });
  });

  describe("2. Database Client Safety Guard & Seed Fixtures", () => {
    it("should fail closed on destructive operations in production environment", () => {
      const originalNodeEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = "production";
        assert.throws(
          () => assertSafeEnvironmentForDestructiveOp("reset_all_tables"),
          /CRITICAL_SAFETY_VIOLATION/
        );
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });

    it("should have comprehensive skill catalog fixtures", () => {
      assert.ok(SEED_SKILLS.length >= 7, "Catalog should have at least 7 foundational skills");
      const jsSkill = SEED_SKILLS.find((s) => s.slug === "javascript");
      const reactSkill = SEED_SKILLS.find((s) => s.slug === "react");
      assert.ok(jsSkill);
      assert.ok(reactSkill);
      assert.equal(DEMO_USER.email, "demo@careerquest.dev");
    });
  });

  describe("3. AI Output Schemas (Zod Runtime Validation)", () => {
    it("should validate a complete candidate roadmap", () => {
      const provider = new MockAIProvider();
      const sample = provider.buildSampleRoadmap("Full Stack Developer");

      const parsed = AiRoadmapCandidateSchema.safeParse(sample);
      assert.equal(parsed.success, true);
      assert.equal(parsed.data?.targetRole, "Full Stack Developer");
      assert.ok(parsed.data?.nodes.length > 0);
    });

    it("should reject candidate with negative estimated hours", () => {
      const provider = new MockAIProvider();
      const sample = provider.buildSampleRoadmap();
      // Inject negative hours
      sample.nodes[0].estimatedHours = -5;

      const parsed = AiRoadmapCandidateSchema.safeParse(sample);
      assert.equal(parsed.success, false);
    });

    it("should validate quest candidate schema", () => {
      const provider = new MockAIProvider();
      const quest = provider.buildSampleQuest("React Hooks");

      const parsed = AiQuestCandidateSchema.safeParse(quest);
      assert.equal(parsed.success, true);
      assert.ok(parsed.data?.tasks.length >= 2);
    });
  });

  describe("4. MockAIProvider Determinism", () => {
    it("should generate deterministic structured output for roadmap generation", async () => {
      const provider = new MockAIProvider();

      const result = await provider.generateStructured({
        operation: "ROADMAP_GENERATION",
        systemPrompt: "You are a career decomposition engine.",
        userPrompt: "Target: Full Stack Developer",
        schema: AiRoadmapCandidateSchema,
        context: { targetRole: "Full Stack Developer" },
      });

      assert.equal(result.modelProvider, "mock-provider");
      assert.equal(result.data.targetRole, "Full Stack Developer");
      assert.ok(result.data.nodes.some((n) => n.id === "javascript"));
      assert.ok(result.data.nodes.some((n) => n.id === "react"));
    });
  });

  describe("5. 4-Layer AI Roadmap Validation & Graph Engine Integration", () => {
    it("should pass all 4 layers and evaluate active runtime graph through Graph Engine", () => {
      const provider = new MockAIProvider();
      const candidate = provider.buildSampleRoadmap("Full Stack Developer");

      const result = validateAndMaterializeAiRoadmap(candidate, 15);

      assert.equal(result.isValid, true);
      assert.equal(result.errors.length, 0);
      assert.ok(result.evaluated);

      // Verify that the Graph Engine computed authoritative node statuses:
      // Roots should be AVAILABLE; downstream nodes should be LOCKED
      const nodes = result.evaluated.graph.nodes;
      const js = nodes.find((n) => n.id === "javascript");
      const git = nodes.find((n) => n.id === "git");
      const sql = nodes.find((n) => n.id === "sql");
      const react = nodes.find((n) => n.id === "react");
      const capstone = nodes.find((n) => n.id === "capstone-project");

      assert.equal(js?.status, "AVAILABLE");
      assert.equal(git?.status, "AVAILABLE");
      assert.equal(sql?.status, "AVAILABLE");
      assert.equal(react?.status, "LOCKED");
      assert.equal(capstone?.status, "LOCKED");

      // Verify that Next Best Action was selected deterministically by Graph Engine
      assert.ok(result.evaluated.nextBestAction);
      assert.ok(result.evaluated.nextBestAction.nodeId);

      // Verify timeline metrics calculated
      assert.ok(result.evaluated.timeline.totalEstimatedHours > 0);
      assert.ok(result.evaluated.timeline.minWeeks > 0);
    });

    it("should reject candidate referencing a non-existent phaseId (Semantic Error)", () => {
      const provider = new MockAIProvider();
      const candidate = provider.buildSampleRoadmap();
      // Point node to non-existent phase
      candidate.nodes[0].phaseId = "non-existent-phase-999";

      const result = validateAndMaterializeAiRoadmap(candidate);

      assert.equal(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes("references non-existent phase")));
    });

    it("should reject candidate with cyclic dependencies (Graph DAG Error)", () => {
      const provider = new MockAIProvider();
      const candidate = provider.buildSampleRoadmap();
      // Introduce cycle: react -> javascript (while javascript -> react already exists)
      candidate.edges.push({
        source: "react",
        target: "javascript",
        type: "PREREQUISITE",
        required: true,
      });

      const result = validateAndMaterializeAiRoadmap(candidate);

      assert.equal(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes("CYCLE")));
    });
  });
});
