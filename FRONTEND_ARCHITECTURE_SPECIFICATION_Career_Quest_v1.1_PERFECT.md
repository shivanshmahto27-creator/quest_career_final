# FRONTEND ARCHITECTURE SPECIFICATION — Career Quest
## Version 1.0 — Implementation Ready / Frozen

> **Purpose:** Define the complete frontend architecture for Career Quest so implementation can proceed consistently across Next.js, React, React Flow, state management, API integration, responsive behavior, accessibility, performance, and error handling.

---

# 1. FRONTEND ARCHITECTURE PRINCIPLE

Career Quest is not a dashboard with a chatbot attached.

The frontend must make the **career graph and Next Best Action** the primary experience.

```text
USER
 ↓
UI
 ↓
CLIENT STATE
 ↓
API
 ↓
DOMAIN RESPONSE
 ↓
GRAPH / PROGRESS / QUEST UI
```

The frontend must never become the source of truth for career logic.

```text
Frontend = presentation + interaction
API = controlled application boundary
Graph Engine = domain authority
Database = persistence
AI = proposal generation
```

---

# 2. PRIMARY FRONTEND GOALS

The frontend must provide:

1. Interactive career graph.
2. Clear current-state visibility.
3. Explicit Next Best Action.
4. Actionable quest experience.
5. Instant visual feedback after skill updates.
6. Responsive desktop/mobile experience.
7. Accessible interaction.
8. Fast initial rendering.
9. Predictable loading/error states.
10. No duplicated business logic.

---

# 3. RECOMMENDED STACK

## Core

```text
Next.js
React
TypeScript
```

## Graph

```text
React Flow / @xyflow/react
```

## Styling

```text
Tailwind CSS
```

## UI primitives

```text
shadcn/ui or equivalent accessible primitives
```

## Animation

```text
Framer Motion
```

## Validation

```text
Zod
```

## Server communication

```text
fetch / typed API client
```

## Client state

Recommended:

```text
Zustand
```

Use server state and local UI state separately.

Do not put every API response into one global store.

---

# 4. FRONTEND RESPONSIBILITY BOUNDARY

The frontend MAY:

- render roadmap
- select nodes
- pan/zoom graph
- open node details
- update local UI state
- send user actions to API
- display progress
- show quests
- display assistant responses
- optimistically update safe UI
- display validation/errors

The frontend MUST NOT:

- calculate authoritative node state
- calculate authoritative prerequisites
- decide whether a node is unlocked
- calculate official timeline
- activate AI-generated roadmap
- directly modify database
- bypass API authorization
- independently reroute the graph
- treat AI output as trusted domain state

---

# 5. APPLICATION STRUCTURE

Recommended Next.js structure:

```text
src/
├── app/
│   ├── page.tsx
│   ├── onboarding/
│   ├── roadmap/
│   ├── quest/
│   ├── assistant/
│   ├── settings/
│   └── api/
│
├── components/
│   ├── graph/
│   ├── roadmap/
│   ├── quest/
│   ├── assistant/
│   ├── onboarding/
│   ├── progress/
│   ├── ui/
│   └── layout/
│
├── features/
│   ├── roadmap/
│   ├── skills/
│   ├── quests/
│   ├── progress/
│   └── assistant/
│
├── lib/
│   ├── api/
│   ├── validation/
│   ├── graph/
│   ├── formatting/
│   └── utils/
│
├── hooks/
├── stores/
├── types/
└── constants/
```

Feature-specific logic should remain close to the feature.

---

# 6. ROUTING ARCHITECTURE

Primary routes:

```text
/
├── onboarding
├── roadmap
├── roadmap/[roadmapId]
├── quest/[questId]
├── assistant
└── settings
```

Optional authentication routes:

```text
/login
/signup
```

The exact authentication implementation may vary.

---

# 7. ROUTE RESPONSIBILITIES

## `/`

Purpose:

```text
Landing / entry
```

Must communicate:

- what Career Quest does
- target role → roadmap concept
- graph-first experience
- CTA to start

---

## `/onboarding`

Purpose:

Collect minimum information required to generate the first roadmap.

Example:

```text
Target role
Current experience
Known skills
Weekly available hours
Preferred specialization
Optional constraints
```

Do not ask unnecessary questions before the first roadmap.

---

## `/roadmap`

Purpose:

Primary product screen.

Contains:

```text
Header
Progress summary
Career graph
Next Best Action
Selected node panel
Filters / controls
```

---

## `/roadmap/[roadmapId]`

Purpose:

Load a specific roadmap revision and its current derived state.

---

## `/quest/[questId]`

Purpose:

Turn one roadmap skill/milestone into an executable mission.

---

## `/assistant`

Purpose:

Context-aware AI assistant.

The assistant supports the graph; it does not replace it.

---

# 8. PAGE COMPOSITION

Primary roadmap layout:

```text
┌───────────────────────────────────────────┐
│ Header / Target Role / Progress           │
├───────────────────────┬───────────────────┤
│                       │                   │
│                       │ Selected Node /   │
│    CAREER GRAPH       │ Next Best Action  │
│                       │                   │
│                       │                   │
├───────────────────────┴───────────────────┤
│ Mobile bottom action / contextual panel    │
└───────────────────────────────────────────┘
```

Desktop:

```text
Graph = dominant area
Details = secondary area
```

Mobile:

```text
Graph
↓
Selected node
↓
Next Best Action
↓
Quest
```

---

# 9. GRAPH ARCHITECTURE

React Flow is a rendering layer only.

```text
API Graph
   ↓
Graph Adapter
   ↓
React Flow Nodes/Edges
   ↓
Visual Interaction
```

Never make React Flow's internal state the authoritative graph state.

---

# 10. GRAPH DATA ADAPTER

Backend/domain graph:

```ts
type CareerGraph = {
  nodes: CareerNode[];
  edges: CareerEdge[];
  revision: number;
};
```

Frontend adapter:

```ts
function toReactFlowGraph(
  graph: CareerGraph
): {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
}
```

The adapter owns visual concerns such as:

```text
position
style
icons
labels
handles
selected state
```

It must not invent domain state.

---

# 11. NODE VISUAL STATES

Node rendering must clearly distinguish:

```text
LOCKED
AVAILABLE
IN_PROGRESS
COMPLETED
MASTERED
ALREADY_KNOWN
```

Suggested visual hierarchy:

```text
LOCKED
→ muted / low emphasis

AVAILABLE
→ strongest actionable emphasis

IN_PROGRESS
→ progress indicator

COMPLETED
→ completion indicator

MASTERED
→ highest achievement state

ALREADY_KNOWN
→ compact completed/known treatment
```

Do not rely on color alone.

Use:

```text
icon
text
border
shape
state label
```

for accessibility.

---

# 12. NODE TYPES

Recommended domain node categories:

```text
ROOT
PHASE
SKILL
PROJECT
MILESTONE
CHECKPOINT
```

Frontend may render different visual templates.

Example:

```text
ROOT
  ↓
PHASE
  ↓
SKILL
  ↓
PROJECT
  ↓
MILESTONE
```

The exact domain type must come from the backend contract.

---

# 13. NODE INTERACTION

Clicking a node:

```text
select node
↓
open details
↓
show current state
↓
show prerequisites
↓
show why locked/available
↓
show Next Best Action
↓
show quest CTA when applicable
```

Node selection must not mutate the graph.

---

# 14. GRAPH CONTROLS

Minimum:

```text
Zoom in
Zoom out
Fit view
Pan
Mini-map optional
Reset view
```

Useful filters:

```text
All
Available
In Progress
Completed
Locked
```

Optional:

```text
Skill type
Phase
Priority
```

Avoid excessive controls in P0.

---

# 15. GRAPH PERFORMANCE

The graph should remain responsive during:

```text
pan
zoom
node selection
filtering
state refresh
```

Rules:

- avoid unnecessary global rerenders
- memoize stable node components
- avoid recreating all objects on every render
- debounce expensive viewport operations
- use incremental updates where possible
- lazy-load non-critical panels

If graph size becomes large:

```text
viewport culling
collapsed branches
progressive rendering
```

may be introduced.

---

# 16. GRAPH LAYOUT

The frontend should not independently calculate authoritative graph topology.

Layout may be calculated client-side.

Recommended:

```text
DAG
 ↓
layout algorithm
 ↓
x/y positions
 ↓
React Flow
```

Possible layout engines:

```text
ELK
Dagre
custom deterministic layout
```

Layout changes must never change:

```text
dependencies
node state
critical path
timeline
```

---

# 17. GRAPH VIEWPORT PERSISTENCE

Optionally persist:

```text
zoom
x/y viewport
collapsed branches
selected node
```

These are UI preferences, not domain state.

Never include viewport coordinates in graph revision semantics.

---

# 18. NEXT BEST ACTION COMPONENT

The Next Best Action is a first-class component.

Example:

```text
NEXT BEST ACTION

Learn:
JavaScript Async/Await

Why:
Required by 3 upcoming backend skills.

Estimated:
4–6 hours

Action:
Start Quest →
```

It should answer:

```text
What should I do next?
Why?
How much effort?
What unlocks after this?
```

