# Career Quest --- API Specification

**Version:** 1.1\
**Status:** FROZEN FOR IMPLEMENTATION\
**Product:** Career Quest --- Reverse-Engineered Career Roadmapper\
**Architecture:** Next.js App Router + TypeScript + PostgreSQL\
**API style:** REST/JSON\
**API version:** `/api/v1`\
**AI layer:** Server-side only\
**Source of truth:** Validated application state + deterministic graph
engine

------------------------------------------------------------------------

# 1. Purpose

This document defines the authoritative API contract between:

``` text
Frontend
   ↕
Versioned API
   ↕
Application Services
   ↕
AI Orchestration / Graph Engine
   ↕
PostgreSQL
```

It specifies:

-   endpoints
-   request schemas
-   response schemas
-   authentication
-   authorization
-   validation
-   errors
-   roadmap generation
-   graph rerouting
-   quests
-   evidence
-   proficiency updates
-   Next Best Action
-   timeline
-   progress
-   AI assistant proposals
-   idempotency
-   revision/concurrency
-   rate limiting
-   observability
-   API versioning
-   deprecation rules

The API exposes **product capabilities**, not internal implementation
details.

------------------------------------------------------------------------

# 2. API Principles

## Rule 01 --- AI never directly controls client state

``` text
LLM
 ↓
Structured Output
 ↓
Validation
 ↓
Graph Engine
 ↓
API Response
 ↓
UI
```

## Rule 02 --- Deterministic logic stays deterministic

The API/application layer must not ask an LLM to calculate:

-   dependency unlocks
-   DAG validity
-   node status
-   proficiency gap
-   timeline arithmetic
-   Next Best Action ranking

These belong to the graph/application engine.

## Rule 03 --- Mutations are explicit

Every state-changing endpoint communicates:

-   what changed
-   why it changed
-   resulting revision
-   affected roadmap state

## Rule 04 --- Retryable mutations are idempotent

Use `Idempotency-Key` for operations where duplicate execution could
create duplicate side effects.

## Rule 05 --- Server owns identity and authorization

Never trust a client-provided `userId` as proof of ownership.

------------------------------------------------------------------------

# 3. API Versioning

Base path:

``` text
/api/v1
```

Examples:

``` text
/api/v1/profile
/api/v1/roadmap
/api/v1/me/skills
```

Breaking API changes require a new major version:

``` text
/v1 → /v2
```

Non-breaking changes may be introduced within the current version.

## Deprecation

A deprecated endpoint must:

1.  remain functional for the announced compatibility period
2.  be documented as deprecated
3.  provide a replacement endpoint
4.  include a sunset date when applicable

Do not silently change the meaning of an existing endpoint.

------------------------------------------------------------------------

# 4. Base URL

Development:

``` text
http://localhost:3000/api/v1
```

Production:

``` text
https://<production-domain>/api/v1
```

The production domain is environment-specific.

------------------------------------------------------------------------

# 5. Authentication

Protected endpoints require an authenticated user session.

Conceptually:

``` http
Authorization: Bearer <token>
```

or the application's secure session mechanism.

The exact authentication provider is implementation-specific.

The server derives:

``` text
authenticatedUserId
```

from the authenticated session.

Never treat this as authoritative:

``` json
{
  "userId": "..."
}
```

when supplied by the browser.

------------------------------------------------------------------------

# 6. Common Headers

Request:

``` http
Content-Type: application/json
```

Retryable mutation:

``` http
Idempotency-Key: <unique-request-key>
```

Revision-protected mutation:

``` http
If-Match: <revision>
```

The implementation may use an equivalent body field such as
`expectedRevision`, but one consistent strategy must be used across the
application.

------------------------------------------------------------------------

# 7. Common Response Envelope

Successful response:

``` json
{
  "data": {},
  "meta": {
    "requestId": "uuid"
  }
}
```

For list responses:

``` json
{
  "data": [],
  "meta": {
    "requestId": "uuid",
    "pagination": {}
  }
}
```

------------------------------------------------------------------------

# 8. Common Error Envelope

Every error follows:

``` json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable explanation.",
    "details": {},
    "requestId": "uuid"
  }
}
```

Never expose:

-   stack traces
-   SQL
-   database credentials
-   API keys
-   provider secrets
-   system prompts
-   hidden chain-of-thought

------------------------------------------------------------------------

# 9. HTTP Status Codes

  Status   Meaning
  -------- ------------------------------------
  200      Successful read/update
  201      Resource created
  202      Async generation accepted
  204      Successful deletion
  400      Invalid request
  401      Unauthenticated
  403      Not authorized
  404      Resource not found
  409      Revision/idempotency conflict
  422      Semantic/domain validation failure
  429      Rate limited
  500      Unexpected server error
  502      AI/provider failure
  503      Temporary service unavailable

------------------------------------------------------------------------

# 10. Endpoint Map

