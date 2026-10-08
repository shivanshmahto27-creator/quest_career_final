# Career Quest — APP FLOW

**Project:** Reverse-Engineered Career Roadmapper  
**Document:** Application Flow & UX Specification  
**Version:** 1.1 — Updated / Frozen  
**Status:** Implementation Ready  
**Hackathon:** LLOYD Hackathon — Problem Statement 1

---

# 1. Purpose

This document converts the TRD into the exact user-facing application flow.

The product should feel like a **professional career progression system with an RPG-inspired skill graph**, not a chatbot, checklist, or static infographic.

Core journey:

```text
LANDING
   ↓
ONBOARDING
   ↓
DREAM ROLE
   ↓
CURRENT SKILLS
   ↓
CONSTRAINTS
   ↓
REVIEW
   ↓
AI GENERATION
   ↓
VALIDATED CAREER GRAPH
   ↓
ROADMAP
   ↓
NODE
   ↓
QUEST
   ↓
PROGRESS / EVIDENCE
   ↓
SKILL STATE UPDATE
   ↓
DETERMINISTIC REROUTING
   ↓
UPDATED TIMELINE
   ↓
NEXT BEST ACTION
   ↓
REPEAT
```

---

# 2. Core UX Principle

The application must always answer:

### Where am I?

Current skills, proficiency, progress and active phase.

### Where am I going?

The user's specific dream role.

### What should I do next?

The **Next Best Action** and its actionable Quest.

### Why am I doing it?

The **Why This Node?** explanation.

### What happens when I improve?

The roadmap visibly recalculates.

---

# 3. Product Loop

The core loop is:

```text
DREAM ROLE
     ↓
CURRENT STATE
     ↓
SKILL GAP
     ↓
CAREER GRAPH
     ↓
NEXT BEST ACTION
     ↓
QUEST
     ↓
EVIDENCE / COMPLETION
     ↓
UPDATED SKILL STATE
     ↓
REROUTE
     ↓
UPDATED GRAPH
     ↓
NEXT BEST ACTION
```

This loop is more important than any individual dashboard feature.

---

# 4. Information Architecture

```text
/
├── Landing
│
├── /onboarding
│   └── page.tsx
│
├── /roadmap
│   └── page.tsx
│
├── /api
│   ├── roadmap
│   │   └── route.ts
│   ├── quest
│   │   └── route.ts
│   └── assistant
│       └── route.ts
│
└── /about
    └── page.tsx
```

For the MVP, onboarding can remain a single multi-step client experience instead of separate routes.

Next.js App Router uses filesystem routing where folders define route segments and `page.tsx` makes a route accessible. Shared layouts can preserve UI and state across navigation. citeturn0search1

---

# 5. Global Navigation

Keep navigation minimal.

Primary:

```text
Roadmap
Timeline
Progress
Assistant
```

Do not create a large dashboard with many unrelated sections.

The roadmap remains the primary destination.

---

# 6. Screen 1 — Landing Page

## Goal

Communicate the product value in seconds.

Core message:

> Your dream role is the destination. Your skill tree is the path.

Supporting copy:

> Turn any specific career goal into an adaptive visual roadmap with skills, projects and next actions.

### Layout

```text
┌──────────────────────────────────────────────────────────────┐
│ Career Quest                         How it works   About    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│          YOUR DREAM ROLE IS THE DESTINATION.                 │
│          YOUR SKILL TREE IS THE PATH.                        │
│                                                              │
│  Turn any specific career goal into an adaptive              │
│  visual roadmap with skills, projects and next actions.      │
│                                                              │
│              [ Build My Career Roadmap → ]                   │
│                                                              │
│              Interactive graph preview                       │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Dynamic Skill Tree   Actionable Quests   Adaptive Timeline  │
└──────────────────────────────────────────────────────────────┘
```

### Primary CTA

**Build My Career Roadmap**

### Rules

Do not:

- start with a chatbot
- show a huge feature grid
- require login
- overwhelm the user with text

---

# 7. Landing → Onboarding

User clicks:

```text
Build My Career Roadmap
```

System:

```text
Navigate → /onboarding
```

No authentication is required for the core MVP unless later implementation requires it.

---

# 8. Screen 2 — Dream Role

## Goal

Understand the exact destination.

### Heading

> What career are you trying to reach?

### Main input

```text
Example:
"Full Stack Developer at a climate-tech startup"
```

### Optional structured fields

