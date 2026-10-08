# Career Quest — Graph Engine Specification

**Version:** 1.0  
**Status:** FROZEN FOR IMPLEMENTATION  
**Product:** Career Quest — Reverse-Engineered Career Roadmapper  
**Role:** Deterministic graph brain behind the Career Quest roadmap  
**Primary implementation:** TypeScript  
**Graph UI:** React Flow  
**Persistence:** PostgreSQL  
**AI relationship:** AI proposes graph content; Graph Engine validates, normalizes, evaluates, and decides runtime state.

---

# 1. Purpose

The Graph Engine is the deterministic core of Career Quest.

It converts a validated career roadmap into a live dependency graph and continuously answers:

- What does the user already know?
- What skills are still missing?
- What can the user work on now?
- What is locked?
- What becomes available after a skill change?
- What is the shortest valid route toward the target role?
- How does the timeline change?
- What is the user's Next Best Action?
- What should happen when the user marks a skill as already known?
- What should happen when a quest is completed?
- What should happen when proficiency changes?

The Graph Engine is **not** an LLM.

It must produce the same result for the same validated inputs.

---

# 2. Core Architecture

```text
                    AI / LLM
                       │
                       ▼
              Structured Roadmap
                       │
                       ▼
              Schema Validation
                       │
                       ▼
              Semantic Validation
                       │
                       ▼
                 Graph Engine
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   Graph State      Timeline       Next Action
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                  PostgreSQL
                       │
                       ▼
                     API
                       │
                       ▼
                     UI
```

---

# 3. Non-Negotiable Rules

## Rule 01 — Graph Engine is deterministic

No LLM is required for:

- node state
- dependency evaluation
- unlocking
- locking
- rerouting
- timeline arithmetic
- progress calculation
- Next Best Action ranking
- cycle detection
- graph normalization

## Rule 02 — AI proposes, Graph Engine decides

```text
AI says:
"React should probably follow JavaScript."

Graph Engine:
"Is that relationship valid?
Is the dependency acyclic?
Is React actually blocked?
What is its current state?
Does the user's proficiency satisfy the prerequisite?"
```

Only the engine produces authoritative runtime state.

## Rule 03 — Database stores state; engine derives meaning

Database:

```text
what happened
what the user knows
what the roadmap contains
what was completed
```

Graph Engine:

```text
what the current state means
what is unlocked
what should happen next
```

## Rule 04 — No hidden graph mutations

Every graph-changing event must have:

- trigger
- previous state
- new state
- revision
- affected nodes
- timestamp

---

# 4. Graph Model

Career Quest uses a directed acyclic graph (DAG).

```text
HTML
  ↓
CSS
  ↓
JavaScript
  ↓
React
  ↓
Frontend Architecture
  ↓
Full Stack Project
  ↓
Target Role
```

A node may have multiple prerequisites:

```text
JavaScript ─────┐
                 ├──► React
HTML/CSS ───────┘
```

A skill can unlock multiple downstream nodes:

```text
Git
 ├──► GitHub
 ├──► CI/CD
 └──► Collaboration
```

---

# 5. Graph Entities

## 5.1 Graph

```ts
type CareerGraph = {
  id: string;
  roadmapId: string;
  revision: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
};
```

## 5.2 Node

```ts
type GraphNode = {
  id: string;
  roadmapNodeId: string;
  skillId?: string;

  type:
    | "SKILL"
    | "MILESTONE"
    | "PROJECT"
    | "INTERVIEW"
    | "EXPERIENCE";

  title: string;
  description?: string;

  requiredProficiency: number;
  currentProficiency: number;

  estimatedHours: number;

  phaseId: string;
  priority: number;

  status: NodeStatus;

  metadata?: Record<string, unknown>;
};
```

## 5.3 Edge

```ts
type GraphEdge = {
  id: string;

  sourceNodeId: string;
  targetNodeId: string;

  type:
    | "PREREQUISITE"
    | "UNLOCKS"
    | "RECOMMENDED";

  required: boolean;

  weight?: number;
};
```

