# PostPod — product scope & user journey

Turn a raw podcast episode into publish-ready assets in under a minute.

---

## screens at a glance

| # | Screen | File | Who sees it |
|---|--------|------|-------------|
| 1 | Upload | `components/UploadScreen.tsx` | Everyone who lands on postpodcast.in or localhost |
| 2 | Processing | `components/ProcessingScreen.tsx` | After submitting an episode |
| 3 | Outputs | `components/OutputsScreen.tsx` | After processing completes |
| — | Sign-in | `app/sign-in/page.tsx` | When user tries to pay without an account |
| — | Waitlist | `components/WaitlistPage.tsx` | Anyone hitting a *.vercel.app URL |

---

## screen 1 — upload

### what the user sees

A dark-themed page with:
- "For podcast hosts · v1.0" eyebrow label
- Hero headline: "Turn a raw episode into publish-ready assets."
- A card with:
  - Episode name text input (placeholder: "Naval on wealth and leverage (raw)")
  - Two upload buttons: **Upload MP3** and **Upload Transcript**
  - A collapsible "Or paste transcript text ↓" textarea
  - A disabled "Generate publish-ready assets →" button (enabled once name + file ready)
  - A subtle "Try a demo episode →" secondary button below the main one
- Footer: "Files never leave your workspace" · "~45 sec for a 45-min episode"

### what the user types / uploads

| Input | Required | Details |
|-------|----------|---------|
| Episode name | Yes, 4+ chars | Free text. Used as document title on outputs. |
| MP3 file | One of these three | Up to 500 MB. `audio/*` accept type. |
| .txt transcript file | One of these three | Plain text. Read client-side, sent as string. |
| Pasted transcript | One of these three | Textarea, any length. |

### what happens when they click "Generate"

**Demo path** (clicked "Try a demo episode →"):
- No upload. `onSubmit({ title: "Naval Ravikant…", isDemo: true })` fires client-side.
- Goes straight to Processing screen. No Convex call made.

**MP3 path:**
1. Client calls `episodes.generateUploadUrl` → Convex returns a signed S3 upload URL
2. Client uploads MP3 directly to Convex storage via XHR (progress bar shown)
3. Client calls `episodes.createEpisode` → episode row created in DB with `status: "uploaded"`, `audioStorageId` set
4. Client calls `transcription.startTranscription` (Convex action → Replicate Whisper API)
5. Goes to Processing screen

**Transcript/paste path:**
1. Client reads file as text (or uses pasted string)
2. Client calls `episodes.createEpisode` → episode row created with `status: "uploaded"`, `transcript` set
3. Client calls `assetGeneration.generateAssets` directly (no transcription step)
4. Goes to Processing screen

### where the data lives

- MP3 file → Convex file storage (`_storage` table). Referenced by `audioStorageId` on the episode.
- Transcript text → stored inline on the `episodes` row as a string field.
- Episode metadata → `episodes` table in Convex (deployment: `standing-ibis-616`).

---

## screen 2 — processing

### what the user sees

A centred card with:
- "PostPod · Processing" label
- Animated headline showing the current active stage (with trailing dots animation)
- Episode name in quotes
- Three stage rows: **Transcribing audio** / **Analyzing content & structure** / **Generating outputs**
- Each row shows: status dot, label, and time estimate or elapsed seconds
- A progress bar (0–100%)
- Footer row: "X% · Ys elapsed" on left · "Please don't close this window" on right
- During transcription only: helper text — "This takes 2–5 minutes. Grab a coffee and we'll have your assets ready when you're back."

### how the progress works

**Demo mode:** client-side RAF animation runs for 6 seconds, hits 100%, fires `onComplete`.

**Real mode — two phases:**

| Phase | Trigger | Progress range |
|-------|---------|----------------|
| Transcribing | Episode `status === "transcribing"` | Stuck at 0%, elapsed timer ticks |
| Simulated (post-transcription) | Episode gets a transcript | Animates 35% → 99% over 8 seconds |
| Complete | Episode `status === "complete"` | Jumps to 100%, `onComplete` fires after 400 ms |