```text
Target role
[________________________]

Company type
[ Startup / Product / Service / Research / Any ]

Specialization
[________________________]
```

Keep the form short.

### Examples

```text
Frontend Engineer for fintech products
Cybersecurity Analyst at a product company
Machine Learning Engineer at an AI startup
UI/UX Designer for fintech apps
```

### CTA

**Continue →**

---

# 9. Dream Role Validation

If the target is too vague:

```text
"developer"
"job"
"anything"
```

Do not crash or reject harshly.

Show:

> Give us a little more detail so we can build a useful roadmap.

Offer examples.

The user should be able to continue after clarification.

---

# 10. Screen 3 — Current Skill State

## Goal

Capture where the user starts.

Heading:

> What do you already know?

Subheading:

> Your roadmap adapts to your current level, so you don't waste time relearning what you already know.

---

# 11. Skill Selection UX

The system should suggest likely skills based on the target role.

Example:

```text
Skills we found for your target:

JavaScript       Familiar
React            Beginner
Git              Proficient
APIs             Beginner
SQL              Unknown
```

Each skill can be adjusted.

Also provide:

```text
+ Add a skill
```

Do not force the user to manually fill a giant skills questionnaire.

---

# 12. Proficiency Scale

```text
0  Unknown
1  Beginner
2  Familiar
3  Proficient
4  Advanced
5  Expert
```

The product must support partial proficiency.

Example:

```text
Required: Proficient
Current: Familiar
```

This means the user has a smaller gap rather than zero knowledge.

---

# 13. Screen 4 — Constraints

## Goal

Understand realistic available time.

### Heading

> How much time can you actually give this?

### Weekly availability

```text
Hours per week

[ 10 hrs/week ]
```

Presets:

```text
5h    10h    15h    20h+
```

### Optional target timeline

```text
I want to reach this goal in:

[ 6 months ]
```

Or:

```text
No fixed deadline
```

---

# 14. Timeline Language

Never promise employment.

Bad:

> You'll get hired in 6 months.

Good:

> At 10 hours/week, your estimated learning path is approximately 6–8 months.

The timeline represents estimated roadmap effort, not guaranteed hiring time.

---

# 15. Screen 5 — Review

Show a compact summary:

```text
┌──────────────────────────────────────────────┐
│ YOUR CAREER TARGET                           │
│ Full Stack Developer                         │
│ Climate-tech startup                         │
│                                              │
│ CURRENT STATE                                 │
│ React: Beginner                              │
│ JavaScript: Familiar                         │
│ Git: Proficient                              │
│                                              │
│ AVAILABILITY                                  │
│ 10 hours / week                              │
│ Target: 6 months                             │
│                                              │
│          [ Build My Roadmap → ]              │
└──────────────────────────────────────────────┘
```

Every section should be editable.

---

# 16. Screen 6 — AI Roadmap Generation

The generation state should communicate progress rather than showing a generic spinner.

```text
Building your career path

✓ Understanding your target role
✓ Mapping required skills
● Building skill dependencies
○ Calculating your timeline
○ Preparing your first missions
```

---

# 17. Generation State Machine

```text
IDLE
 ↓
GENERATING
 ↓
STRUCTURING
 ↓
VALIDATING
 ↓
CALCULATING
 ↓
LAYOUT
 ↓
READY
```

Failure:

```text
ANY AI STEP
   ↓
ERROR
   ↓
RETRY
```

The user should never see raw stack traces.

---

# 18. Backend-to-UI Generation Contract

The UI must not render raw AI output.

The actual flow is:

```text
User input
   ↓
AI generation
   ↓
Structured output
   ↓
Zod validation
   ↓
Semantic graph validation
   ↓
Cycle detection
   ↓
Graph normalization
   ↓
Timeline
   ↓
Layout
   ↓
Zustand store
   ↓
React Flow
```

Only the validated/normalized graph reaches the roadmap UI.

---

# 19. AI Failure Recovery

If the first generation fails:

```text
Generate
  ↓
Validation failure
  ↓
Repair / retry
  ↓
Validation again
```

If a previously valid roadmap exists:

```text
Current valid roadmap
        ↓
New AI request fails
        ↓
Keep last valid generated roadmap
        ↓
Show retry option
```

The fallback must **not** be a hardcoded pre-written career roadmap.

This preserves the problem statement requirement that the roadmap comes from the AI response.

---

# 20. Screen 7 — Main Roadmap