---

# 6. Node Status Model

Canonical states:

```text
LOCKED
AVAILABLE
IN_PROGRESS
COMPLETED
MASTERED
ALREADY_KNOWN
```

These are runtime states.

They must not be confused with proficiency.

---

# 7. Proficiency Model

Canonical proficiency:

| Level | Label |
|---:|---|
| 0 | UNKNOWN |
| 1 | BEGINNER |
| 2 | FAMILIAR |
| 3 | PROFICIENT |
| 4 | ADVANCED |
| 5 | EXPERT |

A node may require:

```text
requiredProficiency = 3
```

while the user has:

```text
currentProficiency = 2
```

Therefore:

```text
gap = 1
```

---

# 8. Status vs Proficiency

These are separate dimensions.

Example:

```text
React
status = AVAILABLE
proficiency = 1
required = 3
```

means:

```text
The user can start learning React,
but has not reached the required proficiency.
```

Another example:

```text
JavaScript
status = ALREADY_KNOWN
proficiency = 4
required = 3
```

means:

```text
Learning effort is removed.
Dependent nodes may unlock.
```

---

# 9. Source of Truth

For runtime state:

```text
Graph Engine
```

For durable persistence:

```text
PostgreSQL
```

For proposed roadmap structure:

```text
AI output
```

For UI rendering:

```text
API response
```

Never make the UI state authoritative.

---

# 10. Graph Validation Pipeline

Every AI-generated graph passes through:

```text
AI OUTPUT
   ↓
SCHEMA VALIDATION
   ↓
NODE VALIDATION
   ↓
EDGE VALIDATION
   ↓
REFERENCE VALIDATION
   ↓
DUPLICATE DETECTION
   ↓
SELF-EDGE DETECTION
   ↓
CYCLE DETECTION
   ↓
ORPHAN DETECTION
   ↓
DEPENDENCY NORMALIZATION
   ↓
PROFICIENCY NORMALIZATION
   ↓
STATE INITIALIZATION
   ↓
GRAPH ACCEPTED
```

A graph failing validation must never become the active roadmap.

---

# 11. Node Validation

Each node must have:

```text
id
title
type
requiredProficiency
estimatedHours
phaseId
```

Validation rules:

```text
title != empty
estimatedHours >= 0
requiredProficiency ∈ [0,5]
phaseId exists
skillId exists when type = SKILL
```

Node IDs must be unique within a roadmap.

---

# 12. Edge Validation

Each edge must satisfy:

```text
source exists
target exists
source != target
```

Required dependencies:

```text
required = true
```

Optional/recommended relationships:

```text
required = false
```

Unknown relationship types are rejected.

---

# 13. Cycle Detection

Career dependency graph must be acyclic.

Invalid:

```text
A → B → C → A
```

Valid:

```text
A → B → C
```

Use DFS or Kahn's topological sort.

Recommended implementation:

```ts
topologicalSort(nodes, edges)
```

If:

```text
sortedNodeCount !== totalNodeCount
```

then a cycle exists.

Return:

```text
GRAPH_CYCLE_DETECTED
```

and reject activation.

---

# 14. Orphan Detection

A node is suspicious when:

```text
node has no incoming dependency
AND
node has no valid root classification
```

Not every isolated node is automatically invalid.

Valid root nodes may include:

```text
FOUNDATION
USER_ALREADY_KNOWN
ENTRY_REQUIREMENT
```

The validator must distinguish legitimate roots from accidental disconnected nodes.

---

# 15. Duplicate Skill Detection

The same canonical skill should not appear as multiple independent required nodes unless explicitly represented as separate mastery contexts.

Example invalid:

```text
Node A → "JavaScript"
Node B → "JavaScript"
```

Preferred:

```text
one canonical JavaScript skill
```

If context differs:

```text
JavaScript Fundamentals
JavaScript Advanced Patterns
```

