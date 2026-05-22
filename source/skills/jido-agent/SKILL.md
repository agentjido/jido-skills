---
name: jido-agent
description: >-
  Build and maintain Jido agent modules, schemas, command handling, plugins,
  directives, and runtime wiring. Use when creating agents, changing agent
  behavior, or working with AgentServer-style runtime integration.
metadata:
  author: agentjido
  version: "0.2.0"
license: Apache-2.0
---

# Jido Agent

## Purpose

Create or modify Jido agents while preserving local repo conventions and the
separation between pure agent behavior and runtime side effects.

## When To Use

Use this skill for:

- New `use Jido.Agent` modules
- Agent schema changes
- `cmd/2` command handling
- Signal routing to actions
- Plugins, sensors, directives, schedules, or runtime integration
- AgentServer-related tests or debugging

Invoke `jido-core` first for shared ecosystem context.

## Requirements

- Read local `AGENTS.md`, `mix.exs`, existing agent modules, and tests before
  writing examples or code.
- Prefer the repo's current agent macro options and schema style.
- Use Zoi-first schemas for new code only when the repo already supports Zoi or
  the task explicitly includes schema modernization.

## Workflow

### 1. Inspect existing patterns

Search before designing:

```bash
rg "use Jido.Agent|def cmd|signal_routes|AgentServer" lib test
```

Record:

- Current schema style
- Existing action routing style
- Runtime module names and supervision pattern
- Test style for agents

### 2. Define the agent boundary

State clearly:

- What state the agent owns
- What commands or signals it handles
- Which actions it delegates to
- Which effects must be returned as directives or handled by runtime code

Do not hide external I/O inside pure command logic unless the repo already
documents that pattern.

### 3. Implement schema and command behavior

For new agents, include:

- `name`
- `description`
- State schema or equivalent validation
- Command or signal routing
- Clear defaults for optional state

Keep command handling small. Push reusable behavior into actions or private
helpers when it reduces complexity.

### 4. Handle directives and runtime

Use directives or documented runtime boundaries for side effects such as:

- Emitting signals
- Spawning children
- Scheduling work
- Stopping children or agents
- Calling external services

AgentServer tests should come after pure agent tests unless the bug only exists
at runtime.

### 5. Validate

Run the narrowest meaningful tests first, then repo-standard validation:

```bash
mix test path/to/agent_test.exs
mix test
```

If the repo documents a quality alias, run it after tests.

## Output Expectations

Report:

- Agent modules changed or added
- State and command behavior affected
- Runtime/directive behavior added or changed
- Tests run and what they prove

## Guardrails

- Do not create a GenServer when a Jido agent and runtime wrapper already fit.
- Do not add side effects to pure state-transition code without an explicit
  repo precedent.
- Do not invent schema syntax; inspect the repo first.
- Do not change public agent behavior without regression tests.
- Do not broaden plugin or signal routing beyond the task's scope.
