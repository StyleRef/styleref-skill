# StyleRef Agent Skill

An [Agent Skill](https://agentskills.io) that teaches any AI agent *when* to fetch
a [StyleRef](https://styleref.io) style and *how* to apply it per tool — ChatGPT,
Claude, Gemini, Midjourney, FLUX, Stable Diffusion, or a repo's `STYLE.md`.

A StyleRef is a structured, portable style specification — colors, typography,
mood, voice, composition, lighting, and more — compiled into a text block that
any AI tool follows as a hard constraint. Public gallery styles need no login.

The skill is the instruction layer; the
[StyleRef MCP server](https://styleref.io/mcp) is the data layer. This repository
ships both together as a Claude Code plugin, so one install gets you the skill
**and** the MCP server, already wired up.

## Install

### Claude Code (skill + MCP server)

```
/plugin marketplace add StyleRef/styleref-skill
```

```
/plugin install styleref@styleref
```

The plugin adds the `styleref` skill and connects the StyleRef MCP server at
`https://styleref.io/api/mcp`. Reading public styles is anonymous; saving,
forking, extracting, and publishing prompt you to connect your account.

### Claude Cowork, Claude.ai, Claude Desktop

These surfaces take the **skill** from the plugin but not the MCP server it
bundles, so add StyleRef as a **connector** in the client's settings, pointing
at `https://styleref.io/api/mcp`. Without it the agent knows how to apply a
style and has no way to fetch one.

### Any other agent (skill only)

The skill is a plain `SKILL.md` folder, so it works in any skills-compatible
agent — Cursor, Codex, Gemini CLI, Copilot, opencode, Goose, and others. Copy
`skills/styleref/` into the agent's skills directory:

```bash
git clone https://github.com/StyleRef/styleref-skill.git
```

```bash
cp -R styleref-skill/skills/styleref ~/.claude/skills/styleref
```

Use `.claude/skills/` instead of `~/.claude/skills/` to scope it to one project,
or the equivalent skills directory for your agent. Then connect the MCP server
separately:

```bash
claude mcp add --transport http styleref https://styleref.io/api/mcp
```

The skill also works without MCP — it falls back to the public REST API at
`https://styleref.io/api/v1`, which needs no setup.

## What's in here

| Path | What it is |
| --- | --- |
| `skills/styleref/SKILL.md` | The skill itself — the only file you need for a manual install |
| `.mcp.json` | The StyleRef MCP server, connected when the plugin is enabled |
| `.claude-plugin/plugin.json` | Plugin manifest |
| `.claude-plugin/marketplace.json` | Marketplace catalog, so this repo installs directly |

## Documentation

- [Agent Skill](https://docs.styleref.io/for-ai-agents/agent-skill) — what the skill teaches, and when to prefer it
- [MCP tools reference](https://docs.styleref.io/for-ai-agents/mcp/tools-reference) — the tools the skill calls
- [REST API](https://docs.styleref.io/for-ai-agents/rest-api/overview-and-authentication) — the no-setup fallback
- [STYLE.md](https://docs.styleref.io/style-md/format-reference) — the open format the skill writes into repos

## License

MIT
