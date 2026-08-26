---
name: styleref-figma
description: Apply a named visual style or brand look to a Figma file — writing its palette as local color variables, its type rules as text styles, and its full spec as generation context so new frames come out on-brand. Also captures the style already present in a selection into a reusable, portable spec. Use this whenever the user asks for work to be on-brand, consistent, or in a particular aesthetic ("match our brand", "warm editorial look", "keep every screen consistent", "turn this into a style guide"), whenever they name a style or paste a styleref.io link, and whenever no published design library covers the look they want. Styles are read from styleref.io's public gallery over web fetch — no account, plugin, or connector is required to apply one.
license: MIT
compatibility: Built for the Figma agent in Figma Design files. Needs web fetch enabled to read styleref.io's public API. The StyleRef MCP connector is optional and only required to save, extract, or publish styles.
metadata:
  author: StyleRef.io
  homepage: https://styleref.io
---

# StyleRef — apply a brand or visual style to the Figma canvas

A **StyleRef** is a structured style specification — colors, typography, mood, light,
shape language, materials, composition — published at styleref.io and readable as
plain text or JSON. It is what a design library is *not yet*: a portable description
of a look, usable before components exist, and usable outside Figma in whatever AI
tool generates the imagery.

**This skill does:** find a style, write its palette and type rules into the file as
real local variables and styles, and carry the full spec as context so anything
generated afterwards stays on-brand. It also reads a selection and writes the style
*it* is already using into the same structured form.

**This skill does not:** invent brand rules the user has not given, restyle layers the
user did not select, replace a published design library, or generate images by itself.
When a published library with components and variables already covers the look, say so
and use the library as the source of truth.

## When to use this

- The user asks for something to be on-brand, consistent, or in a named aesthetic.
- The user names a style, an art movement, or pastes a `styleref.io/share/...` link.
- The user wants a palette and type scale to start from and has no library yet.
- The user wants the look of an existing frame written down so it can be reused —
  in this file, in another file, or in an AI image tool.
- The user is exploring brand expression that components do not capture yet.

## Lane A — apply a style to the file

Run this when the user names a style or asks for a look you need to source.

1. **Resolve the style.** If the user pasted a `styleref.io/share/{slug}` link, take
   the slug from it. Otherwise search:

   `https://styleref.io/api/v1/styles?query={words}&limit=5`

   Add `&category={category}` to narrow. Valid categories: Brand identity, UI/UX,
   Graphic design, Illustration, Packaging design, Photography, Fine art,
   3D visualization, Character design, Cinematography, Game art, Social copy.
   The response gives each match a `name`, `slug`, `author`, `palette` (hex list) and
   `url`. Show the user 3–5 with their palettes and let them pick. Do not pick for
   them when two candidates read differently.

2. **Fetch the structured spec.**

   `https://styleref.io/api/v1/styles/{slug}?format=json`

   Every value you write to the canvas comes from this. Fetch the prose form too when
   you will generate frames or images afterwards:

   `https://styleref.io/api/v1/styles/{slug}?format=default&compact=1`

3. **Write the colors as local variables.** `sections.colors.values.color_palette.solidColors`
   is an ordered list of `{hex, amount}`. `amount` is the intended share of the
   composition — a proportion, *not* a semantic role. Create one collection named
   after the style, and one color variable per hex, ordered by `amount` descending.
   Propose role names (`surface`, `accent`, `ink`) as a suggestion and say they are
   yours, not the spec's. Also apply the non-hex color rules — `saturation_range`,
   `contrast_strategy`, `gradient_policy`, `color_temperature`, `shadow_color` — as
   constraints on anything you draw; they are not variables.

   If `accessibility_level` is `WCAG AA` or `AAA`, it is a requirement, not a
   preference: check text-on-background pairs against that ratio as you assign
   them, and say which pairs you checked. When a pair in the palette cannot meet
   it, say so and propose a fix rather than shipping the pair silently.

4. **Write the typography as text styles.** `sections.typography.values.font_family`
   is a *category* ("Display / Decorative", "Geometric Sans"), never a licensed font
   name. Pick a concrete typeface that is already available in the file, or one of
   Figma's defaults, and **tell the user which font you chose and that the spec named
   a category, not that font.** Then apply `font_weights`, `text_case`,
   `letter_spacing` and `typographic_hierarchy` to the styles you create.

