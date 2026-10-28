// css.mjs - the whole stylesheet, inlined into the page.

export const CSS = `
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
:root{
  color-scheme:dark;
  --bg:#08090b; --ink:#f3f5f7; --muted:#9aa2ad; --faint:#5f6873; --line:rgba(255,255,255,.08);
  --line-2:rgba(255,255,255,.16); --surface:#13161b; --surface-2:#1a1e24; --hover:rgba(255,255,255,.05);
  /* the one accent: an electric blue, used for what is lit, current or alive */
  --accent:#4da3ff; --accent-soft:rgba(77,163,255,.12); --accent-ring:rgba(77,163,255,.36);
  /* reviewed: a green as light and as cool as the blue, so the two sit together */
  --ok:#45cf98; --ok-soft:rgba(69,207,152,.12); --ok-ring:rgba(69,207,152,.36);
  /* a filled button is white with dark text */
  --on-ink:#0b0d10; --ink-hover:#dde2e8;
  --serif:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
  --mono:ui-monospace,"JetBrains Mono","Cascadia Mono",SFMono-Regular,"SF Mono",Menlo,Consolas,monospace;
  /* inline code */
  --code-bg:rgba(255,255,255,.06); --code-bg-on-white:rgba(255,255,255,.07); --code-bg-table:rgba(255,255,255,.06);
  --code-ring:rgba(255,255,255,.1); --code-ink:#d4e5ff; --code-var:#f0c674; --code-text:#d6dbe2;
  /* Inter is vendored into the page as a variable font; everything after it is
     the offline fallback. Swap this one line to re-face the whole dashboard. */
  --font:Inter,"Avenir Next","Segoe UI",system-ui,-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;
  /* Emphasis is one notch of weight, not two: bold should read as emphasis
     inside the sentence, not as a heavier typeface dropped into it. */
  --semi:560; --bold:620;
  --scroll:rgba(255,255,255,.12); --scroll-on:rgba(255,255,255,.22);
  --rail:270px;
  /* content column: --measure is the text width, --gutter the breathing room
     either side of it. The column is centred in the main area. */
  --measure:92ch; --gutter:46px;
  --column:calc(var(--measure) + var(--gutter) * 2);
  --margin:var(--gutter);
  /* diagrams */
  --dg-node:#1a1e24; --dg-node-line:#3a414c; --dg-edge:#6b7480; --dg-edge-text:#9aa2ad;
  --dg-group:#0f1216; --dg-group-line:#262b33; --dg-hot:#4da3ff; --dg-hot-soft:#10284d;
  --dg-tie:#3a414c; --dg-life:#2e343d; --dg-text-2:#b7c0cc;
  /* entity tables: the header band and the row hover are washes laid over the
     box, so a classDef colour on an entity still reads through them */
  --dg-er-head:rgba(255,255,255,.035); --dg-er-head-hot:rgba(77,163,255,.08);
  --dg-er-line:#262b33; --dg-er-hover:rgba(77,163,255,.1);
  --dg-er-badge:#22272e; --dg-er-badge-line:#323842; --dg-er-badge-ink:#9aa2ad;
  --dg-er-badge-pk:#2b323b; --dg-er-badge-pk-line:#424a56;
  /* sequences: notes are the one warm surface, so an aside never reads as a message */
  --dg-seq-num:#4b535e; --dg-seq-note:#221f14; --dg-seq-note-line:#4a4128; --dg-seq-note-ink:#e6d7a6;
}
/* Paper is white: printing goes back to ink on white rather than spend a
   cartridge on the night sky, or lose the text when backgrounds are dropped. */
@media print{:root{color-scheme:light;
  --bg:#fff; --ink:#141a26; --muted:#5f6674; --faint:#98a0ad; --line:#d7dbe2; --line-2:#c3c9d4;
  --surface:#fff; --surface-2:#f2f3f6; --accent:#1d4ed8;
  --code-bg:#f5f6f9; --code-bg-on-white:#f5f6f9; --code-bg-table:#f1f3f8; --code-ring:rgba(20,26,38,.1);
  --code-ink:#3a3d78; --code-var:#7a5a1e; --code-text:#2a3040;
  --dg-node:#fff; --dg-node-line:#c3c9d4; --dg-edge:#8a91a0; --dg-edge-text:#5f6674;
  --dg-group:#f7f8fa; --dg-group-line:#dfe3ea; --dg-tie:#c3c9d4; --dg-life:#d3d8e0; --dg-text-2:#3a4150;
  --dg-er-head:rgba(20,26,38,.045); --dg-er-line:#e7eaf0;
  --dg-er-badge:#eef0f4; --dg-er-badge-line:#dce0e8; --dg-er-badge-ink:#5f6674;
  --dg-er-badge-pk:#dfe4ee; --dg-er-badge-pk-line:#c8d0dd;
  --dg-seq-num:#5f6674; --dg-seq-note:#fbf8ee; --dg-seq-note-line:#e7dfc4; --dg-seq-note-ink:#4f4a3a}
  body::before{display:none}}
/* A project that fixes its margins (layout.margin) gives the column whatever
   the reading area leaves once they are taken: --margin runs from the edge of
   the area to the text, so the column's own gutter is inside it. Never wider
   than the area, never so narrow the text stops reading as a column. */
:root.fixed-margin{--column:clamp(360px,calc(100% - var(--margin) * 2 + var(--gutter) * 2),100%)}
body{margin:0;background:var(--bg);color:var(--ink);
  font:15px/1.7 var(--font);
  font-optical-sizing:auto;
  -webkit-font-smoothing:antialiased}
/* the night sky the page sits on: a blue glow in the top corner and two
   sparse grids of stars, sized so they never line up into a visible pattern */
body::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;
  background:
    radial-gradient(55% 45% at 100% 0%,rgba(30,111,255,.11),transparent 70%),
    radial-gradient(40% 40% at 0% 100%,rgba(30,111,255,.05),transparent 70%),
    radial-gradient(circle,rgba(255,255,255,.14) 0 .7px,transparent 1.2px) 13px 29px/173px 157px,
    radial-gradient(circle,rgba(255,255,255,.09) 0 .6px,transparent 1.1px) 61px 7px/241px 211px,
    radial-gradient(circle,rgba(77,163,255,.16) 0 .6px,transparent 1.1px) 137px 71px/311px 283px}
a{color:inherit;text-decoration:none}
.layout{display:grid;grid-template-columns:var(--rail) 1fr;min-height:100vh}
.layout.collapsed{--rail:62px}

/* ---- scrollbars ----
   Chrome and Safari take the ::-webkit rules. Firefox only understands the two
   standard properties - and Chrome lets those override everything below - so
   they are kept behind a Firefox-only @supports. */
::-webkit-scrollbar{width:11px;height:11px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{min-height:34px;border:3px solid transparent;border-radius:99px;
  background:var(--scroll);background-clip:padding-box}
::-webkit-scrollbar-thumb:hover{background:var(--scroll-on);background-clip:padding-box}
::-webkit-scrollbar-thumb:active{background:var(--muted);background-clip:padding-box}
::-webkit-scrollbar-corner{background:transparent}
@supports (-moz-appearance:none){*{scrollbar-width:thin;scrollbar-color:var(--scroll) transparent}}

/* ---- sidebar ---- */
.side{position:sticky;top:0;height:100vh;display:flex;flex-direction:column;
  border-right:1px solid var(--line);overflow:hidden}
.side-top{padding:16px 14px 12px}
.brand{min-width:0}
/* the toggle shares a row with the title, so its 28px box - and the background
   that appears under it on hover - is centred on the title's own line rather
   than on the title-plus-subtitle block */
.brand-row{display:flex;align-items:center;gap:8px;min-width:0}
.brand-name{flex:1;min-width:0;height:28px;line-height:28px;font-size:14px;font-weight:var(--bold);
  letter-spacing:-.012em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.brand-name::before{content:"";display:inline-block;width:8px;height:8px;margin:0 9px 1px 2px;
  border-radius:50%;background:var(--accent);box-shadow:0 0 10px 1px var(--accent-ring);vertical-align:middle}
.icon-btn{width:28px;height:28px;flex:none;display:grid;place-items:center;border:1px solid transparent;
  border-radius:999px;background:none;color:var(--muted);cursor:pointer;
  transition:background .15s,color .15s,border-color .15s}
.icon-btn:hover{background:var(--hover);color:var(--ink);border-color:var(--line)}
.icon-btn svg{width:15px;height:15px}
.search{margin:8px 14px 6px;position:relative}
.search input{width:100%;padding:7px 12px 7px 31px;border:1px solid var(--line);border-radius:999px;
  background:var(--surface);color:var(--ink);font:inherit;font-size:13px;outline:none;
  transition:border-color .15s,box-shadow .15s}
.search input::placeholder{color:var(--faint)}
.search input:focus{border-color:var(--accent-ring);box-shadow:0 0 0 3px var(--accent-soft)}
.search svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);width:13px;height:13px;color:var(--faint)}
.nav{flex:1;overflow-y:auto;overflow-x:hidden;padding:2px 10px 24px}
.nav::-webkit-scrollbar{width:9px}
.nav-group{margin:16px 6px 6px;font-size:10px;font-weight:var(--bold);letter-spacing:.11em;
  text-transform:uppercase;color:var(--faint)}
.nav-group:first-child{margin-top:2px}

/* documents: a flat row; the open one is an outlined pill, its number lit */
.item{position:relative;display:flex;align-items:center;gap:10px;padding:7px 10px 7px 14px;
  border-radius:999px;cursor:pointer;color:var(--muted);transition:color .12s,background .12s,box-shadow .12s}
.item:hover{color:var(--ink);background:var(--hover)}
.item.active{color:var(--ink);background:rgba(255,255,255,.035);box-shadow:inset 0 0 0 1px var(--line-2)}
.num{flex:none;min-width:15px;font-size:11px;font-weight:var(--semi);color:var(--faint);
  font-variant-numeric:tabular-nums;transition:color .12s}
.item:hover .num{color:var(--muted)}
.item.active .num{color:var(--accent)}
.item-title{flex:1;min-width:0;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.item.active .item-title{font-weight:var(--semi)}
.caret{width:13px;height:13px;flex:none;color:var(--faint);opacity:0;
  transition:transform .18s ease,opacity .15s}
.item:hover .caret,.item.active .caret{opacity:1}
.item.open .caret{transform:rotate(90deg)}

/* sections: a hairline rail with one node per heading */
.subs{display:none;position:relative;margin:2px 0 10px;padding:2px 0}
.subs::before{content:"";position:absolute;left:20px;top:9px;bottom:9px;width:1px;background:var(--line)}
.item.open+.subs{display:block}
.sub{position:relative;display:flex;gap:8px;padding:4px 10px 4px 33px;border-radius:999px;
  font-size:12.5px;color:var(--muted);cursor:pointer;transition:color .12s,background .12s}
.sub::after{content:"";position:absolute;left:17px;top:50%;width:7px;height:7px;margin-top:-3.5px;
  border-radius:50%;background:var(--bg);border:1px solid var(--line);transition:.15s}
.sub:hover{color:var(--ink);background:var(--hover)}
.sub:hover::after{border-color:var(--muted)}
.sub.current{color:var(--ink);font-weight:var(--semi)}
.sub.current::after{background:var(--accent);border-color:var(--accent);box-shadow:0 0 8px var(--accent-ring)}
.sub-n{flex:none;font-size:11px;color:var(--faint);font-variant-numeric:tabular-nums}
.sub.current .sub-n{color:var(--muted)}
.sub-t{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* a reviewed document or section carries a green check in the sidebar */
.rv-mark{display:none;flex:none;width:13px;height:13px;color:var(--ok)}
.rv-mark svg{display:block;width:100%;height:100%}
.is-reviewed>.rv-mark{display:block}
.sub .rv-mark{align-self:center;width:12px;height:12px}

.collapsed .brand-name,.collapsed .search,.collapsed .nav-group,
.collapsed .item-title,.collapsed .caret,.collapsed .foot-lbl,.collapsed .rv-mark{display:none}
.collapsed .subs,.collapsed .item.open+.subs{display:none}
.collapsed .side-top{padding:16px 0 12px}
.collapsed .brand-row{justify-content:center}
.collapsed .nav{padding:2px 8px;scrollbar-width:none}
.collapsed .nav::-webkit-scrollbar{display:none}
.collapsed .item{justify-content:center;padding:8px 0;margin-bottom:2px}
.collapsed .num{min-width:0;font-size:12px}
.collapsed .side-foot{padding:10px 8px}
.collapsed .foot-btn{justify-content:center;padding:7px 0}

/* the foot of the sidebar: the settings, an icon with its name beside it */
.side-foot{display:flex;padding:10px 12px;border-top:1px solid var(--line)}
.foot-btn{flex:1;display:flex;align-items:center;gap:9px;padding:7px 12px;border:1px solid transparent;
  border-radius:999px;background:none;color:var(--muted);font:inherit;font-size:13px;cursor:pointer;
  white-space:nowrap;overflow:hidden;transition:background .15s,color .15s,border-color .15s}
.foot-btn:hover,.foot-btn[aria-expanded=true]{background:var(--hover);color:var(--ink);border-color:var(--line)}
.foot-btn svg{flex:none;width:15px;height:15px}
@media print{.side-foot{display:none}}
`;

