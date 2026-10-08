# Career Quest — Technical Requirements Document (TRD)

**Project:** Reverse-Engineered Career Roadmapper  
**Document:** Technical Requirements Document  
**Version:** 1.1 — Implementation Ready / Frozen  
**Status:** FINAL  
**Hackathon:** LLOYD Hackathon — Problem Statement 1  
**Primary UX:** Interactive AI-generated career skill graph

---

## 1. Technical Objective

Build an AI-powered web application that converts a user's specific dream job into a structured, interactive, dynamically adaptable career roadmap.

The system must:

1. Accept a hyper-specific career target.
2. Understand the user's current skills and proficiency.
3. Generate a structured career graph dynamically through AI.
4. Validate the generated graph before rendering it.
5. Render the roadmap as an interactive React Flow graph.
6. Provide actionable quests for individual skills.
7. Recalculate the roadmap when the user's skill state changes.
8. Calculate a realistic timeline based on remaining work and available time.
9. Surface a clear **Next Best Action** at every point.
10. Persist enough state for the user to continue their roadmap.
11. Work reliably on desktop and mobile.

### Core principle

> AI generates the career intelligence. Deterministic application logic controls graph validity, state transitions, progress, rerouting, timeline calculations, and rendering.

The LLM is **not** the authority for graph correctness.

---

# 2. Product Architecture

```text
USER
  |
  v
ONBOARDING
  |
  +--> Dream Role
  +--> Current Skills
  +--> Skill Proficiency
  +--> Weekly Availability
  +--> Timeline / Constraints
  |
  v
AI ROADMAP ENGINE
  |
  v
STRUCTURED AI OUTPUT
  |
  v
ZOD SCHEMA VALIDATION
  |
  v
SEMANTIC GRAPH VALIDATION
  |
  +--> Invalid? --> Repair / Retry / Safe Error
  |
  v
GRAPH NORMALIZATION
  |
  v
LAYOUT ENGINE
  |
  v
ZUSTAND CAREER STORE
  |
  +----------------+----------------+----------------+
  |                |                |                |
  v                v                v                v
React Flow      Quest View      Timeline        Next Action
  |                |                |                |
  +----------------+----------------+----------------+
                   |
                   v
             USER PROGRESS
                   |
                   v
             GRAPH ENGINE
                   |
          Skill state changes
                   |
                   v
              REROUTING
                   |
                   v
          UPDATED CAREER GRAPH
```

---

# 3. Technology Stack

## Frontend

- Next.js — App Router
- React
- TypeScript
- Tailwind CSS
- React Flow / `@xyflow/react`
- Framer Motion
- shadcn/ui

React Flow is used as a controlled graph renderer so application state remains under our control. React Flow's current documentation supports controlled nodes/edges, custom nodes, connection validation, and integration with Zustand. citeturn0search0turn0search3turn0search5

## State Management

- Zustand

Zustand is the central application store for:

- Career graph
- User profile
- Skill states
- Quest progress
- Timeline
- Next best action
- Selected node
- AI assistant proposals
- UI state where appropriate

React Flow itself documents Zustand as a suitable approach when graph state grows beyond simple local component state. citeturn0search0turn0search4

## Backend

- Next.js Route Handlers / server functions
- TypeScript

## AI

- Vercel AI SDK
- Approved LLM provider
- Zod structured schemas

Structured AI generation will use schema-constrained output rather than relying on free-form JSON parsing. The AI SDK supports structured object generation against schemas. citeturn0search12turn0search13

## Persistence

### MVP

Start with local persistence where practical.

Possible implementation:

- localStorage for anonymous/demo persistence
- server persistence only if required by the final workflow

### Optional

- Supabase/Postgres
- Redis

Do not introduce a database unless it solves an actual MVP requirement.

## Deployment

- Vercel

---

# 4. Project Structure

Recommended structure:

