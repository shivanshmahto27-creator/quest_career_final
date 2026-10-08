/**
 * Career Quest — Phase 3 Verification Suite (Backend Modules & REST APIs)
 * Tests Route Handlers, Feature Services, Skill Rerouting, Quest Lifecycle,
 * and Assistant Proposal Workflows.
 * Source: API_SPECIFICATION §12-§29, BACKEND_ARCHITECTURE_SPECIFICATION §6-§10
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { GET as getProfile, PATCH as patchProfile } from "../src/app/api/v1/profile/route.ts";
import { GET as getSkills } from "../src/app/api/v1/skills/route.ts";
import { GET as getSingleSkill } from "../src/app/api/v1/skills/[skillId]/route.ts";
import { GET as getUserSkills } from "../src/app/api/v1/me/skills/route.ts";
import { PATCH as patchUserSkill } from "../src/app/api/v1/me/skills/[skillId]/route.ts";
import { POST as postRoadmap, GET as getActiveRoadmap } from "../src/app/api/v1/roadmap/route.ts";
import { GET as getRoadmapById } from "../src/app/api/v1/roadmap/[roadmapId]/route.ts";
import { POST as postQuest } from "../src/app/api/v1/roadmap/[roadmapId]/nodes/[nodeId]/quest/route.ts";
import { GET as getQuestById } from "../src/app/api/v1/quests/[questId]/route.ts";
import { POST as completeQuestRoute } from "../src/app/api/v1/quests/[questId]/complete/route.ts";
import { POST as postConversation } from "../src/app/api/v1/assistant/conversations/route.ts";
import { POST as postMessage } from "../src/app/api/v1/assistant/conversations/[conversationId]/messages/route.ts";
import { POST as confirmProposalRoute } from "../src/app/api/v1/assistant/proposals/[proposalId]/confirm/route.ts";

describe("Career Quest — Phase 3 (Feature Modules & REST APIs)", () => {
  let createdRoadmapId = "";
  let createdQuestId = "";

  describe("1. Profile API", () => {
    it("GET /api/v1/profile should return current profile in standard envelope", async () => {
      const res = await getProfile(new Request("http://localhost:3000/api/v1/profile"));
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.ok(json.data);
      assert.ok(json.meta?.requestId);
      assert.equal(json.data.targetRole, "Full Stack Developer");
    });

    it("PATCH /api/v1/profile should update profile and flag requiresRegeneration", async () => {
      const req = new Request("http://localhost:3000/api/v1/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeklyHours: 20 }),
      });
      const res = await patchProfile(req);
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.equal(json.data.profile.weeklyHours, 20);
      assert.equal(json.data.roadmapImpact.requiresRegeneration, true);
    });
  });

  describe("2. Skills Catalog API", () => {
    it("GET /api/v1/skills should return full list of canonical skills", async () => {
      const res = await getSkills(new Request("http://localhost:3000/api/v1/skills"));
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.ok(Array.isArray(json.data));
      assert.ok(json.data.length >= 7);
    });

    it("GET /api/v1/skills?q=react should filter skills catalog", async () => {
      const res = await getSkills(new Request("http://localhost:3000/api/v1/skills?q=react"));
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.ok(json.data.some((s) => s.slug === "react"));
    });

    it("GET /api/v1/skills/:skillId should return metadata for existing skill", async () => {
      const res = await getSingleSkill(new Request("http://localhost:3000/api/v1/skills/javascript"), {
        params: Promise.resolve({ skillId: "javascript" }),
      });
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.equal(json.data.slug, "javascript");
    });
  });

  describe("3. Roadmap Generation & Read API", () => {
    it("POST /api/v1/roadmap should generate a new active roadmap (201 Created)", async () => {
      const req = new Request("http://localhost:3000/api/v1/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: "Full Stack Developer",
          weeklyHours: 15,
        }),
      });

      const res = await postRoadmap(req);
      assert.equal(res.status, 201);

      const json = await res.json();
      assert.ok(json.data.id);
      createdRoadmapId = json.data.id;

      // Verify Graph Engine initialized node statuses
      const nodes = json.data.graphResult.graph.nodes;
      const js = nodes.find((n) => n.id === "javascript");
      const react = nodes.find((n) => n.id === "react");

      assert.equal(js.status, "AVAILABLE");
      assert.equal(react.status, "LOCKED");

      // Verify Next Best Action present
      assert.ok(json.data.graphResult.nextBestAction);
    });

    it("GET /api/v1/roadmap should return the user's active roadmap", async () => {
      const res = await getActiveRoadmap(new Request("http://localhost:3000/api/v1/roadmap"));
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.equal(json.data.id, createdRoadmapId);
    });

    it("GET /api/v1/roadmap/:roadmapId should return specific roadmap", async () => {
      const res = await getRoadmapById(
        new Request(`http://localhost:3000/api/v1/roadmap/${createdRoadmapId}`),
        { params: Promise.resolve({ roadmapId: createdRoadmapId }) }
      );
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.equal(json.data.id, createdRoadmapId);
    });
  });

  describe("4. Skill Mutation & Deterministic Rerouting API", () => {
    it("PATCH /api/v1/me/skills/:skillId should update skill and unlock downstream roadmap path", async () => {
      const req = new Request("http://localhost:3000/api/v1/me/skills/javascript", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proficiency: 3, // Proficient -> triggers ALREADY_KNOWN
        }),
      });

      const res = await patchUserSkill(req, {
        params: Promise.resolve({ skillId: "javascript" }),
      });
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.equal(json.data.skill.proficiency, 3);
      assert.equal(json.data.skill.status, "ALREADY_KNOWN");

      // Verify roadmap reroute impact: React and Node.js are unlocked!
      assert.equal(json.data.roadmapImpact.roadmapChanged, true);
      assert.ok(json.data.roadmapImpact.nodesUnlocked >= 1);

      // Verify that downstream React node is now AVAILABLE in active roadmap
      const updatedNodes = json.data.roadmap.graphResult.graph.nodes;
      const reactNode = updatedNodes.find((n) => n.id === "react");
      assert.equal(reactNode.status, "AVAILABLE");
    });

    it("PATCH /api/v1/me/skills/:skillId should reject stale revision with 409 Conflict", async () => {
      const req = new Request("http://localhost:3000/api/v1/me/skills/javascript", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "If-Match": "999", // Mismatched revision
        },
        body: JSON.stringify({ proficiency: 4 }),
      });

      const res = await patchUserSkill(req, {
        params: Promise.resolve({ skillId: "javascript" }),
      });
      assert.equal(res.status, 409);

      const json = await res.json();
      assert.equal(json.error.code, "SKILL_UPDATE_ERROR");
      assert.match(json.error.message, /CONFLICT/);
    });
  });

  describe("5. Quest Lifecycle API", () => {
    it("POST .../nodes/:nodeId/quest should generate quest and mark node IN_PROGRESS", async () => {
      // react is now AVAILABLE, so generating quest for it succeeds
      const req = new Request(`http://localhost:3000/api/v1/roadmap/${createdRoadmapId}/nodes/react/quest`, {
        method: "POST",
      });

      const res = await postQuest(req, {
        params: Promise.resolve({ roadmapId: createdRoadmapId, nodeId: "react" }),
      });
      assert.equal(res.status, 201);

      const json = await res.json();
      assert.ok(json.data.id);
      createdQuestId = json.data.id;
      assert.equal(json.data.status, "IN_PROGRESS");
      assert.ok(json.data.tasks.length >= 2);
    });

    it("POST .../quest should reject starting a LOCKED node", async () => {
      // capstone-project requires sql, nodejs, and react - it is currently LOCKED
      const req = new Request(`http://localhost:3000/api/v1/roadmap/${createdRoadmapId}/nodes/capstone-project/quest`, {
        method: "POST",
      });

      const res = await postQuest(req, {
        params: Promise.resolve({ roadmapId: createdRoadmapId, nodeId: "capstone-project" }),
      });
      assert.equal(res.status, 400);

      const json = await res.json();
      assert.match(json.error.message, /LOCKED/);
    });

    it("GET /api/v1/quests/:questId should return quest details", async () => {
      const res = await getQuestById(
        new Request(`http://localhost:3000/api/v1/quests/${createdQuestId}`),
        { params: Promise.resolve({ questId: createdQuestId }) }
      );
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.equal(json.data.id, createdQuestId);
    });

    it("POST /api/v1/quests/:questId/complete should mark quest completed and update node to COMPLETED", async () => {
      const req = new Request(`http://localhost:3000/api/v1/quests/${createdQuestId}/complete`, {
        method: "POST",
      });

      const res = await completeQuestRoute(req, {
        params: Promise.resolve({ questId: createdQuestId }),
      });
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.equal(json.data.quest.status, "COMPLETED");

      // Verify node status in roadmap is now COMPLETED
      const react = json.data.roadmap.graphResult.graph.nodes.find((n) => n.id === "react");
      assert.equal(react.status, "COMPLETED");
    });
  });

  describe("6. AI Assistant Conversations & Proposals API", () => {
    let conversationId = "";
    let proposalId = "";

    it("POST /api/v1/assistant/conversations should initialize assistant conversation", async () => {
      const req = new Request("http://localhost:3000/api/v1/assistant/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roadmapId: createdRoadmapId }),
      });

      const res = await postConversation(req);
      assert.equal(res.status, 201);

      const json = await res.json();
      assert.ok(json.data.id);
      conversationId = json.data.id;
      assert.equal(json.data.messages[0].role, "ASSISTANT");
    });

    it("POST .../messages should return assistant reply and proposal when user declares known skill", async () => {
      const req = new Request(`http://localhost:3000/api/v1/assistant/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "I already know javascript patterns thoroughly." }),
      });

      const res = await postMessage(req, {
        params: Promise.resolve({ conversationId }),
      });
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.ok(json.data.reply);
      assert.ok(json.data.proposal);
      proposalId = json.data.proposal.id;
      assert.equal(json.data.proposal.proposalType, "UPDATE_PROFICIENCY");
    });

    it("POST .../proposals/:id/confirm should confirm proposal and update state", async () => {
      const req = new Request(`http://localhost:3000/api/v1/assistant/proposals/${proposalId}/confirm`, {
        method: "POST",
      });

      const res = await confirmProposalRoute(req, {
        params: Promise.resolve({ proposalId }),
      });
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.equal(json.data.proposal.status, "CONFIRMED");
      assert.ok(json.data.result);
    });
  });
});
