# Fasolink Web Frontend

React + Vite application for the Fasolink marketplace (listings, seller reputation, messaging).

## Feature Highlights

- Infinite scroll listings with skeleton shimmer placeholders.
- Server-side filtering & sorting (price range, negotiable, featured, category, legacy min_rating filter).
- Seller reputation: aggregated seller reviews (`seller_rating`, `seller_rating_count`).
- Listing detail: Amazon-inspired layout, badges (Featured / Negotiable / New), desktop sticky action card, mobile sticky CTA bar.
- Messaging: responsive conversation list + chat window with mobile toggle.
- SEO: JSON-LD `Product` + `Offer` + optional `AggregateRating`.
- Accessibility: skip link, `aria-busy` loading states, semantic list roles, reduced-motion skeletons.

## Seller Ratings vs Legacy Product Rating

The legacy `Listing.rating` decimal field is deprecated in UI (retained for backward compatibility). Actual reputation is computed per seller from `Review` objects server-side and injected into listing responses as:

- `seller_rating` (average rating)
- `seller_rating_count` (number of reviews)

Filtering currently exposes `min_rating` against the legacy `rating` field. To filter by seller rating you can add a custom filter using the annotated aggregate instead.

## Accessibility Notes

- Skip link: focusable at top, jumps to `#main-content`.
- Infinite listings grid: `role="list"`, each card acts as a visual list item; interactive region stays inside anchor/card semantics.
- Loading: `aria-busy="true"` applied while additional pages are fetched.
- Skeletons: `aria-hidden="true"`, animated shimmer disabled under prefers-reduced-motion.

## Development Overview

The remaining sections detail messaging architecture, i18n, typography, and planned enhancements.

### Messaging Architecture (Current State)

The messaging UI uses a lightweight REST + polling model with a centralized context for efficiency and accessibility:

Core flow:

1. `MessagingProvider` (context) performs visibility-aware polling of `/conversations/` every 5s, exposing `conversations`, `unreadTotal`, and `refresh()`.
2. Conversation list (`ConversationList`) consumes context (no internal polling) and supports instant client-side filtering.
3. Chat window (`ChatWindow`) retrieves paginated messages (`/conversations/:id/messages/?page=N`) and merges newer messages by polling only page 1 (avoid re-loading older pages).
4. Scroll preservation logic keeps the viewport stable when older pages are prepended.
5. Read receipts: `POST /conversations/:id/mark-read/` automatically fires when unread messages from the other participant are present.
6. Optimistic send: Temporary `temp-*` message appended with `pending` flag, replaced on success, flagged `failed` with retry on error.
7. Offline handling: An offline banner appears; send button disabled until reconnected (messages not queued yet, but pattern in place).
8. Accessibility: Message list `role="log"` + `aria-live="polite"`; each bubble is an `article` with contextual `aria-label`. Buttons include descriptive aria labels.
9. Unified unread badge: Header `MessagesIndicator` consumes context `unreadTotal` (no duplicate polling).

Pagination Strategy:

- Newer messages appended at bottom to preserve natural chat reading order.
- Older messages loaded manually (button) with scroll offset compensation to avoid visual jump.

Potential next steps (if upgrading to realtime): Replace both polling loops with a WebSocket channel broadcasting new messages + read events; keep context shape stable so components do not need refactoring.

### Future Enhancements (Planned / Suggested)

| Feature | Direction |
|---------|-----------|
| WebSockets / Realtime | Replace polling with WS channel (e.g. Django Channels) broadcasting new messages + read events. |
| Typing Indicator | Add ephemeral WS event (user:start_typing / user:stop_typing) with debounce. |
| Delivery Status | Add per-message delivery state (sent -> delivered -> read) surfaced with ticks. |
| Media Attachments | Extend message model for file/media, implement upload endpoint & preview. |
| Infinite Scroll | Replace manual "Load older" with intersection observer to auto-load when scrolled to top. |
| Search in Conversation | Backend endpoint with full-text search limited to messages of a conversation. |

### Relative Time Formatting

Uses a lightweight helper (`src/utils/time.js`) with `Intl.RelativeTimeFormat` when available, gracefully falling back to simple English strings.

### Development Notes

1. Keep `MESSAGE_PAGE_SIZE` in sync with backend pagination value.
2. Conversation poll interval can be tuned; for production with WebSockets it will be removed.
3. Maintain backward compatibility: if backend changes message response envelope, adapt merge logic in `ChatWindow.jsx` (search for `results || data.messages || data`).

