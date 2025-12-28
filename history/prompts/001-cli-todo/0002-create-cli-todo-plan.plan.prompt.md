---
id: 0002
title: Create CLI Todo Plan
stage: plan
date: 2025-12-27
surface: agent
model: claude-opus-4-5-20251101
feature: 001-cli-todo
branch: 001-cli-todo
user: user
command: /sp.plan
labels: ["architecture", "planning", "phase-1", "cli"]
links:
  spec: specs/001-cli-todo/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-cli-todo/plan.md (created/updated)
  - specs/001-cli-todo/research.md (created)
  - specs/001-cli-todo/data-model.md (created)
  - specs/001-cli-todo/quickstart.md (created)
  - specs/001-cli-todo/contracts/cli-commands.md (created)
  - CLAUDE.md (updated with active technologies)
tests:
  - Constitution Check validation (PASS)
  - Technical Context analysis (COMPLETE)
  - Phase 0 research (COMPLETE)
  - Phase 1 design artifacts (COMPLETE)
  - Agent context update (COMPLETE)
---

## Prompt

# In-Memory Command-Line Todo Application

## Project Overview

A basic command-line todo application built in Python that manages tasks entirely in memory. The application provides essential task management functionality through a text-based interface and does not persist data between sessions.

---

## Technology Stack

| Component | Specification |
|-----------|---------------|
| **Language** | Python 3.13+ |
| **Interface** | Command-line (CLI) |
| **Storage** | In-memory (no persistence) |
| **AI Assistant** | Claude Code |
| **Package Manager** | UV |

---

## Data Model

### Task Entity

```python
@dataclass
class Task:
    id: int              # Unique identifier (auto-incremented)
    title: str           # Task title/description (required, non-empty)
    is_complete: bool    # Completion status (default: False)
    created_at: datetime # Timestamp when task was created
```

### TaskManager

```python
class TaskManager:
    tasks: dict[int, Task]  # Storage for all tasks (key: task_id)
    next_id: int            # Counter for generating unique IDs
```

---

## Core Features Specification

### Feature 1: Add Task

**Purpose:** Create a new todo item and add it to the task list.

**Input:**
- `title` (string): The description of the task to add

**Validation Rules:**
- Title must not be empty or whitespace-only
- Title should be trimmed of leading/trailing whitespace

**Behavior:**
1. Validate the input title
2. Generate a unique ID for the task
3. Create a new Task object with:
   - Assigned unique ID
   - Provided title (trimmed)
   - `is_complete` set to `False`
   - `created_at` set to current timestamp
4. Store the task in the TaskManager
5. Return the created task

**Output:**
- Success: Display confirmation message with task ID and title
- Failure: Display error message explaining why task could not be added

**Example:**
```
> add Buy groceries
✓ Task #1 added: "Buy groceries"
```

---

### Feature 2: Delete Task

**Purpose:** Remove an existing task from the task list.

**Input:**
- `task_id` (integer): The unique identifier of the task to delete

**Validation Rules:**
- Task ID must be a valid positive integer
- Task with specified ID must exist

**Behavior:**
1. Parse and validate the task ID
2. Check if task exists in TaskManager
3. Remove the task from storage
4. Return success/failure status

**Output:**
- Success: Display confirmation message with deleted task details
- Failure: Display error message (invalid ID or task not found)

**Example:**
```
> delete 1
✓ Task #1 deleted: "Buy groceries"

> delete 99
✗ Error: Task #99 not found
```

---

### Feature 3: Update Task

**Purpose:** Modify the title of an existing task.

**Input:**
- `task_id` (integer): The unique identifier of the task to update
- `new_title` (string): The new title for the task

**Validation Rules:**
- Task ID must be a valid positive integer
- Task with specified ID must exist
- New title must not be empty or whitespace-only
- New title should be trimmed of leading/trailing whitespace

**Behavior:**
1. Parse and validate the task ID
2. Validate the new title
3. Check if task exists in TaskManager
4. Update the task's title with the new value
5. Return the updated task

**Output:**
- Success: Display confirmation message showing old and new title
- Failure: Display error message explaining the failure reason

**Example:**
```
> update 1 Buy organic groceries
✓ Task #1 updated: "Buy groceries" → "Buy organic groceries"

> update 99 New title
✗ Error: Task #99 not found
```

---

### Feature 4: View Task List

**Purpose:** Display all current tasks with their details.

**Input:**
- None required (optional: filter by completion status)

**Behavior:**
1. Retrieve all tasks from TaskManager
2. Sort tasks by ID (ascending order)
3. Format each task for display showing:
   - Task ID
   - Completion status indicator (`[ ]` or `[x]`)
   - Task title