This is the **core product screen**.

### Desktop

```text
┌──────────────────────────────────────────────────────────────┐
│ Career Quest                  38% complete     ~8 weeks left │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ [Skill Tree] [Timeline] [Progress]             [Assistant]  │
│                                                              │
│        PHASE 1             PHASE 2             PHASE 3       │
│                                                              │
│      ┌──────────┐        ┌──────────┐        ┌──────────┐   │
│      │   HTML   │───────→│   JS     │───────→│  React   │   │
│      │ ✓ Done   │        │ ● Next   │        │ 🔒 Locked│   │
│      └──────────┘        └──────────┘        └──────────┘   │
│             \                 │                    │         │
│              \                ↓                    ↓         │
│               ───────────→  Git  ─────────────→ Projects    │
│                                                              │
│  [−] [+] [Fit]                                MiniMap       │
└──────────────────────────────────────────────────────────────┘
```

React Flow is designed for interactive node/edge graphs, and controlled flows let the application own the nodes and edges. citeturn0search5turn0search6

---

# 21. Roadmap Header

Always show:

```text
Target:
Full Stack Developer

Progress:
38%

Estimated remaining:
~8 weeks

Next Best Action:
Complete JavaScript async fundamentals — ~2 hours
```

The next action should be visually prominent.

---

# 22. Graph Controls

Minimum:

```text
Zoom +
Zoom -
Fit View
```

Optional:

```text
Focus Next
Legend
Reset View
```

React Flow provides built-in viewport interaction and programmatic viewport controls. citeturn0search6turn0search13

---

# 23. Node Visual States

Each node must communicate its state without requiring a click.

## LOCKED

```text
🔒 React State Management
Prerequisite: React Fundamentals
```

## AVAILABLE

```text
→ JavaScript Async
2.5h
NEXT
```

## IN_PROGRESS

```text
◐ API Integration
45% complete
```

## COMPLETED

```text
✓ Git Fundamentals
Completed
```

## MASTERED

```text
★ React Components
Mastered
```

## ALREADY_KNOWN

```text
✓ HTML/CSS
Already known
```

Do not rely only on color.

---

# 24. Custom Node Architecture

Use custom React Flow nodes for the career graph.

Potential node types:

```text
skillNode
milestoneNode
phaseNode
```

The visual state is derived from the domain state.

React Flow explicitly supports custom nodes, including interactive content and typed node data. citeturn0search4turn0search12

Keep `nodeTypes` stable/memoized so node component definitions do not cause unnecessary rerenders.

---

# 25. Node Click

When a node is clicked:

```text
Graph
  ↓
Node selected
  ↓
Detail panel opens
```

The graph remains visible.

Do not navigate away from the roadmap for normal node exploration.

---

# 26. Node Detail Panel

### Desktop

```text
┌──────────────────────────────────────────┐
│ JavaScript Async                       X │
├──────────────────────────────────────────┤
│ Familiar → Proficient                    │
│                                          │
│ WHY THIS MATTERS                         │
│ Async programming is required for...     │
│                                          │
│ ESTIMATED EFFORT                         │
│ ~4 hours                                 │
│                                          │
│ PREREQUISITES                            │
│ ✓ JavaScript Fundamentals                │
│                                          │
│ [ Start Quest ]                          │
│ [ Update Proficiency ]                   │
└──────────────────────────────────────────┘
```

### Mobile

Use a bottom sheet.

---

# 27. "Why This Node?"

Every important node should explain its relevance.

Example:

```text
WHY THIS NODE?

This skill supports the target role because
it is required for building asynchronous
applications and consuming APIs.
```

If reliable evidence exists:

```text
Evidence:
ESCO / O*NET / verified source
```

If evidence does not exist, do not fabricate citations.

---

# 28. Node Actions by State

### Locked

```text
View prerequisites
```

### Available

```text
Start Quest
```

### In Progress

```text
Continue Quest
Update Progress
```

### Completed

```text
Review Quest
Add Evidence
Update Proficiency
```

### Already Known

```text
Update Proficiency
```

---

# 29. Screen 8 — Quest

The Quest is the action layer.

Heading:

> Your Mission

Example:

```text
MASTER JAVASCRIPT ASYNC

Estimated time: ~5 hours
Duration: 3 days
```

---

# 30. Quest Structure

