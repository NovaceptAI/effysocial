# EffySocial — Per-Creation Pricing Quote

_Prepared 25 Jun 2026 · FX ₹85/USD · all figures exclude GST_

Pricing for the five EffySocial apps. Each app bills on **one unit** (no
overlapping tiers). Variable-cost services (lip sync, voice chat, dubbing,
premium photo) are priced at a **50% gross margin** (retail = 2 × provider
cost). Text/compute-only services (campaign, post, standard photo) have a
near-zero marginal cost, so they are **value-priced** — a 50% markup on a
fraction of a rupee isn't a sellable price.

---

## Summary

| # | App | Billing unit | Price (₹) | Price ($) |
|---|-----|--------------|-----------|-----------|
| 1 | Lip Sync video | per second of output (by model) | ₹5–₹34 / sec | $0.06–$0.40 / sec |
| 2 | AI Voice Chat | per minute | ₹17 / min | $0.20 / min |
| 3 | Campaign | per campaign created | ₹40 | $0.49 |
| 4 | Social Post | per post created | ₹25 | $0.29 |
| 5 | Leadership Photo | per photo | ₹12 (std) / ₹35 (HD) | $0.15 / $0.40 |

---

## 1. Lip Sync — per second of output video

Sync Labs bills **per output frame**; the rates below assume **30 fps** video
(30 frames per second). Retail = 2 × cost (**50% margin**).

| Model | Quality | $/frame (cost) | Cost/sec @30fps | **Retail ₹/sec** | 30s video | 60s video |
|-------|---------|----------------|-----------------|------------------|-----------|-----------|
| `lipsync-1.9.0-beta` | Fast | $0.00100 | $0.030 | **₹5** | ₹150 | ₹300 |
| `lipsync-2` | Standard | $0.00200 | $0.060 | **₹10** | ₹300 | ₹600 |
| `lipsync-2-pro` ⭐ | Pro (default) | $0.00332 | $0.0996 | **₹17** | ₹510 | ₹1,020 |
| `sync-3` | Ultra | $0.00532 | $0.1596 | **₹27** | ₹810 | ₹1,620 |
| `react-1` | Reactions | $0.00668 | $0.2004 | **₹34** | ₹1,020 | ₹2,040 |

⭐ = the model currently wired in production.

**Auto-dub add-on** (translate + revoice to another language, Groq Whisper +
ElevenLabs): cost ~$0.10/min → **+₹17/min** at 50% margin.

> **Frame-rate note:** cost scales with *frames*, not seconds. A 25 fps clip is
> ~17% cheaper than the 30 fps figures above; a 60 fps clip is 2×. For exact
> per-file pricing, Sync's `estimate_cost()` returns `total_frames` and
> `total_cost` before generation — recommended to wire into the confirm step
> later so the charge always tracks the real frame count and our plan discount.

> **Tier discount:** API access requires Sync's Scale plan ($249/mo), which
> applies −20% to every rate above — i.e. our true cost drops and margin rises
> beyond 50% once at volume.

## 2. AI Voice Chat — per minute

Stack: Sarvam STT (saaras:v3) → Groq LLM (llama-3.3-70b) → ElevenLabs TTS
(turbo v2.5) → LiveKit transport.

| Component | Cost/min |
|-----------|----------|
| Sarvam STT (₹30/hr) | ₹0.50 |
| Groq LLM | ~₹0.25 |
| ElevenLabs TTS | ~₹4.25 |
| LiveKit | ~₹0.10 |
| **Total cost** | **~₹5–8 / min ($0.06–0.10)** |

**Retail: ₹17 / minute ($0.20)** — 50% margin on a ₹8.5 blended cost, billed per
whole minute (rounded up). _Recommend ₹20/min if you want headroom for chattier
conversations, since ElevenLabs TTS scales with how much the agent talks._

## 3. Campaign Generator — per campaign created

- **Provider cost:** ~₹0.17 ($0.002) — a single Groq text call.
- **Retail: ₹40 ($0.49) per campaign** — value-priced (5 deliverables: concept,
  WhatsApp copy, 30s video script, poster headline, regional-language variant,
  with compliance guardrails). Marginal compute cost is negligible.

## 4. Social Post — per post created

- **Provider cost:** ~₹0.25 ($0.003) — Groq copy call + 1 image (Cloudflare FLUX
  ~free tier, or Pollinations free). Trends use free Google News / YouTube quota.
- **Retail: ₹25 ($0.29) per post** — includes 1 generated image. Value-priced.

## 5. Leadership Photo — per photo

| Mode | Engine | Cost | **Retail** |
|------|--------|------|------------|
| **Standard** | self-hosted `rembg`/u2net (CPU, ~4s) | ~₹0.20 infra, **no API** | **₹12 ($0.15)** |
| **HD (tentative)** | RMBG-2.0 / BiRefNet for cleaner hair edges (fal ~$0.018, or remove.bg ~$0.15) | ₹1.5–₹13 | **₹35 ($0.40)** |