4. Display formatted list or empty state message

**Output:**
- If tasks exist: Display formatted list of all tasks
- If no tasks: Display "No tasks found" message

**Example:**
```
> list
┌────┬────────┬─────────────────────────┐
│ ID │ Status │ Title                   │
├────┼────────┼─────────────────────────┤
│  1 │ [ ]    │ Buy groceries           │
│  2 │ [x]    │ Call doctor             │
│  3 │ [ ]    │ Finish homework         │
└────┴────────┴─────────────────────────┘
Total: 3 tasks (1 complete, 2 pending)

> list
No tasks found. Add a task with: add <title>
```

---

### Feature 5: Mark as Complete

**Purpose:** Toggle the completion status of a task.

**Input:**
- `task_id` (integer): The unique identifier of the task to toggle

**Validation Rules:**
- Task ID must be a valid positive integer
- Task with specified ID must exist

**Behavior:**
1. Parse and validate the task ID
2. Check if task exists in TaskManager
3. Toggle the `is_complete` status:
   - If `False` → set to `True`
   - If `True` → set to `False`
4. Return the updated task

**Output:**
- Success: Display confirmation message with new status
- Failure: Display error message (invalid ID or task not found)

**Example:**
```
> complete 1
✓ Task #1 marked as complete: "Buy groceries"

> complete 1
✓ Task #1 marked as incomplete: "Buy groceries"

> complete 99
✗ Error: Task #99 not found
```

---

## Command-Line Interface Specification

### Command Format

The application uses a command-based interface with the following syntax:

```
<command> [arguments...]
```

### Available Commands

| Command | Syntax | Description |
|---------|--------|-------------|
| `add` | `add <title>` | Add a new task |
| `delete` | `delete <id>` | Delete a task by ID |
| `update` | `update <id> <new_title>` | Update a task's title |
| `list` | `list` | View all tasks |
| `complete` | `complete <id>` | Toggle task completion |
| `help` | `help` | Display available commands |
| `exit` | `exit` or `quit` | Exit the application |

### Main Loop Behavior

```
1. Display welcome message and instructions
2. Loop:
   a. Display prompt (e.g., "todo> ")
   b. Read user input
   c. Parse command and arguments
   d. Execute corresponding function
   e. Display result/feedback
   f. Repeat until exit command
3. Display goodbye message
```

### Error Handling

| Error Type | Response |
|------------|----------|
| Empty input | Re-display prompt silently |
| Unknown command | Display "Unknown command. Type 'help' for available commands." |
| Missing arguments | Display usage hint for the specific command |
| Invalid ID format | Display "Invalid ID. Please enter a number." |
| Task not found | Display "Task #<id> not found." |

---

## Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION START                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Initialize TaskManager                         │
│              (empty tasks dict, next_id = 1)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Display Welcome Message                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     MAIN LOOP                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1. Display prompt                                      │ │
│  │ 2. Read input                                          │ │
│  │ 3. Parse command                                       │ │
│  │ 4. Execute & display result                            │ │
│  │ 5. Check for exit → if yes, break                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Display Goodbye Message                        │
│              APPLICATION END                                │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
backend/                        # Created with: uv init --package backend
├── pyproject.toml              # Project configuration for UV
├── README.md                   # Project documentation
└── src/
    └── backend/
        ├── __init__.py         # Package initialization
        ├── main.py             # Entry point, CLI loop
        ├── models.py           # Task dataclass definition
        ├── manager.py          # TaskManager class
        └── commands.py         # Command handlers
```

---

## Implementation Breakdown

### Phase 1: Project Setup
1. Initialize project with UV
2. Create directory structure
3. Set up `pyproject.toml`

### Phase 2: Data Model
1. Implement `Task` dataclass in `models.py`
2. Implement `TaskManager` class in `manager.py`

### Phase 3: Core Features
1. Implement `add_task()` method
2. Implement `delete_task()` method
3. Implement `update_task()` method
4. Implement `list_tasks()` method
5. Implement `toggle_complete()` method

### Phase 4: CLI Interface
1. Implement command parser
2. Implement main loop in `main.py`
3. Implement help command
4. Implement exit handling

### Phase 5: Polish
1. Add input validation
2. Add error handling
3. Add formatted output
4. Test all features

---

## Sample Session

```
╔════════════════════════════════════════════════════════════╗
║           Welcome to Todo App v1.0                        ║
║           Type 'help' for available commands              ║
╚════════════════════════════════════════════════════════════╝

todo> help