these may be separate nodes backed by the same skill family only when the roadmap explicitly requires different mastery levels.

---

# 16. Graph Normalization

AI output may be structurally valid but inconsistent.

Normalization must:

1. canonicalize skill references
2. remove duplicate edges
3. normalize proficiency values
4. normalize estimated hours
5. normalize priorities
6. normalize node types
7. normalize dependency direction
8. assign stable ordering
9. create deterministic graph metadata

Example:

```text
AI:
React → JavaScript

Engine:
JavaScript → React
```

The engine's dependency convention is:

```text
PREREQUISITE SOURCE
        ↓
DEPENDENT TARGET
```

---

# 17. Dependency Semantics

For a required edge:

```text
A → B
```

B is unlockable only when A satisfies its prerequisite condition.

Default condition:

```text
A.status ∈ {COMPLETED, MASTERED, ALREADY_KNOWN}
AND
A.currentProficiency >= A.requiredProficiency
```

However, node-type-specific rules may override the default.

---

# 18. AVAILABLE State

A node is `AVAILABLE` when:

```text
not completed
AND
not already known
AND
all required prerequisites satisfied
```

Example:

```text
JavaScript = ALREADY_KNOWN
React = LOCKED
```

After evaluation:

```text
React = AVAILABLE
```

---

# 19. LOCKED State

A node is `LOCKED` when at least one required prerequisite is unsatisfied.

Example:

```text
JavaScript = IN_PROGRESS
React = LOCKED
```

Reason should be computable:

```ts
blockedBy: ["javascript-node-id"]
```

The API/UI may expose this reason.

---

# 20. IN_PROGRESS State

A node becomes `IN_PROGRESS` when:

```text
user explicitly starts it
OR
a related quest is started
```

Starting a node does not automatically satisfy its prerequisites.

---

# 21. COMPLETED State

A node becomes `COMPLETED` when the required completion condition is satisfied.

Examples:

```text
required quest completed
required project submitted
required milestone confirmed
```

Completion does not automatically mean mastery.

---

# 22. MASTERED State

`MASTERED` requires stronger evidence.

Possible inputs:

```text
assessment
completed advanced quest
evidence
user confirmation
```

The engine must not infer mastery merely because:

```text
quest completed = true
```

---

# 23. ALREADY_KNOWN State

This is a critical Career Quest feature.

When a user says:

> "I already know JavaScript."

the engine should:

```text
1. update proficiency/state
2. remove unnecessary learning effort
3. evaluate dependent nodes
4. unlock newly valid nodes
5. recalculate timeline
6. recalculate Next Best Action
7. increment roadmap revision
8. create change event
```

This is not just a visual checkbox.

---

# 24. Already-Known Algorithm

```ts
function markSkillKnown(skillId, proficiency) {
  validateProficiency(proficiency);

  updateUserSkill(skillId, proficiency);

  const affectedNodes = findNodesForSkill(skillId);

  for (const node of affectedNodes) {
    node.currentProficiency = proficiency;

    if (proficiency >= node.requiredProficiency) {
      node.status = "ALREADY_KNOWN";
    }
  }

  const impacted = collectDownstreamNodes(affectedNodes);

  recomputeStatuses(impacted);

  const timeline = recomputeTimeline();

  const nextAction = selectNextBestAction();

  persistRevision();

  return {
    impacted,
    timeline,
    nextAction
  };
}
```

The real implementation must execute the entire operation transactionally.

---

# 25. Downstream Traversal

When a node changes, do not recompute unrelated parts of the graph unnecessarily.

Use:

```text
affected node
     ↓
outgoing required edges
     ↓
downstream nodes
     ↓
repeat
```

This creates an affected subgraph.

For correctness, a full recomputation may still be used for MVP if graph sizes remain small.

Recommended MVP:

```text
full deterministic recomputation
```

Optimization later:

```text
incremental affected-subgraph recomputation
```

---

# 26. Status Recalculation

For every node:

```ts
if (isAlreadyKnown(node)) {
  node.status = "ALREADY_KNOWN";
}
else if (isMastered(node)) {
  node.status = "MASTERED";
}
else if (isCompleted(node)) {
  node.status = "COMPLETED";
}
else if (hasInProgressQuest(node)) {
  node.status = "IN_PROGRESS";
}
else if (allRequiredDependenciesSatisfied(node)) {
  node.status = "AVAILABLE";
}
else {
  node.status = "LOCKED";
}
```

Existing user-confirmed states must not be accidentally overwritten by derived recalculation.

The implementation must distinguish:

```text
persisted facts
```

from:

```text
derived state
```

---

# 27. State Transition Rules

Allowed examples:

```text
LOCKED → AVAILABLE
AVAILABLE → IN_PROGRESS
AVAILABLE → ALREADY_KNOWN
IN_PROGRESS → COMPLETED
COMPLETED → MASTERED
IN_PROGRESS → ALREADY_KNOWN
```

Potentially allowed:

```text
IN_PROGRESS → AVAILABLE
```

when the user explicitly resets/abandons a quest.

Forbidden by default:

```text
LOCKED → MASTERED
LOCKED → COMPLETED
LOCKED → ALREADY_KNOWN
```

unless an explicit user skill update proves the prerequisite is already satisfied.

---

# 28. Topological Evaluation

The graph engine should evaluate nodes in topological order.

```text
roots
 ↓
foundations
 ↓
intermediate skills
 ↓
advanced skills
 ↓
projects
 ↓
target milestones
```

Algorithm:

```ts
const orderedNodes = topologicalSort(graph);

for (const node of orderedNodes) {
  evaluateNode(node);
}
```

This ensures prerequisite state is known before dependent state is evaluated.

---

# 29. Required vs Recommended Edges

Required:

```text
A → B
```

means:

```text
B cannot become AVAILABLE until A satisfies its requirement.
```

Recommended:

```text
A ~> B
```

means:

```text
A may improve readiness for B,
but does not block B.
```

This distinction is critical.

Do not turn every AI-suggested relationship into a hard prerequisite.

---

# 30. Dependency Satisfaction

Default:

```ts
function dependencySatisfied(edge, sourceNode) {
  if (!edge.required) return true;

  return (
    sourceNode.currentProficiency >= sourceNode.requiredProficiency &&
    ["COMPLETED", "MASTERED", "ALREADY_KNOWN"].includes(
      sourceNode.status
    )
  );
}
```

A project or experience node may use completion instead of proficiency.

Therefore dependency evaluation should be strategy-based:

```ts
dependencyRule(nodeType)
```

---

# 31. Graph Progress

Progress should not be:

```text
completedNodes / totalNodes
```

by default.

That can mislead because:

```text
10 easy nodes
```

should not necessarily equal:

```text
1 critical advanced project
```

Recommended weighted model:

```text
progress =
sum(completed node weights)
/
sum(required node weights)
```

Weights may consider:

```text
estimated effort
required proficiency
node criticality
```

For the hackathon, keep the formula deterministic and explainable.

---

# 32. Suggested MVP Progress Formula

```ts
nodeWeight =
  estimatedHours *
  criticalityWeight
```

Where:

```text
criticalityWeight:
required = 1.0
recommended = 0.5
```

Progress:

```ts
completedWeight / totalRequiredWeight
```

Clamp:

```text
0 ≤ progress ≤ 1
```

---

# 33. Timeline Engine

Timeline is derived from:

```text
remaining required work
weekly available hours
dependency order
parallelizable work
completed/known skills
```

Basic MVP:

```text
remainingHours =
sum(estimatedHours of unfinished required nodes)

weeks =
ceil(remainingHours / weeklyHours)
```

Then represent a range when uncertainty exists:

```text
minWeeks
maxWeeks
```

Do not present false precision.

---

# 34. Timeline After Already-Known Skill

Example:

Before:

```text
JavaScript = 12h
React = 15h
Node = 12h
Total = 39h
Weekly = 10h

≈ 4 weeks
```