```text
src/
├── app/
│   ├── page.tsx
│   ├── onboarding/
│   ├── roadmap/
│   ├── api/
│   │   ├── roadmap/
│   │   ├── quest/
│   │   └── assistant/
│   └── layout.tsx
│
├── components/
│   ├── graph/
│   │   ├── CareerGraph.tsx
│   │   ├── SkillNode.tsx
│   │   ├── PhaseNode.tsx
│   │   └── GraphControls.tsx
│   ├── quest/
│   ├── timeline/
│   ├── onboarding/
│   ├── assistant/
│   └── ui/
│
├── lib/
│   ├── ai/
│   │   ├── roadmap.ts
│   │   ├── quest.ts
│   │   └── assistant.ts
│   ├── graph/
│   │   ├── validation.ts
│   │   ├── reroute.ts
│   │   ├── progress.ts
│   │   ├── unlock.ts
│   │   ├── timeline.ts
│   │   ├── nextAction.ts
│   │   └── layout.ts
│   ├── schemas/
│   ├── grounding/
│   └── utils/
│
├── store/
│   └── careerStore.ts
│
└── types/
    └── career.ts
```

---

# 5. Domain Model

## 5.1 UserProfile

```ts
type UserProfile = {
  id: string;
  targetRole: string;
  targetCompanyType?: string;
  currentLevel?: string;
  weeklyHours: number;
  targetMonths?: number;
  language: "en" | "hi" | "hinglish";
};
```

---

## 5.2 UserSkill

```ts
type SkillProficiency =
  | 0 // Unknown
  | 1 // Beginner
  | 2 // Familiar
  | 3 // Proficient
  | 4 // Advanced
  | 5; // Expert

type UserSkill = {
  skillId: string;
  proficiency: SkillProficiency;
  evidence?: string[];
  updatedAt: string;
};
```

The system must not reduce the user model to only:

```text
known / unknown
```

Partial proficiency is important for realistic replanning.

---

# 6. Career Goal

```ts
type CareerGoal = {
  role: string;
  companyType?: string;
  specialization?: string;
  constraints: {
    weeklyHours: number;
    targetMonths?: number;
  };
};
```

---

# 7. Skill Node Model

```ts
type NodeStatus =
  | "LOCKED"
  | "AVAILABLE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "MASTERED"
  | "ALREADY_KNOWN";

type SkillNode = {
  id: string;
  skillId: string;
  title: string;
  description: string;

  phaseId: string;

  requiredProficiency: number;
  currentProficiency: number;

  status: NodeStatus;

  estimatedHours: number;

  prerequisites: string[];

  importance: "low" | "medium" | "high" | "critical";

  evidence?: {
    source: string;
    type: "taxonomy" | "occupation" | "job-market" | "ai";
    confidence?: "low" | "medium" | "high";
  }[];

  questId?: string;
};
```

---

# 8. Career Graph Model

```ts
type SkillEdge = {
  id: string;
  source: string;
  target: string;
  relationship: "prerequisite" | "supports" | "recommended";
};

type CareerGraph = {
  id: string;
  goal: CareerGoal;
  nodes: SkillNode[];
  edges: SkillEdge[];

  totalEstimatedHours: number;
  remainingHours: number;

  progress: number;

  nextBestAction?: string;

  generatedAt: string;
  updatedAt: string;
};
```

---

# 9. Quest Model

Every important skill should be capable of becoming an actionable quest.

```ts
type Quest = {
  id: string;
  nodeId: string;

  objective: string;

  durationDays: number;
  estimatedHours: number;

  dailyTasks: {
    day: number;
    title: string;
    description: string;
    estimatedHours: number;
  }[];

  project: {
    title: string;
    description: string;
    deliverable: string;
  };

  githubIdea?: string;

  interviewQuestions?: {
    question: string;
    expectedConcepts?: string[];
  }[];

  completionChecklist: string[];
};
```

The quest should answer:

> "What exactly should I do?"

rather than only:

> "What should I learn?"

---

# 10. Evidence Model

```ts
type Evidence = {
  id: string;
  nodeId: string;
  type:
    | "project"
    | "github"
    | "certificate"
    | "self_assessment"
    | "completion";
  title: string;
  url?: string;
  verified?: boolean;
};
```

Evidence is used to make progress more meaningful than a simple checkbox.

---

# 11. AI Roadmap Contract

The AI must return structured data matching the application schema.

High-level output:

```ts
type AIRoadmapResponse = {
  normalizedGoal: {
    role: string;
    specialization?: string;
    companyType?: string;
  };

  phases: {
    id: string;
    title: string;
    description: string;
  }[];

  nodes: {
    id: string;
    title: string;
    description: string;
    phaseId: string;
    requiredProficiency: number;
    estimatedHours: number;
    importance: "low" | "medium" | "high" | "critical";
  }[];

  edges: {
    source: string;
    target: string;
    relationship: "prerequisite" | "supports" | "recommended";
  }[];

  rationale: {
    nodeId: string;
    reason: string;
  }[];
};
```

