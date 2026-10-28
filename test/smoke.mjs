#!/usr/bin/env node
// smoke.mjs - build a throwaway folder of documents and assert the page came
// out whole. No test framework: this runs anywhere Node does.
//
//   node test/smoke.mjs

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadConfig } from '../src/config.mjs';
import { build, collectDocs, pageFor } from '../src/build.mjs';
import { buildDoc } from '../src/collect.mjs';
import { watch } from '../src/watch.mjs';
import { init } from '../src/init.mjs';
import { NOTICES_FILE } from '../src/vendor.mjs';
import http from 'node:http';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

let failed = 0;
const ok = (cond, what) => {
  console.log((cond ? '  ok   ' : '  FAIL ') + what);
  if (!cond) failed++;
};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lowkey-doc-'));
const docs = path.join(tmp, 'docs');
fs.mkdirSync(path.join(docs, 'audits'), { recursive: true });

fs.writeFileSync(path.join(docs, '1. FIRST.md'), `# FIRST

> The lede of the first document.

---

## 1. A section

Prose with **bold**, *italic*, \`code\`, a [link](./10.%20TENTH.md#a-heading) and a url
<https://example.com>.

| Column | Other |
|---|:--:|
| a \`|\` pipe | b |

- a list
  - nested
- and more

\`\`\`mermaid
flowchart TD
    A["Start"] --> B{"Choose"}
    B -->|"yes"| C["Ship it"]
    B -->|"no"| D["Fix it"]
    D --> B
    subgraph G ["A group"]
      C --> E[("Store")]
    end
    E -.-> F(["Done"])
    classDef warn fill:#fee
    class D warn
\`\`\`

<!-- this comment must not render -->
`);

fs.writeFileSync(path.join(docs, '10. TENTH.md'), '# TENTH\n\n## A heading\n\nText.\n');
fs.writeFileSync(path.join(docs, 'ZZ NO NUMBER.md'), '# UNNUMBERED\n\nText.\n');
fs.writeFileSync(path.join(docs, 'audits', 'one.md'), '# AN AUDIT\n\nText.\n');
fs.writeFileSync(path.join(docs, 'schema.dbml'), 'Table users {\n  id uuid\n}\n');

console.log('lowkey-doc smoke test\n  ' + tmp + '\n');

const cfg = loadConfig({ root: tmp, docs: 'docs', title: 'Smoke Docs' });
const r = await build(cfg, { open: false, quiet: true });
const html = fs.readFileSync(r.outFile, 'utf8');
const ids = r.docs.map((d) => d.id);

ok(r.docs.length === 5, 'all five files were picked up');
ok(ids.join(',') === '1-first,10-tenth,zz-no-number,one,schema',
  'ordered by leading number, then unnumbered, then sub-folders, then verbatim files — got ' + ids.join(','));
ok(r.docs[0].title === 'FIRST', 'the H1 became the title');
ok(r.docs[0].subtitle.includes('lede'), 'the blockquote became the standfirst');
ok(!r.docs[0].html.includes('<h1'), 'the H1 is not repeated in the body');
ok(r.docs.find((d) => d.id === 'one').group === 'Audits', 'a sub-folder became its own group');
ok(r.docs.find((d) => d.id === 'schema').group === 'Schema', 'a .dbml file landed in Schema');
ok(r.docs[0].diagrams === 1, 'the mermaid fence was counted as a diagram');
ok(r.docs[0].html.includes('data-diagram'), 'the diagram survived into the page');
ok(r.docs[0].html.includes('href="#/10-tenth/a-heading"'), 'a cross-document link became a route');
ok(r.docs[0].html.includes('<table>'), 'the table rendered');
ok(!r.docs[0].html.includes('must not render'), 'the HTML comment was stripped');
ok(r.docs[0].html.includes('<section class="sec"'), 'headings own their sections');