### Internationalization (i18n)

The app uses `i18next` with multiple namespaces for clarity and scalability:

Namespaces:

- `common` — generic UI (loading, hero, categories)
- `navigation` — header / nav items, account actions
- `auth` — authentication forms and related messages
- `listing` — listing detail, cards, gallery labels
- `messaging` — conversation list, chat window strings
- `dashboard` — user dashboard labels & empty states
- `errors` — reusable error messages

Adding a key:

1. Pick the correct namespace JSON in `src/locales/{en|fr}/`.
2. Add the key/value (use interpolation like `"welcome": "Welcome, {{username}}"`).
3. Reference with `const { t } = useTranslation(['namespace']);` then `t('namespace:key', { varName })`.

Pluralization: messaging uses separate keys (`unreadOne`, `unreadMany`). You can also adopt i18next plural forms if desired (e.g. `unread_one`, `unread_other`).

Language persistence: stored in `localStorage` under `appLanguage`; switching triggers `i18n.changeLanguage(lng)` (see `LanguageSwitcher`).

Missing keys: during development, missing keys log a console warning with `[i18n] Missing key:`.

## Authentication Flow

Implemented in `src/context/AuthContext.jsx` with a modal-based login / registration UI.

Key behaviors:

1. Token persistence: `authToken` stored in `localStorage` after successful login/registration.
2. Session restore: On mount, if a token exists the current user is fetched (`fetchCurrentUser` -> `/auth/me/`). Invalid tokens are cleared.
3. Protected navigation: `ProtectedRoute` captures the intended path (including query/hash) via `captureIntendedPath` before opening the auth modal and sending the user to `/`.
4. Post-auth redirect: After login/registration the consumed intended path (`consumeIntendedPath`) determines where to navigate; falls back to `/`.
5. Error handling: API error detail normalized to translation keys inside context.
6. UX improvements: Password show/hide toggles, strength indicator, confirm password, inline localized validation, aria-live feedback for success & error.
7. i18n coverage: Toggle labels, strength words (weak/fair/strong), mismatch, generic error all translated.

Protecting a route example:

```jsx
<Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
```

## Mobile Navigation Accessibility

Enhancements to `MobileDrawer`:

- `aria-expanded` and dynamic `aria-label` on the toggle.
- Focus restoration to previously focused element after close.
- Automatic close on route change to prevent stale state.
- Body scroll locked while open; released on unmount.
- Main content marked `aria-hidden` while drawer active.
- Escape key & focus trap within drawer panel.

These changes address prior issues where the hamburger state desynced or focus was lost after closing.

### Mobile Bottom Navigation (New)

On screens below 900px a persistent bottom navigation bar (`MobileBottomNav`) provides quick access to:

- Home
- Listings / Categories
- Post Ad (prominent floating action; opens auth modal if unauthenticated and preserves intended path)
- Messages
- Account / Dashboard

It respects safe-area insets (modern phone notches) and uses accessible labels + active state highlighting.

### Typography System

Implemented an Amazon-inspired typographic scale (non-proprietary) via CSS variables in `styles/global.css`:

Size tokens (rem): `--fs-2xs` (11px) → `--fs-5xl` (32px). Base body text uses `--fs-base` (14px) to mirror compact marketplace density.

Weight tokens: `--fw-regular` (400) to `--fw-extrabold` (800). Use heavier weights sparingly (headings & emphasis).

Utility classes:

- Headings: `.h1` … `.h6`
- Font sizes: `.text-sm`, `.text-base`, `.text-md`, `.text-lg`, `.text-xl`
- Weights: `.fw-regular`, `.fw-medium`, `.fw-semibold`, `.fw-bold`, `.fw-extrabold`

Legacy mapping preserves older French class names (`.titre-principal`, etc.). Prefer the new utilities for new development.

### Adding More Locales

1. Create `src/locales/<lang>/<namespace>.json` files mirroring English keys.
2. Import them in `src/i18n.js` under the new language code.
3. Add language option to `LanguageSwitcher`.

### Future i18n Enhancements

- Extract relative time strings into `common` for localization.
- Consolidate pluralization using i18next plural rules.
- Add QA script to scan for hardcoded English (simple grep on `[A-Z][a-z]+` outside translation calls).

### Running

Install dependencies and start dev server:

```bash
npm install
npm run dev
```

