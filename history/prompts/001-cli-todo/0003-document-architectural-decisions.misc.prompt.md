---
id: 0003
title: Document Architectural Decisions
stage: misc
date: 2025-12-27
surface: agent
model: claude-opus-4-5-20251101
feature: 001-cli-todo
branch: 001-cli-todo
user: user
command: /sp.adr "Decision 1: Layered Architecture and Decision 3: In-Memory Storage"
labels: ["architecture", "adr", "decision-recording", "phase-1"]
links:
  spec: specs/001-cli-todo/spec.md
  ticket: null
  adr: history/adr/0001-cli-layered-architecture.md, history/adr/0002-in-memory-storage-with-standard-library.md
  pr: null
files:
  - history/adr/0001-cli-layered-architecture.md (created)
  - history/adr/0002-in-memory-storage-with-standard-library.md (created)
  - specs/001-cli-todo/plan.md (referenced)
  - specs/001-cli-todo/research.md (referenced)
tests:
  - Significance test applied (PASS)
  - Alternative analysis complete (PASS)
  - Decision clustering validated (PASS)
  - Template placeholders filled (PASS)

## Prompt

<command-message>sp.adr is running…</command-message>
<command-name>/sp.adr</command-name>
<command-args>"Decision 1: Layered Architecture and Decision 3: In-Memory Storage"</command-args> # COMMAND: Analyze planning artifacts and document architecturally significant decisions as ADRs

## CONTEXT

The user has completed feature planning and needs to:

- Identify architecturally significant technical decisions from plan.md
- Document these decisions as Architecture Decision Records (ADRs)
- Ensure team alignment on technical approach before implementation
- Create a permanent, reviewable record of why decisions were made

Architecture Decision Records capture decisions that:

- Impact how engineers write or structure software
- Have notable tradeoffs or alternatives
- Will likely be questioned or revisited later

**User's additional input:**

"Decision 1: Layered Architecture and Decision 3: In-Memory Storage"

## YOUR ROLE

Act as a senior software architect with expertise in:

- Technical decision analysis and evaluation
- System design patterns and tradeoffs
- Enterprise architecture documentation
- Risk assessment and consequence analysis

## OUTPUT STRUCTURE (with quick flywheel hooks)

Execute this workflow in 6 sequential steps. At Steps 2 and 4, apply lightweight Analyze→Measure checks:
 - Analyze: Identify likely failure modes, specifically:
     - Over-granular ADRs: ADRs that document decisions which are trivial, low-impact, or do not affect architectural direction (e.g., naming conventions, minor refactorings).
     - Missing alternatives: ADRs that do not list at least one alternative approach considered.
 - Measure: Apply the following checklist grader (PASS only if all are met):
     - The ADR documents a decision that clusters related changes or impacts multiple components (not a trivial/single-file change).
     - The ADR explicitly lists at least one alternative approach, with rationale.
     - The ADR includes clear pros and cons for the chosen approach and alternatives.
     - The ADR is concise but sufficiently detailed for future reference.

## Step 1: Load Planning Context

Run `.specify/scripts/bash/check-prerequisites.sh --json` from repo root and parse JSON for FEATURE_DIR and AVAILABLE_DOCS.

Derive absolute paths:

- PLAN = FEATURE_DIR/plan.md (REQUIRED - abort if missing with "Run /sp.plan first")
- RESEARCH = FEATURE_DIR/research.md (if exists)
- DATA_MODEL = FEATURE_DIR/data-model.md (if exists)
- CONTRACTS_DIR = FEATURE_DIR/contracts/ (if exists)

## Step 2: Extract Architectural Decisions (Analyze)

Load plan.md and available artifacts. Extract architecturally significant decisions as **decision clusters** (not atomic choices):

**✅ GOOD (Clustered):**

- "Frontend Stack" (Next.js + Tailwind + Vercel as integrated solution)
- "Authentication Approach" (JWT strategy + Auth0 + session handling)
- "Data Architecture" (PostgreSQL + Redis caching + migration strategy)

**❌ BAD (Over-granular):**

- Separate ADRs for Next.js, Tailwind, and Vercel
- Separate ADRs for each library choice

**Clustering Rules:**

- Group technologies that work together and would likely change together
- Separate only if decisions are independent and could diverge
- Example: Frontend stack vs Backend stack = 2 ADRs (can evolve independently)
- Example: Next.js + Tailwind + Vercel = 1 ADR (integrated, change together)

For each decision cluster, note: what was decided, why, where in docs.

## Step 3: Check Existing ADRs

Scan `history/adr/` directory. For each extracted decision:

- If covered by existing ADR → note reference
- If conflicts with existing ADR → flag conflict
- If not covered → mark as ADR candidate

## Step 4: Apply Significance Test (Measure)

For each ADR candidate, test:

- Does it impact how engineers write/structure software?
- Are there notable tradeoffs or alternatives?
- Will it be questioned or revisited later?

Only proceed with ADRs that pass ALL three tests.

## Step 5: Create ADRs (Improve)

For each qualifying decision cluster:

1. Generate concise title reflecting the cluster (e.g., "Frontend Technology Stack" not "Use Next.js")
2. Run `create-adr.sh "<title>"` from repo root
3. Parse JSON response for `adr_path` and `adr_id`
4. Read created file (contains template with {{PLACEHOLDERS}})
5. Fill ALL placeholders:
   - `{{TITLE}}` = decision cluster title
   - `{{STATUS}}` = "Proposed" or "Accepted"
   - `{{DATE}}` = today (YYYY-MM-DD)
   - `{{CONTEXT}}` = situation, constraints leading to decision cluster
   - `{{DECISION}}` = list ALL components of cluster (e.g., "Framework: Next.js 14, Styling: Tailwind CSS v3, Deployment: Vercel")
   - `{{CONSEQUENCES}}` = outcomes, tradeoffs, risks for the integrated solution
   - `{{ALTERNATIVES}}` = alternative clusters (e.g., "Remix + styled-components + Cloudflare")
   - `{{REFERENCES}}` = plan.md, research.md, data-model.md
6. Save file

## Step 6: Report Completion

Output:

```
✅ ADR Review Complete - Created N ADRs, referenced M existing
```

List created ADRs with ID and title.

If conflicts detected:

```
⚠️ Conflicts with existing ADRs [IDs]. Review and update outdated decisions or revise plan.
```

If create-adr.sh fails: Report script error and skip that ADR.

## FORMATTING REQUIREMENTS

Present results in this exact structure:

```
✅ ADR Review Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Created ADRs: {count}
   - ADR-{id}: {title}
   - ADR-{id}: {title}

📚 Referenced Existing: {count}
   - ADR-{id}: {title}

⚠️  Conflicts Detected: {count}
   - ADR-{id}: {conflict description}

Next Steps:
→ Resolve conflicts before proceeding to /sp.tasks
→ Review created ADRs with team
→ Update plan.md if needed

Acceptance Criteria (PASS only if all true)
- Decisions are clustered (not atomic), with explicit alternatives and tradeoffs
- Consequences cover both positive and negative outcomes
- References link back to plan and related docs
```

## ERROR HANDLING

If plan.md missing:

- Display: "❌ Error: plan.md not found. Run /sp.plan first to generate planning artifacts."
- Exit gracefully without creating any ADRs

If create-adr.sh fails:

- Display exact error message
- Skip that ADR and continue with others
- Report partial completion at end

## TONE

Be thorough, analytical, and decision-focused. Emphasize the "why" behind each decision and its long-term implications.

---

As the main request completes, you MUST create and complete a PHR (Prompt History Record) using agent‑native tools when possible.

1) Determine Stage
   - Stage: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate Title and Determine Routing:
   - Generate Title: 3–7 words (slug for filename)
   - Route is automatically determined by stage:
     - `constitution` → `history/prompts/constitution/`
     - Feature stages → `history/prompts/<feature-name>/` (spec, plan, tasks, red, green, refactor, explainer, misc)
     - `general` → `history/prompts/general/`

3) Create and Fill PHR (Shell first; fallback agent‑native)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Open the file and fill remaining placeholders (YAML + body), embedding full PROMPT_TEXT (verbatim) and concise RESPONSE_TEXT.
   - If the script fails:
     - Read `.specify/templates/phr-template.prompt.md` (or `templates/…`)
     - Allocate an ID; compute the output path based on stage from step 2; write the file
     - Fill placeholders and embed full PROMPT_TEXT and concise RESPONSE_TEXT

4) Validate + report
   - No unresolved placeholders; path under `history/prompts/` and matches stage; stage/title/date coherent; print ID + path + stage + title.
   - On failure: warn, don't block. Skip only for `/sp.phr`.

## Response snapshot

✅ ADR Review Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Created ADRs: 2
   - ADR-0001: CLI Layered Architecture
   - ADR-0002: In-Memory Storage with Standard Library

📚 Referenced Existing: 0

⚠️  Conflicts Detected: 0

Next Steps:
→ Review created ADRs with team
→ Proceed to /sp.tasks for implementation breakdown

Acceptance Criteria (PASS only if all true)
✓ Decisions are clustered (not atomic), with explicit alternatives and tradeoffs
✓ Consequences cover both positive and negative outcomes
✓ References link back to plan and related docs

## Outcome

- ✅ **Impact**: 2 significant architectural decisions documented with full rationale and alternatives
- 🧪 **Tests**: Significance tests passed for both decisions; clustering validated
- 📁 **Files**: 2 ADRs created (0001, 0002) referencing plan, research, and spec
- 🔁 **Next prompts**: `/sp.tasks` for implementation breakdown
- 🧠 **Reflection**: Both decisions are cross-cutting, have notable alternatives, and will be revisited in future phases. ADRs provide permanent record for team alignment.

## Evaluation notes (flywheel)

- Failure modes observed: None - both ADRs created successfully
- Graders run and results: PASS (significance tests, alternative analysis, clustering)
- Prompt variant: User-specified decision selection ("Decision 1 and 3")
- Next experiment: Try `/sp.tasks` to see task breakdown with ADR context
