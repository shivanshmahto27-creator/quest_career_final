# Career Quest --- UI/UX Design Specification

**Version:** 2.0\
**Status:** FROZEN FOR IMPLEMENTATION\
**Product:** Career Quest --- Reverse-Engineered Career Roadmapper\
**Primary surface:** Interactive Career Skill Graph\
**Design direction:** Cinematic Career Intelligence Interface

------------------------------------------------------------------------

## 1. Purpose

Career Quest is not a generic AI career chatbot and not a checklist
disguised as a dashboard.

The interface must make one question immediately answerable:

> **"Given where I am right now and where I want to go, what should I do
> next?"**

The product experience is built around a living career graph:

**DREAM ROLE → CURRENT STATE → SKILL GAP → CAREER GRAPH → NEXT BEST
ACTION → QUEST → EVIDENCE → PROFICIENCY UPDATE → REROUTE → NEW NEXT BEST
ACTION**

The graph is the product. Everything else supports understanding,
action, and progress.

------------------------------------------------------------------------

# 2. Product Positioning

## 2.1 Visual identity

Career Quest should feel like:

-   a professional developer tool
-   a cinematic editorial interface
-   a career intelligence system
-   a living dependency graph
-   a premium technical product

It should NOT feel like:

-   a cyberpunk AI dashboard
-   a generic SaaS admin panel
-   a crypto/Web3 interface
-   a children's RPG
-   a course marketplace
-   a chatbot-first AI product
-   a dashboard containing a decorative graph

### Design principle

> **Make the interface feel like a career intelligence system whose
> interface happens to be a living graph --- not an AI dashboard with a
> graph placed inside it.**

------------------------------------------------------------------------

# 3. Design Goals

1.  Make the career destination obvious.
2.  Make the user's current state understandable.
3.  Make the skill gap visually obvious.
4.  Make the next action impossible to miss.
5.  Make dependencies understandable without requiring a tutorial.
6.  Make skill-state changes visibly affect the roadmap.
7.  Keep advanced information discoverable without overwhelming the
    first view.
8.  Preserve context while opening details.
9.  Make the graph visually dominant.
10. Keep the interface fast, calm, and premium.

Progressive disclosure is especially important because the roadmap can
contain substantial dependency and skill information. The default view
should expose the decision-critical layer first and reveal deeper
information on demand. This approach is consistent with established
dashboard and graph UX guidance.
citeturn0search1turn0search2turn0search3

------------------------------------------------------------------------

# 4. Core UX Principle

## One screen, one decision

The roadmap screen should continuously answer:

### Where am I?

Current skill state.

### Where am I going?

Target role.

### What is blocking me?

Skill gap and dependencies.

### What should I do now?

Next Best Action.

### What happens if I complete it?

The graph and timeline show the consequence.

Everything else is secondary.

------------------------------------------------------------------------

# 5. Information Architecture

Primary navigation:

1.  **ROADMAP**
2.  **QUESTS**
3.  **PROGRESS**
4.  **ASSISTANT**

Secondary/global actions:

-   Search
-   Profile
-   Edit roadmap
-   Recalculate roadmap
-   Help

Onboarding progression:

**01 TARGET → 02 CURRENT STATE → 03 SKILL GAP → 04 ROADMAP → 05 QUEST →
06 PROGRESS**

The left progression rail is a product identity element, not merely
navigation.

------------------------------------------------------------------------

# 6. Global Layout

## Desktop

Recommended layout:

``` text
┌───────────────────────────────────────────────────────────────┐
│ CAREER QUEST /  ROADMAP  QUESTS  PROGRESS  ASSISTANT   ...   │
├──────────┬───────────────────────────────────────┬────────────┤
│          │                                       │            │
│ 01       │                                       │  NODE      │
│ TARGET   │                                       │  DETAIL    │
│          │                                       │            │
│ 02       │          CAREER SKILL GRAPH           │  WHY       │
│ CURRENT  │                                       │  THIS      │
│          │                                       │  MATTERS   │
│ 03       │                                       │            │
│ GAP      │                                       │  QUEST     │
│          │                                       │            │
│ 04       │                                       │            │
│ ROADMAP  │                                       │            │
│          │                                       │            │
│ 05       │                                       │            │
│ QUEST    │                                       │            │
│          │                                       │            │
│ 06       │                                       │            │
│ PROGRESS │                                       │            │
├──────────┴───────────────────────────────────────┴────────────┤
│ NEXT BEST ACTION                              TIMELINE        │
└───────────────────────────────────────────────────────────────┘
```

