'use strict';

const providers = {
  codex: {
    provider: 'codex',
    configDir: '.agents',
    displayName: 'Codex CLI',
    commandPrefix: '$',
    model: '',
    configFile: 'AGENTS.md',
    askInstruction: '',
    frontmatterFields: ['name', 'description', 'version'],
  },
  'claude-code': {
    provider: 'claude-code',
    configDir: '.claude',
    displayName: 'Claude Code',
    commandPrefix: '/',
    model: '',
    configFile: '.claude/settings.json',
    askInstruction: '',
    frontmatterFields: ['name', 'description', 'version'],
  },
  cursor: {
    provider: 'cursor',
    configDir: '.cursor',
    displayName: 'Cursor',
    commandPrefix: '/',
    model: '',
    configFile: '.cursorrules',
    askInstruction: '',
    frontmatterFields: ['name', 'description', 'version'],
  },
  gemini: {
    provider: 'gemini',
    configDir: '.gemini',
    displayName: 'Gemini CLI',
    commandPrefix: '/',
    model: '',
    configFile: '.gemini/settings.json',
    askInstruction: '',
    frontmatterFields: ['name', 'description', 'version'],
  },
};

module.exports = providers;