After:

```text
JavaScript = ALREADY_KNOWN
Remaining = 27h

≈ 3 weeks
```

The graph should visibly show the removed effort.

---

# 35. Parallel Work

If two nodes do not depend on each other:

```text
React
Node.js
```

they may be worked on in parallel.

MVP timeline may conservatively sum effort.

Later optimization may calculate critical path:

```text
criticalPath(graph)
```

The engine must not claim a shorter timeline unless the scheduling model actually supports parallel work.

---

# 36. Next Best Action

The engine must always be capable of returning one primary action.

```ts
type NextBestAction = {
  nodeId: string;
  title: string;
  reason: string;
  estimatedHours: number;
  priority: number;
};
```

---

# 37. Next Best Action Ranking

Candidate nodes:

```text
AVAILABLE
or
IN_PROGRESS
```

Exclude:

```text
LOCKED
COMPLETED
MASTERED
ALREADY_KNOWN
```

Rank using deterministic factors:

```text
1. IN_PROGRESS preference
2. prerequisite unlock impact
3. critical-path importance
4. target-role relevance
5. priority
6. smaller estimated effort as tie-breaker
7. stable node ID as final tie-breaker
```

The final tie-breaker prevents nondeterministic results.

---

# 38. Next Best Action Example

Candidates:

```text
React       unlocks 4 nodes
Docker      unlocks 1 node
GitHub CI   unlocks 2 nodes
```

Assuming comparable relevance:

```text
React
```

wins because it creates greater downstream unlock value.

The reason returned to the UI should explain the choice.

---

# 39. IN_PROGRESS Priority

If the user has already started a quest:

```text
React = IN_PROGRESS
Docker = AVAILABLE
```

React should normally remain the Next Best Action.

The product should encourage completion rather than constantly redirecting the user.

---

# 40. Next Action Stability

The Next Best Action must not randomly change between identical requests.

Given identical:

```text
graph
user state
weekly hours
target role
```

the result must be identical.

---

# 41. Rerouting Triggers

## P0

Immediate deterministic reroute:

```text
skill proficiency change
skill marked known
node completion
quest completion
node state change
```

## P1

Timeline-only recalculation:

```text
weekly hours changed
```

## P2

AI roadmap regeneration:

```text
target role changed
specialization changed
company type changed
major deadline/constraint changed
```

---

# 42. Weekly Hours Change

Example:

```text
10h/week → 15h/week
```

Do not regenerate the graph.

Only recalculate:

```text
timeline
estimated completion
possibly Next Best Action scheduling metadata
```

The dependency structure remains unchanged.

---

# 43. Target Role Change

Example:

```text
Frontend Developer
→
Full Stack Developer
```

This is not a simple reroute.

The engine should mark:

```text
requiresRoadmapRegeneration = true
```

AI regeneration creates a new candidate graph.

The current active roadmap remains safe until the new graph is validated.

---

# 44. Roadmap Revision

Every graph-changing operation increments:

```text
roadmap.revision
```

Example:

```text
revision 4
 ↓
skill update
 ↓
revision 5
```

Revision is used for:

- concurrency
- debugging
- UI synchronization
- audit history

---

# 45. Change Events

Every meaningful change creates:

```ts
type RoadmapChangeEvent = {
  id: string;
  roadmapId: string;
  revision: number;

  trigger:
    | "ROADMAP_GENERATED"
    | "SKILL_UPDATED"
    | "NODE_UPDATED"
    | "QUEST_COMPLETED"
    | "ASSESSMENT_CONFIRMED"
    | "PROFILE_CHANGED"
    | "MANUAL_REROUTE"
    | "ASSISTANT_PROPOSAL";

  affectedNodeIds: string[];

  previousState?: unknown;
  newState?: unknown;

  createdAt: string;
};
```

Do not store secrets or hidden AI reasoning in change events.

---

# 46. Transaction Boundary

Graph-changing operations should be atomic.

Example:

```text
BEGIN TRANSACTION

update user skill
update skill history
recalculate graph
update node states
update timeline
update next action
increment roadmap revision
create change event

COMMIT
```

If any critical step fails:

```text
ROLLBACK
```

No partial roadmap state.

---

# 47. Graph Engine Service API

Recommended internal interface:

```ts
interface GraphEngine {
  validateGraph(input: GraphInput): ValidationResult;

  normalizeGraph(input: GraphInput): NormalizedGraph;

  initializeState(
    graph: NormalizedGraph,
    userState: UserCareerState
  ): GraphState;

  recalculate(
    graph: Graph,
    userState: UserCareerState
  ): RecalculationResult;

  applySkillUpdate(
    graph: Graph,
    userState: UserCareerState,
    update: SkillUpdate
  ): RecalculationResult;

  applyNodeUpdate(
    graph: Graph,
    userState: UserCareerState,
    update: NodeUpdate
  ): RecalculationResult;

  calculateTimeline(
    graph: Graph,
    userState: UserCareerState
  ): Timeline;

  selectNextBestAction(
    graph: Graph,
    userState: UserCareerState
  ): NextBestAction | null;
}
```

---

# 48. Pure Functions

Where possible, core graph logic should be pure.

Examples:

```ts
validateGraph()
topologicalSort()
findRoots()
findDependents()
isDependencySatisfied()
calculateNodeStatus()
calculateProgress()
calculateTimeline()
rankNextActions()
```

This makes testing much easier.

Database operations belong outside these functions.

---

# 49. Recommended Module Structure

```text
src/
  graph-engine/
    types/
      graph.ts
      node.ts
      edge.ts
      state.ts

    validation/
      validateGraph.ts
      validateNodes.ts
      validateEdges.ts
      detectCycles.ts
      detectOrphans.ts

    normalization/
      normalizeGraph.ts
      normalizeSkills.ts
      normalizeDependencies.ts

    state/
      calculateNodeStatus.ts
      calculateGraphState.ts
      transitions.ts

    traversal/
      topologicalSort.ts
      downstream.ts
      upstream.ts

    timeline/
      calculateTimeline.ts
      criticalPath.ts

    next-action/
      candidateNodes.ts
      rankActions.ts
      selectNextBestAction.ts

    progress/
      calculateProgress.ts

    rerouting/
      applySkillUpdate.ts
      applyNodeUpdate.ts
      rerouteRoadmap.ts

    index.ts
```

---

# 50. Graph Engine Does NOT Own

The Graph Engine should not own:

```text
authentication
database connection
HTTP routes
React rendering
AI prompts
LLM provider calls
email
notifications
analytics
```

Those belong to other layers.

---

# 51. AI Boundary

AI can produce:

```text
target-role decomposition
skill candidates
phase suggestions
node descriptions
estimated effort suggestions
recommended relationships
quest ideas
interview questions
```

AI cannot directly decide:

```text
node status
ownership
revision
authorization
whether a graph is cyclic
whether a prerequisite is satisfied
final Next Best Action
final timeline
```

---

# 52. AI Graph Contract

Example AI output:

```json
{
  "nodes": [
    {
      "id": "javascript",
      "type": "SKILL",
      "title": "JavaScript",
      "requiredProficiency": 3,
      "estimatedHours": 12
    },
    {
      "id": "react",
      "type": "SKILL",
      "title": "React",
      "requiredProficiency": 3,
      "estimatedHours": 15
    }
  ],
  "edges": [
    {
      "source": "javascript",
      "target": "react",
      "type": "PREREQUISITE",
      "required": true
    }
  ]
}
```

The engine validates and transforms this into canonical internal state.

---

# 53. Graph Security

Never allow the client to submit arbitrary graph structure to production mutation endpoints.

The browser may request:

```text
node state change
```

but should not be allowed to directly submit:

```text
new dependency edge
new required skill
new roadmap phase
```

Those are server-owned operations.

---

# 54. Performance Target

