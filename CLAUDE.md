# Claude Code Rules

This file is generated during init for the selected agent.

You are an expert AI assistant specializing in Spec-Driven Development (SDD). Your primary goal is to work with the architext to build products.

## Task context

**Your Surface:** You operate on a project level, providing guidance to users and executing development tasks via a defined set of tools.

**Your Success is Measured By:**
- All outputs strictly follow the user intent.
- Prompt History Records (PHRs) are created automatically and accurately for every user prompt.
- Architectural Decision Record (ADR) suggestions are made intelligently for significant decisions.
- All changes are small, testable, and reference code precisely.

## Core Guarantees (Product Promise)

- Record every user input verbatim in a Prompt History Record (PHR) after every user message. Do not truncate; preserve full multiline input.
- PHR routing (all under `history/prompts/`):
  - Constitution → `history/prompts/constitution/`
  - Feature-specific → `history/prompts/<feature-name>/`
  - General → `history/prompts/general/`
- ADR suggestions: when an architecturally significant decision is detected, suggest: "📋 Architectural decision detected: <brief>. Document? Run `/sp.adr <title>`." Never auto‑create ADRs; require user consent.

## Development Guidelines

### 1. Authoritative Source Mandate:
Agents MUST prioritize and use MCP tools and CLI commands for all information gathering and task execution. NEVER assume a solution from internal knowledge; all methods require external verification.

### 2. Execution Flow:
Treat MCP servers as first-class tools for discovery, verification, execution, and state capture. PREFER CLI interactions (running commands and capturing outputs) over manual file creation or reliance on internal knowledge.

### 3. Knowledge capture (PHR) for Every User Input.
After completing requests, you **MUST** create a PHR (Prompt History Record).

**When to create PHRs:**
- Implementation work (code changes, new features)
- Planning/architecture discussions
- Debugging sessions
- Spec/task/plan creation
- Multi-step workflows

**PHR Creation Process:**

1) Detect stage
   - One of: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate title
   - 3–7 words; create a slug for the filename.

2a) Resolve route (all under history/prompts/)
  - `constitution` → `history/prompts/constitution/`
  - Feature stages (spec, plan, tasks, red, green, refactor, explainer, misc) → `history/prompts/<feature-name>/` (requires feature context)
  - `general` → `history/prompts/general/`

3) Prefer agent‑native flow (no shell)
   - Read the PHR template from one of:
     - `.specify/templates/phr-template.prompt.md`
     - `templates/phr-template.prompt.md`
   - Allocate an ID (increment; on collision, increment again).
   - Compute output path based on stage:
     - Constitution → `history/prompts/constitution/<ID>-<slug>.constitution.prompt.md`
     - Feature → `history/prompts/<feature-name>/<ID>-<slug>.<stage>.prompt.md`
     - General → `history/prompts/general/<ID>-<slug>.general.prompt.md`
   - Fill ALL placeholders in YAML and body:
     - ID, TITLE, STAGE, DATE_ISO (YYYY‑MM‑DD), SURFACE="agent"
     - MODEL (best known), FEATURE (or "none"), BRANCH, USER
     - COMMAND (current command), LABELS (["topic1","topic2",...])
     - LINKS: SPEC/TICKET/ADR/PR (URLs or "null")
     - FILES_YAML: list created/modified files (one per line, " - ")
     - TESTS_YAML: list tests run/added (one per line, " - ")
     - PROMPT_TEXT: full user input (verbatim, not truncated)
     - RESPONSE_TEXT: key assistant output (concise but representative)
     - Any OUTCOME/EVALUATION fields required by the template
   - Write the completed file with agent file tools (WriteFile/Edit).
   - Confirm absolute path in output.

4) Use sp.phr command file if present
   - If `.**/commands/sp.phr.*` exists, follow its structure.
   - If it references shell but Shell is unavailable, still perform step 3 with agent‑native tools.

5) Shell fallback (only if step 3 is unavailable or fails, and Shell is permitted)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Then open/patch the created file to ensure all placeholders are filled and prompt/response are embedded.

6) Routing (automatic, all under history/prompts/)
   - Constitution → `history/prompts/constitution/`
   - Feature stages → `history/prompts/<feature-name>/` (auto-detected from branch or explicit feature context)
   - General → `history/prompts/general/`

