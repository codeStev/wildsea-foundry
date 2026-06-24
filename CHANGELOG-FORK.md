# Fork Changelog — Wildsea for Foundry VTT v14

This changelog tracks **fork-specific changes** (v14 compatibility and beyond) to
"The Wildsea (Unofficial)". It is separate from the upstream `CHANGELOG.md`.

Upstream baseline: **v0.2.1** (compatibility 11–13, verified 12).
Tested against: **felddy/foundryvtt:14**.

## 0.3.1

### Added
- **German (de) localization** — full translation of all UI strings (`lang/de.json`),
  registered in `system.json`.
- **Resource tags as coloured pills.** Resource `tags` changed from a single string to an
  array of `{ label, color }`. Tags are added / removed / recoloured **inline** on the
  player, adversary, and resource-item sheets: type a tag and press **Enter** *or click
  away* to add it; click a pill to **cycle its colour** through a preset palette
  (neutral / good / bad / caution / info); click **×** to remove. Shared logic lives in
  `system/tags.js` and the `templates/shared/tags.hbs` partial.

### Migration
- Reworked `system/migrations.js` into a **versioned, idempotent** migration runner. New
  migration normalises legacy string `tags` into the array form (gated on the stored
  migration version; the legacy track-visibility migration is preserved and no longer
  re-runs on already-migrated worlds).

### Manifest
- Version bumped to `0.3.1`.

## 0.3.0 — v14 compatibility

### Manifest
- `system.json` compatibility bumped to `minimum: 12 / verified: 14 / maximum: 14`.

### Fixed (fatal on v14)
- **Chat roll messages no longer error on roll.** Removed `type: CONST.CHAT_MESSAGE_TYPES.ROLL`
  from chat message creation in `system/applications/dice_pool.js` and `system/sheets/ship.js`.
  `CONST.CHAT_MESSAGE_TYPES` was removed in v14, and `CONST.CHAT_MESSAGE_STYLES.ROLL` was *also*
  removed — a roll message is now identified by its `rolls` array, so the type field is dropped
  entirely. Also normalised both messages to use `rolls: [roll]` (the singular `roll` field is
  deprecated) and `author:` instead of the removed `user:` field.

### Removed (dead code)
- Dropped `CONFIG.TinyMCE.content_css = …` from `wildsea.js` init. TinyMCE was removed from core
  in v14 (`CONFIG.TinyMCE` is `undefined`); the editor is ProseMirror. The line was the last
  statement in `init`, so it only produced a caught console error without blocking load.

### Changed (deprecated globals → `foundry.*` namespaces; removed in v15)
- Sheet base classes now extend `foundry.appv1.sheets.{ActorSheet,ItemSheet,JournalSheet}`
  instead of the bare globals (same V1 classes, just relocated — no behaviour change).
- `wildsea.js` resolves `Actors`/`Items`/`Journal` from `foundry.documents.collections`
  and the core sheet classes from `foundry.appv1.sheets` for sheet (un)registration.
- `renderTemplate`/`loadTemplates` → `foundry.applications.handlebars.*` (5 + 1 call sites).
- `TextEditor.enrichHTML` → `foundry.applications.ux.TextEditor.implementation.enrichHTML`,
  and dropped the obsolete `async: true` option (enrichHTML is always async now).
  Note: `CONFIG.TextEditor.enrichers` is the config object, NOT the deprecated global — left as-is.
- Remaining `user:`/`game.user._id` in `actor.js` chat messages → `author:`/`game.user.id`.
- `ContextMenu`: pass the container as an `HTMLElement` (`html[0]`) and `{ jQuery: false }`,
  and rewrote the item/slim menu callbacks from jQuery (`.data('item-id')`) to native DOM
  (`.dataset.itemId`). Also namespaced the class itself:
  `ContextMenu` → `foundry.applications.ux.ContextMenu.implementation`.
  Menu entry keys migrated to the v14 ContextMenuEntry API: `name` → `label`, and
  `callback` → `onClick`. NOTE the argument order is swapped (confirmed in core
  `client/applications/ux/context-menu.mjs`): old `callback(target, event)` vs new
  `onClick(event, target)` — so handlers are `(_event, element) => …`. (Old keys
  deprecated in v14, removed v16.)

### Fixed (feature broken by v13 SceneControls rework)
- Dice-pool toolbar button restored. v13 rebuilt SceneControls as ApplicationV2; the old
  `renderSceneControls` jQuery injection into `.main-controls` silently no-op'd. Replaced with
  the data-driven `getSceneControlButtons` hook (confirmed against core
  `client/applications/ui/scene-controls.mjs` + `hooks.mjs`), adding a `button: true` tool to
  the Token controls whose `onChange` toggles the dice pool.

### Deferred to a future 0.4.0 (V1 Application framework — removed in v16, not v14)
- `WildseaDicePool extends FormApplication`, `WildseaTrackPanel extends Application`,
  `new Dialog(...)` and all `getData`/`activateListeners`/jQuery sheets still use the V1
  framework. Works through v15; requires an ApplicationV2 rewrite before v16.

### Notes / not changed
- Active Effects: system already ran with `CONFIG.ActiveEffect.legacyTransferral = false`
  (now the v14 default), so no AE data migration is anticipated.
- Data model unchanged (`template.json`), so existing actor/item data should load without a
  migration script. Flag here if that changes.
