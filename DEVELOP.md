# Contributing to jido-skills

## Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+

## Setup

```bash
bun install
```

## Building

```bash
bun run build
```

This reads all skills from `source/skills/` and generates provider-specific outputs into `.agents/`, `.claude/`, `.cursor/`, `.gemini/`, etc.

## Skill Authoring

Each skill is a directory in `source/skills/` containing a `SKILL.md` file.

### Guidelines

- Follow the [agentskills.io](https://agentskills.io) spec for YAML frontmatter.
- The `name` field must match the directory name, lowercase with hyphens (e.g., `jido-core`).
- The `description` field should explain **what** the skill does AND **when** to use it.
- Keep `SKILL.md` under 500 lines. Place detailed documentation in a `reference/` subdirectory.
- Use placeholders for provider-specific values:
  - `{{command_prefix}}` — tool invocation prefix (`$` for Codex, `/` for others)
  - `{{model}}` — model identifier
  - `{{config_file}}` — provider config file path

### Example Structure

```
source/skills/my-skill/
├── SKILL.md           # Main skill file (< 500 lines)
└── reference/
    ├── api.md         # Detailed API docs
    └── examples.md    # Extended examples
```

## Validation

```bash
bun run validate
```

Checks all skills for valid frontmatter, naming conventions, and line limits.

## Adding a New Provider

Add the provider configuration to `scripts/lib/transformers/providers.js`. Each provider entry defines the output directory, command prefix, and config file path.

## Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b my-skill`)
3. Author or edit skills in `source/skills/`
4. Run `bun run build` and `bun run validate`
5. Open a PR against `main`
