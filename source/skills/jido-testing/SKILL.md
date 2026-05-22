---
name: jido-testing
description: >-
  Test Jido agents, actions, plugins, signals, directives, and AI integrations
  with focused unit and runtime coverage. Use when adding tests, fixing test
  gaps, or validating Jido behavior.
metadata:
  author: agentjido
  version: "0.2.0"
license: Apache-2.0
---

# Jido Testing

## Purpose

Build focused tests that prove Jido behavior at the cheapest reliable layer:
pure action and agent tests first, runtime integration tests only when needed.

## When To Use

Use this skill for:

- Tests for Jido actions or agents
- Regression tests for command handling
- Directive and signal assertions
- Runtime AgentServer-style tests
- AI tool or provider behavior tests
- Improving weak or brittle test coverage

Invoke `jido-core` first for shared ecosystem context.

## Requirements

- Inspect existing tests before adding new patterns.
- Prefer repo-local test helpers and aliases.
- Avoid live network/provider dependencies in default tests.
- Keep tests behavior-focused, not implementation-focused.

## Workflow

### 1. Inspect test conventions

Run:

```bash
rg "use ExUnit.Case|JidoTest|AgentServer|use Jido.Action|use Jido.Agent" test lib
sed -n '1,180p' mix.exs
```

Record:

- Test helper modules
- Async conventions
- Repo aliases such as `mix quality`
- Mocking or bypass libraries
- Existing runtime integration style

### 2. Test actions directly

For actions, test:

- Valid input returns expected `{:ok, result}`
- Invalid input is rejected by validation
- Expected domain failures return `{:error, reason}`
- Output shape matches caller expectations
- Context keys are used intentionally

Prefer direct `run/2` or repo-standard execution helpers before full runtime
tests.

### 3. Test agents as data first

For agents, test:

- Initial state defaults
- Command handling
- State transitions
- Emitted directives
- Signal routing only when routing is part of the behavior

Use runtime tests only for behavior that depends on processes, supervision,
async messages, timers, or directive execution.

### 4. Test directives and signals

Assert directive data precisely enough to catch regressions, but avoid coupling
to incidental ordering unless order matters. For signals, assert type, source,
subject, and data fields relevant to the behavior.

### 5. Test AI integrations without live providers

For AI code, prefer:

- Request/response fixtures
- Provider test adapters
- Bypass or local HTTP stubs
- Tool schema tests
- Prompt rendering tests

Run live smoke tests only when explicitly requested and credentials exist.

### 6. Validate

Run the smallest proof first:

```bash
mix test path/to/test_file.exs
```

Then run repo-standard validation. If no alias is documented, run:

```bash
mix test
mix compile --warnings-as-errors
```

## Output Expectations

Report:

- Behavior covered
- Regression risk addressed
- Runtime or provider dependencies avoided or required
- Commands run
- Any remaining coverage gaps

## Guardrails

- Do not add sleeps for async behavior when the repo has polling or mailbox
  helpers.
- Do not make default tests depend on live APIs.
- Do not test private implementation details when public behavior is enough.
- Do not weaken existing assertions just to pass.
- Do not skip failing tests without explaining the product risk.
