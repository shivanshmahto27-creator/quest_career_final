# DEPLOYMENT & HACKATHON RUNBOOK — Career Quest
## Version 1.0 — MVP / Antigravity-Safe / Hackathon-Focused / Frozen

> **Purpose:** Provide the simplest reliable workflow for running, testing, deploying and presenting Career Quest during the hackathon.

---

# 1. CORE DEPLOYMENT PRINCIPLE

Career Quest is a hackathon MVP.

Deployment should optimize for:

```text
RELIABILITY
>
SIMPLICITY
>
SPEED
>
OBSERVABILITY
>
ADVANCED DEVOPS
```

The preferred deployment shape is:

```text
Next.js application
+
PostgreSQL
+
AI provider
```

Avoid infrastructure that does not directly improve the demo.

---

# 2. DEPLOYMENT ARCHITECTURE

Recommended:

```text
                 USER
                   │
                   ▼
             ┌───────────┐
             │ Web App   │
             │ Next.js   │
             └─────┬─────┘
                   │
          ┌────────┴────────┐
          ▼                 ▼
     PostgreSQL          AI Provider
```

A single deployable application is preferred for P0.

---

# 3. NO DEVOPS OVERKILL

Do NOT introduce:

```text
Kubernetes
Docker Swarm
service mesh
microservices
Kafka
RabbitMQ
Terraform
complex CI/CD platform
multi-region deployment
custom load balancers
```

unless the actual hosting platform requires a small subset.

For the hackathon:

```text
one app
one database
one AI provider
```

is enough.

---

# 4. RECOMMENDED HOSTING SHAPE

Use a managed platform compatible with Next.js.

Possible architecture:

```text
Next.js → managed hosting
PostgreSQL → managed database
AI → provider API
```

The exact vendor may be selected by the team.

The deployment document intentionally does not lock the project to one provider.

---

# 5. ENVIRONMENT MODEL

Maintain at minimum:

```text
LOCAL
STAGING / DEMO
PRODUCTION
```

If hackathon time is limited, a separate staging environment is optional.

At minimum:

```text
LOCAL
PRODUCTION
```

must remain conceptually separate.

---

# 6. ENVIRONMENT VARIABLES

Required configuration should be documented in:

```text
.env.example
```

Example:

```text
DATABASE_URL=
AUTH_SECRET=
AI_PROVIDER_KEY=
AI_MODEL=
APP_URL=
```

Optional:

```text
LOG_LEVEL=
AI_TIMEOUT_MS=
```

Never commit real values.

---

# 7. ENVIRONMENT VARIABLE RULES

Mandatory:

```text
secrets → environment variables
```

Never:

```text
hard-code secrets
commit .env
put provider keys in frontend code
put database credentials in source
```

Only variables explicitly marked public may be exposed to browser code.

---

# 8. LOCAL SETUP

Recommended flow:

```text
clone repository
↓
install dependencies
↓
create .env
↓
configure database
↓
run migrations
↓
start development server
```

Conceptually:

```bash
npm install
npm run dev
```

Database commands should follow the Prisma setup defined by the implementation.

---

# 9. DATABASE SETUP

Local development:

```text
PostgreSQL
↓
DATABASE_URL
↓
Prisma migration
↓
application
```

Initial setup should include:

```text
database creation
migration
optional seed data
```

Do not manually create production tables.

---

# 10. MIGRATION RULE

Every schema change must go through a versioned migration.

Flow:

```text
change schema
↓
create migration
↓
test locally
↓
review
↓
deploy migration
```

Do not use destructive schema changes casually during the hackathon.

---

# 11. SEED DATA

Seed data may be used for:

```text
demo accounts
demo roles
demo skill taxonomy
development fixtures
```

Production demo data must be intentionally created.

Do not accidentally expose:

```text
test users
debug records
fake secrets
internal fixtures
```

---

# 12. DEMO DATA STRATEGY

Create one reliable demo scenario.

Recommended:

```text
Target:
Backend Engineer

Current state:
Some skills already known

Expected behavior:
AI creates graph
↓
user marks a skill known
↓
graph reroutes
↓
Next Best Action changes
↓
quest opens
↓
quest completed
```

This scenario demonstrates the product thesis directly.

---

# 13. BUILD PIPELINE

Before deployment:

```text
install
↓
typecheck
↓
lint
↓
tests
↓
production build
↓
deploy
```

At minimum:

```text
npm run build
```

must succeed.

Do not deploy code that only works in development mode.

---

# 14. PRE-DEPLOY CHECKLIST

Before every important deployment:

- [ ] environment variables configured
- [ ] database reachable
- [ ] migrations applied
- [ ] typecheck passes
- [ ] lint passes
- [ ] critical tests pass
- [ ] production build passes
- [ ] AI provider configured
- [ ] auth works
- [ ] core roadmap flow works
- [ ] mobile layout checked

---

# 15. DEPLOYMENT FLOW

Recommended:

```text
Git commit
↓
push
↓
build
↓
migration if required
↓
deploy
↓
health check
↓
open live app
↓
run smoke test
```

Do not deploy directly from uncommitted experimental code.

---

# 16. DATABASE MIGRATION DEPLOYMENT

If a deployment contains database changes:

```text
review migration
↓
backup/safety check where applicable
↓
apply migration
↓
deploy application
↓
smoke test
```

Avoid changing database schema manually through a production console.

---

# 17. HEALTH CHECK

A simple health endpoint is recommended:

```text
GET /api/v1/health
```

Expected:

```json
{
  "status": "ok"
}
```

It should confirm basic application availability.

Do not turn the health endpoint into a complicated monitoring system.

---

# 18. SMOKE TEST

After deployment, test:

```text
1. Open homepage
2. Start onboarding
3. Generate roadmap
4. Graph renders
5. Select node
6. Update skill
7. Graph recalculates
8. Open quest
9. Complete quest
10. Verify Next Best Action
```

If these work, the demo is likely operational.

---

# 19. PRODUCTION SAFETY

Production must not use:

```text
test database
test secrets
mock AI
development-only flags
```

unless a clearly intentional demo fallback is required.

If mock AI is intentionally used for demo reliability, it must be explicit and must not silently pretend to be live AI.

---

# 20. AI DEPLOYMENT SAFETY

AI provider keys belong only on the server.

Architecture:

```text
Browser
  X
  │ no AI secret
  ▼
Backend
  ↓
AI Provider
```

Never expose:

```text
AI_PROVIDER_KEY
```

to the browser.

---

# 21. AI FAILURE IN PRODUCTION

If AI provider fails:

```text
existing roadmap remains safe
↓
user receives retryable error
```

Do not:

```text
erase roadmap
create fake data
activate partial generation
```

The deployment must remain usable even when a new AI generation fails.

---

# 22. AUTH PRODUCTION CHECK

Before demo:

```text
login/session works
protected route works
unauthenticated request rejected
user cannot access another user's roadmap
```

Do not skip this even if the hackathon demo uses one account.

---

# 23. LOGGING

Production logs should capture useful technical information:

```text
requestId
route
status
duration
errorCode
generationId where applicable
```

Never log:

```text
API keys
passwords
auth tokens
database URLs
unnecessary personal data
```

---

# 24. ERROR MONITORING

At minimum, monitor:

```text
5xx errors
AI failures
database failures
build/deployment failures
```

A hosted platform's built-in logs are sufficient for P0.

Do not build a custom observability stack.

---

# 25. ROLLBACK STRATEGY

If a deployment breaks the core application:

```text
identify last known-good deployment
↓
rollback application
↓
verify
```

If a database migration is involved:

```text
stop
↓
assess migration state
↓
do not blindly rollback database
↓
restore/fix using the migration strategy
```

Never run random SQL to “fix” production during a panic.

---

# 26. GIT WORKFLOW