``` text
PROFILE
GET    /api/v1/profile
PATCH  /api/v1/profile

SKILLS
GET    /api/v1/skills
GET    /api/v1/skills/:skillId
GET    /api/v1/me/skills
PATCH  /api/v1/me/skills/:skillId

ROADMAP
POST   /api/v1/roadmap
GET    /api/v1/roadmap
GET    /api/v1/roadmap/:roadmapId
POST   /api/v1/roadmap/:roadmapId/reroute
POST   /api/v1/roadmap/:roadmapId/recalculate

NODES
GET    /api/v1/roadmap/:roadmapId/nodes/:nodeId
PATCH  /api/v1/roadmap/:roadmapId/nodes/:nodeId

QUESTS
POST   /api/v1/roadmap/:roadmapId/nodes/:nodeId/quest
GET    /api/v1/quests
GET    /api/v1/quests/:questId
PATCH  /api/v1/quests/:questId
POST   /api/v1/quests/:questId/complete

TASKS
PATCH  /api/v1/quests/:questId/tasks/:taskId

EVIDENCE
POST   /api/v1/quests/:questId/evidence
GET    /api/v1/quests/:questId/evidence
DELETE /api/v1/evidence/:evidenceId

ASSESSMENTS
POST   /api/v1/skills/:skillId/assess
POST   /api/v1/skills/:skillId/assess/:assessmentId/confirm

PROGRESS
GET    /api/v1/progress
GET    /api/v1/timeline
GET    /api/v1/next-action

ASSISTANT
POST   /api/v1/assistant/conversations
GET    /api/v1/assistant/conversations/:conversationId
POST   /api/v1/assistant/conversations/:conversationId/messages
POST   /api/v1/assistant/proposals/:proposalId/confirm
POST   /api/v1/assistant/proposals/:proposalId/reject
```

------------------------------------------------------------------------

# 11. Endpoint Security Matrix

  Endpoint Group       Auth   Ownership Check         Mutation   Rate Limit
  -------------------- ------ ----------------------- ---------- -----------------
  Profile              YES    User                    Some       Normal
  Skill catalog        YES    N/A                     No         High
  User skills          YES    User                    YES        Normal
  Roadmap generation   YES    User                    YES        Strict
  Roadmap read         YES    Roadmap owner           No         High
  Roadmap reroute      YES    Roadmap owner           YES        Moderate
  Node detail          YES    Roadmap owner           No         High
  Node mutation        YES    Roadmap owner           YES        Moderate
  Quest generation     YES    Roadmap owner           YES        Strict
  Quest read/update    YES    Quest owner             Some       Normal
  Evidence             YES    User + resource owner   YES        Normal
  Assessment           YES    User                    YES        Normal
  Progress             YES    User                    No         High
  Assistant            YES    Conversation owner      Some       Moderate/Strict

Every `:id` resource must be authorized server-side.

------------------------------------------------------------------------

# 12. PROFILE API

## 12.1 GET `/api/v1/profile`

Returns the authenticated user's career profile.

Response:

``` json
{
  "data": {
    "id": "profile_uuid",
    "targetRole": "Full Stack Developer at a product startup",
    "targetSpecialization": null,
    "targetCompanyType": "Product Startup",
    "locationPreference": "India",
    "weeklyHours": 10,
    "deadline": null,
    "experienceSummary": "Basic JavaScript and Git knowledge"
  },
  "meta": {
    "requestId": "uuid"
  }
}
```

------------------------------------------------------------------------

# 13. UPDATE PROFILE

## 13.1 PATCH `/api/v1/profile`

Request:

``` json
{
  "targetRole": "Full Stack Developer at a product startup",
  "targetSpecialization": "Web Applications",
  "targetCompanyType": "Product Startup",
  "locationPreference": "India",
  "weeklyHours": 10,
  "deadline": null,
  "experienceSummary": "Basic JavaScript and Git knowledge"
}
```

Validation:

``` text
targetRole != empty
weeklyHours >= 0
```

Response:

``` json
{
  "data": {
    "profile": {},
    "roadmapImpact": {
      "requiresRegeneration": true
    }
  },
  "meta": {
    "requestId": "uuid"
  }
}
```

Changing target role or major constraints does not silently mutate the
existing roadmap. It may mark the roadmap as requiring regeneration.

------------------------------------------------------------------------

# 14. SKILL CATALOG

## 14.1 GET `/api/v1/skills`

Query:

``` text
/api/v1/skills?q=javascript
```

Response:

``` json
{
  "data": [
    {
      "id": "skill_uuid",
      "name": "JavaScript",
      "slug": "javascript",
      "category": "Programming Language"
    }
  ],
  "meta": {
    "requestId": "uuid"
  }
}
```

------------------------------------------------------------------------

# 15. GET SKILL

## 15.1 GET `/api/v1/skills/:skillId`

Returns canonical skill metadata.

Response:

``` json
{
  "data": {
    "id": "skill_uuid",
    "name": "JavaScript",
    "slug": "javascript",
    "category": "Programming Language",
    "description": "..."
  }
}
```

------------------------------------------------------------------------

# 16. CURRENT USER SKILLS

