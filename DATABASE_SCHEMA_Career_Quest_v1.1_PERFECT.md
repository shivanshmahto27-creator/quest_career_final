# Career Quest --- Database Schema Specification

**Version:** 1.1\
**Status:** FROZEN FOR IMPLEMENTATION\
**Product:** Career Quest --- Reverse-Engineered Career Roadmapper\
**Database:** PostgreSQL\
**ORM:** Prisma / Drizzle / equivalent relational ORM\
**Scope:** Hackathon MVP, production-minded foundation

------------------------------------------------------------------------

# 1. Purpose

This document defines the authoritative persistent data model for Career
Quest.

The database must support:

-   user identity and career profile
-   target role and constraints
-   normalized skills
-   current skill proficiency
-   proficiency history
-   AI-generated roadmap versions
-   roadmap phases
-   roadmap nodes
-   node dependencies
-   roadmap-specific skill-state snapshots
-   quests and quest tasks
-   evidence
-   proficiency assessments
-   timeline snapshots
-   Next Best Action
-   roadmap change history
-   AI assistant conversations
-   assistant proposals
-   generation metadata and auditability

The database stores **validated application state**.

It does not own:

-   AI reasoning
-   graph layout
-   dependency calculation
-   Next Best Action scoring
-   timeline calculation logic
-   React Flow state
-   natural-language generation

Those remain application/graph-engine responsibilities.

------------------------------------------------------------------------

# 2. Core Architecture Principle

> **Persist what happened. Recalculate what can be derived. Validate
> before activation.**

Architecture:

``` text
USER
  ↓
AI / APPLICATION
  ↓
STRUCTURED OUTPUT
  ↓
SCHEMA VALIDATION
  ↓
SEMANTIC GRAPH VALIDATION
  ↓
GRAPH NORMALIZATION
  ↓
DATABASE TRANSACTION
  ↓
VALIDATED PERSISTENT STATE
```

The LLM never directly writes authoritative graph state.

------------------------------------------------------------------------

# 3. Database Philosophy

The database should remain a durable relational foundation.

Use relational tables for:

-   users
-   profiles
-   skills
-   roadmap versions
-   phases
-   nodes
-   dependencies
-   quests
-   evidence
-   state history

Use JSONB only where content is genuinely flexible:

-   assistant proposal payload
-   interview-question arrays
-   change-event payload
-   generation metadata where appropriate

Do **not** store the complete roadmap as one giant JSON blob.

The graph structure must remain queryable through relational records.

------------------------------------------------------------------------

# 4. Entity Overview

``` text
USER
 │
 ├── CAREER_PROFILE
 │
 ├── USER_SKILLS ───── SKILLS
 │       │
 │       └──── SKILL_STATE_HISTORY
 │
 ├── ROADMAPS
 │       │
 │       ├── ROADMAP_GENERATIONS
 │       ├── ROADMAP_PHASES
 │       │       └── PHASE_TIMELINE
 │       ├── ROADMAP_NODES
 │       │       ├── NODE_SKILL_SNAPSHOTS
 │       │       ├── NODE_DEPENDENCIES
 │       │       └── QUESTS
 │       │              ├── QUEST_TASKS
 │       │              └── EVIDENCE
 │       ├── ROADMAP_TIMELINE
 │       ├── NEXT_BEST_ACTIONS
 │       └── ROADMAP_CHANGE_EVENTS
 │
 ├── PROFICIENCY_ASSESSMENTS
 │
 └── ASSISTANT_CONVERSATIONS
         │
         ├── ASSISTANT_MESSAGES
         └── ASSISTANT_PROPOSALS
```

------------------------------------------------------------------------

# 5. Naming Conventions

Use:

-   `snake_case` for database identifiers
-   UUID primary keys
-   `timestamptz` for timestamps
-   UTC timestamps
-   explicit foreign keys
-   explicit unique constraints
-   explicit check constraints

Application code may use camelCase if ORM mapping supports it.

------------------------------------------------------------------------

# 6. USERS

## 6.1 `users`

Basic application identity.

  Column       Type            Required Notes
  ------------ ------------- ---------- ---------------
  id           UUID                 YES Primary key
  email        TEXT                 YES Unique
  name         TEXT                  NO Display name
  avatar_url   TEXT                  NO Optional
  created_at   TIMESTAMPTZ          YES Default now
  updated_at   TIMESTAMPTZ          YES 
  deleted_at   TIMESTAMPTZ           NO Soft deletion

Constraints:

``` text
PRIMARY KEY(id)
UNIQUE(email)
```

Do not duplicate external authentication-provider secrets or
credentials.

------------------------------------------------------------------------

# 7. CAREER PROFILE

## 7.1 `career_profiles`