Approximate desktop proportions:

-   Top navigation: 56--64px
-   Left rail: 10--12%
-   Graph workspace: 64--72%
-   Detail panel: 20--24%
-   Bottom action/timeline strip: 80--120px

The graph must receive the largest visual area.

## Rule

If the graph is visually competing with cards, reduce the cards.

------------------------------------------------------------------------

# 7. Visual Language

## 7.1 Color system

### Canvas

-   `#050607` --- primary background
-   `#0B0D0F` --- surface
-   `#101316` --- elevated surface

### Borders

-   `#1B1E21` --- default border
-   `#2A2F33` --- strong border

### Typography

-   `#F2F2EE` --- primary
-   `#85898F` --- secondary
-   `#5D6268` --- muted

### Semantic accents

-   `#D8FF5A` --- primary action / active route
-   `#8EA7FF` --- secondary information
-   `#8DDC9A` --- success
-   `#E7C85C` --- warning
-   `#FF7C7C` --- danger

### Critical rule

Accent colors communicate **meaning**, not decoration.

Do not turn the entire interface neon.

------------------------------------------------------------------------

# 8. Typography

Preferred:

-   Geist
-   Inter
-   IBM Plex Sans

Technical metadata:

-   Geist Mono
-   IBM Plex Mono

### Hero typography

Large editorial typography:

-   56--72px desktop
-   40--52px tablet
-   32--40px mobile

Use tight line-height.

Example:

> BUILD THE SHORTEST PATH\
> TO YOUR DREAM ROLE.

Supporting copy should be significantly smaller and quieter.

------------------------------------------------------------------------

# 9. Cinematic Interface Treatment

The visual language should inherit the strongest parts of the provided
Stratum-style website prompt:

-   full-screen dark environment
-   thin technical framing
-   minimal navigation
-   large editorial typography
-   vertical progression rail
-   restrained borders
-   subtle reveal animations
-   precise alignment
-   cinematic negative space
-   technical metadata
-   controlled parallax
-   high-quality transitions

However, Career Quest must NOT become a real-estate clone.

The cinematic treatment is a visual language, not a literal template.

------------------------------------------------------------------------

# 10. What Must Be Removed

Do NOT use:

-   mountains
-   star fields
-   galaxy backgrounds
-   excessive blue neon
-   giant glowing gradients
-   excessive glassmorphism
-   floating card clouds
-   decorative analytics charts
-   random 3D objects
-   game-like XP bars everywhere
-   cartoon badges
-   giant chatbot bubbles
-   stock illustrations
-   generic AI robot imagery

These elements make the product look like a generic AI/SaaS concept.

------------------------------------------------------------------------

# 11. Main Roadmap Screen

This is the most important screen in the product.

## Header

Small eyebrow:

`CAREER INTELLIGENCE / ROADMAP 01`

Large title:

> **BUILD THE SHORTEST PATH TO YOUR DREAM ROLE.**

Supporting copy:

> Reverse-engineer your target role into the skills, dependencies,
> projects, and actions that move you forward.

Primary CTA:

**BUILD MY ROADMAP**

After generation, the header becomes compact to maximize graph space.

------------------------------------------------------------------------

# 12. Target Context

Show the target role without turning it into a large card.

Example:

``` text
TARGET
Full Stack Developer
Product Startup

10 HRS / WEEK
EST. 18–24 WEEKS
```

Use typography and thin separators rather than a large rounded
container.

------------------------------------------------------------------------

# 13. Career Skill Graph

## The graph is the visual hero.

Use React Flow / `@xyflow/react`.

The graph should visually represent:

-   skills
-   phases
-   dependencies
-   current proficiency
-   unlock conditions
-   completed work
-   target outcome

The graph is not a decorative visualization.

Every meaningful graph element must have product meaning.

------------------------------------------------------------------------

# 14. Graph Structure

Recommended high-level structure:

``` text
TARGET ROLE
     │
     ▼
FOUNDATIONS
     │
     ├───────────────┐
     ▼               ▼
CORE SKILLS      TOOLING
     │               │
     └───────┬───────┘
             ▼
        SPECIALIZATION
             │
             ▼
          PROJECTS
             │
             ▼
       INTERVIEW READY
             │
             ▼
          TARGET ROLE
```

The actual graph is generated dynamically by the AI and
normalized/validated before rendering.

Do not hardcode a fixed roadmap.

------------------------------------------------------------------------

# 15. Graph Node Design