Hackathon graph size:

```text
20–60 nodes
```

Expected operations should feel instant:

```text
state recalculation: < 100ms target
Next Best Action: < 50ms target
timeline: < 50ms target
cycle validation: < 50ms target
```

These are engineering targets, not user-facing guarantees.

For this graph size, full recalculation is acceptable.

---

# 55. Determinism Requirements

For identical inputs:

```text
same graph
+
same user state
+
same configuration
```

must produce:

```text
same node states
same timeline
same progress
same Next Best Action
```

Avoid nondeterministic:

```text
random()
current time
database row ordering
unordered object iteration
LLM calls
```

inside core graph calculations.

---

# 56. Testing Strategy

## Unit Tests

Test:

```text
cycle detection
topological sorting
dependency satisfaction
node states
state transitions
progress
timeline
Next Best Action
```

## Integration Tests

Test:

```text
skill update → reroute
quest completion → state update
assessment → proficiency → reroute
weekly hours → timeline
```

## End-to-End Test

Run:

```text
generate roadmap
 ↓
render graph
 ↓
select node
 ↓
start quest
 ↓
mark JavaScript known
 ↓
reroute
 ↓
observe unlocked React
 ↓
observe changed timeline
 ↓
observe changed Next Best Action
```

---

# 57. Critical Test Cases

### Case 01 — Root Skill

```text
HTML has no prerequisites
```

Expected:

```text
AVAILABLE
```

### Case 02 — Blocked Skill

```text
JavaScript depends on HTML
HTML = IN_PROGRESS
```

Expected:

```text
JavaScript = LOCKED
```

### Case 03 — Unlock

```text
HTML = COMPLETED
```

Expected:

```text
JavaScript = AVAILABLE
```

### Case 04 — Already Known

```text
JavaScript = ALREADY_KNOWN
```

Expected:

```text
React unlocks if all other prerequisites are satisfied
timeline decreases
```

### Case 05 — Cycle

```text
A → B
B → C
C → A
```

Expected:

```text
GRAPH_CYCLE_DETECTED
```

### Case 06 — Quest Completion

Expected:

```text
quest = COMPLETED
node may become COMPLETED
mastery remains separate
```

### Case 07 — Weekly Hours

```text
10 → 20 hours/week
```

Expected:

```text
graph unchanged
timeline decreases
```

### Case 08 — Target Role

```text
Frontend → Full Stack
```

Expected:

```text
current graph remains active
regeneration required
```

---

# 58. Example Full State Transition

Initial:

```text
HTML        = COMPLETED
CSS         = COMPLETED
JavaScript  = IN_PROGRESS
React       = LOCKED
Node.js     = LOCKED
```

User updates:

```text
JavaScript → proficiency 3
status → ALREADY_KNOWN
```

Engine:

```text
1. persist skill update
2. recalculate JavaScript
3. evaluate React
4. evaluate Node.js
5. update timeline
6. calculate progress
7. rank available actions
8. increment revision
9. create change event
```

Result:

```text
HTML        = COMPLETED
CSS         = COMPLETED
JavaScript  = ALREADY_KNOWN
React       = AVAILABLE
Node.js     = AVAILABLE
```

Next Best Action:

```text
React
```

if React has the higher deterministic ranking.

---

# 59. Graph UI Contract

The engine returns enough information for React Flow to render:

```text
node ID
position metadata if persisted
node type
status
title
phase
proficiency
required proficiency
blocked-by information
dependency edges
selected/active route metadata
```

However:

```text
visual layout
pan
zoom
hover
selection
animation
```

remain UI responsibilities.

---

# 60. Layout Separation

Do not make the graph engine dependent on React Flow.

Bad:

```text
Graph Engine → React Flow
```

Good:

```text
Graph Engine
     ↓
Graph DTO
     ↓
React Flow Adapter
     ↓
UI
```

This allows future replacement of the graph renderer.

---

# 61. Graph DTO

Recommended response shape:

