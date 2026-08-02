# Workbench — a modern skin for Roundcube

[![Packagist Version](https://img.shields.io/packagist/v/ar-sebastian/workbench)](https://packagist.org/packages/ar-sebastian/workbench)
[![Packagist Downloads](https://img.shields.io/packagist/dt/ar-sebastian/workbench)](https://packagist.org/packages/ar-sebastian/workbench)
[![License](https://img.shields.io/packagist/l/ar-sebastian/workbench)](LICENSE)

A third-party Roundcube skin **derived from Elastic**: a dark navigation rail, a
light card canvas, a red brand accent (`#cc151c`), Inter typography, 12&nbsp;px
radii, visible keyboard focus, and both **light and dark** modes. Surface only —
the Roundcube core stays untouched. **Brand-neutral / rebrandable** (accent =
the `--wb-accent` token, logo files in `images/` are replaceable).

- **Base:** Roundcube 1.6 LTS and 1.7, skin `elastic`
- **Principle:** `meta.json` → `"extends": "elastic"`; all overrides live in
  `skins/workbench/` only. No changes to the core, plugins, or `skins/elastic/`.

🇩🇪 Eine deutsche Fassung dieser Dokumentation: **[README.de.md](README.de.md)**

## Screenshots

| Login | Inbox (light) |
|---|---|
| ![Login](docs/login-light.png) | ![Inbox light](docs/mail-light.png) |

| Inbox (dark) | Reading a message |
|---|---|
| ![Inbox dark](docs/mail-dark.png) | ![Reading a message](docs/mail-read.png) |

## Features

- **Light + dark** via Roundcube's native toggle (moon button); tokens on
  `html.dark-mode`.
- **Icon-only task rail** with hover tooltips (and persistent labels on wide
  touchscreens); a dedicated line-icon set (Lucide) replaces the most prominent
  FontAwesome glyphs.
- **Initials avatars** in the list, reading header and recipient chips
  (cosmetic, JS only).
- **UX extras** (subtle, removable by deleting `workbench.js`): skeleton loader,
  top progress bar, hover quick-actions, keyboard shortcuts with a cheat sheet
  (`?`).
- **Internationalization:** skin localization (`localization/en_US.inc` +
  `de_DE.inc`, `meta.json` → `"localization": true`) for the login; an EN/DE
  dictionary in `workbench.js` and `watermark.html` keyed off `rcmail.env.lang`.
  **English is the default.**
- **Accessibility:** visible focus everywhere, `aria-hidden` on decorative
  elements, the cheat sheet is an `aria-modal` dialog with focus trapping and a
  close button, and dark-mode accent text meets WCAG AA contrast.
- **Print:** a clean, ink-saving print stylesheet (white background, black text,
  no screen chrome or avatars, underlined links).
- **RTL:** Elastic provides the base flip; the custom components (avatars,
  quick-actions, rail tooltip, active marker, reading-header avatar) are mirrored
  for `html[dir="rtl"]`.
- **Brand-neutral:** accent = the `--wb-accent` token, logo replaceable in
  `images/`. No product or vendor names.

## Compatibility

Verified on **Roundcube 1.6 LTS and 1.7** (`min-version` 1.6.0) in
**Chromium/Chrome** and **Firefox** (login, message list, reading, composing,
dark mode — custom icons via CSS mask, the Inter webfont and avatars render
identically). The icons use `mask` / `-webkit-mask`, which also covers
WebKit/Safari.

> Deployment note: Firefox only applies stylesheets served with the correct
> `Content-Type: text/css` (strict MIME checking). Regular Apache/nginx setups do
> this automatically; the MIME type can only be mangled by a Roundcube router that
> pipes *all* requests through PHP.

## Installation

### Composer (recommended)

```bash
composer require ar-sebastian/workbench
```

The `roundcube/plugin-installer` places the skin at `skins/workbench/` and can
activate it interactively.

### Manual (release archive)

```bash
tar xzf workbench-skin-1.2.1.tar.gz -C skins/   # results in skins/workbench/
```

Releases: <https://github.com/AR-Sebastian/roundcube-skin-workbench/releases>

## Activation

In `config/config.inc.php`: `$config['skin'] = 'workbench';` — or per user in the
Roundcube settings. Then hard-reload (assets are versioned with `?s=`).

## Dark mode

Roundcube has a **native** dark toggle (the moon button in the task menu) that
sets `html.dark-mode` (cookie `colorMode`). The skin puts its dark tokens on
`html.dark-mode` **and** on `html[data-wb-theme="dark"]`, so it reuses the
existing, working toggle rather than a fragile custom one.

## Layout

```
skins/workbench/
  meta.json          extends: elastic, dark_mode_support
  styles/
    _tokens.css      design tokens (--wb-*), light + dark
    _map.less        Elastic LESS variables  <=  Workbench tokens
    _variables.less  hook -> @import "_map" (Elastic optional-variables hook)
    _styles.less     hook -> tokens inline + @import "workbench"
    workbench.less   component overrides (nav/shell/list/login/states/a11y/print)
    icons.less       Lucide line-icon set as CSS mask + currentColor; generated
                     by tools/genicons.js (do not edit by hand)
    styles.css       compiled (loaded by Roundcube)
    styles.min.css   minified
    print.css        palette remap for printing
    embed.css        palette remap for message/editor content
  fonts/             Inter 400/500/600/700 (self-hosted) + FontAwesome (from Elastic)
  images/            logo.svg, logo-dark.svg, favicon.svg + OAuth icons
  watermark.html     custom empty state for the reading pane
  workbench.js       skin JS (cosmetic/UX): initials avatars, skeleton loader,
                     top progress bar, hover quick-actions, keyboard shortcuts + cheat sheet
  tools/genicons.js  generator for styles/icons.less
  localization/      skin labels (en_US.inc default, de_DE.inc) for the login
  templates/
    login.html       override: two-column hero + card
    includes/
      layout.html    override: identical to Elastic + loads /workbench.js (one line)
```

## Build

Compile the **Elastic entrypoints** with `--include-path` pointing at this skin
folder. That lets the official Elastic hooks (`_variables` / `_styles`) pick up the
overrides **without** modifying any Elastic file.

```bash
# from skins/workbench/
powershell -ExecutionPolicy Bypass -File build.ps1
```

Manual (core of the build):

```bash
lessc --include-path=skins/workbench/styles skins/elastic/styles/styles.less skins/workbench/styles/styles.css
lessc --include-path=skins/workbench/styles --clean-css skins/elastic/styles/styles.less skins/workbench/styles/styles.min.css
lessc --include-path=skins/workbench/styles skins/elastic/styles/print.less skins/workbench/styles/print.css
lessc --include-path=skins/workbench/styles skins/elastic/styles/embed.less skins/workbench/styles/embed.css
```

Requires Node/npm; `lessc` (less@4) + optional `less-plugin-clean-css`.

## Rollback

Deselect the skin (stock Elastic becomes active again) and remove the
`skins/workbench/` folder. Since no core/plugin/Elastic files were modified, the
removal is complete and side-effect-free.

## License & credits

The skin is licensed **CC BY-SA 3.0** (same as the Elastic base skin). Third-party
components (Elastic, Inter, Font Awesome, Lucide icons) and their licenses are
listed in **[NOTICE.md](NOTICE.md)**.
