'use strict';

const crypto = require('node:crypto');

/**
 * Parse YAML frontmatter from a SKILL.md file.
 * Returns { frontmatter: Object, body: string }.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const raw = match[1];
  const body = match[2];
  const frontmatter = {};

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    let value = trimmed.slice(colonIdx + 1).trim();

    // Handle quoted strings
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Handle booleans and numbers
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (value !== '' && !isNaN(value)) value = Number(value);

    frontmatter[key] = value;
  }

  return { frontmatter, body };
}

/**
 * Replace {{key}} placeholders in content with values from replacements map.
 */
function replacePlaceholders(content, replacements) {
  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key in replacements) {
      return replacements[key];
    }
    return match;
  });
}

/**
 * Validate a skill's frontmatter against its directory name.
 * Returns an array of error strings (empty if valid).
 */
function validateSkill(frontmatter, dirName) {
  const errors = [];

  if (!frontmatter.name) {
    errors.push(`Skill in "${dirName}": missing required field "name"`);
  } else {
    if (frontmatter.name !== dirName) {
      errors.push(
        `Skill "${frontmatter.name}": name does not match directory "${dirName}"`
      );
    }
    if (!/^[a-z][a-z0-9-]*$/.test(frontmatter.name)) {
      errors.push(
        `Skill "${frontmatter.name}": name must be lowercase alphanumeric with hyphens, starting with a letter`
      );
    }
  }

  if (!frontmatter.description) {
    errors.push(`Skill in "${dirName}": missing required field "description"`);
  }

  return errors;
}

/**
 * Compute a SHA-256 hex digest of the given content.
 */
function computeHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

module.exports = { parseFrontmatter, replacePlaceholders, validateSkill, computeHash };
