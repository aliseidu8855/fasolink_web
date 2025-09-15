# Dashboard Future Enhancements

This document lists recommended next improvements now that the core dashboard MVP is complete.

## 1. Listings Management

- Bulk actions (select + archive / feature / delete)
- Status field (draft, published, archived) & filters
- Image management inside edit modal (upload + reorder + delete)
- Category & location pickers with typeahead
- Price guidance helper (suggested range based on category averages)

## 2. Analytics & Insights

- Real view tracking model (ListingView with listing, user/IP hash, timestamp)
- Daily/weekly chart of views per listing
- CTR (views -> conversations started) metric
- Heatmap of active hours (aggregate message timestamps)
- Export CSV of performance metrics

## 3. Messaging Integration

- Inline recent messages widget on overview
- Unread message badge on sidebar items
- Real-time updates via WebSocket / Django Channels
- Quick reply drawer without leaving dashboard

## 4. Performance & UX

- Virtualized list for large listing counts
- Prefetch listing detail when hovering edit
- Optimistic UI for edit/delete
- Toast notifications (success, error, undo) instead of inline text
- Persistent collapsed sidebar preference (localStorage)

## 5. Profile & Account

- Avatar upload + cropping
- Phone number & WhatsApp contact fields
- Two-factor authentication setup
- Language & timezone preferences (persisted)

## 6. Access Control & Roles

- Support for staff / moderator dashboards
- Review queue (pending listings or reported content)
- Role-based menu items

## 7. Monetization (if desired)

- Promote / feature listing credits
- Billing history & invoices
- Subscription tiers (free vs. pro seller features)

## 8. Internationalization

- Extract all hardcoded French strings to i18n resources
- Add fallback & missing key detection in dev mode

## 9. Reliability & Observability

- Server-side pagination for user listings endpoint (currently all fetched)
- Rate limiting for create/edit endpoints
- Structured logging of dashboard API calls
- Error boundary component wrapping panels

## 10. Security Hardening

- CSRF protection review if session auth added later
- Audit password update flow (separate endpoint requiring current password)
- Brute force protection on login (throttling)

## 11. Testing

- Jest/RTL tests for modal open/save flows
- Cypress e2e smoke: login -> create listing -> edit -> stats refresh
- Backend DRF tests for profile patch and dashboard stats

## 12. Tech Debt Cleanup

- Replace placeholder 'active' definition with real status field
- Consolidate inline styles into tokens/utility classes
- Extract form inputs to shared `<Field>` component with validation messages

---
Generated on: 2025-09-15