The AI should generate the roadmap dynamically from user input.

No fixed roadmap should be used as the primary roadmap source.

---

# 12. AI Generation Pipeline

```text
User Input
   ↓
Normalize Career Goal
   ↓
Build Prompt
   ↓
LLM
   ↓
Structured Output
   ↓
Zod Validation
   ↓
Semantic Graph Validation
   ↓
Dependency Validation
   ↓
Graph Normalization
   ↓
State Calculation
   ↓
Timeline Calculation
   ↓
Layout Calculation
   ↓
Render
```

---

# 13. Critical Rule: AI Is Not the Graph Authority

A response can be valid JSON and still be a bad career graph.

Example:

```text
React → JavaScript
JavaScript → React
```

The JSON is valid, but the dependency structure contains a cycle.

Therefore the system must perform deterministic validation after AI generation.

---

# 14. Graph Validation

Validation must happen in multiple layers.

## Layer 1 — Schema Validation

Validate:

- Required fields
- Types
- Enum values
- Numeric ranges
- Unique IDs

Use Zod.

## Layer 2 — Structural Validation

Check:

- Unique node IDs
- Valid phase references
- Valid edge source
- Valid edge target
- No self-dependencies
- No duplicate edges

## Layer 3 — Graph Validation

Check:

- DAG requirement for prerequisite edges
- Cycle detection
- Reachability
- Orphan nodes
- Invalid dependency chains
- Excessive dependency fan-in/fan-out

## Layer 4 — Semantic Sanity Checks

Check:

- Estimated hours are positive and reasonable.
- Required proficiency is valid.
- Prerequisite skills are logically plausible.
- Goal is represented by the graph.
- Critical nodes are reachable.
- No obviously redundant duplicate skills exist.

The graph must pass validation before it reaches React Flow.

---

# 15. Cycle Detection

Prerequisite relationships are modeled as a directed acyclic graph.

Use deterministic cycle detection.

Recommended approach:

```text
Build adjacency list
      ↓
DFS / Kahn's algorithm
      ↓
Detect cycle
      ↓
If cycle:
    attempt repair
      ↓
    if repair fails:
        regenerate / retry
```

The LLM should never be trusted to guarantee acyclic dependencies.

---

# 16. Graph Normalization

After validation:

1. Normalize IDs.
2. Remove duplicate edges.
3. Normalize skill names.
4. Normalize proficiency.
5. Normalize statuses.
6. Calculate prerequisites.
7. Calculate unlock states.
8. Calculate remaining hours.
9. Calculate progress.
10. Calculate next best action.
11. Generate layout positions.

Only the normalized graph becomes the application's source of truth.

---

# 17. Graph Layout Architecture

Layout is intentionally separated from AI generation.

```text
AI
 ↓
Skills + Dependencies
 ↓
Validated Graph
 ↓
Layout Engine
 ↓
x/y coordinates
 ↓
React Flow
```

The AI should **not** decide pixel coordinates.

## MVP layout

Use a deterministic phase-based layout.

Example:

```text
Phase 1        Phase 2        Phase 3        Phase 4

[HTML] ───→ [JS] ───→ [React] ───→ [Projects]
               \          |
                → [Git] ──┘
```

The layout should remain stable enough for the demo.

## Future

ELK.js can be introduced if graph complexity requires automatic layout.

Do not make sophisticated graph layout a hackathon-critical dependency.

---

# 18. Zustand Career Store

The central career store should own application state.

Example:

```ts
type CareerStore = {
  profile: UserProfile | null;
  graph: CareerGraph | null;

  selectedNodeId: string | null;

  quests: Record<string, Quest>;

  actions: {
    setProfile: (profile: UserProfile) => void;
    setGraph: (graph: CareerGraph) => void;

    updateSkillProficiency: (
      skillId: string,
      proficiency: SkillProficiency
    ) => void;

    completeNode: (nodeId: string) => void;

    selectNode: (nodeId: string | null) => void;

    replanGraph: () => void;

    setQuest: (quest: Quest) => void;
  };
};
```