export const CSS_MAIN = `
/* ---- main ---- */
.main{min-width:0;display:flex;flex-direction:column}
/* The title is a card: a slab of dark glass, lit by one blue light that sits
   just off its bottom-left corner. Everything on it is that light or the sky
   above, so it falls where a real one would:
   - the face glows from the corner and fades out smoothly;
   - the light is also fed into the glass, and runs along inside its edge both
     ways - up the left side and over the top, along the bottom and up the
     right - leaking out as it goes, so the edge glows brightest at the
     corner and dims the further it travels, until the two runs die out
     near the top-right corner;
   - a bend leaks more light than a straight, so the two corners it rounds,
     top-left and bottom-right, glint where the run turns;
   - under all of it the edge keeps the grey of the sky, brighter on top.
   Two faint copies of the light, one a little along the bottom and one a
   little up the side, fade in and out of step, so it drifts and breathes too
   slowly to watch; each one feeds a little more light to the corner on its
   side. Its text keeps the column's gutter, so it starts on the same edge as
   the prose.
   The edge is painted by the border-box layers rather than a border colour,
   so it can carry the light; the card can't clip its overflow without
   clipping that edge, so long words wrap instead. Nothing repeats: a
   repeating gradient wraps its far side round into the opposite border. */
.head{--lamp:-24px calc(100% + 24px);
  /* the middle of each rounded corner's curve, where a glint sits */
  --bend-tl:7px 7px; --bend-br:calc(100% - 7px) calc(100% - 7px);
  position:relative;isolation:isolate;width:calc(100% - 32px);max-width:var(--column);
  margin:28px auto 34px;padding:46px var(--gutter) 48px;border:1px solid transparent;border-radius:24px;
  overflow-wrap:break-word;
  background:
    radial-gradient(90% 140% at var(--lamp),rgba(115,185,255,.52),rgba(86,159,255,.442) 17%,
      rgba(58,133,255,.284) 33%,rgba(45,119,255,.146) 50%,rgba(34,106,255,.058) 67%,rgba(28,100,255,.013) 83%,
      transparent) padding-box,
    linear-gradient(rgba(255,255,255,.02),transparent 45%) padding-box,
    linear-gradient(var(--surface),var(--surface)) padding-box,
    radial-gradient(circle 160px at var(--bend-tl),rgba(150,205,255,.6),rgba(140,197,255,.364) 6%,
      rgba(126,186,255,.205) 14%,rgba(106,171,255,.106) 25%,
      rgba(80,150,255,.046) 40%,rgba(60,133,255,.013) 60%,transparent) border-box,
    radial-gradient(circle 160px at var(--bend-br),rgba(150,205,255,.48),rgba(140,197,255,.291) 6%,
      rgba(126,186,255,.164) 14%,rgba(106,171,255,.085) 25%,
      rgba(80,150,255,.037) 40%,rgba(60,133,255,.01) 60%,transparent) border-box,
    radial-gradient(150% 150% at var(--lamp),rgba(150,205,255,.85),rgba(133,191,255,.681) 10%,
      rgba(115,178,255,.543) 20%,rgba(98,164,255,.427) 30%,rgba(80,150,255,.33) 40%,rgba(70,141,255,.248) 50%,
      rgba(60,133,255,.178) 60%,rgba(50,124,255,.12) 70%,rgba(40,115,255,.071) 80%,rgba(40,115,255,.032) 90%,
      transparent) border-box,
    linear-gradient(rgba(255,255,255,.13),rgba(255,255,255,.06) 55%,rgba(255,255,255,.05)) border-box;
  background-repeat:no-repeat}
/* the two drifting copies: each lights the edge fully, and the face by half
   near the light and not at all by the far corners, so the more light it
   sends round a bend shows on the edge, not as a smudge on the face */
.head::before,.head::after{content:"";position:absolute;inset:-1px;z-index:-1;pointer-events:none;
  border:1px solid transparent;border-radius:inherit;opacity:0;
  -webkit-mask:radial-gradient(90% 140% at 0 100%,rgba(0,0,0,.5),#000 60%) padding-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  animation:head-lamp 13s ease-in-out infinite alternate}
.head::before{background:
  radial-gradient(circle 160px at var(--bend-br),rgba(150,205,255,.3),rgba(140,197,255,.182) 6%,
    rgba(126,186,255,.102) 14%,rgba(106,171,255,.053) 25%,
    rgba(80,150,255,.023) 40%,rgba(60,133,255,.006) 60%,transparent) border-box,
  radial-gradient(70% 120% at 96px calc(100% + 24px),
    rgba(115,185,255,.16),rgba(72,146,255,.107) 25%,rgba(45,119,255,.04) 50%,rgba(28,100,255,.008) 75%,
    transparent) border-box;background-repeat:no-repeat}
.head::after{background:
  radial-gradient(circle 160px at var(--bend-tl),rgba(150,205,255,.3),rgba(140,197,255,.182) 6%,
    rgba(126,186,255,.102) 14%,rgba(106,171,255,.053) 25%,
    rgba(80,150,255,.023) 40%,rgba(60,133,255,.006) 60%,transparent) border-box,
  radial-gradient(70% 120% at -24px calc(100% - 26px),
    rgba(115,185,255,.16),rgba(72,146,255,.107) 25%,rgba(45,119,255,.04) 50%,rgba(28,100,255,.008) 75%,
    transparent) border-box;background-repeat:no-repeat;animation-duration:19s;animation-delay:-8s}
@keyframes head-lamp{to{opacity:1}}
@media (prefers-reduced-motion:reduce){.head::before,.head::after{animation:none}}
.head h1{margin:0;max-width:22ch;font-size:36px;line-height:1.12;font-weight:650;letter-spacing:-.034em;color:var(--ink)}
.head .lede{margin:14px 0 0;max-width:68ch;font-size:15.5px;line-height:1.62;color:var(--muted)}
.lede>*{margin:0}
.lede>*+*{margin-top:10px}
.doc{padding:4px var(--gutter) 30px;width:100%;max-width:var(--column);margin-inline:auto}

/* ---- prev / next ----
   Always at the very bottom of the page: under a long document it follows the
   text, and under a short one it is pushed down to the foot of the screen
   (the page is at least a screen tall, and the buttons take what is left). */
.docnav{width:100%;max-width:var(--column);margin:auto auto 0;padding:24px var(--gutter) 32px;
  display:grid;grid-template-columns:1fr 1fr;gap:14px}
.docnav-btn{display:flex;flex-direction:column;gap:5px;min-width:0;padding:18px 20px;
  background:var(--surface);border:1px solid var(--line);border-radius:18px;
  transition:background .2s ease,border-color .2s ease}
.docnav-btn:hover{border-color:var(--line-2);
  background:radial-gradient(110% 140% at 100% 0%,rgba(77,163,255,.13),transparent 60%),var(--surface-2)}
.docnav-btn.next{grid-column:2;text-align:right}
.docnav-label{font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--faint)}
.docnav-title{font-size:14px;font-weight:var(--semi);letter-spacing:-.01em;color:var(--ink);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* ---- sections ----
   Every heading owns the blocks under it, so a section can be folded away and
   the space between two of them can be set as one rule instead of guessed at
   from heading margins. */
.doc [id]{scroll-margin-top:88px}
.sec{margin-top:30px}
.doc>.sec{margin-top:54px;padding-top:32px;border-top:1px solid var(--line)}
.doc>.sec:first-child{margin-top:2px;padding-top:0;border-top:0}
.sec .sec{margin-top:34px}
.sec .sec .sec{margin-top:24px}
.sec .sec .sec .sec{margin-top:18px}
.sec.shut>.sec-body{display:none}

.sec-head{position:relative;display:flex;align-items:baseline;gap:11px;cursor:pointer;
  line-height:1.32;letter-spacing:-.018em;scroll-margin-top:98px}
h1.sec-head{margin:0 0 15px;font-size:22px;font-weight:var(--bold)}
h2.sec-head{margin:0 0 13px;font-size:18.5px;font-weight:var(--bold)}
h3.sec-head{margin:0 0 10px;font-size:15.5px;font-weight:var(--semi)}
h4.sec-head,h5.sec-head,h6.sec-head{margin:0 0 8px;font-size:14px;font-weight:var(--semi);color:var(--muted)}
/* The fold arrow and the number sit out in the margin, so a heading starts on
   the same left edge as the prose under it. The cluster is anchored by its
   right edge and grows leftwards, so the number never moves when the arrow
   fades in; its box is exactly one line tall, which is what centres both of
   them on the heading's first line whatever the heading's size. */
.sec-gut{position:absolute;right:100%;top:0;margin-right:14px;height:1.32em;
  display:flex;align-items:center;gap:5px;white-space:nowrap;user-select:none}
.sec-num{font-size:.8em;font-weight:var(--semi);letter-spacing:0;color:var(--faint);
  font-variant-numeric:tabular-nums}
.sec-txt{min-width:0}
.sec-head em{font-family:var(--serif);font-style:italic;font-weight:500;letter-spacing:-.005em;color:var(--accent)}
.sec-tog{flex:none;width:18px;height:18px;padding:0;display:grid;place-items:center;
  border:0;border-radius:6px;background:none;color:var(--faint);
  cursor:pointer;opacity:0;transition:opacity .15s,background .15s,color .15s}
.sec-tog svg{width:12px;height:12px;transition:transform .18s ease}
.sec-tog:hover{background:var(--hover);color:var(--ink)}
.sec-head:hover .sec-tog,.sec.shut>.sec-head .sec-tog{opacity:1}
.sec.shut>.sec-head{margin-bottom:0;color:var(--muted)}
.sec.shut>.sec-head .sec-num{color:var(--muted)}
.sec.shut>.sec-head .sec-tog svg{transform:rotate(-90deg)}
.h-anchor{flex:none;font-size:.78em;font-weight:400;color:var(--faint);
  opacity:0;transition:opacity .15s,color .15s}
.sec-head:hover .h-anchor{opacity:1}
.h-anchor:hover{color:var(--ink)}

/* ---- reviews ----
   Every section, and the document in its header card, has a Reviewed button:
   a grey check until the reader marks it, then green. On a heading the word
   shows only on hover, so a page of unread headings is not a page of labels. */
.rv{flex:none;align-self:center;margin-left:auto;display:inline-flex;align-items:center;gap:6px;
  padding:3px 4px 3px 9px;border:1px solid transparent;border-radius:999px;background:none;
  color:var(--faint);font:inherit;font-size:11.5px;font-weight:var(--semi);letter-spacing:0;line-height:1;
  cursor:pointer;transition:color .15s,background .15s,border-color .15s}
.rv svg{width:16px;height:16px;flex:none}
.rv svg circle{transition:fill .15s,stroke .15s}
.rv::before{content:"Reviewed";opacity:0;transition:opacity .15s}
.sec-head:hover>.rv::before,.rv:focus-visible::before,.rv.is-on::before{opacity:1}
.rv:hover{color:var(--ink);background:var(--hover)}
.rv:focus-visible{outline:2px solid var(--ok-ring);outline-offset:1px}
.rv.is-on{color:var(--ok)}
.rv.is-on svg circle{fill:var(--ok);stroke:var(--ok)}
.rv.is-on svg path{stroke:var(--on-ink)}
.rv.is-on:hover{color:var(--ok);background:var(--ok-soft)}
/* the document's own, in the corner of the header card: always labelled */
.rv-bar{position:absolute;top:18px;right:18px;display:flex;align-items:center;gap:10px}
.rv-count{font-size:11.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.rv-count:empty{display:none}
.rv-doc{margin:0;border-color:var(--line-2);color:var(--muted)}
.rv-doc::before{opacity:1}
.rv-doc.is-on{border-color:var(--ok-ring)}

/* ---- prose ---- */
.doc p{margin:0 0 18px}
.doc>p:first-child{margin-top:6px}
.sec-body>:last-child,.doc blockquote>:last-child,.doc li>:last-child{margin-bottom:0}
.doc li{margin:6px 0}
.doc ul,.doc ol{margin:0 0 18px;padding-left:24px}
.doc li>ul,.doc li>ol{margin:6px 0}
.doc li::marker{color:var(--faint)}
.doc ul>li::marker{color:var(--accent)}
.doc strong{font-weight:var(--semi);color:inherit}
.doc em{font-style:italic}
.doc a:not(.h-anchor),.lede a{color:var(--ink);border-bottom:1px solid var(--line-2);padding-bottom:1px;
  transition:border-color .12s,color .12s}
.doc a:not(.h-anchor):hover,.lede a:hover{border-bottom-color:var(--accent);color:var(--accent)}
.doc hr{margin:32px 0;border:0;border-top:1px solid var(--line)}
.doc blockquote{margin:0 0 18px;padding:2px 0 2px 17px;border-left:2px solid var(--accent-ring);color:var(--muted)}
/* Inline code is a plate set into the sentence: a faint white fill that
   lifts it off the dark page, a hairline ring drawn inside the box (so it
   costs no layout and still reads on a white table cell, where the fill
   alone would vanish), and an ink a shade cooler than the prose, so a name
   reads as a name without shouting. Padding is in em, so the plate tracks
   the text it sits in, headings included. */
.doc code,.lede code{font-family:var(--mono);font-size:.84em;letter-spacing:-.01em;
  background:var(--code-bg);box-shadow:inset 0 0 0 1px var(--code-ring);
  border-radius:5px;padding:.1em .38em .12em;color:var(--code-ink);white-space:nowrap;
  -webkit-box-decoration-break:clone;box-decoration-break:clone}
.api code{background:var(--code-bg-on-white)}
.doc a:not(.h-anchor) code,.lede a code{color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent-ring)}
.doc h1 code,.doc h2 code,.doc h3 code,.doc h4 code{font-size:.86em;font-weight:var(--semi)}
/* a {placeholder} inside code: the braces fade, the name stays */
.c-var{color:var(--code-var);font-style:italic}
/* an HTTP verb named in the prose, alone or leading a url */
.c-verb{font-weight:750;letter-spacing:.02em;color:var(--m-ink)}
.doc code.c-verb-only{color:var(--m-ink);background:var(--m-soft);box-shadow:inset 0 0 0 1px var(--m-ring);
  font-weight:750;font-size:.78em;letter-spacing:.04em;padding:.14em .44em .12em;vertical-align:.04em}
/* one colour per verb, as a family: ink for text, a soft fill and a ring for
   plates, and a solid for the badge on a call's header */
.m-get{--m-ink:#8ab8ff;--m-soft:rgba(80,140,255,.14);--m-ring:rgba(80,140,255,.38);--m-solid:#3b82f6}
.m-post{--m-ink:#7ee3a6;--m-soft:rgba(110,231,160,.13);--m-ring:rgba(110,231,160,.38);--m-solid:#22c55e}
.m-put{--m-ink:#fbc078;--m-soft:rgba(251,180,90,.13);--m-ring:rgba(251,180,90,.38);--m-solid:#f59e0b}
.m-patch{--m-ink:#bfa8ff;--m-soft:rgba(160,130,255,.15);--m-ring:rgba(160,130,255,.4);--m-solid:#8b5cf6}
.m-delete{--m-ink:#ff9393;--m-soft:rgba(255,110,110,.14);--m-ring:rgba(255,110,110,.4);--m-solid:#ef4444}
.m-head,.m-options{--m-ink:#b4bcc8;--m-soft:rgba(255,255,255,.07);--m-ring:rgba(255,255,255,.2);--m-solid:#6b7280}
.doc del{color:var(--faint)}
.doc img{max-width:100%;border-radius:14px}

/* ---- code ---- */
.code-wrap{position:relative;margin:0 0 20px}
.code-lang{position:absolute;top:9px;right:12px;font-family:var(--mono);font-size:10px;
  letter-spacing:.06em;text-transform:uppercase;color:var(--faint);pointer-events:none}
pre.code{margin:0;padding:16px 18px;overflow-x:auto;max-width:100%;background:var(--surface);
  border:1px solid var(--line);border-radius:16px}
pre.code code{font-family:var(--mono);font-size:12.5px;line-height:1.62;white-space:pre;
  letter-spacing:0;background:none;border:0;padding:0;color:var(--code-text)}

/* ---- tables ---- */
.table-wrap{margin:0 0 20px;overflow-x:auto;max-width:100%;background:var(--surface);
  border:1px solid var(--line);border-radius:16px}
table{border-collapse:collapse;width:100%;font-size:13.5px}
th,td{padding:10px 14px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}
th{font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);
  font-weight:var(--bold);white-space:nowrap;background:var(--surface-2)}
tbody tr:last-child td{border-bottom:0}
/* Code in a table is often a whole column of it, and a ringed plate on every
   row turns the column into a grid of boxes. Here it is a soft fill with no
   ring, a size up from inline code, so a value reads as the
   value of the row, not as a tag stuck on it. A header keeps its code as
   written: the header's capitals would change the name. */
.doc td code{font-size:12.5px;letter-spacing:-.005em;font-weight:500;color:var(--code-ink);
  background:var(--code-bg-table);box-shadow:none;padding:.2em .5em .22em;border-radius:6px;white-space:normal}
.doc th code{font-size:11.5px;letter-spacing:0;text-transform:none;font-weight:var(--semi);color:var(--muted);
  background:rgba(255,255,255,.06);box-shadow:none;padding:.12em .42em}

/* ---- api calls ----
   A call is a neutral box: a solid badge in the colour of its verb, the url
   in mono beside it, and a chevron. The header is all there is until it is clicked;
   the body then lists what each part of the url is. */
.api{margin:0 0 20px;background:var(--surface);border:1px solid var(--line);border-radius:16px;
  overflow:hidden}
.api-head{display:flex;align-items:center;gap:12px;min-height:44px;padding:8px 12px 8px 15px;
  background:var(--surface);transition:background .12s}
.api-head[role=button]{cursor:pointer;user-select:text}
.api-head[role=button]:hover{background:var(--surface-2)}
.api-head:focus-visible{outline:2px solid var(--m-ring);outline-offset:-2px;border-radius:15px}
.api-verb{flex:none;min-width:62px;padding:3px 10px;border-radius:999px;text-align:center;
  font:750 11px/1.5 var(--font);letter-spacing:.07em;color:var(--m-ink);background:var(--m-soft);
  box-shadow:inset 0 0 0 1px var(--m-ring)}
.doc .api-url{flex:1;min-width:0;padding:0;background:none;box-shadow:none;border-radius:0;
  font-size:13px;letter-spacing:-.005em;color:var(--ink);white-space:normal;overflow-wrap:anywhere}
.api-scheme{color:var(--faint)}
.api-url .c-var{color:var(--m-ink);font-style:normal;font-weight:var(--semi)}
.api-title{flex:none;max-width:34%;font-size:12.5px;color:var(--muted);white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis}
.api-tog{flex:none;width:22px;height:22px;display:grid;place-items:center;border-radius:999px;
  color:var(--faint);transition:transform .18s ease,color .15s,background .15s}
.api-tog svg{width:13px;height:13px}
.api-head:hover .api-tog{color:var(--ink);background:var(--hover)}
.api.is-open .api-tog{transform:rotate(90deg)}
/* a described part of the url: marked only while the key is held, so the
   url reads as a url the rest of the time */
.api-part{border-radius:4px;transition:background .12s,box-shadow .12s}
.api-asking .api:not(.is-open) .api-part{box-shadow:inset 0 -1.5px 0 var(--m-ring);cursor:help}
.api-part.is-asked{background:var(--m-soft);box-shadow:0 0 0 2px var(--m-soft)}
.api-body{display:none;margin:0;padding:6px 0;border-top:1px solid var(--line)}
.api.is-open .api-body{display:block}
.api-row{display:grid;grid-template-columns:minmax(120px,max-content) 1fr;gap:4px 18px;
  align-items:baseline;padding:8px 16px 8px 18px;font-size:13.5px;line-height:1.6}
.api-row+.api-row{border-top:1px solid var(--dg-er-line)}
.api-row dt{margin:0}
.api-row dt code{font-size:12px}
.api-row dt .c-var{color:var(--m-ink);font-style:normal;font-weight:var(--semi)}
.api-row dd{margin:0;font-size:13.5px;line-height:1.6;color:var(--ink)}
.api-row dd p{margin:0}
.api-row dd ul{margin:4px 0 0;padding-left:18px}
.api-row dd li{margin:2px 0}
.api-tip-key{margin-bottom:5px}
.api-tip-key code{font-weight:var(--semi);color:var(--ink)}
.dg-tip.api-tip .c-var{color:#f3c77b;font-style:normal}
.dg-tip.api-tip ul{margin:5px 0 0;padding-left:16px}
/* ---- http examples ----
   The same box as a call, with the example's own parts under the header: the
   HTTP headers as a quiet list of names and values, then the body, coloured
   when it is JSON. A response wears its status in the badge, in the colour of
   what it means; written after the request in the same block, it sits
   under it in the same box. */
.http{margin:0 0 20px;background:var(--surface);border:1px solid var(--line);border-radius:16px;overflow:hidden}
.http-msg+.http-msg{border-top:1px solid var(--line)}
/* the response, when it follows the request in the same box: set a step
   back, so the two read as what was sent and what came back */
.http-msg.is-res:not(:first-child){background:rgba(255,255,255,.015)}
.http-msg.is-res:not(:first-child) .http-headers{background:rgba(255,255,255,.03)}
.http-head{display:flex;align-items:center;gap:12px;min-height:44px;padding:8px 14px 8px 15px}
.http-reason{flex:1;min-width:0;font-size:13.5px;font-weight:var(--semi);color:var(--ink)}
.http-kind{flex:none;font-size:10px;font-weight:var(--bold);letter-spacing:.09em;text-transform:uppercase;color:var(--faint)}
.http-headers{margin:0;padding:9px 16px 9px 15px;border-top:1px solid var(--line);background:var(--surface-2);
  font-family:var(--mono);font-size:12px;line-height:1.7}
.http-headers div{display:flex;gap:8px;min-width:0}
.http-headers dt{flex:none;color:var(--muted)}
.http-headers dt::after{content:":";color:var(--faint)}
.http-headers dd{margin:0;min-width:0;color:var(--ink);overflow-wrap:anywhere}
.http-body{margin:0;padding:14px 17px 15px;overflow-x:auto;border-top:1px solid var(--line)}
.doc .http-body code,.doc pre.code code{font-size:12.5px;line-height:1.65;white-space:pre;letter-spacing:0;
  background:none;box-shadow:none;border-radius:0;padding:0;color:var(--code-text)}
/* json */
.j-key{color:#9ecbff}
.j-str{color:#7ee3a6}
.j-num{color:#fbc078}
.j-lit{color:#c4a8ff;font-weight:var(--semi)}
.j-pun{color:var(--faint)}
/* sql: keywords carry the statement's shape, so they get the weight; names
   stay in the ink, and what is data - strings, numbers - takes the colours
   JSON uses for the same things */
.s-kw{color:#8ab8ff;font-weight:600}
.s-type{color:#67d4e6}
.s-fn{color:#c4a8ff}
.s-str{color:#7ee3a6}
.s-num{color:#fbc078}
.s-var{color:#f49ac1}
.s-id{color:var(--code-text)}
.s-com{color:#6b7480;font-style:italic}
.s-pun{color:var(--muted)}
@media (max-width:640px){
  .api-title,.http-kind{display:none}
  .api-row{grid-template-columns:1fr}
}
@media print{.api-body{display:block}.api-tog{display:none}}

/* ---- misc ---- */
.empty{padding:60px var(--gutter);width:100%;max-width:var(--column);margin-inline:auto;color:var(--muted)}
mark{background:rgba(77,163,255,.22);color:var(--ink);border-radius:3px;padding:0 2px}
@media (max-width:820px){
  .layout{grid-template-columns:var(--rail)}
  .layout:not(.collapsed) .main{display:none}
  :root{--gutter:20px}
  :root.fixed-margin{--column:100%}
  .docnav{grid-template-columns:1fr}
  .docnav-btn.next{grid-column:1;text-align:left}
  .head{width:calc(100% - 20px);margin-top:14px;padding-block:34px 36px}
  .head h1{font-size:29px}
  .rv-bar{position:static;margin-top:18px}
}
/* Not enough room beside the column to hang the arrow and the number in:
   bring them back into the heading row rather than let them fall off-screen. */
@media (max-width:1120px){
  .sec-gut{position:static;height:auto;margin-right:0;align-self:center}
  .sec-tog{opacity:1}
}
@media print{
  .side{display:none}.layout{grid-template-columns:1fr}
  .head{border:0;border-radius:0;padding-block:20px;background:none}.head::before,.head::after{display:none}
  .sec.shut>.sec-body{display:block}.sec-tog,.h-anchor,.rv,.rv-bar{display:none}
}
`;