Stores the user's current career target and constraints.

  Column                  Type            Required Notes
  ----------------------- ------------- ---------- ----------------------
  id                      UUID                 YES Primary key
  user_id                 UUID                 YES FK users
  target_role             TEXT                 YES Exact target role
  target_specialization   TEXT                  NO Optional
  target_company_type     TEXT                  NO Optional
  location_preference     TEXT                  NO Optional
  weekly_hours            INTEGER              YES Available hours/week
  deadline                DATE                  NO Optional
  experience_summary      TEXT                  NO Optional
  created_at              TIMESTAMPTZ          YES 
  updated_at              TIMESTAMPTZ          YES 
  deleted_at              TIMESTAMPTZ           NO Soft deletion

MVP:

``` text
UNIQUE(user_id)
```

A user has one active career profile in the MVP.

------------------------------------------------------------------------

# 8. SKILL CATALOG

## 8.1 `skills`

Canonical skill definitions.

  Column        Type            Required
  ------------- ------------- ----------
  id            UUID                 YES
  name          TEXT                 YES
  slug          TEXT                 YES
  category      TEXT                  NO
  description   TEXT                  NO
  created_at    TIMESTAMPTZ          YES
  updated_at    TIMESTAMPTZ          YES

Examples:

``` text
JavaScript
React
Node.js
Git
REST APIs
SQL
System Design
```

Constraints:

``` text
UNIQUE(slug)
```

A skill is a reusable concept, not a user's current proficiency.

------------------------------------------------------------------------

# 9. USER SKILL STATE

## 9.1 `user_skills`

Current authoritative proficiency for each user's skill.

  Column             Type            Required
  ------------------ ------------- ----------
  id                 UUID                 YES
  user_id            UUID                 YES
  skill_id           UUID                 YES
  proficiency        SMALLINT             YES
  status             TEXT                 YES
  source             TEXT                 YES
  last_assessed_at   TIMESTAMPTZ          YES
  created_at         TIMESTAMPTZ          YES
  updated_at         TIMESTAMPTZ          YES

Proficiency:

``` text
0 UNKNOWN
1 BEGINNER
2 FAMILIAR
3 PROFICIENT
4 ADVANCED
5 EXPERT
```

Status:

``` text
UNKNOWN
ACTIVE
ALREADY_KNOWN
```

Constraints:

``` text
UNIQUE(user_id, skill_id)
CHECK(proficiency BETWEEN 0 AND 5)
```

Important:

`ALREADY_KNOWN` means learning effort can be skipped. It does not mean
automatic expert/master status.

------------------------------------------------------------------------

# 10. SKILL STATE HISTORY

## 10.1 `skill_state_history`

Immutable history of meaningful skill-state changes.

  Column                 Type            Required
  ---------------------- ------------- ----------
  id                     UUID                 YES
  user_id                UUID                 YES
  skill_id               UUID                 YES
  previous_proficiency   SMALLINT             YES
  new_proficiency        SMALLINT             YES
  previous_status        TEXT                 YES
  new_status             TEXT                 YES
  reason                 TEXT                 YES
  source_id              UUID                  NO
  created_at             TIMESTAMPTZ          YES

Reasons:

``` text
USER_UPDATE
QUEST_EVIDENCE
MANUAL_REASSESSMENT
ASSISTANT_PROPOSAL_CONFIRMED
```

History should not be edited after creation.

------------------------------------------------------------------------

# 11. ROADMAPS

## 11.1 `roadmaps`

A generated roadmap version.

  Column                  Type            Required
  ----------------------- ------------- ----------
  id                      UUID                 YES
  user_id                 UUID                 YES
  career_profile_id       UUID                 YES
  version                 INTEGER              YES
  status                  TEXT                 YES
  target_role_snapshot    TEXT                 YES
  weekly_hours_snapshot   INTEGER              YES
  estimated_min_weeks     INTEGER               NO
  estimated_max_weeks     INTEGER               NO
  active_revision         INTEGER              YES
  created_at              TIMESTAMPTZ          YES
  updated_at              TIMESTAMPTZ          YES
  activated_at            TIMESTAMPTZ           NO
  superseded_at           TIMESTAMPTZ           NO

Statuses:

``` text
GENERATING
VALIDATED
ACTIVE
SUPERSEDED
FAILED
```

Constraints:

``` text
UNIQUE(user_id, version)
CHECK(active_revision >= 1)
CHECK(weekly_hours_snapshot >= 0)
```

------------------------------------------------------------------------

# 12. ROADMAP VERSIONING

Never overwrite a previous valid roadmap without preserving its version.

Example:

``` text
v1 → SUPERSEDED
v2 → ACTIVE
v3 → GENERATING
```

If v3 fails:

``` text
v2 remains ACTIVE
```

Only a validated roadmap may become active.

------------------------------------------------------------------------

# 13. ROADMAP GENERATION METADATA

## 13.1 `roadmap_generations`