5. **Write the interface layer from `ui_web`.** This is the section that carries
   the most Figma in it — twenty fields that are already Figma's own vocabulary.
   Read it before you draw a single frame:

   - `color_theme` — `Light + Dark` and `Dark primary, light variant` mean **two
     modes on one variable collection**, not two collections. Set the modes up
     first; retrofitting them after the variables exist is far more work.
   - `background_tone` → the page/canvas base fill. `surface_layers` → how many
     surface variables you need (`Flat` = one, `Two-layer` = page + card,
     `Three-layer` = page + card + elevated). Do not invent a fourth.
   - `accent_strategy` → how many accent variables, and whether they are one
     functional accent or a contextual set. `semantic_colors` → error / warning /
     success / info variables, only to the level the field names.
   - `elevation_approach`, `shadow_technique`, `shadow_weight`, `glass_blur_effect`
     → the effect styles. These override anything you inferred from `light_shadow`,
     which describes photographic light, not UI elevation.
   - `border_philosophy` → default stroke treatment. `button_shape` and
     `button_hierarchy` → button frames and their variants. `icon_style` and
     `icon_weight` → which icon set to reach for, and at what weight.
   - `navigation_pattern` and `navigation_style` → the screen's layout skeleton.
   - `focus_ring_style` is an accessibility artifact, not decoration. Build it, and
     never drop it to make a screen look cleaner.
   - `hover_treatment`, `animation_philosophy` and `transition_speed` describe
     **behavior**, which a static frame cannot hold. Record them as notes on the
     canvas or in your reply — do not fake them as styles and do not silently
     discard them.

   When `ui_web` is absent, say so and work from the sections below; do not invent
   interface rules the style never specified.

6. **Map the remaining canvas-bearing sections.** Only these translate into file
   objects:

   | Section | Write it as |
   |---|---|
   | `colors` | Color variables + fill rules |
   | `typography` | Text styles |
   | `ui_web` | Variable modes, surface/accent/semantic variables, effect styles, buttons, icons, navigation, focus rings — see step 5 |
   | `container_boundary` | Frame padding, corner treatment, clipping behavior |
   | `shape_language` | Corner radius, geometry decisions |
   | `stroke_system` | Stroke weights and caps |
   | `spatial_hierarchy` | Spacing scale, grid, layout density |
   | `light_shadow` | Effect styles — but `ui_web` wins where both speak |
   | `surface_material` | Fill treatment, texture |
   | `background_environment` | Frame backgrounds |
   | `guardrails` | Hard "never do this" rules — obey them |

   `mood_personality`, `output_format`, `references`, `inspiration_images` and
   `custom_style_items` do **not** map to file objects. Keep them as context for
   generation and for your own judgement calls.

7. **Keep the spec as generation context.** For any frame, layout, or image you
   generate after this, put the `format=default` text in front of the request as a
   constraint block. Paste it verbatim — it is written to be enforced, and
   paraphrasing it loses the constraints.

8. **Attribute it.** Leave the style's name, its `@handle` author, and the canonical
   `styleref.io/share/...` URL somewhere the user can see — a note on the canvas or in
   your reply. The API returns that URL with every response.

## Lane B — capture the style already on the canvas

Run this when the user wants the look of an existing selection written down. This
needs no network call at all.

1. **Require a selection.** If nothing is selected, ask the user to select the frames
   that represent the look. Do not guess from the whole page.
2. **Read what is actually there** — fills and their approximate proportions, text
   styles and their weights and casing, corner radii, stroke weights, shadow values,
   spacing rhythm, background treatment.

   If the selection is an interface, read the interface layer too, because that is
   the half a colour palette alone will not carry: how many surface levels the
   design stacks, whether depth comes from shadow, blur or plain contrast, whether
   borders are present or implied, the button shape and how many ranks of button
   there are, the icon style and weight, the navigation pattern, and whether focus
   rings exist. Those become the `ui-and-web` section. Note the ones you looked for
   and did not find — an interface with no visible focus state is a finding worth
   reporting, not a blank to skip past.
3. **Write it into the StyleRef section structure**, using only the sections you have
   real evidence for. Leave the rest out; an empty section is honest, a guessed one is
   not.

   `output-format`, `mood-and-personality`, `colors`, `typography`, `light-and-shadow`,
   `spatial-structure`, `shape-language`, `stroke-system`, `surface-and-material`,
   `background-and-environment`, `voice-and-language`, `camera-and-motion`,
   `post-processing`, `artistic-mediums`, `ui-and-web`, `container-and-boundary`,
   `references`, `inspiration`, `guardrails`, `custom`