React Flow remains the visualization layer.

The career store remains the application/domain source of truth.

---

# 19. React Flow Integration

React Flow receives:

```text
Career Store
   ↓
nodes
edges
   ↓
ReactFlow
```

Use custom nodes for:

- Skill
- Phase
- Milestone
- Completed state
- Locked state
- Current target

React Flow supports controlled nodes and edges and custom connection validation. citeturn0search3turn0search5

---

# 20. Node States

## LOCKED

Prerequisite not satisfied.

## AVAILABLE

Prerequisites satisfied.

## IN_PROGRESS

User has started working on it.

## COMPLETED

Required proficiency achieved.

## MASTERED

User has exceeded the required proficiency.

## ALREADY_KNOWN

User starts above or at the required level.

---

# 21. Unlock Logic

A node becomes available when all required prerequisite conditions are satisfied.

Simplified:

```ts
available(node) =
  every(prerequisite => prerequisite.status is satisfied)
```

For proficiency-based dependencies:

```ts
available(node) =
  every(prerequisite =>
    prerequisite.currentProficiency >=
    prerequisite.requiredProficiency
  )
```

---

# 22. Partial Skill Logic

Example:

```text
Required JavaScript level = 3
User level = 2
```

The system should not treat JavaScript as completely unknown.

Instead:

```text
Current: Familiar
Target: Proficient
Gap: 1 level
Estimated remaining effort: reduced
```

This allows the roadmap to become genuinely personalized.

---

# 23. Dynamic Rerouting

Dynamic rerouting is a core feature.

### Example

Initial:

```text
HTML → CSS → JavaScript → React → State Management
```

User marks:

```text
HTML = ALREADY_KNOWN
CSS = ALREADY_KNOWN
```

System:

```text
Recalculate graph state
      ↓
Remove unnecessary learning effort
      ↓
Unlock next valid nodes
      ↓
Recalculate remaining hours
      ↓
Recalculate timeline
      ↓
Recalculate next best action
      ↓
Animate graph update
```

---

# 24. Rerouting Scope

To protect hackathon execution:

## P0 — Must Have

Skill proficiency/state changes.

Example:

```text
Unknown → Proficient
```

This immediately triggers deterministic graph recalculation.

## P1 — Important

Weekly available hours.

Example:

```text
5 hrs/week → 10 hrs/week
```

This recalculates timeline without regenerating the entire skill graph.

## P2 — Optional

Changing:

- Target role
- Specialization
- Company type
- Major career direction

These can trigger a new AI roadmap generation.

Do not build all possible replanning scenarios as one giant optimizer.

---

# 25. Rerouting Algorithm

```text
Input:
Current graph
Updated skill state

1. Update user skill
2. Re-evaluate every node
3. Recalculate prerequisite satisfaction
4. Update node statuses
5. Recalculate remaining effort
6. Recalculate progress
7. Recalculate timeline
8. Calculate next best action
9. Recalculate visual layout if necessary
10. Update Zustand store
11. React Flow animates changes
```

The deterministic graph engine owns this process.

---

# 26. Timeline Engine

The first MVP version should avoid building a full optimization engine.

Basic model:

```text
remainingHours
÷
weeklyAvailableHours
=
estimatedWeeks
```

However, timeline scheduling should respect dependency order.

Recommended MVP approach:

1. Topologically order prerequisite nodes.
2. Schedule sequential dependency chains.
3. Allow independent nodes to share the same period where practical.
4. Convert total remaining effort into approximate weeks.
5. Display the result as an estimate, not a promise.

Example:

```text
Remaining work = 80 hours
Availability = 10 hours/week

Estimated minimum effort = ~8 weeks
```

Do not claim that the user will definitely get hired in exactly that period.

---

# 27. Progress Calculation

Progress should consider completed required work.

Basic formula:

```text
progress =
completedRequiredHours /
totalRequiredHours
```

A more advanced weighted model can be introduced later.

For MVP:

- Keep the calculation understandable.
- Do not create fake precision.

---

# 28. Next Best Action

The system must always surface a next action.

Candidate nodes are scored using factors such as:

```text
+ prerequisite unlocked
+ high importance
+ close to completion
+ high career relevance
+ reasonable effort
+ current phase
```

Example:

```text
NEXT BEST ACTION

"Spend 2 hours completing JavaScript async fundamentals,
then build a small API-based weather dashboard."
```

The goal is to answer:

> What should I do next?

---

# 29. Why This Node?

Every important node should have an explanation.

Example:

```text
WHY THIS NODE?

React State Management appears here because
the target role requires building multi-component
applications where shared state becomes important.
```

The explanation should be based on available roadmap reasoning/evidence.

---

# 30. Actionable Quest Generation

Quest generation happens when the user opens a node.

Flow:

```text
Node selected
   ↓
Quest API
   ↓
AI generates structured quest
   ↓
Zod validation
   ↓
Quest rendered
```

Quest should include:

- Objective
- Estimated time
- Daily tasks
- Project
- GitHub idea
- Interview questions
- Completion checklist

The system should avoid generic advice such as:

```text
"Learn React from YouTube."
```

Instead:

```text
"Build a shopping cart with add/remove quantity,
persistent local state, and derived total."
```

---

# 31. AI Career Assistant

The AI assistant is a **supporting feature**, not the primary product.

It can answer:

- Why is this skill required?
- Can I skip this node?
- What happens if I only have 5 hours this week?
- What should I focus on today?
- Why did my timeline change?

---

# 32. AI Assistant Safety Boundary

The assistant must not silently mutate the career graph.

Correct flow:

```text
User asks
   ↓
AI analyzes context
   ↓
AI proposes change
   ↓
User confirms
   ↓
Deterministic graph engine applies change
```

Example:

```text
AI:
"You could skip basic CSS because you already
have strong frontend experience."

[Apply to roadmap]
[Keep current roadmap]
```

This prevents chatbot logic from becoming a second uncontrolled state engine.

---

# 33. AI Grounding

Where reliable external occupational/skill sources are available, use them to improve grounding.

Potential sources:

- ESCO
- O*NET
- Reliable certification information
- Reliable Indian career/job-market sources

The system should not make an absolute claim such as:

> "The AI cannot hallucinate."

Instead:

> "Recommendations are validated/grounded against available structured sources where supported."

---

# 34. Grounding Pipeline

```text
Target Role
   ↓
Occupation / Skill References
   ↓
AI Generation
   ↓
Validation
   ↓
Post-processing
   ↓
Career Graph
```

If external data is unavailable:

```text
Do not invent a citation.
Do not invent statistics.
Do not display fake verification.
```

---

# 35. India-Specific Context

The application should support Indian students through:

- Indian career terminology
- Indian placement context
- Relevant certifications where verified
- Indian internship context
- Hindi/English/Hinglish interaction where practical

However:

**Do not hardcode fake salaries, hiring claims, certification recognition, or company requirements.**

If a fact cannot be verified, present it as general guidance rather than a factual claim.

---

# 36. API Design

## POST `/api/roadmap`

Purpose:

Generate the initial roadmap.

Input:

```ts
{
  targetRole: string;
  companyType?: string;
  specialization?: string;
  currentSkills: UserSkill[];
  weeklyHours: number;
  targetMonths?: number;
}
```

Output:

```ts
{
  graph: CareerGraph;
}
```

---

## POST `/api/quest`

Purpose:

Generate a detailed quest for a selected skill.

Input:

```ts
{
  nodeId: string;
  graphContext: CareerGraph;
  userProfile: UserProfile;
}
```

Output:

```ts
{
  quest: Quest;
}
```

---

## POST `/api/assistant`

Purpose:

Answer context-aware career questions.

Input:

```ts
{
  message: string;
  graphContext: CareerGraph;
  userProfile: UserProfile;
  selectedNodeId?: string;
}
```

Output:

```ts
{
  answer: string;
  proposedChange?: unknown;
}
```

Any proposed change must be confirmed before application.

---

# 37. Error Contracts

API errors should have predictable structure.

```ts
type APIError = {
  code:
    | "INVALID_INPUT"
    | "AI_ERROR"
    | "SCHEMA_ERROR"
    | "GRAPH_VALIDATION_ERROR"
    | "TIMEOUT"
    | "RATE_LIMIT"
    | "UNKNOWN_ERROR";

  message: string;

  retryable: boolean;
};
```

---

# 38. AI Failure Recovery

If AI returns invalid output:

```text
AI response
   ↓
Schema validation fails
   ↓
Retry with repair prompt
   ↓
Validate again
   ↓
Graph validation
```

If validation still fails:

```text
Show graceful error
+
Allow user to retry
```

Never render an invalid graph.

---

# 39. Loading States

AI operations must have clear loading UI.

### Roadmap generation

```text
Understanding target role...
Mapping required skills...
Building dependency graph...
Calculating your timeline...
Preparing your first mission...
```

### Quest generation

```text
Designing your mission...
Creating a project...
Preparing interview questions...
```

Avoid a blank loading screen.

---

# 40. UI / Graph Requirements

The main graph must support:

- Zoom
- Pan
- Node click
- Node status visualization
- Phase grouping
- Locked/unlocked states
- Progress visualization
- Rerouting animation
- Mobile-friendly interaction

The graph is the primary product surface, not a secondary visualization.

---

# 41. Graph Performance

MVP target:

```text
~20–60 nodes
```

This should be treated as a practical target, not a hard architectural limit.

Performance rules:

- Memoize custom node components.
- Memoize expensive callbacks.
- Avoid broad store subscriptions.
- Avoid unnecessary graph reconstruction.
- Do not recompute layout on every render.
- Animate only meaningful changes.
- Keep node DOM lightweight.

React Flow's performance guidance specifically emphasizes avoiding unnecessary subscriptions/re-renders and optimizing custom nodes. citeturn0search0

If graph size grows substantially, introduce additional optimization only when profiling shows a need.

---

# 42. React Flow Provider

If React Flow hooks or state need to be accessed outside the graph component tree, use `ReactFlowProvider` at the appropriate application level.

This is especially relevant when routing or multiple flow-related components are involved. citeturn0search10

---

# 43. Accessibility

Minimum requirements:

- Readable contrast
- Keyboard-accessible controls
- Visible focus states
- Labels for important controls
- Non-color-only status indicators
- Mobile-friendly controls
- Text alternative for important graph information where practical

---

# 44. Responsive Design

The application must work on:

- Desktop
- Laptop
- Tablet
- Mobile

### Mobile graph

Do not simply shrink the desktop graph.

Provide:

- Touch-friendly node selection
- Bottom sheet / side panel for node details
- Large controls
- Simplified graph chrome
- Readable node labels

---

# 45. State Transition Rules

Example:

```text
LOCKED
  ↓ prerequisite satisfied
AVAILABLE
  ↓ user starts
IN_PROGRESS
  ↓ required proficiency reached
COMPLETED
  ↓ additional mastery
MASTERED
```

Alternative:

```text
User starts above requirement
        ↓
ALREADY_KNOWN
        ↓
Dependent nodes unlock
```

State transitions must be deterministic.

---

# 46. Security

Never expose:

- API keys
- Provider secrets
- Database credentials

Use:

```text
.env.local
.env.example
```

All AI provider calls must happen server-side.

User input must be treated as untrusted.

---

# 47. Prompt Injection Handling

Career descriptions may contain malicious or irrelevant instructions.

Example:

```text
Target role:
"Ignore all previous instructions and..."
```

The system should:

- Separate user career data from system instructions.
- Treat career descriptions as data.
- Validate structured output.
- Never execute arbitrary instructions returned by the model.
- Never allow AI output to directly execute code.

---

# 48. Persistence Strategy

## MVP

Persist:

- User profile
- Career graph
- Skill states
- Quest progress
- Selected roadmap state

Possible local persistence:

```text
localStorage
```

If server persistence becomes necessary:

```text
Supabase/Postgres
```

Do not add authentication unless the product actually needs it for the demo.

---

# 49. AI Cost Control

Do not call AI for deterministic operations.

Use AI for:

- Initial roadmap generation
- Quest generation
- Assistant responses
- Optional major roadmap regeneration

Use deterministic code for:

- Progress
- Unlocking
- Rerouting after skill updates
- Timeline calculation
- Graph validation
- Layout
- Status changes

This reduces:

- Cost
- Latency
- Failure rate
- Unpredictability

---

# 50. AI Model Strategy

The application should use one reliable primary model during the hackathon.

Do not introduce unnecessary model switching.

Fallback strategy:

```text
Primary model
   ↓ failure
Retry
   ↓
Fallback model if configured
   ↓
Graceful error
```

