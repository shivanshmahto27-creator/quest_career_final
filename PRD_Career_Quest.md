# PRD — Reverse-Engineered Career Roadmapper

**Product Codename:** Career Quest  
**Problem Statement:** PS1 — Reverse-Engineered Career Roadmapper  
**Version:** 1.1 — Frozen Hackathon MVP  
**Status:** Build-Ready Product Requirements Document

---

# 1. Product Vision

Career Quest is an AI-powered **career execution engine** that converts a user's specific dream job into a personalized, interactive and adaptive career roadmap.

Instead of giving users another static checklist or generic AI response, Career Quest represents the career path as an interactive skill tree.

Users can:

- Define a specific career destination.
- Describe their current skills and experience.
- See the gap between their current state and target role.
- Explore a dependency-based skill graph.
- Follow actionable quests.
- Track progress.
- Mark skills as known or completed.
- Change their availability or goals.
- Ask a contextual AI career assistant for help.
- See the roadmap dynamically re-plan as their situation changes.

## Core Product Loop

```text
DREAM ROLE
    ↓
CURRENT STATE
    ↓
SKILL GAP
    ↓
CAREER SKILL GRAPH
    ↓
NEXT BEST ACTION
    ↓
ACTIONABLE QUEST
    ↓
PROGRESS / EVIDENCE
    ↓
CURRENT STATE UPDATED
    ↓
ROADMAP REPLANS
    ↓
NEXT BEST ACTION
```

The **interactive career graph is the primary product experience**.

The AI Career Bot is a supporting intelligence layer, not the primary interface.

---

# 2. Problem Statement

Students and early-career professionals have access to an overwhelming amount of career advice, but much of it is generic, static and difficult to translate into action.

A user may know exactly what they want:

> "I want to become a Full Stack Developer at an early-stage climate-tech startup in India within 6 months."

But typical career advice does not sufficiently answer:

- What skills are actually required?
- Which skills should come first?
- Which skills are prerequisites?
- What do I already know?
- How strong am I in each skill?
- What can I safely skip?
- What should I do this week?
- Which project should I build?
- What evidence proves that I can perform the skill?
- What changes if I have only 5 hours instead of 10 hours per week?
- What happens if I change my target role?
- When am I realistically ready for an internship or entry-level role?

Career Quest focuses on the execution loop:

> **Where am I → Where do I want to go → What is my next best move → What do I actually do → How does my path change after I improve?**

---

# 3. Target Users

## 3.1 Primary User

College students and early-career learners who:

- Have a specific target career or role.
- Are overwhelmed by conflicting learning advice.
- Have limited weekly learning time.
- Already know some skills.
- Want practical projects instead of only courses.
- Want to understand their skill gaps.
- Need a structured path toward internships or jobs.

## 3.2 Example User

```text
Target Role:
Full Stack Developer

Target Environment:
Early-stage climate-tech startup

Market:
India

Timeline:
6 months

Availability:
10 hours/week

Current Skills:
HTML
CSS
Basic JavaScript
```

Career Quest should generate a path specifically for this user rather than displaying a generic Full Stack roadmap.

---

# 4. Product Goals

## G1 — Reverse-engineer a career destination

Convert a specific dream job into a structured set of:

- Career phases
- Skills
- Skill dependencies
- Proficiency requirements
- Intermediate milestones
- Projects
- Certifications/resources where appropriate
- Job-readiness criteria

## G2 — Understand the user's current state

Represent the user's current capabilities using:

- Skills
- Proficiency levels
- Experience
- Existing projects
- Certifications where relevant
- Available weekly time

The system should distinguish between:

**Unknown → Beginner → Familiar → Proficient → Advanced**

rather than treating every skill as simply "known" or "unknown."

## G3 — Identify the skill gap

Compare:

```text
CURRENT PROFICIENCY
        vs.
REQUIRED PROFICIENCY
```

and categorize skills into:

- Acquired
- Partially matched
- Missing
- Prerequisite
- Optional / specialization

## G4 — Generate an interactive skill graph

The roadmap must be represented as a graph/skill tree.

Users must be able to:

- Zoom
- Pan
- Click nodes
- Understand dependencies
- Identify locked/unlocked skills
- See progress
- Explore career phases
- Identify the next recommended milestone

A plain list, accordion or checklist does not satisfy the core product experience.

## G5 — Convert skills into execution

Every important skill should be capable of becoming an actionable quest.

The system should answer:

> **"What exactly should I do next?"**

## G6 — Dynamically adapt

The roadmap must change when the user's state changes.

Possible triggers:

- Skill marked already known
- Skill proficiency increased
- Skill completed
- Quest completed
- Weekly availability changed
- Target timeline changed
- Target role changed
- User chooses a different specialization

## G7 — Provide contextual AI assistance

The AI Career Bot should help users:

- Understand a skill
- Ask why a node exists
- Clarify prerequisites
- Ask questions about their current roadmap
- Compare possible paths
- Request a lighter/heavier weekly plan
- Understand career decisions

The bot must **not replace the interactive roadmap as the primary experience.**

---

# 5. Product Non-Goals

The hackathon MVP will NOT attempt to become:

- A generic AI chatbot
- A full job portal
- A resume builder
- A course marketplace
- A large-scale job scraper
- A social network
- A full mock-interview platform
- A complete LMS
- A complex recruitment platform
- A voice-based career assistant
- A multi-agent system purely for showcasing agents

These can be future extensions but must not delay the core experience.

---

# 6. Core User Journey

## Step 1 — Define the Destination

User enters or describes:

- Target role
- Target industry/company type
- Market/location
- Desired timeline
- Weekly availability
- Current experience
- Current skills

Example:

> "I want to become a Full Stack Developer at a climate-tech startup in India within 6 months. I can spend 10 hours per week and already know HTML, CSS and basic JavaScript."

---

# 7. Current State Assessment

Career Quest creates a lightweight representation of the user's current state.

Each relevant skill can have:

```text
Skill
Current Proficiency
Evidence
Status
```

## Proficiency Model

```text
0 — Unknown
1 — Beginner
2 — Familiar
3 — Proficient
4 — Advanced
5 — Expert
```

The system should not require a long assessment before generating the first roadmap.

Users can refine their proficiency after generation.

---

# 8. Target State

The target role is represented by:

```text
Target Role
Required Skills
Required Proficiency
Dependencies
Role Milestones
Job-Readiness Criteria
```

Example:

```text
TARGET:
Full Stack Developer

Required:
JavaScript       → Proficient
React             → Proficient
REST APIs         → Proficient
Node.js           → Intermediate
SQL               → Intermediate
Git               → Proficient
Deployment        → Familiar
```

---

# 9. Skill Gap Engine

The system compares current state with target state.

Conceptually:

```text
CURRENT STATE
      ↓
REQUIRED STATE
      ↓
SKILL GAP
```

Each skill should be classified as:

### ACQUIRED
Current proficiency satisfies the required level.

### PARTIAL
User possesses the skill but needs additional development.

### MISSING
Skill is required but not currently demonstrated.

### PREREQUISITE
Skill must be acquired before another important skill can be unlocked.

### OPTIONAL
Useful but not required for the primary path.

---

# 10. AI Roadmap Generation

The AI shall generate structured roadmap data rather than relying on fixed/pre-written career paths.

The generated roadmap should contain, at minimum:

```text
Target Role
Career Phases
Skills
Skill IDs
Required Proficiency
Current Proficiency
Prerequisites
Dependencies
Node Status
Estimated Effort
Timeline
Milestones
Projects
Quests
Interview Challenges
Completion Criteria
Job-Readiness Criteria
```

The AI output must conform to a validated schema before being rendered by the frontend.

---