```ts
type GraphDTO = {
  nodes: Array<{
    id: string;
    type: string;
    title: string;
    status: NodeStatus;
    proficiency: number;
    requiredProficiency: number;
    phaseId: string;
    blockedBy: string[];
  }>;

  edges: Array<{
    id: string;
    source: string;
    target: string;
    type: string;
    required: boolean;
  }>;
};
```

---

# 62. Active Route

The engine may identify the current recommended route:

```text
current node
   ↓
next action
   ↓
critical dependency
   ↓
target milestone
```

Example:

```text
JavaScript
   ↓
React
   ↓
Frontend Architecture
   ↓
Full Stack Project
```

UI may highlight this route.

The engine should return route IDs, not UI styling.

---

# 63. Explainability

Every major engine decision should be explainable.

Example:

```json
{
  "nodeId": "react",
  "status": "AVAILABLE",
  "reason": {
    "type": "PREREQUISITES_SATISFIED",
    "satisfiedBy": [
      "javascript",
      "html-css"
    ]
  }
}
```

For Next Best Action:

```json
{
  "reason": {
    "type": "HIGH_UNLOCK_VALUE",
    "unlockCount": 4
  }
}
```

This makes the product feel intelligent without pretending the AI is magical.

---

# 64. Failure Handling

If graph calculation fails:

```text
do not partially persist derived state
```

Keep:

```text
last valid roadmap revision
```

Return:

```text
GRAPH_RECALCULATION_FAILED
```

Log enough metadata for debugging.

Never expose internal stack traces to the client.

---

# 65. Graph Engine Definition of Done

- [ ] canonical node model exists
- [ ] canonical edge model exists
- [ ] proficiency model implemented
- [ ] state machine implemented
- [ ] DAG validation implemented
- [ ] cycle detection implemented
- [ ] orphan validation implemented
- [ ] duplicate detection implemented
- [ ] graph normalization implemented
- [ ] topological traversal implemented
- [ ] dependency evaluation implemented
- [ ] ALREADY_KNOWN flow implemented
- [ ] rerouting implemented
- [ ] timeline calculation implemented
- [ ] progress calculation implemented
- [ ] Next Best Action implemented
- [ ] deterministic tie-breaking implemented
- [ ] revision increments implemented
- [ ] change events implemented
- [ ] transaction boundary implemented
- [ ] unit tests implemented
- [ ] integration tests implemented
- [ ] judge demo flow passes

---

# 66. P0 Scope

Build during hackathon:

```text
DAG
nodes
edges
proficiency
node state machine
cycle detection
dependency evaluation
already-known reroute
full graph recalculation
timeline
progress
Next Best Action
revision
change events
React Flow DTO
```

---

# 67. P1 Scope

After core demo works:

```text
incremental recomputation
critical-path scheduling
advanced progress weighting
active-route explanation
more sophisticated recommendation scoring
```

---

# 68. P2 Scope

Do not build unless everything else is stable:

```text
multi-agent graph planning
probabilistic graph reasoning
automatic external skill validation
large-scale graph optimization
cross-user graph learning
real-time collaborative graph editing
```

---

# 69. Final Architecture Rule

The Career Quest system should behave like this:

```text
                 ┌───────────────┐
                 │      AI       │
                 │  proposes     │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │  VALIDATION   │
                 │ schema + DAG  │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │ GRAPH ENGINE  │
                 │ decides state │
                 └───────┬───────┘
                         ↓
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
      Timeline       Next Action     Progress
          │              │              │
          └──────────────┼──────────────┘
                         ↓
                    PostgreSQL
                         ↓
                        API
                         ↓
                         UI
```

---

# 70. Final Product Brain

The graph engine must answer one question continuously:

> **“Given everything this user knows, everything they have completed, their target role, and their available time — what is the most useful valid next step right now?”**

That answer must be:

```text
deterministic
explainable
state-aware
dependency-aware
timeline-aware
revision-safe
```

The AI creates the roadmap.

**The Graph Engine makes it live.**
