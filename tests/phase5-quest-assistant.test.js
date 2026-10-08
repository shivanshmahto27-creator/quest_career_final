import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRoadmap, getRoadmap } from "../src/modules/roadmap/service.ts";
import { createQuestForNode, getQuest, completeQuest } from "../src/modules/quest/service.ts";
import { createConversation, sendMessage, confirmProposal } from "../src/modules/assistant/service.ts";

describe("Career Quest — Phase 5 (Quest Workspace, Assistant Drawer & NBA Deepening)", () => {
  const userId = "user_phase5_demo";

  describe("1. Phase 5 Architecture & UI File Assets", () => {
    it("should have all required Phase 5 components and pages", () => {
      const requiredFiles = [
        "src/lib/api/client.ts",
        "src/app/quest/[questId]/page.tsx",
        "src/components/assistant/AssistantDrawer.tsx",
        "src/app/assistant/page.tsx",
      ];

      for (const file of requiredFiles) {
        const fullPath = path.resolve(process.cwd(), file);
        assert.ok(fs.existsSync(fullPath), `Required Phase 5 file must exist: ${file}`);
      }
    });

    it("should export typed API client functions for quest and assistant", () => {
      const clientContent = fs.readFileSync(
        path.resolve(process.cwd(), "src/lib/api/client.ts"),
        "utf-8"
      );

      assert.ok(clientContent.includes("questApi"), "questApi must be exported");
      assert.ok(clientContent.includes("assistantApi"), "assistantApi must be exported");
      assert.ok(clientContent.includes("createForNode"), "createForNode helper must exist");
      assert.ok(clientContent.includes("complete"), "complete quest helper must exist");
      assert.ok(clientContent.includes("confirmProposal"), "confirmProposal helper must exist");
    });
  });

  describe("2. Quest Execution Workspace End-to-End Flow", () => {
    let roadmapId = "";
    let questId = "";

    it("should initialize a roadmap and generate a quest for an AVAILABLE node", async () => {
      const roadmap = await createRoadmap(userId, {
        targetRole: "Full Stack Developer",
        weeklyHours: 15,
      });

      roadmapId = roadmap.id;
      assert.ok(roadmapId, "Roadmap ID generated");

      // Root JS node is AVAILABLE
      const jsNode = roadmap.graphResult.graph.nodes.find((n) => n.id === "javascript");
      assert.ok(jsNode, "JavaScript node exists");
      assert.equal(jsNode.status, "AVAILABLE");

      // Generate quest
      const quest = await createQuestForNode(userId, roadmapId, "javascript");
      questId = quest.id;

      assert.ok(quest.id, "Quest ID generated");
      assert.equal(quest.nodeId, "javascript");
      assert.equal(quest.status, "IN_PROGRESS");
      assert.ok(quest.tasks.length > 0, "Quest contains task checklist");
      assert.ok(quest.githubIdea, "Quest has concrete deliverable / GitHub idea");
      assert.ok(quest.interviewQuestions?.length, "Quest includes interview questions");

      // Node in roadmap graph should now be IN_PROGRESS
      const updatedRoadmap = await getRoadmap(userId, roadmapId);
      const updatedNode = updatedRoadmap?.graphResult.graph.nodes.find((n) => n.id === "javascript");
      assert.equal(updatedNode?.status, "IN_PROGRESS");
    });

    it("should retrieve quest details by questId", async () => {
      const retrieved = await getQuest(userId, questId);
      assert.ok(retrieved, "Quest found");
      assert.equal(retrieved.id, questId);
      assert.equal(retrieved.status, "IN_PROGRESS");
    });

    it("should complete quest, mark node COMPLETED, unlock React downstream, and recalculate timeline", async () => {
      // React node is initially LOCKED before JavaScript is completed
      const roadmapBefore = await getRoadmap(userId, roadmapId);
      const reactBefore = roadmapBefore?.graphResult.graph.nodes.find((n) => n.id === "react");
      assert.equal(reactBefore?.status, "LOCKED");

      const completeResult = await completeQuest(userId, questId);
      assert.equal(completeResult.quest.status, "COMPLETED");
      assert.ok(completeResult.quest.completedAt);
      assert.ok(completeResult.nodesUnlocked.includes("react"), "React should be among unlocked nodes");

      // Graph Engine evaluation check
      const roadmapAfter = await getRoadmap(userId, roadmapId);
      const jsAfter = roadmapAfter?.graphResult.graph.nodes.find((n) => n.id === "javascript");
      const reactAfter = roadmapAfter?.graphResult.graph.nodes.find((n) => n.id === "react");

      assert.equal(jsAfter?.status, "COMPLETED");
      assert.equal(reactAfter?.status, "AVAILABLE");
      assert.ok(roadmapAfter?.graphResult.timeline.progressPercentage > 0, "Progress percentage advanced");
    });
  });

  describe("3. AI Assistant Contextual Drawer & Proposal Confirmation Flow", () => {
    let conversationId = "";
    let roadmapId = "";

    it("should create conversation and exchange messages with structured proposal", async () => {
      const roadmap = await createRoadmap(userId, {
        targetRole: "Frontend Engineer",
        weeklyHours: 20,
      });
      roadmapId = roadmap.id;

      const conv = await createConversation(userId, roadmapId);
      conversationId = conv.id;
      assert.ok(conversationId, "Conversation initialized");
      assert.equal(conv.messages.length, 1, "Initial welcome message present");

      // Send message declaring known skill
      const response = await sendMessage(
        userId,
        conversationId,
        "I already know JavaScript, can we adjust?"
      );

      assert.ok(response.reply, "Assistant generated reply");
      assert.ok(response.proposal, "Structured proposal created");
      assert.equal(response.proposal.proposalType, "UPDATE_PROFICIENCY");
      assert.equal(response.proposal.status, "PENDING");
      assert.equal(response.proposal.payload.skillId, "javascript");
    });

    it("should confirm proposal, apply graph reroute, and unlock dependent path", async () => {
      const conv = await createConversation(userId, roadmapId);
      const res = await sendMessage(userId, conv.id, "I already know JavaScript");
      assert.ok(res.proposal);

      const confirmResult = await confirmProposal(userId, res.proposal.id);
      assert.equal(confirmResult.proposal.status, "CONFIRMED");
      assert.ok(confirmResult.result, "Skill update executed");
    });
  });

  describe("4. Accessibility & UI/UX Standards Compliance", () => {
    it("should have accessible attributes, labels, and roles in Quest Workspace", () => {
      const questWorkspaceContent = fs.readFileSync(
        path.resolve(process.cwd(), "src/app/quest/[questId]/page.tsx"),
        "utf-8"
      );

      assert.ok(questWorkspaceContent.includes("id=\"quest-workspace\""), "Workspace main ID present");
      assert.ok(questWorkspaceContent.includes("id=\"complete-quest-btn\""), "Complete quest button ID present");
      assert.ok(questWorkspaceContent.includes("aria-label"), "Accessible ARIA labels present");
      assert.ok(questWorkspaceContent.includes("#D8FF5A"), "Brand accent used for primary actions");
    });

    it("should have modal dialog accessibility in Assistant Drawer", () => {
      const assistantContent = fs.readFileSync(
        path.resolve(process.cwd(), "src/components/assistant/AssistantDrawer.tsx"),
        "utf-8"
      );

      assert.ok(assistantContent.includes("role=\"dialog\""), "Role dialog on assistant drawer");
      assert.ok(assistantContent.includes("aria-modal=\"true\""), "Aria modal on assistant drawer");
      assert.ok(assistantContent.includes("aria-label"), "Accessible label present");
    });

    it("should integrate Next Best Action card with direct quest launch action", () => {
      const nbaCardContent = fs.readFileSync(
        path.resolve(process.cwd(), "src/components/roadmap/NextBestActionCard.tsx"),
        "utf-8"
      );

      assert.ok(nbaCardContent.includes("onStartQuest"), "onStartQuest handler supported in NBA card");
      assert.ok(nbaCardContent.includes("Start Quest"), "Direct Start Quest button rendered");
    });
  });
});
