# Custom Domain Runbook — `prompts.tdotssolutionsz.com`

How to put `prompts.tdotssolutionsz.com` in front of the v2.0 Vercel deployment.
Estimated total time: ~10 minutes (most of which is DNS propagation wait).

---

## Prerequisites

- Vercel project: `ultimate-image-prompt-generator` (already linked at `web/.vercel/project.json`, project ID `prj_neRjDLSiCQSkcMiA10ojz7Wwb0pY`).
- Authenticated Vercel CLI (`npx vercel login` if needed).
- DNS access to `tdotssolutionsz.com` — wherever the zone is hosted (Cloudflare / Vercel / Namecheap / etc.).

---

## Step 1 — Claim the subdomain in Vercel ✅ DONE

Already executed 2026-04-29 by Claude. Output:
> `Success! Domain prompts.tdotssolutionsz.com added to project web.`

Linked under `daredev256s-projects/web`.

---

## Step 2 — Add the DNS record (CLOUDFLARE — REQUIRES YOUR ACTION)

`tdotssolutionsz.com` nameservers are `dylan.ns.cloudflare.com` / `kelly.ns.cloudflare.com`.

**Action:**
1. Log into Cloudflare → select `tdotssolutionsz.com` → **DNS** tab
2. Add record:

| Type | Name | IPv4 address | Proxy status | TTL |
|------|------|--------------|--------------|-----|
| `A` | `prompts` | `76.76.21.21` | **DNS only** (gray cloud OFF) | Auto |

3. Save.

**Critical**: Cloudflare proxy **must be OFF** initially or Vercel can't issue the
TLS cert. After verification (Step 3 below), you can re-enable the orange proxy
cloud if you want Cloudflare's CDN/WAF in front.

**Alternative (not recommended)**: change nameservers to `ns1.vercel-dns.com` /
`ns2.vercel-dns.com`. This gives Vercel full control of the zone — only do this if
you don't need Cloudflare features.

---

## Step 3 — Verify in Vercel

Wait 1–5 minutes for propagation, then:

```bash
npx vercel domains inspect prompts.tdotssolutionsz.com
```

Should show:
```
DNS Configuration: ✓
TLS Certificate: ✓
```

Once both pass, hit `https://prompts.tdotssolutionsz.com` — should serve the v2.0
site.

---

## Step 4 — Update references in code

After the domain is live, sweep the codebase to replace the placeholder URL.

```bash
cd "/Users/t./Documents/Projects/Ultimate Image Prompt Generator"
grep -rln "web-ten-vert-46.vercel.app" --exclude-dir=node_modules --exclude-dir=.next
# Update each match → https://prompts.tdotssolutionsz.com
```

Known occurrences:
- `README.md` — Live demo link in header, getting-started, deploy section
- `web/src/app/api/og/prompt/route.tsx` — OG card footer
- `web/src/app/sources/page.tsx` — issue link in footer (already on github.com so unaffected)
- `src/cli/...` (CLI tool URL prints, if any)

---

## Step 5 — GA4 measurement ID (optional)

Add to `web/.env.local`:
```
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

Then in `web/src/app/layout.tsx`, before `</body>`:

```tsx
{process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID && (
  <>
    <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}`} />
    <script
      dangerouslySetInnerHTML={{
        __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}');`,
      }}
    />
  </>
)}
```

(Keep the script tags inline so CSP doesn't break — the next.config.ts CSP already
permits `script-src 'unsafe-inline'` for analytics-friendly setups; tighten later
with a nonce-based pattern if you care.)

---

## Step 6 — Production deploy

```bash
cd web && npx vercel --prod
```

Or just merge to `main` if Vercel git integration is wired up.

---

## Rollback

If anything breaks:
```bash
npx vercel domains rm prompts.tdotssolutionsz.com
```
Domain claim is reversible. Site stays at `web-ten-vert-46.vercel.app`.

---

## Open checklist

- [ ] Step 1 — claim domain in Vercel
- [ ] Step 2 — add CNAME at DNS provider
- [ ] Step 3 — verify TLS issued
- [ ] Step 4 — sweep stale URLs in code
- [ ] Step 5 — wire GA4 (optional)
- [ ] Step 6 — production deploy
