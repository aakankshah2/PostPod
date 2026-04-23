# PostPod Design System

## Color tokens

All tokens live as CSS custom properties in `app/globals.css` and as TypeScript constants in `lib/tokens.ts`.

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#000000` | Page background |
| `--bg-elevated` | `#0d0d0d` | Cards, modals, header |
| `--bg-card` | `#131313` | Inner card surfaces |
| `--bg-input` | `#0a0a0a` | Input fields |
| `--border` | `#262626` | Default borders |
| `--border-soft` | `#1a1a1a` | Subtle dividers |
| `--text` | `#ffffff` | Primary text |
| `--text-muted` | `#a3a3a3` | Secondary text |
| `--text-dim` | `#666666` | Tertiary / disabled text |
| `--accent` | `#FFD60A` | Brand yellow — CTAs, highlights |
| `--accent-hi` | `#FFE246` | Accent hover state |
| `--accent-dim` | `rgba(255,214,10,0.14)` | Accent tinted backgrounds |
| `--success` | `oklch(0.78 0.15 155)` | Green — complete states |
| `--danger` | `oklch(0.7 0.18 25)` | Red — error states |

## Border radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `10px` | Buttons, inner cards, modal inputs |
| `--radius` | `14px` | Upload buttons, output cards |
| `--radius-lg` | `20px` | Upload card, processing card, modal |

## Typography

- **Primary font**: Inter — 400, 500, 600, 700, 800
- **Mono font**: JetBrains Mono — 400, 500 (timestamps, OTP input)
- **Font features**: `cv11`, `ss01`, `ss03` (Inter optical)

| Role | Size | Weight | Letter-spacing |
|---|---|---|---|
| Hero title | `clamp(44px, 6vw, 72px)` | 800 | `-0.04em` |
| Section title | `34px` | 700 | `-0.025em` |
| Card heading | `28px` | 600 | `-0.02em` |
| Body | `15–16px` | 400 | — |
| Small / meta | `12–13px` | 400–500 | — |
| Eyebrow | `11px` | 500 | `0.15em` uppercase |
| Ghost wordmark | `clamp(180px, 26vw, 380px)` | 800 | `-0.05em` |

## Ambient background

Radial gradient anchored at top-center, yellow-tinted:
```css
radial-gradient(ellipse 50% 35% at 50% 0%, rgba(255,214,10,0.05), transparent 70%)
```

## Key component patterns

### Upload card
Dark elevated card with 20px backdrop blur, inner highlight inset shadow, and `border-radius: 20px`. Episode input turns non-italic on focus.

### Stage dots (processing screen)
Three-state dot: `pending` (dim, bordered), `active` (accent border + pulse-ring animation), `done` (solid accent fill + check icon).

### Output cards (results screen)
Collapsible. Header shows numbered badge, title, free/locked tag, and icon buttons. Body slides in via `slideDown` keyframe. Locked cards blur their body and show a centered lock overlay with unlock CTA.

### Paywall unlock banner
Gradient amber border, lock icon, and "Unlock for ₹299" yellow CTA. Sits above the output card list when any card is locked.

### Payment modal
`backdrop-filter: blur(8px)` overlay, modal pops with `scale(0.94)→1` + `translateY(10px)→0` spring. Three internal steps: `form` → `processing` (spinner) → `success` (green check).

## Do not hardcode colors

Always reference tokens:
```tsx
// ✅ correct
style={{ color: 'var(--accent)' }}
className="text-[--accent]"   // Tailwind arbitrary CSS var

// ❌ wrong
style={{ color: '#FFD60A' }}
```