```text
MISSION
Learn and demonstrate async JavaScript.

DAY 1
Understand Promises + async/await
~2 hours

DAY 2
Build API data loader
~2 hours

DAY 3
Handle loading/error states
~1 hour

PROJECT
Build a weather dashboard.

GITHUB
javascript-async-weather-dashboard

INTERVIEW
• Promise vs async/await
• What is the event loop?
• How does Promise.all work?

COMPLETION
□ Explain async/await
□ Fetch API data
□ Handle errors
□ Deploy project

[ Start Mission ]
```

---

# 31. Quest Progress

Example:

```text
Day 1   ✓
Day 2   ●
Day 3   🔒
```

The user can record progress without automatically becoming an expert.

---

# 32. Quest Completion — Updated Rule

**Important:** completing a Quest must not automatically mean the user has mastered the skill.

Correct flow:

```text
Quest completed
      ↓
Evidence / completion recorded
      ↓
Proficiency update suggested
      ↓
User confirms or adjusts proficiency
      ↓
Graph engine recalculates
      ↓
Dependencies update
      ↓
Timeline updates
      ↓
Next Best Action updates
```

Example:

```text
Before:
JavaScript = Familiar

Quest completed

Suggested:
JavaScript = Proficient

[ Confirm ]
[ Keep Familiar ]
[ Set another level ]
```

This preserves realistic skill progression.

---

# 33. Screen 9 — Dynamic Rerouting

When the user changes skill state:

```text
BEFORE

HTML ✓
   ↓
CSS ✓
   ↓
JavaScript
   ↓
React 🔒
```

User:

```text
Mark JavaScript as Proficient
```

System:

```text
Recalculating your path...

✓ Updated skill state
✓ Re-evaluated dependencies
✓ Updated remaining effort
✓ Updated timeline
✓ Found new next action
```

Then the graph animates to the new state.

---

# 34. Rerouting Scope

## P0 — Required

Skill proficiency/state changes.

## P1 — Required if time allows

Weekly availability changes.

Example:

```text
5h/week → 10h/week
```

Timeline recalculates without unnecessarily regenerating the entire graph.

## P2 — Optional

Changing:

- Target role
- Specialization
- Company type

These can trigger a new AI roadmap generation.

Do not build a giant universal optimizer.

---

# 35. Rerouting Animation

Desired sequence:

```text
Updated node
     ↓
Dependent state recalculates
     ↓
Unnecessary / completed work fades
     ↓
New available node highlights
     ↓
Next action updates
     ↓
Timeline updates
```

Do not animate every node on every state change.

---

# 36. Timeline View

Secondary view:

```text
[ Skill Tree ] [ Timeline ]
```

Example:

```text
WEEK 1
JavaScript Fundamentals     ✓

WEEK 2
Async + APIs                ●

WEEK 3
React Fundamentals          🔒

WEEK 4
State Management            🔒
```

Timeline is derived from the career graph.

It is not a separate planning authority.

---

# 37. Timeline Rules

For MVP:

```text
remaining work
      ÷
weekly availability
      =
approximate weeks
```

But scheduling must respect dependency order.

The UI should communicate:

```text
Estimated timeline
```

not:

```text
Guaranteed completion date
```

---

# 38. Progress View

Compact summary:

```text
CAREER PROGRESS

38%
████████░░░░░░░░

Skills completed       8 / 21
Projects completed     2 / 6
Estimated remaining    ~8 weeks

CURRENT PHASE
Frontend Foundations
```

Do not turn this into a generic analytics dashboard.

---

# 39. Next Best Action

This is a persistent product element.

Example:

```text
YOUR NEXT BEST ACTION

Build the API integration mini-project.

~2 hours

[ Start Quest → ]
```

It should be visible:

- In the roadmap header
- In node details
- On mobile

The user should never wonder what to do next.

---

# 40. Screen 10 — AI Career Assistant

The assistant supports the roadmap.

Button:

```text
Ask Career Quest
```

Suggested prompts:

```text
Why is this skill needed?
Can I skip this?
I only have 5 hours this week.
What should I do today?
Why did my timeline change?
```

---

# 41. AI Assistant UI

```text
┌─────────────────────────────────────┐
│ Career Assistant                   X│
├─────────────────────────────────────┤
│ Current goal:                       │
│ Full Stack Developer                │
│                                     │
│ User: Can I skip React basics?      │
│                                     │
│ AI: Based on your current           │
│ proficiency, you can reduce this   │
│ section rather than fully skip it. │
│                                     │
│ [ Apply suggestion ]                │
│ [ Keep roadmap ]                    │
│                                     │
│ [ Ask anything...             ]     │
└─────────────────────────────────────┘
```

