# Design Tokens (Colors, Typography, Spacing)

This document defines our single source of truth for the visual system: colors, typography, spacing, radii, shadows, and key layout metrics. Tokens live in `src/styles/tokens.css` and are imported by `src/styles/global.css`.

## Where to use

- Prefer CSS variables from `tokens.css` in all component styles instead of hard-coded values.
- Map component-specific values to semantic tokens (e.g., `--color-brand`, `--color-text-primary`).
- If a new color/size is needed, add it to tokens rather than inlining.

## Tokens overview

- Colors
  - Brand palette: `--brand-ink`, `--brand-teal`, `--brand-peach`, `--brand-green`
  - Heritage/accents: `--brand-heritage-red`, `--brand-gold`, `--brand-mint`
  - Semantic: `--color-brand`, `--color-accent`, `--color-text-primary`, `--color-bg-surface`, etc.
- Typography
  - Family: `--font-sans`
  - Sizes: `--fs-2xs` … `--fs-5xl`
  - Weights: `--fw-regular`, `--fw-semibold`, `--fw-bold`, `--fw-extrabold`
  - Line heights: `--lh-tight`, `--lh-normal`, etc.
- Spacing & radii
  - Scale: `--space-1` … `--space-12`
  - Radii: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`
- Shadows & transitions
  - Shadows: `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`
  - Transition: `--transition-base`
- Layout metrics
  - Container: `--container-max`
  - Navigation: `--nav-height`, `--nav-height-compact`, `--nav-search-max`
  - Z-index: `--z-nav`, `--z-dropdown`, `--z-modal`, etc.

## Usage examples

Buttons:

```css
.btn-primary {
  background: var(--color-cta-bg);
  color: var(--color-cta-text);
  border-radius: var(--btn-radius);
  padding: var(--btn-pad-y-md) var(--btn-pad-x-md);
  font-size: var(--btn-font-md);
  box-shadow: var(--shadow-xs);
}
.btn-primary:hover { background: var(--color-brand-hover); }
.btn-primary:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 2px; }
```

Card surface:

```css
.card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
```

Text styles:

```css
.subtitle { font-size: var(--fs-lg); font-weight: var(--fw-semibold); color: var(--color-text-primary); }
.meta { font-size: var(--fs-xs); color: var(--color-text-secondary); }
```

## Conventions

- Use semantic tokens where possible. Only use brand tokens for special elements (logos, key accents).
- Avoid hex values in component CSS. If a token is missing, add it to `tokens.css` first.
- Keep dark mode out for now (light-only). If needed later, we will add a `[data-theme="dark"]` block with overrides.

## Migration notes

- Many components already reference CSS variables. As we touch files, replace hard-coded colors like `#111`, `#fff`, `rgba(0,0,0,0.1)` with nearby semantic tokens (`--color-text-primary`, `--color-bg-surface`, `--border-soft`).
- NavBar and forms already consume tokens for colors, radii, and typography.

