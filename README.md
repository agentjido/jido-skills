# Jido Skills

**The agent skills that make your AI coding assistant an expert in the Jido ecosystem.**

[![GitHub stars](https://img.shields.io/github/stars/agentjido/jido-skills?style=flat-square)](https://github.com/agentjido/jido-skills)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue?style=flat-square)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/spec-agentskills.io-purple?style=flat-square)](https://agentskills.io/specification)
[![Skills](https://img.shields.io/badge/skills-7-green?style=flat-square)](#commands)

---

A collection of [Agent Skills](https://agentskills.io) that teach AI coding agents how to build with [Jido](https://github.com/agentjido/jido) — the autonomous agent framework for Elixir. Instead of pasting docs into every prompt, install these skills once and your agent gains deep knowledge of Jido's patterns, APIs, and ecosystem.

Works with **Codex** (primary), **Claude Code**, **Cursor**, **Gemini CLI**, and any tool supporting the [agentskills.io](https://agentskills.io/specification) standard.

## How It Works

Agent Skills use **progressive disclosure** — your coding agent sees skill names and descriptions at startup, then loads the full instructions only when relevant. Think of each skill as a slash command:

```
$jido-agent    ← Codex
/jido-agent    ← Claude Code, Cursor, Gemini
```

Ask your agent to build a Jido agent, and it automatically loads the `jido-agent` skill with step-by-step instructions, real API examples, and DO/DON'T guidance. No copy-pasting docs.

## Commands

### 🧭 Foundation

| Command | Description |
| --- | --- |
| `$jido-core` | **The hub skill.** Jido ecosystem map, core design principles, Elixir/OTP conventions, and project structure. All other skills depend on this — it loads automatically as prerequisite context. |

### 🔨 Building

| Command | Description |
| --- | --- |
| `$jido-agent` | Build Jido Agents — `use Jido.Agent`, schema validation, `cmd/2` command pattern, plugins, directives, and AgentServer runtime. |
| `$jido-action` | Create composable actions — `use Jido.Action`, `run/2` callback, schema validation, action chaining, and AI tool integration. |
| `$jido-ai` | AI/LLM integration — configure providers, build chat agents with `jido_ai`, expose actions as LLM tools, streaming with `req_llm`. |

### 🧪 Quality

| Command | Description |
| --- | --- |
| `$jido-testing` | Test agents and actions without OTP processes. Unit testing, property-based testing with StreamData, integration testing with AgentServer. |
| `$pr-review` | Review a Pull Request — code quality analysis, Elixir-specific checks, merge conflict detection, and structured readiness verdict. |

### 📦 Shipping

| Command | Description |
| --- | --- |
| `$hex-release` | Interactive Hex release workflow — pre-flight checks, automated (GitHub Actions) or manual publish, CHANGELOG verification, rollback instructions. |

> **Note:** Commands shown with `$` prefix (Codex). In Claude Code, Cursor, and Gemini CLI, use `/` instead.

## Quick Start

### Install for Codex (primary)

```bash
# Copy into your Jido project
cp -r .agents/skills/ your-project/.agents/skills/

# Or symlink for auto-updates
ln -s /path/to/jido-skills/.agents/skills your-project/.agents/skills
```

### Install for other agents

```bash
# Claude Code
cp -r .claude/skills/ your-project/.claude/skills/

# Cursor
cp -r .cursor/skills/ your-project/.cursor/skills/

# Gemini CLI
cp -r .gemini/skills/ your-project/.gemini/skills/
```

### Use it

Open your agent and ask:

```
Build me a Jido agent that manages a task queue with priorities
```

Your agent finds and loads `$jido-core` → `$jido-agent` automatically, then follows the skill instructions to build it correctly.

Or invoke directly:

```
$jido-action — create a new action that validates email addresses
```

## Architecture

```
jido-skills/
├── source/skills/          ← Edit here (single source of truth)
│   ├── jido-core/
│   │   ├── SKILL.md
│   │   └── reference/      ← Deep docs: agents, actions, directives
│   ├── jido-agent/SKILL.md
│   ├── jido-action/SKILL.md
│   ├── jido-ai/SKILL.md
│   ├── jido-testing/SKILL.md
│   ├── hex-release/SKILL.md
│   └── pr-review/SKILL.md
│
├── .agents/skills/         ← Generated: Codex
├── .claude/skills/         ← Generated: Claude Code
├── .cursor/skills/         ← Generated: Cursor
├── .gemini/skills/         ← Generated: Gemini CLI
│
├── scripts/                ← Zero-dep Node.js build system
└── skills-lock.json        ← SHA-256 integrity hashes
```

**One source, many targets.** Skills are authored once in `source/` with `{{command_prefix}}` placeholders, then built to each provider's directory with the correct prefix (`$` or `/`), paths, and config references.

```bash
node scripts/build.js       # Rebuild all providers
node scripts/build.js --validate-only  # Validate without writing
```

## Hub-and-Spoke Pattern

`jido-core` is the **hub skill** — it contains the ecosystem overview, conventions, and design principles that every other skill depends on. Each satellite skill starts with:

```markdown
## MANDATORY PREPARATION

Invoke $jido-core first — it contains ecosystem context,
conventions, and core design principles.
```

This ensures your agent always has foundational context before diving into a specific task. The hub also includes deep reference docs in `reference/` that the agent loads on demand:

- `reference/agents.md` — Agent definition, schema, cmd/2, plugins, AgentServer
- `reference/actions.md` — Action behaviour, run/2, composition, validation
- `reference/directives.md` — Directive types, runtime processing, custom directives

## The Jido Ecosystem

These skills cover the full Jido ecosystem:

| Package | Description | Skill |
| --- | --- | --- |
| [jido](https://github.com/agentjido/jido) | Core agent framework — state, directives, runtime | `$jido-core` `$jido-agent` |
| [jido_action](https://github.com/agentjido/jido_action) | Composable validated actions | `$jido-action` |
| [jido_ai](https://github.com/agentjido/jido_ai) | AI/LLM integration | `$jido-ai` |
| [jido_signal](https://github.com/agentjido/jido_signal) | CloudEvents signals & routing | `$jido-core` |
| [req_llm](https://github.com/agentjido/req_llm) | HTTP client for LLM APIs | `$jido-ai` |

🌐 [agentjido.xyz](https://agentjido.xyz) — Website, demos, and workbench examples

## Contributing

We welcome new skills! See [DEVELOP.md](DEVELOP.md) for:

- Skill authoring guidelines and the SKILL.md format
- Build system setup (`node scripts/build.js`)
- Provider compatibility matrix ([HARNESSES.md](HARNESSES.md))
- How to submit a PR

Skills follow the [agentskills.io specification](https://agentskills.io/specification). Keep `SKILL.md` under 500 lines; use a `reference/` subdirectory for deep documentation.

## License

[Apache-2.0](LICENSE) — Copyright 2025 AgentJido Contributors