---

# 19. NEXT BEST ACTION DATA

Frontend consumes backend output:

```ts
type NextBestAction = {
  nodeId: string;
  actionType: string;
  title: string;
  reason: string;
  estimatedHours?: number;
  priority: number;
  questId?: string;
};
```

Do not derive the official action client-side.

---

# 20. SELECTED NODE PANEL

Panel sections:

```text
Skill / milestone title
State
Description
Why this matters
Prerequisites
Current proficiency
Target proficiency
Estimated effort
Unlocks
Next action
Quest CTA
```

For locked nodes:

```text
Why locked
Missing prerequisites
```

For completed nodes:

```text
Evidence
Completion date
Next dependent milestone
```

---

# 21. QUEST EXPERIENCE

A quest should feel executable.

Structure:

```text
Quest title
Goal
Estimated time
Difficulty
Why this matters
Daily plan
Concrete project
GitHub idea
Interview questions
Completion checklist
Mark complete
```

Example:

```text
QUEST
Build a REST API with authentication

Time:
6 hours

Plan:
Day 1 — routes + controllers
Day 2 — authentication
Day 3 — testing + README

Deliverable:
GitHub repository
```

---

# 22. QUEST COMPLETION FLOW

```text
User opens quest
      ↓
works on task
      ↓
checks completion criteria
      ↓
submits completion
      ↓
API validates action
      ↓
Graph Engine updates state
      ↓
new graph revision
      ↓
frontend refreshes
      ↓
new Next Best Action
```

The frontend must not directly set the next node to AVAILABLE.

---

# 23. OPTIMISTIC UI POLICY

Optimistic updates are allowed only for low-risk UI state:

```text
panel open/close
filter
selection
local checkbox
```

Avoid optimistic mutation for authoritative state:

```text
skill completion
proficiency
roadmap regeneration
timeline
node state
```

For authoritative mutations:

```text
submit
↓
server response
↓
apply canonical response
```

---

# 24. API CLIENT

Create one typed API layer.

Example:

```text
lib/api/
├── client.ts
├── roadmap.ts
├── skills.ts
├── quests.ts
└── assistant.ts
```

Components must not contain raw API URLs throughout the codebase.

---

# 25. API CLIENT CONTRACT

Example:

```ts
roadmap.get(id)
roadmap.generate(input)
roadmap.regenerate(input)
roadmap.updateSkill(input)
roadmap.getNextAction(id)

quest.get(id)
quest.generate(nodeId)
quest.complete(id)

assistant.send(input)
```

Responses must be validated before entering application state.

---

# 26. RESPONSE VALIDATION

Use Zod or equivalent runtime validation.

```text
HTTP response
 ↓
parse
 ↓
schema validation
 ↓
typed domain response
 ↓
UI
```

If parsing fails:

```text
do not render corrupted state
show recoverable error
log structured diagnostic
```

---

# 27. SERVER STATE VS CLIENT STATE

## Server state

Keep server-derived data outside generic UI stores where practical:

```text
roadmap
nodes
edges
progress
quests
assistant history
```

## Client/UI state

```text
selectedNodeId
panelOpen
activeFilter
viewport
modal
toast
temporary form values
```

Do not duplicate server state in multiple stores.

---

# 28. STATE MANAGEMENT RULE

Recommended:

```text
Server data
→ query/cache layer

UI state
→ Zustand/local React state
```

If a query library is introduced:

```text
TanStack Query
```

is preferred over manually implementing cache/invalidation.

Do not add both a query cache and a second full duplicate server-state store.

---

# 29. CACHE INVALIDATION

After authoritative mutations:

```text
complete skill
→ invalidate roadmap
→ invalidate progress
→ invalidate next action
→ invalidate affected quest if necessary
```

After roadmap regeneration:

```text
invalidate roadmap
invalidate graph
invalidate progress
invalidate next action
```

The backend response should be preferred over stale cached assumptions.

---

# 30. REVISION-AWARE FRONTEND

Every roadmap response should expose:

```text
roadmapId
revision
```

The frontend should retain the latest known revision.

Mutation requests should include the revision when required by API contract.

If the server returns:

```text
REVISION_CONFLICT
```

the frontend should:

```text
refresh canonical roadmap
inform user
preserve unsaved local UI state where safe
```

---

# 31. LOADING STATES

Every async interaction needs an intentional state.

Examples:

```text
Initial graph loading
Skeleton graph
Node panel loading
Quest generation loading
AI assistant thinking
Roadmap regeneration
Skill update
```

Avoid blank screens.

---

# 32. AI LOADING UX

For AI operations:

```text
Generating your roadmap…
Analyzing dependencies…
Validating your career graph…
```