export const CSS_BAR = `
.topbar{position:fixed;top:0;left:var(--rail);right:0;z-index:6;pointer-events:none;
  display:flex;height:46px;
  background:rgba(8,9,11,.78);backdrop-filter:saturate(160%) blur(14px);
  border-bottom:1px solid var(--line);transform:translateY(-101%);transition:transform .22s ease}
.topbar.show{transform:none}
.topbar-in{display:flex;align-items:center;gap:10px;min-width:0;width:100%;
  max-width:var(--column);margin-inline:auto;padding:0 var(--gutter)}
.topbar b{font-size:13.5px;font-weight:var(--bold);letter-spacing:-.012em}
.topbar span{font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`;

/* ------------------------------------------------------------- diagrams */

export const CSS_DIAGRAM = `
.diagram{position:relative;margin:0 0 22px;padding:0 18px 22px;background:var(--surface);
  border:1px solid var(--line);border-radius:18px;text-align:center;overflow-x:auto;max-width:100%}
.diagram-src{display:none}
.diagram svg{max-width:100%;height:auto}
/* The header: what the diagram is, and what can be done with it. It spans the
   frame (the negative margins undo the frame's side padding) and stays put
   while a diagram wider than the frame is scrolled sideways. */
.diagram-head{position:sticky;left:0;z-index:4;display:flex;align-items:center;gap:12px;min-height:40px;
  margin:0 -18px 20px;padding:6px 8px 6px 16px;border-bottom:1px solid var(--line);
  background:var(--surface);border-radius:18px 18px 0 0;text-align:left}
.diagram-name{flex:1;min-width:0;display:flex;align-items:baseline;gap:9px;overflow:hidden;white-space:nowrap}
.diagram-kind{flex:none;font-size:10px;font-weight:var(--bold);letter-spacing:.09em;text-transform:uppercase;color:var(--faint)}
.diagram-title{min-width:0;overflow:hidden;text-overflow:ellipsis;font-size:12.5px;font-weight:var(--semi);color:var(--ink)}
.diagram-bar{flex:none;display:flex;gap:5px}
.diagram-btn{padding:3px 11px;font:inherit;font-size:11px;color:var(--muted);
  background:transparent;border:1px solid var(--line-2);border-radius:999px;cursor:pointer;
  transition:color .12s,border-color .12s}
.diagram-btn:hover{color:var(--ink);border-color:rgba(255,255,255,.32)}
.diagram-btn:empty{display:none}
.diagram:has(svg):hover{border-color:var(--line-2)}
.diagram .fail{font-family:var(--mono);font-size:12px;color:var(--muted);text-align:left;white-space:pre-wrap}
.diagram-note{margin-top:10px;font-size:11px;color:var(--faint);text-align:center}
/* A collapsed diagram is its header and nothing else: a plain white box the
   height of a line, which a click opens again. */
.diagram.is-folded{padding-bottom:0;overflow:hidden;cursor:pointer}
.diagram.is-folded .diagram-head{margin-bottom:0;border-bottom-color:transparent}
.diagram.is-folded:hover{border-color:var(--line-2)}
.diagram.is-folded .diagram-out,.diagram.is-folded .diagram-note,
.diagram.is-folded .diagram-btn:not([data-act=fold]){display:none}
@media print{.diagram.is-folded{display:none}.diagram-bar{display:none}}

/* A wide diagram is allowed to spill a little past the text column - the point
   of the column is to keep prose readable, and a diagram is not prose. */
@media (min-width:1280px){.diagram,.table-wrap{width:calc(100% + 170px)}}

/* ---- the clean renderer ----
   Nothing here is decoration. Every rule exists so a reader can answer one of
   two questions in a dense chart: which arrow is this label on, and what
   touches this box. Hovering answers the first, clicking a node the second. */
svg.dg{display:block;margin-inline:auto;cursor:default;-webkit-user-select:none;user-select:none}
svg.dg text{font-family:var(--font);dominant-baseline:middle}
.dg-node-shape{fill:var(--dg-node);stroke:var(--dg-node-line);stroke-width:1.1}
.dg-node.is-root .dg-node-shape{fill:var(--bg)}
.dg-node-text{fill:var(--ink);font-size:12.5px}
.dg-group-shape{fill:var(--dg-group);stroke:var(--dg-group-line);stroke-width:1}
.dg-group-text{fill:var(--muted);font-size:12.5px;font-weight:560}
.dg-edge-line{fill:none;stroke:var(--dg-edge);stroke-width:1.3;stroke-linejoin:round}
.dg-edge-hit{fill:none;stroke:transparent;stroke-width:14;stroke-linejoin:round;cursor:pointer}
.dg-edge-text{fill:var(--dg-edge-text);font-size:11.5px}
/* arrowheads are drawn into the edge's own group, not shared <marker>s, so one
   rule recolours a head with its line and a cloned diagram carries its own */
.dg-head{fill:var(--dg-edge);stroke:none}
.dg-head-open{fill:var(--surface);stroke:var(--dg-edge);stroke-width:1.4}
/* the plate under a label: the label owns its own space, so this only has to
   survive the odd arc that ELK routes through the reserved band */
.dg-label-plate{fill:var(--surface);fill-opacity:.95}
/* the tie between a label and its arc: a hairline to a dot sitting on the arc
   itself, which is what makes "which arrow is this text on" a fact, not a guess */
.dg-tie{stroke:var(--dg-tie);stroke-width:1}
.dg-tie-dot{fill:var(--dg-edge)}
.dg-label{cursor:pointer}

/* hover states: two tiers, both fully lit - see .is-near below */
.dg-el{transition:opacity .12s ease}
svg.dg.has-hot .dg-el{opacity:.14}
svg.dg .dg-el.is-hot,svg.dg .dg-el.is-near{opacity:1}
.dg-el.is-hot .dg-edge-line{stroke:var(--dg-hot);stroke-width:2}
.dg-el.is-hot .dg-tie{stroke:var(--dg-hot)}
.dg-el.is-hot .dg-tie-dot{fill:var(--dg-hot)}
.dg-el.is-hot .dg-edge-text{fill:var(--dg-hot);font-weight:560}
.dg-el.is-hot .dg-label-plate{fill:var(--dg-hot-soft);fill-opacity:1}
.dg-el.is-hot .dg-node-shape{stroke:var(--dg-hot);stroke-width:2;fill:var(--dg-hot-soft)}
.dg-el.is-hot .dg-head{fill:var(--dg-hot)}
.dg-el.is-hot .dg-head-open{fill:var(--surface);stroke:var(--dg-hot)}
/* the box at the far end of a lit arrow: lit too - "where does this go" is the
   question being asked - but left unfilled, so which box the pointer is on stays
   obvious. Both tiers are fully opaque; only the untouched rest fades. */
.dg-el.is-near .dg-node-shape{stroke:var(--dg-hot);stroke-width:1.5}

/* ---- entities ----
   The reason ER gets the same treatment as flowcharts: mermaid draws an entity
   as a stack of text, so nothing lines up and every row has to be read in full.
   Here it is a table - the type column, the name column, and the keys pinned
   right - which is what lets the eye scan one column instead of all of them. */
.dg-er-head{fill:var(--dg-er-head);stroke:none;pointer-events:none}
.dg-er-rule{stroke:var(--dg-node-line);stroke-width:1}
.dg-er-sep{stroke:var(--dg-er-line);stroke-width:.8}
.dg-er-title{fill:var(--ink);font-size:13px;font-weight:600;letter-spacing:-.004em}
.dg-er-type{fill:var(--muted);font-size:11.6px}
.dg-er-name{fill:var(--ink);font-size:11.6px}
.dg-er-comment{fill:var(--faint);font-size:11.6px;font-style:italic}
.dg-er-badge{fill:var(--dg-er-badge);stroke:var(--dg-er-badge-line);stroke-width:.8}
.dg-er-badge.is-pk{fill:var(--dg-er-badge-pk);stroke:var(--dg-er-badge-pk-line)}
.dg-er-key{fill:var(--dg-er-badge-ink);font-size:9.4px;font-weight:600;letter-spacing:.02em}
/* on a wide entity the band is what keeps the eye on one row while it travels
   from the type on the left across to the keys on the right */
.dg-er-band{fill:transparent;transition:fill .12s ease}
.dg-er-row:hover .dg-er-band{fill:var(--dg-er-hover)}

/* crow's feet: line-drawn like the arrowheads, and lit by the same rules, so a
   relationship and both of its cardinalities light as one thing */
.dg-card-line{fill:none;stroke:var(--dg-edge);stroke-width:1.3;stroke-linecap:round}
.dg-card-ring{fill:var(--surface);stroke:var(--dg-edge);stroke-width:1.3}
.dg-card-dot{fill:var(--dg-edge);stroke:none}
.dg-el.is-hot .dg-card-line{stroke:var(--dg-hot);stroke-width:1.8}
.dg-el.is-hot .dg-card-ring{stroke:var(--dg-hot);stroke-width:1.8}
.dg-el.is-hot .dg-card-dot{fill:var(--dg-hot)}
.dg-el.is-hot .dg-er-head{fill:var(--dg-er-head-hot)}

/* the button in an entity's header that opens it to every column, and closes it */
.dg-er-more{cursor:pointer}
.dg-er-more-box{fill:var(--surface);stroke:var(--dg-node-line);stroke-width:1;transition:fill .12s,stroke .12s}
.dg-er-more-icon{fill:none;stroke:var(--muted);stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}
.dg-er-more:hover .dg-er-more-box{fill:var(--dg-hot-soft);stroke:var(--dg-hot)}
.dg-er-more:hover .dg-er-more-icon{stroke:var(--dg-hot)}
.dg-er-more.is-open .dg-er-more-box{fill:var(--dg-er-badge-pk);stroke:var(--dg-er-badge-pk-line)}
.dg-er-more.is-open .dg-er-more-icon{stroke:var(--ink)}
.dg-er-more.is-open:hover .dg-er-more-box{fill:var(--dg-hot-soft);stroke:var(--dg-hot)}

/* ---- an opened entity ----
   The same table with every column a schema document writes down, and the
   notes above it - in the faces and weights of the compact table, so opening
   an entity adds columns without changing how the ones already there read.
   The sizes here are the ones the layout measures with: change them together. */
.dg-er-x-label{fill:var(--faint);font-size:9.2px;font-weight:620;letter-spacing:.07em}
.dg-er-x-name{font-weight:560}
.dg-er-x-code{font-family:var(--mono);font-size:10.8px;fill:var(--dg-text-2)}
.dg-er-x-bold{font-weight:620}
.dg-er-note,.dg-er-desc{fill:var(--dg-text-2);font-size:11.6px}
.dg-er-bullet{fill:var(--faint)}
.dg-er-ref{fill:var(--muted);font-size:10.6px}
/* text.dg-er-def, to outweigh svg.dg text, which sets the family of every label */
svg.dg text.dg-er-def{fill:var(--dg-text-2);font-family:var(--mono);font-size:10.8px}
.dg-er-none{fill:var(--faint);font-size:11px}
.dg-er-notnull{fill:var(--faint);font-size:9.4px;font-weight:600;letter-spacing:.02em}
.dg-er-null{fill:var(--dg-seq-note);stroke:var(--dg-seq-note-line);stroke-width:.8}
.dg-er-null-text{fill:var(--dg-seq-note-ink);font-size:9.4px;font-weight:600;letter-spacing:.02em}
/* laid out again around it: the entities glide (inline transitions), and the
   relationships fade back in once their new routes are drawn */
.dg-reflow .dg-edges,.dg-reflow .dg-labels{animation:dg-fade-in .3s ease-out .18s both}
.dg-er-opening{animation:dg-fade-in .24s ease-out both}
@keyframes dg-fade-in{from{opacity:0}}
/* what an entity is for, shown while the pointer is on it */
.dg-tip{position:fixed;z-index:70;max-width:min(440px,calc(100vw - 16px));padding:9px 12px;text-align:left;
  font-size:12.5px;line-height:1.5;color:var(--ink);background:#20252c;border:1px solid var(--line-2);border-radius:12px;
  pointer-events:none;box-shadow:0 14px 36px -12px rgba(0,0,0,.7);animation:dg-fade-in .12s ease-out}
.dg-tip p{margin:0}
.dg-tip p+p{margin-top:6px}
.dg-tip code{font-family:var(--mono);font-size:.88em;background:rgba(255,255,255,.13);border-radius:4px;padding:.05em .3em}
@media print{.dg-er-more,.dg-tip{display:none}}

/* ---- sequences ----
   Participants are nodes and messages are edges, so hovering and pinning run
   on the rules above; what follows is only what a sequence adds. Frames, notes
   and participant boxes are the ground the messages sit on: they fade part of
   the way with the rest, never all the way, so a lit message keeps its context. */
.dg-seq-life{stroke:var(--dg-life);stroke-width:1.1}
.dg-seq-life-hit{stroke:transparent;stroke-width:12;cursor:pointer}
.dg-seq-actor{font-weight:560;letter-spacing:-.004em}
.dg-seq-glyph{fill:none;stroke:var(--muted);stroke-width:1.2}
.dg-seq-bar{fill:var(--dg-group);stroke:var(--dg-node-line);stroke-width:1}
.dg-seq-x{fill:none;stroke:var(--dg-edge);stroke-width:1.7;stroke-linecap:round}
.dg-seq-text{fill:var(--dg-text-2)}
.dg-head-line{fill:none;stroke:var(--dg-edge);stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}
.dg-seq-num{fill:var(--dg-seq-num);stroke:var(--surface);stroke-width:1.5}
.dg-seq-num-text{fill:#fff;font-size:9.6px;font-weight:620}
.dg-seq-frame{fill:rgba(255,255,255,.015);stroke:var(--dg-life);stroke-width:1}
.dg-seq-split{stroke:var(--dg-tie);stroke-width:1;stroke-dasharray:5 4}
.dg-seq-tab{fill:var(--dg-er-badge);stroke:var(--dg-life);stroke-width:1}
.dg-seq-kw{fill:var(--dg-er-badge-ink);font-size:9.4px;font-weight:620;letter-spacing:.05em}
.dg-seq-cond{fill:var(--muted);font-size:11.5px}
.dg-seq-rect{fill:var(--dg-group);fill-opacity:.8}
.dg-seq-note{fill:var(--dg-seq-note);stroke:var(--dg-seq-note-line);stroke-width:1}
.dg-seq-note-text{fill:var(--dg-seq-note-ink);font-size:11.5px}
.dg-seq-box{fill:var(--dg-group);stroke:var(--dg-group-line);stroke-width:1}
.dg-seq-box-text{fill:var(--muted);font-size:12px;font-weight:560}
.dg-seq-title{fill:var(--ink);font-size:14px;font-weight:620}
.dg-seq-boxes,.dg-seq-frames,.dg-seq-notes,.dg-seq-marks{transition:opacity .12s ease}
svg.dg.has-hot .dg-seq-boxes,svg.dg.has-hot .dg-seq-frames,
svg.dg.has-hot .dg-seq-notes,svg.dg.has-hot .dg-seq-marks{opacity:.4}
.dg-el.is-hot .dg-seq-life{stroke:var(--dg-hot);stroke-width:1.6}
.dg-el.is-near .dg-seq-life{stroke:var(--dg-hot);stroke-opacity:.5}
.dg-el.is-hot .dg-seq-bar{stroke:var(--dg-hot)}
.dg-el.is-hot .dg-seq-x{stroke:var(--dg-hot)}
.dg-el.is-hot .dg-head-line{stroke:var(--dg-hot)}
.dg-el.is-hot .dg-seq-num{fill:var(--dg-hot)}
.dg-el.is-hot .dg-seq-num-text{fill:var(--on-ink)}
.dg-el.is-hot .dg-seq-text{fill:var(--dg-hot)}
/* the participant row that rides along the top of a long sequence */
.dg-float{position:absolute;left:0;right:0;top:0;z-index:3;pointer-events:none;opacity:0;visibility:hidden;
  background:rgba(19,22,27,.93);backdrop-filter:blur(6px);border-bottom:1px solid var(--line);
  box-shadow:0 8px 16px -12px rgba(0,0,0,.6);transition:opacity .15s ease,visibility .15s}
.dg-float.on{opacity:1;visibility:visible}
.dg-float svg.dg{position:absolute;top:0;margin:0;max-width:none}
.dg-float.on .dg-node{pointer-events:auto;cursor:pointer}

/* a box given a light fill by a classDef, written for a light page: its text
   goes dark, so the fill still reads as the author meant it */
svg.dg .dg-node.on-light text{fill:#141a26}
svg.dg .dg-node.on-light .dg-er-type,svg.dg .dg-node.on-light .dg-er-comment,
svg.dg .dg-node.on-light .dg-er-ref,svg.dg .dg-node.on-light .dg-er-x-label{fill:#4f5664}
svg.dg .dg-node.on-light .dg-er-key{fill:var(--dg-er-badge-ink)}

@media print{svg.dg.has-hot .dg-el{opacity:1}
  svg.dg.has-hot .dg-seq-boxes,svg.dg.has-hot .dg-seq-frames,
  svg.dg.has-hot .dg-seq-notes,svg.dg.has-hot .dg-seq-marks{opacity:1}
  .dg-float{display:none}}
`;