## 16.1 GET `/api/v1/me/skills`

Response:

``` json
{
  "data": [
    {
      "skillId": "uuid",
      "name": "JavaScript",
      "proficiency": 2,
      "proficiencyLabel": "FAMILIAR",
      "status": "ACTIVE",
      "source": "SELF_REPORTED",
      "lastAssessedAt": "2026-10-08T08:00:00Z"
    }
  ]
}
```

------------------------------------------------------------------------

# 17. UPDATE USER SKILL

## 17.1 PATCH `/api/v1/me/skills/:skillId`

Request:

``` json
{
  "proficiency": 3,
  "status": "ACTIVE",
  "reason": "USER_UPDATE"
}
```

Header:

``` http
If-Match: 4
```

Validation:

``` text
proficiency = 0..5
```

Response:

``` json
{
  "data": {
    "skill": {
      "skillId": "uuid",
      "previousProficiency": 2,
      "newProficiency": 3,
      "status": "ACTIVE"
    },
    "roadmapImpact": {
      "roadmapChanged": true,
      "nodesUnlocked": 3,
      "timelineChanged": true,
      "nextActionChanged": true
    },
    "roadmap": {}
  },
  "meta": {
    "requestId": "uuid",
    "revision": 5
  }
}
```

This endpoint triggers deterministic rerouting when an active roadmap
exists.

------------------------------------------------------------------------

# 18. ROADMAP GENERATION

## 18.1 POST `/api/v1/roadmap`

Request:

``` json
{
  "targetRole": "Full Stack Developer at a product startup",
  "currentSkills": [
    {
      "skillId": "javascript_uuid",
      "proficiency": 2
    },
    {
      "skillId": "git_uuid",
      "proficiency": 3
    },
    {
      "skillId": "react_uuid",
      "proficiency": 1
    }
  ],
  "weeklyHours": 10,
  "targetSpecialization": "Web Applications",
  "targetCompanyType": "Product Startup"
}
```

Required:

``` text
targetRole
currentSkills
weeklyHours
```

Header:

``` http
Idempotency-Key: unique-generation-key
```

------------------------------------------------------------------------

# 19. GENERATION RESPONSE

If generation is asynchronous:

``` http
202 Accepted
```

Response:

``` json
{
  "data": {
    "generationId": "generation_uuid",
    "roadmapId": null,
    "status": "QUEUED"
  },
  "meta": {
    "requestId": "uuid"
  }
}
```

If synchronous generation is used for the hackathon and completes within
the request timeout:

``` http
201 Created
```

with the active roadmap response.

The implementation must choose one primary behavior rather than randomly
switching between sync and async.

------------------------------------------------------------------------

# 20. GENERATION STATUS

If async generation is implemented, add:

## 20.1 GET `/api/v1/roadmap/generations/:generationId`

Response:

``` json
{
  "data": {
    "generationId": "uuid",
    "status": "VALIDATING",
    "validationStatus": "PENDING",
    "roadmapId": null
  }
}
```

Possible status:

``` text
QUEUED
RUNNING
VALIDATING
SUCCEEDED
VALIDATION_FAILED
FAILED
CANCELLED
```

------------------------------------------------------------------------

# 21. ROADMAP GENERATION PIPELINE

``` text
POST /roadmap
      ↓
AUTHORIZATION
      ↓
REQUEST VALIDATION
      ↓
IDEMPOTENCY CHECK
      ↓
CREATE GENERATION RECORD
      ↓
AI ROADMAP GENERATION
      ↓
STRUCTURED OUTPUT
      ↓
ZOD VALIDATION
      ↓
SEMANTIC VALIDATION
      ↓
DAG / CYCLE VALIDATION
      ↓
GRAPH NORMALIZATION
      ↓
INITIAL STATE CALCULATION
      ↓
DATABASE TRANSACTION
      ↓
ACTIVATE ROADMAP
      ↓
RETURN
```

------------------------------------------------------------------------

# 22. GET ACTIVE ROADMAP

## 22.1 GET `/api/v1/roadmap`

Primary roadmap-screen endpoint.

Response:

``` json
{
  "data": {
    "roadmap": {
      "id": "uuid",
      "version": 2,
      "status": "ACTIVE",
      "targetRole": "Full Stack Developer",
      "estimatedTimeline": {
        "minWeeks": 16,
        "maxWeeks": 21
      },
      "revision": 4
    },
    "phases": [],
    "nodes": [],
    "edges": [],
    "timeline": {},
    "nextBestAction": {},
    "progress": {}
  },
  "meta": {
    "requestId": "uuid",
    "revision": 4
  }
}
```

The roadmap screen should not require many sequential requests.

------------------------------------------------------------------------

# 23. GET ROADMAP BY ID

## 23.1 GET `/api/v1/roadmap/:roadmapId`

Returns a specific roadmap version.

Authorization:

``` text
roadmap.user_id == authenticatedUserId
```

Never expose another user's roadmap.

------------------------------------------------------------------------

