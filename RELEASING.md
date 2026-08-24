# Releasing

The `version` in `.claude-plugin/plugin.json` is what pins an install. Claude Code
only offers an update when that string changes — push a commit without bumping it
and everyone who already installed the plugin stays on what they have. So every
user-visible change to the skill ends with a version bump, even a one-word one.

## Steps

1. **Edit** `skills/styleref/SKILL.md`, `skills/styleref-figma/SKILL.md` (or the
   manifests). Keep each frontmatter `name` equal to its directory name — CI
   fails otherwise. One version pins both skills: a change to either one is a
   release of the plugin.
2. **Bump** `version` in `.claude-plugin/plugin.json`. Semver against what the
   *agent* does: patch for wording, minor for new guidance or a new tool the
   skill knows about, major only if the skill's name or scope changes.
3. **Validate** locally, and load it once to be sure it still behaves:
   ```bash
   node scripts/validate.mjs
   claude plugin validate . --strict
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
or agents will call tools that no longer exist:

| If this changes in the app | Update here |
| --- | --- |
| MCP tool names, parameters, or scopes | `styleref`: **How to fetch a style** and **Account-scoped actions**; `styleref-figma`: **Going further** |
| REST endpoints or query parameters | `styleref`: the **How to fetch a style** REST list; `styleref-figma`: the **Lane A** steps and the **When something goes wrong** table |
| Compile formats (`default`, `flux`, `midjourney`, `diffusion`, `stylemd`, `json`) | `styleref`: the **How to apply a style per tool** table |
| The `json` format's section keys or palette shape | `styleref-figma`: **Lane A** steps 3–5 map those keys onto canvas objects |
| The gallery's category list | `styleref-figma`: the category list in **Lane A** step 1 |
| The STYLE.md convention or its frontmatter | `styleref`: the **STYLE.md convention** section |
| The style schema's section ids | `styleref-figma`: the id list in **Lane B** step 3 |

## If the skill is listed in the community marketplace

`anthropics/claude-plugins-community` pins an approved plugin to a commit SHA and
its CI bumps that pin as you push, with the public catalog syncing nightly. No
action per release; just expect a day's lag before a new version is installable
from `@claude-community`.
