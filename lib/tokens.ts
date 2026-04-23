// PostPod design tokens — single source of truth for JS/TS usage.
// CSS custom properties are the primary system; these are for places
// that need JS values (e.g. canvas, dynamic styles, Storybook).

export const colors = {
  bg:         "#000000",
  bgElevated: "#0d0d0d",
  bgCard:     "#131313",
  bgInput:    "#0a0a0a",
  border:     "#262626",
  borderSoft: "#1a1a1a",
  text:       "#ffffff",
  textMuted:  "#a3a3a3",
  textDim:    "#666666",
  accent:     "#FFD60A",
  accentHi:   "#FFE246",
  accentDim:  "rgba(255, 214, 10, 0.14)",
} as const;

export const radius = {
  sm: "10px",
  md: "14px",
  lg: "20px",
} as const;

export const font = {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', monospace",
} as const;