Nodes should look editorial and technical rather than like generic SaaS
cards.

Preferred structure:

``` text
┌──────────────────────────┐
│ SKILL / 03               │
│                          │
│ JavaScript               │
│ Proficient               │
│                          │
│ 2 dependencies           │
└──────────────────────────┘
```

Avoid:

-   excessive rounded rectangles
-   huge icons
-   gradients
-   oversized shadows
-   glowing borders

Use:

-   thin borders
-   small status indicators
-   compact metadata
-   strong typography
-   subtle state transitions

------------------------------------------------------------------------

# 16. Node States

Supported states:

1.  `LOCKED`
2.  `AVAILABLE`
3.  `IN_PROGRESS`
4.  `COMPLETED`
5.  `MASTERED`
6.  `ALREADY_KNOWN`

## LOCKED

Visual:

-   low contrast
-   muted border
-   low-opacity metadata

Meaning:

> Cannot meaningfully progress yet because a dependency is incomplete.

## AVAILABLE

Visual:

-   strong readable text
-   subtle accent indicator
-   clear hover state

Meaning:

> This is actionable now.

## IN_PROGRESS

Visual:

-   active progress marker
-   subtle accent line

## COMPLETED

Visual:

-   muted but clearly completed
-   check/status marker

## MASTERED

Visual:

-   strongest completed state
-   should remain visible but visually secondary to active path

## ALREADY_KNOWN

This state is especially important.

It should look different from completed learning.

Meaning:

> The user already possesses this skill, so the roadmap does not require
> learning effort here.

This state can immediately unlock downstream nodes and reduce the
timeline.

------------------------------------------------------------------------

# 17. Skill Proficiency

Six levels:

``` text
0 — UNKNOWN
1 — BEGINNER
2 — FAMILIAR
3 — PROFICIENT
4 — ADVANCED
5 — EXPERT
```

Do not display proficiency as a generic percentage unless useful.

Prefer:

``` text
JAVASCRIPT
FAMILIAR → REQUIRED: PROFICIENT
GAP: 1 LEVEL
```

This explains the actual problem.

------------------------------------------------------------------------

# 18. Partial Skill Logic

If a skill requires proficiency 3 and the user is at proficiency 2:

``` text
CURRENT: FAMILIAR
TARGET: PROFICIENT
GAP: 1 LEVEL
```

The interface should not treat the user as starting from zero.

Remaining effort should visually reduce.

This is a core differentiator.

------------------------------------------------------------------------

# 19. Dependency Interaction

When hovering a skill:

-   highlight its prerequisites
-   highlight downstream skills
-   dim unrelated nodes

Example:

``` text
JAVASCRIPT
Required by 7 downstream skills
```

When clicking:

``` text
WHY THIS NODE?
```

Then show:

-   why it matters
-   prerequisites
-   what it unlocks
-   target-role relevance
-   estimated effort
-   roadmap impact

The graph should explain relationships visually before asking users to
read text.

------------------------------------------------------------------------

# 20. Selected Node Detail Panel

The panel should appear without destroying graph context.

Structure:

``` text
SKILL / 07

React
AVAILABLE

WHY THIS MATTERS
Required for building production frontend applications
and several downstream project milestones.

PREREQUISITES
✓ JavaScript
✓ Git
○ HTTP fundamentals

UNLOCKS
→ Frontend Architecture
→ API Integration
→ Portfolio Project

ROADMAP EFFECT
Completing this node unlocks 3 downstream skills.

[ START QUEST ]
```

The panel is progressive disclosure: the graph gives the overview; the
panel gives detail.

------------------------------------------------------------------------

# 21. Next Best Action

This is the most important non-graph element.

Do NOT make it look like a generic dashboard card.

Treat it as a command surface.

Example:

``` text
NEXT BEST ACTION

02 / JAVASCRIPT
Move from Familiar → Proficient

Why now:
Unlocks React, API Integration and Frontend Architecture.

[ START QUEST ]
```

The action should always be visible on the roadmap screen.

------------------------------------------------------------------------

# 22. Next Best Action Logic

Score candidate actions using:

-   prerequisite availability
-   target-role relevance
-   dependency impact
-   proximity to completion
-   estimated effort
-   current phase
-   user availability

The UI should explain why the action is recommended.

Example:

> **Recommended because it unlocks 4 downstream skills and fits your
> current 10-hour weekly availability.**

Avoid fake precision.

------------------------------------------------------------------------

# 23. Timeline

Timeline is dependency-aware and approximate.