Tracks each AI generation attempt.

  Column                  Type            Required
  ----------------------- ------------- ----------
  id                      UUID                 YES
  roadmap_id              UUID                  NO
  user_id                 UUID                 YES
  request_id              UUID                 YES
  idempotency_key         TEXT                 YES
  model_provider          TEXT                  NO
  model_name              TEXT                  NO
  prompt_version          TEXT                  NO
  output_schema_version   TEXT                 YES
  status                  TEXT                 YES
  validation_status       TEXT                 YES
  error_code              TEXT                  NO
  started_at              TIMESTAMPTZ          YES
  completed_at            TIMESTAMPTZ           NO
  created_at              TIMESTAMPTZ          YES

Generation status:

``` text
QUEUED
RUNNING
SUCCEEDED
VALIDATION_FAILED
FAILED
CANCELLED
```

Validation status:

``` text
PENDING
PASSED
FAILED
```

Constraints:

``` text
UNIQUE(idempotency_key)
```

This prevents retrying the same generation request from creating
accidental duplicate roadmap versions.

------------------------------------------------------------------------

# 14. ROADMAP PHASES

## 14.1 `roadmap_phases`

Groups roadmap nodes.

  Column                Type            Required
  --------------------- ------------- ----------
  id                    UUID                 YES
  roadmap_id            UUID                 YES
  name                  TEXT                 YES
  description           TEXT                  NO
  sequence              INTEGER              YES
  estimated_min_weeks   INTEGER               NO
  estimated_max_weeks   INTEGER               NO
  created_at            TIMESTAMPTZ          YES

Examples:

``` text
Foundations
Core Development
Frontend
Backend
Specialization
Portfolio
Interview Readiness
```

Constraint:

``` text
UNIQUE(roadmap_id, sequence)
CHECK(sequence > 0)
```

------------------------------------------------------------------------

# 15. ROADMAP NODES

## 15.1 `roadmap_nodes`

A skill, project, milestone, or target within a specific roadmap.

  Column                 Type            Required
  ---------------------- ------------- ----------
  id                     UUID                 YES
  roadmap_id             UUID                 YES
  phase_id               UUID                 YES
  skill_id               UUID                  NO
  title                  TEXT                 YES
  description            TEXT                  NO
  node_type              TEXT                 YES
  required_proficiency   SMALLINT              NO
  estimated_hours        INTEGER               NO
  importance             SMALLINT              NO
  sequence               INTEGER               NO
  status                 TEXT                 YES
  why_it_matters         TEXT                  NO
  unlock_summary         TEXT                  NO
  revision               INTEGER              YES
  created_at             TIMESTAMPTZ          YES
  updated_at             TIMESTAMPTZ          YES
  deleted_at             TIMESTAMPTZ           NO

Node types:

``` text
SKILL
PROJECT
MILESTONE
INTERVIEW
TARGET
```

Statuses:

``` text
LOCKED
AVAILABLE
IN_PROGRESS
COMPLETED
MASTERED
ALREADY_KNOWN
```

Constraints:

``` text
CHECK(required_proficiency IS NULL OR required_proficiency BETWEEN 0 AND 5)
CHECK(estimated_hours IS NULL OR estimated_hours >= 0)
CHECK(importance IS NULL OR importance BETWEEN 1 AND 5)
CHECK(revision >= 1)
```

------------------------------------------------------------------------

# 16. NODE SKILL STATE SNAPSHOT

## 16.1 `roadmap_node_skill_snapshots`

Captures the user's relevant skill state for a specific roadmap/node
revision.

  Column                 Type            Required
  ---------------------- ------------- ----------
  id                     UUID                 YES
  roadmap_node_id        UUID                 YES
  skill_id               UUID                 YES
  user_proficiency       SMALLINT             YES
  required_proficiency   SMALLINT             YES
  proficiency_gap        SMALLINT             YES
  user_status            TEXT                 YES
  calculated_at          TIMESTAMPTZ          YES
  revision               INTEGER              YES

Example:

``` text
JavaScript

USER: Familiar (2)
REQUIRED: Proficient (3)
GAP: 1
```

This snapshot is not the source of truth for current user skill.

The source of truth remains:

``` text
user_skills
```

The snapshot exists for:

-   roadmap version reproducibility
-   debugging
-   historical explanation
-   comparing roadmap revisions

------------------------------------------------------------------------

# 17. NODE DEPENDENCIES

## 17.1 `roadmap_node_dependencies`

Directed dependency relationship.

  Column                 Type            Required
  ---------------------- ------------- ----------
  id                     UUID                 YES
  roadmap_id             UUID                 YES
  prerequisite_node_id   UUID                 YES
  dependent_node_id      UUID                 YES
  relationship_type      TEXT                 YES
  created_at             TIMESTAMPTZ          YES

Relationship types:

``` text
PREREQUISITE
RECOMMENDED
```

Constraints:

``` text
UNIQUE(prerequisite_node_id, dependent_node_id)
CHECK(prerequisite_node_id <> dependent_node_id)
```

Both nodes must belong to the same roadmap.

The graph engine must reject cycles before roadmap activation.

------------------------------------------------------------------------

# 18. ROADMAP TIMELINE

## 18.1 `roadmap_timelines`