# 24. NODE DETAIL

## 24.1 GET `/api/v1/roadmap/:roadmapId/nodes/:nodeId`

Response:

``` json
{
  "data": {
    "id": "node_uuid",
    "title": "React",
    "type": "SKILL",
    "status": "AVAILABLE",
    "proficiency": {
      "current": 2,
      "required": 3,
      "gap": 1
    },
    "estimatedHours": 8,
    "whyThisMatters": "Required for frontend application development.",
    "prerequisites": [],
    "unlocks": [],
    "roadmapImpact": {
      "unlocksCount": 3
    },
    "quest": {
      "available": true
    }
  }
}
```

------------------------------------------------------------------------

# 25. NODE MUTATION

## 25.1 PATCH `/api/v1/roadmap/:roadmapId/nodes/:nodeId`

Only supported state transitions are accepted.

Request:

``` json
{
  "status": "IN_PROGRESS"
}
```

Server validates:

-   ownership
-   roadmap revision
-   legal state transition
-   dependency conditions

The client cannot arbitrarily set:

``` text
LOCKED → MASTERED
```

------------------------------------------------------------------------

# 26. REROUTE

## 26.1 POST `/api/v1/roadmap/:roadmapId/reroute`

Used after meaningful state changes.

Request:

``` json
{
  "trigger": "SKILL_UPDATE",
  "skillId": "javascript_uuid"
}
```

Response:

``` json
{
  "data": {
    "revision": 5,
    "changes": {
      "nodesUnlocked": 3,
      "nodesCompleted": 0,
      "timelineChanged": true,
      "nextActionChanged": true
    },
    "timeline": {},
    "nextBestAction": {},
    "nodes": []
  },
  "meta": {
    "requestId": "uuid",
    "revision": 5
  }
}
```

Rerouting is deterministic.

No LLM call is required for ordinary skill-state rerouting.

------------------------------------------------------------------------

# 27. RECALCULATE

## 27.1 POST `/api/v1/roadmap/:roadmapId/recalculate`

Used to recalculate derived roadmap state.

Request:

``` json
{
  "reason": "MANUAL_RECALCULATION"
}
```

Response:

``` json
{
  "data": {
    "revision": 6,
    "timeline": {},
    "nextBestAction": {},
    "changes": {}
  }
}
```

Do not invoke AI unless explicitly performing AI regeneration.

------------------------------------------------------------------------

# 28. TIMELINE

## 28.1 GET `/api/v1/timeline`

Response:

``` json
{
  "data": {
    "minWeeks": 16,
    "maxWeeks": 21,
    "phases": [
      {
        "name": "Foundations",
        "startWeek": 1,
        "endWeek": 2
      }
    ],
    "revision": 5
  }
}
```

Timeline is approximate.

------------------------------------------------------------------------

# 29. NEXT BEST ACTION

## 29.1 GET `/api/v1/next-action`

Response:

``` json
{
  "data": {
    "nodeId": "node_uuid",
    "title": "React",
    "action": "Start React Quest",
    "reason": "JavaScript is now at the required proficiency and React unlocks 3 downstream skills.",
    "estimatedHours": 8
  }
}
```

Do not expose ranking score unless debugging requires it.

------------------------------------------------------------------------

# 30. QUEST GENERATION

## 30.1 POST `/api/v1/roadmap/:roadmapId/nodes/:nodeId/quest`

Header:

``` http
Idempotency-Key: unique-quest-generation-key
```

Request:

``` json
{
  "estimatedHours": 6
}
```

The server derives:

``` text
authenticated user
roadmap
node
current proficiency
target proficiency
```

Response:

``` json
{
  "data": {
    "quest": {
      "id": "quest_uuid",
      "title": "Build a REST API with Node.js",
      "objective": "...",
      "estimatedHours": 6,
      "dailyPlan": [],
      "deliverable": {},
      "interviewQuestions": []
    }
  }
}
```

------------------------------------------------------------------------

# 31. QUESTS

## 31.1 GET `/api/v1/quests`

Optional:

``` text
?status=IN_PROGRESS
```

Response:

``` json
{
  "data": [
    {
      "id": "quest_uuid",
      "title": "Build a REST API",
      "status": "IN_PROGRESS",
      "nodeId": "node_uuid"
    }
  ]
}
```

------------------------------------------------------------------------

# 32. QUEST DETAIL

## 32.1 GET `/api/v1/quests/:questId`

Returns:

-   objective
-   tasks
-   deliverable
-   evidence
-   status
-   associated node
-   completion state

------------------------------------------------------------------------

# 33. UPDATE QUEST

## 33.1 PATCH `/api/v1/quests/:questId`

Supported example:

``` json
{
  "status": "IN_PROGRESS"
}
```

Only legal transitions are accepted.

------------------------------------------------------------------------

# 34. QUEST TASK

## 34.1 PATCH `/api/v1/quests/:questId/tasks/:taskId`

Request:

``` json
{
  "completed": true
}
```

Response:

``` json
{
  "data": {
    "taskId": "task_uuid",
    "completed": true,
    "questProgress": {
      "completedTasks": 3,
      "totalTasks": 5
    }
  }
}
```

------------------------------------------------------------------------

# 35. QUEST COMPLETION

## 35.1 POST `/api/v1/quests/:questId/complete`

Request:

``` json
{
  "completionNotes": "REST API deployed successfully."
}
```

Server:

1.  verifies ownership
2.  verifies required completion conditions
3.  marks quest completed
4.  records evidence if supplied
5.  optionally creates a proficiency suggestion
6.  does not automatically mark mastery
7.  returns roadmap impact

Response:

``` json
{
  "data": {
    "quest": {
      "id": "quest_uuid",
      "status": "COMPLETED"
    },
    "proficiencySuggestion": {
      "current": 2,
      "suggested": 3,
      "requiresConfirmation": true
    }
  }
}
```

------------------------------------------------------------------------

# 36. EVIDENCE

## 36.1 POST `/api/v1/quests/:questId/evidence`

Request:

``` json
{
  "type": "GITHUB_REPOSITORY",
  "title": "REST API Project",
  "url": "https://github.com/example/repo",
  "notes": "CRUD API with authentication"
}
```

Response:

``` json
{
  "data": {
    "id": "evidence_uuid",
    "type": "GITHUB_REPOSITORY",
    "title": "REST API Project"
  }
}
```

------------------------------------------------------------------------

# 37. DELETE EVIDENCE

## 37.1 DELETE `/api/v1/evidence/:evidenceId`

Prefer soft deletion.

Response:

``` text
204 No Content
```

Ownership must be verified.

------------------------------------------------------------------------

# 38. PROFICIENCY ASSESSMENT

## 38.1 POST `/api/v1/skills/:skillId/assess`

Request:

``` json
{
  "suggestedProficiency": 3,
  "evidenceId": "evidence_uuid"
}
```

Response:

``` json
{
  "data": {
    "assessmentId": "assessment_uuid",
    "previousProficiency": 2,
    "suggestedProficiency": 3,
    "requiresConfirmation": true
  }
}
```

------------------------------------------------------------------------

# 39. CONFIRM PROFICIENCY

## 39.1 POST `/api/v1/skills/:skillId/assess/:assessmentId/confirm`

Request:

``` json
{
  "confirmedProficiency": 3
}
```

Flow:

``` text
assessment
 ↓
user_skills
 ↓
skill_state_history
 ↓
graph reroute
 ↓
timeline
 ↓
next action
 ↓
change event
```

Response:

``` json
{
  "data": {
    "skill": {},
    "roadmapImpact": {},
    "timeline": {},
    "nextBestAction": {}
  }
}
```

------------------------------------------------------------------------

# 40. ASSISTANT CONVERSATION

## 40.1 POST `/api/v1/assistant/conversations`

Request:

``` json
{
  "roadmapId": "roadmap_uuid"
}
```

Response:

``` json
{
  "data": {
    "conversationId": "conversation_uuid"
  }
}
```

------------------------------------------------------------------------

# 41. ASSISTANT MESSAGE

## 41.1 POST `/api/v1/assistant/conversations/:conversationId/messages`

Request:

``` json
{
  "message": "Why do I need React next?",
  "context": {
    "selectedNodeId": "node_uuid"
  }
}
```

The server may derive selected-node context from the authenticated
roadmap instead of trusting arbitrary client data.

Assistant context can include:

``` text
active roadmap
current skill state
selected node
dependencies
timeline
next action
```

Response:

``` json
{
  "data": {
    "message": {
      "id": "message_uuid",
      "role": "ASSISTANT",
      "content": "React is next because..."
    },
    "references": {
      "nodeIds": ["node_uuid"],
      "dependencyCount": 3
    },
    "proposal": null
  }
}
```

------------------------------------------------------------------------

# 42. ASSISTANT PROPOSALS

Assistant may propose:

``` json
{
  "proposal": {
    "id": "proposal_uuid",
    "type": "UPDATE_PROFICIENCY",
    "explanation": "Your evidence suggests JavaScript may now be Proficient.",
    "changes": {
      "skillId": "javascript_uuid",
      "suggestedProficiency": 3
    },
    "requiresConfirmation": true
  }
}
```

Never silently apply the proposal.

------------------------------------------------------------------------

# 43. CONFIRM PROPOSAL

## 43.1 POST `/api/v1/assistant/proposals/:proposalId/confirm`

Header:

``` http
Idempotency-Key: proposal-confirmation-key
```

Server:

``` text
verify ownership
 ↓
verify proposal status
 ↓
verify proposal has not expired
 ↓
apply deterministic operation
 ↓
reroute
 ↓
persist change event
```

Response:

``` json
{
  "data": {
    "proposalStatus": "CONFIRMED",
    "roadmapImpact": {},
    "roadmap": {}
  }
}
```

------------------------------------------------------------------------

# 44. REJECT PROPOSAL