// the whole blockquote under the title is the standfirst, however many paragraphs it has
const lede = (md) => buildDoc({ file: 'L.md', rel: 'L.md', group: '' }, new Map([['L.md', 'l']]), cfg, md);
const multi = lede('# L\n\n> First paragraph.\n>\n> Second, **bold**.\n\n---\n\n> A quote in the body.\n');
ok(multi.subtitle.includes('First paragraph.') && multi.subtitle.includes('Second, <strong>bold</strong>.'),
  'every paragraph of the blockquote under the title went into the standfirst');
ok(!multi.html.includes('Second,') && (multi.html.match(/<blockquote>/g) || []).length === 1,
  'none of it is left in the body, and a later blockquote stays where it is');
const tight = lede('# L\n\n> The lede.\n---\n\nBody.\n');
ok(tight.subtitle === '<p>The lede.</p>' && tight.html.includes('<hr>'), 'a rule right under the lede is not swallowed by it');
ok(lede('# L\n\nSome *italic\nacross a break* here.\n').html.includes('<em>italic\nacross a break</em>'),
  'italics may run across a line break');

ok(html.includes('vendor/mermaid.min.js') || html.includes('cdn.jsdelivr'), 'mermaid is referenced');
ok(html.includes('__LOWKEY_DOC__'), 'the runtime config is in the page');
ok(html.includes('Smoke Docs'), 'the title reached the page');
ok(!/<script>\s*<\/script>/.test(html), 'no empty inline script blocks were emitted');
ok(html.split('<script').length - 1 >= 4, 'every script block is present');
ok(r.bytes > 50_000, 'the page has real content in it (' + (r.bytes / 1024).toFixed(0) + ' KB)');

// a second build must not need the network, and must be identical
const again = await build(cfg, { open: false, quiet: true });
ok(fs.readFileSync(again.outFile, 'utf8') === html, 'rebuilds are deterministic');
ok(/cached/.test(again.notes.mermaid), 'the second build used the cached mermaid');

// the vendored files are checked by hash, and carry their licenses with them
const vendor = path.join(tmp, '.lowkey-doc', 'vendor');
const notices = fs.readFileSync(path.join(vendor, NOTICES_FILE), 'utf8');
ok(['Knut Sveidqvist', 'Eclipse Public License', 'SIL OPEN FONT LICENSE'].every((s) => notices.includes(s)),
  'the notices beside the page cover mermaid, ELK and the font');
ok(html.includes('SIL OPEN FONT LICENSE'), 'the inlined font carries its license inside the page');
fs.writeFileSync(path.join(vendor, 'elk.bundled.js'), 'tampered');
const healed = await build(cfg, { open: false, quiet: true });
ok(/downloaded/.test(healed.notes.elk) && fs.readFileSync(path.join(vendor, 'elk.bundled.js'), 'utf8') !== 'tampered',
  'a cached file that is not the pinned one is fetched again');
const fallback = pageFor(cfg, r.docs, { font: { css: '' }, elk: { tag: null },
  mermaid: { tag: { src: 'https://cdn.example/mermaid.min.js', integrity: 'sha384-abc' } } });
ok(fallback.includes('src="https://cdn.example/mermaid.min.js" integrity="sha384-abc" crossorigin="anonymous"'),
  'a CDN fallback carries its hash, so the browser checks it');

// incremental: a save renders again only what it changed
const one = collectDocs(cfg);
fs.appendFileSync(path.join(docs, '10. TENTH.md'), '\nMore text.\n');
const two = collectDocs(cfg, one.memo);
ok(two.changed.join(',') === '10-tenth', 'an edit renders only the edited document again — got ' + two.changed.join(','));
ok(two.docs[0] === one.docs[0], 'an untouched document is reused as it was');
ok(collectDocs(cfg, two.memo).changed.length === 0, 'a save that changes nothing renders nothing');
fs.writeFileSync(path.join(docs, '2. SECOND.md'), '# SECOND\n\nText.\n');
ok(collectDocs(cfg, two.memo).changed.length === 6, 'a new file renders every document again, since links may now resolve');

