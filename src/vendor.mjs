// vendor.mjs
// ------------------------------------------------------------------
// The page is a single file:// document with no server and no npm install,
// so everything it needs travels with it. Each asset is fetched once and
// cached under <out>/vendor; --refresh re-fetches.
//
// Every asset is pinned twice: by version, and by the SHA-384 of its bytes.
// A download that does not match is refused, and so is a cached copy that
// does not - which is also how a cache left by another version is replaced.
// Whatever happens to the CDN, the page runs the bytes that were checked
// here. Bumping a version means bumping its hash: take it from the file in
// the npm tarball (npm pack <name>@<version>), never from the CDN.
//
// If a fetch fails the build still succeeds: mermaid falls back to its CDN
// (the page then needs a network connection, and the browser checks the same
// hash), ELK simply is not offered (flowcharts render with mermaid), and the
// font falls back to the system.
//
// The licenses of all three ship in licenses/ and are written beside them as
// vendor/THIRD-PARTY-NOTICES.txt. The font's goes inside the page as well,
// since the font itself does.
// ------------------------------------------------------------------

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Pinned on purpose: a diagram that renders today should render the same way
// in a year, and a surprise major version should not land in someone's docs.
export const MERMAID_VERSION = '11.17.2';
export const ELK_VERSION = '0.12.0';
// @fontsource-variable/inter, which carries Inter 4.001
export const INTER_VERSION = '5.3.0';

export const NOTICES_FILE = 'THIRD-PARTY-NOTICES.txt';

const CDN = 'https://cdn.jsdelivr.net/npm/';
const LICENSES = new URL('../licenses/', import.meta.url);

const MERMAID = {
  url: CDN + 'mermaid@' + MERMAID_VERSION + '/dist/mermaid.min.js',
  file: 'mermaid.min.js',
  sha384: 'sha384-EOXBFmc3gx5mb+vn0vPvvGqACToJD24hhacX5Yx+8NUUQrHIle/Qi5Bg9o3zKwW2',
};
const ELK = {
  url: CDN + 'elkjs@' + ELK_VERSION + '/lib/elk.bundled.js',
  file: 'elk.bundled.js',
  sha384: 'sha384-ww57TDqx4cGknIavPm0QKO+aygLUR1BLSn2Vhbnt1XdYKWcwLyWTFKX7aZMaKIi2',
};
// The variable font with both of its axes, optical size and weight. Latin
// only - the other subsets triple the page for glyphs no doc uses.
const INTER = [
  { style: 'normal', sha384: 'sha384-J6qsAXAqf6o0318WxA4xhF/vxuL4NhwP9fFcjHZXsSqdyKns1va+jGgjyn5XiIJL' },
  { style: 'italic', sha384: 'sha384-wxEgdtMgsytE2z0IplCB84KY2MIh0AXdBHiaX7U1ghRtSnew3nsMP2GBUCzhRCsP' },
].map((face) => ({
  ...face,
  url: CDN + '@fontsource-variable/inter@' + INTER_VERSION + '/files/inter-latin-opsz-' + face.style + '.woff2',
  file: 'inter-latin-' + face.style + '.woff2',
}));

const NOTICES = [
  {
    name: 'Mermaid ' + MERMAID_VERSION, where: 'vendor/' + MERMAID.file, license: 'mermaid.txt',
    source: 'https://github.com/mermaid-js/mermaid',
    more: 'mermaid.min.js also contains Mermaid\'s own dependencies, each under its own license:\n' +
      'they are listed in Mermaid\'s package.json, at the source above.',
  },
  {
    name: 'ELK (elkjs) ' + ELK_VERSION, where: 'vendor/' + ELK.file, license: 'elkjs.txt',
    source: 'https://github.com/kieler/elkjs',
    more: 'The source code of elkjs is available under the license below, at the address above.',
  },
  {
    name: 'Inter 4.001 (@fontsource-variable/inter ' + INTER_VERSION + ')', where: 'inlined in index.html', license: 'inter.txt',
    source: 'https://github.com/rsms/inter',
  },
];

const sri = (bytes) => 'sha384-' + crypto.createHash('sha384').update(bytes).digest('base64');
const license = (file) => fs.readFileSync(new URL(file, LICENSES), 'utf8');

// The asset's bytes: the cached copy while it is still the pinned one, else a
// fresh download, which is kept only if it is.
async function pinned(asset, outDir, refresh) {
  const dest = path.join(outDir, 'vendor', asset.file);
  if (!refresh) {
    try {
      const cached = fs.readFileSync(dest);
      if (sri(cached) === asset.sha384) return { bytes: cached, fresh: false };
    } catch { /* not cached yet */ }
  }
  const res = await fetch(asset.url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const bytes = Buffer.from(await res.arrayBuffer());
  if (sri(bytes) !== asset.sha384) throw new Error('checksum mismatch, download refused');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, bytes);
  return { bytes, fresh: true };
}

async function vendorScript(asset, outDir, refresh, optional) {
  try {
    const { bytes, fresh } = await pinned(asset, outDir, refresh);
    return {
      tag: { src: 'vendor/' + asset.file },
      note: fresh ? 'downloaded (' + (bytes.length / 1024 / 1024).toFixed(1) + ' MB)' : 'cached',
    };
  } catch (err) {
    if (optional) return { tag: null, note: 'unavailable (' + err.message + ')' };
    return { tag: { src: asset.url, integrity: asset.sha384 }, note: 'CDN fallback (' + err.message + ')' };
  }
}

export const vendorMermaid = (outDir, refresh) => vendorScript(MERMAID, outDir, refresh, false);

export const vendorElk = (outDir, refresh) => vendorScript(ELK, outDir, refresh, true);

// Inter, as a variable font inlined into the page. A file:// origin will not
// fetch a font over CORS even from the folder next to it, so the woff2 has to
// travel as a data: URI, with its license in a comment above it.
export async function vendorFont(outDir, refresh) {
  // the stylesheet versions before the font was pinned cached in its place
  fs.rmSync(path.join(outDir, 'vendor', 'inter.css'), { force: true });
  try {
    const faces = [];
    let fetched = false;
    for (const face of INTER) {
      const { bytes, fresh } = await pinned(face, outDir, refresh);
      fetched = fetched || fresh;
      faces.push('@font-face{font-family:Inter;font-weight:100 900;font-display:swap;font-style:' + face.style +
        ';src:url(data:font/woff2;base64,' + bytes.toString('base64') + ') format("woff2")}');
    }
    const css = '/*! The Inter typeface, inlined below\n\n' + license('inter.txt') + '*/\n' + faces.join('\n');
    return { css, note: fetched ? 'downloaded (' + (Buffer.byteLength(css) / 1024).toFixed(0) + ' KB inlined)' : 'cached' };
  } catch (err) {
    return { css: '', note: 'system fallback (' + err.message + ')' };
  }
}

// The licenses of everything above, beside the files they cover. Written on
// every build, so it always matches the versions pinned here.
export function writeNotices(outDir) {
  const rule = '-'.repeat(72);
  const text = 'Third-party software used by index.html\n\n' +
    'Each component below keeps its own license, reproduced in full.\n\n' +
    NOTICES.map((n) => rule + '\n' + n.name + '  -  ' + n.where + '\nSource: ' + n.source + '\n' +
      (n.more ? n.more + '\n' : '') + rule + '\n\n' + license(n.license).trimEnd() + '\n').join('\n');
  const dest = path.join(outDir, 'vendor', NOTICES_FILE);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, text);
}
