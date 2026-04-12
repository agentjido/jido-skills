---
name: hex-release
description: >-
  Guide interactive Hex package release for AgentJido repositories.
  Supports automated GitHub Actions and manual release workflows.
  Use when asked to release, publish to Hex, bump version, or create a new release.
metadata:
  author: agentjido
  version: "0.1.0"
license: Apache-2.0
compatibility: Requires mix, git, gh CLI, and Hex.pm credentials
---

# Hex Release

Interactive guide for releasing AgentJido packages to Hex.pm. Supports both
automated (GitHub Actions) and manual release workflows.

## Pre-flight Checks

Run all pre-flight checks before proceeding with either release path. Stop and
report if any check fails.

### 1. Identify Package

```bash
# Read mix.exs to get package name and current version
grep -E '(version:|@version|app:)' mix.exs
```

Record the current version and package name for later steps.

### 2. Check for Blocked Dependencies

```bash
# Look for git or path dependencies that prevent Hex publish
grep -E '(git:|path:|github:)' mix.exs mix.lock
```

If any git or path dependencies exist, stop. These must be replaced with
published Hex dependencies before release.

### 3. Verify Git Status

```bash
# Must be on main branch with a clean working tree
git status --porcelain
git branch --show-current
```

- Working tree must be clean (no uncommitted changes)
- Must be on `main` branch
- Must be up to date with remote: `git pull --ff-only`

### 4. Check for Releasable Commits

```bash
# List commits since last tag
git log $(git describe --tags --abbrev=0 2>/dev/null || echo "HEAD~20")..HEAD --oneline
```

If there are no commits since the last tag, there is nothing to release.

### 5. Run Tests and Quality Checks

```bash
mix deps.get
mix test
mix quality
```

All tests must pass. If `mix quality` is not available, run:

```bash
mix format --check-formatted
mix credo --strict
mix dialyzer
```

### 6. Dry-Run Hex Publish

```bash
mix hex.publish --dry-run
```

Review the output carefully:
- Confirm the listed files are correct (no secrets, no build artifacts)
- Confirm the package metadata is accurate
- Confirm the version is what you expect

## Path A: Automated Release (GitHub Actions)

Use this path when the repository has a `release.yml` workflow configured.

### 1. Trigger the Release Workflow

```bash
# Standard release
gh workflow run release.yml

# With options
gh workflow run release.yml -f dry_run=true
gh workflow run release.yml -f hex_dry_run=true
gh workflow run release.yml -f skip_tests=true
```

Available flags:
- `dry_run` — Run the full workflow without publishing or pushing
- `hex_dry_run` — Run `mix hex.publish --dry-run` instead of actual publish
- `skip_tests` — Skip the test suite (use only if tests were just run locally)

**Always run with `dry_run=true` first** to verify the workflow completes
successfully before doing a real release.

### 2. Monitor Workflow Progress

```bash
# Watch the most recent run
gh run list --workflow=release.yml --limit=1
gh run watch
```

### 3. Verify Completion

```bash
# Check the release was created
gh release list --limit=1

# Verify the package is on Hex
mix hex.info <package_name>
```

## Path B: Manual Release

Use this path when GitHub Actions are not available or when you need more
control over the release process.

### 1. Preview Version Bump

```bash
# Dry-run to see what version would be created
mix git_ops.release --dry-run
```

Review the proposed version bump:
- `fix:` commits → patch bump (0.1.0 → 0.1.1)
- `feat:` commits → minor bump (0.1.0 → 0.2.0)
- `BREAKING CHANGE:` → major bump (0.1.0 → 1.0.0)

If the proposed bump is not what you want, you can force a specific version:

```bash
mix git_ops.release --new-version=X.Y.Z --dry-run
```

### 2. Execute Version Bump

```bash
mix git_ops.release
# or with a specific version:
mix git_ops.release --new-version=X.Y.Z
```

This will:
- Update the version in `mix.exs`
- Update `CHANGELOG.md` with categorized commits
- Create a git commit with the version bump
- Create a git tag `vX.Y.Z`

### 3. Review CHANGELOG.md

```bash
# Review the generated changelog entry
head -50 CHANGELOG.md
```

Verify:
- The version header is correct
- Commit messages are properly categorized
- No sensitive information is included
- Breaking changes are clearly documented

If edits are needed:

```bash
# Amend the release commit with changelog fixes
# Edit CHANGELOG.md as needed, then:
git add CHANGELOG.md
git commit --amend --no-edit
git tag -f vX.Y.Z
```

### 4. Push Release

```bash
# Push the commit and tag
git push origin main
git push origin vX.Y.Z
```

### 5. Publish to Hex

```bash
mix hex.publish
```

Confirm the publish when prompted. Verify the package is available:

```bash
mix hex.info <package_name>
```

### 6. Create GitHub Release

```bash
# Extract the changelog entry for this version
# Create a GitHub release with the changelog as the body
gh release create vX.Y.Z \
  --title "vX.Y.Z" \
  --notes-file <(awk '/^## v?X\.Y\.Z/{found=1;next} /^## v?[0-9]/{if(found)exit} found' CHANGELOG.md)
```

Alternatively, create the release interactively:

```bash
gh release create vX.Y.Z --generate-notes
```

## Rollback Instructions

### Pre-Push Rollback

If you haven't pushed yet, undo the release commit and tag:

```bash
git tag -d vX.Y.Z
git reset --soft HEAD~1
```

This preserves your changes in the staging area so you can fix and re-release.

### Post-Push Rollback

If you've pushed but haven't published to Hex:

```bash
# Revert the release commit
git revert HEAD
git push origin main

# Delete the remote tag
git push origin --delete vX.Y.Z
git tag -d vX.Y.Z

# Delete the GitHub release if created
gh release delete vX.Y.Z --yes
```

### Post-Publish Rollback

If you've already published to Hex, you have 24 hours to revert:

```bash
mix hex.publish --revert X.Y.Z
```

After 24 hours, a published version cannot be reverted. You must publish a new
patch version with the fix instead.

Also revert the git and GitHub release:

```bash
git revert HEAD
git push origin main
git push origin --delete vX.Y.Z
gh release delete vX.Y.Z --yes
```

## Invocation

```
/ hex-release
```

## DO / DON'T

### DO

- Always run `--dry-run` first before any actual release
- Verify `CHANGELOG.md` is accurate and complete before pushing
- Run the full test suite before releasing
- Check for git/path dependencies before attempting Hex publish
- Confirm you are on `main` with a clean working tree
- Review the files included in the Hex package during dry-run

### DON'T

- Force-push release commits — use `git revert` instead
- Skip pre-flight checks, even for "small" releases
- Release from a branch other than `main`
- Publish to Hex before pushing the git tag
- Delete and re-create tags on the remote — this confuses downstream users
- Release if any git or path dependencies exist in mix.exs
