/**
 * Career Quest — Mock AI Provider
 * Deterministic AI Provider for local development, hackathon testing, and test environments.
 * Source: AI_ORCHESTRATION_SPECIFICATION §5, TESTING_AND_QUALITY_STRATEGY §4
 */

import type {
  AIProvider,
  StructuredGenerationRequest,
  StructuredGenerationResult,
  TextGenerationRequest,
  TextGenerationResult,
} from "./types.ts";
import type { AiRoadmapCandidate, AiQuestCandidate } from "./schemas.ts";

export class MockAIProvider implements AIProvider {
  name = "MockAIProvider";

  async generateStructured<T>(
    request: StructuredGenerationRequest<T>
  ): Promise<StructuredGenerationResult<T>> {
    const rawData = this.resolveMockData(request);
    const validated = request.schema.parse(rawData);

    return {
      data: validated,
      rawText: JSON.stringify(validated, null, 2),
      modelProvider: "mock-provider",
      modelName: "mock-career-quest-v1",
      usage: {
        promptTokens: 120,
        completionTokens: 350,
        totalTokens: 470,
      },
    };
  }

  async generateText(request: TextGenerationRequest): Promise<TextGenerationResult> {
    return {
      text: `Based on your profile, here is the guidance for your career quest: Focus on completing foundational prerequisites before attempting advanced projects.`,
      modelProvider: "mock-provider",
      modelName: "mock-career-quest-v1",
    };
  }

  private resolveMockData(request: StructuredGenerationRequest<unknown>): unknown {
    if (request.operation === "ROADMAP_GENERATION" || request.operation === "ROADMAP_REGENERATION") {
      return this.buildSampleRoadmap(request.context?.targetRole as string);
    }

    if (request.operation === "QUEST_GENERATION") {
      return this.buildSampleQuest(request.context?.nodeTitle as string);
    }

    if (request.operation === "ASSISTANT_RESPONSE") {
      return {
        proposalType: "UPDATE_PROFICIENCY",
        payload: { skillId: "javascript", proficiency: 3 },
        explanation: "Based on your completed quiz, you have demonstrated proficient JavaScript knowledge.",
      };
    }

    throw new Error(`[MockAIProvider] Unsupported operation: ${request.operation}`);
  }

  /**
   * Generates a realistic, deterministic candidate roadmap.
   */
  public buildSampleRoadmap(roleName: string = "Full Stack Developer"): AiRoadmapCandidate {
    return {
      targetRole: roleName,
      summary: `Structured reverse-engineered career roadmap for ${roleName}.`,
      phases: [
        {
          id: "phase-1",
          name: "Phase 1: Foundations",
          description: "Core programming languages and web fundamentals.",
          sequence: 1,
          estimatedMinWeeks: 3,
          estimatedMaxWeeks: 5,
        },
        {
          id: "phase-2",
          name: "Phase 2: Core Engineering",
          description: "Component frameworks, backend APIs, and persistence.",
          sequence: 2,
          estimatedMinWeeks: 4,
          estimatedMaxWeeks: 6,
        },
        {
          id: "phase-3",
          name: "Phase 3: Production & Specialization",
          description: "Full-stack integration, deployments, and portfolio project.",
          sequence: 3,
          estimatedMinWeeks: 3,
          estimatedMaxWeeks: 5,
        },
      ],
      nodes: [
        {
          id: "javascript",
          skillId: "skill-javascript",
          type: "SKILL",
          title: "JavaScript Fundamentals",
          description: "Async patterns, ES6+, closures, and browser APIs.",
          requiredProficiency: 3,
          estimatedHours: 15,
          phaseId: "phase-1",
          priority: 1,
          rationale: "Essential language prerequisite for all full stack web development.",
        },
        {
          id: "git",
          skillId: "skill-git",
          type: "SKILL",
          title: "Git & Version Control",
          description: "Branching, rebasing, pull requests, and commit hygiene.",
          requiredProficiency: 2,
          estimatedHours: 8,
          phaseId: "phase-1",
          priority: 2,
          rationale: "Required foundation for collaborative engineering.",
        },
        {
          id: "react",
          skillId: "skill-react",
          type: "SKILL",
          title: "React & Component Architecture",
          description: "Hooks, component composition, state management, and lifecycle.",
          requiredProficiency: 3,
          estimatedHours: 25,
          phaseId: "phase-2",
          priority: 1,
          rationale: "Core frontend library for target modern web systems.",
        },
        {
          id: "nodejs",
          skillId: "skill-nodejs",
          type: "SKILL",
          title: "Node.js & Backend Architecture",
          description: "Express/Fastify, RESTful services, and server runtimes.",
          requiredProficiency: 3,
          estimatedHours: 20,
          phaseId: "phase-2",
          priority: 2,
          rationale: "Core backend framework for JavaScript services.",
        },
        {
          id: "sql",
          skillId: "skill-sql",
          type: "SKILL",
          title: "SQL & Relational Databases",
          description: "PostgreSQL, indexing, transactions, and schema design.",
          requiredProficiency: 3,
          estimatedHours: 15,
          phaseId: "phase-2",
          priority: 2,
          rationale: "Durable persistence layer for web applications.",
        },
        {
          id: "capstone-project",
          type: "PROJECT",
          title: "Full Stack Capstone System",
          description: "Production-ready deployed web app with auth, database, and CI/CD.",
          requiredProficiency: 3,
          estimatedHours: 35,
          phaseId: "phase-3",
          priority: 1,
          rationale: "Definitive evidence of target role capability.",
        },
      ],
      edges: [
        {
          source: "javascript",
          target: "react",
          type: "PREREQUISITE",
          required: true,
        },
        {
          source: "javascript",
          target: "nodejs",
          type: "PREREQUISITE",
          required: true,
        },
        {
          source: "react",
          target: "capstone-project",
          type: "PREREQUISITE",
          required: true,
        },
        {
          source: "nodejs",
          target: "capstone-project",
          type: "PREREQUISITE",
          required: true,
        },
        {
          source: "sql",
          target: "capstone-project",
          type: "PREREQUISITE",
          required: true,
        },
        {
          source: "git",
          target: "capstone-project",
          type: "RECOMMENDED",
          required: false,
        },
      ],
    };
  }

  public buildSampleQuest(nodeTitle: string = "JavaScript Fundamentals"): AiQuestCandidate {
    return {
      title: `Quest: Master ${nodeTitle}`,
      objective: `Demonstrate hands-on mastery of ${nodeTitle} by completing practical coding challenges.`,
      estimatedHours: 3,
      tasks: [
        {
          title: "Analyze core problem specifications",
          description: "Review requirement constraints and edge cases.",
          sequence: 1,
          estimatedMinutes: 30,
        },
        {
          title: "Implement working solution",
          description: "Write clean, modular code with test coverage.",
          sequence: 2,
          estimatedMinutes: 90,
        },
        {
          title: "Deploy & verify",
          description: "Run automated tests and submit repository link.",
          sequence: 3,
          estimatedMinutes: 60,
        },
      ],
      githubIdea: `Build a mini-utility library testing ${nodeTitle} patterns.`,
      interviewQuestions: [
        `How does ${nodeTitle} behave under high concurrency?`,
        `What are the most common performance bottlenecks in ${nodeTitle}?`,
      ],
    };
  }
}