Standard has **zero marginal API cost** (pure server compute) — ideal for
high-volume event booths. HD is only worth it if edge quality on hair / busy
backgrounds matters.

---

## Notes & methodology

- **Currently $0 marginal cost in the stack:** Cloudflare FLUX (10k neurons/day
  free), Pollinations, Google News RSS, YouTube API quota.
- **Margin method:** variable-cost apps priced at `retail = cost ÷ (1 − 0.50)`
  = 2 × cost. Value-priced apps (campaign, post, standard photo) carry a much
  higher effective margin because the per-unit compute cost is a fraction of a
  rupee; pricing reflects output value, not cost-plus.
- **Dominant cost drivers:** Sync Labs (lip sync) and ElevenLabs (chat/dub).
  Everything else is rounding error.
- All retail figures are rounded to friendly values; exact 50% points are in the
  cost columns.

### Provider rate sources
- Sync Labs billing (per-frame, model rates, tier discounts): https://sync.so/docs/product/billing · https://sync.so/pricing
- ElevenLabs API: https://elevenlabs.io/pricing/api
- Groq: https://groq.com/pricing
- Sarvam AI: https://www.sarvam.ai/api-pricing
- LiveKit: https://livekit.com/pricing
- Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/platform/pricing/
- Background removal (remove.bg / Replicate / fal): https://www.remove.bg/pricing · https://replicate.com/collections/remove-backgrounds

---

# EffySocial — Subscription Plans (2026)

_FX ₹85/USD · ex-GST · USD prices are region-set (India-first), not a direct conversion._

## Cost basis (why the margins hold)
All in-app AI (AI Studio, Brand voice, Landing copy, Effy assistant) runs on
**Groq `llama-3.3-70b-versatile`** — current rates **$0.59/M input, $0.79/M output**.
A blended AI action (~800 in + 700 out tokens) costs **$0.001 ≈ ₹0.09** — we
model **₹0.10/action** for safety. **Images are free** (Cloudflare FLUX Schnell /
Pollinations); CEO-photo background removal (`rembg`) runs locally. So EffySocial's
core marginal cost is dominated by fixed infra, not tokens.

| Tier | AI actions/mo | AI cost | Infra alloc | **Total cost** | **Price/mo** | Margin |
|------|--------------:|--------:|------------:|---------------:|-------------:|-------:|
| Plus | 300 | ₹30 | ₹150 | **₹180** | **₹999** | 82% (5.5×) |
| Pro | 1,500 | ₹150 | ₹450 | **₹600** | **₹2,999** | 80% (5.0×) |
| Business | 6,000 | ₹600 | ₹1,500 | **₹2,100** | **₹8,999** | 77% (4.3×) |

Every tier clears the **2× profit** floor by a wide margin; annual (2 months free)
still holds 3.6×–4.6×.

## Plans

| | **Plus** | **Pro** ⭐ | **Business** |
|--|--|--|--|
| **Monthly** | ₹999 / $19 | ₹2,999 / $59 | ₹8,999 / $179 |
| **Yearly** (2 mo free) | ₹9,990 / $190 | ₹29,990 / $590 | ₹89,990 / $1,790 |
| For | Solo businesses | Growing businesses & freelancers | Agencies & multi-brand |
| Workspaces (brands) | 1 | 3 | 15 |
| Team seats | 2 | 5 | 20 |
| AI generations / mo | 300 | 1,500 | 6,000 |
| AI Studio + Brand Brain | ✅ | ✅ | ✅ |
| Calendar, scheduling, inbox | ✅ | ✅ | ✅ |
| Organic analytics | ✅ | ✅ | ✅ |
| Ads dashboard (Meta+Google) | — | ✅ | ✅ |
| Landing pages, forms, pipeline | — | ✅ | ✅ |
| Follow-up automation | — | ✅ | ✅ |
| Playbooks (Sprint + Launch) | — | ✅ | ✅ |
| Full analytics (leads/revenue/ROAS) | — | ✅ | ✅ |
| Approvals workflow | — | ✅ | ✅ |
| White-label reports + client portals | — | — | ✅ |
| Agency overview & oversight | — | — | ✅ |
| Conversion Tracking Centre | — | — | ✅ |
| API access + advanced RBAC | — | — | ✅ |
| Support | Email | Priority | Priority + onboarding |

## Usage-based add-ons (metered, ~2× cost)
- **Extra AI generations:** ₹1 each (bundles of 500 = ₹400) — ~10× cost, protects margin.
- **Lip-sync video / AI voice / dubbing / HD leadership photo:** per the per-creation
  rates above (all at 50% gross margin).
- **Extra workspace:** ₹499/mo · **Extra seat:** ₹299/mo.
