# Post Ad — Option A (Single page + sheet pickers)

This document describes the integration for the single-page Create Listing flow using bottom sheets for complex pickers.

## Data sources

- Categories: `GET /api/categories/` (flat list). Name is used to fetch specs metadata.
- Specs metadata: `GET /api/specs-metadata/?category=<name>` returns `{ category, specs }`.
- Locations: Use curated `BF_LOCATIONS` (regions + towns) for the sheet, or backend `locations-suggest` for search.

## Sheet mapping

- Category sheet: shows `categories.name`; select one; upon change, call `fetchSpecsMetadata(name)` and render returned fields.
- Location sheet: two-step (region → town) or search; sets a single `location` string for the listing (town preferred over region).

## Specs rendering

- Each spec item has `{ name, key, required, type, options? }`.
- Supported `type`: `text | number | select | boolean`.
- Optional conditional visibility (see `docs/specs-metadata.json`), e.g. hide bedrooms for `property_type=Land`.

## Filters/facets alignment

- Where reasonable, spec keys align with listing filters for consistency:
  - `condition`, `color` may be added to filters later.
  - Existing filters remain: `min_price`, `max_price`, `negotiable`, `is_featured`, `min_rating`, `town` (location).

## i18n keys

- UI strings live in `src/locales/*`. Prefer using translation keys derived from spec keys when needed:
  - Label fallback: use `spec.name` directly from metadata; for translation, map keys like `spec.condition`, `spec.color`, etc.

## UX guardrails

- Autosave: Persist to `localStorage` on debounce. Restore on mount.
- Inline validation: required core fields and required `specs` gating.
- Sticky publish bar: disable until valid; display character and image counts.
- Offline: If PWA is installed, form continues to accept inputs and persist locally; submission retries when online.

## Backend mapping

- Submitted `FormData` keys: `title`, `price`, `description`, `location`, `category` (id), `negotiable`, `contact_phone`, `attributes` (JSON array of `{name, value}`), then images appended one-by-one via `appendListingImage`.

## Telemetry (optional)

- Measure draft creation rate (first field focus → draft persisted) and time-to-publish (first focus to 201 response).
- Log sheet open/close events to ensure friction is low on mobile.