# 11. Interactive Career Skill Tree

This is the **hero product experience**.

Example:

```text
                    DREAM ROLE
                         │
              ┌──────────┴──────────┐
              │                     │
         JavaScript             Git/GitHub
              │                     │
              └──────────┬──────────┘
                         ↓
                       React
                         │
              ┌──────────┴──────────┐
              ↓                     ↓
        State Management          APIs
              │                     │
              └──────────┬──────────┘
                         ↓
                      Node.js
                         │
                         ↓
                    JOB READY
```

The visualization must support:

- Zoom
- Pan
- Node selection
- Dependency edges
- Node states
- Phase grouping
- Progress indicators
- Current path highlighting
- Next-best-action highlighting

---

# 12. Node States

Each skill node should support:

```text
LOCKED
AVAILABLE
IN_PROGRESS
COMPLETED
MASTERED
ALREADY_KNOWN
```

Visual styling should clearly differentiate these states.

---

# 13. Skill Node Details

Clicking a node should open a contextual detail panel.

Example:

## React State Management

**Status:** Available  
**Required proficiency:** Proficient  
**Estimated effort:** 5 days

### Why this matters

> This skill is required to build complex interactive applications and is a prerequisite for the next phase of the roadmap.

### Mission

Build a shopping cart application using React state management.

### Daily Quest

**Day 1:** State fundamentals  
**Day 2:** Cart state  
**Day 3:** Persistence  
**Day 4:** Reducer-based refactor  
**Day 5:** Deployment and documentation

### Portfolio Output

A deployed shopping-cart application with a GitHub repository.

### Interview Challenge

> Explain when `useReducer` is preferable to `useState`.

### Completion Criteria

> Build the feature independently without following a tutorial step-by-step.

---

# 14. Next Best Action

The product must always make the user's immediate next action obvious.

Example:

## ⚡ YOUR NEXT MOVE

**Build a REST API with Node.js**

`4 hours · Intermediate`

### Why now?

> You have completed JavaScript fundamentals and HTTP basics. This skill unlocks the next backend phase of your target path.

The next-best-action system should consider:

- Skill dependencies
- Current proficiency
- Target role relevance
- User availability
- Timeline
- Completed work
- Current roadmap state

The graph is not merely a map.

It is an **execution interface**.

---

# 15. Dynamic Rerouting

This is a core PS requirement and one of the primary differentiators.

## Example

Initial:

```text
HTML → CSS → JavaScript → React → Node.js
```

User selects:

> **JavaScript → Already Know**

The system should:

1. Update JavaScript state.
2. Recalculate dependent nodes.
3. Unlock eligible nodes.
4. Update the recommended next milestone.
5. Recalculate estimated timeline.
6. Update progress.
7. Visually animate the changed route.

The system should preserve valid prerequisite relationships rather than simply deleting random nodes.

---

# 16. Replanning Triggers

Roadmap recalculation may be triggered when:

### Skill state changes

```text
Beginner → Proficient
```

### Skill is completed

```text
In Progress → Completed
```

### User skips known material

```text
Unknown → Already Known
```

### Weekly availability changes

```text
10 hours/week → 5 hours/week
```

### Timeline changes

```text
6 months → 4 months
```

### Target changes

```text
Frontend Developer
        ↓
Full Stack Developer
```

### Specialization changes

```text
Frontend
Backend
Full Stack
```

---

# 17. Timeline Engine

The roadmap should provide an estimated timeline based on:

- Number of required skills
- Skill difficulty
- Estimated effort
- Current proficiency
- Dependencies
- Weekly availability

The timeline should be treated as an estimate rather than a guarantee.

Example:

```text
Before:
24 weeks

After known skills:
20 weeks

Current pace:
10 hours/week
```

---

# 18. Why This Node?

Every significant recommendation should have an explainability layer.

Example:

## Why do I need Node.js?