// watch: the served page is live, the file on disk is not, and a save reaches the page
const live = await watch({ root: tmp, docs: 'docs', title: 'Smoke Docs' }, { port: 0, open: false, quiet: true });
const served = await (await fetch(live.url)).text();
ok(served.includes('__LOWKEY_DOC_LIVE__'), 'the served page carries the live client');
ok(!fs.readFileSync(r.outFile, 'utf8').includes('__LOWKEY_DOC_LIVE__'), 'index.html on disk stays a plain page');
const foreign = await new Promise((done, fail) => {
  const req = http.get(live.url + '__lowkey-doc/data.json', { headers: { Host: 'rebound.example:' + new URL(live.url).port } },
    (res) => { res.resume(); done(res.statusCode); });
  req.on('error', fail);
});
ok(foreign === 403, 'a request addressed to any other host is turned away');

const tenth = path.join(docs, '10. TENTH.md');
const seqOf = (st) => +st.version.split(':')[1];
const events = await eventStream(live.url + '__lowkey-doc/events');
const s1 = await events.next();
fs.writeFileSync(tenth, '# TENTH\n\n## A heading\n\nEdited.\n');
const s2 = await events.next();
ok(seqOf(s2) === seqOf(s1) + 1 && !s2.error && s2.shell === s1.shell, 'a save pushed one new version');
const data = await (await fetch(live.url + '__lowkey-doc/data.json')).json();
ok(data.version === s2.version && data.docs.find((d) => d.id === '10-tenth').html.includes('Edited.'),
  'the pushed data carries the edit');

fs.writeFileSync(tenth, '# TENTH\n\n## A heading\n\nEdited.\n');
await new Promise((done) => setTimeout(done, 500));
fs.writeFileSync(tenth, '# TENTH\n\n## A heading\n\nEdited twice.\n');
const s3 = await events.next();
ok(seqOf(s3) === seqOf(s2) + 1, 'a write that changes nothing pushes nothing');

fs.rmSync(path.join(docs, '2. SECOND.md'));
const s4 = await events.next();
ok(seqOf(s4) === seqOf(s3) + 1, 'removing a file pushed a new version');

fs.renameSync(docs, docs + '-away');
const s5 = await events.next();
ok(!!s5.error && seqOf(s5) === seqOf(s4), 'a missing folder is reported, and the last good version kept');
fs.renameSync(docs + '-away', docs);
const s6 = await events.next();
ok(!s6.error, 'the folder coming back clears the error');
events.close();
await live.close();

// the default output folder keeps itself out of git
ok(fs.readFileSync(path.join(tmp, '.lowkey-doc', '.gitignore'), 'utf8').includes('\n*\n'),
  'the output folder ignores itself');

// a folder on the command line replaces `docs` only: the config still applies,
// and the page goes to the project root, never the folder's parent
const proj = path.join(tmp, 'proj');
fs.mkdirSync(path.join(proj, 'guides'), { recursive: true });
fs.writeFileSync(path.join(proj, 'docs.config.json'), '{\n  "docs": "docs",\n  "out": "site"\n}\n');
const pointed = loadConfig({ folder: path.join(proj, 'guides') });
ok(pointed.root === proj && pointed.outDir === path.join(proj, 'site') && pointed.docsDir === path.join(proj, 'guides'),
  'a folder argument reads that folder and writes to the config\'s project');
const dot = loadConfig({ folder: proj });
ok(dot.root === proj && dot.configFile === path.join(proj, 'docs.config.json'),
  'pointing at the project itself finds the config inside it');
const loose = loadConfig({ folder: path.join(tmp, 'docs') });
ok(loose.configFile === null && loose.root === process.cwd(), 'with no config, the page goes where the command ran');

const noDocs = (cfgArgs) => { try { collectDocs(loadConfig(cfgArgs)); return ''; } catch (err) { return err.message; } };
fs.writeFileSync(path.join(proj, 'gone.json'), '{ "docs": "gone" }\n');
ok(/gone\.json points at .*gone.*init/s.test(noDocs({ configPath: path.join(proj, 'gone.json') })),
  'a configured folder that is missing says so, and offers init');
