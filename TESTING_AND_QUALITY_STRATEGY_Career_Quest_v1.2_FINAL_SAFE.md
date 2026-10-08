# TESTING & QUALITY STRATEGY — CAREER QUEST
## v1.2 — FINAL SAFE / ANTIGRAVITY SAFE / FROZEN

> **Purpose:** Verify the highest-risk parts of Career Quest deeply enough for a hackathon MVP while keeping the test system simple, deterministic, isolated, secure, and resistant to code blast.

---

# 1. Testing Principle

Career Quest does **not** need 100% test coverage.

The rule is:

> **Test risky product logic deeply. Test ordinary presentation lightly.**

Highest priority:

1. Graph Engine correctness
2. Roadmap validation
3. Skill-state changes and rerouting
4. Node transitions
5. Revision/conflict handling
6. Authentication and authorization
7. Quest completion/progress
8. AI failure and malformed-output handling
9. Core end-to-end user journey
10. Production/test environment safety

Do not build an enterprise testing platform.

---

# 2. Testing Stack

Use the project's existing approved stack:

- **Vitest** — unit/integration tests
- **React Testing Library** — frontend component behavior
- **Playwright** — critical end-to-end flows
- **Zod** — runtime contract validation
- **MSW** — optional, only where useful for API mocking
- **MockAIProvider** — deterministic AI testing

Do not add additional testing frameworks unless a real requirement requires them.

---

# 3. Test Environment Safety — NON-NEGOTIABLE

Tests must never accidentally modify production data.

Required separation:

```text
LOCAL DEV DB
    ≠
TEST DB
    ≠
PRODUCTION DB
```

Use a dedicated:

```env
TEST_DATABASE_URL=
```

for integration/E2E database operations.

### Production guard

Any destructive test/reset/seed operation must fail closed when the environment is detected as production.

Examples:

- database reset
- destructive seed
- test cleanup
- fixture replacement
- bulk delete
- migration test reset

Never rely on a developer remembering which database is active.

### Safety invariant

> **Ambiguous environment = fail closed.**

---

# 4. AI Test Safety

Real AI providers must **not** be called by default in automated tests.

Default:

```text
Test
 ↓
MockAIProvider
 ↓
Deterministic structured response
```

Real AI calls should only occur in an explicitly configured integration/manual environment.

Tests must cover:

- valid AI response
- malformed response
- missing fields
- invalid enum/state
- duplicate skills
- invalid graph references
- impossible dependency
- timeout
- provider error
- empty response
- schema repair failure
- retry behavior
- existing roadmap preservation after failure

Never put real API keys in fixtures, tests, snapshots, or logs.

---

# 5. P0 — Must Pass Before Demo/Deployment

## 5.1 Graph Engine

Test:

- graph creation
- node IDs
- edge validity
- dependency ordering
- prerequisite enforcement
- node state transitions
- locked → available
- available → in progress
- in progress → completed
- completed → mastered
- already-known handling
- rerouting after skill change
- removal/collapse of satisfied prerequisites
- Next Best Action calculation
- deterministic output for identical input
- invalid/cyclic graph rejection

The Graph Engine remains the authoritative state/decision layer.

---

# 6. Roadmap Validation

Test that generated roadmap proposals:

- contain required fields
- contain valid node types
- contain valid states
- contain valid edges
- reference existing nodes
- do not create impossible dependencies
- satisfy required graph constraints
- pass Zod/schema validation
- pass semantic validation
- cannot bypass Graph Engine rules

AI output is a proposal, not canonical application state.

---

# 7. Skill Update & Rerouting Tests

Critical scenario:

```text
Initial roadmap
      ↓
User marks skill as ALREADY_KNOWN
      ↓
Graph Engine recalculates
      ↓
Satisfied dependency changes
      ↓
Next Best Action changes
      ↓
Timeline/roadmap reflects the new state
```

Test:

- known skill update
- proficiency change
- invalid skill update
- unauthorized update
- duplicate update
- stale revision
- successful reroute
- failed reroute without corrupting old state

---

# 8. Revision / Concurrency Tests

For state-changing requests:

