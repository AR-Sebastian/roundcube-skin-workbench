/**
 * WP-911 — Workbench Skin-JS (rein kosmetisch).
 * Fuegt der Nachrichtenliste Absender-Avatare mit Initialen + deterministischer
 * Farbe hinzu (moderne Mail-App-Optik). Kein Eingriff in Roundcube-Logik:
 * beobachtet nur das DOM der Liste via MutationObserver.
 */
(function () {
  "use strict";

  function initials(name) {
    name = (name || "").replace(/["']/g, "").trim();
    if (!name) return "?";
    if (name.indexOf("@") > -1 && name.indexOf(" ") === -1) return name.slice(0, 2).toUpperCase();
    var p = name.split(/\s+/).filter(Boolean);
    if (p.length >= 2) return (p[0][0] + p[p.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  function hue(seed) {
    var h = 0;
    for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
    return h;
  }

  function decorate(row) {
    if (!row || row.nodeType !== 1) return;
    if (row.querySelector && row.querySelector(".wb-avatar")) return;
    var subj = row.querySelector && row.querySelector("td.subject");
    if (!subj) return;
    var adr = row.querySelector(".fromto .rcmContactAddress, .fromto .adr, .fromto");
    var name = adr ? (adr.textContent || adr.getAttribute("title") || "") : "";
    var seed = (adr && adr.getAttribute && adr.getAttribute("title")) || name || "x";
    var av = document.createElement("span");
    av.className = "wb-avatar";
    av.setAttribute("aria-hidden", "true");
    av.textContent = initials(name);
    av.style.setProperty("--wb-av", "hsl(" + hue(seed) + " 42% 46%)");
    subj.insertBefore(av, subj.firstChild);
    addRowActions(row);
  }

  function decorateAll() {
    var rows = document.querySelectorAll(".messagelist tbody tr.message");
    for (var i = 0; i < rows.length; i++) decorate(rows[i]);
  }

  // Lesebereich-Kopf: Platzhalter-Foto durch grossen Initialen-Avatar ersetzen
  function decorateHeader() {
    var img = document.querySelector("#message-header img.contactphoto");
    if (!img) return;
    if (document.querySelector("#message-header .wb-avatar-lg")) return;
    var src = img.getAttribute("src") || "";
    if (!/contactpic|contactgroup/.test(src)) return; // echtes Foto behalten
    var adr = document.querySelector("#message-header .header-summary .rcmContactAddress")
           || document.querySelector("#message-header .adr a");
    var name = adr ? (adr.textContent || adr.getAttribute("title") || "") : "";
    var seed = (adr && adr.getAttribute && adr.getAttribute("title")) || name || "x";
    var av = document.createElement("span");
    av.className = "wb-avatar wb-avatar-lg";
    av.setAttribute("aria-hidden", "true");
    av.textContent = initials(name);
    av.style.setProperty("--wb-av", "hsl(" + hue(seed) + " 42% 46%)");
    img.parentNode.insertBefore(av, img);
    img.style.display = "none";
  }

  // Empfaenger-Chips (Verfassen) mit kleinem Initialen-Avatar
  function decorateRecipients() {
    var chips = document.querySelectorAll("ul.recipient-input li.recipient");
    for (var i = 0; i < chips.length; i++) {
      var li = chips[i];
      if (li.querySelector(".wb-chip-av")) continue;
      var txt = (li.textContent || "").replace(/[,;]\s*$/, "").trim();
      if (!txt) continue;
      var av = document.createElement("span");
      av.className = "wb-chip-av";
      av.setAttribute("aria-hidden", "true");
      av.textContent = initials(txt);
      av.style.setProperty("--wb-av", "hsl(" + hue(txt) + " 42% 46%)");
      li.insertBefore(av, li.firstChild);
    }
  }

  // Skeleton-Loader fuer die Nachrichtenliste (statt Spinner)
  function skelHost() {
    var t = document.getElementById("messagelist");
    if (!t) return null;
    return t.closest(".scroller") || t.parentNode;
  }
  function showSkeleton() {
    var host = skelHost();
    if (!host || host.querySelector(".wb-skeleton")) return;
    host.classList.add("wb-skel-host");
    var sk = document.createElement("div");
    sk.className = "wb-skeleton";
    var html = "";
    for (var i = 0; i < 8; i++) {
      html += '<div class="wb-sk-row"><span class="wb-sk-av"></span>' +
              '<span class="wb-sk-lines"><span class="wb-sk-l1"></span><span class="wb-sk-l2"></span></span></div>';
    }
    sk.innerHTML = html;
    host.appendChild(sk);
  }
  function hideSkeleton() {
    var n = document.querySelectorAll(".wb-skeleton");
    for (var i = 0; i < n.length; i++) n[i].parentNode.removeChild(n[i]);
  }

  // ---- Hover-Schnellaktionen je Zeile (Archiv/Loeschen/Gelesen) ----
  var MINI = {
    archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>',
    trash:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    read:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
  };
  function rowUid(row) {
    var a = row.querySelector('td.subject a[href*="_uid="]');
    var m = a && /[?&]_uid=(\d+)/.exec(a.getAttribute("href") || "");
    return m ? m[1] : null;
  }
  function runRowAction(row, cmd, arg, ev) {
    if (ev) { ev.stopPropagation(); ev.preventDefault(); }
    try {
      var uid = rowUid(row);
      if (window.rcmail && rcmail.message_list && uid != null) rcmail.message_list.select(uid);
      if (window.rcmail) rcmail.command(cmd, arg);
    } catch (e) {}
  }
  function addRowActions(row) {
    if (!row || row.querySelector(".wb-row-actions")) return;
    var subj = row.querySelector("td.subject");
    if (!subj) return;
    var box = document.createElement("span");
    box.className = "wb-row-actions";
    [["read", "Als gelesen markieren", "mark", "read"],
     ["archive", "Archivieren", "archive", ""],
     ["trash", "Löschen", "delete", ""]].forEach(function (a) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "wb-ra wb-ra-" + a[0];
      btn.title = a[1];
      btn.setAttribute("aria-label", a[1]);
      btn.innerHTML = MINI[a[0]];
      btn.addEventListener("click", function (e) { runRowAction(row, a[2], a[3], e); });
      box.appendChild(btn);
    });
    subj.appendChild(box);
  }

  // ---- Top-Progressbar (universell ueber rcmail.busy) ----
  function initProgress() {
    var bar = document.createElement("div");
    bar.className = "wb-progress";
    document.body.appendChild(bar);
    var active = false, val = 0, timer = null, last = false;
    function tick() { if (!active) return; val += (92 - val) * 0.08; bar.style.width = val.toFixed(1) + "%"; }
    function start() { if (active) return; active = true; val = 10; bar.style.opacity = "1"; bar.style.width = "10%"; timer = setInterval(tick, 120); }
    function done() { if (!active) return; active = false; clearInterval(timer); bar.style.width = "100%"; setTimeout(function () { bar.style.opacity = "0"; setTimeout(function () { bar.style.width = "0"; }, 250); }, 160); }
    setInterval(function () {
      var busy = !!(window.rcmail && rcmail.busy);
      if (busy && !last) start(); else if (!busy && last) done();
      last = busy;
    }, 140);
  }

  // ---- Tastatur-Shortcuts + Cheatsheet ----
  var SHORTCUTS = [
    ["c", "Neue E-Mail verfassen"],
    ["r", "Antworten"],
    ["a", "Allen antworten"],
    ["f", "Weiterleiten"],
    ["e", "Archivieren"],
    ["#", "Löschen"],
    ["u", "Als gelesen markieren"],
    ["/", "Suche fokussieren"],
    ["?", "Diese Hilfe anzeigen"],
    ["Esc", "Schließen / Zurück"]
  ];
  var CMD = { c: "compose", r: "reply", a: "reply-all", f: "forward", e: "archive" };
  function isTyping() {
    var el = document.activeElement;
    return !!(el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable));
  }
  var helpEl = null;
  function buildHelp() {
    var ov = document.createElement("div");
    ov.className = "wb-help";
    ov.innerHTML = '<div class="wb-help-card" role="dialog" aria-label="Tastenkuerzel"><h2>Tastenkürzel</h2><dl></dl><div class="wb-help-foot">Esc zum Schließen</div></div>';
    var dl = ov.querySelector("dl");
    SHORTCUTS.forEach(function (s) {
      var dt = document.createElement("dt"); dt.innerHTML = "<kbd>" + (s[0] === "&" ? "&amp;" : s[0]) + "</kbd>";
      var dd = document.createElement("dd"); dd.textContent = s[1];
      dl.appendChild(dt); dl.appendChild(dd);
    });
    ov.addEventListener("click", function (e) { if (e.target === ov) closeHelp(); });
    document.body.appendChild(ov);
    return ov;
  }
  function toggleHelp() { if (helpEl) return closeHelp(); helpEl = buildHelp(); }
  function closeHelp() { if (helpEl) { helpEl.parentNode.removeChild(helpEl); helpEl = null; } }
  function initShortcuts() {
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { if (helpEl) { e.preventDefault(); closeHelp(); } return; }
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping()) return;
      if (e.key === "?") { e.preventDefault(); toggleHelp(); return; }
      if (e.key === "#") { if (window.rcmail) { e.preventDefault(); rcmail.command("delete"); } return; }
      if (e.key === "/") { e.preventDefault(); var s = document.querySelector(".searchbar input, #mailsearchform input, input.searchfield"); if (s) s.focus(); return; }
      if (e.key === "u") { if (window.rcmail) { e.preventDefault(); rcmail.command("mark", "read"); } return; }
      var k = e.key.toLowerCase();
      if (CMD[k] && window.rcmail) { e.preventDefault(); rcmail.command(CMD[k]); }
    });
  }

  var raf = null;
  function schedule() {
    if (raf) return;
    raf = (window.requestAnimationFrame || window.setTimeout)(function () {
      raf = null; decorateAll(); decorateHeader(); decorateRecipients();
    }, 16);
  }

  function boot() {
    // Beobachte den Listenbereich; faengt Zeilen-Neuaufbau bei Ordnerwechsel etc.
    var target = document.getElementById("messagelist") || document.querySelector(".messagelist") || document.body;
    try {
      var mo = new MutationObserver(schedule);
      mo.observe(target, { childList: true, subtree: true });
    } catch (e) {}
    decorateAll();
    decorateHeader();
    // Falls Roundcube-Events verfuegbar sind, zusaetzlich daran haengen
    if (window.rcmail && rcmail.addEventListener) {
      rcmail.addEventListener("insertrow", function (p) { decorate(p && p.row); });
      rcmail.addEventListener("listupdate", function () { hideSkeleton(); schedule(); });
      rcmail.addEventListener("init", schedule);
      rcmail.addEventListener("messageload", decorateHeader);
      // Skeleton beim Anfordern der Liste zeigen, bei Antwort ausblenden
      rcmail.addEventListener("requestlist", showSkeleton);
      rcmail.addEventListener("requestsearch", showSkeleton);
      rcmail.addEventListener("responseafterlist", hideSkeleton);
      rcmail.addEventListener("responseaftersearch", hideSkeleton);
    }
    // Nur im Hauptfenster (nicht in Vorschau-iframes)
    if (window.self === window.top) {
      try { initProgress(); } catch (e) {}
      try { initShortcuts(); } catch (e) {}
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
