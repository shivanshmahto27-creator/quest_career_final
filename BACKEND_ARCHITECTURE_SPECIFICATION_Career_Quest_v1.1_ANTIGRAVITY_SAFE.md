# BACKEND ARCHITECTURE SPECIFICATION — Career Quest
## Version 1.1 — Anti-Code-Blast / MVP Frozen

> **Purpose:** Give Antigravity/GSD enough backend structure to implement Career Quest correctly without creating an over-engineered backend, unnecessary abstractions, or a large number of files.

---

# 1. CORE RULE

Career Quest uses a **modular monolith**, not clean-architecture overkill.

The backend should be:

```text
SIMPLE
+
MODULAR
+
DIRECT
+
EASY TO DEBUG
```

The goal is not to create the most abstract backend.

The goal is:

> **The smallest backend that can reliably support the product requirements.**

---

# 2. NON-NEGOTIABLE ANTI-CODE-BLAST RULE

Antigravity/GSD must NOT create abstractions just because they are theoretically good architecture.

Before creating a new:

```text
file
class
interface
service
repository
utility
folder
abstraction
```

ask:

```text
Does this remove real duplication?
Does this isolate genuinely different responsibility?
Will this make the current MVP easier to maintain?
```

If the answer is no:

```text
DO NOT CREATE IT.
```

---

# 3. ARCHITECTURE STYLE

Use:

```text
Next.js
+
TypeScript
+
Prisma
+
PostgreSQL
+
Zod
+
AI Provider
```

Architecture:

```text
Frontend
   ↓
API Route
   ↓
Feature Module
   ↓
Graph / AI / DB utilities
   ↓
PostgreSQL
```

Do NOT create:

```text
microservices
event buses
CQRS
dependency injection frameworks
repository-per-model
controller classes
generic CRUD frameworks
```

for the MVP.

---

# 4. RECOMMENDED BACKEND STRUCTURE

Keep the structure intentionally small:

```text
src/
├── app/
│   └── api/
│       └── v1/
│           ├── roadmaps/
│           ├── skills/
│           ├── quests/
│           └── assistant/
│
├── modules/
│   ├── roadmap/
│   ├── skill/
│   ├── quest/
│   └── assistant/
│
├── lib/
│   ├── db/
│   ├── ai/
│   ├── graph/
│   ├── auth/
│   └── validation/
│
├── types/
└── constants/
```

This structure is a guideline, not permission to generate dozens of helper files.

---

# 5. FEATURE MODULE RULE

Each module should contain only what it actually needs.

Example:

```text
modules/
└── roadmap/
    ├── service.ts
    ├── schema.ts
    └── types.ts
```

If a module only needs:

```text
service.ts
schema.ts
```

do not create:

```text
controller.ts
repository.ts
mapper.ts
factory.ts
interface.ts
dto.ts
validator.ts
```

just for architectural appearance.

---

# 6. API ROUTES MUST STAY THIN

A route should look conceptually like:

```text
receive request
↓
validate
↓
authorize
↓
call feature function
↓
return response
```

Example:

```ts
export async function POST(req: Request) {
  const input = roadmapSchema.parse(await req.json());

  const user = await requireUser();

  const result = await createRoadmap({
    userId: user.id,
    input,
  });

  return Response.json(result);
}
```

Do not place large business workflows directly inside route handlers.

---

# 7. NO CONTROLLER LAYER

Do not create:

```text
RoadmapController
SkillController
QuestController
```

Next.js route handlers already provide the HTTP boundary.

Use:

```text
route.ts
→ feature service/function
```

instead.

---

# 8. NO REPOSITORY LAYER BY DEFAULT

Do NOT automatically create:

```text
RoadmapRepository
SkillRepository
QuestRepository
UserRepository
```

Use Prisma directly inside the feature service when the query is simple.

Example:

```ts
const roadmap = await prisma.roadmap.findUnique({
  where: { id: roadmapId },
});
```

Create a repository abstraction ONLY if:

```text
the same database logic is reused multiple times
OR
the query becomes genuinely complex
OR
a real testing/architecture problem appears
```

This is an explicit exception, not the default.

---