- stale revision is rejected safely
- duplicate mutation does not duplicate records
- idempotent request behaves consistently
- concurrent updates do not silently overwrite newer state
- canonical state remains valid after conflict

Expected behavior:

```text
Client A revision 5
Client B revision 5

A updates → revision 6

B updates using revision 5
        ↓
Conflict / controlled rejection
```

Never silently destroy the newer state.

---

# 9. Authentication & Authorization Tests

Protected APIs must be tested for:

- unauthenticated request → rejected
- authenticated request → allowed when authorized
- user accessing another user's roadmap → rejected
- user accessing another user's quest → rejected
- unauthorized mutation → rejected
- admin-only action → rejected for normal user
- expired/invalid session → rejected
- ownership checks on every protected resource

Do not treat frontend route protection as sufficient authorization.

---

# 10. API & Input Validation Tests

For important endpoints test:

- valid request
- missing required field
- wrong type
- invalid enum
- oversized input
- malformed ID
- invalid state transition
- unauthorized request
- rate-limit behavior where applicable
- safe error response

Expected rule:

> **Every externally supplied value is untrusted until validated.**

---

# 11. Security Regression Tests

The test suite should include lightweight checks for:

### Secrets

- no real API key in source
- no real secret in fixtures
- no secret in snapshots
- no secret in test logs
- no production credentials in `.env.example`

### Access control

- cross-user resource access denied
- protected mutation without auth denied
- ownership bypass attempts denied

### Error safety

- stack traces not returned to users
- database credentials not exposed
- provider keys not exposed
- internal infrastructure details not exposed

### Environment safety

- test commands fail against production
- destructive reset fails against production
- test database is distinct from production database

Do not introduce a new security subsystem just to run these checks.

---

# 12. Database & Transaction Tests

Test critical multi-record mutations:

- roadmap creation
- roadmap activation
- skill update + reroute
- quest progress update
- quest completion
- revision update

Where a transaction is required:

```text
All required records succeed
        OR
No partial canonical state is persisted
```

Also test:

- unique constraints
- invalid foreign references
- duplicate mutation behavior
- migration compatibility where practical

Do not run destructive DB tests against production.

---

# 13. AI Output & Golden Fixtures

Maintain a small set of deterministic fixtures for important scenarios.

Example:

```text
Fixture: Backend Engineer
Current skills:
- HTML/CSS known
- JavaScript beginner
- Git familiar
```

Expected properties:

- valid graph
- valid dependencies
- correct known-skill handling
- actionable Next Best Action
- valid quest generation

Golden fixtures should verify **structure and invariants**, not fragile wording.

Do not make tests depend on exact AI prose.

---

# 14. MockAIProvider

The mock provider should support deterministic cases:

```text
valid roadmap
invalid schema
invalid graph
timeout
provider error
empty response
repairable response
unrepairable response
```

This lets tests cover AI failure without network calls or token cost.

Keep the mock small. Do not build a fake AI platform.

---

# 15. Frontend Component Tests

Prioritize components that affect product correctness:

- onboarding form
- roadmap/graph container
- graph node states
- node details
- Next Best Action
- quest checklist/progress
- skill update controls
- assistant proposal/confirmation UI
- loading states
- error states
- retry states
- success states

Test user behavior rather than implementation details.

Avoid tests that break simply because internal component structure changes.

---

# 16. Graph Interaction Tests

Verify:

- node click
- node selection
- locked-node behavior
- available-node behavior
- completed-node behavior
- node details opening
- keyboard interaction
- focus behavior
- touch/mobile interaction
- graph loading state
- graph empty state
- graph error state
- retry behavior

React Flow rendering state must not become a second source of truth.

---

# 17. Accessibility & Responsive Quality

Minimum checks:

- keyboard navigation
- visible focus states
- meaningful button labels
- form labels/errors
- sufficient semantic structure
- skip-to-content behavior
- mobile navigation
- usable graph controls on small screens
- reduced-motion behavior
- no critical interaction dependent only on hover

Do not build a separate accessibility framework.

---

# 18. UX State Testing

Every important asynchronous operation should have:

```text
IDLE
 ↓
LOADING
 ↓
SUCCESS
```

