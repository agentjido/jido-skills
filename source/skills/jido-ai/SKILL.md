---
name: jido-ai
description: >-
  Integrate AI and LLM behavior into Jido systems using local jido_ai and
  req_llm conventions. Use when adding providers, model aliases, AI agents,
  tool calling, streaming, structured output, or skill prompt composition.
metadata:
  author: agentjido
  version: "0.2.0"
license: Apache-2.0
---

# Jido AI

## Purpose

Add or maintain AI behavior in Jido projects without hardcoding provider,
model, or dependency assumptions that may be stale.

## When To Use

Use this skill for:

- LLM provider configuration
- Model aliases or defaults
- AI agent modules
- Tool calling with Jido actions
- Structured output or streaming
- Prompt or skill composition
- req_llm integration work

Invoke `jido-core` first for shared ecosystem context.

## Requirements

- Inspect local `mix.exs`, config files, runtime config, and existing AI modules
  before adding examples.
- Do not hardcode model names unless the repo already does or the user requests
  a specific model.
- Treat API keys and provider secrets as environment/runtime configuration, not
  source-controlled values.

## Workflow

### 1. Inspect local AI setup

Run targeted searches:

```bash
rg "jido_ai|req_llm|model_alias|generate_text|generate_object|stream_text|tool" mix.exs config lib test
```

Record:

- Dependencies already present
- Provider config style
- Model alias conventions
- Existing AI agent modules
- Tool registration pattern
- Test support or provider mocking strategy

### 2. Choose the smallest integration

Pick the narrowest fit:

- Generation facade for one-off text, structured data, or streaming
- AI agent module for ongoing stateful behavior
- Action-as-tool integration for model-callable operations
- Prompt/skill composition for reusable model instructions

Do not introduce a full agent runtime for a simple provider call.

### 3. Configure providers safely

Use existing config conventions. Store secrets in environment variables or the
repo's secret-management layer. Prefer semantic model aliases when the repo has
them, but do not invent alias policy without local precedent.

### 4. Add tool calling carefully

When exposing tools:

- Prefer existing Jido actions with clear schemas
- Keep tool names model-readable and stable
- Validate inputs at the action boundary
- Restrict tools to the request or agent scope that actually needs them
- Add tests for tool selection or tool schema when behavior is user-facing

### 5. Handle errors and limits

Plan for:

- Provider authentication failures
- Rate limits
- Timeout and retry policy
- Invalid model output
- Partial streaming results
- Tool-call failures

Return or surface errors in the style the repo already uses.

### 6. Validate

Run focused tests that do not require live provider credentials when possible.
Use mocks, bypasses, fixtures, or repo-provided test adapters.

Run live-provider smoke tests only when the user explicitly asks and required
credentials are available.

## Output Expectations

Report:

- Provider/config behavior changed
- AI entrypoint added or changed
- Tools exposed to the model
- Error handling covered
- Tests run and whether they used live providers

## Guardrails

- Do not commit API keys, tokens, request logs with secrets, or provider
  responses containing sensitive data.
- Do not hardcode a current model as a universal default.
- Do not add network-dependent tests to the default suite.
- Do not expose broad filesystem, shell, or network tools without explicit
  scope and validation.
- Do not change prompt behavior without tests or examples that capture the new
  expectation.
