/**
 * Career Quest — Phase 4 Verification Suite (Frontend Shell & Graph Canvas)
 * Verifies Layout, Design Tokens, Accessibility Rules, React Flow Components,
 * and Onboarding → Graph State Flow.
 * Source: FRONTEND_ARCHITECTURE_SPECIFICATION §7-§14, UI_UX_Career_Quest_v2.0.md §5-§8
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { createRoadmap, getRoadmap } from "../src/modules/roadmap/service.ts";
import { updateUserSkill } from "../src/modules/skill/service.ts";

describe("Career Quest — Phase 4 (Frontend Shell, Onboarding & Graph Canvas)", () => {
  describe("1. Route Architecture & File Structure Integrity", () => {
    it("should have all required Phase 4 pages and layouts", () => {
      const requiredFiles = [
        "src/app/layout.tsx",
        "src/app/page.tsx",
        "src/app/onboarding/page.tsx",
        "src/app/roadmap/page.tsx",
        "src/app/globals.css",
        "tailwind.config.ts",
      ];

      for (const relPath of requiredFiles) {
        const fullPath = path.resolve(process.cwd(), relPath);
        assert.ok(fs.existsSync(fullPath), `Expected file must exist: ${relPath}`);
      }
    });

    it("should have required UI layout components", () => {
      const components = [
        "src/components/layout/Navbar.tsx",
        "src/components/layout/LeftProgressionRail.tsx",
        "src/components/graph/SkillNode.tsx",
        "src/components/graph/GraphCanvas.tsx",
        "src/components/roadmap/RoadmapHeader.tsx",
        "src/components/roadmap/NextBestActionCard.tsx",
        "src/components/roadmap/NodeDetailPanel.tsx",
      ];

      for (const comp of components) {
        const fullPath = path.resolve(process.cwd(), comp);
        assert.ok(fs.existsSync(fullPath), `Component must exist: ${comp}`);
      }
    });
  });

  describe("2. Design Tokens, Accessibility & Reduced Motion", () => {
    it("should configure UI/UX v2.0 color palette in tailwind.config.ts", () => {
      const tailwindConfig = fs.readFileSync(path.resolve(process.cwd(), "tailwind.config.ts"), "utf-8");

      assert.ok(tailwindConfig.includes("#050607"), "Canvas background #050607");
      assert.ok(tailwindConfig.includes("#0B0D0F"), "Surface background #0B0D0F");
      assert.ok(tailwindConfig.includes("#D8FF5A"), "Brand accent #D8FF5A");
      assert.ok(tailwindConfig.includes("#1B1E21"), "Default border #1B1E21");
    });

    it("should implement reduced-motion and visible focus rules in globals.css", () => {
      const css = fs.readFileSync(path.resolve(process.cwd(), "src/app/globals.css"), "utf-8");

      assert.ok(css.includes("prefers-reduced-motion"), "Reduced motion CSS query must exist");
      assert.ok(css.includes(":focus-visible"), "Accessible focus indicator must exist");
      assert.ok(css.includes("#D8FF5A"), "Focus ring must use brand accent");
    });

    it("should implement 6 canonical progression steps in LeftProgressionRail.tsx", () => {
      const rail = fs.readFileSync(path.resolve(process.cwd(), "src/components/layout/LeftProgressionRail.tsx"), "utf-8");

      const expectedLabels = ["TARGET", "CURRENT", "GAP", "ROADMAP", "QUEST", "PROGRESS"];
      for (const label of expectedLabels) {
        assert.ok(rail.includes(label), `Progression rail must include step: ${label}`);
      }
    });
  });

  describe("3. Interactive Flow: Onboarding Generation to Graph State", () => {
    it("should simulate onboarding submission and produce active graph ready for canvas", async () => {
      const testUserId = "user_p4_test";
      const created = await createRoadmap(testUserId, {
        targetRole: "Full Stack Developer",
        weeklyHours: 20,
        currentSkills: [{ skillId: "git", proficiency: 2 }],
      });

      assert.ok(created.id);
      assert.equal(created.targetRole, "Full Stack Developer");

      // Verify Graph Engine initial calculation:
      const nodes = created.graphResult.graph.nodes;
      const jsNode = nodes.find((n) => n.id === "javascript");
      const reactNode = nodes.find((n) => n.id === "react");

      assert.equal(jsNode?.status, "AVAILABLE");
      assert.equal(reactNode?.status, "LOCKED");

      // Verify Next Best Action is populated for frontend hero card
      assert.ok(created.graphResult.nextBestAction);
      assert.ok(created.graphResult.nextBestAction.title);

      // Verify timeline metrics
      assert.ok(created.graphResult.timeline.remainingHours > 0);
      assert.ok(created.graphResult.timeline.minWeeks > 0);
    });

    it("should simulate 'I Already Know This' action updating graph state and unlocking React", async () => {
      const testUserId = "user_p4_test";
      const active = await getRoadmap(testUserId);
      assert.ok(active);

      // User marks JavaScript as known
      const updateResult = await updateUserSkill(testUserId, "javascript", 3, "ALREADY_KNOWN");

      assert.equal(updateResult.roadmapImpact.roadmapChanged, true);
      assert.ok(updateResult.roadmapImpact.nodesUnlocked >= 1);

      // Re-fetch roadmap and verify React is now AVAILABLE for React Flow canvas
      const updated = await getRoadmap(testUserId);
      assert.ok(updated);

      const react = updated.graphResult.graph.nodes.find((n) => n.id === "react");
      assert.equal(react?.status, "AVAILABLE");
      assert.deepEqual(react?.blockedBy, []);
    });
  });
});