and:

```text
LOADING
 ↓
ERROR
 ↓
RETRY
```

Test especially:

- roadmap generation
- roadmap regeneration
- skill update
- rerouting
- quest update
- quest completion
- assistant proposal

The UI must clearly communicate whether the operation succeeded, failed, or is still processing.

---

# 19. End-to-End P0 Flow

One reliable Playwright flow should cover the core product:

```text
Open app
 ↓
Onboarding
 ↓
Enter hyper-specific target role
 ↓
Submit
 ↓
Generate roadmap
 ↓
Graph renders
 ↓
Open node
 ↓
Mark skill as already known
 ↓
Roadmap reroutes
 ↓
Next Best Action changes
 ↓
Open actionable quest
 ↓
Update/complete quest
 ↓
Verify persisted state
```

This is the most important judge-facing regression test.

---

# 20. Mobile E2E Smoke Test

Verify the core flow on a mobile-sized viewport:

- onboarding usable
- buttons reachable
- graph can be inspected
- node details usable
- quest usable
- no horizontal overflow that blocks core actions
- loading/error states remain understandable

Do not attempt exhaustive device/browser coverage during the hackathon.

---

# 21. Test Data Safety

Use synthetic data.

Never use:

- real passwords
- real API keys
- production user data
- unnecessary personal information
- real authentication tokens

Fixtures should be minimal and deterministic.

---

# 22. Test Order & Determinism

Tests should be:

- deterministic where practical
- independent of execution order
- safe to run repeatedly
- isolated from external network dependencies by default
- isolated from production
- safe for parallel execution where configured

A test should not pass only because another test ran first.

---

# 23. External Service Isolation

Default automated tests should not depend on:

- live AI provider
- production database
- third-party production APIs
- external analytics
- real email/SMS services

Mock or isolate them.

Manual integration testing may use controlled staging credentials.

---

# 24. Test Artifact Safety

Test output must not accidentally contain:

- API keys
- passwords
- session tokens
- database URLs
- personal user data
- raw sensitive AI prompts/responses

Screenshots, traces, logs, and snapshots should be safe to inspect and share with the team.

---

# 25. Coverage Policy

Do not chase an arbitrary percentage.

Prioritize:

### P0
- Graph Engine
- roadmap validation
- skill update/rerouting
- auth/authorization
- revision conflicts
- quest completion
- AI failure
- core E2E
- production/test safety

### P1
- important components
- assistant flows
- secondary API paths
- mobile behavior

### P2
- cosmetic states
- low-risk edge cases
- non-critical visual details

---

# 26. Quality Gates

Before demo/deployment:

```text
Typecheck       PASS
Lint            PASS
P0 tests        PASS
Build           PASS
Core E2E        PASS
Security checks PASS
Mobile smoke    PASS
Production env  VERIFIED
```

A P0 failure blocks the release until understood.

A cosmetic P2 failure does not justify risky architecture changes during final hours.

---

# 27. Change-Scope Testing

For every code change:

```text
Identify changed area
        ↓
Run targeted tests
        ↓
Run affected integration tests
        ↓
Run P0 regression tests when needed
        ↓
Run build before deployment
```

Do not run a giant expensive test matrix after every tiny change if a focused test is sufficient.

---

# 28. AI-Assisted Development Rule

When Antigravity/GSD generates code:

1. Inspect the diff.
2. Check new dependencies.
3. Check changed database files.
4. Check API/auth boundaries.
5. Check environment variables.
6. Run targeted tests.
7. Run P0 regression tests for affected core logic.
8. Run production build before deployment.

Never approve generated code solely because it compiles.

---

# 29. Anti-Code-Blast Testing Rules

Testing must not create unnecessary architecture.

Do NOT introduce:

- a generic test framework
- a custom dependency injection system
- a separate testing service
- a test orchestration platform
- a fake distributed environment
- unnecessary fixture factories
- hundreds of abstraction layers
- a second state-management system
- duplicate validation logic

Prefer:

```text
Existing module
   +
Small focused test
```

over:

```text
New framework
   +
New abstraction
   +
New helper hierarchy
```

---