Current calculated timeline snapshot.

  Column                Type            Required
  --------------------- ------------- ----------
  id                    UUID                 YES
  roadmap_id            UUID                 YES
  revision              INTEGER              YES
  estimated_min_weeks   INTEGER              YES
  estimated_max_weeks   INTEGER              YES
  calculated_at         TIMESTAMPTZ          YES

Constraints:

``` text
UNIQUE(roadmap_id, revision)
CHECK(estimated_min_weeks >= 0)
CHECK(estimated_max_weeks >= estimated_min_weeks)
```

Timeline is approximate.

------------------------------------------------------------------------

# 19. PHASE TIMELINE

## 19.1 `roadmap_phase_timelines`

  Column             Type            Required
  ------------------ ------------- ----------
  id                 UUID                 YES
  roadmap_phase_id   UUID                 YES
  roadmap_revision   INTEGER              YES
  start_week         INTEGER              YES
  end_week           INTEGER              YES
  estimated_hours    INTEGER              YES
  calculated_at      TIMESTAMPTZ          YES

Constraints:

``` text
CHECK(start_week >= 0)
CHECK(end_week >= start_week)
CHECK(estimated_hours >= 0)
```

------------------------------------------------------------------------

# 20. NEXT BEST ACTION

## 20.1 `next_best_actions`

Current recommended action for a roadmap revision.

  Column             Type            Required
  ------------------ ------------- ----------
  id                 UUID                 YES
  roadmap_id         UUID                 YES
  roadmap_node_id    UUID                 YES
  roadmap_revision   INTEGER              YES
  reason             TEXT                 YES
  score              NUMERIC               NO
  status             TEXT                 YES
  calculated_at      TIMESTAMPTZ          YES
  completed_at       TIMESTAMPTZ           NO

Statuses:

``` text
ACTIVE
SUPERSEDED
COMPLETED
```

Constraint:

``` text
UNIQUE(roadmap_id, roadmap_revision)
```

The score is internal ranking data and must not be presented as
mathematical certainty to users.

------------------------------------------------------------------------

# 21. QUESTS

## 21.1 `quests`

Actionable mission attached to a roadmap node.

  Column                Type            Required
  --------------------- ------------- ----------
  id                    UUID                 YES
  roadmap_node_id       UUID                 YES
  user_id               UUID                 YES
  title                 TEXT                 YES
  objective             TEXT                 YES
  estimated_hours       INTEGER              YES
  status                TEXT                 YES
  github_idea           TEXT                  NO
  interview_questions   JSONB                 NO
  completion_notes      TEXT                  NO
  revision              INTEGER              YES
  started_at            TIMESTAMPTZ           NO
  completed_at          TIMESTAMPTZ           NO
  created_at            TIMESTAMPTZ          YES
  updated_at            TIMESTAMPTZ          YES
  deleted_at            TIMESTAMPTZ           NO

Statuses:

``` text
AVAILABLE
IN_PROGRESS
COMPLETED
ABANDONED
```

Constraints:

``` text
CHECK(estimated_hours >= 0)
CHECK(revision >= 1)
```

------------------------------------------------------------------------

# 22. QUEST TASKS

## 22.1 `quest_tasks`

  Column              Type            Required
  ------------------- ------------- ----------
  id                  UUID                 YES
  quest_id            UUID                 YES
  title               TEXT                 YES
  description         TEXT                  NO
  sequence            INTEGER              YES
  estimated_minutes   INTEGER               NO
  completed           BOOLEAN              YES
  completed_at        TIMESTAMPTZ           NO
  created_at          TIMESTAMPTZ          YES

Constraints:

``` text
UNIQUE(quest_id, sequence)
CHECK(sequence > 0)
CHECK(estimated_minutes IS NULL OR estimated_minutes >= 0)
```

------------------------------------------------------------------------

# 23. EVIDENCE

## 23.1 `evidence`

Evidence associated with work.

  Column            Type            Required
  ----------------- ------------- ----------
  id                UUID                 YES
  user_id           UUID                 YES
  quest_id          UUID                  NO
  roadmap_node_id   UUID                 YES
  type              TEXT                 YES
  title             TEXT                 YES
  url               TEXT                  NO
  notes             TEXT                  NO
  created_at        TIMESTAMPTZ          YES
  deleted_at        TIMESTAMPTZ           NO

Evidence types:

``` text
GITHUB_REPOSITORY
DEPLOYED_PROJECT
PROJECT_SUBMISSION
QUIZ_RESULT
INTERVIEW_PRACTICE
MANUAL
```

Evidence increases confidence but does not automatically equal mastery.

------------------------------------------------------------------------

# 24. PROFICIENCY ASSESSMENTS

## 24.1 `proficiency_assessments`

Separates a suggested proficiency from a user-confirmed proficiency.

  Column            Type            Required
  ----------------- ------------- ----------
  id                UUID                 YES
  user_id           UUID                 YES
  skill_id          UUID                 YES
  previous_level    SMALLINT             YES
  suggested_level   SMALLINT             YES
  confirmed_level   SMALLINT             YES
  source            TEXT                 YES
  evidence_id       UUID                  NO
  created_at        TIMESTAMPTZ          YES