export const CSS_LIGHTBOX = `
.lightbox{position:fixed;inset:0;z-index:50;display:none;background:rgba(8,9,11,.94);
  backdrop-filter:blur(8px);cursor:grab}
.lightbox.on{display:block}
.lightbox.drag{cursor:grabbing}
.lightbox-stage{position:absolute;top:50%;left:50%;transform-origin:center;will-change:transform}
.lightbox-stage svg{max-width:none}
.lightbox-bar{position:absolute;top:16px;right:18px;display:flex;gap:6px;align-items:center;
  font-size:11.5px;color:var(--muted)}
.lightbox-bar button{padding:4px 12px;font:inherit;font-size:12px;background:var(--surface);
  border:1px solid var(--line-2);border-radius:999px;color:var(--ink);cursor:pointer}
.lightbox-bar button:hover{background:var(--surface-2)}
`;

export const CSS_CMT = `
/* ---- comments: sidebar footer ---- */
/* ---- comments: the count beside the switch in the settings ---- */
.cmt-n{margin-left:4px;padding:1px 7px;border-radius:20px;background:var(--surface);border:1px solid var(--line);
  font-size:11px;font-weight:400;font-variant-numeric:tabular-nums;color:var(--muted)}

/* ---- comments: highlight + margin cards ----
   A highlight and its card are two views of one comment, so hovering either
   lights both (.hot); clicking either pins the pair (.on). */
.body-wrap{position:relative;display:flex;flex-direction:column;min-height:100vh}
.cmt-hl{background:rgba(77,163,255,.16);box-shadow:inset 0 -1px 0 rgba(77,163,255,.6);border-radius:3px;padding:0 1px;
  color:inherit;cursor:pointer;transition:background .12s,box-shadow .12s}
.cmt-hl.hot{background:rgba(77,163,255,.26);box-shadow:inset 0 -1px 0 rgba(77,163,255,.8)}
.cmt-hl.on{background:rgba(77,163,255,.36);box-shadow:inset 0 -1px 0 var(--accent)}
.cmt-layer{position:absolute;inset:0;pointer-events:none;z-index:2}
.cmt-card{position:absolute;left:0;top:0;width:var(--cmt-w,264px);pointer-events:auto;padding:10px 12px;
  background:var(--surface);border:1px solid var(--line);border-radius:14px;cursor:pointer;
  font-size:12.5px;line-height:1.55;transition:border-color .15s ease,box-shadow .15s ease}
.cmt-card.hot{border-color:rgba(77,163,255,.45);box-shadow:0 4px 16px rgba(0,0,0,.4)}
.cmt-card.on{border-color:rgba(77,163,255,.7);box-shadow:0 6px 20px rgba(0,0,0,.5)}
.cmt-card[hidden]{display:none!important}
.cmt-face{display:none}
.cmt-quote{margin:0 0 7px;padding-left:9px;border-left:2px solid rgba(77,163,255,.6);color:var(--muted);
  font-size:11.5px;line-height:1.45;overflow:hidden;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.cmt-text{white-space:pre-wrap;overflow-wrap:anywhere}
.cmt-foot{margin-top:9px;display:flex;align-items:center;gap:9px;font-size:11px;color:var(--faint)}
.cmt-when{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cmt-act{padding:0;border:0;background:none;color:var(--muted);font:inherit;font-size:11px;
  cursor:pointer;border-bottom:1px solid transparent}
.cmt-act:hover{color:var(--ink);border-bottom-color:var(--ink)}
.cmt-lost{margin:0 0 5px;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--accent)}

/* tight gutters: the card shrinks to a numbered dot, opened as a popover */
.cmt-layer.dots .cmt-card{width:22px;height:22px;padding:0;border-radius:50%;
  background:#10284d;border-color:#2f6db3;display:grid;place-items:center;overflow:hidden}
.cmt-layer.dots .cmt-card.hot,.cmt-layer.dots .cmt-card.on{background:#16386b;border-color:var(--accent)}
.cmt-layer.dots .cmt-full{display:none}
.cmt-layer.dots .cmt-face{display:block;font-size:11px;font-weight:var(--bold);color:#a9d2ff;
  font-variant-numeric:tabular-nums}

/* ---- comments: floating bits ---- */
.cmt-add{position:fixed;z-index:9;padding:5px 13px;background:var(--ink);color:var(--on-ink);border:0;
  border-radius:999px;font:inherit;font-size:12px;font-weight:var(--semi);cursor:pointer;
  box-shadow:0 4px 16px rgba(0,0,0,.5)}
.cmt-add:hover{background:var(--ink-hover)}
.cmt-pop{position:fixed;z-index:9;width:290px;max-width:calc(100vw - 24px);padding:12px;
  background:var(--surface-2);border:1px solid var(--line-2);border-radius:16px;font-size:12.5px;
  line-height:1.55;box-shadow:0 14px 40px rgba(0,0,0,.6)}
.cmt-pop textarea{display:block;width:100%;min-height:80px;margin:0 0 9px;padding:8px 10px;
  border:1px solid var(--line);border-radius:12px;background:var(--bg);color:var(--ink);
  font:inherit;font-size:12.5px;line-height:1.55;resize:vertical;outline:none}
.cmt-pop textarea:focus{border-color:var(--accent-ring)}
.cmt-row{display:flex;align-items:center;gap:8px}
.cmt-row .cmt-spacer{flex:1}
.cmt-btn{padding:5px 13px;border:1px solid var(--line-2);border-radius:999px;background:transparent;
  color:var(--ink);font:inherit;font-size:12px;cursor:pointer;transition:.15s}
.cmt-btn:hover{background:var(--hover);border-color:rgba(255,255,255,.32)}
.cmt-btn.go{background:var(--ink);border-color:var(--ink);color:var(--on-ink);font-weight:var(--semi)}
.cmt-btn.go:hover{background:var(--ink-hover);border-color:var(--ink-hover)}
.cmt-toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:10;padding:8px 16px;
  background:var(--ink);color:var(--on-ink);border-radius:999px;font-size:12.5px;font-weight:var(--semi);
  box-shadow:0 8px 26px rgba(0,0,0,.55)}
@media print{.cmt-layer,.cmt-add,.cmt-pop,.cmt-toast{display:none}}
`;