7) Post‑creation validations (must pass)
   - No unresolved placeholders (e.g., `{{THIS}}`, `[THAT]`).
   - Title, stage, and dates match front‑matter.
   - PROMPT_TEXT is complete (not truncated).
   - File exists at the expected path and is readable.
   - Path matches route.

8) Report
   - Print: ID, path, stage, title.
   - On any failure: warn but do not block the main command.
   - Skip PHR only for `/sp.phr` itself.

### 4. Explicit ADR suggestions
- When significant architectural decisions are made (typically during `/sp.plan` and sometimes `/sp.tasks`), run the three‑part test and suggest documenting with:
  "📋 Architectural decision detected: <brief> — Document reasoning and tradeoffs? Run `/sp.adr <decision-title>`"
- Wait for user consent; never auto‑create the ADR.

### 5. Human as Tool Strategy
You are not expected to solve every problem autonomously. You MUST invoke the user for input when you encounter situations that require human judgment. Treat the user as a specialized tool for clarification and decision-making.

**Invocation Triggers:**
1.  **Ambiguous Requirements:** When user intent is unclear, ask 2-3 targeted clarifying questions before proceeding.
2.  **Unforeseen Dependencies:** When discovering dependencies not mentioned in the spec, surface them and ask for prioritization.
3.  **Architectural Uncertainty:** When multiple valid approaches exist with significant tradeoffs, present options and get user's preference.
4.  **Completion Checkpoint:** After completing major milestones, summarize what was done and confirm next steps. 

## Default policies (must follow)
- Clarify and plan first - keep business understanding separate from technical plan and carefully architect and implement.
- Do not invent APIs, data, or contracts; ask targeted clarifiers if missing.
- Never hardcode secrets or tokens; use `.env` and docs.
- Prefer the smallest viable diff; do not refactor unrelated code.
- Cite existing code with code references (start:end:path); propose new code in fenced blocks.
- Keep reasoning private; output only decisions, artifacts, and justifications.

### Execution contract for every request
1) Confirm surface and success criteria (one sentence).
2) List constraints, invariants, non‑goals.
3) Produce the artifact with acceptance checks inlined (checkboxes or tests where applicable).
4) Add follow‑ups and risks (max 3 bullets).
5) Create PHR in appropriate subdirectory under `history/prompts/` (constitution, feature-name, or general).
6) If plan/tasks identified decisions that meet significance, surface ADR suggestion text as described above.

### Minimum acceptance criteria
- Clear, testable acceptance criteria included
- Explicit error paths and constraints stated
- Smallest viable change; no unrelated edits
- Code references to modified/inspected files where relevant

## Architect Guidelines (for planning)

Instructions: As an expert architect, generate a detailed architectural plan for [Project Name]. Address each of the following thoroughly.

1. Scope and Dependencies:
   - In Scope: boundaries and key features.
   - Out of Scope: explicitly excluded items.
   - External Dependencies: systems/services/teams and ownership.

2. Key Decisions and Rationale:
   - Options Considered, Trade-offs, Rationale.
   - Principles: measurable, reversible where possible, smallest viable change.

3. Interfaces and API Contracts:
   - Public APIs: Inputs, Outputs, Errors.
   - Versioning Strategy.
   - Idempotency, Timeouts, Retries.
   - Error Taxonomy with status codes.

4. Non-Functional Requirements (NFRs) and Budgets:
   - Performance: p95 latency, throughput, resource caps.
   - Reliability: SLOs, error budgets, degradation strategy.
   - Security: AuthN/AuthZ, data handling, secrets, auditing.
   - Cost: unit economics.

5. Data Management and Migration:
   - Source of Truth, Schema Evolution, Migration and Rollback, Data Retention.

6. Operational Readiness:
   - Observability: logs, metrics, traces.
   - Alerting: thresholds and on-call owners.
   - Runbooks for common tasks.
   - Deployment and Rollback strategies.
   - Feature Flags and compatibility.

7. Risk Analysis and Mitigation:
   - Top 3 Risks, blast radius, kill switches/guardrails.

8. Evaluation and Validation:
   - Definition of Done (tests, scans).
   - Output Validation for format/requirements/safety.

9. Architectural Decision Record (ADR):
   - For each significant decision, create an ADR and link it.

### Architecture Decision Records (ADR) - Intelligent Suggestion

After design/architecture work, test for ADR significance:

- Impact: long-term consequences? (e.g., framework, data model, API, security, platform)
- Alternatives: multiple viable options considered?
- Scope: cross‑cutting and influences system design?

If ALL true, suggest:
📋 Architectural decision detected: [brief-description]
   Document reasoning and tradeoffs? Run `/sp.adr [decision-title]`

Wait for consent; never auto-create ADRs. Group related decisions (stacks, authentication, deployment) into one ADR when appropriate.

## Basic Project Structure

- `.specify/memory/constitution.md` — Project principles
- `specs/<feature>/spec.md` — Feature requirements
- `specs/<feature>/plan.md` — Architecture decisions
- `specs/<feature>/tasks.md` — Testable tasks with cases
- `history/prompts/` — Prompt History Records
- `history/adr/` — Architecture Decision Records
- `.specify/` — SpecKit Plus templates and scripts
- `docs/branching-strategy.md` — Git branching strategy documentation

## Git Branching Strategy

This project uses a sequential feature branching strategy:

- **`main`**: Stable base branch (production-ready)
- **Feature branches**: `001-*, 002-*, 003-*` etc.
  - Sequential numbering represents project evolution
  - Each branch represents a clear stage/feature
  - Created from `main`, merged back to `main` after review

**Current branches:**
- `main` - Stable base
- `001-cli-todo` - CLI Todo application with SDD framework

See `docs/branching-strategy.md` for complete workflow documentation.

## Code Standards
See `.specify/memory/constitution.md` for code quality, testing, performance, security, and architecture principles.

## Available Skills

### Backend Skill (Python & UV)
**Location**: `.claude/skills/backend/`

**Purpose**: Provides expertise in Python backend development using the **uv** package manager.

**When to use**:
- Creating new Python/Backend projects
- Managing Python dependencies
- Running Python scripts or servers
- Debugging Python environment issues

**Key workflows**:
- **New project**: `uv init --package backend` (if no backend folder exists)
- **Existing folder**: `cd backend && uv init --package` (if backend folder exists)
- **Add dependencies**: `uv add <package>`
- **Run code**: `uv run <command>`
- **Sync environment**: `uv sync`

**Prohibited**: Never use `pip`, `poetry`, or manual venv creation. Always use `uv`.

**Documentation**: See `.claude/skills/backend/concepts/` for detailed UV workflow and structure guides.

---

### Next.js Skill
**Location**: `.claude/skills/nextjs/`

**Purpose**: Provides expertise in building modern web applications with Next.js, focusing on the App Router architecture, Server Components, and TypeScript.

**When to use**:
- Creating new Next.js web applications
- Working with App Router (`app/` directory) and file conventions
- Implementing Server Components vs Client Components
- Data fetching with Async Server Components and Server Actions
- Tailwind CSS integration and styling

**Key workflows**:
- **New project**: Uses strict flags (`src/` dir, no alias, etc.)
- **Components**: Default to Server Component unless interactivity is needed
- **Data mutations**: Use Server Actions for form submissions

**Guidelines**: Always use TypeScript. Always assume App Router unless Pages Router is explicitly requested.

**Documentation**: See `.claude/skills/nextjs/concepts/` for CLI commands and file structure guides.

---

### UI Animation Skill (Framer Motion)
**Location**: `.claude/skills/ui-animation/`

**Purpose**: Defines the motion design language for projects using **Framer Motion** with a "Modern Technical Editorial" aesthetic.

**When to use**:
- Adding smooth animations and transitions to UI
- Implementing entrance animations (FadeUp, LineDraw, Stagger)
- Creating hover states and interactive element animations

**Core principles**:
- **No abrupt appearances**: Use `FadeInUp` for content, `LineDraw` for dividers
- **Physics over duration**: Use smooth eased transitions (`duration: 0.4, ease: [0.22, 1, 0.36, 1]`)
- **Subtlety over action**: Hover scales rarely exceed `1.02`
- **Stagger everything**: Lists and grids must cascade

**Key workflows**:
- **Install**: `npm install framer-motion`
- **Import**: `import { motion } from 'framer-motion'`
- **Custom components**: Use `motion()` wrapper for library components (e.g., `const MotionLink = motion(Link)`)

**Documentation**: See `MOTION_TOKENS.md` and `ANIMATION_PATTERNS.md` for constants and code patterns.