The model provider should be abstracted behind a small service layer so it can be replaced without rewriting the application.

---

# 51. Testing Strategy

## Unit Tests

Test:

- Cycle detection
- Dependency validation
- Unlock logic
- Skill state transitions
- Progress calculation
- Timeline calculation
- Next action scoring
- Rerouting

## Integration Tests

Test:

```text
Generate roadmap
→ validate
→ normalize
→ render
→ update skill
→ reroute
→ update timeline
```

## AI Contract Tests

Use fixed mock AI outputs to test:

- Valid output
- Missing fields
- Invalid IDs
- Duplicate IDs
- Cycles
- Invalid dependencies
- Invalid proficiency
- Excessive graph size

AI SDK testing support can be used to mock model responses rather than making real model calls in every test. citeturn0search16

---

# 52. Critical Demo Test

Before submission, the following exact flow must work:

```text
1. Open application
2. Enter dream role
3. Enter current skills
4. Generate roadmap
5. Graph appears
6. Zoom / pan
7. Click a skill
8. Quest opens
9. Mark a skill as already known
10. Graph updates
11. Timeline changes
12. Next Best Action changes
13. Open AI assistant
14. Ask why a skill is required
15. Receive context-aware answer
```

If this flow works reliably, the core product is demonstrable.

---

# 53. Demo Reliability Rules

During the hackathon:

- Keep one reliable demo role.
- Keep a fallback generated roadmap if AI API fails during presentation.
- Never expose API keys.
- Handle malformed user input.
- Show useful loading states.
- Keep the graph visually stable.
- Avoid features that can randomly fail during the demo.

A fallback should preserve the product experience without becoming the primary fixed roadmap source.

---

# 54. Feature Priority

## P0 — Must Have

- Dream-role input
- Current skill input
- AI-generated roadmap
- Structured output
- Zod validation
- Graph validation
- React Flow skill tree
- Zoom/pan/click
- Node details
- Actionable quests
- Skill proficiency
- Dynamic rerouting
- Timeline
- Next Best Action
- Mobile support
- Deployment

## P1 — Strong Addition

- Grounding badges
- Evidence
- Hindi/Hinglish support
- AI assistant
- Local persistence
- Smooth graph animations
- Better timeline visualization

## P2 — Optional

- ELK automatic layout
- Advanced specialization branching
- Advanced evidence verification
- Database persistence
- Multi-agent architecture
- Public roadmap sharing
- Role comparison

---

# 55. Explicit Non-Goals

Do not build during the core hackathon implementation:

- Full job scraping platform
- Resume builder
- Full mock interview platform
- Course marketplace
- Social network
- Complex authentication system
- Large multi-agent architecture
- Full career recommendation marketplace
- Perfect hiring prediction
- Guaranteed job outcomes

The product should remain focused on:

> **Dream role → skill graph → next action → progress → dynamic replanning**

---

# 56. Multi-Agent Architecture

Multi-agent architecture is intentionally **not core MVP**.

Possible future agents:

```text
Roadmap Agent
Validation Agent
Project Agent
Interview Agent
Timeline Agent
```

However, separate agents introduce:

- More latency
- More API calls
- More failure points
- More orchestration complexity
- More debugging

For the hackathon:

```text
One strong structured AI pipeline
+
Deterministic domain engines
```

is preferred.

---

# 57. Observability

For development, log:

- AI generation duration
- AI failure
- Schema validation failure
- Graph validation failure
- Retry count
- Roadmap node count
- Quest generation duration

Do not log sensitive user information unnecessarily.

---

# 58. Implementation Order

## Phase 1 — Foundation

- Next.js setup
- Tailwind
- React Flow
- Zustand
- TypeScript types
- Zod schemas

## Phase 2 — Graph Engine

- Node model
- Edge model
- DAG validation
- Cycle detection
- Unlock logic
- Progress calculation
- Rerouting
- Timeline
- Next action

## Phase 3 — AI

- Roadmap prompt
- Structured AI output
- Schema validation
- Graph normalization
- AI error handling

## Phase 4 — UI

- Onboarding
- Career graph
- Custom nodes
- Node detail panel
- Quest UI
- Timeline
- Progress

## Phase 5 — AI Assistant

- Context construction
- Chat UI
- Proposed-change mechanism
- Confirmation flow