# 9. NO SERVICE-PER-FUNCTION

Do not create:

```text
CreateRoadmapService
UpdateRoadmapService
DeleteRoadmapService
GetRoadmapService
```

Instead:

```text
modules/roadmap/service.ts
```

may contain a small set of cohesive functions:

```ts
createRoadmap()
getRoadmap()
regenerateRoadmap()
```

Split only when the file becomes genuinely difficult to understand.

---

# 10. NO GENERIC CRUD ABSTRACTION

Do not build:

```text
BaseService
BaseRepository
CrudService
GenericRepository
GenericController
```

Career Quest has domain-specific behavior.

Generic abstractions will make AI-generated code harder to understand and modify.

---

# 11. DATABASE ACCESS

Use:

```text
Prisma
↓
PostgreSQL
```

Database access should remain close to the feature logic.

Example:

```text
skill/service.ts
      ↓
Prisma
      ↓
PostgreSQL
```

Do not create a large database abstraction layer.

---

# 12. TRANSACTIONS

Use Prisma transactions for authoritative multi-record mutations.

Example:

```text
skill update
 ↓
Graph Engine recalculation
 ↓
revision creation
 ↓
node/progress persistence
 ↓
transaction commit
```

If any critical operation fails:

```text
rollback
```

Keep transactions inside the feature service that owns the workflow.

---

# 13. GRAPH ENGINE BOUNDARY

The Graph Engine remains the authoritative domain logic.

Backend feature services should call it.

Example:

```text
skill/service.ts
      ↓
graph.recalculate()
      ↓
canonical graph state
      ↓
Prisma transaction
```

Do NOT reproduce graph rules inside:

```text
API route
frontend
skill service
roadmap service
AI service
```

---

# 14. GRAPH UTILITY LOCATION

Keep graph logic together:

```text
lib/graph/
```

Example:

```text
lib/graph/
├── engine.ts
├── validation.ts
└── types.ts
```

Only split further if the implementation actually becomes large.

---

# 15. AI BOUNDARY

All AI access goes through:

```text
lib/ai/
```

or the existing AI Orchestration implementation.

Recommended:

```text
lib/ai/
├── orchestrator.ts
├── provider.ts
└── schemas.ts
```

Do not call OpenAI/other providers directly from:

```text
route.ts
frontend
graph engine
Prisma code
```

---

# 16. AI → GRAPH FLOW

For roadmap generation:

```text
API
 ↓
roadmap service
 ↓
AI orchestrator
 ↓
AI candidate
 ↓
schema validation
 ↓
semantic validation
 ↓
Graph Engine validation
 ↓
Prisma transaction
 ↓
canonical roadmap
```

AI never directly writes canonical graph state.

---

# 17. AUTH

Use the project's selected authentication mechanism.

Create one small reusable boundary:

```text
lib/auth/
```

Example:

```ts
const user = await requireUser();
```

Every protected route should use the authenticated identity.

Do not trust:

```text
userId from request body
```

for authorization.

---

# 18. VALIDATION

Use Zod at the API boundary.

Example:

```text
request
 ↓
Zod
 ↓
feature function
 ↓
domain validation
```

Keep schemas close to their feature where possible:

```text
modules/roadmap/schema.ts
modules/skill/schema.ts
modules/quest/schema.ts
```

Do not create one giant:

```text
validators/
```

folder containing hundreds of files.

---

# 19. ERROR HANDLING

Use a small central error utility:

```text
lib/errors.ts
```

or equivalent.

Support only the errors actually required:

```text
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
REVISION_CONFLICT
GRAPH_INVALID
AI_UNAVAILABLE
AI_OUTPUT_INVALID
RATE_LIMITED
INTERNAL_ERROR
```

Do not build an enterprise error framework.

---

# 20. ERROR FLOW

```text
feature function
 ↓
throws typed application error
 ↓
route catches
 ↓
central mapper
 ↓
HTTP response
```

Example:

```json
{
  "success": false,
  "error": {
    "code": "REVISION_CONFLICT",
    "message": "The roadmap has changed. Refresh and try again.",
    "retryable": true
  }
}
```

Never expose:

```text
stack traces
database internals
AI provider secrets
system prompts
```