---

# 42. Assistant Mutation Boundary

The assistant must not silently mutate the graph.

Correct:

```text
User asks
   ↓
AI analyzes graph context
   ↓
AI proposes change
   ↓
User confirms
   ↓
Deterministic graph engine applies change
```

Incorrect:

```text
User asks
   ↓
AI silently edits roadmap
```

The graph engine remains the only authority for state changes.

---

# 43. Mobile Experience

Mobile is first-class.

### Mobile roadmap

```text
┌─────────────────────────┐
│ Career Quest       ☰    │
├─────────────────────────┤
│ 38%     ~8 weeks        │
│                         │
│ NEXT ACTION             │
│ Build API project       │
│ [ Start Quest ]         │
├─────────────────────────┤
│                         │
│       ┌──────────┐      │
│       │   HTML   │      │
│       └────┬─────┘      │
│            ↓            │
│       ┌──────────┐      │
│       │    JS    │      │
│       └────┬─────┘      │
│            ↓            │
│       ┌──────────┐      │
│       │  React   │      │
│       └──────────┘      │
│                         │
│       [ − ] [ + ]       │
└─────────────────────────┘
```

When a node is tapped:

```text
Bottom Sheet
```

opens.

Do not squeeze the desktop side panel into a phone layout.

---

# 44. Responsive Behavior

```text
Desktop
→ Graph + right detail panel

Tablet
→ Graph + collapsible detail panel

Mobile
→ Graph + bottom sheet
```

The exact CSS breakpoints are an implementation detail.

---

# 45. Back Navigation

Expected behavior:

```text
Quest → Back → Node
Node → Back → Graph
Assistant → Close → Graph
Timeline → Graph
```

The user's graph state should not be lost.

Next.js layouts can preserve shared UI across navigation while individual pages change. citeturn0search1

---

# 46. Empty States

## No roadmap

```text
Your career path starts here.

Tell us your dream role and we'll build
your first skill tree.

[ Build Roadmap ]
```

## No selected node

```text
Select a node to explore your next milestone.
```

## No quest

```text
Your mission hasn't been generated yet.

[ Generate Quest ]
```

---

# 47. Error States

## AI roadmap failure

```text
We couldn't build your roadmap right now.

Your current roadmap has not been changed.

[ Try Again ]
```

If a last valid roadmap exists, keep showing it.

## Invalid target

```text
We need a little more detail about your goal.

Try:
"Frontend Engineer at a fintech startup"
```

## Quest failure

```text
We couldn't generate this mission.

[ Retry ]
```

Never expose raw technical errors.

---

# 48. Loading States

### Roadmap

```text
Mapping your career destination...
```

### Graph update

```text
Recalculating your path...
```

### Quest

```text
Designing your mission...
```

### Assistant

```text
Thinking about your current roadmap...
```

Loading states should preserve context.

---

# 49. AI Transparency

Clearly label AI-generated functionality:

```text
AI-generated roadmap
AI-generated quest
AI Career Assistant
```

The user must know when they are interacting with AI.

---

# 50. Accessibility

Minimum requirements:

- Keyboard-accessible controls
- Visible focus states
- Readable contrast
- Labels for important controls
- Status not communicated by color alone
- Accessible graph-node labels
- Important graph information available outside the graph
- Touch-friendly mobile controls

---

# 51. State Ownership

Architecture:

```text
Domain / Career Store
        ↓
Application state
        ↓
React Flow
        ↓
Visual interaction
```

Zustand owns application-level state.

React Flow renders the graph and handles graph interaction.

React Flow's current documentation explicitly describes using Zustand as a central store for nodes, edges and related actions as applications become more complex. citeturn0search0

Controlled flow means the application owns the node/edge state and supplies change handlers. citeturn0search5turn0search2

---

# 52. React Flow Provider

Use `ReactFlowProvider` when React Flow hooks or flow state need to be accessed from components outside the immediate `<ReactFlow>` tree, across multiple flow-related components, or with client-side routing. citeturn0search9

This is an implementation detail, not a user-facing screen.

---

# 53. URL State

Optional but recommended:

```text
/roadmap?node=javascript-async
```

Benefits:

- Browser navigation
- Refreshing selected-node state
- Potential shareable state later