Constraints:

``` text
CHECK(previous_level BETWEEN 0 AND 5)
CHECK(suggested_level BETWEEN 0 AND 5)
CHECK(confirmed_level BETWEEN 0 AND 5)
```

------------------------------------------------------------------------

# 25. ROADMAP CHANGE EVENTS

## 25.1 `roadmap_change_events`

Immutable audit/event history.

  Column       Type            Required
  ------------ ------------- ----------
  id           UUID                 YES
  roadmap_id   UUID                 YES
  user_id      UUID                 YES
  revision     INTEGER              YES
  event_type   TEXT                 YES
  source       TEXT                 YES
  summary      TEXT                 YES
  payload      JSONB                 NO
  created_at   TIMESTAMPTZ          YES

Event types:

``` text
ROADMAP_CREATED
ROADMAP_ACTIVATED
SKILL_UPDATED
NODE_UNLOCKED
NODE_LOCKED
QUEST_COMPLETED
TIMELINE_RECALCULATED
NEXT_ACTION_CHANGED
ROADMAP_REROUTED
```

Example:

``` json
{
  "event_type": "ROADMAP_REROUTED",
  "source": "USER_SKILL_UPDATE",
  "summary": "JavaScript proficiency increased to Proficient",
  "payload": {
    "previousLevel": 2,
    "newLevel": 3,
    "nodesUnlocked": 3,
    "timelineChanged": true,
    "nextActionChanged": true
  }
}
```

Events should be append-only.

------------------------------------------------------------------------

# 26. ASSISTANT CONVERSATIONS

## 26.1 `assistant_conversations`

  Column       Type            Required
  ------------ ------------- ----------
  id           UUID                 YES
  user_id      UUID                 YES
  roadmap_id   UUID                 YES
  created_at   TIMESTAMPTZ          YES
  updated_at   TIMESTAMPTZ          YES
  deleted_at   TIMESTAMPTZ           NO

Assistant context is tied to the roadmap.

------------------------------------------------------------------------

# 27. ASSISTANT MESSAGES

## 27.1 `assistant_messages`

  Column            Type            Required
  ----------------- ------------- ----------
  id                UUID                 YES
  conversation_id   UUID                 YES
  role              TEXT                 YES
  content           TEXT                 YES
  created_at        TIMESTAMPTZ          YES

Roles:

``` text
USER
ASSISTANT
SYSTEM
```

------------------------------------------------------------------------

# 28. ASSISTANT PROPOSALS

## 28.1 `assistant_proposals`

AI-proposed changes awaiting user confirmation.

  Column            Type            Required
  ----------------- ------------- ----------
  id                UUID                 YES
  conversation_id   UUID                 YES
  roadmap_id        UUID                 YES
  proposal_type     TEXT                 YES
  payload           JSONB                YES
  explanation       TEXT                 YES
  status            TEXT                 YES
  created_at        TIMESTAMPTZ          YES
  confirmed_at      TIMESTAMPTZ           NO
  expires_at        TIMESTAMPTZ           NO

Proposal types:

``` text
UPDATE_PROFICIENCY
ADD_SKILL
REMOVE_SKILL
REORDER_PATH
CHANGE_CONSTRAINT
REGENERATE_ROADMAP
```

Statuses:

``` text
PENDING
CONFIRMED
REJECTED
EXPIRED
```

Critical rule:

> A proposal never directly mutates authoritative roadmap state.

------------------------------------------------------------------------

# 29. SOFT DELETE STRATEGY

Use `deleted_at` only where user-visible history may matter.

Appropriate:

-   users
-   career profiles
-   roadmap nodes
-   quests
-   evidence
-   assistant conversations

Do not soft-delete immutable history records.

History/event tables should remain append-only.

When querying normal active data:

``` text
WHERE deleted_at IS NULL
```

------------------------------------------------------------------------

# 30. CONCURRENCY AND REVISION SAFETY

The application must prevent stale updates from overwriting newer state.

Use a revision/version mechanism:

``` text
roadmap.active_revision
roadmap_nodes.revision
quests.revision
```

Update pattern:

``` text
READ revision = 5

UPDATE ...
WHERE revision = 5

SET revision = 6
```

If zero rows are updated:

``` text
CONFLICT
```

The client should refresh/reconcile rather than silently overwrite.

This is especially important when:

-   multiple tabs are open
-   assistant proposals are pending
-   rerouting is occurring
-   quest completion happens while roadmap state changes

------------------------------------------------------------------------

# 31. IDEMPOTENCY

Every externally triggered generation/action that can safely be retried
should support an idempotency key.

Examples:

``` text
roadmap generation
quest generation
assistant proposal confirmation
roadmap reroute
```

Example:

``` text
idempotency_key = UUID
```

If the same request is received twice:

``` text
first request → executes
second request → returns existing result
```