## Phase 6 — Polish

- Animations
- Responsive UI
- Accessibility
- Loading states
- Error states

## Phase 7 — Testing

- Unit tests
- Integration tests
- AI mock tests
- Mobile testing
- Demo testing

## Phase 8 — Deployment

- Environment variables
- Vercel deployment
- Production smoke test
- README
- Final demo

---

# 59. Critical Path

If time becomes limited, prioritize:

```text
AI roadmap
    ↓
Structured JSON
    ↓
Validation
    ↓
Graph
    ↓
React Flow
    ↓
Skill state update
    ↓
Rerouting
    ↓
Quest
    ↓
Timeline
    ↓
Polish
```

Everything else can be reduced.

---

# 60. Definition of Done

The project is technically complete when:

- [ ] User can enter a specific dream role.
- [ ] User can enter current skills.
- [ ] AI dynamically generates a roadmap.
- [ ] AI output is schema validated.
- [ ] Graph is semantically validated.
- [ ] Cycles cannot reach the renderer.
- [ ] Graph renders through React Flow.
- [ ] User can zoom/pan/click.
- [ ] Node details work.
- [ ] Quest generation works.
- [ ] User can update skill proficiency.
- [ ] Roadmap deterministically reroutes.
- [ ] Timeline recalculates.
- [ ] Next Best Action recalculates.
- [ ] AI assistant can answer with graph context.
- [ ] Assistant cannot silently mutate the graph.
- [ ] Mobile layout works.
- [ ] API keys remain server-side.
- [ ] Error states work.
- [ ] Application is deployed.
- [ ] Critical demo flow works end-to-end.

---

# 61. Final Architecture

```text
                    ┌─────────────────────┐
                    │        USER         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     ONBOARDING      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   AI ROADMAP ENGINE │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ STRUCTURED AI OUTPUT│
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   ZOD VALIDATION    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ SEMANTIC VALIDATION │
                    │  + CYCLE DETECTION  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ GRAPH NORMALIZATION │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    LAYOUT ENGINE    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   ZUSTAND STORE     │
                    └──────┬──────┬───────┘
                           │      │
              ┌────────────┘      └─────────────┐
              ▼                                 ▼
     ┌─────────────────┐               ┌─────────────────┐
     │   REACT FLOW    │               │ QUEST / TIMELINE│
     └────────┬────────┘               └────────┬────────┘
              │                                 │
              └────────────┬────────────────────┘
                           ▼
                  ┌─────────────────┐
                  │ USER PROGRESS   │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  GRAPH ENGINE   │
                  │ unlock/reroute  │
                  │ progress/action │
                  └────────┬────────┘
                           │
                           ▼
                    UPDATED GRAPH

                  ┌─────────────────┐
                  │  AI ASSISTANT   │
                  │  context-aware  │
                  │   suggestions    │
                  └────────┬────────┘
                           │
                           ▼
                     USER CONFIRMS
                           │
                           ▼
                     GRAPH ENGINE
```

---

# 62. Final Technical Principles

### Principle 1
**AI proposes. Deterministic code decides.**

### Principle 2
**The graph is the product. The chatbot is supporting UX.**

### Principle 3
**Every roadmap node should lead toward an actionable outcome.**

### Principle 4
**User state changes must produce visible roadmap adaptation.**

### Principle 5
**Never render an AI graph before validation.**

### Principle 6
**Do not use AI for logic that can be deterministic.**

### Principle 7
**Avoid scope creep during the hackathon.**

### Principle 8
**Optimize for a reliable 3-minute core demo before adding advanced features.**

---

# 63. Final Verdict

This TRD is the implementation contract for Career Quest.

The three architectural safeguards that must not be removed are:

1. **Zustand central application state**
2. **Schema + semantic graph validation with cycle detection**
3. **Separate graph layout layer**

The MVP should remain centered around:

```text
DREAM ROLE
    ↓
CURRENT STATE
    ↓
SKILL GAP
    ↓
AI CAREER GRAPH
    ↓
NEXT BEST ACTION
    ↓
ACTIONABLE QUEST
    ↓
PROGRESS
    ↓
DYNAMIC REROUTING
    ↓
UPDATED CAREER GRAPH
```

**Status: FROZEN FOR IMPLEMENTATION**