Do not claim an operation is complete until the backend confirms activation.

For long operations, show meaningful progress stages without pretending they are exact provider progress.

---

# 33. ERROR STATES

Errors should be classified:

```text
NETWORK_ERROR
AUTH_ERROR
VALIDATION_ERROR
NOT_FOUND
REVISION_CONFLICT
RATE_LIMITED
AI_UNAVAILABLE
GRAPH_INVALID
UNKNOWN
```

Each should have:

```text
human-readable explanation
recovery action
technical logging
```

---

# 34. ERROR UX EXAMPLES

AI unavailable:

```text
Career AI is temporarily unavailable.

Your current roadmap is safe.
Try generating again in a moment.

[Retry]
```

Revision conflict:

```text
Your roadmap changed in another update.

We've refreshed the latest version.

[Continue]
```

Never expose raw stack traces to users.

---

# 35. EMPTY STATES

Examples:

No roadmap:

```text
Your career quest hasn't started yet.

Choose your target role and build your path.

[Create My Roadmap]
```

No quest:

```text
No active quest for this milestone yet.

[Generate Quest]
```

No assistant history:

```text
Ask anything about your current career path.
```

---

# 36. ONBOARDING UX

Keep onboarding short.

Recommended sequence:

```text
1. Target role
2. Current level
3. Known skills
4. Weekly hours
5. Optional preferences
6. Generate roadmap
```

Progress indicator:

```text
Step 1 of 5
```

Do not require a long questionnaire before demonstrating value.

---

# 37. TARGET ROLE INPUT

Target role should accept free text.

Examples:

```text
Backend Engineer at a fintech startup
Cloud Security Engineer
SOC Analyst
Machine Learning Engineer
```

Optional structured fields may assist:

```text
role
specialization
company type
experience level
```

AI handles interpretation.

---

# 38. KNOWN SKILLS INPUT

User should be able to:

```text
search skill
select skill
set proficiency
```

Example:

```text
JavaScript
[Proficient]

HTML
[Advanced]

Git
[Familiar]
```

Known-skill input eventually maps to canonical backend skill IDs.

---

# 39. ACCESSIBILITY

Minimum:

- keyboard navigation
- visible focus
- semantic buttons
- accessible labels
- sufficient contrast
- screen-reader-friendly node details
- no color-only state communication
- reduced-motion support

React Flow graph interaction must have a non-canvas alternative.

---

# 40. GRAPH ACCESSIBILITY FALLBACK

Because graph interaction can be difficult for assistive technologies, provide:

```text
Graph view
+
Accessible roadmap list/tree view
```

The accessible representation must describe the same canonical graph state.

It must not become a second source of truth.

---

# 41. RESPONSIVE DESIGN

Breakpoints should be based on layout needs, not device names.

## Desktop

```text
Graph + persistent detail panel
```

## Tablet

```text
Graph + collapsible detail panel
```

## Mobile

```text
Graph
+
bottom sheet
```

Do not simply shrink desktop UI.

---

# 42. MOBILE GRAPH

Mobile controls:

```text
zoom
fit
selected node
filter
```

Node details should open as:

```text
bottom sheet
```

or:

```text
full-screen contextual panel
```

Avoid tiny desktop-style sidebars.

---

# 43. MOBILE QUEST

Quest should use a single-column flow:

```text
Title
Goal
Time
Why
Plan
Deliverable
Checklist
Complete
```

CTA should remain easy to reach.

---

# 44. ANIMATION SYSTEM

Use motion to communicate:

```text
state transition
node completion
panel opening
roadmap regeneration
quest completion
```

Do not animate everything.

Recommended:

```text
150–300ms
```

for micro-interactions.

Longer animation only for major transitions.

---

# 45. REDUCED MOTION

Respect:

```text
prefers-reduced-motion
```

When enabled:

```text
disable decorative graph animations
reduce transitions
keep essential state changes instantaneous
```

---

# 46. DESIGN TOKENS

Centralize:

```text
spacing
radius
typography
shadows
breakpoints
motion
z-index
```

Example:

```text
--space-1
--space-2
--space-3

--radius-sm
--radius-md
--radius-lg
```

Do not scatter arbitrary values throughout components.

---

# 47. COMPONENT ARCHITECTURE

Recommended:

```text
components/
├── graph/
│   ├── CareerGraph
│   ├── CareerNode
│   ├── CareerEdge
│   ├── GraphControls
│   └── GraphLegend
│
├── roadmap/
│   ├── RoadmapHeader
│   ├── ProgressSummary
│   ├── NextBestAction
│   └── NodeDetails
│
├── quest/
│   ├── QuestCard
│   ├── QuestPlan
│   ├── QuestChecklist
│   └── QuestCompletion
│
└── assistant/
    ├── AssistantPanel
    ├── MessageList
    └── ProposalCard
```