Do not make URL state a blocker for the MVP.

---

# 54. Session Persistence

On refresh:

```text
Restore profile
     ↓
Restore graph
     ↓
Restore skill states
     ↓
Restore selected view where possible
```

MVP can use local persistence.

If no persisted state exists:

```text
Your roadmap session has expired.

[ Build Again ]
```

---

# 55. Core Application State Machine

```text
NEW USER
   ↓
ONBOARDING
   ↓
ROADMAP GENERATING
   ↓
ROADMAP READY
   ↓
EXPLORING
   ↓
QUEST ACTIVE
   ↓
PROGRESS UPDATED
   ↓
PROFICIENCY CONFIRMED
   ↓
REROUTING
   ↓
ROADMAP UPDATED
   ↓
NEXT ACTION
   ↓
EXPLORING
```

Error branch:

```text
ROADMAP GENERATING
       ↓
      ERROR
       ↓
     RETRY
```

---

# 56. Critical Hackathon Demo Flow

The complete 3-minute demo should follow:

```text
LANDING
   ↓
Build My Career Roadmap
   ↓
Enter:
"Full Stack Developer at a product startup"
   ↓
Current skills:
JavaScript = Familiar
Git = Proficient
React = Beginner
   ↓
10 hours/week
   ↓
Generate
   ↓
AI BUILDING
   ↓
CAREER GRAPH
   ↓
Zoom / Pan
   ↓
Click JavaScript
   ↓
Show Why This Node
   ↓
Start Quest
   ↓
Return to graph
   ↓
Update JavaScript → Proficient
   ↓
GRAPH REROUTES
   ↓
Timeline updates
   ↓
Next Best Action updates
   ↓
Ask:
"Why do I need React next?"
   ↓
Context-aware answer
   ↓
END
```

This demonstrates the core PS1 experience without relying on secondary features.

---

# 57. Judge-Facing Wow Moment

Before:

```text
JavaScript
    ↓
React
    ↓
State Management
    ↓
Projects
```

Action:

```text
JavaScript → Proficient
```

Immediately:

```text
JavaScript ✓
      ↓
React ← NOW AVAILABLE
      ↓
State Management
      ↓
Projects
```

And:

```text
Estimated timeline
~10 weeks → ~8 weeks
```

The exact numbers are generated from the current graph state; do not hardcode demo claims into the UI.

---

# 58. Demo Reliability

Before presentation:

- Test one reliable target role.
- Test one reliable AI generation flow.
- Keep a last-valid generated roadmap available.
- Test every critical button.
- Test mobile once.
- Verify production environment variables.
- Confirm no secrets are exposed.
- Test AI failure and retry.
- Test skill rerouting.
- Test quest generation.
- Test assistant response.

Fallback must be a previously valid AI-generated roadmap, not a hardcoded career roadmap.

---

# 59. Core UX Rules

### Rule 1

Never make the user read a wall of text before seeing value.

### Rule 2

Show the graph as soon as the roadmap is ready.

### Rule 3

Every important skill should lead to a concrete action.

### Rule 4

Every major state change should provide visible feedback.

### Rule 5

Always expose a Next Best Action.

### Rule 6

Make adaptation visible.

### Rule 7

The AI assistant must remain secondary.

### Rule 8

The graph must represent real application state.

### Rule 9

Quest completion records evidence/progress; it does not automatically grant mastery.

### Rule 10

Never replace the AI-generated roadmap with a hidden hardcoded roadmap.

---

# 60. Visual Direction

Recommended product personality:

```text
Professional
+
Premium
+
Dark / modern
+
Interactive
+
Subtle RPG influence
```

The graph should be the visual hero.

Cards and panels should support the graph rather than compete with it.

Avoid childish badges, excessive gamification and excessive animation.

---

# 61. MVP Screen Checklist

## Required

- [ ] Landing
- [ ] Dream role
- [ ] Current skills
- [ ] Proficiency selection
- [ ] Weekly hours
- [ ] Review
- [ ] AI generation state
- [ ] Validated career graph
- [ ] Graph zoom/pan
- [ ] Node interaction
- [ ] Node detail panel
- [ ] Why This Node
- [ ] Quest
- [ ] Quest progress
- [ ] Evidence/completion
- [ ] Proficiency confirmation
- [ ] Dynamic rerouting
- [ ] Timeline estimate
- [ ] Next Best Action
- [ ] AI assistant
- [ ] Mobile layout
- [ ] Loading states
- [ ] Error states
- [ ] AI transparency