The app polls episode status via a Convex `useQuery` on `episodes.getEpisode` — Convex pushes updates reactively so no manual polling is needed.

### what's happening in the backend during real mode

**Transcription flow** (`convex/transcription.ts`):
1. Episode status set to `"transcribing"`
2. Replicate Whisper API called with the audio file URL
3. Polls Replicate until the prediction completes
4. Transcript stored on the episode row; status set to `"transcribed"`
5. `generateAssets` called automatically (chained)

**Asset generation flow** (`convex/assetGeneration.ts`):
1. Episode status set to `"generating"`
2. Anthropic Claude (`claude-opus-4-7`) called with the transcript and a structured prompt
3. Response parsed into: titles (5), LinkedIn post, chapters with timestamps, pull quotes, show notes
4. `assets` row inserted into DB; episode status set to `"complete"`

### timing

| File type | Typical time |
|-----------|-------------|
| Demo | ~6 seconds |
| Transcript / paste | ~15–20 seconds (generation only) |
| 30–45 min MP3 | ~2–4 minutes (transcription) + ~15 seconds (generation) |
| 60+ min MP3 | ~5–8 minutes total |

---

## screen 3 — outputs

### what the user sees

Five collapsible output cards:

| # | Output | Default state | Locked? |
|---|--------|--------------|---------|
| 01 | Episode titles (5 options with hook score) | Open | Free |
| 02 | LinkedIn post (character + word count shown) | Open | Free |
| 03 | Chapters & timestamps | Closed | Locked |
| 04 | Pull quotes | Closed | Locked |
| 05 | Show notes | Closed | Locked |

Each card has a copy-to-clipboard button when unlocked. A "Download all .txt" button exports everything.

### the paywall

**Unlock banner** appears at the top (when not unlocked):
- If user has credits: "Use 1 credit to unlock" button → calls `users.spendCreditForEpisode`
- If no credits: "Unlock · ₹299" (single) + "10 credits · ₹2499" (pack) → opens PaymentModal

Clicking a locked card also surfaces the same inline unlock prompt.

**Demo mode:** all 5 outputs are fully visible, no paywall. Demo uses hardcoded `DEMO_OUTPUTS` from `lib/demoData.ts`.

### where assets come from

- **Demo:** static JSON in `lib/demoData.ts`
- **Real episode:** `assets.getAssets` Convex query, fetched by `episodeId`

### credit spend mechanics