Build production bundle:

```bash
npm run build
```

Environment variable `VITE_API_BASE_URL` should point to the backend root (e.g. `http://localhost:8000/api`).

### License

Internal project; licensing to be defined.

---

## Design Tokens & Theming (Unified Red / White System)

> Dark mode note: All automatic dark mode / prefers-color-scheme overrides have been removed temporarily. The app forces the light theme regardless of system setting (`html { color-scheme: light; }`). Re-introduce by restoring the deleted media queries and the `[data-theme="dark"]` token block in `global.css` when a full dark palette is finalized.

All colors now flow from a semantic token layer defined in `styles/global.css`. Avoid hard‑coding hex values (especially legacy greens or ad‑hoc reds). Instead, map intent (brand, surface, border, focus, feedback) to tokens.

Core palette (light mode):

| Intent | Token | Example Purpose |
|--------|-------|-----------------|
| Brand primary | `--color-brand` | Primary buttons, active conversation, key accents |
| Brand hover | `--color-brand-hover` | Hover states of brand buttons/links |
| Brand subtle bg | `--color-brand-soft` | Light background chips / subtle brand surfaces |
| Text on brand | `--color-on-brand` | Foreground atop solid brand backgrounds |
| Focus ring | `--color-focus-ring` | `:focus-visible` outlines, accessibility highlight |
| Border default | `--color-border` | Neutral panel & card borders |
| Border strong | `--color-border-strong` | Emphasis dividers, table headers |
| Surface base | `--color-bg-primary` | Page background |
| Surface card | `--color-bg-surface` | Cards, panels, modals |
| Surface alt | `--color-bg-alt` | Subtle alternating sections, chat area |
| Danger text | `--color-danger` | Error text / destructive badge |
| Danger bg soft | `--color-bg-danger-soft` | Inline error bubble background |
| Danger border | `--color-danger-border` | Outline for error/danger elements |
| Skeleton base | `--color-skeleton-base` | Base color of shimmer placeholder |
| Skeleton highlight | `--color-skeleton-highlight` | Animated gradient sweep |

Dark mode adjustments are applied with `@media (prefers-color-scheme: dark)` overrides to keep contrast while respecting brand hue (slightly desaturated in darker surfaces to reduce glare).

### Usage Principles

1. Always prefer a semantic token (e.g. `--color-brand`) over a specific shade number.
2. For hover/active, first look for a companion semantic token (e.g. `--color-brand-hover`). Only derive with `filter`/`opacity` if no token exists.
3. Do not layer multiple brand backgrounds; use a neutral surface + brand border OR brand bg + neutral interior, not both.
4. Spacing tokens may be introduced later; keep current spacing consistent (4px scale). Avoid mixing arbitrary values when an existing pattern is nearby.

### Adding a New Token

1. Define it in `:root` with a descriptive semantic name (e.g. `--color-warning` rather than `--color-yellow`).
2. Provide dark mode override if its contrast shifts in dark environments.
3. Update README (this section) and optionally a design tokens markdown if you expand further.
4. Search codebase to ensure no existing token already covers the intent.

### Do / Don't

| Do | Don't |
|----|-------|
| Use `--color-focus-ring` on custom focus styles | Hard-code `outline: 2px solid #DE0000` |
| Wrap asynchronous page regions with shared skeletons | Duplicate custom skeleton markup |
| Convert remaining legacy hex/old variable names to tokens | Introduce new raw color literals |
| Use brand color sparingly for emphasis | Paint large passive surfaces solid brand red |

---

## Unified Skeleton Loading System

Implemented in `src/components/ui/Skeleton.jsx` (plus its CSS). Replaces ad‑hoc markup across listings, dashboard, messaging.

### Variants

| Variant | Prop / Class | Purpose |
|---------|--------------|---------|
| Text | `variant="text"` | Multi-line paragraph or label lines |
| Rect | `variant="rect"` | Generic box (buttons, chips, headers) |
| Circle / Avatar | `variant="circle"` / `<SkeletonAvatar />` | Avatars, icons |
| Inline | `display: inline-block` with width | Short label placeholders |

### Basic Usage

```jsx
import { Skeleton, SkeletonAvatar } from './components/ui/Skeleton';

function ListingRowSkeleton() {
  return (
    <div className="listing-row-skel">
      <SkeletonAvatar size={56} />
      <div style={{ flex:1 }}>
        <Skeleton variant="rect" height={14} width="60%" />
        <Skeleton variant="text" lines={2} style={{ marginTop:8 }} />
      </div>
      <Skeleton variant="rect" height={28} width={80} />
    </div>
  );
}
```

