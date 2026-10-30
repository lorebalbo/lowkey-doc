// page.mjs - the HTML shell the built dashboard lives in.

import { allCss } from './client/css.mjs';
import { APP_JS } from './client/app.mjs';
import { DIAGRAMS_JS } from './client/diagrams.mjs';
import { API_JS } from './client/api.mjs';
import { MARGIN_MIN, MARGIN_MAX } from './config.mjs';

const escAttr = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SIDEBAR_SVG = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
              <rect x="1.5" y="2.5" width="13" height="11" rx="2.5"/><path d="M6 2.5v11"/>
            </svg>`;

export function renderPage({ cfg, docs, reviews = {}, fontCss, mermaidTag, elkTag }) {
  const runtime = {
    title: cfg.title,
    ns: cfg.ns,
    engine: cfg.diagrams.engine,
    nodeTextWidth: cfg.diagrams.nodeTextWidth,
    edgeTextWidth: cfg.diagrams.edgeTextWidth,
    comments: cfg.comments !== false,
    reviews: cfg.reviews !== false,
    margin: cfg.layout.margin,
  };
  // fixed margins are set on the root, so the page is laid out right from its first paint
  const rootAttrs = cfg.layout.margin == null ? ''
    : ' class="fixed-margin" style="--margin:' + Number(cfg.layout.margin) + 'px"';

  const data = JSON.stringify({ docs, reviews: cfg.reviews === false ? {} : reviews }).replace(/</g, '\\u003c');

  // a script from the CDN carries its pinned hash: the browser refuses any other bytes
  const script = (tag) => !tag ? '' : '<script src="' + escAttr(tag.src) + '"' +
    (tag.integrity ? ' integrity="' + escAttr(tag.integrity) + '" crossorigin="anonymous"' : '') + '><\/script>';

  const searchBox = cfg.search === false ? '' : `
    <div class="search">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/>
      </svg>
      <input id="search" type="search" placeholder="Search documents" spellcheck="false" autocomplete="off">
    </div>`;

  const commentRow = cfg.comments === false ? '' : `
  <div class="settings-row">
    <div class="settings-label">
      <label for="cmt-tog">Comments <span class="cmt-n" id="cmt-n">0</span></label>
      <button class="switch" id="cmt-tog" type="button" role="switch" aria-checked="true"></button>
    </div>
    <div class="settings-hint"><span>Your margin notes, kept in this browser</span></div>
  </div>`;

  const commentBits = cfg.comments === false ? '' : `
<button class="cmt-add" id="cmt-add" type="button" hidden>Comment</button>
<div class="cmt-pop" id="cmt-pop" hidden></div>`;

  return `<!doctype html>
<html lang="en"${rootAttrs}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escAttr(cfg.title)}</title>
<style>${fontCss}${allCss()}</style>
</head>
<body>
<div class="layout" id="layout">
  <aside class="side">
    <div class="side-top">
      <div class="brand">
        <div class="brand-row">
          <span class="brand-name">${escAttr(cfg.title)}</span>
          <button class="icon-btn" id="toggle" type="button" title="Hide sidebar  [">
            ${SIDEBAR_SVG}
          </button>
        </div>
      </div>
    </div>${searchBox}
    <nav class="nav" id="nav"></nav>
    <div class="side-foot">
      <button class="foot-btn" id="settings-btn" type="button" title="Settings" aria-haspopup="dialog">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
          <path d="M2.5 4.5h6M12 4.5h1.5M2.5 11.5h1.5M7.5 11.5h6"/><circle cx="10.2" cy="4.5" r="1.7"/><circle cx="5.8" cy="11.5" r="1.7"/>
        </svg>
        <span class="foot-lbl">Settings</span>
      </button>
    </div>
  </aside>
  <div class="main">
    <button class="icon-btn side-open" id="side-open" type="button" title="Show sidebar  [">
      ${SIDEBAR_SVG}
    </button>
    <div class="topbar" id="topbar"><div class="topbar-in"><b id="topbar-title"></b></div></div>
    <div id="main"></div>
  </div>
</div>
${commentBits}${cfg.comments === false && cfg.reviews === false ? '' : `
<div class="cmt-toast" id="cmt-toast" hidden></div>`}
<div class="settings-veil" id="settings-veil" hidden></div>
<div class="settings" id="settings" role="dialog" aria-modal="true" aria-label="Settings" hidden>
  <div class="settings-head">
    <b>Settings</b>
    <button class="icon-btn" id="settings-close" type="button" title="Close  Esc">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
    </button>
  </div>
  <div class="settings-row">
    <div class="settings-label">
      <label for="set-margin">Side margins</label>
      <span class="settings-val" id="set-margin-val"></span>
    </div>
    <input type="range" id="set-margin" min="${MARGIN_MIN}" max="${MARGIN_MAX}" step="4">
    <div class="settings-hint">
      <span>From the edge of the page to the text</span>
      <button class="settings-link" id="set-margin-auto" type="button">Automatic</button>
    </div>
  </div>${commentRow}
  <div class="settings-foot" id="settings-status"></div>
</div>
<div class="lightbox" id="lightbox">
  <div class="lightbox-stage" id="lightbox-stage"></div>
  <div class="lightbox-bar">
    <button id="zoom-out" type="button">&minus;</button>
    <span id="zoom-label">100%</span>
    <button id="zoom-in" type="button">+</button>
    <button id="zoom-close" type="button">Close</button>
  </div>
</div>

<script id="doc-data" type="application/json">${data}</script>
<script>window.__LOWKEY_DOC__=${JSON.stringify(runtime).replace(/</g, '\\u003c')};<\/script>
${script(mermaidTag)}
${script(elkTag)}
<script>${DIAGRAMS_JS}<\/script>
<script>${APP_JS}<\/script>
<script>${API_JS}<\/script>
</body>
</html>
`;
}
