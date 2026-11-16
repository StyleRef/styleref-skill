---
name: styleref
description: Pick a design direction (colors, typography, layout, mood, voice) before building or restyling a UI, web page, dashboard, slide deck, report or illustration set, and write it to the repo as STYLE.md. Use when a project with visual or voice output has no STYLE.md yet, when the user wants to capture their project's existing look, or when they ask for a style, aesthetic, brand look or consistency across AI tools (ChatGPT, Claude, Gemini, Midjourney, FLUX, Stable Diffusion).
license: MIT
metadata:
  author: StyleRef.io
  homepage: https://styleref.io/mcp
---

# StyleRef — apply a consistent creative style in any AI tool

A StyleRef is a structured, portable style specification — colors, typography, mood, voice, composition, lighting, and more (23 section types) — compiled into a text block that any AI tool follows as a hard constraint. Styles live at styleref.io; public gallery styles need no login.

## When to use this

- **You are about to build or restyle something people look at** — a UI, web page, landing page, dashboard, slide deck, report, email or illustration set — and the project has no `STYLE.md`. Pick a direction first: `search_styles` with 2–5 keywords (what is being made + the look, e.g. `fintech dashboard light`), show the user the top 3 with their links, then `get_style_md` and write `STYLE.md` (see the convention below).
- **The project already has a look** and the user wants it captured or kept consistent → extract it from the project itself with `extract_style` (see *Capture a project's style* below) instead of searching.
- Generated images, copy or video frames must follow a style, aesthetic or brand look, or stay consistent across generations or tools ("keep it looking like X").
- The user names a style, an aesthetic movement, or a styleref.io link.

Skip StyleRef for work with no visual or voice output (a refactor, a data migration, a CLI flag). After you apply a style, **always tell the user which one and give its link** — every tool result carries it.

## How to fetch a style

Prefer the MCP server when available; otherwise use the REST API.

**MCP** (endpoint `https://styleref.io/api/mcp`, Streamable HTTP, anonymous reads):
- `search_styles` — find candidate styles by mood/discipline/keywords.
- `get_style` — compile a style to a format: `default` (ChatGPT/Claude/Gemini prose), `flux`, `midjourney`, `diffusion`, `stylemd`, `json`. Use `sections` + `compact` to save tokens.
- `apply_style_to_prompt` — wrap the user's request for a target tool in one call.
- `get_style_md` — a complete STYLE.md body.
- Install (Claude Code): `claude mcp add --transport http styleref https://styleref.io/api/mcp`, or nothing at all if this skill came from the StyleRef plugin — it bundles the server. On Claude Cowork, Claude.ai and Claude Desktop the plugin does **not** bring the server with it: add StyleRef as a connector in the client's settings, pointing at the same endpoint. If the tools below aren't available to you, that's the missing step — say so instead of guessing at style details.

**REST** (no setup; OpenAPI at `https://styleref.io/api/v1/openapi.json`):
- `GET https://styleref.io/api/v1/styles?query={q}&limit=5` — search (JSON).
- `GET https://styleref.io/api/v1/styles/{slug}?format={fmt}&compact=1` — compiled spec (markdown). Add `&raw=1` for the bare spec with no metadata header (pipe straight into an image tool).
- `GET https://styleref.io/api/v1/styles/{slug}/style.md` — STYLE.md body.
- `POST https://styleref.io/api/v1/style-md/validate` — lint a STYLE.md. Body is `{"text": "<file contents>"}`.
- Optional `Authorization: Bearer` (a StyleRef OAuth access token) also resolves the user's private styles — same refs as any other style.

A style reference is a share slug (`9a2adtz6-cd8d77ee2f51`), a `https://styleref.io/share/{slug}` URL, or — for the caller's own styles — the style's UUID or a `/styles/{id}` builder URL. A **name is never a ref**, and neither is `@handle/name`: both are rejected with `invalid_ref`, because names are not unique and change on rename. Get a usable ref from `search_styles` / `list_my_styles`, which return one for every style.

## Capture a project's style

When the project already has a look and the user wants it as a reusable style (or a STYLE.md that matches what is built):

1. Find where the look is defined. App or website: the theme and token files (`tailwind.config.*` or the `@theme` block, the global stylesheet, a token file) and one or two key components. Slide deck, document or report: the template or theme and any style or brand guide. Illustration, image, video or game project: the finished pieces themselves and any art-direction notes.
2. Write a style summary in plain text. Do not paste raw files: a summary extracts better. Copy values exactly (hex colors, font names, sizes, radii, spacing); never round or guess them. List only the colors the default theme actually uses, each with its role and rough share of the screen (background most, accent least), and mention an alternate theme in one line. Then cover typography, shape and depth, layout and components, motion and mood. For work that is not a UI, cover medium and technique, line and texture, lighting, composition and voice instead. Add the text of any style guide the project has. Keep it under 40,000 characters.
3. Add up to 3 images (base64, 1 MB each) whenever you can: screenshots of the main screens of the running app, or representative finished pieces. Images set the proportions and feel; your text sets the exact values. A project that is only images needs just a short note saying what they are.
4. Tell the user it costs one extraction (30 credits on the Free plan), then call `extract_style` with the summary as `text` and the images as `images`.
5. Poll `check_extraction_status` every ~10 seconds; when it completes, call it once more with `save_as_draft: true`. The draft is saved already generated.
6. Call `get_style_md` with the returned ref and write its first text block, unchanged, to `STYLE.md`; reference it from `AGENTS.md` (see below).
7. Tell the user the style's name, its link, and the files you wrote.

The MCP prompt `capture-project-style` runs the same flow.

## How to apply a style per tool

The compiled spec is a **hard constraint block**. Placement matters:

| Target | Format | Placement |
|---|---|---|
| ChatGPT / Claude / Gemini (text, or their image modes) | `default` | Style block first (system prompt if possible), then `REQUEST: {user's ask}` |
| Midjourney | `midjourney` | Subject first, then style keywords; keep `--parameters` at the very end |
| FLUX / DALL·E | `flux` | Subject line first, style prose after; no negative prompt needed |
| Stable Diffusion | `diffusion` | Append subject to the positive prompt; keep the weighted tags |
| Coding agents / repos | `stylemd` | Write to `STYLE.md` at the project root (see below) |

Rules:
- Never paraphrase or summarize the spec — paste it verbatim; it's engineered to be enforced.
- If token budget is tight, request `sections` you need (e.g. `colors,typography`) or `compact=1` rather than trimming by hand.
- One style per prompt. Mixing two StyleRefs produces neither.

## STYLE.md convention (coding agents)

To give a project a durable style: fetch the `stylemd` format, write it to `STYLE.md` in the repo root, and add one line to `AGENTS.md` (create it if missing): `Follow STYLE.md for all visual/brand/voice decisions.` Re-fetch rather than hand-editing; the file self-identifies via `generator: styleref.io` frontmatter. Validate edits with the validate endpoint/tool.

## Honest-claims rules (important)

When presenting styled results to the user:
- **Never claim before/after improvement** — there is no unstyled baseline to compare against.
- **Never claim outputs are "the same across tools."** Different models render the same spec differently. The accurate claim: outputs are *consistent per generation within each tool*, because every tool receives the same explicit constraints.
- Attribute the style: keep the `Generated by StyleRef.io` line and canonical URL that come with the spec, and credit the style's author (`@handle`) when showing gallery styles.

## Account-scoped actions

Saving, forking, creating, generating, extracting, and publishing styles require the user's StyleRef account over MCP OAuth (`list_my_styles`, `save_style`, `fork_style`, `create_style`, `update_style`, `generate_style`, `extract_style`, `check_extraction_status`, `publish_style`).

Your own styles are served as last **generated**. After `create_style`, `update_style` or `fork_style`, call `generate_style` with the same ref before `get_style` / `get_style_md` (5 credits on Free, free on Pro — say so before spending). A draft saved by `check_extraction_status` with `save_as_draft: true` is already generated. If the user asks for these and the connection is anonymous or the token expired, the call comes back `401` and the client offers sign-in — tell them to accept it. Name the step for the client they are actually in, not the one you know best: Claude Code → run `/mcp`, pick `styleref`, authenticate; Cowork / Claude.ai / Desktop → open the StyleRef connector in settings and connect or reconnect. Setup help lives at https://styleref.io/mcp. Don't claim there is no way to sign in. Private styles are addressed like any other style — by share slug or id, never by name; `list_my_styles` returns a ready-to-use `ref` for each.