Available Commands:
  add <title>           Add a new task
  delete <id>           Delete a task by ID
  update <id> <title>   Update a task's title
  list                  View all tasks
  complete <id>         Toggle task completion status
  help                  Show this help message
  exit                  Exit the application

todo> add Learn Python
✓ Task #1 added: "Learn Python"

todo> add Build todo app
✓ Task #2 added: "Build todo app"

todo> add Write documentation
✓ Task #3 added: "Write documentation"

todo> list
┌────┬────────┬─────────────────────────┐
│ ID │ Status │ Title                   │
├────┼────────┼─────────────────────────┤
│  1 │ [ ]    │ Learn Python            │
│  2 │ [ ]    │ Build todo app          │
│  3 │ [ ]    │ Write documentation     │
└────┴────────┴─────────────────────────┘
Total: 3 tasks (0 complete, 3 pending)

todo> complete 1
✓ Task #1 marked as complete: "Learn Python"

todo> update 2 Build awesome todo app
✓ Task #2 updated: "Build todo app" → "Build awesome todo app"

todo> delete 3
✓ Task #3 deleted: "Write documentation"

todo> list
┌────┬────────┬─────────────────────────┐
│ ID │ Status │ Title                   │
├────┼────────┼─────────────────────────┤
│  1 │ [x]    │ Learn Python            │
│  2 │ [ ]    │ Build awesome todo app  │
└────┴─────────────────────────┘
Total: 2 tasks (1 complete, 1 pending)

todo> exit
Goodbye! Your tasks have not been saved.
```

---

## Acceptance Criteria

- [ ] Application starts without errors
- [ ] Help command displays all available commands
- [ ] Can add tasks with valid titles
- [ ] Cannot add tasks with empty titles
- [ ] Can view list of all tasks
- [ ] Empty task list displays appropriate message
- [ ] Can delete existing tasks
- [ ] Cannot delete non-existent tasks
- [ ] Can update existing task titles
- [ ] Cannot update non-existent tasks
- [ ] Can toggle task completion status
- [ ] Task IDs are unique and auto-incremented
- [ ] Application exits cleanly with exit/quit command
- [ ] All error cases display user-friendly messages

## Response snapshot

I've successfully created a comprehensive architectural plan for the CLI Todo Application following Spec-Driven Development principles. Here's what was accomplished:

## ✅ Plan Complete

### **Branch**: `001-cli-todo`
### **Plan File**: `specs/001-cli-todo/plan.md`

---

## 📋 What Was Delivered

### **1. Complete Implementation Plan**
- **Summary**: Python CLI app with in-memory task management
- **Technical Context**: Python 3.13+, standard library only, in-memory storage
- **Constitution Check**: ✅ PASS with documented Phase I scope limitations
- **Project Structure**: Single project with layered architecture

### **2. Constitution Compliance Analysis**
- ✅ **I. Universal Logic Decoupling**: manager.py decoupled from CLI
- ⚠️ **II. AI-Native Interoperability**: Deferred to Phase III (CLI only now)
- ✅ **III. Strict Statelessness**: In-memory only, no persistence
- ⚠️ **IV. Event-Driven Decoupling**: Not applicable to CLI
- ⚠️ **V. Zero-Trust Multi-Tenancy**: Not applicable to single-user CLI
- ✅ **VI. Technology Stack**: Python 3.13+ only
- ✅ **VII. Security**: Input validation, no secrets
- ⚠️ **VIII. Observability**: Minimal (structured output only)

**Justifications**: Principles II, IV, V target Phase II+ (web/agent/multi-tenant). Phase I is explicitly a foundation layer.

### **3. Phase 0: Research**
**File**: `specs/001-cli-todo/research.md`
- **Decision**: Python standard library only
- **Rationale**: Zero dependencies, per spec requirements
- **Alternatives**: External libraries rejected (unnecessary for Phase I)
- **Key Findings**: All requirements well-defined, no technical unknowns

### **4. Phase 1: Design Artifacts**

#### **Data Model** (`data-model.md`)
- **Task Entity**: id, title, is_complete, created_at
- **TaskManager**: Business logic with O(1) operations
- **Validation**: Multi-layer defense in depth
- **Performance**: <10ms operations, ~1MB for 10k tasks

#### **API Contracts** (`contracts/cli-commands.md`)
- **7 Commands**: add, delete, update, list, complete, help, exit
- **Error Contract**: User-friendly messages with guidance
- **Input Validation**: Command parsing, argument validation, business rules
- **Output Format**: Success ✓, Error ✗, formatted tables

#### **Quickstart Guide** (`quickstart.md`)
- **Installation**: UV commands
- **Usage Examples**: Complete workflow demonstration
- **Troubleshooting**: Common issues and solutions
- **Best Practices**: Task naming, workflow patterns

#### **Agent Context Update**
- **Updated**: `CLAUDE.md` with active technologies
- **Added**: Python 3.13+, standard library patterns
- **Ready**: For future implementation tasks

### **5. Architectural Decisions**
**ADR Suggestion**: 📋 **CLI Layered Architecture**
- **Impact**: Long-term maintainability and extensibility
- **Alternatives**: Monolithic single-file approach
- **Scope**: Cross-cutting design pattern
- **Recommendation**: Run `/sp.adr "CLI Layered Architecture"`

---

## 🎯 Key Technical Decisions

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **Standard Library Only** | Zero dependencies, per spec | Manual formatting |
| **Dictionary Storage** | O(1) lookup by ID | Memory overhead |
| **Layered Architecture** | Constitution I compliance | More files |
| **Multi-layer Validation** | Clear error messages | More code |
| **TDD Approach** | Quality + documentation | Slower initial dev |

---

## 📊 Phase I Scope Justification

**What's Included**:
- ✅ CLI interface with 7 commands
- ✅ In-memory task management
- ✅ Input validation and error handling
- ✅ Formatted output
- ✅ Comprehensive testing
- ✅ Layered architecture

**What's Deferred**:
- ❌ MCP tools (Phase III)
- ❌ HTTP API (Phase II)
- ❌ Event sourcing (Phase IV)
- ❌ Multi-tenancy (Phase II)
- ❌ Full observability (Phase II+)

---

## 🚀 Next Steps

### **Immediate**:
1. **Review ADR suggestion**: `/sp.adr "CLI Layered Architecture"`
2. **Generate tasks**: `/sp.tasks` for implementation
3. **Start implementation**: Follow tasks.md

### **After Implementation**:
1. **Phase II**: Wrap in FastAPI for web interface
2. **Phase III**: Add MCP tools for AI agents
3. **Phase IV**: Event-driven architecture
4. **Phase V**: Distributed deployment

---

## 📁 Generated Files

```
specs/001-cli-todo/
├── plan.md              ✅ Complete architecture plan
├── research.md          ✅ Technical decisions
├── data-model.md        ✅ Entity definitions
├── quickstart.md        ✅ User guide
└── contracts/
    └── cli-commands.md  ✅ Command specifications