## 44.1 POST `/api/v1/assistant/proposals/:proposalId/reject`

Response:

``` json
{
  "data": {
    "proposalStatus": "REJECTED"
  }
}
```

------------------------------------------------------------------------

# 45. PROGRESS

## 45.1 GET `/api/v1/progress`

Response:

``` json
{
  "data": {
    "targetRole": "Full Stack Developer",
    "progressPercent": 38,
    "completedNodes": 12,
    "totalRequiredNodes": 31,
    "currentPhase": "Core Development",
    "remainingWeeks": {
      "min": 10,
      "max": 14
    },
    "currentFocus": "React"
  }
}
```

`progressPercent` is derived.

It is never the authoritative source of truth.

------------------------------------------------------------------------

# 46. RESPONSE SCHEMA VALIDATION

Request validation alone is not sufficient.

All important API responses should be validated against server-side
schemas before being returned.

Pipeline:

``` text
Application result
 ↓
Response schema
 ↓
Strip internal fields
 ↓
Serialize
 ↓
Client
```

This prevents accidental exposure of:

-   internal database fields
-   provider metadata
-   secrets
-   internal scoring
-   private audit information

------------------------------------------------------------------------

# 47. REQUEST VALIDATION

Every request uses a server-side schema.

Recommended:

``` text
Zod
```

Validation layers:

``` text
REQUEST SCHEMA
      ↓
AUTHORIZATION
      ↓
DOMAIN VALIDATION
      ↓
GRAPH VALIDATION
      ↓
DATABASE CONSTRAINTS
```

TypeScript compile-time types are not a substitute for runtime
validation.

------------------------------------------------------------------------

# 48. AUTHORIZATION MODEL

Every protected resource follows:

``` text
authenticate
    ↓
resolve resource
    ↓
verify ownership
    ↓
perform operation
```

Never:

``` text
client says userId = X
↓
trust X
```

For ID-based endpoints, object-level authorization is mandatory.

------------------------------------------------------------------------

# 49. REVISION / CONCURRENCY

Roadmap-changing mutations require a revision.

Example:

``` text
client revision = 5
server revision = 5
```

Update:

``` text
5 → 6
```

If server is already at 6:

``` text
409 CONFLICT
```

Response:

``` json
{
  "error": {
    "code": "REVISION_CONFLICT",
    "message": "The roadmap changed before this update was applied.",
    "details": {
      "clientRevision": 5,
      "serverRevision": 6
    },
    "requestId": "uuid"
  }
}
```

Frontend must refresh/reconcile.

------------------------------------------------------------------------

# 50. IDEMPOTENCY

Use `Idempotency-Key` for retryable side-effect operations:

``` text
roadmap generation
quest generation
proposal confirmation
reroute
```

Same:

``` text
authenticated user
+
endpoint
+
idempotency key
```

must not create duplicate side effects.

If the same request is retried:

``` text
return existing operation/result
```

If the same key is reused with a materially different payload:

``` text
409 IDEMPOTENCY_CONFLICT
```

------------------------------------------------------------------------

# 51. AI FAILURE RECOVERY

If provider fails:

``` http
502 Bad Gateway
```

Response:

``` json
{
  "error": {
    "code": "AI_PROVIDER_UNAVAILABLE",
    "message": "The roadmap could not be generated right now.",
    "details": {
      "retryable": true
    },
    "requestId": "uuid"
  }
}
```

Existing active roadmap remains unchanged.

------------------------------------------------------------------------

# 52. GRAPH VALIDATION FAILURE

If AI output cannot be safely validated:

``` http
422 Unprocessable Entity
```

Response:

``` json
{
  "error": {
    "code": "ROADMAP_VALIDATION_FAILED",
    "message": "The generated roadmap could not be safely validated.",
    "details": {
      "retryable": true
    },
    "requestId": "uuid"
  }
}
```

Previous valid roadmap remains active.

------------------------------------------------------------------------

# 53. LOADING STATE CONTRACT

Frontend can represent:

``` text
IDLE
QUEUED
GENERATING
VALIDATING
ACTIVATING
READY
FAILED
```

Generation copy:

``` text
Analyzing target role...
Building skill requirements...
Resolving dependencies...
Calculating remaining effort...
Validating roadmap...
Preparing your next action...
```

------------------------------------------------------------------------

# 54. ERROR CATALOG

Stable codes:

``` text
AUTH_REQUIRED
FORBIDDEN
RESOURCE_NOT_FOUND

INVALID_REQUEST
VALIDATION_FAILED
INVALID_PROFICIENCY
INVALID_STATE_TRANSITION

ROADMAP_NOT_FOUND
ROADMAP_GENERATION_FAILED
ROADMAP_VALIDATION_FAILED
ROADMAP_ALREADY_ACTIVE

REVISION_CONFLICT
IDEMPOTENCY_CONFLICT

NODE_NOT_FOUND
INVALID_NODE_TRANSITION

QUEST_NOT_FOUND
QUEST_ALREADY_COMPLETED
QUEST_COMPLETION_BLOCKED

EVIDENCE_NOT_FOUND
INVALID_EVIDENCE_URL

ASSESSMENT_NOT_FOUND
ASSESSMENT_ALREADY_CONFIRMED

PROPOSAL_NOT_FOUND
PROPOSAL_EXPIRED
PROPOSAL_ALREADY_RESOLVED

AI_PROVIDER_UNAVAILABLE
AI_RESPONSE_INVALID
AI_RATE_LIMITED

RATE_LIMITED
INTERNAL_ERROR
```

