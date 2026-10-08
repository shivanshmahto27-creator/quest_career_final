# Career Quest — Reverse-Engineered Career Roadmapper

> **Hackathon MVP (v1.1 Frozen)**  
> **LLOYD Hackathon — Problem Statement 1**  
> *Transform ambiguous career aspirations into deterministic, actionable, RPG-inspired skill graphs.*

---

## 1. What It Does

Most career advice tools give static markdown lists or unstructured chat responses. When a learner already knows a skill or takes an assessment, static checklists break.

**Career Quest** reverse-engineers a target dream role into a **Strict Directed Acyclic Graph (DAG)** of competencies:
1. **Dynamic Rerouting:** Mark a skill as already known (`ALREADY_KNOWN`), and the graph immediately recalculates, pruning unnecessary effort and unlocking downstream dependencies.
2. **Next Best Action (NBA):** The system scores available nodes deterministically and tells the user exactly what to do next, why now, and how long it will take.
3. **Execution Quests:** Turn any unlocked skill into a concrete mission workspace with project deliverables, task checklists, and technical interview screening questions.
4. **Context-Aware AI Assistant:** Proposes structured roadmap mutations that only take effect when confirmed and evaluated by the deterministic Graph Engine.

---

## 2. Core Architecture & Separation of Concerns

```text
┌────────────────────────────────────────────────────────┐
│                      FRONTEND                          │
│  Next.js 15 App Router • React 19 • React Flow (@xyflow)│
│  Controlled canvas, responsive drawer, accessible UI   │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON
┌───────────────────────────▼────────────────────────────┐
│                    API BOUNDARY                        │
│  /api/v1/* Route Handlers • Unified { data, error }     │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
┌─────────────▼──────────────┐  ┌──────────▼─────────────┐
│    AI ORCHESTRATION        │  │  DETERMINISTIC ENGINE  │
│  Proposes candidate JSON   │  │  Authority for:        │
│  4-layer validation pipeline│  │  • Kahn DAG validation  │
│  Zod runtime schemas       │  │  • Prerequisite gating │
│  Mock & Live AI providers  │  │  • Timeline arithmetic │
└─────────────┬──────────────┘  │  • Next Best Action    │
              │                 └──────────┬─────────────┘
┌─────────────▼────────────────────────────▼─────────────┐
│                    DATABASE LAYER                      │
│  Prisma ORM • PostgreSQL / SQLite • Optimistic Locking │
└────────────────────────────────────────────────────────┘
```

- **Frontend:** Presentation & user interaction only. Never derives authoritative graph state.
- **AI Provider:** Proposes candidate roadmaps; does not mutate database or graph directly.
- **Graph Engine:** Authoritative pure TypeScript engine. Enforces DAG invariants, evaluates node readiness, and performs deterministic topological recalculations.

---

## 3. Technology Stack

- **Framework:** Next.js 15.2 (App Router), React 19, TypeScript 5.8
- **Graph Visualization:** `@xyflow/react` (React Flow v12)
- **Styling & Tokens:** Tailwind CSS 3.4 (Dark technical aesthetic `#050607`, electric lime `#D8FF5A`)
- **Data Validation:** Zod 3.24
- **ORM / Schema:** Prisma ORM (22 relational models with optimistic concurrency locking)
- **Icons:** Lucide React
- **Testing:** Node.js native test runner (`node --test`)

---

## 4. How to Run Locally

### Prerequisites
- Node.js `v20+` or `v22+` (tested on Node `v26`)
- npm or pnpm

### Quickstart
```bash
# 1. Clone repository & install dependencies
git clone <repository-url>
cd engineering
npm install

# 2. Typecheck & verify all tests pass
npm run typecheck
npm test

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

---

## 5. Automated Quality Gates & Testing

The test suite enforces full compliance with the 12 project specifications:

```bash
# Run complete test suite (Phase 1 through Phase 6)
npm test
```

- `tests/graph-engine.test.js`: Cycle detection, Kahn's algorithm, prerequisite unlocking, timeline arithmetic, deterministic NBA ranking.
- `tests/phase2-ai-db.test.js`: Prisma relational schema validation, DB production guard, Zod runtime schemas, 4-layer validation pipeline.
- `tests/phase3-api.test.js`: REST API endpoints, 409 conflict checks, skill updates, quest lifecycle, assistant proposals.
- `tests/phase4-frontend.test.js`: File architecture, design tokens, accessibility, reduced motion, onboarding wizard.
- `tests/phase5-quest-assistant.test.js`: Quest workspace checklists, interview readiness, completion downstream unlocks, assistant drawer.
- `tests/phase6-e2e-demo-hardening.test.js`: Full 10-step judge smoke test flow, health check, and error boundaries.

---

## 6. Judge Demo Walkthrough (10-Step Narrative)

1. **Homepage (`/`):** View the mission statement and click **Enter Onboarding**.
2. **Onboarding Stepper (`/onboarding`):** Select Target Role (`Full Stack Developer`), enter current skills, set weekly hours (15h), and click **Generate Roadmap**.
3. **Interactive Career Graph (`/roadmap`):** Inspect the React Flow canvas. Note that foundational JavaScript is `AVAILABLE` while downstream React is `LOCKED`.
4. **Inspect Node:** Click **JavaScript** to open the side drawer explaining *Why This Matters* and *Prerequisites*.
5. **Next Best Action:** Notice the highlighted command card pointing directly to **JavaScript Fundamentals** because it unlocks the most downstream dependencies.
6. **Launch Quest:** Click **Start Quest** on either the node or Next Best Action card. You are seamlessly transitioned to the **Quest Workspace** (`/quest/[id]`).
7. **Execute Mission:** Toggle interactive task checklist items, review the Technical Interview Questions, and enter a GitHub repository URL.
8. **Complete Quest:** Click **Mark Quest Complete**. The Graph Engine records evidence, marks the node as `COMPLETED`, updates proficiency, and unlocks **React & Component Architecture** (`LOCKED` → `AVAILABLE`).
9. **AI Copilot Drawer:** Click **AI Copilot** on the roadmap header. Ask: *"I already know Git"* or select a prompt pill. The Assistant proposes a structured mutation card.
10. **Confirm Proposal:** Click **Confirm Proposal**. The engine instantly reroutes the roadmap without a page reload.

---

## 7. Hackathon Submission Information

- **Track:** LLOYD Hackathon — Problem Statement 1 (Reverse-Engineered Career Roadmapper)
- **Authoritative Specifications:** Implemented strictly per `/docs` (TRD, PRD, APP_FLOW, UI/UX v2.0, Database v1.1, AI Orchestration v1.1, Frontend v1.1, Backend v1.1, Testing v1.2, Deployment Runbook v1.0).
- **License:** MIT
