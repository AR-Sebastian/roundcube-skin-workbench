/**
 * WP-911 — Generator fuer das eigene Linien-Icon-Set (Lucide-Stil).
 * Erzeugt styles/icons.less: inline-SVG (URL-kodiert) als CSS-Maske + currentColor,
 * ersetzt die sichtbarsten FontAwesome-Glyphen von Elastic. Self-contained.
 *
 * Aufruf:  node tools/genicons.js
 */
const fs = require("fs");
const path = require("path");
// Portabel: relativ zum Skript (…/skins/workbench/tools/ -> …/styles/icons.less)
const OUT = path.join(__dirname, "..", "styles", "icons.less");

function svg(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}
function enc(inner) {
  return encodeURIComponent(svg(inner))
    .replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29");
}

const icons = {
  compose:   `<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>`,
  mail:      `<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>`,
  contacts:  `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  settings:  `<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>`,
  logout:    `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>`,
  moon:      `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>`,
  sun:       `<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>`,
  info:      `<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>`,
  inbox:     `<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>`,
  send:      `<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>`,
  file:      `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>`,
  shield:    `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>`,
  trash:     `<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>`,
  archive:   `<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>`,
  reply:     `<polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>`,
  replyall:  `<polyline points="7 17 2 12 7 7"/><polyline points="12 17 7 12 12 7"/><path d="M22 18v-2a4 4 0 0 0-4-4H7"/>`,
  forward:   `<polyline points="15 17 20 12 15 7"/><path d="M4 18v-2a4 4 0 0 1 4-4h12"/>`,
  print:     `<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>`,
  more:      `<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>`,
  refresh:   `<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>`,
  search:    `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`,
  check:     `<path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>`,
  filter:    `<path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/>`,
  tag:       `<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".9" fill="black" stroke="black"/>`,
  chevL:     `<path d="m15 18-6-6 6-6"/>`,
  chevR:     `<path d="m9 18 6-6-6-6"/>`,
  chevsL:    `<path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/>`,
  chevsR:    `<path d="m13 17 5-5-5-5"/><path d="m6 17 5-5-5-5"/>`,
  menu:      `<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>`,
  arrowL:    `<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>`,
};

// mode: 'stack' (Icon ueber Label), 'inline' (links neben Text), 'bare' (icon-only)
function rule(sel, key, size, mode) {
  size = size || "22px"; mode = mode || "inline";
  let extra;
  if (mode === "stack")     extra = "\n    display: block !important;\n    float: none !important;\n    margin: 0 auto 2px !important;";
  else if (mode === "bare") extra = "\n    display: inline-block !important;\n    float: none !important;\n    vertical-align: middle;\n    margin: 0 !important;";
  else                      extra = "\n    display: inline-block !important;\n    float: none !important;\n    vertical-align: middle;\n    margin: 0 .55rem 0 0 !important;";
  return `${sel} {\n    .wb-ico(~'url("data:image/svg+xml,${enc(icons[key])}")', ${size});${extra}\n}`;
}

const out = `/**
 * WP-911 — Eigenes Linien-Icon-Set (Lucide-Stil). GENERIERT via tools/genicons.js
 * — NICHT von Hand editieren. Inline-SVG als CSS-Maske + currentColor.
 */
.wb-ico(@url, @size: 22px) {
    content: "" !important;
    width: @size !important;
    height: @size !important;
    background-color: currentColor;
    -webkit-mask: @url center / contain no-repeat;
    mask: @url center / contain no-repeat;
    -webkit-mask-size: contain;
    mask-size: contain;
    font-family: inherit !important;
    line-height: 1;
}

// Taskmenu (Icon ueber Label; #taskmenu schlaegt Elastics "#taskmenu a:before")
${rule("#taskmenu a.compose:before,\n.menu a.compose:before","compose","22px","stack")}
${rule("#taskmenu a.mail:before,\n.menu a.mail:before","mail","22px","stack")}
${rule("#taskmenu a.contacts:before,\n.menu a.contacts:before","contacts","22px","stack")}
${rule("#taskmenu a.settings:before,\n.menu a.settings:before","settings","22px","stack")}
${rule("#taskmenu a.logout:before,\n.menu a.logout:before","logout","22px","stack")}
${rule("#taskmenu a.theme.dark:before,\n.menu a.theme.dark:before","moon","22px","stack")}
${rule("#taskmenu a.theme.light:before,\n.menu a.theme.light:before","sun","22px","stack")}
${rule("#taskmenu a.about:before,\n.menu a.about:before","info","22px","stack")}

// Ordner (inline)
${rule(".folderlist li.inbox > a:before","inbox","20px","inline")}
${rule(".folderlist li.sent a:before","send","20px","inline")}
${rule(".folderlist li.drafts a:before","file","20px","inline")}
${rule(".folderlist li.junk a:before","shield","20px","inline")}
${rule(".folderlist li.trash a:before","trash","20px","inline")}
${rule(".folderlist li.archive > a:before","archive","20px","inline")}

// Nachrichten-Toolbar (Icon ueber Label)
${rule("a.reply:before","reply","22px","stack")}
${rule("a.reply-all:before","replyall","22px","stack")}
${rule("a.forward:before","forward","22px","stack")}
${rule("a.delete:before","trash","22px","stack")}
${rule("a.print:before","print","22px","stack")}
${rule("a.more:before","more","22px","stack")}

// Plugin-Toolbar-Buttons (archive, markasjunk) — konsistent zum Set
${rule("a.archive:before","archive","22px","stack")}
${rule("a.junk:before","shield","22px","stack")}

// Filter (managesieve) im Einstellungs-Menu
${rule(".listing.iconized li.filter > a:before","filter","20px","inline")}

// Listen-Toolbar (Aktualisieren/Auswahl/Optionen/Markieren)
${rule(".menu a.refresh:before","refresh","22px","stack")}
${rule(".menu a.select:before","check","22px","stack")}
${rule(".menu a.options:before","filter","22px","stack")}
${rule(".menu a.markmessage:before","tag","22px","stack")}

// Pagination (icon-only)
${rule(".menu a.firstpage:before","chevsL","18px","bare")}
${rule(".menu a.prevpage:before","chevL","18px","bare")}
${rule(".menu a.nextpage:before","chevR","18px","bare")}
${rule(".menu a.lastpage:before","chevsR","18px","bare")}

// Mobile: Menue / Zurueck
${rule("a.button.icon.toolbar-list-button:before,\na.button.icon.task-menu-button:before,\na.button.icon.sidebar-menu:before","menu","22px","bare")}
${rule("a.button.icon.back-list-button:before,\na.button.icon.back-sidebar-button:before,\na.button.icon.back-content-button:before","arrowL","22px","bare")}

// Suche (Lupe in der Suchleiste)
.searchbar form:before {
    .wb-ico(~'url("data:image/svg+xml,${enc(icons.search)}")', 18px);
    display: inline-block !important;
    vertical-align: middle;
    opacity: .75;
}
`;

fs.writeFileSync(OUT, out);
console.log("icons.less geschrieben: " + out.length + " chars");
