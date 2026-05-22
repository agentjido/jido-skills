---
name: jido-action
description: >-
  Build and maintain composable Jido actions with validated inputs, explicit
  outputs, predictable errors, and AI-tool compatibility. Use when defining
  actions, schemas, action chains, or action execution behavior.
metadata:
  author: agentjido
  version: "0.2.0"
license: Apache-2.0
---

# Jido Action

## Purpose

Create focused Jido actions that are easy to validate, compose, test, and
expose to agents or tools.

## When To Use

Use this skill for:

- New `use Jido.Action` modules
- Action schema or output schema changes
- `run/2` behavior changes
- Action chains or closures
- Converting actions into AI-callable tools
- Debugging action validation or execution

Invoke `jido-core` first for shared ecosystem context.

## Requirements

- Inspect local action modules before writing new patterns.
- Preserve the repo's current schema style unless migration is requested.
- Prefer pure, deterministic action behavior.
- Return explicit success or error tuples.

## Workflow

### 1. Inspect action conventions

Search before editing:

```bash
rg "use Jido.Action|def run\\(" lib test
```

Record:

- Schema style
- Return shape
- Error conventions
- Context usage
- Tests for validation and execution

### 2. Define the action contract

Before coding, identify:

- Action name and description
- Required and optional params
- Output shape
- Error cases
- Context fields read by `run/2`
- Whether the action is safe to expose as an AI tool

Keep actions narrow. Split multi-step workflows into action chains or separate
actions when that improves testing and reuse.

### 3. Validate inputs and outputs

Use the repo-supported schema mechanism. For new code, prefer Zoi when the repo
already uses or supports it. Otherwise preserve the existing schema style.

Validation should reject invalid input before behavior executes. Output schemas
should be used for externally consumed or tool-facing actions when supported.

### 4. Implement `run/2`

`run/2` should:

- Accept validated params
- Read only documented context keys
- Return `{:ok, result}` or `{:error, reason}`
- Keep external side effects out unless the action's purpose is explicitly an
  adapter boundary
- Avoid raising for normal validation or domain failures

### 5. Tool compatibility

When exposing an action to AI tools:

- Ensure name and description are clear to a model
- Ensure params have useful docs
- Avoid ambiguous atoms or internal-only data structures at the tool boundary
- Add tests for generated tool schema when the repo supports that behavior

### 6. Validate

Run focused action tests first:

```bash
mix test path/to/action_test.exs
```

Then run the repo-standard test or quality command.

## Output Expectations

Report:

- Action contract changed
- Validation behavior changed
- Error cases covered
- Tool-facing behavior, if any
- Tests run

## Guardrails

- Do not use actions as unstructured service objects.
- Do not silently swallow errors.
- Do not depend on process dictionary state.
- Do not expose unsafe filesystem, network, or code-evaluation behavior as a
  model tool.
- Do not change return shapes without updating callers and tests.