This prevents duplicate roadmaps/quests during retries or network
failures.

------------------------------------------------------------------------

# 32. DATA OWNERSHIP

## User owns

-   target role
-   weekly availability
-   current proficiency
-   evidence
-   quest progress
-   confirmed proficiency

## AI generates

-   skill requirements
-   roadmap proposal
-   node explanations
-   quest content
-   assistant recommendations

## Graph engine owns

-   dependency validity
-   node state
-   unlock logic
-   remaining effort
-   timeline
-   Next Best Action
-   rerouting

## Database owns

-   persistence
-   relationships
-   integrity constraints
-   version/history
-   auditability

------------------------------------------------------------------------

# 33. SOURCE OF TRUTH

  -----------------------------------------------------------------------
  Data                                Source of truth
  ----------------------------------- -----------------------------------
  Current proficiency                 `user_skills`

  Proficiency history                 `skill_state_history`

  Canonical skill                     `skills`

  Roadmap version                     `roadmaps`

  Roadmap structure                   `roadmap_nodes` + dependencies

  Current graph state                 Graph Engine

  Timeline                            Graph Engine + persisted snapshot

  Next Best Action                    Graph Engine + persisted snapshot

  Quest progress                      `quests` + `quest_tasks`

  Evidence                            `evidence`

  Confirmed proficiency change        `proficiency_assessments` +
                                      `user_skills`

  Assistant proposal                  `assistant_proposals`

  UI viewport                         Client only
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 34. DERIVED VS PERSISTENT DATA

## Persist

-   user identity
-   career profile
-   current skills
-   roadmap versions
-   validated graph structure
-   quests
-   evidence
-   confirmed assessments
-   generation metadata
-   change history

## Recalculate

-   locked/available
-   dependency unlocks
-   remaining effort
-   progress percentage
-   timeline
-   Next Best Action
-   graph layout
-   viewport state

Avoid storing derived values as authoritative truth.

------------------------------------------------------------------------

# 35. ROADMAP ACTIVATION TRANSACTION

A roadmap can become `ACTIVE` only after:

``` text
AI OUTPUT
 ↓
ZOD VALIDATION
 ↓
SEMANTIC VALIDATION
 ↓
DAG/CYCLE CHECK
 ↓
NORMALIZATION
 ↓
PERSIST ALL ENTITIES
 ↓
VALIDATION SUCCESS
 ↓
ACTIVATE
```

The database transaction should include:

``` text
roadmap
phases
nodes
dependencies
node skill snapshots
timeline
phase timelines
next best action
```

If any required operation fails:

``` text
ROLLBACK
```

Previous active roadmap remains untouched.

------------------------------------------------------------------------

# 36. SKILL UPDATE TRANSACTION

When a user changes:

``` text
JavaScript
FAMILIAR → PROFICIENT
```

Application flow:

``` text
USER REQUEST
     ↓
AUTHORIZATION
     ↓
VALIDATE 0–5
     ↓
UPDATE USER_SKILLS
     ↓
CREATE SKILL_STATE_HISTORY
     ↓
GRAPH ENGINE REROUTE
     ↓
VALIDATE NEW GRAPH STATE
     ↓
PERSIST TIMELINE
     ↓
PERSIST NEXT ACTION
     ↓
CREATE ROADMAP_CHANGE_EVENT
     ↓
COMMIT
```

No partial update should be exposed as final state.

------------------------------------------------------------------------

# 37. QUEST COMPLETION TRANSACTION

``` text
QUEST COMPLETE
     ↓
MARK QUEST COMPLETED
     ↓
RECORD EVIDENCE
     ↓
CREATE/UPDATE PROFICIENCY ASSESSMENT
     ↓
USER CONFIRMS PROFICIENCY
     ↓
UPDATE USER_SKILLS
     ↓
GRAPH ENGINE RECALCULATES
     ↓
PERSIST REROUTE
     ↓
CREATE CHANGE EVENT
```

Quest completion alone does not change proficiency.

------------------------------------------------------------------------

# 38. INDEXING STRATEGY

Recommended indexes:

``` text
users(email)

career_profiles(user_id)

user_skills(user_id)
user_skills(skill_id)

skill_state_history(user_id, skill_id, created_at)

roadmaps(user_id, status)
roadmaps(career_profile_id, version)

roadmap_generations(user_id, created_at)
roadmap_generations(idempotency_key)

roadmap_phases(roadmap_id, sequence)

roadmap_nodes(roadmap_id)
roadmap_nodes(phase_id)
roadmap_nodes(skill_id)

roadmap_node_dependencies(roadmap_id)
roadmap_node_dependencies(prerequisite_node_id)
roadmap_node_dependencies(dependent_node_id)

roadmap_timelines(roadmap_id, revision)

next_best_actions(roadmap_id, roadmap_revision)

quests(user_id, status)
quests(roadmap_node_id)

quest_tasks(quest_id, sequence)

evidence(user_id)
evidence(roadmap_node_id)

proficiency_assessments(user_id, skill_id, created_at)

roadmap_change_events(roadmap_id, created_at)

assistant_conversations(user_id, roadmap_id)
assistant_messages(conversation_id, created_at)
assistant_proposals(roadmap_id, status)
```