> Node.js is included because your target role requires backend development and your current roadmap has no server-side runtime. It also unlocks the API and backend architecture phase.

The explanation should be based on:

- Target role
- Skill dependency
- User's current state
- Roadmap sequence

---

# 19. Evidence & Grounding

The system should distinguish between:

### AI-generated recommendation

> Recommended based on your target role and current skill state.

### Verified external information

> Supported by structured occupational/skill data.

### User-provided information

> Based on the user's stated proficiency or experience.

Where useful, the system may ground skills and occupations against structured sources such as ESCO and O*NET.

The product must NOT claim:

> "AI cannot hallucinate."

Instead, it should communicate:

> **Recommendations are grounded and validated where supporting data is available.**

---

# 20. Confidence Layer

Where appropriate, recommendations can expose a confidence indicator.

Example:

```text
RECOMMENDATION
React

Relevance:
High

Reason:
Strong relationship to target role

Evidence:
Skill taxonomy + role requirements + AI analysis

Confidence:
High
```

Confidence should not be presented as a scientifically precise probability unless the underlying system actually calculates one.

---

# 21. India-Specific Context

Career Quest should support India-relevant career context where reliable information is available.

Potential information:

- Indian entry-level roles
- Indian internship context
- Relevant certifications
- Indian hiring terminology
- India-relevant companies
- Salary information where properly sourced

The product must never fabricate exact salary figures, company requirements or certification recognition claims.

India-specific context is a differentiator, not a reason for false precision.

---

# 22. AI Career Bot

The AI Career Bot is a **supporting feature**.

It should never replace the skill tree as the primary interface.

## Bot capabilities

Users can ask:

> Why do I need this skill?

> Can I skip this node?

> I only have 5 hours this week. What should I prioritize?

> What's the difference between these two paths?

> How does this skill help my target role?

> Can you explain this concept?

> I already have three React projects. What should change?

---

# 23. Context-Aware AI Bot

The bot should know:

- Current target role
- Current roadmap
- Current skill
- Current proficiency
- Completed skills
- Current phase
- Available time
- Timeline

Example:

User opens:

**React State Management**

Then asks:

> "Why do I need this?"

The bot should answer specifically for that user's roadmap rather than giving a generic explanation.

---

# 24. Bot-to-Roadmap Interaction

The bot may propose changes to the roadmap.

Example:

User:

> "I've already built three production React apps."

Bot:

> "Your React proficiency appears higher than currently recorded. I recommend moving React to Proficient and shortening this quest."

Then:

**[Apply to Roadmap]**

The user must confirm meaningful roadmap changes.

The roadmap remains the source of truth.

---

# 25. Gamification Principles

Career Quest should feel like a professional RPG-style progression system.

## Use

- Skill unlocking
- Branching paths
- Quests
- Milestones
- Mastery levels
- Progress
- Visual completion states
- Career progression

## Avoid

- Childish badges
- Excessive points
- Fake rewards
- Arcade-style UI
- Gamification that distracts from career outcomes

The intended feeling is:

> **"It feels like a game, but the progress represents my actual career."**

---

# 26. Mastery System

Skills may progress through:

```text
AWARENESS
    ↓
FAMILIAR
    ↓
PROFICIENT
    ↓
ADVANCED
    ↓
EXPERT
```

The system should not automatically declare a user an expert simply because they completed a quest.

Mastery can be represented as self-reported or evidence-backed progress.

---

# 27. Progress System

The product should communicate:

- Overall completion
- Current phase
- Current milestone
- Skills completed
- Skills remaining
- Estimated time remaining
- Next recommended action

Example:

```text
FULL STACK DEVELOPER

Progress       38%
████████░░░░░░░░░░

Current Phase  → Frontend
Next Mission  → React Fundamentals
Estimated Time → 14 weeks
Skills Done    → 8 / 21
```

---

# 28. Progress Evidence

Where useful, users should be able to associate evidence with completed skills.

Examples:

- GitHub repository
- Deployed project
- Certificate
- Project submission
- Assessment result
- Self-confirmation

This transforms:

> "I completed React"

into:

> "I completed React and built this project as evidence."

---

# 29. AI Transparency

AI-generated content must be clearly identified.

Example:

> ✦ AI-generated career recommendation

Where external validation exists:

> ✓ Grounded with verified career/skill data

Users should understand when they are interacting with AI.

The product must not present AI recommendations as guaranteed employment outcomes.

---

# 30. Technical Product Principles

## Principle 1 — Structured AI

LLM output must conform to a defined schema.

## Principle 2 — Graph-first

Career paths are represented as nodes and dependency edges.

## Principle 3 — Deterministic adaptation

The application controls graph state and dependency recalculation.

The LLM should not randomly regenerate the entire roadmap every time a user clicks a checkbox.

## Principle 4 — AI for intelligence, code for state

AI handles:

- Career reasoning
- Recommendations
- Explanations
- Quest generation
- Conversational assistance

Application logic handles:

- Node states
- Dependencies
- Progress
- Unlocking
- Timeline calculations
- Rerouting
- User confirmations

## Principle 5 — Source-aware recommendations

External career data should be used where it improves reliability.

## Principle 6 — Demo-critical path first

The core experience must work before secondary features are built.

---

# 31. Primary User Flow

```text
LANDING
   ↓
DEFINE DREAM ROLE
   ↓
CURRENT STATE
   ↓
GENERATE ROADMAP
   ↓
CAREER SKILL TREE
   ↓
EXPLORE NODE
   ↓
NEXT BEST ACTION
   ↓
QUEST
   ↓
COMPLETE / ALREADY KNOW
   ↓
RECALCULATE
   ↓
UPDATED GRAPH
   ↓
UPDATED TIMELINE
   ↓
NEXT BEST ACTION
```

---

# 32. Secondary AI Flow

```text
SKILL TREE
    ↓
SELECT NODE
    ↓
AI CAREER BOT
    ↓
ASK QUESTION
    ↓
CONTEXT-AWARE RESPONSE
    ↓
OPTIONAL ROADMAP CHANGE
    ↓
USER CONFIRMS
    ↓
GRAPH UPDATES
```

This keeps conversational AI subordinate to the actual career execution experience.

---

# 33. MVP Success Criteria

A first-time judge should be able to:

1. Understand the product within 10 seconds.
2. Enter a specific dream job.
3. Generate a personalized roadmap.
4. Understand the skill tree without developer explanation.
5. Zoom and explore the graph.
6. Click a skill.
7. Understand why the skill exists.
8. See a concrete actionable quest.
9. Mark a skill as already known.
10. See the graph dynamically adapt.
11. See the estimated timeline change.
12. Identify the next best action.
13. Ask the AI Career Bot a contextual question.
14. Understand how the product helps them move toward the target role.

---

# 34. Technical Success Criteria

The MVP should:

- Generate schema-valid AI responses.
- Handle invalid or unexpected user input gracefully.
- Prevent broken graph dependencies.
- Keep roadmap state consistent.
- Recalculate dependent nodes correctly.
- Work on desktop and mobile.
- Maintain readable contrast and labelled controls.
- Avoid exposing API keys.
- Deploy successfully.
- Allow judges to use the primary flow without developer assistance.

---

# 35. Critical Demo Flow

## 0:00–0:15 — Problem

Show the user entering:

> "Full Stack Developer at an early-stage climate-tech startup in India."

## 0:15–0:40 — Generate

AI produces the personalized skill tree.

## 0:40–1:00 — Explore

Zoom into the graph and show dependencies.

## 1:00–1:20 — Adaptation

Mark:

> JavaScript → Already Known

The graph recalculates.

## 1:20–1:35 — Timeline

Show the updated estimated timeline and next-best-action.

## 1:35–1:55 — Quest

Open a skill.

