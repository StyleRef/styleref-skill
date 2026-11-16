# Releasing

The `version` in `.claude-plugin/plugin.json` is what pins an install. Claude Code
only offers an update when that string changes — push a commit without bumping it
and everyone who already installed the plugin stays on what they have. So every
user-visible change to the skill ends with a version bump, even a one-word one.

## Steps

1. **Edit** `skills/styleref/SKILL.md` (or the manifests). Keep each frontmatter
   `name` equal to its directory name — CI fails otherwise. Add only Markdown,
   text, JSON, YAML or image files, in the standard plugin layout
   (`.claude-plugin/`, `skills/`, `.mcp.json`, README, LICENSE, `.github/`):
   the Claude directory refuses any version that ships a script or other file
   type from an unverified organization. That is what refused v0.3.0 and v0.3.1
   (`scripts/validate.mjs`), so the validator lives inside the CI workflow.
   The Figma agent's skill lives in
   [StyleRef/styleref-figma-skill](https://github.com/StyleRef/styleref-figma-skill).
2. **Bump** `version` in `.claude-plugin/plugin.json`. Semver against what the
   *agent* does: patch for wording, minor for new guidance or a new tool the
   skill knows about, major only if the skill's name or scope changes.
3. **Validate** locally (`--strict` would fail on `privacyPolicyUrl`: the
   directory asks for it, the CLI doesn't know it yet), and load it once to be sure it still behaves:
   ```bash
   sed -n '/<<.JS.$/,/^ *JS$/p' .github/workflows/ci.yml | sed '1d;$d' | node --input-type=module
   claude plugin validate .
   claude --plugin-dir .
   ```
4. **Commit and push** here, in this repository. Nothing is published until this
   push lands — the monorepo stores only a pointer. When this repo is checked
   out as the monorepo's submodule it sits on a **detached HEAD**, so
   `git push origin main` silently pushes a stale local ref instead of your
   work. Push explicitly:
   ```bash
   git push origin HEAD:main
   ```
5. **Tag** the release. `claude plugin tag` uses the `{name}--v{version}`
   convention and refuses to tag when `plugin.json` and the marketplace entry
   disagree, which is the mistake a hand-written tag hides:
   ```bash
   claude plugin tag . --push -m "styleref %s"
   ```
6. **Bump the pointer** in the StyleRef monorepo, where this repo is the
   `agent-skill/` submodule:
   ```bash
   git -C /path/to/StyleRef add agent-skill
   git -C /path/to/StyleRef commit -m "chore(skill): bump agent-skill pointer"
   ```
7. **Update the public docs** if what the skill teaches changed:
   `apps/docs/content/for-ai-agents/agent-skill.mdx`, plus a changelog entry
   under `apps/docs/content/updates/changelog.mdx` if users gain something. The
   docs site deploys only from the monorepo's `main`.

## What has to stay in sync

The skill names MCP tools, REST endpoints, and compile formats. When those change
in the app, this file's step 7 is not enough — the SKILL.md body has to move too,
or agents will call tools that no longer exist. The Figma skill has its own table
in its repo's RELEASING.md.

| If this changes in the app | Update here |
| --- | --- |
| MCP tool names, parameters, or scopes | `styleref`: **How to fetch a style** and **Account-scoped actions** |
| REST endpoints or query parameters | `styleref`: the **How to fetch a style** REST list |
| Compile formats (`default`, `flux`, `midjourney`, `diffusion`, `stylemd`, `json`) | `styleref`: the **How to apply a style per tool** table |
| The STYLE.md convention or its frontmatter | `styleref`: the **STYLE.md convention** section |

## If the skill is listed in the community marketplace

`anthropics/claude-plugins-community` pins an approved plugin to a commit SHA and
its CI bumps that pin as you push, with the public catalog syncing nightly. No
action per release; just expect a day's lag before a new version is installable
from `@claude-community`.