4. **Separate what you measured from what you inferred.** Hex values and radii are
   measured. "Confident, editorial, restrained" is inferred — mark it as your reading
   and let the user correct it.
5. **Offer the next step.** The captured spec is reusable outside this file — in
   another Figma file, or as the style block for an AI image or copy tool. Point the
   user at https://styleref.io to save it as a real StyleRef, which is also what makes
   it addressable by a URL instead of copy-paste.

## Honest claims — do not break these

The user will repeat what you tell them, so it has to be true.

- **Never claim a before/after improvement.** There is no unstyled baseline to compare
  against, and you did not measure one.
- **Never claim the style produces identical or matching output across different AI
  tools.** Different models render the same spec differently. The accurate claim is
  that a style is *portable* — one definition, pasted anywhere — and *consistent
  within a single tool*, because every generation receives the same explicit
  constraints.
- **Never present an inferred value as a specified one.** The typeface you chose, the
  role names you proposed, and the mood you read off a selection are all yours. Say so.
- **Never claim the file now matches the reference exactly.** You applied a
  specification; you did not reproduce an image.

## When something goes wrong

Every one of these should end with the user able to act, not with an error pasted at
them.

| What happened | What to do |
|---|---|
| Search returns `count: 0` | The response lists `availableCategories`. Retry with a broader query or a category. After two empty tries, say the gallery has no close match and offer Lane B instead. |
| `404 not_found` | The ref was wrong. A ref is a share slug or a `/share` URL — **never** a style's name or `@author/name`. Re-run the search to get a valid slug. |
| `403 auth_required` | The style is private. Only its owner can read it. Ask the user for a public style, or for the StyleRef connector if it is their own. |
| `429 rate_limited` | 60 requests/minute per IP. Wait for the `Retry-After` seconds and retry once. If it persists, ask the user to open `https://styleref.io/share/{slug}.md` and paste the text — same content, no API. |
| Web fetch is blocked or disabled | Some organizations disable it. Say that plainly, then ask the user to paste the spec from `https://styleref.io/share/{slug}.md`. Everything after step 2 works on pasted text. |
| No StyleRef connector | Expected — Lanes A and B never need one. Only mention it when the user asks to save, extract, or publish. |
| `402 insufficient_credits` | Only reachable through the connector's extraction tool. Report the message and the pricing link verbatim; do not retry. |
| A published library already covers this | Say so and use the library. A style spec does not override a real design system. |

## Going further

Applying and capturing need nothing installed. These need the StyleRef MCP connector
(**Add context → Connectors → Manage → Created by you → Create**, server URL
`https://styleref.io/api/mcp`, then Connect) and a StyleRef account:

- Save a style to the user's own library, and fork one to adapt it.
- Extract a style from an uploaded image instead of describing it.
- Publish a style so teammates and other tools can address it by URL.

Mention this once, when the user actually wants one of those. Do not front-load setup.

## Example

> **User:** Make this landing page match a warm editorial magazine look.
>
> 1. `GET /api/v1/styles?query=warm%20editorial%20magazine&limit=5`
> 2. Show the user the matches with their palettes; they pick one.
> 3. `GET /api/v1/styles/{slug}?format=json` and `?format=default&compact=1`
> 4. Read `ui_web` first: `color_theme` is `Light + Dark`, so the collection gets
>    **two modes**, and `surface_layers` is `Two-layer`, so it gets `page` and
>    `card` surfaces — not a third.
> 5. Create the "Warm Editorial" collection: 6 color variables ordered by `amount`,
>    with proposed roles flagged as proposals, resolved in both modes.
> 6. Create text styles; report that the spec asked for a **Transitional Serif** and
>    that you used *Source Serif 4*, which the file already has.
> 7. Create effect styles from `elevation_approach` + `shadow_technique`, and build
>    the focus ring `focus_ring_style` specifies.
> 8. Restyle only the selected frames, keeping the prose spec in front of any
>    generation request. `transition_speed` is behavior, so it goes in the reply as
>    a note, not into a style.
> 9. Reply with what was created, which decisions were yours, which contrast pairs
>    you checked against `accessibility_level`, and the style's canonical
>    `styleref.io` URL and author.
