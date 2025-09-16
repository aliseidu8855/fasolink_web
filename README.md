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
* Newer messages appended at bottom to preserve natural chat reading order.
* Older messages loaded manually (button) with scroll offset compensation to avoid visual jump.

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