`users.spendCreditForEpisode` (Convex mutation):
1. Verifies user is authenticated
2. Verifies episode exists and belongs to this user
3. Checks `episode.creditSpent !== true` (idempotent — can't double-spend)
4. Decrements `userCredits.creditsRemaining` by 1
5. Sets `episode.creditSpent = true`
6. Convex reactivity updates the UI automatically — locked sections dissolve

---

## sign-in journey

Triggered when an unauthenticated user clicks "Unlock" on a real episode.

1. `PostPodApp.tsx` detects `!isAuthenticated` → `router.push("/sign-in")`
2. **Before redirect:** episode data is already saved to `localStorage` (`postpod_episode` key) — this happens as soon as the outputs screen loads for a real episode
3. User lands on `/sign-in` — enters email, clicks "Send magic link"
4. Resend sends an email with a one-click link (expires in 10 minutes)
5. User clicks link → redirected to `/`
6. `PostPodApp.tsx` mounts, reads `localStorage`, finds saved episode → restores outputs screen directly
7. User is now authenticated and sees the same outputs, now with "Use 1 credit to unlock"

**Auth provider:** Convex Auth + Resend magic link. No passwords. From: `PostPod <noreply@postpodcast.in>`.

**On first sign-in:** `ensureUserCredits` runs automatically → 1 free credit added to `userCredits`.

---

## payment journey

Triggered when user has 0 credits and clicks an unlock button.

1. `PaymentModal` opens — shows two options:
   - **₹299** — 1 credit (single episode)
   - **₹2499** — 10 credits (bulk pack)
2. User selects pack → `payments.createOrder` called → Razorpay order created server-side
3. Razorpay JS SDK opens the native checkout modal (UPI, cards, netbanking)
4. User pays → Razorpay fires a webhook to `/api/webhooks/razorpay`
5. Webhook handler verifies HMAC signature, calls `users.addCredits` → credits added
6. `useQuery(api.users.getMyCredits)` updates reactively in the UI
7. User can now click "Use 1 credit to unlock"

**Payment processor:** Razorpay (INR only). International cards not accepted.

---

## return journey — what happens if they come back tomorrow

### if they signed in before leaving

- Convex Auth session persists in browser storage (no re-login needed for ~30 days)
- User lands on upload screen (React state does not persist across page reloads)
- Their credit balance is fetched from `userCredits` on mount — shown in the paywall if they process a new episode
- Previously processed episodes are **not** shown on return — there is no episode history list yet

### if they weren't signed in when they processed

- Their episode was created anonymously (`userId` is null on the episode row)
- On return they see the upload screen with no reference to their previous episode
- The episode and its assets still exist in Convex DB but are not surfaced to them

### the localStorage bridge

If the user was mid-session (outputs screen open) and got redirected to sign-in, their `episodeId` and `title` are in `localStorage` under the key `postpod_episode`. On next load, the app reads this and restores the outputs screen. This key is cleared when the user clicks "Home" or starts a new episode.

---

## edge cases

| Scenario | What happens |
|----------|-------------|
| MP3 upload fails mid-way | XHR error caught → "Upload failed. Please try again." toast. Cancel button aborts the upload cleanly. |
| Replicate returns an error | Episode `status` set to `"error"`, `errorMessage` stored. Processing screen fires `onError` → user sent back to upload screen with toast. |
| Asset generation fails | Same error path as above. |
| User closes tab during transcription | Episode keeps processing in the backend (Convex action continues). If user returns and navigates to the same episode, they would need the episodeId (not currently surfaced as a link). |
| User tries to pay without being signed in | Redirected to `/sign-in`. Episode saved to localStorage. Restored after sign-in. |
| User tries to spend credit on someone else's episode | `spendCreditForEpisode` checks `episode.userId === userId`. Throws "Episode not found" if mismatch. |
| User double-clicks "Use 1 credit" | `episode.creditSpent === true` check makes the mutation idempotent. Credit deducted only once. |
| Razorpay webhook arrives twice | Transaction row has unique `razorpayOrderId` index. Second webhook finds status already `"paid"` and exits early. |
| User on *.vercel.app URL | Hostname routing in `app/page.tsx` shows `WaitlistPage` instead of the app. Completely separate component, separate bundle. |
| International card used | Razorpay rejects it. User sees "International cards not accepted" from Razorpay modal. |
| Demo episode + sign-in redirect | `localStorage` bridge only saves real episodes (`!isDemo`). Demo state is not restored — user lands on upload screen after sign-in. |

---

## data model summary

```
users              ← managed by @convex-dev/auth
userCredits        userId, creditsRemaining, createdAt
episodes           userId?, title, audioStorageId?, transcript?, status, creditSpent?, errorMessage?, createdAt
assets             episodeId, titles[], chapters[], pullQuotes[], linkedInPost, showNotes, createdAt
transactions       userId, razorpayOrderId, razorpayPaymentId?, status, creditsPurchased, amountInr, createdAt
waitlist           email, createdAt
```

---

## what is not built yet

- Episode history list (returning users can't browse past episodes)
- Email after processing completes (useful for the "grab a coffee" wait)
- Dashboard showing credit balance prominently
- Shareable output link (currently outputs are session-only)
- Mobile layout polish