CLAUDE.md                ✅ Updated with technologies
```

---

## ✅ Quality Validation

- ✅ All placeholder tokens resolved
- ✅ Constitution compliance verified
- ✅ Technical context complete
- ✅ Design artifacts comprehensive
- ✅ No unresolved clarifications
- ✅ Ready for implementation

## Outcome

- ✅ **Impact**: Complete architectural plan ready for implementation
- 🧪 **Tests**: Constitution Check passed, all phases validated
- 📁 **Files**: 5 design artifacts + agent context update
- 🔁 **Next prompts**: `/sp.adr "CLI Layered Architecture"` or `/sp.tasks`
- 🧠 **Reflection**: Phase I scope properly bounded, all principles documented, ready for TDD implementation

## Evaluation notes (flywheel)

- Failure modes observed: None - plan is complete and validated
- Graders run and results: PASS (Constitution Check, Technical Context, all phases)
- Prompt variant: Standard plan workflow with user-provided spec
- Next experiment: Try `/sp.tasks` to see task breakdown for this architecture

---

**The architectural plan is complete and ready for implementation!** 🎯

The plan follows SDD principles, respects the Constitution v1.1.0, and provides a clear path from specification to implementation. All Phase I scope limitations are documented and justified for future phases.

## 📋 Summary

**Feature**: In-Memory CLI Todo Application
**Phase**: I (Foundation)
**Status**: ✅ Plan Complete
**Next**: `/sp.tasks` or `/sp.adr "CLI Layered Architecture"`

## Outcome

- ✅ **Impact**: Complete architectural plan ready for implementation
- 🧪 **Tests**: Constitution Check passed, all phases validated
- 📁 **Files**: 5 design artifacts + agent context update
- 🔁 **Next prompts**: `/sp.adr "CLI Layered Architecture"` or `/sp.tasks`
- 🧠 **Reflection**: Phase I scope properly bounded, all principles documented, ready for TDD implementation

## Evaluation notes (flywheel)

- Failure modes observed: None - plan is complete and validated
- Graders run and results: PASS (Constitution Check, Technical Context, all phases)
- Prompt variant: Standard plan workflow with user-provided spec
- Next experiment: Try `/sp.tasks` to see task breakdown for this architecture