### Accessibility

Skeletons are purely decorative:

- Each skeleton element receives `aria-hidden="true"`.
- Parent containers use `aria-busy="true"` while real content is loading.
- When data resolves, remove `aria-busy` and **do not** announce skeleton removal (avoids noise).

### Reduced Motion Support

Shimmer animation automatically disables when the user sets `prefers-reduced-motion: reduce`:

```css
@media (prefers-reduced-motion: reduce) {
  .skel.shimmer { animation: none; background: var(--color-skeleton-base); }
}
```

No extra code changes needed—just ensure the skeleton root retains the `shimmer` class only when motion is allowed.

### Performance Tips

1. Render only the number of skeleton items that approximate final layout (e.g. 8 cards in a grid viewport), not arbitrarily high numbers.
2. Remove skeleton components synchronously when data arrives to prevent layout thrash.
3. For infinite scroll: append real items beneath existing skeleton placeholders, then remove the placeholders in the same commit.

---

## Motion & Focus Accessibility

| Concern | Implementation |
|---------|----------------|
| Reduced Motion | Shimmer disabled; transitions kept under 150ms and opacity/transform only. |
| Focus Visibility | All interactive custom components rely on `:focus-visible` + `--color-focus-ring`. Native focus not suppressed unless replaced with an accessible alternative. |
| Live Regions | Chat message list uses `role="log"` + `aria-live="polite"` for new messages without re‑announcing the entire list. |
| Offline State | Banner (`role="status"`) announces connectivity loss/restoration. |
| Color Contrast | Brand red & surface pairs tested to meet WCAG AA for text/icons used on them. Avoid placing small light gray text on brand backgrounds. |

### Testing Checklist

1. Keyboard only: You can reach every actionable element; focus ring clearly visible.
2. Screen reader (NVDA / VoiceOver) reads new chat messages once; skeletons ignored.
3. Browser zoom at 200%: Layout remains functional (no truncated essential text, off‑screen critical actions still reachable).
4. Dark mode: Ensure brand variants remain distinguishable from danger states.

---

## Responsive Breakpoints (Quick Reference)

Current principal breakpoints (match JS conditions):

| Max Width | Purpose |
|-----------|---------|
| 1180px | Shrink 3‑column listing detail grid to 2‑column |
| 1100px | Consolidate layout before tablet split |
| 900px  | Narrow messaging sidebar width |
| 820px  | Collapse listing detail into single column |
| 720px  | Switch messaging to mobile stacked layout & off‑canvas convo list |
| 600px  | Tighten typography & reduce title scaling |
| 560px  | Activate mobile sticky CTA bar on listing detail |

When adding new responsive rules, prefer existing breakpoints unless there is a strong layout reason to introduce a new one.

---

## Migration Guide (Legacy → New System)

