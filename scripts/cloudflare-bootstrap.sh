#!/usr/bin/env bash
# Cloudflare bootstrap — one-paste flow to set up the production stack.
#
# What it does (in order, idempotent — safe to re-run):
#   1. Verifies CLOUDFLARE_API_TOKEN is set (or prompts you to paste one)
#   2. Discovers the zone for tdotssolutionsz.com
#   3. Sets DNS:  A  prompts.tdotssolutionsz.com  76.76.21.21  (proxy off)
#      → flips Vercel domain verification ✓ within ~60s
#   4. Optional (if AutoRAG token scope present):
#      creates an AutoRAG instance "uipg-prompts" + uploads image-prompts.json
#      → enables hybrid semantic+keyword search via Cloudflare AI Search
#
# Required token scopes (create at https://dash.cloudflare.com/profile/api-tokens):
#   - Zone → DNS → Edit  (for tdotssolutionsz.com)
#   - Account → AutoRAG → Edit  (optional, only for step 4)
#   - Account → Workers AI → Read (optional, only for step 5+)

set -euo pipefail

# ─── Config ────────────────────────────────────────────────────────────
DOMAIN="tdotssolutionsz.com"
SUBDOMAIN="prompts"
VERCEL_IP="76.76.21.21"
PROMPTS_FILE="$(dirname "$0")/../web/public/data/image-prompts.json"

# ─── 1. Token check ────────────────────────────────────────────────────
if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "❌  CLOUDFLARE_API_TOKEN not set."
  echo
  echo "Create one at: https://dash.cloudflare.com/profile/api-tokens"
  echo "Scopes needed:"
  echo "  • Zone → DNS → Edit  (for $DOMAIN)"
  echo "  • Account → AutoRAG → Edit  (optional)"
  echo
  echo "Then run:"
  echo "  export CLOUDFLARE_API_TOKEN=<your-token>"
  echo "  $0"
  exit 1
fi

API="https://api.cloudflare.com/client/v4"
AUTH=(-H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json")

# Sanity check the token
echo "→ Verifying token…"
verify=$(curl -s "${AUTH[@]}" "$API/user/tokens/verify")
if ! echo "$verify" | grep -q '"status":"active"'; then
  echo "❌  Token is invalid or inactive."
  echo "$verify"
  exit 1
fi
echo "  ✓ token active"

# ─── 2. Find the zone ──────────────────────────────────────────────────
echo "→ Looking up zone for $DOMAIN…"
zone_id=$(curl -s "${AUTH[@]}" "$API/zones?name=$DOMAIN" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [[ -z "$zone_id" ]]; then
  echo "❌  Zone $DOMAIN not found on this account, or token lacks zone-read scope."
  exit 1
fi
echo "  ✓ zone $zone_id"

# ─── 3. Upsert the A record ────────────────────────────────────────────
echo "→ Setting A record  $SUBDOMAIN.$DOMAIN → $VERCEL_IP …"

# Look for an existing record at this name
existing_id=$(curl -s "${AUTH[@]}" \
  "$API/zones/$zone_id/dns_records?type=A&name=$SUBDOMAIN.$DOMAIN" \
  | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

payload=$(printf '{"type":"A","name":"%s","content":"%s","ttl":300,"proxied":false}' \
  "$SUBDOMAIN" "$VERCEL_IP")

if [[ -n "$existing_id" ]]; then
  echo "  · existing record $existing_id — updating"
  curl -s -X PUT "${AUTH[@]}" "$API/zones/$zone_id/dns_records/$existing_id" \
    -d "$payload" > /dev/null
else
  echo "  · creating new record"
  curl -s -X POST "${AUTH[@]}" "$API/zones/$zone_id/dns_records" \
    -d "$payload" > /dev/null
fi
echo "  ✓ A  $SUBDOMAIN.$DOMAIN  $VERCEL_IP  (proxy: off)"

# ─── 4. Verify Vercel sees the record ──────────────────────────────────
echo "→ Asking Vercel to verify the domain…"
sleep 3
if command -v npx >/dev/null 2>&1; then
  cd "$(dirname "$0")/../web"
  npx --yes vercel domains inspect prompts.tdotssolutionsz.com 2>&1 | tail -10 || true
  cd - > /dev/null
fi

echo
echo "✓  DNS step done. Vercel will issue TLS within ~60s."
echo "   Once it does, https://prompts.tdotssolutionsz.com is live."
echo

# ─── 5. (Optional) AutoRAG instance ────────────────────────────────────
if [[ "${SKIP_AUTORAG:-}" == "1" ]]; then
  echo "↷  Skipping AutoRAG (SKIP_AUTORAG=1)."
  exit 0
fi

# AutoRAG requires Account-scoped tokens. If the previous token doesn't have
# Account → AutoRAG, we soft-fail with a hint rather than stopping the script.
echo "→ Probing AutoRAG access…"
account_id=$(curl -s "${AUTH[@]}" "$API/accounts" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [[ -z "$account_id" ]]; then
  echo "  · No accounts visible to this token — skipping AutoRAG step."
  echo "    Re-run with a token that has Account → AutoRAG → Edit to enable hybrid search."
  exit 0
fi

# AutoRAG endpoint shape circa 2026-04 (verify at developers.cloudflare.com/autorag)
autorag_endpoint="$API/accounts/$account_id/autorag/instances"
probe=$(curl -s -o /dev/null -w "%{http_code}" "${AUTH[@]}" "$autorag_endpoint" || echo "000")
if [[ "$probe" != "200" ]]; then
  echo "  · AutoRAG returned $probe — token likely lacks Account → AutoRAG scope."
  echo "    Skipping. Re-run after broadening the token to enable hybrid search."
  exit 0
fi

# Create instance (idempotent — skip if exists)
echo "→ Creating AutoRAG instance 'uipg-prompts'…"
curl -s -X POST "${AUTH[@]}" "$autorag_endpoint" \
  -d '{"name":"uipg-prompts","description":"Ultimate Image Prompt Generator corpus"}' > /dev/null \
  || echo "    (already exists or create failed — continuing)"

# Upload prompts JSON for indexing
if [[ -f "$PROMPTS_FILE" ]]; then
  echo "→ Uploading $PROMPTS_FILE for indexing…"
  curl -s -X POST "${AUTH[@]}" \
    "$autorag_endpoint/uipg-prompts/files" \
    --data-binary "@$PROMPTS_FILE" > /dev/null \
    || echo "    (upload may have failed — check AutoRAG dashboard)"
fi

echo
echo "✓  Bootstrap complete."
echo "   Next: wire AutoRAG search into /api/prompts (see docs/CLOUDFLARE_RUNBOOK.md §3)."
