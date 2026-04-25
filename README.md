# PostPod

Turn a raw podcast episode into publish-ready assets in under a minute.

**Live:**
- [postpodcast.in](https://postpodcast.in) — the full app (upload → transcribe → generate)
- [postpod-aakankshah2s-projects.vercel.app](https://postpod-aakankshah2s-projects.vercel.app) — waitlist landing page

---

## Two URLs, one codebase

This repo serves two distinct experiences from the same Next.js project. The correct
experience is selected at request time based on the incoming hostname — no manual
switching or separate deploys needed.

| URL | What it serves | Component |
|---|---|---|
| **postpodcast.in** | The full PostPod app — upload, transcribe, generate, pay | `components/PostPodApp.tsx` |
| **postpod-aakankshah2s-projects.vercel.app** | Waitlist landing page — email capture only | `components/WaitlistPage.tsx` |
| **localhost** | The full PostPod app (for local development) | `components/PostPodApp.tsx` |

### How the routing works

`app/page.tsx` is a Next.js server component. On every request it reads the `host`
header and picks which component to render:

```
postpodcast.in  →  <PostPodApp />
*.vercel.app    →  <WaitlistPage />
localhost:*     →  <PostPodApp />
```

Both components are loaded via `next/dynamic` so their JS bundles are separate —
waitlist visitors never download the app code, and vice versa.

The routing logic lives entirely in `app/page.tsx`. To change which hostnames map
to which experience, edit the `showApp` condition there.

### Shared backend

Both experiences share one Convex deployment (`standing-ibis-616`). The waitlist
form writes to the `waitlist` table. The app uses separate tables (`episodes`,
`assets`, `userCredits`, `transactions`). There is no overlap between the two at
the data level.

---

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** for styling
- **Convex** — database, auth, file storage, serverless functions
- **Razorpay** — INR payments (UPI, cards, netbanking)
- **Replicate / Whisper** — audio transcription
- **Anthropic Claude** (`claude-opus-4-7`) — asset generation
- **Vercel** — deployment (single project, two domains)
- **Resend** — magic-link email auth

---

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/aakankshah2/PostPod.git
cd PostPod
npm install
```

### 2. Start Convex dev server (keep this running)

```bash
npx convex dev
```

This writes `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` to `.env.local` automatically.

### 3. Set up Convex Auth keys

```bash
npx @convex-dev/auth
```

### 4. Fill in the remaining env vars

See the full list below. Edit `.env.local`.

### 5. Start the Next.js dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — this shows the full app (not the waitlist).

---

## Environment variables

All vars go in `.env.local` for local dev, and in the Convex + Vercel dashboards for production.

| Variable | Used by | Where to get it |
|---|---|---|
| `CONVEX_DEPLOYMENT` | Convex | Auto-set by `npx convex dev` |
| `NEXT_PUBLIC_CONVEX_URL` | Convex client | Auto-set by `npx convex dev` |
| `SITE_URL` | Auth callbacks | `http://localhost:3000` locally, `https://postpodcast.in` in prod |
| `AUTH_RESEND_KEY` | Magic-link email | [resend.com](https://resend.com) → API Keys |
| `ANTHROPIC_API_KEY` | Asset generation | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| `REPLICATE_API_TOKEN` | Whisper transcription | [replicate.com](https://replicate.com/account/api-tokens) |
| `RAZORPAY_KEY_ID` | Payments | [dashboard.razorpay.com](https://dashboard.razorpay.com/app/keys) |
| `RAZORPAY_KEY_SECRET` | Payment verification | Same |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay JS SDK | Same as `RAZORPAY_KEY_ID` |

Convex-side vars (set via `npx convex env set` or the Convex dashboard):
`JWT_PRIVATE_KEY`, `JWKS`, `AUTH_RESEND_KEY`, `ANTHROPIC_API_KEY`,
`REPLICATE_API_TOKEN`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `SITE_URL`

---

## Project structure

```
app/
  layout.tsx               Root layout with Convex providers
  page.tsx                 Hostname router — picks app vs waitlist
  sign-in/page.tsx         Magic-link sign-in (app only)
  api/webhooks/razorpay/   Razorpay webhook handler
  globals.css              Design tokens + CSS classes

components/
  WaitlistPage.tsx         Waitlist landing page (vercel.app URLs)
  PostPodApp.tsx           Full 3-screen app (postpodcast.in + localhost)
  UploadScreen.tsx         Screen 1 — episode name + file upload
  ProcessingScreen.tsx     Screen 2 — animated progress + elapsed timer
  OutputsScreen.tsx        Screen 3 — collapsible output cards + paywall
  PaymentModal.tsx         Razorpay checkout modal
  Header.tsx               Logo + credits badge + sign-out
  SignInGate.tsx           Post-processing sign-in prompt
  icons/index.tsx          SVG icon components

convex/
  schema.ts                Database schema
  auth.ts                  Auth config (Resend magic-link)
  auth.config.ts           JWT issuer config
  http.ts                  HTTP router (auth + webhook)
  episodes.ts              Episode CRUD
  assets.ts                Generated asset storage
  transcription.ts         Replicate Whisper integration
  assetGeneration.ts       Anthropic Claude integration
  payments.ts              Razorpay order + verification
  transactions.ts          Payment transaction ledger
  users.ts                 Credit management
  waitlist.ts              Waitlist email capture

lib/
  demoData.ts              Demo outputs for the demo episode flow
```

---

## Deploying

```bash
# Deploy Convex functions to production
CONVEX_DEPLOYMENT=prod:standing-ibis-616 npx convex deploy

# Deploy Next.js to Vercel production
vercel --prod
```

Both `postpodcast.in` and the Vercel URL update from a single `vercel --prod` —
there is only one Vercel project.