ok(/No .* folder here.*init.*<folder>/s.test(noDocs({ root: path.join(tmp, 'new') })),
  'no folder and no config offers both ways out');
ok(/Nothing to render in .*guides.*add a \.md file/s.test(noDocs({ folder: path.join(proj, 'guides') })),
  'an empty folder asks for a document');

// init: creates what is missing, edits a config rather than replacing it
const fresh = path.join(tmp, 'new', 'project');
const i1 = init(fresh, {});
ok(fs.existsSync(path.join(fresh, 'docs', '0. ABOUT.md')) && fs.existsSync(path.join(fresh, '.claude', 'skills', 'write-doc', 'SKILL.md')),
  'init sets up a folder that did not exist yet');
ok(!i1.kept && !fs.existsSync(path.join(fresh, '.gitignore')), 'init leaves .gitignore alone');
const command = fs.readFileSync(path.join(fresh, '.claude', 'commands', 'docs.md'), 'utf8');
const version = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url))).version;
ok(command.includes('npx lowkey-doc@' + version + ' $ARGUMENTS') && !/npx lowkey-doc(?!@)/.test(command),
  'the /docs command runs the version that installed it');
ok(/^allowed-tools: Bash\(npx lowkey-doc@[^)]*:\*\)$/m.test(command), 'the /docs command may run nothing but that');
const confFile = path.join(fresh, 'docs.config.json');
fs.writeFileSync(confFile, fs.readFileSync(confFile, 'utf8').replace('".lowkey-doc"', '"site"'));
const i2 = init(fresh, { docs: 'guides', force: true });
const conf = JSON.parse(fs.readFileSync(confFile, 'utf8'));
ok(conf.out === 'site' && conf.docs === 'guides', 'init --force --docs edits the config and keeps its other settings');
ok(fs.existsSync(path.join(fresh, 'guides', '0. ABOUT.md')), 'init creates the folder the config now names');
ok(i2.done.some((d) => d.includes('(replaced)')), 'init --force replaces the Claude files');
const i3 = init(fresh, {});
ok(i3.kept && i3.skipped.some((s) => s.startsWith('docs.config.json')), 'a plain init again keeps everything');

// the command line refuses what it does not know
const cli = (...args) => spawnSync(process.execPath, [fileURLToPath(new URL('../bin/lowkey-doc.mjs', import.meta.url)), ...args],
  { cwd: tmp, encoding: 'utf8', env: { ...process.env, npm_command: '' } });
const typo = cli('--wach');
ok(typo.status === 1 && typo.stderr.includes('Did you mean --watch?'), 'an unknown option stops, with a suggestion');
ok(cli('int').stderr.includes('Did you mean: lowkey-doc init?'), 'a mistyped command is recognised');
ok(cli('--force').stderr.includes('only works with init'), 'an init option outside init is refused');
ok(cli('init', '--watch').stderr.includes('does not apply to init'), 'a build option inside init is refused');
ok(cli('--out').stderr.includes('--out needs a value'), 'an option missing its value is refused');
ok(cli('--version').stdout.trim() === JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url))).version,
  '--version prints the package version');

fs.rmSync(tmp, { recursive: true, force: true });
console.log('\n' + (failed ? failed + ' failed' : 'all good'));
process.exit(failed ? 1 : 0);

// The watcher's server-sent events, one at a time.
async function eventStream(url) {
  const ctrl = new AbortController();
  const res = await fetch(url, { signal: ctrl.signal });
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  const read = async () => {
    for (;;) {
      const m = buf.match(/event: state\ndata: (.*)\n\n/);
      if (m) { buf = buf.slice(m.index + m[0].length); return JSON.parse(m[1]); }
      const { value, done } = await reader.read();
      if (done) throw new Error('event stream closed');
      buf += dec.decode(value, { stream: true });
    }
  };
  return {
    next: () => Promise.race([read(), new Promise((_, no) => setTimeout(() => no(new Error('no event within 5s')), 5000))]),
    close: () => ctrl.abort(),
  };
}
