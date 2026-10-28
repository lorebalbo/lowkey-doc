// config.mjs
// ------------------------------------------------------------------
// Everything the builder needs to know about one project, resolved from
// (in increasing priority): the defaults below, a docs.config.json found
// next to the documents or at the project root, and the command line.
//
// Zero configuration is a supported way to run: point the tool at a folder
// of Markdown and it renders.
// ------------------------------------------------------------------

import fs from 'node:fs';
import path from 'node:path';

// the range layout.margin can take, and the page's slider with it
export const MARGIN_MIN = 20, MARGIN_MAX = 480;

export const CONFIG_NAMES = ['docs.config.json', '.lowkey-doc.json'];
// where the Reviewed marks are kept, at the project root beside the config
export const REVIEWS_FILE = 'docs.reviews.json';

export const VERSION = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;

// What to tell people to type: npm sets npm_command to "exec" under npx, and
// someone running it that way has no lowkey-doc on their PATH.
export const CLI = process.env.npm_command === 'exec' ? 'npx lowkey-doc' : 'lowkey-doc';

const DEFAULTS = {
  // Shown in the sidebar, the browser tab, and used to namespace the
  // per-reader state (which document was open, folded sections, comments, reviews).
  title: null,                       // null -> derived from the project folder
  // Where the documents are, relative to the project root.
  docs: 'docs',
  // Where the built page goes, relative to the project root.
  out: '.lowkey-doc',
  // Files taken as documents. Markdown is rendered; everything else is shown
  // verbatim in a code block, which is how schema dumps stay readable.
  extensions: ['.md', '.markdown'],
  verbatim: {
    '.dbml': 'Schema',
    '.dbdiagram': 'Schema',
    '.sql': 'Schema',
    '.json': 'Data',
    '.yaml': 'Data',
    '.yml': 'Data',
    '.tsv': 'Data',
    '.csv': 'Data',
  },
  // The sidebar heading for documents sitting directly in the docs folder.
  rootGroup: 'Documents',
  // Sub-folders become their own group, named after the folder. List them here
  // to fix the order; anything not listed follows, alphabetically.
  groupOrder: [],
  diagrams: {
    // 'clean'   - re-lay flowcharts and ER diagrams out with ELK: right-angled
    //             routes, every edge label given its own reserved space and tied
    //             to its arc, and entities drawn as tables rather than grids.
    // 'mermaid' - mermaid's own renderer for everything.
    // Either way the reader can switch per diagram from the page.
    engine: 'clean',
    // Cap on how wide a node's text runs before it wraps, in pixels.
    nodeTextWidth: 210,
    edgeTextWidth: 200,
  },
  layout: {
    // The room either side of the text, from the edge of the reading area to
    // where the text starts, in pixels. null keeps the column at its reading
    // width and centres it, so the room either side is whatever is left over.
    // Set from the page itself too: the settings button in the sidebar.
    margin: null,
  },
  // Reader features. Turn off what a given project does not want.
  comments: true,
  reviews: true,
  search: true,
};

const titleCase = (s) => s
  .replace(/[-_]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/^\p{Ll}/u, (c) => c.toUpperCase());

function deepMerge(base, over) {
  if (!over || typeof over !== 'object' || Array.isArray(over)) return over === undefined ? base : over;
  const out = Array.isArray(base) ? base.slice() : { ...base };
  for (const [k, v] of Object.entries(over)) {
    out[k] = (v && typeof v === 'object' && !Array.isArray(v) && base && typeof base[k] === 'object')
      ? deepMerge(base[k], v)
      : v;
  }
  return out;
}

// Look for a config file next to the documents, then up the tree from there.
export function findConfig(startDir) {
  let dir = path.resolve(startDir);
  for (let hop = 0; hop < 12; hop++) {
    for (const name of CONFIG_NAMES) {
      const file = path.join(dir, name);
      if (fs.existsSync(file)) return file;
    }
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return null;
}

// `folder` is a documents folder named on the command line. It replaces the
// configured `docs` and nothing else: the config is still looked for, from
// that folder upwards, and the page still goes to the project root - the
// config's folder, or else wherever the command was run.
export function loadConfig({ root, docs, folder, out, title, configPath, engine }) {
  let file = configPath ? path.resolve(configPath) : null;
  if (file && !fs.existsSync(file)) throw new Error('No config file at ' + file);
  if (!file) file = findConfig(folder || root || process.cwd());

  let fromFile = {};
  if (file) {
    try {
      fromFile = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
      throw new Error('Could not read ' + file + ': ' + err.message);
    }
  }

  // The project root is the config file's folder, or wherever we were pointed.
  const projectRoot = path.resolve(root || (file ? path.dirname(file) : process.cwd()));

  const cfg = deepMerge(DEFAULTS, fromFile);
  // `verbatim` is a list of what to include, not a bag of settings: writing one
  // replaces the defaults, so a project can narrow it rather than only add to it.
  if (fromFile.verbatim) cfg.verbatim = fromFile.verbatim;
  if (docs) cfg.docs = docs;
  if (folder) cfg.docs = path.relative(projectRoot, folder) || '.';
  if (out) cfg.out = out;
  if (title) cfg.title = title;
  if (engine) cfg.diagrams = { ...cfg.diagrams, engine };

  cfg.root = projectRoot;
  cfg.docsDir = path.resolve(projectRoot, cfg.docs);
  cfg.outDir = path.resolve(projectRoot, cfg.out);
  cfg.configFile = file;
  cfg.reviewsFile = cfg.reviews === false ? null : path.join(projectRoot, REVIEWS_FILE);
  if (!cfg.title) cfg.title = titleCase(path.basename(projectRoot)) + ' Docs';

  // Namespace for everything the reader's browser remembers. Two dashboards
  // opened from file:// can otherwise land in the same storage bucket.
  cfg.ns = 'lowkey-doc:' + cfg.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const margin = cfg.layout && cfg.layout.margin;
  if (margin != null && !(Number.isFinite(margin) && margin >= MARGIN_MIN && margin <= MARGIN_MAX)) {
    throw new Error('layout.margin must be null or a number of pixels from ' + MARGIN_MIN + ' to ' +
      MARGIN_MAX + ', got: ' + JSON.stringify(margin));
  }
  if (!['clean', 'mermaid'].includes(cfg.diagrams.engine)) {
    throw new Error("diagrams.engine must be 'clean' or 'mermaid', got: " + cfg.diagrams.engine);
  }
  return cfg;
}

// A config object as text, written the way the file already was: its indent,
// its line endings. `before` is the file's old text, or null for a new file.
export function jsonLike(before, obj) {
  const indent = (before && (before.match(/\n([ \t]+)"/) || [])[1]) || 2;
  const eol = before && before.includes('\r\n') ? '\r\n' : '\n';
  return (JSON.stringify(obj, null, indent) + '\n').replace(/\n/g, eol);
}

export { DEFAULTS, titleCase };
