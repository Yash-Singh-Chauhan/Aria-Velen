# Deploy: esmélumière.com on Vercel

This project is a **static site** — plain HTML/CSS/JS, no build step, no `package.json`.
Entry point: `aria-velen-music/index.html` (~3.4 MB total, all references relative, all verified 200 on a local server).

## 1. Push to GitHub

Create a repo and push this folder. The site files live in `aria-velen-music/`, so the repo will look like:

```
repo/
  aria-velen-music/
    index.html, about.html, music.html, tour.html, contact.html, animation.html
    style.css, main.js, cursor.js, audio-engine.js, three-scene.js, three.min.js
    assets/            (16 images)
    vercel.json        (security headers + asset caching)
    .vercelignore      (keeps scratch/ out of the deployment)
```

## 2. Import in Vercel

Add New → Project → pick the repo. Then, **before clicking Deploy**, set:

| Setting | Value |
| --- | --- |
| Framework Preset | `Other` |
| Root Directory | `aria-velen-music` |
| Build Command | *(leave empty / override off)* |
| Output Directory | *(leave empty / override off)* |
| Install Command | *(leave empty)* |

**Root Directory is the one that matters.** Without it Vercel looks for `index.html` at the repo root, finds only a folder, and the domain shows a 404.

## 3. Add the domain in Vercel

Settings → Domains → add **both**:

- `esmélumière.com` (apex)
- `www.esmélumière.com`

DNS uses the ASCII/punycode form of the accented name: `xn--esmlumire-63ag.com`. You do **not** have to type the punycode anywhere in Hostinger — the records below are all plain ASCII labels relative to the zone.

## 4. DNS at Hostinger (DNS / Nameservers → Manage DNS records)

1. Delete any existing apex `A` record (Hostinger parking IP) and any existing `www` `CNAME`/parking record.
2. Add:

| Type | Name | Value / Target | TTL |
| --- | --- | --- | --- |
| `A` | `@` | `76.76.21.21` | 3600 (or default) |
| `CNAME` | `www` | `cname.vercel-dns.com` | 3600 (or default) |

Use whatever IP/target Vercel actually displays on the domain screen if it differs.

3. In Vercel, pick one as the primary domain (apex is fine) and let the other redirect.

Propagation: usually 10–30 min, up to a few hours if a previous parking record was cached.

## 5. Verify

- `https://esmélumière.com` loads the hero page; HTTPS is issued automatically by Vercel.
- `https://www.esmélumière.com` redirects to the primary domain.
- These all return 200 and render (they were smoke-tested headless locally):
  `/`, `/about.html`, `/music.html`, `/tour.html`, `/contact.html`, `/animation.html`
- The WebGL canvas appears on every page (client-side, nothing to configure on Vercel).
- Google Fonts load (external request — unaffected by DNS).

## Notes

- Links use `.html` extensions on purpose. Do **not** enable Vercel's `cleanUrls`; it would add a redirect on every navigation.
- `scratch/` (Python helper scripts, geometry test page) is excluded from the deploy by `.vercelignore`. It can stay in the repo.
- No environment variables or server functions are involved, so nothing else needs configuring for the free plan.