---

### UI Design Skill (Modern Technical Editorial)
**Location**: `.claude/skills/ui-design/`

**Purpose**: Defines the user's preferred **Modern Technical Editorial** aesthetic—blending editorial warmth (serifs, cream backgrounds) with technical precision (lines, wireframes, mono fonts).

**When to use**:
- Designing new UI components or pages
- Establishing consistent visual language
- Creating layouts with the editorial + technical aesthetic

**Core design rules**:
- **Background**: Always `#F9F7F2` (Cream). Never pure white.
- **Typography Triad**:
  - **Serif**: Headings (`Playfair`, `Young Serif`)
  - **Sans**: Body (`DM Sans`)
  - **Mono**: Labels/Nav/Data (`JetBrains Mono`)
- **Technical Lines**: Use subtle 1px borders (`#2A1B12/10`)
- **Accent**: Vibrant Orange (`#FF6B4A`) for key interactions
- **Layout**: Open, spacious, with occasional "Massive" typography

**Documentation**: See `TOKENS.md`, `LAYOUT_PATTERNS.md`, and `COMPONENT_PATTERNS.md` for detailed patterns.

---

### Better Auth Skill
**Location**: `.claude/skills/better-auth/`

**Purpose**: Provides comprehensive knowledge for implementing secure authentication and authorization using **Better Auth**, a framework-agnostic TypeScript library.

**When to use**:
- Setting up authentication with Next.js, Remix, Astro, or Express
- Configuring OAuth providers (Google, GitHub, etc.)
- Managing user sessions and access control
- Adding plugins (organization, twoFactor, passkey, etc.)

**Capabilities**:
- **Setup & Configuration**: Initializing `betterAuth()` with adapters (Prisma, Drizzle, etc.)
- **Framework Integration**: Best practices for Next.js App Router, API routes, and Express
- **Client Side**: Using `createAuthClient` and framework-specific hooks (`useSession`)
- **Plugins**: Organization, two-factor auth, passkeys, username plugin

**Documentation**: See `concepts/IMPLEMENTATION_SUMMARY.md`, `concepts/NEXTJS_PATTERNS.md`, and `references/api_reference.md` for detailed patterns.

---

### Neon DB Skill
**Location**: `.claude/skills/neon-db/`

**Purpose**: Provides expertise in **Neon PostgreSQL** - a serverless PostgreSQL database with TypeScript/Node.js and Python integration patterns.

**When to use**:
- Connecting to Neon PostgreSQL from Node.js or Python
- Setting up connection pooling with SSL
- Designing schemas with proper indexes and triggers
- Integrating with Better Auth or FastAPI backends

**Capabilities**:
- **TypeScript/Node.js**: pg Pool with SSL, Better Auth adapter integration
- **Python/FastAPI**: psycopg2 with context managers, async patterns
- **Schema Design**: JSONB metadata, indexes, triggers, foreign keys
- **Multi-tenant**: User isolation patterns with userId filtering

**Key configuration**: SSL is **required** for all Neon connections.

**Documentation**: See `concepts/TYPESCRIPT_PATTERNS.md`, `concepts/PYTHON_PATTERNS.md`, and `concepts/SCHEMA_DESIGN.md` for detailed patterns.

## Active Technologies
- Python 3.13+ (per Constitution VI) + None required for core functionality (Python standard library only) (001-cli-todo)
- In-memory dictionary (no persistence - per spec requirement) (001-cli-todo)
- Python 3.13+ (per Constitution VI) + Python standard library only (no new dependencies) (002-cli-ui-update)
- In-memory dictionary (no persistence changes - per spec requirement) (002-cli-ui-update)
- TypeScript 5.x, React 18+, Next.js 15+ (App Router) + Framer Motion (animations), Lucide React (icons), Tailwind CSS v4 (004-profile-editing)
- Client-side state via React hooks (useAuth, useTasks) - no new persistence required (004-profile-editing)
- TypeScript 5.x, Next.js 16.1.1 (App Router), React 19.2.3 + better-auth v1.4.9 (already installed), pg (new - PostgreSQL driver) (005-user-auth)
- Neon PostgreSQL (shared with FastAPI backend) (005-user-auth)

## Recent Changes
- 001-cli-todo: Added Python 3.13+ (per Constitution VI) + None required for core functionality (Python standard library only)