---

# 21. ROADMAP MODULE

The roadmap module owns:

```text
create roadmap
get roadmap
regenerate roadmap
load roadmap revision
```

Conceptual structure:

```text
modules/roadmap/
├── service.ts
├── schema.ts
└── types.ts
```

It coordinates:

```text
AI
Graph Engine
Prisma
```

but does not duplicate their internal logic.

---

# 22. SKILL MODULE

Own:

```text
skill/proficiency update
mark known
progress-related mutations
```

Conceptual:

```text
modules/skill/
├── service.ts
├── schema.ts
└── types.ts
```

The module calls the Graph Engine after authoritative skill changes.

---

# 23. QUEST MODULE

Own:

```text
get quest
generate quest
complete quest
```

Conceptual:

```text
modules/quest/
├── service.ts
├── schema.ts
└── types.ts
```

Quest generation uses:

```text
AI Orchestrator
```

Quest completion uses:

```text
domain rules / Graph Engine
```

---

# 24. ASSISTANT MODULE

Own:

```text
assistant conversation request
context preparation
proposal handling
```

Conceptual:

```text
modules/assistant/
├── service.ts
├── schema.ts
└── types.ts
```

The assistant can propose changes.

It cannot silently mutate the roadmap.

---

# 25. REQUEST FLOW

All protected mutations follow:

```text
HTTP request
 ↓
auth
 ↓
Zod validation
 ↓
feature function
 ↓
Graph/AI/domain logic
 ↓
Prisma
 ↓
canonical response
```

This flow should remain consistent across modules.

---

# 26. RESPONSE CONTRACT

API responses should follow the API specification.

Example:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "revision": 12
  }
}
```

Do not invent a different response format inside individual modules.

---

# 27. REVISION HANDLING

For roadmap mutations:

```text
client sends expected revision
 ↓
server compares
 ↓
match → continue
mismatch → REVISION_CONFLICT
```

Never silently overwrite a newer roadmap revision.

---

# 28. IDEMPOTENCY

Implement only where required by the API specification.

Important candidates:

```text
quest completion
skill mutation
roadmap generation
roadmap regeneration
```

Do not create a giant idempotency framework.

A small request/idempotency key mechanism is sufficient if required.

---

# 29. RATE LIMITING

Rate-limit expensive endpoints:

```text
POST /roadmaps
POST /roadmaps/:id/regenerate
POST /quests/generate
POST /assistant
```

Do not overbuild rate limiting for every GET endpoint during the MVP.

---

# 30. LOGGING

Use lightweight structured logging.

Minimum useful context:

```text
requestId
route
operation
status
duration
errorCode
generationId when relevant
```

Avoid logging sensitive content.

Do not build a custom logging platform.

---

# 31. ENVIRONMENT VARIABLES

Use:

```text
DATABASE_URL
AUTH_SECRET
AI_PROVIDER_KEY
AI_MODEL
APP_URL
```

Provide:

```text
.env.example
```

Never commit real secrets.

---

# 32. DATABASE MIGRATIONS

Use Prisma migrations.

Development:

```text
schema change
 ↓
migration
 ↓
test
```

Production:

```text
review
 ↓
migration
 ↓
deploy
```

Do not manually edit production tables.

---

# 33. BACKEND TESTING — MVP LEVEL

Test the highest-risk logic.

### Must test

```text
Graph Engine
roadmap generation validation
skill update
revision conflict
quest completion
API authorization
AI failure recovery
```

### E2E critical path

```text
onboarding
→ roadmap generation
→ graph display
→ skill update
→ graph recalculation
→ quest
→ completion
```

Do not attempt 100% test coverage during the hackathon.

---

# 34. PERFORMANCE RULE

Do not optimize architecture before there is a real bottleneck.

For MVP:

```text
correctness
>
simplicity
>
debuggability
>
performance optimization
```

Use a single PostgreSQL database.

Use one Next.js backend deployment.

---

# 35. EXPLICITLY OUT OF SCOPE

Do NOT implement:

```text
microservices
Kafka
RabbitMQ
CQRS
event sourcing
Kubernetes
service mesh
distributed cache
custom dependency injection
generic repository framework
enterprise workflow engine
complex background-job platform
```

unless a real requirement appears.

---

# 36. CODE SIZE CONTROL

Antigravity/GSD must prefer:

```text
one clear file
```

over:

```text
five tiny abstraction files
```

A file should be split when:

```text
it becomes difficult to navigate
OR
responsibilities become genuinely unrelated
OR
a reusable module clearly emerges
```

Do not split merely because a clean-architecture diagram suggests it.

---

# 37. VERTICAL-SLICE IMPLEMENTATION

Build the backend in working slices.

### Slice 1

```text
POST /roadmaps
 ↓