Show:

- Mission
- Daily tasks
- Project
- Interview challenge
- Completion criteria

## 1:55–2:10 — AI Bot

Ask:

> "Why do I need this skill for my target role?"

Show contextual answer.

## 2:10–2:20 — Close

> **"We're not another AI chatbot that tells you what to learn. We turn your career destination into a living skill tree that tells you what to do next—and changes as you grow."**

---

# 36. Feature Priority

| Feature | Priority | Reason |
|---|---|---|
| AI roadmap generation | P0 | Core PS requirement |
| Current vs target skill state | P0 | Enables real personalization |
| Skill-gap analysis | P0 | Core intelligence |
| Interactive skill tree | P0 | Core PS requirement |
| Skill dependencies | P0 | Enables meaningful adaptation |
| Dynamic rerouting | P0 | Killer PS requirement |
| Next-best-action | P0 | Converts graph into execution |
| Actionable quests | P0 | Major differentiation |
| Timeline recalculation | P0 | Makes adaptation visible |
| Progress tracking | P0 | Core experience |
| AI transparency | P0 | Responsible AI UX |
| Contextual AI Bot | P1 | Supporting intelligence layer |
| Skill explanations | P1 | Improves trust |
| Grounding | P1 | Improves reliability |
| India-specific context | P1 | Differentiation |
| Evidence/proof | P1 | Strengthens job-readiness |
| Smooth animations | P1 | Demo polish |
| Authentication | P2 | Only if time permits |
| Multi-agent architecture | P2 | Only if genuinely useful |
| Resume parsing | P2 | Not necessary for core flow |
| Social features | P3 | Not relevant to MVP |
| Job scraping | P3 | Scope/risk |

---

# 37. Out of Scope for Hackathon MVP

Do NOT allow these to delay the core experience:

- Complex authentication
- Full job marketplace
- Large-scale scraping infrastructure
- Complete learning platform
- Course purchasing
- Social networking
- Full AI interview simulator
- Voice assistant
- Advanced analytics
- Complex recruiter dashboard
- Five-agent architecture without measurable benefit

---

# 38. Product Differentiation

Career Quest is NOT:

> "ChatGPT for career advice."

It is NOT:

> "Another AI roadmap generator."

It is:

> **An adaptive career execution engine that turns a specific career destination into a living skill graph, identifies the user's skill gaps, converts the next skill into an actionable mission, and continuously adapts the path as the user progresses.**

## Differentiation Stack

```text
PERSONALIZED DESTINATION
        +
CURRENT SKILL STATE
        +
SKILL GAP
        +
DEPENDENCY GRAPH
        +
DYNAMIC REROUTING
        +
NEXT BEST ACTION
        +
ACTIONABLE QUESTS
        +
PROGRESS / EVIDENCE
        +
CONTEXTUAL AI ASSISTANT
```

---

# 39. Product North Star

## North Star Question

> **Can the user always answer: "What exactly should I do next to get closer to my target role?"**

Every feature should be evaluated against this question.

If a feature does not improve the user's ability to answer it, it should not take priority during the hackathon.

---

# 40. MVP Completion Definition

The MVP is complete when this loop works reliably:

```text
USER
 ↓
Dream Job + Current State + Time
 ↓
AI
 ↓
Skill Gap
 ↓
Structured Career Roadmap
 ↓
Interactive Skill Graph
 ↓
Next Best Action
 ↓
Actionable Quest
 ↓
Progress / Evidence
 ↓
Skill State Updated
 ↓
DAG Recalculation
 ↓
Updated Skill Graph
 ↓
Updated Timeline
 ↓
Next Best Action
```

The AI Career Bot sits alongside this loop as a contextual assistant.

The **graph + execution loop is the product.**

---

# 41. Final Product Principle

> **Don't tell me what I should learn. Show me the shortest realistic path from where I am to where I want to be—and tell me exactly what I should do next.**
