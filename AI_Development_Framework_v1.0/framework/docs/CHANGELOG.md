# CHANGELOG.md
# Property Investment Manager

---

## [Unreleased] — Prompt 3 (Next)

### Planned
- Fix Path A: read `?token=` from URL in SessionProvider on init
- Connect Supabase real data layer (replace mock store)
- Scope all Supabase queries by `tenant_code`

---

## [0.2.0] — 2026-07-20 to 2026-07-22 — Prompt 2: Auth Layer

### Added
- `AuthGate` component — shows "Open from N3 → My Apps" by default
- `SessionProvider` — reads JWT from localStorage, decodes JWT claims
- `SessionHeader` — displays company · tenantCode · email on every page
- Path B dev login — hidden behind `?dev=true` URL param
- `/api/n3/connect` — server-side proxy for Path B API key exchange
- `/api/n3/basic-info` — proxy for CompanyProfile/BasicInfo
- `/api/n3/invoices` — proxy for SalesInvoices/List
- `/api/n3/receipts` — proxy for ARReceipts/List
- `/api/n3/debits` — proxy for ARDNs/List
- `/api/n3/credits` — proxy for ARCNs/List
- `tenant_code` scoping in mock data layer (replaces `user_id`)

### Fixed
- Bug #1: 502 crash on `/api/n3/connect` — changed 5xx to 4xx JSON response
- Bug #2: IS_DEV compiled out in Lovable Preview — added `?dev=true` fallback
- Bug #3: Token extraction field mismatch — expanded to check `data.token` and nested paths
- Bug #4: Session header showing "—" for tenantCode/email — decode from JWT payload instead of BasicInfo

### Verified
- Path B login end-to-end ✅
- Session header displays: `Trading Sample (Quinny Testing) · 255-38A-051 · LEONGKOKYEW@QNE.COM.MY` ✅

---

## [0.1.0] — 2026-07-19 — Prompt 1: Property List + Detail

### Added
- Property List page (`/`) — table with Name, Area, Type, Status, Purchase Price
- Property Detail page (`/properties/:id`) — edit form + tenancy list
- 4-status tenancy badges: Tenancy / Invoice / Payment / e-Invoice
- Add Property modal
- Add Tenancy modal with 4 independent status dropdowns
- Mock data layer (`src/lib/data/store.tsx`) with 4 seed properties
- TypeScript types for all entities (`src/lib/data/types.ts`)
- Status badge component
