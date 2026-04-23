# PostPod

Turn a raw podcast episode into publish-ready assets in under a minute.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** for styling
- **Convex** — database, auth, file storage, serverless functions
- **Razorpay** — INR payments (UPI, cards, netbanking)
- **Replicate / Whisper** — audio transcription
- **Anthropic Claude** (`claude-opus-4-7`) — asset generation
- **Vercel** — deployment target

---

## Local setup

### 1. Clone and install

```bash
git clone <repo>
cd postpod
npm install
```

### 2. Start Convex dev server (keep this running)

```bash
npx convex dev
```

This writes `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` to `.env.local` automatically.

### 3. Set up Convex Auth

Run the auth initialiser — it generates `CONVEX_AUTH_PRIVATE_KEY` and configures the deployment:

```bash
npx @convex-dev/auth
```

Copy the printed `CONVEX_AUTH_PRIVATE_KEY` into `.env.local`.

### 4. Fill in the remaining env vars

See the full list below. Edit `.env.local`.

### 5. Start the Next.js dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

All vars go in `.env.local`. The file ships with blank placeholders.

| Variable | Required for | Where to get it |
|---|---|---|
| `CONVEX_DEPLOYMENT` | Convex | Auto-set by `npx convex dev` |
| `NEXT_PUBLIC_CONVEX_URL` | Convex client | Auto-set by `npx convex dev` |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Auth JWKS | Auto-set by `npx convex dev` |
| `CONVEX_AUTH_PRIVATE_KEY` | Auth token signing | `npx @convex-dev/auth` |
| `SITE_URL` | Auth callbacks | `http://localhost:3000` locally |
| `AUTH_RESEND_KEY` | Email OTP | [resend.com](https://resend.com) → API Keys |
| `ANTHROPIC_API_KEY` | Asset generation | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| `REPLICATE_API_TOKEN` | Whisper transcription | [replicate.com](https://replicate.com/account/api-tokens) |
| `RAZORPAY_KEY_ID` | Payments (server) | [dashboard.razorpay.com](https://dashboard.razorpay.com/app/keys) |
| `RAZORPAY_KEY_SECRET` | Payment verification | Same |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay JS SDK | Same as `RAZORPAY_KEY_ID` |

---

## Project structure

```
app/
  layout.tsx             Root layout with Convex auth providers
  page.tsx               Home — PostPod upload screen
  sign-in/page.tsx       Email OTP sign-in
  globals.css            Design tokens + PostPod CSS classes

components/
  PostPodApp.tsx         Full 3-screen app (client)
  Header.tsx             Logo + credits badge + auth state
  UploadScreen.tsx       Screen 1 — episode name + file upload
  ProcessingScreen.tsx   Screen 2 — animated progress stages
  OutputsScreen.tsx      Screen 3 — collapsible output cards
  PaymentModal.tsx       Razorpay-style payment modal
  icons/index.tsx        SVG icon components

convex/
  schema.ts              Database schema (auth + app tables)
  auth.ts                @convex-dev/auth config (Resend OTP)
  http.ts                HTTP router (auth JWKS + API routes)
  users.ts               Credit management functions
  waitlist.ts            Waitlist mutation

lib/
  tokens.ts              Design tokens as TypeScript constants
  demoData.ts            Demo episode outputs for preview

middleware.ts            Auth token refresh (Next.js middleware)
DESIGN.md                Design system documentation
```

---

## Build order

| Step | What | Status |
|---|---|---|
| 1 | Scaffold + landing page + auth | Done |
| 2 | Upload flow (Convex file storage) | Pending |
| 3 | Transcription (Replicate Whisper) | Pending |
| 4 | Asset generation (Claude API) | Pending |
| 5 | Results screen | Pending |
| 6 | Paywall + Razorpay payments | Pending |
| 7 | Credit gating | Pending |

---

## Deploying to Vercel

```bash
vercel env pull   # sync env vars
vercel            # preview deploy
vercel --prod     # production
```

Set all env vars in the Vercel dashboard under Project → Settings → Environment Variables.