Codes remain stable even if implementation changes.

------------------------------------------------------------------------

# 55. RATE LIMITING

Strictest limits:

``` text
roadmap generation
quest generation
assistant messages
```

Moderate:

``` text
reroute
proposal confirmation
```

Higher:

``` text
roadmap reads
skill catalog
progress reads
```

Exact limits are environment/deployment-specific.

------------------------------------------------------------------------

# 56. CACHING

Safe to cache:

``` text
skill catalog
static skill metadata
```

Do not blindly cache:

``` text
current user skills
active roadmap
timeline after mutation
Next Best Action after mutation
```

Invalidate affected data after state-changing operations.

------------------------------------------------------------------------

# 57. OBSERVABILITY

Every request receives:

``` text
requestId
```

Track:

-   endpoint
-   duration
-   HTTP status
-   error code
-   generation ID where relevant
-   roadmap ID where relevant
-   reroute duration

Do not log:

-   access tokens
-   API keys
-   secrets
-   hidden reasoning
-   unnecessary sensitive user data

Generation metrics:

``` text
generation latency
validation failure rate
provider failure rate
activation success rate
reroute latency
```

------------------------------------------------------------------------

# 58. API CACHING AND CONSISTENCY

After a mutation:

``` text
PATCH skill
 ↓
reroute
 ↓
invalidate roadmap cache
 ↓
invalidate timeline cache
 ↓
invalidate next-action cache
 ↓
return fresh state
```

The mutation response should preferably contain the resulting state
required by the immediate UI, reducing stale follow-up reads.

------------------------------------------------------------------------

# 59. MOBILE

Mobile uses the same API.

No separate mobile backend.

Mobile may request the same:

``` text
roadmap
node detail
next action
timeline
quest
progress
```

and present them differently.

------------------------------------------------------------------------

# 60. JUDGE DEMO API FLOW

Exact critical flow:

``` text
POST /api/v1/roadmap
        ↓
GET /api/v1/roadmap
        ↓
GET /api/v1/roadmap/:id/nodes/:nodeId
        ↓
POST /api/v1/roadmap/:id/nodes/:nodeId/quest
        ↓
PATCH /api/v1/me/skills/:skillId
        ↓
POST /api/v1/roadmap/:id/reroute
        ↓
GET /api/v1/roadmap
        ↓
POST /api/v1/assistant/conversations/:id/messages
```

Visible effect:

``` text
JavaScript Familiar
        ↓
JavaScript Proficient
        ↓
3 nodes unlock
        ↓
Timeline changes
        ↓
Next Best Action changes
        ↓
Assistant explains why
```

This is the core product proof.

------------------------------------------------------------------------

# 61. API TESTING MATRIX

## Authentication

-   unauthenticated request rejected
-   expired session rejected

## Authorization

-   user A cannot read user B roadmap
-   user A cannot mutate user B skill
-   user A cannot complete user B quest
-   user A cannot access user B evidence
-   user A cannot confirm user B proposal

## Validation

-   malformed JSON rejected
-   invalid proficiency rejected
-   invalid state transition rejected
-   invalid node reference rejected

## Idempotency

-   same key + same payload → one side effect
-   same key + different payload → 409

## Concurrency

-   matching revision → success
-   stale revision → 409

## AI

-   malformed AI output rejected
-   cyclic graph rejected
-   invalid node reference rejected
-   provider failure preserves active roadmap

## Rerouting

-   skill update recalculates dependencies
-   unlocked nodes update
-   timeline updates
-   Next Best Action updates
-   change event created

------------------------------------------------------------------------

# 62. IMPLEMENTATION ORDER

``` text
1. Auth middleware
2. API versioning
3. Response/error utilities
4. Profile
5. Skill catalog
6. User skills
7. Roadmap generation
8. Roadmap retrieval
9. Node detail
10. Graph rerouting
11. Next Best Action
12. Timeline
13. Quest generation
14. Quest tasks
15. Quest completion
16. Evidence
17. Proficiency assessment
18. Progress
19. Assistant
20. Proposal confirmation
21. Idempotency/concurrency hardening
22. Rate limiting
23. Observability
24. End-to-end testing
```

------------------------------------------------------------------------

# 63. P0 API SCOPE

Required:

``` text
GET    /api/v1/profile
PATCH  /api/v1/profile

GET    /api/v1/skills
GET    /api/v1/me/skills
PATCH  /api/v1/me/skills/:skillId

POST   /api/v1/roadmap
GET    /api/v1/roadmap
GET    /api/v1/roadmap/:roadmapId

GET    /api/v1/roadmap/:roadmapId/nodes/:nodeId
POST   /api/v1/roadmap/:roadmapId/reroute

POST   /api/v1/roadmap/:roadmapId/nodes/:nodeId/quest
GET    /api/v1/quests/:questId
PATCH  /api/v1/quests/:questId/tasks/:taskId
POST   /api/v1/quests/:questId/complete

POST   /api/v1/quests/:questId/evidence
POST   /api/v1/skills/:skillId/assess
POST   /api/v1/skills/:skillId/assess/:assessmentId/confirm

GET    /api/v1/progress
GET    /api/v1/timeline
GET    /api/v1/next-action

POST   /api/v1/assistant/conversations
POST   /api/v1/assistant/conversations/:conversationId/messages
POST   /api/v1/assistant/proposals/:proposalId/confirm
POST   /api/v1/assistant/proposals/:proposalId/reject
```

------------------------------------------------------------------------

# 64. P1 API SCOPE

After P0:

``` text
generation status/history
manual recalculation
roadmap history
advanced assistant context
audit history endpoint
search/filter improvements
```

------------------------------------------------------------------------

# 65. P2 API SCOPE

Do not build during hackathon unless P0 is stable:

``` text
job scraping
course marketplace
organization APIs
team collaboration
external LMS
advanced analytics
vector search
multi-agent execution APIs
```

------------------------------------------------------------------------

# 66. API DEFINITION OF DONE

The API is implementation-ready when:

-   [ ] `/api/v1` versioning exists
-   [ ] all P0 endpoints exist
-   [ ] request schemas exist
-   [ ] response schemas exist
-   [ ] authentication exists
-   [ ] ownership checks exist
-   [ ] revision protection exists
-   [ ] idempotency exists for retryable mutations
-   [ ] roadmap generation is validated
-   [ ] graph rerouting is deterministic
-   [ ] Quest completion does not equal mastery
-   [ ] proficiency confirmation reroutes roadmap
-   [ ] timeline updates
-   [ ] Next Best Action updates
-   [ ] assistant proposals require confirmation
-   [ ] AI failures preserve active roadmap
-   [ ] stable error codes exist
-   [ ] response data is filtered/validated
-   [ ] rate limits exist for expensive operations
-   [ ] request IDs exist
-   [ ] API authorization matrix is implemented
-   [ ] 3-minute judge flow works end-to-end

------------------------------------------------------------------------

# 67. FINAL API ARCHITECTURE

``` text
                   ┌──────────────────────┐
                   │      FRONTEND        │
                   │ React / Next.js      │
                   └──────────┬───────────┘
                              │
                         REST / JSON
                              │
                   ┌──────────▼───────────┐
                   │      /api/v1         │
                   │ Auth + Validation    │
                   └──────────┬───────────┘
                              │
              ┌───────────────┼────────────────┐
              │               │                │
        ┌─────▼─────┐   ┌─────▼──────┐   ┌────▼─────┐
        │ AI ORCH.  │   │ GRAPH      │   │ QUEST    │
        │           │   │ ENGINE     │   │ ENGINE   │
        └─────┬─────┘   └─────┬──────┘   └────┬─────┘
              │               │               │
              └───────────────┼───────────────┘
                              │
                       ┌──────▼──────┐
                       │ PostgreSQL  │
                       └─────────────┘
```

------------------------------------------------------------------------

# 68. FINAL PRINCIPLES

### Rule 01

**API exposes capabilities, not internal implementation.**

### Rule 02

**AI proposes; validation approves; graph engine decides; database
persists.**

### Rule 03

**Never trust client ownership identifiers.**

### Rule 04

**Every meaningful mutation must be explainable.**

### Rule 05

**Retryable mutations must be idempotent.**

### Rule 06

**Concurrent state changes must be revision-safe.**

### Rule 07

**Quest completion is not automatic mastery.**

### Rule 08

**A failed AI generation never replaces the last valid roadmap.**

### Rule 09

**The main roadmap screen should be renderable with one primary roadmap
request.**

### Rule 10

**Response schemas are as important as request schemas.**

### Rule 11

**Version breaking API changes instead of silently changing contracts.**

### Rule 12

**Keep P0 small enough to finish and reliable enough to demo.**

------------------------------------------------------------------------

# 69. FINAL PRODUCT LOOP

``` text
DREAM ROLE
    ↓
CURRENT STATE
    ↓
GENERATE ROADMAP
    ↓
VALIDATE
    ↓
CAREER GRAPH
    ↓
NEXT BEST ACTION
    ↓
QUEST
    ↓
EVIDENCE
    ↓
PROFICIENCY CONFIRMATION
    ↓
DETERMINISTIC REROUTE
    ↓
TIMELINE UPDATE
    ↓
NEW NEXT BEST ACTION
    ↓
REPEAT
```

> **The API is the contract that turns Career Quest from a visual
> concept into a functioning career intelligence system.**
