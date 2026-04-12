---
name: pr-review
description: >-
  Review a Pull Request for code quality, tests, merge conflicts, and
  readiness to merge. Use when asked to review a PR, check if a PR is
  ready to merge, or analyze PR code quality.
metadata:
  author: agentjido
  version: "0.1.0"
license: Apache-2.0
compatibility: Requires git and gh CLI
---

# PR Review

Structured workflow for reviewing Pull Requests in AgentJido repositories.
Covers code quality, test coverage, merge readiness, and Elixir-specific
concerns.

## Workflow

### 1. Identify the PR

Determine which PR to review:

```bash
# By PR number
gh pr view <number>

# From the current branch
gh pr view

# List open PRs to find the right one
gh pr list
```

Record the PR number, title, author, and base branch.

### 2. Fetch PR Metadata

```bash
# Full PR details including labels, reviewers, checks
gh pr view <number> --json title,body,labels,reviewers,statusCheckRollup,mergeable,reviewDecision

# Check CI status
gh pr checks <number>
```

Review:
- Title follows conventional commit format
- Description explains what and why
- Labels are appropriate
- Reviewers are assigned

### 3. Fetch PR Diff

```bash
# Get the full diff
gh pr diff <number>

# Get list of changed files
gh pr diff <number> --name-only
```

For large PRs, review file-by-file:

```bash
# Review specific files from the diff
gh pr diff <number> -- path/to/specific/file.ex
```

## Code Quality Analysis

Review the diff systematically, checking each category below.

### General Quality

- **Conventions**: New functions and modules follow project naming and
  structure conventions. Check existing code for patterns.
- **Tests**: New functionality includes tests. Modified functionality has
  updated tests. No test files removed without justification.
- **Debug code**: No `IO.inspect`, `dbg()`, `Logger.debug` with sensitive
  data, `IEx.pry`, or `TODO`/`FIXME` comments for the current PR's scope.
- **Error handling**: Errors are handled at appropriate boundaries. No
  bare `rescue` without specific exception types. No silently swallowed
  errors.
- **Documentation**: Public API changes include `@doc` and `@moduledoc`
  updates. README updated if user-facing behavior changed.

### Elixir-Specific Concerns

- **Pattern matching**: Used instead of conditional chains where
  appropriate. Function clause ordering is from specific to general.
- **Process spawning**: No unnecessary `spawn`, `Task.async`, or
  `GenServer.start_link`. Justify any new process creation.
- **Control flow**: Appropriate use of `with` for happy-path chains,
  `case` for value matching, `cond` for boolean conditions. Avoid
  deeply nested `case` statements.
- **Typespecs**: Public functions have `@spec` annotations. Custom types
  defined with `@type` or `@typep`. Specs match the actual
  implementation.
- **Pipe chains**: Pipes read naturally left-to-right. No single-function
  pipes. No pipes starting with a function call that takes arguments.

### Security

- No hardcoded secrets, API keys, or credentials
- No user input passed directly to `Code.eval_string` or similar
- Proper input validation at system boundaries
- No overly permissive file or network access

## Merge Readiness Check

### 1. CI Status

```bash
gh pr checks <number>
```

All required checks must pass. Note any failing optional checks.

### 2. Merge Conflicts

```bash
# Check if the PR is mergeable
gh pr view <number> --json mergeable

# For detailed conflict analysis
git fetch origin
git merge-tree $(git merge-base origin/main origin/pr-branch) origin/main origin/pr-branch
```

If conflicts exist, identify the conflicting files and provide resolution
guidance based on the intent of both the PR and the conflicting changes.

### 3. Review Status

```bash
gh pr view <number> --json reviewDecision,reviews
```

Check:
- Required number of approvals met
- No "changes requested" reviews still pending
- No dismissed reviews that need re-review

### 4. Unresolved Conversations

```bash
gh pr view <number> --comments
```

All review threads should be resolved. Flag any unresolved conversations.

## Output Format

Structure the review output as follows:

```
## PR Review: #<number> — <title>

### Summary
<One-line verdict: ✅ Ready to Merge | ⚠️ Needs Changes | 🚫 Blocked>

### Findings

#### Critical
- <Issues that must be fixed before merge>

#### Warning
- <Issues that should be addressed but don't block merge>

#### Suggestion
- <Optional improvements for the author to consider>

### Merge Status
- CI Checks: ✅ Passing / ❌ Failing (<details>)
- Conflicts: ✅ None / ❌ Conflicts in <files>
- Reviews: ✅ Approved / ⚠️ Pending / ❌ Changes Requested
- Conversations: ✅ Resolved / ⚠️ <N> unresolved

### Recommendation
<approve | request_changes | comment>
<Brief justification for the recommendation>
```

If the verdict is **Needs Changes** or **Blocked**, list the specific items
that must be addressed before the PR can be merged.

## Invocation

```
/ pr-review
```

## DO / DON'T

### DO

- Check for breaking changes in public APIs (removed functions, changed
  signatures, modified return types)
- Verify test coverage for new code paths
- Review the full diff before giving a verdict
- Provide specific file and line references for findings
- Suggest concrete fixes, not just problem descriptions
- Check that the PR scope matches its title and description

### DON'T

- Nitpick style issues that `mix format` handles automatically
- Block on optional improvements that can be done in follow-up PRs
- Review generated files (lock files, compiled assets) line-by-line
- Assume CI passing means the code is correct
- Approve without reading the diff
- Request changes for subjective preferences without strong justification