Do not imply guaranteed completion dates.

Example:

``` text
WEEK 01–02   FOUNDATIONS
WEEK 03–05   CORE JAVASCRIPT
WEEK 06–08   REACT
WEEK 09–12   BACKEND
WEEK 13–16   PROJECT
WEEK 17–18   INTERVIEW PREP
```

When a known skill is added:

``` text
BEFORE   18–24 WEEKS
AFTER    16–21 WEEKS
```

Show the change as an explanation, not a flashy animation.

------------------------------------------------------------------------

# 24. Dynamic Rerouting

This is the product's signature interaction.

Example:

User changes:

``` text
JavaScript
FAMILIAR → PROFICIENT
```

Immediately:

1.  node state changes
2.  prerequisites update
3.  dependent nodes recalculate
4.  newly available nodes become available
5.  remaining effort changes
6.  timeline updates
7.  Next Best Action changes
8.  graph route animates

The user should be able to visually understand:

> "My decision changed the roadmap."

------------------------------------------------------------------------

# 25. Rerouting Animation

Before:

``` text
JS → React → APIs → Backend
```

After JS becomes proficient:

``` text
JS ✓
   └────→ React → APIs → Backend
```

Use:

-   edge redraw
-   node state transition
-   subtle highlight sweep
-   timeline number transition
-   Next Best Action replacement

Do NOT use:

-   explosive particles
-   excessive glow
-   game-level animations
-   long loading sequences

Animation should communicate causality.

------------------------------------------------------------------------

# 26. Quest Experience

A quest is not a course page.

It is a mission workspace.

Structure:

``` text
QUEST 07

BUILD A REST API WITH NODE.JS

OBJECTIVE
Build and deploy a small REST API that supports
CRUD operations and authentication.

TIME
6–8 HOURS

DAILY PLAN
DAY 1 — API fundamentals
DAY 2 — Routes + controllers
DAY 3 — Database integration
DAY 4 — Authentication
DAY 5 — Testing + deployment

DELIVERABLE
Public GitHub repository + deployed API

INTERVIEW CHECK
5 questions generated around the project

[ MARK QUEST COMPLETE ]
```

------------------------------------------------------------------------

# 27. Quest Completion

Important:

**Quest completed ≠ skill mastered.**

Correct flow:

``` text
QUEST COMPLETE
      ↓
EVIDENCE RECORDED
      ↓
PROFICIENCY UPDATE SUGGESTED
      ↓
USER CONFIRMS / ADJUSTS
      ↓
GRAPH ENGINE RECALCULATES
      ↓
ROADMAP UPDATES
```

This distinction is critical for trust.

------------------------------------------------------------------------

# 28. Evidence

Supported evidence:

-   GitHub repository
-   deployed project
-   project submission
-   quiz result
-   interview practice
-   manual evidence
-   completion record

Evidence should strengthen confidence in a skill but should not
automatically claim mastery.

------------------------------------------------------------------------

# 29. Progress Screen

Progress should answer:

> "How much closer am I to the target?"

Show:

``` text
TARGET ROLE
Full Stack Developer

ROADMAP PROGRESS
38%

SKILLS
12 / 31 complete

CURRENT PHASE
Core Development

ESTIMATED REMAINING
10–14 weeks

CURRENT FOCUS
React
```

Keep analytics restrained.

Avoid turning this into a generic analytics dashboard.

------------------------------------------------------------------------

# 30. Assistant

The AI assistant is contextual.

It should not dominate the homepage.

It can answer:

-   Why do I need this skill?
-   Why is this next?
-   What happens if I skip this?
-   Can I replace this project?
-   Why did my timeline change?
-   What should I do this weekend?

The assistant can propose roadmap modifications.

It cannot silently mutate the graph.

Flow:

``` text
USER REQUEST
     ↓
AI PROPOSAL
     ↓
EXPLANATION
     ↓
USER CONFIRMS
     ↓
DETERMINISTIC GRAPH ENGINE
     ↓
UPDATED ROADMAP
```

------------------------------------------------------------------------

# 31. Assistant UI

Use a contextual drawer or command panel.

Example:

``` text
CAREER ASSISTANT

Why do I need React next?

React is next because:
• JavaScript is now at the required level
• 4 downstream skills depend on React
• your target role expects frontend application experience

[ VIEW DEPENDENCIES ]
[ START REACT QUEST ]
```

Avoid a giant ChatGPT-style chat screen.

------------------------------------------------------------------------

# 32. Onboarding

Onboarding must be short.