/* ---- settings ----
   A dialog in the middle of the page. The veil behind it dims the page only a
   little, so a change is still seen on the documents as it is made, and it
   takes the click that closes the dialog, so that click lands on nothing else. */
export const CSS_SETTINGS = `
.settings-veil{position:fixed;inset:0;z-index:39;background:rgba(4,5,7,.42);animation:dg-fade-in .16s ease-out}
.settings-veil[hidden]{display:none}
.settings{position:fixed;z-index:40;top:50%;left:50%;transform:translate(-50%,-50%);width:360px;
  max-width:calc(100vw - 32px);max-height:calc(100vh - 32px);overflow-y:auto;padding:16px 18px;
  background:var(--surface-2);border:1px solid var(--line-2);border-radius:20px;
  box-shadow:0 24px 60px -16px rgba(0,0,0,.8);
  font-size:13px;line-height:1.45;animation:settings-in .16s ease-out}
@keyframes settings-in{from{opacity:0;transform:translate(-50%,calc(-50% + 6px))}}
.settings[hidden]{display:none}
.settings-head{display:flex;align-items:center;justify-content:space-between;margin:-4px -6px 8px 0}
.settings-head b{font-size:13.5px;font-weight:var(--bold);letter-spacing:-.012em}
.settings-row{padding:10px 0 12px;border-top:1px solid var(--line)}
.settings-label{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px}
.settings-label label{font-weight:var(--semi)}
.settings-val{font-variant-numeric:tabular-nums;color:var(--muted)}
.settings input[type=range]{display:block;width:100%;margin:0;accent-color:var(--accent);cursor:pointer}
.settings-hint{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-top:6px;
  font-size:11.5px;color:var(--faint)}
.settings-link{padding:0;border:0;border-bottom:1px solid var(--line);background:none;font:inherit;
  color:var(--muted);cursor:pointer}
.settings-link:hover{color:var(--ink);border-bottom-color:var(--ink)}
.settings-link:disabled{color:var(--faint);border-bottom-color:transparent;cursor:default}
/* an on/off setting: a pill with a knob, lit when on */
.switch{flex:none;position:relative;width:34px;height:20px;padding:0;border:1px solid var(--line-2);
  border-radius:999px;background:var(--surface);cursor:pointer;transition:background .15s,border-color .15s}
.switch::after{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
  background:var(--muted);transition:transform .18s ease,background .15s}
.switch[aria-checked=true]{background:var(--accent);border-color:var(--accent)}
.switch[aria-checked=true]::after{transform:translateX(14px);background:var(--on-ink)}
.switch:focus-visible{outline:2px solid var(--accent-ring);outline-offset:2px}
.settings-foot{padding-top:9px;border-top:1px solid var(--line);font-size:11.5px;color:var(--muted)}
.settings-foot.bad{color:#ff9393}
.settings-foot code{font-family:var(--mono);font-size:.92em}
@media print{.settings,.settings-veil{display:none}}
`;

export const allCss = () => CSS + CSS_MAIN + CSS_BAR + CSS_DIAGRAM + CSS_LIGHTBOX + CSS_CMT + CSS_SETTINGS;
