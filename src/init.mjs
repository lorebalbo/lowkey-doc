// init.mjs - wire an existing project up to the dashboard.
//
// Writes a docs.config.json if there isn't one, creates the documents folder
// it names, and installs the Claude Code command and skills into the
// project's .claude/ folder so the agent working in that repo knows how to
// write and render its documents.
//
// A config that already exists is never replaced: --docs and --title edit just
// those fields in it. --force is about the Claude files only - it replaces
// them with this version's copies.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG_NAMES, DEFAULTS, VERSION, jsonLike, titleCase } from './config.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PKG = path.resolve(HERE, '..');

// The Claude files run the version that installed them, never whatever is
// newest on npm: a new release reaches a project when someone there runs
// init --force, not the next time an agent renders the docs.
function copyPinned(from, to) {
  if (!from.endsWith('.md')) return fs.copyFileSync(from, to);
  fs.writeFileSync(to, fs.readFileSync(from, 'utf8').replace(/npx lowkey-doc(?!@)/g, 'npx lowkey-doc@' + VERSION));
}

function copyTree(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copyTree(a, b);
    else copyPinned(a, b);
  }
}

export function init(target, { docs = null, title = null, force = false } = {}) {
  const root = path.resolve(target || process.cwd());
  const done = [];
  const skipped = [];
  let kept = false;   // a Claude file was left as it was

  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
    done.push(path.relative(process.cwd(), root) + '/');
  } else if (!fs.statSync(root).isDirectory()) {
    throw new Error('Not a folder: ' + root);
  }

  const existing = CONFIG_NAMES.map((n) => path.join(root, n)).find((f) => fs.existsSync(f));
  let config;
  if (existing) {
    const before = fs.readFileSync(existing, 'utf8');
    try {
      config = JSON.parse(before);
    } catch (err) {
      throw new Error('Could not read ' + existing + ': ' + err.message);
    }
    const changed = Object.entries({ docs, title }).filter(([k, v]) => v != null && config[k] !== v);
    for (const [k, v] of changed) config[k] = v;
    if (changed.length) {
      fs.writeFileSync(existing, jsonLike(before, config));
      done.push(path.basename(existing) + ' (' + changed.map(([k, v]) => k + ': ' + JSON.stringify(v)).join(', ') + ')');
    } else {
      skipped.push(path.basename(existing) + ' (already there)');
    }
  } else {
    config = {
      title: title || titleCase(path.basename(root)) + ' Docs',
      docs: docs || DEFAULTS.docs,
      out: DEFAULTS.out,
    };
    fs.writeFileSync(path.join(root, CONFIG_NAMES[0]), jsonLike(null, config));
    done.push(CONFIG_NAMES[0]);
  }

  // the folder the config names, so the next build has somewhere to read
  const docsDir = path.resolve(root, config.docs || DEFAULTS.docs);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
    fs.writeFileSync(path.join(docsDir, '0. ABOUT.md'),
      '# ABOUT\n\n> What this project is, in plain language.\n\n---\n\n## Start here\n\nReplace this file with the real thing.\n');
    done.push(path.relative(root, docsDir) + '/');
  }

  // the agent-facing half: one command to render, two skills to write and audit
  const claude = path.join(root, '.claude');
  for (const [src, dest] of [
    [path.join(PKG, 'commands', 'docs.md'), path.join(claude, 'commands', 'docs.md')],
    [path.join(PKG, 'skills', 'write-doc'), path.join(claude, 'skills', 'write-doc')],
    [path.join(PKG, 'skills', 'audit-docs'), path.join(claude, 'skills', 'audit-docs')],
  ]) {
    if (!fs.existsSync(src)) continue;
    const there = fs.existsSync(dest);
    if (there && !force) { skipped.push(path.relative(root, dest) + ' (already there)'); kept = true; continue; }
    // replaced whole, so a file an older version shipped does not linger
    if (fs.statSync(src).isDirectory()) { fs.rmSync(dest, { recursive: true, force: true }); copyTree(src, dest); }
    else { fs.mkdirSync(path.dirname(dest), { recursive: true }); copyPinned(src, dest); }
    done.push(path.relative(root, dest) + (there ? ' (replaced)' : ''));
  }

  return { root, done, skipped, kept };
}