Keep it simple.

Recommended:

```text
main
```

plus short-lived feature branches if the team needs them.

Example:

```text
feature/roadmap
feature/quest
fix/mobile-graph
```

Avoid a complicated GitFlow setup.

---

# 27. COMMIT RULE

Commits should describe meaningful changes.

Good:

```text
feat: add roadmap generation flow
feat: add graph rerouting
fix: handle stale roadmap revision
fix: mobile quest layout
```

Avoid:

```text
update
changes
final
final2
final-final
```

---

# 28. HACKATHON REPOSITORY SAFETY

Before final submission:

- [ ] no `.env`
- [ ] no API keys
- [ ] no passwords
- [ ] no private credentials
- [ ] no unnecessary generated files
- [ ] no huge build artifacts
- [ ] README exists
- [ ] project runs from clean clone
- [ ] correct repository history
- [ ] required hackathon files included

---

# 29. HACKATHON TIMELINE

The official hackathon rules should remain the source of truth for:

```text
repository creation time
coding start time
submission deadline
final freeze
```

The project must respect the official restrictions already captured in the project documentation.

Do not assume a convenient local time if the official rules specify a different time.

---

# 30. DEVELOPMENT FREEZE

Before final submission:

```text
FEATURE FREEZE
↓
BUG FIX ONLY
↓
SMOKE TEST
↓
FINAL BUILD
↓
DEPLOY
↓
DEMO CHECK
```

Avoid adding new architecture or major features immediately before judging.

---

# 31. FINAL DEMO BUILD

Create one stable production/demo build.

Do not depend on:

```text
local machine
local database
local development server
developer's API keys
```

The judge should be able to use:

```text
live URL
```

as the primary experience.

---

# 32. DEMO ACCOUNT

If authentication requires an account, provide a clean demo method.

Options:

```text
pre-created demo account
simple sign-up
hackathon-provided credentials
```

Do not put credentials publicly in the GitHub repository.

---

# 33. DEMO DATA RESET

If the demo environment can be reset, define a safe reset process.

Example:

```text
demo reset
↓
restore known demo state
```

This must operate only on demo/test data.

Never reuse a destructive reset command against production user data.

---

# 34. DEMO FAILURE PLAN

If AI generation fails during judging:

```text
Retry once
↓
if still failing:
show existing valid demo roadmap
↓
explain dynamic replanning with the existing state
```

Do not manually edit database state during the demo.

If a controlled demo fallback exists, it must be clearly separated from live AI behavior.

---

# 35. JUDGE SMOKE TEST

Immediately before judging:

```text
[ ] URL opens
[ ] homepage loads
[ ] onboarding works
[ ] roadmap generates
[ ] graph visible
[ ] node click works
[ ] known-skill reroute works
[ ] Next Best Action visible
[ ] quest opens
[ ] quest completion works
[ ] mobile viewport works
[ ] no obvious console/runtime error
```

---

# 36. DEMO NARRATIVE

The product should be demonstrated through the core thesis:

```text
"I want this exact career."
        ↓
Career Quest reverse-engineers it.
        ↓
I see the skill graph.
        ↓
I already know this skill.
        ↓
The graph reroutes.
        ↓
Tell me what I should do next.
        ↓
I get a concrete quest.
        ↓
I complete it.
        ↓
My roadmap updates.
```

Do not spend most of the demo explaining infrastructure.

---

# 37. FINAL SUBMISSION CHECKLIST

### Product

- [ ] core flow works
- [ ] graph is interactive
- [ ] dynamic rerouting works
- [ ] Next Best Action works
- [ ] quest works
- [ ] AI assistant works if included

### Technical

- [ ] production build succeeds
- [ ] database migrations applied
- [ ] environment variables configured
- [ ] no secrets committed
- [ ] critical tests pass
- [ ] health endpoint works
- [ ] live deployment works

### UX

- [ ] mobile checked
- [ ] loading states checked
- [ ] errors checked
- [ ] accessible primary interactions checked

