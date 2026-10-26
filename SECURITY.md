# Security

## Reporting a vulnerability

Report it privately, with **Report a vulnerability** on the
[Security tab](https://github.com/lorebalbo/lowkey-doc/security/advisories/new), not in a public
issue.

Only the latest version on npm is fixed.

## What a release contains

- **No dependencies and no install scripts.** Installing Lowkey Doc runs nothing, and pulls in
  nothing but its own files.
- **Released from GitHub Actions, approved by hand.** A version tag makes GitHub Actions stage
  the release on npm through trusted publishing, so there is no npm token to steal. It goes live
  only once the maintainer approves it on npmjs.com with two-factor authentication.
- **Downloads pinned by hash.** The first build fetches Mermaid, ELK and the Inter font from
  jsDelivr, each pinned by version and by SHA-384 in [`src/vendor.mjs`](src/vendor.mjs). A file
  that does not match is refused, and a page that falls back to the CDN asks the browser to check
  the same hash.
- **`/docs` runs a fixed version.** The Claude command that `lowkey-doc init` installs runs
  `npx lowkey-doc@<the version that installed it>`, so a new release reaches a project only when
  someone there runs `init --force`.