## Step 01 --- Target

Prompt:

> What exact role are you targeting?

Example:

> Full Stack Developer at a product startup

Optional:

-   company type
-   specialization
-   location/market

## Step 02 --- Current State

Let users select or search skills.

For each:

``` text
UNKNOWN
BEGINNER
FAMILIAR
PROFICIENT
ADVANCED
EXPERT
```

## Step 03 --- Constraints

Ask:

-   hours/week
-   preferred learning style
-   current experience
-   optional deadline

## Step 04 --- Review

Show:

``` text
TARGET
CURRENT SKILLS
WEEKLY AVAILABILITY
```

Then:

**GENERATE ROADMAP**

Do not force users through unnecessary screens.

------------------------------------------------------------------------

# 33. AI Generation Experience

The generation screen should feel like the system is reverse-engineering
a career, not simply "thinking."

Example stages:

``` text
01 / ANALYZING TARGET ROLE
02 / BUILDING SKILL REQUIREMENTS
03 / RESOLVING DEPENDENCIES
04 / ESTIMATING REMAINING EFFORT
05 / BUILDING CAREER GRAPH
06 / VALIDATING ROADMAP
07 / CALCULATING NEXT BEST ACTION
```

The final graph should only render after validation.

------------------------------------------------------------------------

# 34. Loading States

Use structured progress instead of a generic spinner.

Bad:

> AI is thinking...

Good:

> Resolving skill dependencies...

Then:

> Building your career graph...

Then:

> Finding your highest-impact next action...

Loading should feel intentional and trustworthy.

------------------------------------------------------------------------

# 35. Error States

AI failure:

-   show clear explanation
-   preserve last valid AI-generated roadmap if one exists
-   allow retry
-   never silently replace it with a fake hardcoded roadmap

Graph validation failure:

``` text
ROADMAP COULD NOT BE VALIDATED

We couldn't safely build the dependency graph.
Your previous roadmap is unchanged.

[ TRY AGAIN ]
```

------------------------------------------------------------------------

# 36. Empty States

### No roadmap

> Your career graph starts here.

**BUILD MY ROADMAP**

### No quests

> Your next quest appears when a roadmap skill becomes actionable.

### No evidence

> Complete a quest and attach evidence to start building your skill
> history.

------------------------------------------------------------------------

# 37. Responsive Design

## Tablet

-   reduce left rail width
-   graph remains dominant
-   detail panel becomes narrower
-   timeline becomes horizontally scrollable

## Mobile

Do not shrink the desktop dashboard.

Recompose it.

Structure:

``` text
┌─────────────────────────┐
│ CAREER QUEST       ☰    │
├─────────────────────────┤
│ TARGET ROLE             │
│ Full Stack Developer    │
├─────────────────────────┤
│                         │
│      SKILL GRAPH        │
│                         │
│       ○──○──●           │
│          │              │
│          ○              │
│                         │
├─────────────────────────┤
│ NEXT BEST ACTION        │
│ React → Start Quest     │
├─────────────────────────┤
│ Timeline                │
└─────────────────────────┘
```

Node details open as a bottom sheet.

Use touch-friendly controls.

------------------------------------------------------------------------

# 38. Graph Mobile Interaction

Required:

-   pinch zoom
-   drag/pan
-   tap node
-   bottom sheet details
-   fit-to-roadmap
-   focus selected node
-   clear selected state

Do not depend on hover.

React Flow supports keyboard focus, node/edge interaction, ARIA
descriptions, and viewport controls that can be configured for
responsive graph interaction. citeturn0search4turn0search17

------------------------------------------------------------------------

# 39. Accessibility

Minimum requirements:

-   keyboard navigation
-   visible focus states
-   sufficient contrast
-   semantic labels
-   ARIA descriptions for graph nodes
-   non-color status indicators
-   reduced-motion support
-   touch targets large enough for mobile
-   screen-reader-friendly node descriptions

Do not communicate state using color alone.

Example:

``` text
● AVAILABLE
✓ COMPLETED
◌ IN PROGRESS
— LOCKED
```

React Flow provides built-in keyboard and screen-reader support that
should be retained rather than disabled. citeturn0search4

------------------------------------------------------------------------

# 40. Motion System

Motion should explain state changes.

## Page entrance

-   opacity
-   slight vertical movement
-   250--500ms

## Node selection

-   border transition
-   subtle scale
-   connected dependency highlight

## Rerouting

-   edge transition
-   node state transition
-   timeline value transition

## Quest completion

