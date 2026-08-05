#!/usr/bin/env node
// Checks the things that only break at install time: malformed manifests, a
// marketplace entry that points at a plugin name nobody ships, a skill missing
// the frontmatter agents load it by, or an MCP entry with a url and no type
// (which Claude Code reads as a stdio server and skips).
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const errors = [];
const fail = (msg) => errors.push(msg);

const json = (path) => {
  try {
    return JSON.parse(readFileSync(join(root, path), 'utf8'));
  } catch (err) {
    fail(`${path}: ${err.message}`);
    return null;
  }
};

const plugin = json('.claude-plugin/plugin.json');
const marketplace = json('.claude-plugin/marketplace.json');
const mcp = json('.mcp.json');

if (plugin) {
  for (const field of ['name', 'version', 'description']) {
    if (!plugin[field]) fail(`plugin.json: missing "${field}"`);
  }
  if (plugin.keywords && !Array.isArray(plugin.keywords)) {
    fail('plugin.json: "keywords" must be an array');
  }
}

if (marketplace) {
  if (!marketplace.name) fail('marketplace.json: missing "name"');
  if (!marketplace.owner?.name) fail('marketplace.json: missing "owner.name"');
  const entries = marketplace.plugins ?? [];
  if (entries.length === 0) fail('marketplace.json: no plugins listed');
  for (const entry of entries) {
    if (!entry.name) fail('marketplace.json: a plugin entry has no "name"');
    if (!entry.source) fail(`marketplace.json: "${entry.name}" has no "source"`);
    // A relative source must resolve inside this repo, or the install 404s.
    if (typeof entry.source === 'string' && entry.source.startsWith('./')) {
      if (!existsSync(join(root, entry.source))) {
        fail(`marketplace.json: "${entry.name}" source ${entry.source} does not exist`);
      }
    }
    // The repo root is the plugin, so the two names have to agree — users
    // install by the marketplace entry name and get the plugin's skills.
    if (entry.source === './' && plugin && entry.name !== plugin.name) {
      fail(`marketplace.json: "${entry.name}" points at the root plugin, which is named "${plugin.name}"`);
    }
  }
}

if (mcp) {
  for (const [name, server] of Object.entries(mcp.mcpServers ?? {})) {
    if (server.url && !server.type) {
      fail(`.mcp.json: "${name}" has a "url" but no "type" — Claude Code will skip it`);
    }
  }
}

const skillsDir = join(root, 'skills');
const skills = existsSync(skillsDir)
  ? readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory())
  : [];
if (skills.length === 0) fail('skills/: no skill directories found');

for (const dir of skills) {
  const path = join(skillsDir, dir.name, 'SKILL.md');
  if (!existsSync(path)) {
    fail(`skills/${dir.name}/: no SKILL.md`);
    continue;
  }
  const body = readFileSync(path, 'utf8');
  const frontmatter = body.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatter) {
    fail(`skills/${dir.name}/SKILL.md: no YAML frontmatter`);
    continue;
  }
  const fields = frontmatter[1];
  if (!/^name:\s*\S/m.test(fields)) fail(`skills/${dir.name}/SKILL.md: frontmatter has no "name"`);
  if (!/^description:\s*\S/m.test(fields)) {
    // Without a description an agent never knows when to load the skill.
    fail(`skills/${dir.name}/SKILL.md: frontmatter has no "description"`);
  }
  const name = fields.match(/^name:\s*(\S+)/m)?.[1];
  if (name && name !== dir.name) {
    fail(`skills/${dir.name}/SKILL.md: frontmatter name "${name}" does not match the directory`);
  }
}

if (errors.length) {
  for (const error of errors) console.error(`::error::${error}`);
  process.exit(1);
}
console.log(`ok: ${skills.length} skill(s), ${marketplace?.plugins?.length ?? 0} plugin entry/entries`);
