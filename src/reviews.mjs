// reviews.mjs
// ------------------------------------------------------------------
// The reader's Reviewed marks belong to the project, not to one browser: they
// are kept in docs.reviews.json beside docs.config.json, committed like any
// other file, so a team shares one set of marks and git says who changed them.
// Every build reads the file into the page. Only lowkey-doc --watch writes it:
// a page opened from its file cannot write anything.
//
// A mark carries a fingerprint of the words it was given for. Edit those words
// and the mark stops matching, so the section reads as open again - and so do
// the chapter and the document above it - until someone reviews it again.
// ------------------------------------------------------------------

import fs from 'node:fs';
import crypto from 'node:crypto';

const SIG_RE = /^[0-9a-f]{12}$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

// The words of some rendered HTML: what a reader agrees with. Markup and the
// page's own buttons are left out, so a change in how Lowkey Doc draws a page
// does not reopen every review.
export const words = (html) => html
  .replace(/<button\b[\s\S]*?<\/button>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export const fingerprint = (text) => crypto.createHash('sha1').update(text).digest('hex').slice(0, 12);

// Only well-formed marks survive: { "<file>": { "<section id>": { sig, at } } },
// with "" standing for the document's own words.
function clean(docs) {
  const out = {};
  if (!docs || typeof docs !== 'object' || Array.isArray(docs)) return out;
  for (const [file, marks] of Object.entries(docs)) {
    if (!marks || typeof marks !== 'object' || Array.isArray(marks)) continue;
    const kept = {};
    for (const [key, m] of Object.entries(marks)) {
      if (m && SIG_RE.test(m.sig) && DAY_RE.test(m.at)) kept[key] = { sig: m.sig, at: m.at };
    }
    if (Object.keys(kept).length) out[file] = kept;
  }
  return out;
}

// The marks in the project, and why they could not be read if they could not.
export function readReviews(cfg) {
  if (!cfg.reviewsFile) return { reviews: {}, raw: null, error: null };
  let raw;
  try { raw = fs.readFileSync(cfg.reviewsFile, 'utf8'); } catch { return { reviews: {}, raw: null, error: null }; }
  try {
    return { reviews: clean(JSON.parse(raw).docs), raw, error: null };
  } catch (err) {
    return { reviews: {}, raw, error: cfg.reviewsFile + ' could not be read: ' + err.message };
  }
}

// One line per mark, documents in name order: a diff shows exactly which
// sections were reviewed, and two people reviewing different documents do not
// touch the same lines.
export function formatReviews(reviews) {
  const q = JSON.stringify;
  const files = Object.keys(reviews).sort((a, b) => a.localeCompare(b));
  return '{\n  "version": 1,\n  "docs": {' + (files.length ? '\n' + files.map((f) =>
    '    ' + q(f) + ': {\n' + Object.entries(reviews[f]).map(([key, m]) =>
      '      ' + q(key) + ': { "sig": ' + q(m.sig) + ', "at": ' + q(m.at) + ' }').join(',\n') +
    '\n    }').join(',\n') + '\n  ' : '') + '}\n}\n';
}

// Replace one document's marks and write the file. A file that cannot be read
// is never written over: it may be one merge away from holding everyone's work.
export function saveReviews(cfg, file, marks) {
  const now = readReviews(cfg);
  if (now.error) throw new Error(now.error + '. Fix it, and nothing in it is lost.');
  const reviews = { ...now.reviews };
  const kept = clean({ [file]: marks })[file];
  if (kept) reviews[file] = kept; else delete reviews[file];
  const text = formatReviews(reviews);
  if (text !== now.raw) fs.writeFileSync(cfg.reviewsFile, text);
  return { reviews, raw: text };
}