-   state transition
-   evidence confirmation
-   return to graph

### Motion rule

> If an animation does not communicate hierarchy, causality, progress,
> or feedback, remove it.

Support `prefers-reduced-motion`.

------------------------------------------------------------------------

# 41. Hover Behaviour

Hover should provide lightweight context.

Example:

``` text
JAVASCRIPT
Familiar → Proficient
Required by 7 downstream skills
```

Hover should never contain information required to understand the
roadmap.

Hover is supplementary.

------------------------------------------------------------------------

# 42. Zoom Behaviour

Graph information should become progressively richer.

### Zoomed out

Show:

-   phases
-   major skill clusters
-   target
-   current route

### Medium zoom

Show:

-   skill names
-   status
-   dependency structure

### Zoomed in

Show:

-   proficiency
-   effort
-   metadata
-   detailed relationships

This prevents the graph from becoming a wall of tiny text and follows
progressive-disclosure principles for complex visualizations.
citeturn0search2turn0search7

------------------------------------------------------------------------

# 43. Graph Controls

Keep controls minimal.

Required:

-   zoom in
-   zoom out
-   fit view
-   reset
-   optional minimap

Optional:

-   focus current path
-   show completed
-   show dependencies

Do not cover the graph with floating controls.

------------------------------------------------------------------------

# 44. Search

Global search should support:

-   skills
-   quests
-   roadmap nodes
-   phases

Example:

``` text
Search skills, quests, roadmap...
```

Results should focus the graph on the selected node.

------------------------------------------------------------------------

# 45. Visual Hierarchy

Priority order:

1.  Career graph
2.  Current target
3.  Next Best Action
4.  Selected node context
5.  Timeline
6.  Progress
7.  Navigation
8.  Assistant

If an element competes with the graph and is not more important than the
graph, reduce it.

------------------------------------------------------------------------

# 46. Card Usage Rules

Cards are allowed only when they create clear separation of information.

Use cards for:

-   selected node details
-   quest workspace
-   evidence
-   compact target context

Do not use cards for:

-   every metric
-   every graph node
-   every section
-   decorative grouping
-   random floating widgets

The product should not look like "12 cards + graph."

------------------------------------------------------------------------

# 47. Borders and Surfaces

Prefer:

-   thin 1px borders
-   subtle surface changes
-   strong spacing
-   typography hierarchy

Avoid:

-   heavy shadows
-   glowing borders
-   thick outlines
-   excessive rounded corners

Border radius should be restrained:

-   4--8px for technical UI
-   10--14px only where interaction benefits from it
-   graph nodes can use custom editorial shapes

------------------------------------------------------------------------

# 48. Iconography

Use a consistent minimal icon set.

Preferred:

-   Lucide
-   simple line icons

Do not use icons as decoration.

Every icon should:

-   communicate an action
-   communicate status
-   support navigation
-   clarify structure

Pair ambiguous icons with text.

------------------------------------------------------------------------

# 49. Landing Page

The landing page should not look like a dashboard.

Hero:

``` text
CAREER QUEST

REVERSE-ENGINEER
YOUR CAREER.

Build the shortest realistic path
from where you are to where you want to be.

[ BUILD MY ROADMAP ]
```

Visual:

A partially visible career graph can occupy the background/side.

No huge dashboard screenshot collage.

------------------------------------------------------------------------

# 50. Landing Page Sections

Keep it short.

### Hero

Core promise + CTA.

### How it works

``` text
TARGET
   ↓
CURRENT STATE
   ↓
SKILL GAP
   ↓
ROADMAP
   ↓
QUEST
   ↓
REROUTE
```

### Product differentiator

Show the dynamic graph interaction.

Example:

> Mark a skill as already known. Watch your path change.

### Final CTA

> BUILD YOUR PATH

------------------------------------------------------------------------

# 51. Product Microcopy

Use direct, technical language.

Prefer:

-   `Build roadmap`
-   `Start quest`
-   `Why this node?`
-   `View dependencies`
-   `Update proficiency`
-   `Recalculate`
-   `Show impact`
-   `Continue`
-   `Mark as known`

Avoid:

-   `Unlock your potential`
-   `Become unstoppable`
-   `AI magic`
-   `Supercharge your career`
-   `Level up your life`
-   `Your journey awaits`

The product should feel credible.

------------------------------------------------------------------------

# 52. Trust UX

Users must understand why the roadmap changed.

Whenever a major state change happens, show a concise reason.

Example:

``` text
ROADMAP UPDATED

JavaScript is now Proficient.

3 downstream skills are now available.
Estimated remaining effort decreased.
Next Best Action changed to React.
```

Never silently change the user's plan.

------------------------------------------------------------------------

# 53. Explainability

For every recommended node, provide:

### Why this node?

### What does it unlock?

### What happens if I skip it?

### How much effort remains?

### How does it affect my target?

This makes AI recommendations inspectable instead of magical.

------------------------------------------------------------------------

# 54. AI Trust Boundary

UI must reflect this architecture:

``` text
AI
 ↓
STRUCTURED ROADMAP
 ↓
SCHEMA VALIDATION
 ↓
GRAPH VALIDATION
 ↓
GRAPH ENGINE
 ↓
UI
```

AI proposes.

Deterministic code decides.

The UI must never imply that the LLM directly controls the graph state.

------------------------------------------------------------------------

# 55. Graph Update Feedback

When the graph changes:

Show a compact system message:

``` text
ROADMAP UPDATED
+3 skills unlocked
Timeline recalculated
Next action changed
```

Allow dismissal.

Do not show large modal interruptions for routine updates.

------------------------------------------------------------------------

# 56. Design Tokens

``` text
--canvas: #050607
--surface: #0B0D0F
--surface-2: #101316

--border: #1B1E21
--border-strong: #2A2F33

--text-primary: #F2F2EE
--text-secondary: #85898F
--text-muted: #5D6268

--accent: #D8FF5A
--accent-secondary: #8EA7FF

--success: #8DDC9A
--warning: #E7C85C
--danger: #FF7C7C
```

------------------------------------------------------------------------

# 57. Component Inventory

## Layout

-   `AppShell`
-   `TopNav`
-   `ProgressRail`
-   `GraphWorkspace`
-   `DetailPanel`
-   `BottomActionBar`

## Roadmap

-   `CareerGraph`
-   `SkillNode`
-   `PhaseNode`
-   `TargetNode`
-   `DependencyEdge`
-   `GraphControls`
-   `GraphLegend`

## Skill

-   `SkillState`
-   `ProficiencySelector`
-   `DependencyList`
-   `WhyThisNode`
-   `RoadmapImpact`

## Quest

-   `QuestHeader`
-   `QuestObjective`
-   `QuestPlan`
-   `QuestDeliverable`
-   `QuestEvidence`
-   `QuestCompletion`

## Progress

-   `ProgressSummary`
-   `SkillProgress`
-   `Timeline`
-   `PhaseProgress`

## AI

-   `AssistantDrawer`
-   `AssistantMessage`
-   `RoadmapProposal`
-   `ChangeConfirmation`

## Feedback

-   `GenerationProgress`
-   `RerouteFeedback`
-   `Toast`
-   `EmptyState`
-   `ErrorState`

------------------------------------------------------------------------

# 58. Implementation Rules

The frontend must follow these rules:

1.  Do not hardcode roadmap content.
2.  Do not render unvalidated AI graph output.
3.  Keep domain state separate from React Flow presentation state.
4.  Graph engine owns deterministic business logic.
5.  Zustand owns client roadmap state.
6.  React Flow owns graph rendering and interaction.
7.  AI assistant proposals require user confirmation.
8.  Do not use AI for deterministic dependency logic.
9.  Preserve the last valid roadmap during failures.
10. Keep graph nodes memoized where appropriate.
11. Avoid unnecessary React re-renders.
12. Keep animations lightweight.
13. Keep mobile usable.
14. Do not introduce unnecessary UI libraries.
15. Do not add features outside the PRD/TRD without explicit approval.

------------------------------------------------------------------------

# 59. Graph Rendering Rules

Use React Flow.

The graph should support:

-   pan
-   zoom
-   node selection
-   dependency highlighting
-   focus node
-   fit view
-   animated route changes
-   custom node types
-   accessible keyboard interaction

React Flow's examples support custom nodes, animated graph layout
transitions, node toolbars, and other node-based interaction patterns
that fit this product architecture. citeturn0search10turn0search13

------------------------------------------------------------------------

# 60. Performance Rules

Target:

-   20--60 nodes in normal roadmap
-   smooth pan/zoom
-   no visible lag during state updates

Use:

-   memoized node components
-   stable callbacks
-   selective Zustand subscriptions
-   calculated layout outside render where practical
-   progressive rendering for heavy graph updates

Do not optimize prematurely beyond the expected roadmap scale.

------------------------------------------------------------------------

# 61. Judge Demo UX