Do not blindly index every column. Add indexes based on real access
patterns and query plans.

------------------------------------------------------------------------

# 39. FOREIGN KEY / DELETE POLICY

Prefer explicit delete behavior.

General policy:

``` text
users
  ↓
career_profiles
  ↓
roadmaps
```

For dependent career records:

-   use restricted deletes where history must remain
-   use explicit soft deletion for user-visible entities
-   avoid accidental cascading deletion of career history

For child records where physical deletion is safe:

``` text
quest → quest_tasks
conversation → messages
```

Cascading may be acceptable.

The exact ORM migration must reflect the intended ownership hierarchy.

------------------------------------------------------------------------

# 40. SECURITY

Required:

-   authentication
-   server-side authorization
-   user ownership checks
-   parameterized queries / ORM
-   secrets outside database
-   no client-trusted `user_id`
-   user-scoped roadmap queries
-   user-scoped evidence access
-   proposal confirmation authorization

Critical rule:

> Never use a client-provided roadmap ID as proof that the user owns the
> roadmap.

Always verify ownership server-side.

------------------------------------------------------------------------

# 41. PRIVACY

Store only information required for Career Quest.

Avoid unnecessarily storing:

-   raw prompts
-   hidden chain-of-thought
-   unnecessary personal information
-   secrets
-   access tokens

Assistant conversation retention should follow the product's privacy
policy.

Evidence URLs must be treated as user data.

------------------------------------------------------------------------

# 42. JSONB RULES

Allowed:

``` text
assistant_proposals.payload
roadmap_change_events.payload
quests.interview_questions
roadmap_generations metadata
```

Not allowed as the primary source for:

``` text
nodes
dependencies
phases
user skills
quests
timeline relationships
```

Relational data remains authoritative for graph structure.

------------------------------------------------------------------------

# 43. MIGRATION ORDER

``` text
01 users
02 career_profiles
03 skills
04 user_skills
05 skill_state_history

06 roadmaps
07 roadmap_generations
08 roadmap_phases
09 roadmap_nodes
10 roadmap_node_skill_snapshots
11 roadmap_node_dependencies
12 roadmap_timelines
13 roadmap_phase_timelines
14 next_best_actions

15 quests
16 quest_tasks
17 evidence
18 proficiency_assessments

19 roadmap_change_events

20 assistant_conversations
21 assistant_messages
22 assistant_proposals
```

This order respects foreign-key dependencies.

------------------------------------------------------------------------

# 44. SEED DATA

Development seed should contain:

### User

``` text
Demo User
```

### Target

``` text
Full Stack Developer at a product startup
```

### Skills

``` text
JavaScript
Git
React
Node.js
REST APIs
SQL
Authentication
Testing
Deployment
System Design
```

### Example proficiency

``` text
JavaScript — FAMILIAR
Git — PROFICIENT
React — BEGINNER
```

### Example roadmap

At least:

``` text
15–25 nodes
```

with real dependencies.

Seed data exists only for development/demo.

Do not hardcode it into production roadmap generation.

------------------------------------------------------------------------

# 45. TESTING

## Schema tests

-   duplicate user email rejected
-   duplicate skill rejected
-   duplicate user skill rejected
-   proficiency outside 0--5 rejected
-   negative hours rejected
-   invalid FK rejected
-   self dependency rejected
-   duplicate dependency rejected

## Roadmap tests

-   version uniqueness
-   generation idempotency
-   failed generation does not replace active roadmap
-   roadmap activation is atomic
-   old roadmap remains accessible

## Concurrency tests

-   stale revision rejected
-   duplicate request returns existing result
-   simultaneous skill updates do not silently overwrite

## Security tests

-   user A cannot read user B roadmap
-   user A cannot update user B skill
-   user A cannot modify user B quest
-   user A cannot access user B evidence

## History tests

-   skill update creates history
-   reroute creates change event
-   events are append-only

------------------------------------------------------------------------

# 46. MVP SCOPE

## P0

Required:

-   users
-   career profiles
-   skills
-   user skills
-   roadmaps
-   roadmap generations
-   phases
-   nodes
-   dependencies
-   node skill snapshots
-   timeline
-   Next Best Action
-   quests
-   quest tasks
-   evidence
-   roadmap change events

## P1

Useful:

-   skill history
-   proficiency assessments
-   assistant conversations
-   assistant proposals
-   concurrency protection
-   advanced audit metadata

## P2

Do not build during the hackathon unless P0 is stable:

-   Redis
-   vector database
-   job scraper
-   course marketplace
-   organization accounts
-   team collaboration
-   advanced analytics warehouse
-   external LMS integrations
-   multi-agent execution logs

------------------------------------------------------------------------

# 47. DATABASE PERFORMANCE TARGET

