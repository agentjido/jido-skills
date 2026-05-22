---
name: jido-core
description: >-
  Provide Jido ecosystem context, package roles, conventions, and foundational
  patterns. Use before Jido agent, action, AI, testing, docs, or package work
  when the local repo needs shared Jido guidance.
metadata:
  author: agentjido
  version: "0.2.0"
license: Apache-2.0
---

# Jido Core

## Purpose

Load shared Jido ecosystem context before making package-specific decisions.
This skill is the hub for Jido framework work.

## When To Use

Use this skill when working with:

- Jido agents, actions, directives, plugins, sensors, or signals
- Jido package docs or examples
- Jido AI integration
- Tests for Jido actions or agents
- Cross-package conventions in AgentJido repos

## Requirements

- Inspect the local repo before applying examples.
- Read local `AGENTS.md`, `mix.exs`, and nearby modules first.
- Prefer local APIs and conventions over examples in this skill when they
  differ.

## Ecosystem Map

Common package roles:

| Package | Role |
| --- | --- |
| `jido` | Core agent framework, agent state, directives, runtime concepts |
| `jido_action` | Validated action behavior and execution building blocks |
| `jido_signal` | Signal model and routing concepts |
| `jido_ai` | AI agent integration and skill/tool prompt composition |
| `req_llm` | LLM provider HTTP client and request layer |
| `jido_*` packages | Domain-specific adapters, runtimes, tools, or examples |

Do not assume every repo depends on every package. Confirm with `mix.exs`.

## Core Principles

- Agents model state and command handling.
- Actions encapsulate focused behavior behind validated inputs and explicit
  return values.
- Side effects should happen at documented runtime boundaries, not hidden in
  pure decision code.
- Signals are the cross-boundary message format when a package uses the signal
  runtime.
- Zoi-first schemas are preferred for new code when the repo supports them;
  preserve existing NimbleOptions patterns in older code unless migration is in
  scope.
- Tests should prove behavior first and runtime wiring second.

## Workflow

1. Read the repo-local guidance:

   ```bash
   sed -n '1,220p' AGENTS.md 2>/dev/null || true
   sed -n '1,220p' mix.exs
   ```

2. Identify package role from `mix.exs`, modules under `lib/`, and existing
   tests.

3. Choose the narrower skill:

   - `jido-agent` for agent modules and runtime behavior
   - `jido-action` for action modules and action schemas
   - `jido-ai` for LLM, tools, and AI agent integration
   - `jido-testing` for test strategy

4. Follow existing repo patterns unless they conflict with current user intent
   or documented project standards.

5. Validate with repo-local commands. Prefer documented aliases; otherwise use
   `mix test` and focused compile checks.

## Output Expectations

When using this skill to guide work, report:

- Which local repo conventions were found
- Which Jido package role applies
- Which narrower skill was used next
- Which validation command proves the change

## Guardrails

- Do not paste large API references into responses; load reference files only
  when needed.
- Do not force Zoi migration into unrelated work.
- Do not introduce new runtime patterns without checking existing modules.
- Do not assume release, docs, or CI commands exist across all repos.

## Reference Docs

Load these only when needed:

- `reference/agents.md` for agent definition, schema, `cmd/2`, plugins, and
  runtime concepts
- `reference/actions.md` for action behavior, `run/2`, validation, and
  composition
- `reference/directives.md` for directive types and runtime processing
