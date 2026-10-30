// update.mjs - say so when npm has a newer lowkey-doc than the one running.
// ------------------------------------------------------------------
// The registry is asked at most once a day, while the command does its own
// work, and never for longer than WAIT: a slow or absent network costs the
// notice and nothing else. The answer is kept in the user's cache folder, so
// the runs in between only read a file.
//
// Off when stderr is not a terminal, on CI, and with NO_UPDATE_NOTIFIER set.
// ------------------------------------------------------------------

import fs from 'node:fs';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import { VERSION } from './config.mjs';

const REGISTRY = 'https://registry.npmjs.org/lowkey-doc/latest';
const DAY = 24 * 60 * 60 * 1000;
const WAIT = 1500;

export const UPDATE_FILE = path.join(process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache'),
  'lowkey-doc', 'update-check.json');

const enabled = () => process.stderr.isTTY && !process.env.CI && !process.env.NO_UPDATE_NOTIFIER;

// 1.10.0 is newer than 1.9.3; a pre-release is never offered
export function newer(latest, current) {
  if (!/^\d+\.\d+\.\d+$/.test(latest)) return false;
  const a = latest.split('.').map(Number);
  const b = current.split('-')[0].split('.').map(Number);
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return current.includes('-');
}

// What to type depends on how it was run: npx keeps its own copy, and npm
// run uses the project's.
function howTo(env = process.env) {
  if (env.npm_command === 'exec') return 'npx lowkey-doc@latest';
  if (env.npm_command === 'run-script') return 'npm install lowkey-doc@latest';
  return 'npm install -g lowkey-doc@latest';
}

export const notice = (latest, current = VERSION, env = process.env) =>
  '\n  Update available: lowkey-doc ' + current + ' → ' + latest + '\n  Run: ' + howTo(env) + '\n';

function readCache() {
  try { return JSON.parse(fs.readFileSync(UPDATE_FILE, 'utf8')); } catch { return null; }
}

function writeCache(data) {
  try {
    fs.mkdirSync(path.dirname(UPDATE_FILE), { recursive: true });
    fs.writeFileSync(UPDATE_FILE, JSON.stringify(data) + '\n');
  } catch { /* a cache we cannot write only means asking again next time */ }
}

// node:https rather than fetch: an aborted fetch still holds the process open
// until its connection attempt times out, ten seconds on a network that drops
// packets. A destroyed request lets go of its socket at once.
function latestVersion() {
  return new Promise((resolve) => {
    const done = (version) => { clearTimeout(timer); resolve(version); };
    const req = https.get(REGISTRY, { headers: { accept: 'application/json' } }, (res) => {
      if (res.statusCode !== 200) { res.resume(); return done(null); }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => { try { done(JSON.parse(body).version || null); } catch { done(null); } });
    });
    req.on('error', () => done(null));
    const timer = setTimeout(() => req.destroy(), WAIT);
  });
}

// Starts the check, if one is due, and returns what to call once the command
// is done: it resolves to the notice to print, or to null.
export function checkForUpdate() {
  if (!enabled()) return async () => null;
  const cached = readCache();
  // a failed check counts as one too, so being offline is not paid for on every run
  const pending = cached && Date.now() - cached.checkedAt < DAY ? null : latestVersion().then((latest) => {
    writeCache({ checkedAt: Date.now(), latest: latest || (cached && cached.latest) || null });
    return latest;
  });
  return async () => {
    const latest = (pending && await pending) || (cached && cached.latest);
    return latest && newer(latest, VERSION) ? notice(latest) : null;
  };
}
