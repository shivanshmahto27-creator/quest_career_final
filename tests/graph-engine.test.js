/**
 * Career Quest — Graph Engine Test Suite
 * Source: TESTING_AND_QUALITY_STRATEGY_Career_Quest_v1.2_FINAL_SAFE.md §5.1
 * Verifies 100% deterministic graph engine behavior, cycle detection,
 * status transitions, already-known rerouting, timeline arithmetic, and Next Best Action.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  validateGraphDAG,
  evaluateNodeStatuses,
  calculateTimelineAndProgress,
  selectNextBestAction,
  evaluateGraph,
  applySkillUpdate,
  markNodeInProgress,
  markNodeCompleted,
} from "../src/lib/graph/index.ts";

describe("Career Quest — Deterministic Graph Engine (Phase 1)", () => {
  // Helper to build test nodes
  const createNode = (overrides) => ({
    id: "node-1",
    title: "Test Node",
    type: "SKILL",
    requiredProficiency: 3,
    currentProficiency: 0,
    estimatedHours: 10,
    phaseId: "phase-1",
    priority: 1,
    status: "LOCKED",
    ...overrides,
  });

  // Helper to build test edges
  const createEdge = (source, target, overrides) => ({
    id: `edge-${source}-${target}`,
    sourceNodeId: source,
    targetNodeId: target,
    type: "PREREQUISITE",
    required: true,
    ...overrides,
  });

  describe("1. DAG Validation & Cycle Detection (Kahn's Algorithm)", () => {
    it("should validate a correct linear DAG", () => {
      const nodes = [
        createNode({ id: "js", title: "JavaScript", priority: 1 }),
        createNode({ id: "react", title: "React", priority: 2 }),
        createNode({ id: "next", title: "Next.js", priority: 3 }),
      ];
      const edges = [
        createEdge("js", "react"),
        createEdge("react", "next"),
      ];

      const result = validateGraphDAG(nodes, edges);
      assert.equal(result.isValid, true);
      assert.deepEqual(result.sortedNodeIds, ["js", "react", "next"]);
      assert.equal(result.issues.length, 0);
    });

    it("should reject cyclic graphs (A -> B -> C -> A)", () => {
      const nodes = [
        createNode({ id: "a", title: "Node A" }),
        createNode({ id: "b", title: "Node B" }),
        createNode({ id: "c", title: "Node C" }),
      ];
      const edges = [
        createEdge("a", "b"),
        createEdge("b", "c"),
        createEdge("c", "a"),
      ];

      const result = validateGraphDAG(nodes, edges);
      assert.equal(result.isValid, false);
      const cycleIssue = result.issues.find((i) => i.type === "CYCLE");
      assert.ok(cycleIssue, "Should report a CYCLE issue");
    });

    it("should reject self-loop edges (A -> A)", () => {
      const nodes = [createNode({ id: "a", title: "Node A" })];
      const edges = [createEdge("a", "a")];

      const result = validateGraphDAG(nodes, edges);
      assert.equal(result.isValid, false);
      assert.ok(result.issues.some((i) => i.type === "SELF_EDGE"));
    });

    it("should reject dangling edges pointing to non-existent nodes", () => {
      const nodes = [createNode({ id: "a", title: "Node A" })];
      const edges = [createEdge("a", "non-existent")];

      const result = validateGraphDAG(nodes, edges);
      assert.equal(result.isValid, false);
      assert.ok(result.issues.some((i) => i.type === "DANGLING_EDGE"));
    });

    it("should produce deterministic topological order across multiple runs", () => {
      const nodes = [
        createNode({ id: "css", title: "CSS", priority: 1 }),
        createNode({ id: "html", title: "HTML", priority: 1 }),
        createNode({ id: "js", title: "JS", priority: 2 }),
      ];
      const edges = [
        createEdge("html", "js"),
        createEdge("css", "js"),
      ];

      const result1 = validateGraphDAG(nodes, edges);
      const result2 = validateGraphDAG(nodes, edges);
      assert.deepEqual(result1.sortedNodeIds, result2.sortedNodeIds);
    });
  });

  describe("2. Node Status Transitions & Prerequisite Evaluation", () => {
    it("should make root nodes AVAILABLE and dependent nodes LOCKED", () => {
      const nodes = [
        createNode({ id: "js", title: "JavaScript", status: "LOCKED" }),
        createNode({ id: "react", title: "React", status: "LOCKED" }),
      ];
      const edges = [createEdge("js", "react")];

      const { updatedNodes } = evaluateNodeStatuses(nodes, edges, ["js", "react"]);
      const jsNode = updatedNodes.find((n) => n.id === "js");
      const reactNode = updatedNodes.find((n) => n.id === "react");

      assert.equal(jsNode.status, "AVAILABLE");
      assert.equal(reactNode.status, "LOCKED");
      assert.deepEqual(reactNode.blockedBy, ["js"]);
    });

    it("should unlock dependent node when prerequisite is COMPLETED with required proficiency", () => {
      const nodes = [
        createNode({
          id: "js",
          title: "JavaScript",
          status: "COMPLETED",
          requiredProficiency: 3,
          currentProficiency: 3,
        }),
        createNode({ id: "react", title: "React", status: "LOCKED" }),
      ];
      const edges = [createEdge("js", "react")];

      const { updatedNodes } = evaluateNodeStatuses(nodes, edges, ["js", "react"]);
      const reactNode = updatedNodes.find((n) => n.id === "react");

      assert.equal(reactNode.status, "AVAILABLE");
      assert.deepEqual(reactNode.blockedBy, []);
    });

    it("should keep dependent node LOCKED if prerequisite has not reached required proficiency", () => {
      const nodes = [
        createNode({
          id: "js",
          title: "JavaScript",
          status: "COMPLETED",
          requiredProficiency: 3,
          currentProficiency: 2, // Gap of 1
        }),
        createNode({ id: "react", title: "React", status: "LOCKED" }),
      ];
      const edges = [createEdge("js", "react")];

      const { updatedNodes } = evaluateNodeStatuses(nodes, edges, ["js", "react"]);
      const reactNode = updatedNodes.find((n) => n.id === "react");

      assert.equal(reactNode.status, "LOCKED");
      assert.deepEqual(reactNode.blockedBy, ["js"]);
    });

    it("should not block dependent nodes on optional (non-required) edges", () => {
      const nodes = [
        createNode({ id: "ts", title: "TypeScript", status: "LOCKED" }),
        createNode({ id: "react", title: "React", status: "LOCKED" }),
      ];
      const edges = [createEdge("ts", "react", { required: false, type: "RECOMMENDED" })];

      const { updatedNodes } = evaluateNodeStatuses(nodes, edges, ["ts", "react"]);
      const reactNode = updatedNodes.find((n) => n.id === "react");

      assert.equal(reactNode.status, "AVAILABLE");
    });
  });

  describe("3. Already-Known Skill Rerouting & Timeline Recalculation", () => {
    it("should mark skill as ALREADY_KNOWN, unlock downstream path, and reduce timeline", () => {
      const graph = {
        id: "roadmap-1",
        roadmapId: "roadmap-1",
        revision: 1,
        nodes: [
          createNode({
            id: "js",
            skillId: "skill-js",
            title: "JavaScript",
            estimatedHours: 20,
            requiredProficiency: 3,
            status: "LOCKED",
          }),
          createNode({
            id: "react",
            skillId: "skill-react",
            title: "React",
            estimatedHours: 30,
            requiredProficiency: 3,
            status: "LOCKED",
          }),
        ],
        edges: [createEdge("js", "react")],
      };

      // Initial evaluation
      const initial = evaluateGraph(graph, { weeklyHours: 10 });
      assert.equal(initial.timeline.remainingHours, 50);
      assert.equal(initial.timeline.minWeeks, 5); // 50 / 10 = 5 weeks
      assert.equal(initial.timeline.progressPercentage, 0);

      // User marks JavaScript as ALREADY_KNOWN with proficiency 4
      const result = applySkillUpdate(
        graph,
        { skillId: "skill-js", proficiency: 4, isKnown: true },
        { weeklyHours: 10 }
      );

      const jsNode = result.graph.nodes.find((n) => n.id === "js");
      const reactNode = result.graph.nodes.find((n) => n.id === "react");

      // Verify node status changes
      assert.equal(jsNode.status, "ALREADY_KNOWN");
      assert.equal(reactNode.status, "AVAILABLE");

      // Verify timeline adjustments
      assert.equal(result.timeline.completedHours, 20);
      assert.equal(result.timeline.remainingHours, 30);
      assert.equal(result.timeline.minWeeks, 3); // 30 / 10 = 3 weeks
      assert.equal(result.timeline.progressPercentage, 40); // 20/50 = 40%

      // Verify revision increment
      assert.equal(result.graph.revision, 2);

      // Verify impacted nodes reported
      assert.ok(result.impactedNodeIds.includes("js"));
      assert.ok(result.impactedNodeIds.includes("react"));
    });
  });

  describe("4. Timeline & Progress Calculator Assumptions Isolation", () => {
    it("should isolate timeline calculation and provide explicit documented assumptions", () => {
      const nodes = [
        createNode({ id: "a", estimatedHours: 10, status: "COMPLETED" }),
        createNode({ id: "b", estimatedHours: 10, status: "LOCKED" }),
      ];

      const timeline = calculateTimelineAndProgress(nodes, { weeklyHours: 5, bufferMultiplier: 1.3 });

      assert.equal(timeline.totalEstimatedHours, 20);
      assert.equal(timeline.completedHours, 10);
      assert.equal(timeline.remainingHours, 10);
      assert.equal(timeline.progressPercentage, 50);
      assert.equal(timeline.minWeeks, 2); // 10 / 5 = 2 weeks
      assert.equal(timeline.maxWeeks, 3); // ceil((10 * 1.3) / 5) = 3 weeks

      // Documented assumptions must be inspectable
      assert.equal(timeline.assumptions.weeklyHours, 5);
      assert.equal(timeline.assumptions.bufferMultiplier, 1.3);
      assert.equal(timeline.assumptions.progressModel, "WEIGHTED_CRITICALITY");
    });
  });

  describe("5. Deterministic Next Best Action Ranking", () => {
    it("should prioritize an IN_PROGRESS node above available nodes", () => {
      const nodes = [
        createNode({ id: "a", title: "Node A", status: "AVAILABLE", priority: 1, estimatedHours: 5 }),
        createNode({ id: "b", title: "Node B", status: "IN_PROGRESS", priority: 1, estimatedHours: 10 }),
      ];
      const edges = [];

      const nba = selectNextBestAction(nodes, edges);
      assert.ok(nba);
      assert.equal(nba.nodeId, "b");
      assert.equal(nba.status, "IN_PROGRESS");
      assert.match(nba.reason, /Currently in progress/i);
    });

    it("should prioritize the node that unlocks the most downstream locked nodes", () => {
      // Node A unlocks 2 downstream locked nodes (C, D)
      // Node B unlocks 1 downstream locked node (E)
      const nodes = [
        createNode({ id: "a", title: "High Leverage Node A", status: "AVAILABLE", priority: 1 }),
        createNode({ id: "b", title: "Low Leverage Node B", status: "AVAILABLE", priority: 1 }),
        createNode({ id: "c", title: "Locked C", status: "LOCKED" }),
        createNode({ id: "d", title: "Locked D", status: "LOCKED" }),
        createNode({ id: "e", title: "Locked E", status: "LOCKED" }),
      ];
      const edges = [
        createEdge("a", "c"),
        createEdge("a", "d"),
        createEdge("b", "e"),
      ];

      const nba = selectNextBestAction(nodes, edges);
      assert.ok(nba);
      assert.equal(nba.nodeId, "a");
      assert.equal(nba.unlockCount, 2);
      assert.match(nba.reason, /unblocks 2 downstream/i);
    });

    it("should break ties deterministically using node ID sorting", () => {
      const nodes = [
        createNode({ id: "node-z", title: "Node Z", status: "AVAILABLE", priority: 1, estimatedHours: 10 }),
        createNode({ id: "node-a", title: "Node A", status: "AVAILABLE", priority: 1, estimatedHours: 10 }),
      ];
      const edges = [];

      const nba = selectNextBestAction(nodes, edges);
      assert.ok(nba);
      // Alphabetical order tie-breaker picks node-a over node-z
      assert.equal(nba.nodeId, "node-a");
    });
  });

  describe("6. Interactive State Transitions (Start Node & Complete Node)", () => {
    it("should allow starting an AVAILABLE node and prevent starting a LOCKED node", () => {
      const graph = {
        id: "g1",
        roadmapId: "r1",
        revision: 1,
        nodes: [
          createNode({ id: "n1", title: "Root", status: "AVAILABLE" }),
          createNode({ id: "n2", title: "Child", status: "LOCKED" }),
        ],
        edges: [createEdge("n1", "n2")],
      };

      // Starting n1 succeeds
      const started = markNodeInProgress(graph, "n1");
      const n1 = started.graph.nodes.find((n) => n.id === "n1");
      assert.equal(n1.status, "IN_PROGRESS");
      assert.equal(started.nextBestAction?.nodeId, "n1");

      // Starting n2 throws error because it is LOCKED
      assert.throws(() => {
        markNodeInProgress(graph, "n2");
      }, /Cannot start node n2: prerequisites are locked/);
    });

    it("should unlock child when parent is completed via markNodeCompleted", () => {
      const graph = {
        id: "g1",
        roadmapId: "r1",
        revision: 1,
        nodes: [
          createNode({ id: "n1", title: "Root", status: "IN_PROGRESS", requiredProficiency: 3 }),
          createNode({ id: "n2", title: "Child", status: "LOCKED" }),
        ],
        edges: [createEdge("n1", "n2")],
      };

      const completed = markNodeCompleted(graph, "n1");
      const n1 = completed.graph.nodes.find((n) => n.id === "n1");
      const n2 = completed.graph.nodes.find((n) => n.id === "n2");

      assert.equal(n1.status, "COMPLETED");
      assert.equal(n2.status, "AVAILABLE");
      assert.equal(completed.nextBestAction?.nodeId, "n2");
    });
  });
});
