# Workbench — ein modernes Skin für Roundcube

[![Packagist Version](https://img.shields.io/packagist/v/ar-sebastian/workbench)](https://packagist.org/packages/ar-sebastian/workbench)
[![Packagist Downloads](https://img.shields.io/packagist/dt/ar-sebastian/workbench)](https://packagist.org/packages/ar-sebastian/workbench)
[![License](https://img.shields.io/packagist/l/ar-sebastian/workbench)](LICENSE)

Ein von **Elastic abgeleitetes** Roundcube-Skin: dunkle Seiten-Navigation,
heller Karten-Canvas, roter Marken-Akzent (`#cc151c`), Inter-Typografie,
12-px-Radien, sichtbarer Fokus, Light **und** Dark. Nur Oberfläche — der
Roundcube-Kern bleibt unverändert. **Marken-neutral / rebrandbar**
(Akzentfarbe = Token `--wb-accent`, Logo in `images/` austauschbar).

- **Basis:** Roundcube 1.6 LTS und 1.7, Skin `elastic`
- **Prinzip:** `meta.json` → `"extends": "elastic"`; Overrides ausschließlich in
  `skins/workbench/`. Kein Eingriff in Core, Plugins oder `skins/elastic/`.

🇬🇧 English documentation: **[README.md](README.md)**

## Screenshots

| Login | Posteingang (Light) |
|---|---|
| ![Login](docs/login-light.png) | ![Posteingang hell](docs/mail-light.png) |

| Posteingang (Dark) | Nachricht lesen |
|---|---|
| ![Posteingang dunkel](docs/mail-dark.png) | ![Nachricht lesen](docs/mail-read.png) |

## Features

- **Light + Dark** über den nativen Roundcube-Toggle (Mond-Button); Tokens auf
  `html.dark-mode`.
- **Icon-only Task-Rail** mit Hover-Tooltips (und dauerhaften Labels auf breiten
  Touchscreens); eigenes Linien-Icon-Set (Lucide) statt der auffälligsten
  FontAwesome-Glyphen.
- **Initialen-Avatare** in Liste, Lesekopf und Empfänger-Chips (rein kosmetisch, JS).
- **UX-Extras** (dezent, abschaltbar durch Entfernen von `workbench.js`):
  Skeleton-Loader, Top-Progressbar, Hover-Schnellaktionen, Tastatur-Shortcuts
  mit Cheatsheet (`?`).
- **Internationalisierung:** Skin-Localization (`localization/en_US.inc` +
  `de_DE.inc`) für den Login; EN/DE-Wörterbuch in `workbench.js` und
  `watermark.html` (Sprache aus `rcmail.env.lang`). Englisch ist Default.
- **Barrierefreiheit:** sichtbarer Fokus, `aria-hidden` für dekorative Elemente,
  Cheatsheet als `aria-modal` mit Fokus-Falle und Schließen-Button, WCAG-AA-Kontrast
  für Akzent-Text im Dark-Mode.
- **Druck:** sauberes, tintensparendes Print-Stylesheet (weißer Grund, schwarze
  Schrift, kein Screen-Chrome/Avatar, Links unterstrichen).
- **RTL:** Elastic liefert das Basis-Flip; die Custom-Komponenten sind für
  `html[dir="rtl"]` gespiegelt.
- **Marken-neutral:** Akzentfarbe = Token `--wb-accent`, Logo austauschbar.

## Kompatibilität

Verifiziert auf **Roundcube 1.6 LTS und 1.7** (`min-version` 1.6.0) in
**Chromium/Chrome** und **Firefox** (Login, Mailliste, Lesen, Verfassen,
Dark-Mode). Die Icons nutzen `mask`/`-webkit-mask`, was auch WebKit/Safari abdeckt.

## Installation

**Composer** (empfohlen):

```bash
composer require ar-sebastian/workbench
```

Der `roundcube/plugin-installer` legt das Skin unter `skins/workbench/` ab.

**Manuell** (Release-Archiv):

```bash
tar xzf workbench-skin-1.2.1.tar.gz -C skins/   # ergibt skins/workbench/
```

## Aktivierung

`config/config.inc.php`: `$config['skin'] = 'workbench';` — oder pro Nutzer in den
Roundcube-Einstellungen. Danach hart neu laden.

## Build

```bash
# aus skins/workbench/
powershell -ExecutionPolicy Bypass -File build.ps1
```

Voraussetzung: Node/npm; `lessc` (less@4) + optional `less-plugin-clean-css`.
Der Build kompiliert die Elastic-Entrypoints mit `--include-path` auf diesen
Skin-Ordner — die Overrides greifen über die optionalen Elastic-Hooks
(`_variables` / `_styles`), ohne eine Elastic-Datei zu verändern.

## Rollback

Skin abwählen (Standard-Elastic aktiv) und Ordner `skins/workbench/` entfernen. Da
keine Core-/Plugin-/Elastic-Dateien verändert wurden, ist der Rückbau vollständig.

## Lizenz & Credits

CC BY-SA 3.0 (wie das Basis-Skin Elastic). Drittanbieter-Bestandteile (Elastic,
Inter, Font Awesome, Lucide-Icons) und ihre Lizenzen: **[NOTICE.md](NOTICE.md)**.
