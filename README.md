# Jido Skills

> Agent Skills for the Jido ecosystem

[![GitHub stars](https://img.shields.io/github/stars/agentjido/jido-skills?style=flat-square)](https://github.com/agentjido/jido-skills)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue?style=flat-square)](LICENSE)
[![agentskills.io](https://img.shields.io/badge/spec-agentskills.io-purple?style=flat-square)](https://agentskills.io)

## What is this?

A shared repository of **Agent Skills** (in [SKILL.md](https://agentskills.io) format) for AI coding agents working with the [Jido](https://github.com/agentjido/jido) Elixir framework. Each skill teaches an AI agent how to build, test, and maintain Jido projects — from core patterns to AI integration.

## Available Skills

| Skill | Description | Keywords |
| --- | --- | --- |
| [jido-core](source/skills/jido-core/) | Jido ecosystem overview, conventions, and patterns. The foundational skill all others depend on. | `elixir`, `jido`, `conventions` |
| [jido-agent](source/skills/jido-agent/) | Building Jido Agents with schema, `cmd/2`, plugins, and directives. | `agent`, `schema`, `plugins` |
| [jido-action](source/skills/jido-action/) | Composable, validated actions with the Jido Action behaviour. | `action`, `composable`, `validation` |
| [jido-ai](source/skills/jido-ai/) | AI/LLM integration with `jido_ai` and `req_llm`. | `ai`, `llm`, `openai` |
| [jido-testing](source/skills/jido-testing/) | Testing Jido agents and actions without processes. | `testing`, `exunit` |
| [hex-release](source/skills/hex-release/) | Interactive Hex package release workflow for AgentJido repos. | `hex`, `release`, `publishing` |
| [pr-review](source/skills/pr-review/) | Pull request review for code quality and merge readiness. | `review`, `pr`, `quality` |

## Quick Start

Copy skills into your project for your preferred AI coding tool:

### Codex CLI (primary target)

```bash
cp -r .agents/skills/ your-project/.agents/skills/
```

### Claude Code

```bash
cp -r .claude/skills/ your-project/.claude/skills/
```

### Cursor

```bash
cp -r .cursor/skills/ your-project/.cursor/skills/
```

### Gemini CLI

```bash
cp -r .gemini/skills/ your-project/.gemini/skills/
```

### Build System

Provider-specific outputs are generated from `source/` by the build system:

```bash
bun install
bun run build
```

This rebuilds all provider directories (`.agents/`, `.claude/`, `.cursor/`, `.gemini/`, etc.) from the canonical sources in `source/skills/`.

## Contributing

See [DEVELOP.md](DEVELOP.md) for skill authoring guidelines, build instructions, and how to submit new skills.

## Jido Ecosystem

- [jido](https://github.com/agentjido/jido) — Core autonomous agent framework
- [jido_action](https://github.com/agentjido/jido) — Composable action behaviour
- [jido_signal](https://github.com/agentjido/jido) — Signal processing
- [jido_ai](https://github.com/agentjido/jido_ai) — AI/LLM integration
- [req_llm](https://github.com/agentjido/req_llm) — Req-based LLM client
- [agentjido.xyz](https://agentjido.xyz) — Project website

## License

[Apache-2.0](LICENSE) — Copyright 2025 AgentJido Contributors