### Submission

- [ ] repository is correct
- [ ] README is present
- [ ] live URL works
- [ ] screenshots/demo assets ready
- [ ] submission form complete
- [ ] official deadline verified

---

# 38. README MINIMUM

README should contain:

```text
Career Quest
↓
What it does
↓
Key features
↓
Tech stack
↓
How to run locally
↓
Environment variables
↓
Database setup
↓
Live demo
↓
Team / hackathon information
```

Keep it short and useful.

---

# 39. LOCAL RECOVERY

If local development breaks:

```text
git status
↓
inspect changed files
↓
run typecheck
↓
run tests
↓
inspect environment
↓
inspect database connection
```

Do not immediately delete the project or regenerate the entire codebase.

For AI-assisted coding:

```text
small fix
→ test
→ continue
```

is preferred.

---

# 40. ANTIGRAVITY/GSD DEPLOYMENT RULE

Antigravity/GSD must NOT:

```text
invent a new hosting architecture
create Docker/Kubernetes infrastructure unnecessarily
replace the database
change providers without reason
create multiple deployment services
add CI/CD complexity without need
```

It should follow this document and the existing architecture specifications.

If deployment requires a provider-specific step, add only that step.

---

# 41. CHANGE CONTROL

After architecture freeze:

```text
new deployment requirement
↓
check existing architecture
↓
make smallest compatible change
↓
test
↓
deploy
```

Do not redesign the system during final hackathon hours.

---

# 42. P0 / P1 / P2 DEPLOYMENT SCOPE

## P0 — Required

```text
local setup
production build
managed hosting
PostgreSQL
environment variables
migrations
health endpoint
smoke test
rollback awareness
live URL
```

## P1

```text
staging environment
automated deployment
error monitoring
advanced logs
```

## P2

```text
full CI/CD
load testing
advanced observability
infrastructure-as-code
automated rollback
multi-region
```

---

# 43. FINAL DEPLOYMENT DEFINITION OF DONE

Deployment is complete when:

- [ ] clean clone can run locally
- [ ] `.env.example` exists
- [ ] no secrets are committed
- [ ] test database is separate
- [ ] production database is configured safely
- [ ] migrations work
- [ ] production build succeeds
- [ ] live URL works
- [ ] health endpoint works
- [ ] AI provider works
- [ ] auth works
- [ ] core E2E/smoke flow works
- [ ] mobile experience works
- [ ] rollback path is understood
- [ ] demo scenario is repeatable
- [ ] README is complete

---

# 44. FINAL HACKATHON COMMAND CENTER

During the final hours, prioritize only:

```text
1. CORE FLOW
2. DATA SAFETY
3. LIVE DEPLOYMENT
4. BUG FIXES
5. DEMO RELIABILITY
6. SUBMISSION
```

Do NOT spend final hours on:

```text
architecture refactoring
new frameworks
new infrastructure
cosmetic rewrites
unnecessary features
```

---

# 45. FINAL PRINCIPLE

> **The best hackathon deployment is the one that the team understands completely and can recover quickly.**

Career Quest should be:

```text
simple to run
simple to deploy
simple to debug
safe to test
safe to demo
easy to recover
```

---

# 46. FINAL FREEZE

This runbook intentionally covers approximately **70–80% of the deployment and hackathon operations needed for Career Quest MVP**.

It intentionally avoids:

```text
enterprise DevOps
complex infrastructure
distributed systems
advanced SRE
multi-region architecture
```

unless the actual hosting environment requires them.

Final deployment architecture:

```text
Next.js
+
PostgreSQL
+
AI Provider
+
Managed Hosting
```

Final operating loop:

```text
CODE
 ↓
TYPECHECK
 ↓
TEST
 ↓
BUILD
 ↓
DEPLOY
 ↓
SMOKE TEST
 ↓
DEMO
```

**DEPLOYMENT & HACKATHON RUNBOOK v1.0 — FROZEN.**
