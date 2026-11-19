# Deploy: esmélumière.com on Vercel

This project is a **static site** — plain HTML/CSS/JS, no build step, no `package.json`.
Entry point: `index.html` at the repo root (~3.4 MB total, all references relative, all verified 200 on a local server).

## 1. Push to GitHub

Already done: https://github.com/Yash-Singh-Chauhan/Aria-Velen (branch `main`).
The site files sit at the **repo root**, so it looks like:

```
Aria-Velen/
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
| Root Directory | `./` (default — leave as-is) |
| Build Command | *(leave empty / override off)* |
| Output Directory | *(leave empty / override off)* |
| Install Command | *(leave empty)* |

**Leave Root Directory at the default.** `index.html` is at the repo root, so Vercel finds it with no extra configuration; setting a subfolder here would 404.

## 3. Add the domain in Vercel

Settings → Domains → add **both**:

- `esmélumière.com` (apex)
- `www.esmélumière.com`

DNS uses the ASCII/punycode form of the accented name: `xn--esmlumire-63ag.com`. You do **not** have to type the punycode anywhere in Hostinger — the records below are all plain ASCII labels relative to the zone.

## 4. DNS at Hostinger (DNS / Nameservers → Manage DNS records)

Hostinger keeps the nameservers (`ns1/ns2.dns-parking.com`) — **only the web records change**, so
Hostinger email (MX `mx1/mx2.hostinger.com`, TXT `v=spf1 include:_spf.mail.hostinger.com ~all`)
stays working.

State of the zone when this was written (checked via Google DNS):

| Type | Name | Currently | Action |
| --- | --- | --- | --- |
| `A` | `@` | `93.127.173.144`, `88.222.243.127` (Hostinger) | **Delete both** |
| `AAAA` | `@` | `2a02:4780:20:b53a:…`, `2a02:4780:3c:3073:…` (Hostinger) | **Delete both** — Vercel does not serve custom domains over IPv6 |
| `CNAME` | `www` | `www.…cdn.hstgr.net` (Hostinger CDN) | **Delete**, replace |
| `MX` / `TXT` | `@` | Hostinger mail | **Keep** |

1. If hPanel shows the Hostinger **CDN** switched on for the site, turn it off — otherwise the `www`
   record keeps pointing back at `cdn.hstgr.net`.
2. Delete the rows marked above, then add:

| Type | Name | Value / Target | TTL |
| --- | --- | --- | --- |
| `A` | `@` | `76.76.21.21` | 3600 (or default) |
| `CNAME` | `www` | `cname.vercel-dns.com` | 3600 (or default) |

Copy the exact IP/target from your Vercel domain card if it shows something else — newer projects get
addresses from an anycast pool (e.g. `216.198.79.1`) and a per-project CNAME target like
`<hash>.vercel-dns-017.com`. A value copied from an older guide leaves the domain stuck on
"Invalid Configuration".

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