AI
 ↓
Graph validation
 ↓
DB
 ↓
GET /roadmaps
```

### Slice 2

```text
skill update
 ↓
Graph Engine
 ↓
revision
 ↓
DB
```

### Slice 3

```text
quest generation
 ↓
quest completion
 ↓
graph update
```

### Slice 4

```text
assistant
 ↓
proposal
 ↓
user confirmation
 ↓
domain mutation
```

Each slice should work end-to-end before adding unrelated infrastructure.

---

# 38. ANTI-REGRESSION RULE

When adding a feature:

```text
reuse existing module
↓
reuse existing Graph Engine
↓
reuse existing API patterns
↓
reuse existing validation/error handling
```

Do not create a parallel implementation.

---

# 39. BACKEND ARCHITECTURE INVARIANTS

These rules are mandatory:

```text
1. No business logic in frontend.
2. No business logic duplicated in API routes.
3. No AI output directly becomes canonical state.
4. No Graph Engine logic duplicated in services.
5. No direct database access from frontend.
6. No provider API keys in client code.
7. No repository abstraction unless justified.
8. No service-per-function explosion.
9. No generic CRUD framework.
10. No microservices for MVP.
```

---

# 40. DEFINITION OF DONE

Backend is ready when:

- [ ] modular monolith structure exists
- [ ] feature modules are small
- [ ] API routes are thin
- [ ] no unnecessary controller layer exists
- [ ] repository layer is not mandatory
- [ ] Graph Engine is authoritative
- [ ] AI access is centralized
- [ ] Prisma handles persistence
- [ ] transactions protect critical mutations
- [ ] auth/authorization works
- [ ] Zod validates API input
- [ ] revision conflicts are handled
- [ ] critical errors are typed
- [ ] expensive AI endpoints are rate-limited
- [ ] secrets use environment variables
- [ ] critical paths are tested
- [ ] no unnecessary infrastructure exists

---

# 41. FINAL BACKEND SHAPE

```text
src/
│
├── app/api/v1/
│     ├── roadmaps/
│     ├── skills/
│     ├── quests/
│     └── assistant/
│
├── modules/
│     ├── roadmap/
│     ├── skill/
│     ├── quest/
│     └── assistant/
│
├── lib/
│     ├── db/
│     ├── ai/
│     ├── graph/
│     ├── auth/
│     └── validation/
│
├── types/
└── constants/
```

The expected backend should remain understandable to a developer opening the repository for the first time.

---

# 42. FINAL PRINCIPLE

> **Do not build an enterprise backend for a hackathon MVP. Build a small modular monolith that Antigravity can understand, modify and debug without breaking the project.**

The architecture intentionally favors:

```text
fewer files
+
fewer abstractions
+
clear boundaries
+
strong domain logic
+
direct implementation
```

over theoretical architectural purity.

---

# 43. FINAL FREEZE

This document is intentionally scoped to approximately **70–80% of the backend architecture needed for Career Quest MVP**.

It is specifically optimized for:

```text
Antigravity
GSD
AI-assisted implementation
rapid iteration
hackathon development
```

If future complexity genuinely appears, the architecture may evolve from evidence.

Until then:

```text
KEEP IT SIMPLE.
KEEP THE GRAPH ENGINE AUTHORITATIVE.
KEEP AI BEHIND THE ORCHESTRATOR.
KEEP DATABASE ACCESS DIRECT.
DO NOT LET THE CODEBASE BLOAT.
```

**BACKEND ARCHITECTURE v1.1 — FROZEN.**
