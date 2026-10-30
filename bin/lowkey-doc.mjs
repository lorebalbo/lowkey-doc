#!/usr/bin/env node
// lowkey-doc
// ------------------------------------------------------------------
// Render a folder of Markdown into one static, self-contained
// documentation dashboard and open it in the browser.
//
//   lowkey-doc                    build the folder in docs.config.json, else docs/
//   lowkey-doc ./docs             build this folder instead
//   lowkey-doc --no-open          build only
//   lowkey-doc --out <dir>        write somewhere else
//   lowkey-doc --refresh          re-download the vendored assets
//   lowkey-doc --engine mermaid   default every diagram to mermaid's layout
//   lowkey-doc --watch            serve it on localhost, update on every save
//   lowkey-doc init [dir]         wire a project up
//
// Output: <out>/index.html plus a vendor/ folder. The page is plain file://
// HTML - no server, no network, no npm dependencies. --watch serves the same
// page while you write, and is the only mode that runs a server.
// ------------------------------------------------------------------

import fs from 'node:fs';
import path from 'node:path';
import { loadConfig, CLI, VERSION } from '../src/config.mjs';
import { build } from '../src/build.mjs';
import { init } from '../src/init.mjs';
import { watch, DEFAULT_PORT } from '../src/watch.mjs';
import { checkForUpdate } from '../src/update.mjs';

// Every option each mode accepts, and whether it takes a value. Anything else
// is an error: a typo that silently does something else is worse than a stop.
const COMMON = { '--help': false, '-h': false, '--version': false, '-v': false };
const BUILD = {
  ...COMMON, '--out': true, '--config': true, '--title': true, '--engine': true,
  '--watch': false, '-w': false, '--port': true, '--no-open': false, '--refresh': false,
};
const INIT = { ...COMMON, '--docs': true, '--title': true, '--force': false };
const COMMANDS = ['init'];

const HELP = `lowkey-doc ${VERSION} — render a folder of Markdown into one self-contained page

  ${CLI} [folder] [options]
  ${CLI} init [folder] [--docs <dir>] [--title <name>] [--force]

Options
  folder             render this folder instead of the configured one
  --out <dir>        where to write the page          (default .lowkey-doc)
  --config <file>    use this config file             (default docs.config.json, searched upwards)
  --title <name>     override the dashboard title
  --engine <name>    default diagram layout: clean | mermaid
  -w, --watch        serve on localhost and update the open page on every save
  --port <n>         port for --watch                 (default ${DEFAULT_PORT}, or the next free one)
  --no-open          build without launching a browser
  --refresh          re-download mermaid, ELK and the font
  -v, --version      print the version
  -h, --help         this

init
  folder             the project to set up             (default: here; created if missing)
  --docs <dir>       the documents folder              (default docs)
  --title <name>     the dashboard title
  --force            replace the Claude command and skills with this version's.
                     An existing config is never replaced: --docs and --title edit it.

Update check
  A maximum of one time each day, lowkey-doc asks npm for the latest version.
  To stop the update check, set NO_UPDATE_NOTIFIER=1.
`;

const usage = (msg) => { throw new Error(msg + '\nSee: ' + CLI + ' --help'); };

// edit distance, for "did you mean"
function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]++;
    for (let j = 1; j <= b.length; j++) {
      const cur = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
  }
  return row[b.length];
}
const closest = (word, list) => {
  const best = list.map((w) => [w, distance(word, w)]).sort((x, y) => x[1] - y[1])[0];
  return best && best[1] <= Math.max(1, Math.floor(word.length / 3)) ? best[0] : null;
};

function parse(argv) {
  const takesValue = new Set(Object.entries({ ...BUILD, ...INIT }).filter(([, v]) => v).map(([k]) => k));
  const opts = {};
  const args = [];
  for (let i = 0; i < argv.length; i++) {
    let a = argv[i], value;
    if (!a.startsWith('-') || a === '-') { args.push(a); continue; }
    if (a.includes('=')) [a, value] = [a.slice(0, a.indexOf('=')), a.slice(a.indexOf('=') + 1)];
    if (takesValue.has(a)) {
      if (value === undefined) {
        value = argv[i + 1];
        if (value === undefined || value.startsWith('-')) usage(a + ' needs a value.');
        i++;
      }
      opts[a] = value;
    } else {
      opts[a] = true;
    }
  }

  const mode = args[0] === 'init' ? 'init' : 'build';
  if (mode === 'init') args.shift();
  const known = mode === 'init' ? INIT : BUILD;
  for (const o of Object.keys(opts)) {
    if (o in known) continue;
    if (mode === 'init' && o in BUILD) usage(o + ' does not apply to init.');
    if (mode === 'build' && o in INIT) usage(o + ' only works with init: ' + CLI + ' init ' + o);
    const near = closest(o, Object.keys(known));
    usage('Unknown option ' + o + '.' + (near ? ' Did you mean ' + near + '?' : ''));
  }
  if (args.length > 1) usage('Expected at most one folder, got: ' + args.join(' '));
  return { mode, folder: args[0] || null, opts };
}

async function main() {
  const { mode, folder, opts } = parse(process.argv.slice(2));
  if (opts['-h'] || opts['--help']) { console.log(HELP); return; }
  if (opts['-v'] || opts['--version']) { console.log(VERSION); return; }

  // asked while the command runs, told once it is done
  const update = checkForUpdate();
  await run(mode, folder, opts);
  const notice = await update();
  if (notice) console.error(notice);
}

async function run(mode, folder, opts) {
  if (mode === 'init') {
    const r = init(folder, { docs: opts['--docs'], title: opts['--title'], force: !!opts['--force'] });
    console.log('lowkey-doc init  ' + r.root);
    r.done.forEach((d) => console.log('  + ' + d));
    r.skipped.forEach((s) => console.log('  · ' + s));
    if (r.kept) console.log('\n  To update the Claude command and skills: ' + CLI + ' init --force');
    console.log('\nRender it with:  ' + CLI);
    return;
  }

  // a folder named here is checked here: "No such folder" is the clearest
  // thing to say, and a mistyped command lands here too
  let docsFolder = null;
  if (folder) {
    docsFolder = path.resolve(folder);
    if (!fs.existsSync(docsFolder)) {
      const near = closest(folder, COMMANDS);
      throw new Error('No such folder: ' + folder + (near ? '\nDid you mean: ' + CLI + ' ' + near + '?' : ''));
    }
    if (!fs.statSync(docsFolder).isDirectory()) throw new Error('Not a folder: ' + folder);
  }

  const cfgArgs = {
    folder: docsFolder,
    out: opts['--out'] || null,
    title: opts['--title'] || null,
    configPath: opts['--config'] || null,
    engine: opts['--engine'] || null,
  };

  if (opts['--watch'] || opts['-w']) {
    const port = Number(opts['--port'] ?? DEFAULT_PORT);
    if (!Number.isInteger(port) || port < 0 || port > 65535) {
      usage('--port must be a port number, got: ' + opts['--port']);
    }
    await watch(cfgArgs, { port, open: !opts['--no-open'], refresh: !!opts['--refresh'] });
    return;
  }
  if (opts['--port']) usage('--port only works with --watch.');

  const cfg = loadConfig(cfgArgs);

  await build(cfg, { open: !opts['--no-open'], refresh: !!opts['--refresh'] });
}

main().catch((err) => {
  console.error(String(err && err.message || err));
  process.exit(1);
});
