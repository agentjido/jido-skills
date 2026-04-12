#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { parseFrontmatter, replacePlaceholders, validateSkill, computeHash } = require('./lib/utils');
const providers = require('./lib/transformers');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_SRC = path.join(ROOT, 'source', 'skills');
const COPYABLE_DIRS = ['reference', 'scripts', 'assets'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function discoverSkills() {
  if (!fs.existsSync(SKILLS_SRC)) {
    console.error(`Skills source directory not found: ${SKILLS_SRC}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(SKILLS_SRC, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillFile = path.join(SKILLS_SRC, entry.name, 'SKILL.md');
    if (!fs.existsSync(skillFile)) continue;

    const content = fs.readFileSync(skillFile, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);
    skills.push({
      dirName: entry.name,
      srcDir: path.join(SKILLS_SRC, entry.name),
      frontmatter,
      body,
      raw: content,
    });
  }

  return skills;
}

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function buildReplacements(providerConfig) {
  return {
    command_prefix: providerConfig.commandPrefix,
    model: providerConfig.model,
    config_file: providerConfig.configFile,
    ask_instruction: providerConfig.askInstruction,
    provider: providerConfig.provider,
    display_name: providerConfig.displayName,
  };
}

// ---------------------------------------------------------------------------
// Validate
// ---------------------------------------------------------------------------

function validateAll(skills) {
  const allErrors = [];

  for (const skill of skills) {
    const errors = validateSkill(skill.frontmatter, skill.dirName);
    allErrors.push(...errors);
  }

  if (allErrors.length > 0) {
    console.error('Validation errors:');
    for (const err of allErrors) {
      console.error(`  ✗ ${err}`);
    }
    return false;
  }

  console.log(`✓ All ${skills.length} skill(s) passed validation`);
  return true;
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

function buildForProvider(skills, providerKey, providerConfig) {
  const outBase = path.join(ROOT, providerConfig.configDir, 'skills');
  const replacements = buildReplacements(providerConfig);
  let count = 0;

  for (const skill of skills) {
    const skillOutDir = path.join(outBase, skill.dirName);
    fs.mkdirSync(skillOutDir, { recursive: true });

    // Transform and write SKILL.md
    const transformed = replacePlaceholders(skill.raw, replacements);
    fs.writeFileSync(path.join(skillOutDir, 'SKILL.md'), transformed, 'utf-8');

    // Copy subdirectories
    for (const subdir of COPYABLE_DIRS) {
      const srcSub = path.join(skill.srcDir, subdir);
      if (fs.existsSync(srcSub) && fs.statSync(srcSub).isDirectory()) {
        const destSub = path.join(skillOutDir, subdir);
        copyDirRecursive(srcSub, destSub);
      }
    }

    count++;
  }

  return count;
}

function generateLockfile(skills) {
  const lock = {
    generatedAt: new Date().toISOString(),
    skills: {},
  };

  for (const skill of skills) {
    lock.skills[skill.dirName] = {
      name: skill.frontmatter.name || skill.dirName,
      hash: computeHash(skill.raw),
    };
  }

  const lockPath = path.join(ROOT, 'skills-lock.json');
  fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n', 'utf-8');
  return lockPath;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const validateOnly = process.argv.includes('--validate-only');

  console.log('Discovering skills...');
  const skills = discoverSkills();

  if (skills.length === 0) {
    console.log('No skills found (no SKILL.md files in source/skills/*/). Nothing to do.');
    process.exit(0);
  }

  console.log(`Found ${skills.length} skill(s): ${skills.map(s => s.dirName).join(', ')}`);

  // Validate
  const valid = validateAll(skills);
  if (!valid) {
    process.exit(1);
  }

  if (validateOnly) {
    console.log('Validation-only mode — skipping build.');
    process.exit(0);
  }

  // Build for each provider
  const providerKeys = Object.keys(providers);
  const summary = [];

  for (const key of providerKeys) {
    const config = providers[key];
    const count = buildForProvider(skills, key, config);
    summary.push({ provider: config.displayName, configDir: config.configDir, count });
  }

  // Generate lockfile
  const lockPath = generateLockfile(skills);

  // Summary
  console.log('\nBuild complete:');
  for (const entry of summary) {
    console.log(`  ${entry.provider} (${entry.configDir}/skills/) — ${entry.count} skill(s)`);
  }
  console.log(`  Lock file: ${path.relative(ROOT, lockPath)}`);
}

main();