Prefer small composable components.

---

# 48. COMPONENT RULE

A component should generally have one clear responsibility.

Bad:

```text
CareerDashboard.tsx
→ fetches API
→ calculates graph states
→ generates layout
→ handles auth
→ renders every panel
```

Better:

```text
RoadmapPage
 ├── RoadmapQuery
 ├── CareerGraph
 ├── NextBestAction
 └── NodeDetails
```

---

# 49. DOMAIN TYPES

Centralize shared frontend types.

```text
types/
├── roadmap.ts
├── graph.ts
├── quest.ts
├── skill.ts
├── assistant.ts
├── api.ts
└── user.ts
```

Types should mirror API contracts.

Do not manually duplicate incompatible versions.

---

# 50. FRONTEND DOMAIN MODEL

Example:

```ts
type NodeState =
  | "LOCKED"
  | "AVAILABLE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "MASTERED"
  | "ALREADY_KNOWN";
```

Frontend may render these states.

Frontend must not decide when transitions are valid.

---

# 51. FORM ARCHITECTURE

Forms should use:

```text
React Hook Form
+
Zod
```

where complexity warrants it.

Validation layers:

```text
client validation
↓
API validation
↓
domain validation
```

Client validation improves UX but never replaces server validation.

---

# 52. AUTHENTICATION BOUNDARY

Frontend should know only the authenticated user's session identity required for UI.

Never trust client-provided:

```text
userId
ownerId
role
permissions
```

for authorization.

The API remains authoritative.

---

# 53. SECURITY

Frontend security requirements:

- never expose API secrets
- never ship provider keys
- avoid dangerous HTML rendering
- sanitize untrusted rendered content
- use secure cookies/session mechanisms as applicable
- never trust localStorage for authorization
- never execute AI-generated code

---

# 54. AI CONTENT RENDERING

AI-generated text must be rendered as data.

If markdown is supported:

```text
parse safely
sanitize
render
```

Never use unsafe HTML injection for raw model output.

Links from AI content should be handled safely.

---

# 55. ASSISTANT UI

Assistant should support:

```text
question
explanation
roadmap insight
proposed change
```

A proposed roadmap change should look like:

```text
PROPOSED CHANGE

Skip:
Advanced CSS

Because:
Already marked Advanced.

Impact:
Timeline decreases by ~1 week.

[Apply Change]
[Dismiss]
```

The assistant must not silently mutate the graph.

---

# 56. ASSISTANT PROPOSAL FLOW

```text
User asks
 ↓
AI responds
 ↓
AI proposes change
 ↓
Frontend displays proposal
 ↓
User confirms
 ↓
API command
 ↓
Graph Engine
 ↓
canonical response
```

---

# 57. FRONTEND OBSERVABILITY

Capture structured client events where appropriate:

```text
roadmap_loaded
node_selected
quest_opened
quest_completed
roadmap_regenerated
assistant_opened
api_error
graph_render_error
```

Avoid logging sensitive user content unnecessarily.

---

# 58. PERFORMANCE BUDGET

P0 targets:

```text
Fast initial page render
Fast graph interaction
No noticeable lag during node selection
No unnecessary full-page reload
```

Optimize in this order:

```text
correctness
↓
UX
↓
network efficiency
↓
render efficiency
↓
micro-optimizations
```

Do not prematurely optimize.

---

# 59. CODE SPLITTING

Lazy-load non-critical functionality where useful:

```text
assistant
heavy graph utilities
large modal flows
secondary settings
```

The primary roadmap experience should load first.

---

# 60. ERROR RECOVERY

Frontend recovery hierarchy:

```text
transient request failure
→ retry

stale server state
→ refetch

revision conflict
→ refresh canonical state

AI failure
→ preserve existing roadmap

rendering failure
→ fallback UI
```

Never destroy valid local UI state unnecessarily.

---

# 61. GRAPH RENDER FAILURE

If React Flow or graph transformation fails:

```text
show graph error boundary
preserve roadmap metadata
offer retry
offer accessible roadmap representation
```

Do not show a blank page.

---

# 62. TESTING STRATEGY

## Unit

Test:

```text
formatters
adapters
selectors
UI state
validation
```

## Component

Test:

```text
node states
node panel
Next Best Action
quest checklist
error states
```

## Integration

Test:

```text
API → frontend state
skill completion → refreshed graph
regeneration → new revision
```

## E2E

Critical path:

```text
onboarding
→ generate roadmap
→ graph appears
→ select node
→ open quest
→ complete action
→ graph updates
→ Next Best Action changes
```

---

# 63. FRONTEND CONTRACT TESTS

The frontend should have fixtures for:

```text
normal roadmap
locked graph
all-completed graph
ALREADY_KNOWN graph
revision conflict
AI unavailable
invalid API response
empty state
mobile viewport
```

These fixtures protect the UI from backend contract drift.

---

# 64. P0 IMPLEMENTATION PRIORITY

### Must Have

```text
Next.js app
TypeScript
responsive layout
onboarding
roadmap page
React Flow graph
node selection
node details
Next Best Action
skill update
quest view
API client
loading/error states
mobile support
basic accessibility
```

---

# 65. P1

```text
assistant
advanced graph filters
graph viewport persistence
rich animations
advanced progress visualization
accessible alternate graph view improvements
```

---

# 66. P2

```text
advanced personalization
deep analytics
advanced graph collapse
offline support
advanced performance optimization
```

---

# 67. FRONTEND DEFINITION OF DONE

Frontend is implementation-ready when:

- [ ] every primary route is defined
- [ ] graph is the primary roadmap UI
- [ ] React Flow is only a rendering layer
- [ ] backend remains source of truth
- [ ] node states are rendered consistently
- [ ] Next Best Action is explicit
- [ ] quests are executable
- [ ] API client is centralized
- [ ] API responses are runtime-validated
- [ ] server/client state is separated
- [ ] revision conflicts are handled
- [ ] loading states exist
- [ ] error states exist
- [ ] mobile layout exists
- [ ] accessibility fallback exists
- [ ] AI output is safely rendered
- [ ] assistant changes require confirmation
- [ ] no API secrets exist in frontend
- [ ] critical E2E path is testable

---

# 68. FINAL FRONTEND ARCHITECTURE

```text
                    USER
                      │
                      ▼
               ┌─────────────┐
               │ Next.js App │
               └──────┬──────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
   UI / Components          Client State
          │                       │
          └───────────┬───────────┘
                      ▼
                 API Client
                      │
                      ▼
                  Backend API
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
    Graph Engine            AI Orchestrator
          │                       │
          └───────────┬───────────┘
                      ▼
                  PostgreSQL
```

---

# 69. FINAL FRONTEND PRINCIPLE

Career Quest frontend must follow:

> **Render what the backend says. Let the user control intent. Let the Graph Engine control career logic. Let AI propose.**

The frontend should make the product feel intelligent without becoming the place where intelligence is secretly hard-coded.

The graph is the interface.

The Next Best Action is the guidance.

The quest is the execution layer.

The backend is the authority.

---

# 70. FINAL FREEZE

This specification is considered **implementation-ready** for P0.

Any future frontend changes should preserve:

```text
API contract
Graph Engine authority
AI validation boundary
revision semantics
responsive experience
accessibility baseline
```

If a feature requires violating these principles, update the relevant architecture specification before implementation.


---

# 71. DATA-FETCHING LIFECYCLE

Frontend server data follows:

```text
IDLE
 ↓
FETCHING
 ↓
SUCCESS
 ↓
STALE
 ↓
BACKGROUND REFRESH
 ↓
SUCCESS
```

Failure may occur from any network operation:

```text
FETCHING → ERROR
BACKGROUND REFRESH → STALE + ERROR
```

A background refresh failure must not unnecessarily erase valid cached data.

UI should prefer:

```text
stale valid data + refresh indicator
```

over:

```text
blank screen
```

---

# 72. CACHE AND INVALIDATION CONTRACT

Every server resource must have an explicit invalidation strategy.

Example:

```text
Skill mutation
    ↓
invalidate roadmap
invalidate progress
invalidate nextBestAction
```

```text
Quest completion
    ↓
invalidate quest
invalidate roadmap
invalidate progress
invalidate nextBestAction
```

```text
Roadmap regeneration
    ↓
invalidate roadmap
invalidate graph
invalidate progress
invalidate nextBestAction
```

Do not use arbitrary global cache clearing.

---

# 73. URL STATE SYNCHRONIZATION

URL state should be used for state that benefits from:

```text
refresh persistence
browser back/forward
deep linking
sharing
```

Examples:

```text
/roadmap/:roadmapId?node=:nodeId
/roadmap/:roadmapId?filter=available
```

Recommended URL-owned state:

```text
roadmapId
selectedNodeId
major graph filter
```

Do not put ephemeral UI state into the URL unless there is a clear UX benefit.

---

# 74. URL STATE AUTHORITY

URL state is navigation state, not domain state.