For the hackathon roadmap size:

``` text
20–60 nodes
20–100 dependency edges
5–20 phases
```

Expected operations:

-   load active roadmap
-   load node dependencies
-   update skill
-   calculate reroute
-   persist new revision
-   load current quest
-   load progress

The database should comfortably support this scale.

Do not prematurely optimize for thousands of nodes per user.

------------------------------------------------------------------------

# 48. FAILURE RECOVERY

If AI generation fails:

``` text
FAILED GENERATION
       ↓
DO NOT ACTIVATE
       ↓
KEEP PREVIOUS ACTIVE ROADMAP
       ↓
SHOW RETRY
```

If database transaction fails:

``` text
ROLLBACK
       ↓
PREVIOUS STATE REMAINS
```

If rerouting fails:

``` text
DO NOT PARTIALLY APPLY
       ↓
KEEP LAST VALID ROADMAP STATE
       ↓
SHOW RECOVERY MESSAGE
```

This is essential for a reliable live judge demo.

------------------------------------------------------------------------

# 49. DEFINITION OF DONE

Database specification is implementation-ready when:

-   [ ] PostgreSQL schema can be generated from this document
-   [ ] P0 tables are defined
-   [ ] relationships are explicit
-   [ ] foreign keys are defined
-   [ ] unique constraints are defined
-   [ ] check constraints are defined
-   [ ] roadmap versions are preserved
-   [ ] generation attempts are traceable
-   [ ] generation retries are idempotent
-   [ ] revisions prevent stale overwrites
-   [ ] current skill state is separate from history
-   [ ] roadmap-specific skill snapshots exist
-   [ ] graph dependencies are relational
-   [ ] timeline can be versioned
-   [ ] Next Best Action can be versioned
-   [ ] quests and evidence are persistent
-   [ ] assistant proposals require confirmation
-   [ ] user data is isolated
-   [ ] failures preserve last valid state
-   [ ] migrations have a defined order
-   [ ] demo seed data can be created
-   [ ] database supports the 3-minute judge flow

------------------------------------------------------------------------

# 50. Final Data Architecture

``` text
                         ┌──────────────┐
                         │    USERS     │
                         └──────┬───────┘
                                │
                    ┌───────────▼───────────┐
                    │    CAREER PROFILE     │
                    └───────────┬───────────┘
                                │
              ┌─────────────────▼─────────────────┐
              │          CURRENT SKILLS           │
              │           user_skills             │
              └─────────────────┬─────────────────┘
                                │
                         ┌──────▼──────┐
                         │ AI / APP    │
                         │ GENERATION  │
                         └──────┬──────┘
                                │
                    VALIDATE → NORMALIZE
                                │
                         ┌──────▼──────┐
                         │  ROADMAP    │
                         └──────┬──────┘
                                │
           ┌────────────────────┼────────────────────┐
           │                    │                    │
      ┌────▼────┐         ┌─────▼─────┐       ┌────▼─────┐
      │ PHASES  │         │   NODES   │       │ TIMELINE │
      └─────────┘         └─────┬─────┘       └──────────┘
                                │
                     ┌──────────▼──────────┐
                     │    DEPENDENCIES     │
                     └──────────┬──────────┘
                                │
                       ┌────────▼────────┐
                       │  GRAPH ENGINE   │
                       │  REROUTING      │
                       │  NEXT ACTION    │
                       └────────┬────────┘
                                │
             ┌──────────────────┼──────────────────┐
             │                  │                  │
        ┌────▼─────┐      ┌─────▼────┐      ┌─────▼─────┐
        │  QUESTS  │      │ EVIDENCE  │      │  HISTORY  │
        └──────────┘      └───────────┘      └───────────┘
```

------------------------------------------------------------------------

# 51. Final Rules

### Rule 01

**Database stores state; graph engine calculates state.**

### Rule 02

**AI proposes; validation approves; application persists.**

### Rule 03

**Current user skill and roadmap-specific skill snapshot are different
concepts.**

### Rule 04

**Never destroy the last valid roadmap during generation failure.**

### Rule 05

**Retries must be idempotent.**

### Rule 06

**Concurrent updates must not silently overwrite newer state.**

### Rule 07

**History is append-only.**

### Rule 08

**Graph structure stays relational; flexible AI payloads may use
JSONB.**

### Rule 09

**Derived values are not authoritative source-of-truth fields.**

### Rule 10

**Do not overengineer the database for the hackathon.**

------------------------------------------------------------------------

# 52. Final Principle

> **The database remembers the user's career state and what happened to
> it. The graph engine decides what that state means next. The AI
> proposes possibilities. The UI makes the resulting path
> understandable.**

This specification is the persistent-data foundation for:

-   `PRD_Career_Quest.md`
-   `TRD_Career_Quest_Updated.md`
-   `APP_FLOW_Career_Quest.md`
-   `UI_UX_Career_Quest_v2.0.md`

and is ready to feed into the API and implementation specifications.