# 30. Bug Severity

### P0 — Release blocker

Examples:

- data corruption
- cross-user data access
- production secret exposure
- broken graph state
- invalid roadmap persistence
- broken core E2E
- production database safety failure
- authentication bypass

### P1 — Important

Examples:

- important feature partially broken
- mobile core interaction issue
- unreliable quest state
- AI retry failure

### P2 — Polish

Examples:

- minor animation issue
- small visual inconsistency
- non-critical copy issue

---

# 31. Final Regression Checklist

Before final freeze:

### Core

- [ ] Onboarding works
- [ ] Roadmap generation works
- [ ] Graph renders
- [ ] Node interaction works
- [ ] Known-skill rerouting works
- [ ] Next Best Action works
- [ ] Quest generation works
- [ ] Quest progress persists
- [ ] Quest completion works
- [ ] Assistant confirmation flow works

### Security

- [ ] Auth tested
- [ ] Ownership tested
- [ ] Input validation tested
- [ ] Rate limits verified where required
- [ ] No secrets in repository
- [ ] No secrets in frontend bundle
- [ ] Safe error responses verified
- [ ] Test DB separated from production
- [ ] Destructive test/reset protection verified

### AI

- [ ] MockAIProvider tests pass
- [ ] Malformed output rejected
- [ ] Provider timeout handled
- [ ] Provider failure handled
- [ ] Existing roadmap preserved after AI failure

### UX

- [ ] Loading states
- [ ] Error states
- [ ] Retry states
- [ ] Success states
- [ ] Mobile navigation
- [ ] Keyboard/focus behavior
- [ ] Skip-to-content
- [ ] Reduced motion
- [ ] Mobile smoke test

### Deployment

- [ ] Typecheck passes
- [ ] Lint passes
- [ ] P0 tests pass
- [ ] Build passes
- [ ] Core E2E passes
- [ ] Production environment verified
- [ ] Live smoke test passes

---

# 32. Hackathon Scope Rule

The testing strategy covers approximately the **70–80% highest-value quality surface** needed for Career Quest.

Do not spend hackathon time on:

- exhaustive browser matrices
- 100% coverage
- performance labs without evidence of a problem
- enterprise security tooling
- complex CI/CD
- distributed test infrastructure
- elaborate test data platforms

The goal is a reliable demo and a trustworthy MVP, not an enterprise QA department.

---

# 33. Final Safety Invariants

These are non-negotiable:

1. Tests never target production by default.
2. Test DB and production DB are separate.
3. Real AI is never called by default in automated tests.
4. Destructive operations fail closed in production.
5. Secrets never appear in fixtures, logs, snapshots, or source.
6. Cross-user access is tested and rejected.
7. Authentication and authorization are tested separately.
8. AI output is validated before persistence.
9. Existing valid roadmap state survives AI failure.
10. Tests are deterministic where practical.
11. Tests do not depend on execution order.
12. E2E runs against a dedicated safe environment.
13. Accessibility and mobile core flows are tested.
14. Testing infrastructure must not create unnecessary architecture.
15. A failed test is acceptable; a test that damages real data is not.

---

# 34. Definition of Done

Testing is complete enough for the hackathon when:

- P0 product behavior is covered.
- Core Graph Engine invariants are protected.
- AI failure cannot corrupt canonical state.
- Authentication/authorization boundaries are verified.
- Test and production environments are isolated.
- Security regression checks pass.
- Core E2E flow passes.
- Mobile smoke test passes.
- Production build passes.
- Live smoke test passes.
- No unnecessary testing architecture has been introduced.

---

# 35. FINAL ANTIGRAVITY/GSD RULE

> **Test the product, not the architecture.**

When implementing or extending tests:

- follow this document and the other approved Career Quest documents;
- reuse the existing stack;
- add the smallest test necessary;
- do not refactor unrelated code;
- do not add infrastructure without a real requirement;
- do not weaken production safeguards for test convenience;
- do not create duplicate business logic inside tests;
- do not make exact AI wording a correctness requirement.

**Final principle:**

> **A failed test is acceptable. A test that damages real data is not.**

**STATUS: FROZEN**
