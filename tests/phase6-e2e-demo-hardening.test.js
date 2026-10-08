import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { GET as healthGet } from "../src/app/api/v1/health/route.ts";
import { POST as demoResetPost } from "../src/app/api/v1/demo/reset/route.ts";
import { createRoadmap, getRoadmap } from "../src/modules/roadmap/service.ts";
import { createQuestForNode, getQuest, completeQuest } from "../src/modules/quest/service.ts";
import { createConversation, sendMessage, confirmProposal } from "../src/modules/assistant/service.ts";
import { updateUserSkill } from "../src/modules/skill/service.ts";
import { validateGraphDAG } from "../src/lib/graph/cycle-detector.ts";

describe("Career Quest — Phase 6 (End-to-End Integration, Demo Hardening & Runbook)", () => {
  const demoUserId = "user-demo-001";

  describe("1. System Health & Demo Recovery Endpoints", () => {
    it("GET /api/v1/health should report status ok and version 1.1.0", async () => {
      const res = await healthGet();
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.data.status, "ok");
      assert.equal(body.data.version, "1.1.0");
      assert.ok(body.data.timestamp);
    });

    it("POST /api/v1/demo/reset should restore demo user baseline roadmap", async () => {
      const dummyReq = new Request("http://localhost:3000/api/v1/demo/reset", {
        method: "POST",
      });

      const res = await demoResetPost(dummyReq);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.ok(body.data.roadmap);
      assert.equal(body.data.roadmap.targetRole, "Full Stack Developer");
      assert.ok(body.data.roadmap.graphResult.graph.nodes.length > 0);
    });
  });

  describe("2. Complete 10-Step Judge Demo User Flow", () => {
    let roadmapId = "";
    let questId = "";
    let conversationId = "";

    it("Step 1–3: Initialize Roadmap from Onboarding Inputs", async () => {
      const roadmap = await createRoadmap(demoUserId, {
        targetRole: "Full Stack Developer",
        weeklyHours: 15,
        targetSpecialization: "Modern Web Systems",
        currentSkills: [],
      });

      assert.ok(roadmap.id);
      roadmapId = roadmap.id;
      assert.equal(roadmap.weeklyHours, 15);
      assert.equal(roadmap.targetRole, "Full Stack Developer");
    });

    it("Step 4: Verify Career Graph State (Root AVAILABLE, Downstream LOCKED)", async () => {
      const active = await getRoadmap(demoUserId, roadmapId);
      assert.ok(active);

      const js = active.graphResult.graph.nodes.find((n) => n.id === "javascript");
      const react = active.graphResult.graph.nodes.find((n) => n.id === "react");

      assert.ok(js, "JavaScript node exists in graph");
      assert.ok(react, "React node exists in graph");
      assert.equal(js.status, "AVAILABLE", "Foundational JS must be AVAILABLE");
      assert.equal(react.status, "LOCKED", "Dependent React must be LOCKED initially");
    });

    it("Step 5: Verify Deterministic Next Best Action Hero Card", async () => {
      const active = await getRoadmap(demoUserId, roadmapId);
      const nba = active?.graphResult.nextBestAction;

      assert.ok(nba, "Next Best Action must exist");
      assert.equal(nba.nodeId, "javascript", "NBA prioritizes root JavaScript milestone");
      assert.ok(
        nba.reason.includes("unblocks") ||
          nba.reason.includes("Foundational") ||
          nba.reason.includes("milestone") ||
          nba.reason.includes("lever"),
        "NBA provides clear rationale"
      );
      assert.ok(nba.estimatedHours > 0, "NBA specifies estimated effort");
    });

    it("Step 6–7: Launch Quest Workspace & Validate Deliverable Specs", async () => {
      const quest = await createQuestForNode(demoUserId, roadmapId, "javascript");
      assert.ok(quest.id);
      questId = quest.id;

      assert.equal(quest.status, "IN_PROGRESS");
      assert.ok(quest.tasks.length >= 3, "Quest checklist contains concrete phased tasks");
      assert.ok(quest.githubIdea, "GitHub deliverable idea provided");
      assert.ok(quest.interviewQuestions && quest.interviewQuestions.length >= 2, "Technical screening questions provided");

      // Roadmap node must transition to IN_PROGRESS
      const active = await getRoadmap(demoUserId, roadmapId);
      const js = active?.graphResult.graph.nodes.find((n) => n.id === "javascript");
      assert.equal(js?.status, "IN_PROGRESS");
    });

    it("Step 8: Complete Quest, Verify Evidence & Downstream Unlocks", async () => {
      const completion = await completeQuest(demoUserId, questId);
      assert.equal(completion.quest.status, "COMPLETED");
      assert.ok(completion.nodesUnlocked.includes("react"), "React milestone unlocked upon JS quest completion");

      const active = await getRoadmap(demoUserId, roadmapId);
      const js = active?.graphResult.graph.nodes.find((n) => n.id === "javascript");
      const react = active?.graphResult.graph.nodes.find((n) => n.id === "react");

      assert.equal(js?.status, "COMPLETED");
      assert.equal(react?.status, "AVAILABLE");
      assert.ok(active?.graphResult.timeline.progressPercentage > 0, "Timeline progress increased");
    });

    it("Step 9–10: AI Assistant Conversation & Proposal Confirmation", async () => {
      const conv = await createConversation(demoUserId, roadmapId);
      conversationId = conv.id;

      const reply = await sendMessage(
        demoUserId,
        conversationId,
        "I already know Git & Version Control"
      );

      assert.ok(reply.reply);

      // Trigger proposal via explicit skill declaration
      const propReply = await sendMessage(
        demoUserId,
        conversationId,
        "I already know javascript"
      );
      assert.ok(propReply.proposal);
      assert.equal(propReply.proposal.status, "PENDING");

      const confirmed = await confirmProposal(demoUserId, propReply.proposal.id);
      assert.equal(confirmed.proposal.status, "CONFIRMED");
    });
  });

  describe("3. Error Handling, Edge Cases & Robustness", () => {
    it("should reject creating a quest for a LOCKED node", async () => {
      const roadmap = await createRoadmap(demoUserId, {
        targetRole: "Full Stack Developer",
        weeklyHours: 10,
        currentSkills: [],
      });

      // Node 'react' is locked initially
      await assert.rejects(
        async () => {
          await createQuestForNode(demoUserId, roadmap.id, "react");
        },
        /LOCKED/
      );
    });

    it("should reject invalid graph with circular dependency in Graph Engine", () => {
      const cyclicNodes = [
        { id: "A", skillId: "s1", type: "SKILL", title: "A", requiredProficiency: 1, estimatedHours: 5, phaseId: "p1", priority: 1, status: "AVAILABLE" },
        { id: "B", skillId: "s2", type: "SKILL", title: "B", requiredProficiency: 1, estimatedHours: 5, phaseId: "p1", priority: 1, status: "LOCKED" },
      ];
      const cyclicEdges = [
        { id: "e1", sourceNodeId: "A", targetNodeId: "B", type: "REQUIRES", required: true, requiredProficiency: 1 },
        { id: "e2", sourceNodeId: "B", targetNodeId: "A", type: "REQUIRES", required: true, requiredProficiency: 1 },
      ];

      const validation = validateGraphDAG(cyclicNodes, cyclicEdges);
      assert.equal(validation.isValid, false);
      assert.ok(validation.issues.some((i) => i.type === "CYCLE"));
    });

    it("should reject concurrent skill updates with stale revision (409 Conflict check)", async () => {
      const updateResult = await updateUserSkill(demoUserId, "skill-git", 2, "ALREADY_KNOWN");
      assert.ok(updateResult);

      // Attempting to update with stale revision should throw or reject
      await assert.rejects(
        async () => {
          await updateUserSkill(demoUserId, "skill-git", 3, "ALREADY_KNOWN", -1);
        },
        /CONFLICT/i
      );
    });
  });

  describe("4. Documentation & Hackathon Artifact Integrity", () => {
    it("README.md must exist and contain mandatory hackathon sections", () => {
      const readmePath = path.resolve(process.cwd(), "README.md");
      assert.ok(fs.existsSync(readmePath), "README.md must exist in root");

      const readme = fs.readFileSync(readmePath, "utf-8");
      assert.ok(readme.includes("What It Does"), "Must contain What It Does section");
      assert.ok(readme.includes("Technology Stack"), "Must contain Tech Stack section");
      assert.ok(readme.includes("How to Run Locally"), "Must contain How to Run Locally section");
      assert.ok(readme.includes("Automated Quality Gates"), "Must contain Quality Gates section");
      assert.ok(readme.includes("Judge Demo Walkthrough"), "Must contain Demo Walkthrough section");
    });
  });
});