---

# 62. Optional Enhancements

Only after the core loop is stable:

- [ ] Advanced progress dashboard
- [ ] Public roadmap link
- [ ] Export roadmap
- [ ] Role comparison
- [ ] Specialization branching
- [ ] Advanced evidence verification
- [ ] ELK-based automatic layout
- [ ] Authentication
- [ ] Database persistence
- [ ] Multi-agent architecture

---

# 63. Explicitly Avoid

```text
❌ Huge chatbot homepage
❌ Generic AI career chat
❌ Static infographic
❌ Long onboarding questionnaire
❌ Large navigation system
❌ Fake precision in progress/timeline
❌ Childish RPG badges
❌ Excessive animations
❌ Wall of AI-generated text
❌ Course marketplace
❌ Full job-scraping platform
❌ Resume builder
❌ Full mock-interview platform
```

The product should feel like:

> **A professional career operating system with an RPG-inspired skill graph.**

Not:

> **A chatbot wrapped in a dashboard.**

---

# 64. Implementation Order

Build in this order:

```text
1. Landing
2. Onboarding
3. Roadmap generation
4. Graph rendering
5. Node interaction
6. Quest generation
7. Quest progress
8. Proficiency confirmation
9. Deterministic rerouting
10. Timeline
11. Next Best Action
12. AI Assistant
13. Mobile
14. Animations
15. Accessibility
16. Testing
17. Deployment
```

Do not start with:

- advanced animations
- authentication
- database
- role comparison
- advanced analytics
- multi-agent orchestration

Make the core loop work first.

---

# 65. Final Product Architecture

```text
                         LANDING
                            │
                            ▼
                       ONBOARDING
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
          DREAM ROLE    CURRENT SKILLS   CONSTRAINTS
              │             │             │
              └─────────────┼─────────────┘
                            ▼
                     REVIEW & GENERATE
                            │
                            ▼
                       AI PIPELINE
                            │
                            ▼
                    VALIDATED GRAPH
                            │
                            ▼
                   NORMALIZED + LAYOUT
                            │
                            ▼
                     ZUSTAND STORE
                            │
                            ▼
                     ROADMAP SCREEN
                 ┌──────────┼───────────┐
                 │          │           │
                 ▼          ▼           ▼
              GRAPH      TIMELINE   PROGRESS
                 │
                 ▼
             NODE CLICK
                 │
                 ▼
           DETAIL PANEL
                 │
        ┌────────┴────────┐
        ▼                 ▼
     WHY NODE          START QUEST
                            │
                            ▼
                       QUEST ACTIVE
                            │
                            ▼
                    EVIDENCE / COMPLETE
                            │
                            ▼
                  PROFICIENCY CONFIRMATION
                            │
                            ▼
                      GRAPH ENGINE
                            │
                 ┌──────────┼──────────┐
                 ▼          ▼          ▼
              UNLOCK     TIMELINE    NEXT ACTION
                 │          │          │
                 └──────────┼──────────┘
                            ▼
                       UPDATED GRAPH
                            │
                            ▼
                    CONTINUE JOURNEY

                  AI ASSISTANT
                       │
                       ▼
                 PROPOSE CHANGE
                       │
                       ▼
                  USER CONFIRMS
                       │
                       ▼
                  GRAPH ENGINE
```

---

# 66. Final UX Definition

A successful user should understand:

```text
WHERE AM I?
→ Current skill state

WHERE AM I GOING?
→ Dream role

WHAT DO I DO NEXT?
→ Next Best Action

WHY AM I DOING IT?
→ Why This Node

HOW DO I DO IT?
→ Quest

WHAT HAPPENS WHEN I IMPROVE?
→ Dynamic rerouting
```

If these six questions are continuously answered, the core UX is doing its job.

---

# 67. Final Product Statement

> **Tell us where you want to go → show us where you are → we'll build the path → give you the next mission → adapt the path as you grow.**

---

# 68. Final Status

**APP FLOW: FROZEN FOR IMPLEMENTATION**

Aligned with:

- PRD
- TRD
- PS1 core requirements
- React Flow architecture
- Zustand state architecture
- Next.js App Router
- Dynamic skill-state rerouting
- Actionable Quest model
- Mobile-first requirements
- Hackathon demo flow

No major UX architecture changes should be made unless a concrete implementation constraint appears during development.
