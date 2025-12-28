# Git Branching Strategy

## Overview
This project follows a sequential feature branching strategy where `main` serves as the stable base branch and feature branches represent clear evolutionary stages of the project.

## Branch Structure

### Main Branch (`main`)
- **Purpose**: Stable base branch containing production-ready code
- **Default Branch**: ✅ Set as primary branch for the repository
- **Protection**: ✅ Protected (requires PR review, 1 approval required)
- **Content**: Only merged feature branches that have been reviewed and tested
- **State**: Always deployable
- **Direct Commits**: ❌ Not allowed (must go through PR process)

### Feature Branches (`001-*, 002-*, etc.`)
- **Naming**: Sequential three-digit numbers with descriptive names
  - Format: `###-feature-description`
  - Examples: `001-cli-todo`, `002-web-interface`, `003-database-persistence`
- **Purpose**: Represent distinct stages in project evolution
- **Lifecycle**: Created from `main`, developed, tested, then merged back to `main`
- **Scope**: Each branch should represent a clear, testable feature or stage

## Workflow

### 1. Creating a New Feature
```bash
# Start from main
git checkout main
git pull origin main

# Create new feature branch
git checkout -b 002-next-feature
```

### 2. Developing on Feature Branch
```bash
# Make changes, commit with clear messages
git add .
git commit -m "feat: add meaningful description"

# Push to remote
git push -u origin 002-next-feature
```

### 3. Merging to Main
```bash
# Create PR from 002-next-feature to main
# After review and approval:
git checkout main
git pull origin main
git merge 002-next-feature
git push origin main
```

## Current Branches

| Branch | Status | Description |
|--------|--------|-------------|
| `main` | ✅ **Default** | Base branch for all features (protected) |
| `001-cli-todo` | ✅ Feature | CLI Todo application with Spec-Driven Development framework |

**Repository Default**: `main` is set as the primary/default branch

## Feature Evolution Examples

### Stage 1: CLI Foundation (001-cli-todo)
- ✅ CLI todo application
- ✅ Spec-Driven Development framework
- ✅ Architecture Decision Records
- ✅ Prompt History tracking

### Stage 2: Potential Future Features
- `002-web-interface` - Web UI for todo management
- `003-database-persistence` - Replace in-memory with database
- `004-api-layer` - REST API for external integrations
- `005-authentication` - User authentication and authorization

## Commit Message Convention

Follow conventional commits:
```
feat(scope): description
fix(scope): description
docs(scope): description
test(scope): description
refactor(scope): description
chore(scope): description
```

## Branch Protection Rules (Recommended)

1. **Main Branch**:
   - Require pull request reviews
   - Require status checks to pass
   - Require conversation resolution
   - Prevent force pushes

2. **Feature Branches**:
   - Can be force-pushed by creators
   - Should be deleted after merge

## Commands Reference

```bash
# List all branches
git branch -a

# Switch to main
git checkout main

# Create new feature
git checkout -b 002-feature-name

# Update feature branch from main
git checkout 002-feature-name
git rebase main

# Merge feature to main
git checkout main
git merge 002-feature-name
git push origin main
```

## Benefits

1. **Clear Evolution**: Each branch represents a distinct stage
2. **Easy Rollback**: Can revert individual feature merges
3. **Parallel Development**: Multiple features can be developed simultaneously
4. **Clean History**: Linear progression through numbered features
5. **Documentation**: Each feature can have its own specs, plans, and tasks