| Legacy Pattern | Replace With |
|----------------|--------------|
| `--rouge-faso`, raw `#DE0000` | `--color-brand` |
| Ad‑hoc `#0a7d00` success badge | Dedicated future success token (TBD) or neutral until added |
| Custom per-component skeleton divs | `<Skeleton />` primitives |
| Manual focus outlines different per component | `:focus-visible { outline:2px solid var(--color-focus-ring); }` |
| Hard-coded dark backgrounds (#0f0f11, #18181a) | `--color-bg-surface` / `--color-bg-alt` + dark mode override |

Search Tip: run a project search for `#DE0000|#0f0f11|#18181a|skeleton` (regex) to verify no regressions when auditing future PRs.

---

## Contributing UI Changes

1. Prefer composition: build small presentational components (stateless) + container logic hooks.
2. Keep data fetching in hooks/contexts; components should receive ready data + loading/error flags.
3. Extend tokens first before inventing local overrides.
4. For any new pattern (badge, chip, alert) add a short usage note in this README or a `/docs/` markdown file so future refactors are guided.

---

## Visual Regression Tests (Hero & Footer)

Playwright snapshot tests live in `tests/ui/hero-footer.spec.js`.

Run tests:

```bash
npm run test:ui
```

Update snapshots after intentional design changes:

```bash
npm run test:ui:update
```

Snapshots are stored per browser project. Keep dynamic content stable (disable random featured cards, etc.) so diffs are meaningful.

## Dynamic Category Translations

`CategoryTranslationProvider` fetches categories once and injects them into the `categories` namespace using the slug as the key. Components call `t('categories:slug')`; if missing, the original backend name is used. Server‑side localization can later override by delivering localized names in the same fetch.

Helper APIs:

- `injectCategoryTranslations(lng, map)` merges translations.
- `ensureCategoriesNamespace(lng)` ensures the namespace exists before injection.

## Social Icon Components

SVG icons (`FacebookIcon`, `TwitterIcon`, `InstagramIcon`) are in `src/components/icons/SocialIcons.jsx`. They use `currentColor` for theming and include `<title>` for accessibility. Replace placeholder `href="#"` with real social URLs when available.

## Preloaded i18n Namespaces

Core namespaces (`common`, `navigation`, `home`, `listing`) are preloaded during initialization for faster localized first paint. Add any new above‑the‑fold namespace to `CORE_NAMESPACES` in `src/i18n.js` if needed.

---

## Progressive Web App (PWA)

The application is PWA-enabled to better serve mobile users (primary audience): installable, offline-capable, and resilient on flaky connections.

Key elements:

- Manifest & Service Worker via `vite-plugin-pwa` (see `vite.config.js`).
- Auto-update strategy (`registerType: 'autoUpdate'`).
- Brand theming: `theme_color` set to heritage red `#DE0000`; logo (`logo.svg`) reused for icons (add PNGs for best Lighthouse score later).
- Offline fallback: `public/offline.html` served when navigation requests fail while offline.
- Runtime caching strategies:
  - Images: Cache First (30 days / 60 entries) for quick gallery revisits.
  - API requests (pattern includes `api`): Network First with 8s timeout then cache fallback.
  - Pages / navigations: Network First with cached fallback for repeat visits.

Developer workflow:

1. `npm run dev` – PWA enabled in dev (`devOptions.enabled`) so you can test without a full build.
2. `npm run build && npm run preview` – open Application tab in DevTools, verify service worker + manifest.
3. Trigger an update: modify any source file, rebuild; SW updates in background automatically.

Extending / Hardening:

- Provide maskable & transparent PNG icons (192x192, 512x512) under `public/icons/` and adjust the manifest icons array.
- Add a custom update toast by handling `onNeedRefresh` in `main.jsx` (currently a no-op comment placeholder).
- Pre-cache critical route shells by adding them to `workbox.globPatterns` or `additionalManifestEntries`.
- Add background sync / IndexedDB layer for queued message sends offline (future enhancement).

Testing tips:

- Simulate offline in DevTools > Network; navigate to a new route: offline page should appear.
- Clear site data, reload, ensure manifest not blocked by CSP (none set currently).
- Run Lighthouse (Progressive Web App category) to confirm installability; add PNG icons if it flags maskable icon absence.

Security considerations:

- Avoid caching authenticated API responses with sensitive data in long-lived caches; current `api-cache` uses Network First and a modest expiration (1 day) but you can tighten further or add cache key filtering.

Next optional steps:

- Add a `pwa/UpdatePrompt.jsx` component to surface refresh when a new SW is waiting.
- Implement background sync for message drafts and listing draft autosave.
- Add push notifications (requires server-side Web Push endpoints & user permission UX).

### Generating Proper PNG / Maskable Icons

Current repository references placeholder PNG filenames under `public/icons/`. Generate production-ready assets from `logo.svg`:

Install tool (once):
```bash
npm install -D pwa-asset-generator
```

Generate (example):
```bash
npx pwa-asset-generator src/assets/logo.svg public/icons \
  --favicon --maskable true --opaque false --padding "10%" \
  --background "#DE0000" --manifest public/manifest.webmanifest
```

Verify the manifest icons array matches the generated file names (update if different). Commit the produced PNGs.

### Custom Install Prompt UI

`InstallPWA` component + `usePWAInstallPrompt` hook show a floating CTA when the browser fires `beforeinstallprompt`. Dismissal hides it for the session.

User flow:
1. Browser determines the app is installable (served over HTTPS, manifest + SW present, visited at least once).
2. `beforeinstallprompt` captured; button appears.
3. User clicks Install → native prompt appears → outcome resolved.
4. On success `appinstalled` triggers and component unmounts.

You can style or relocate `InstallPWA` (e.g. integrate into a banner or settings page) without changing the hook logic.

---