The interface must support this exact high-impact flow:

``` text
LANDING
  ↓
BUILD MY CAREER ROADMAP
  ↓
TARGET:
Full Stack Developer at a product startup
  ↓
CURRENT:
JavaScript — Familiar
Git — Proficient
React — Beginner
  ↓
10 HOURS / WEEK
  ↓
GENERATE
  ↓
CAREER GRAPH
  ↓
ZOOM / PAN
  ↓
CLICK JAVASCRIPT
  ↓
WHY THIS NODE?
  ↓
START QUEST
  ↓
RETURN TO ROADMAP
  ↓
UPDATE JAVASCRIPT:
Familiar → Proficient
  ↓
GRAPH REROUTES
  ↓
TIMELINE UPDATES
  ↓
NEXT BEST ACTION CHANGES
  ↓
ASK:
“Why do I need React next?”
  ↓
CONTEXTUAL ANSWER
```

The visual "wow moment" is:

> **A user changes their state and the career graph visibly changes in
> response.**

------------------------------------------------------------------------

# 62. Three-Minute Demo Visual Priorities

During the demo:

### First 30 seconds

Show:

-   cinematic landing
-   clear promise
-   fast onboarding

### 30--90 seconds

Show:

-   graph generation
-   graph scale
-   target role
-   current state
-   dependencies

### 90--150 seconds

Show:

-   node selection
-   Why This Node
-   quest generation

### 150--180 seconds

Show:

-   proficiency update
-   graph reroute
-   timeline change
-   new Next Best Action

Do not spend demo time on secondary screens.

------------------------------------------------------------------------

# 63. Anti-Generic Checklist

Before shipping, ask:

### Does it look like a generic AI dashboard?

If yes → remove cards, gradients, chatbot prominence.

### Does it look like a game?

If yes → remove XP/badges/gamification decoration.

### Does the graph look decorative?

If yes → increase dependency visibility and interaction.

### Is the screen too busy?

If yes → progressive disclosure.

### Is neon doing too much?

If yes → reduce accent usage.

### Is the user unsure what to do next?

If yes → strengthen Next Best Action.

### Does changing a skill visibly change the roadmap?

If no → the core product experience is incomplete.

------------------------------------------------------------------------

# 64. UX Acceptance Criteria

The UI/UX is considered complete when:

-   [ ] User understands target role within 5 seconds.
-   [ ] User can identify current state quickly.
-   [ ] Graph is the visual hero.
-   [ ] Graph nodes are actionable.
-   [ ] Node dependencies are understandable.
-   [ ] "Why This Node?" is available.
-   [ ] Next Best Action is always clear.
-   [ ] Quest can be started from a node.
-   [ ] Quest completion does not automatically equal mastery.
-   [ ] Proficiency can be updated.
-   [ ] Updating proficiency changes the graph.
-   [ ] Timeline changes after meaningful state changes.
-   [ ] Assistant answers in roadmap context.
-   [ ] Assistant cannot silently mutate graph state.
-   [ ] AI-generated roadmaps are validated before rendering.
-   [ ] AI failure preserves the last valid roadmap.
-   [ ] Mobile graph is usable.
-   [ ] Keyboard interaction works.
-   [ ] Color is not the only state indicator.
-   [ ] Motion can be reduced.
-   [ ] Interface does not feel like a generic AI dashboard.

------------------------------------------------------------------------

# 65. Final Design Rules

These rules override aesthetic preferences:

### Rule 01

**Graph \> cards.**

### Rule 02

**Action \> analytics.**

### Rule 03

**Meaning \> decoration.**

### Rule 04

**State change \> animation.**

### Rule 05

**Explainability \> AI magic.**

### Rule 06

**Progressive disclosure \> information overload.**

### Rule 07

**Professional RPG influence \> literal game UI.**

### Rule 08

**Cinematic atmosphere \> cinematic clutter.**

### Rule 09

**One primary accent \> rainbow UI.**

### Rule 10

**The user controls their career state. AI proposes; deterministic logic
recalculates.**

------------------------------------------------------------------------

# 66. Final Visual Definition

Career Quest should look like:

> **A cinematic, dark, editorial career intelligence workspace where a
> living skill graph is the primary interface.**

It should feel:

**precise + premium + technical + calm + intelligent + actionable**

Not:

**neon + noisy + gamey + generic + chatbot-heavy + card-heavy**

The final test is simple:

> **If the graph disappeared, would the product lose its identity?**

The answer must be **yes**.

That is how we know the graph is truly the product.