For example:

```text
?node=javascript
```

means:

```text
show JavaScript node
```

It does NOT mean:

```text
JavaScript is completed
```

The canonical node state must always come from the backend response.

If the URL references a node that does not exist:

```text
ignore invalid selection
fallback to roadmap root / no selection
```

---

# 75. BROWSER NAVIGATION CONTRACT

The application must correctly support:

```text
refresh
back
forward
deep link
new tab
```

Example:

```text
Roadmap
 ↓
select skill
 ↓
URL updates
 ↓
refresh
 ↓
same roadmap + selected skill restored
```

Browser navigation must never mutate domain state merely because UI selection changed.

---

# 76. GRAPH INTERACTION CONTRACT

Every graph interaction has deterministic frontend behavior.

| Interaction | Behavior |
|---|---|
| Click node | Select node + open details |
| Click selected node | Keep selection / toggle panel where appropriate |
| Double click | Optional open focused node experience |
| Drag canvas | Pan graph |
| Wheel / pinch | Zoom |
| Fit view | Recenter graph |
| Click locked node | Show lock reason |
| Click available node | Show action + quest |
| Click completed node | Show completion/evidence |
| Click mastered node | Show mastery state |
| Keyboard focus | Focus node |
| Enter/Space | Select focused node |
| Edge click | Optional dependency explanation |
| Mobile tap | Select node |
| Mobile drag | Pan graph |

Double-click behavior is optional P1 and must not conflict with single-click selection.

---

# 77. KEYBOARD GRAPH NAVIGATION

Graph nodes must be keyboard reachable.

Minimum:

```text
Tab → enter graph
Arrow keys → move between logical/focusable nodes where supported
Enter / Space → select node
Escape → close details
```

If full spatial keyboard navigation is impractical, provide a semantic roadmap tree/list as the guaranteed accessible alternative.

---

# 78. TOUCH INTERACTION

Mobile must support:

```text
tap
drag
pinch zoom
```

Touch targets should be sufficiently large.

Do not require hover for essential functionality.

Any hover-only information must have an equivalent:

```text
tap
focus
or accessible details panel
```

---

# 79. EVENT → COMMAND CONTRACT

Frontend interaction must follow:

```text
USER ACTION
    ↓
UI EVENT
    ↓
FEATURE HANDLER
    ↓
API COMMAND
    ↓
SERVER VALIDATION
    ↓
GRAPH ENGINE / DOMAIN LOGIC
    ↓
CANONICAL RESPONSE
    ↓
CACHE UPDATE / INVALIDATION
    ↓
UI RENDER
```

Example:

```text
User clicks "Mark as Known"
        ↓
handleMarkKnown()
        ↓
skills.updateProficiency()
        ↓
API
        ↓
Graph Engine
        ↓
new revision
        ↓
canonical roadmap response
        ↓
graph rerenders
```

---

# 80. EVENT HANDLER RULE

Presentation components should not contain domain decisions.

Bad:

```ts
if (node.prerequisites.every(...)) {
  node.state = "AVAILABLE";
}
```

Correct:

```ts
await roadmap.updateSkill(...)
```

Then render the server-provided state.

---

# 81. FRONTEND COMMAND BOUNDARY

User actions that affect domain state must map to explicit API commands.

Examples:

```text
UpdateSkillProficiency
MarkSkillKnown
StartQuest
CompleteQuest
RegenerateRoadmap
ConfirmAssistantProposal
```

Do not create generic endpoints such as:

```text
/update-anything
/mutate-state
```

just to simplify frontend implementation.

---

# 82. SERVER COMPONENT / CLIENT COMPONENT BOUNDARY

Next.js component classification should be intentional.

## Server Components

Prefer for:

```text
static page shells
metadata
non-interactive content
server-readable route context
```

## Client Components

Required for:

```text
React Flow
graph interactions
forms
interactive panels
browser APIs
animations
client state
query/cache hooks
```

The graph must be a Client Component.

---

# 83. HYDRATION SAFETY

React Flow and browser-dependent components must not assume browser-only APIs during server rendering.

Avoid:

```text
window
document
localStorage
navigator
```

during server render.

Use client boundaries/effects where required.

Do not generate non-deterministic initial markup that differs between server and client.

---

# 84. CLIENT-ONLY GRAPH INITIALIZATION

Graph initialization should follow:

```text
Server-provided canonical graph
        ↓
Client hydration
        ↓
layout calculation
        ↓
React Flow rendering
```

Viewport and visual positions may be calculated client-side.

Domain graph semantics must come from the server.

---

# 85. HYDRATION FAILURE POLICY

If hydration or client graph initialization fails:

```text
show recoverable graph fallback
preserve roadmap metadata
offer retry
offer accessible roadmap representation
```

Do not fail the complete application because the graph renderer failed.

---

# 86. FRONTEND ARCHITECTURE INVARIANTS

The following rules are mandatory:

### Invariant 1

```text
Frontend visual state ≠ domain truth
```

### Invariant 2

```text
AI output ≠ canonical application state
```

### Invariant 3

```text
React Flow state ≠ graph engine state
```

### Invariant 4

```text
URL state ≠ domain state
```

### Invariant 5

```text
Client validation ≠ server validation
```

### Invariant 6

```text
Presentation components ≠ business logic
```

### Invariant 7

```text
One canonical API contract
```

### Invariant 8

```text
One authoritative graph engine
```

---

# 87. NO DUPLICATE DOMAIN LOGIC

The frontend must not independently implement:

```text
dependency resolution
node unlock rules
critical path calculation
timeline calculation
Next Best Action selection
graph state transitions
roadmap activation
```

If the UI needs such information:

```text
request it from backend
```

or consume it from the canonical API response.

---

# 88. FRONTEND ERROR OWNERSHIP

The frontend owns:

```text
displaying errors
retrying safe requests
recovering stale UI
showing validation messages
```

The backend owns:

```text
authorization
domain validation
graph validity
state transitions
revision conflicts
AI activation
```

Never move backend authority into frontend just because it makes the UI easier.

---

# 89. QUERY KEY CONTRACT

If a query/cache library is used, keys must represent canonical resource identity.

Examples:

```text
["roadmap", roadmapId]
["roadmap", roadmapId, "next-action"]
["quest", questId]
["progress", roadmapId]
```

Avoid keys based on unstable UI objects.

---

# 90. MUTATION SUCCESS CONTRACT

A successful mutation response should provide enough canonical information for the frontend to update safely.

Preferred:

```text
updated resource
revision
affected resources / invalidation hints where useful
```

The frontend should not reconstruct the authoritative result from the mutation input.

---

# 91. STALE RESPONSE PROTECTION

If multiple requests are in flight:

```text
request A
request B
```

and B is newer than A, an older response must not overwrite newer canonical state.

Use:

```text
revision
request identity
abort/cancellation
query library race protection
```

where appropriate.

---

# 92. FORM SUBMISSION PROTECTION

Prevent accidental duplicate mutations.

For important actions:

```text
submit
↓
disable duplicate submission
↓
await response
↓
canonical update
↓
re-enable
```

Examples:

```text
Complete Quest
Mark Known
Regenerate Roadmap
Confirm Proposal
```

Idempotency should still be enforced server-side where required.

---

# 93. FINAL FRONTEND DATA FLOW

```text
              ┌──────────────┐
              │   Browser    │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │ Next.js UI   │
              └──────┬───────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
   UI / Client State       API Client
          │                     │
          └──────────┬──────────┘
                     ▼
                Backend API
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
    Graph Engine          AI Orchestrator
          │                     │
          └──────────┬──────────┘
                     ▼
                 Database
```

Every canonical mutation flows through the backend.

---

# 94. FINAL FRONTEND DEFINITION OF DONE — ADDITIONS

Before freezing implementation:

- [ ] data-fetch lifecycle is defined
- [ ] cache invalidation rules are defined
- [ ] URL state contract is defined
- [ ] browser navigation works
- [ ] graph interaction contract is defined
- [ ] keyboard graph behavior is defined
- [ ] touch behavior is defined
- [ ] event → API command flow is defined
- [ ] Server/Client Component boundaries are defined
- [ ] hydration safety is defined
- [ ] frontend architecture invariants are explicit
- [ ] duplicate domain logic is prohibited
- [ ] stale response protection exists
- [ ] duplicate form submissions are protected

---

# 95. FINAL FREEZE — v1.1

This document is now considered **implementation-ready and frozen for P0**.

The frontend implementation must preserve:

```text
canonical API contracts
Graph Engine authority
AI validation boundary
revision semantics
URL/navigation semantics
responsive behavior
accessibility
hydration safety
performance
```

Future frontend features may extend the architecture, but must not silently introduce a second source of truth.

---

# 96. FINAL FRONTEND PRINCIPLE

> **The frontend should make Career Quest feel intelligent, responsive and game-like — while keeping every important career decision deterministic, validated and server-authoritative.**

```text
USER INTENT
    ↓
UI
    ↓
API COMMAND
    ↓
DOMAIN / GRAPH ENGINE
    ↓
CANONICAL STATE
    ↓
UI
```

That loop is the foundation of the Career Quest frontend.
