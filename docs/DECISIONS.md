# DECISIONS.md
# Property Investment Manager — Architecture Decision Log

> Every important decision is recorded here.
> Before making a new architectural decision, check if it was already decided.
> Format: Date / Decision / Reason / Alternatives / Status

---

## DEC-001 — Auth: N3 JWT only, no Supabase Auth

**Date:** 2026-07-19
**Status:** ✅ Final

**Decision:** Identity comes from N3 JWT only. No Supabase Auth, no parallel user table.

**Reason:** N3 official Development Brief states:
> "User authentication and identity come from N3 only... not by inventing a parallel user table."

**Alternatives considered:**
- Supabase Auth (auth.users + user_id) — rejected, violates N3 official requirement
- Hybrid (N3 + Supabase Auth) — rejected, unnecessary complexity

**Impact:** All Schema tables use `tenant_code TEXT` instead of `user_id UUID REFERENCES auth.users(id)`

---

## DEC-002 — Bridge: n3_project_code (not customerCode)

**Date:** 2026-07-19
**Status:** ✅ Final

**Decision:** The bridge between Supabase and N3 is `properties.n3_project_code` ↔ N3 `Invoice.projectCode`

**Reason:** Each property = one N3 Child Project. Invoices carry `projectCode`, enabling per-property P&L directly. Using `customerCode` required indirect inference and was less accurate.

**Alternatives considered:**
- `customerCode` as bridge — rejected, one customer can have multiple properties, ambiguous
- No bridge (manual reconciliation) — rejected, defeats purpose of integration

**Impact:** `n3_project_code` is permanent — once set for a property, never change it.

---

## DEC-003 — Unique constraint: UNIQUE(tenant_code, n3_project_code)

**Date:** 2026-07-19
**Status:** ✅ Final

**Decision:** `n3_project_code` uniqueness is scoped per tenant, not global.

**Reason:** Multiple customers (tenants) using this product could have the same Project name in their own N3 accounts (e.g., both use "MONT KIARA"). Global UNIQUE would cause false conflicts.

**Alternatives considered:**
- Global UNIQUE — rejected, breaks multi-tenant SaaS

---

## DEC-004 — Project endpoint: use Invoice.projectCode instead of GET /api/Projects

**Date:** 2026-07-19
**Status:** ✅ Final

**Decision:** Do not call Project endpoints directly. Read project info from Invoice's embedded `projectCode`/`project` object.

**Reason:** All Project GET endpoints return 404 or 405.
- `GET /api/Project` → 404
- `GET /api/Projects` → 405 (allow: DELETE only)
- `GET /api/ProjectLookup` → 404

**Alternatives considered:**
- Wait for N3 to expose Project GET endpoint — rejected, unknown timeline
- Store project list locally — rejected, creates sync problem

---

## DEC-005 — Write invoices using projectId (integer), not projectCode (string)

**Date:** 2026-07-21
**Status:** ✅ Final

**Decision:** When creating invoices via POST, use `projectId` (integer field), not `projectCode` (string field).

**Reason:** Passing `projectCode` string in POST payload is silently ignored. N3 only accepts `projectId` (integer) for writes. Confirmed by testing: INV2607/031 succeeded only after switching to `projectId: 65401`.

**Rule:** Always GET `/{id}` or `/New` to retrieve the integer ID before POSTing.

---

## DEC-006 — Token location: data.token (not top-level token)

**Date:** 2026-07-22
**Status:** ✅ Final

**Decision:** N3 JWT token is at `data.token`, not top-level `token` or `access_token`.

**Reason:** Confirmed in official `sales-v1.json` Swagger description:
> "read the JWT from `data.token` when `code` is `0000`"

Also confirmed by successful Path B login test.

**Impact:** `n3.connect.ts` extracts token from `data.token` first, then falls back to other paths.

---

## DEC-007 — tenantCode and email from JWT payload, not BasicInfo

**Date:** 2026-07-22
**Status:** ✅ Final

**Decision:** Decode `tenantCode` and `email` from JWT payload directly. Do not rely on `/api/companyprofile/BasicInfo` for these values.

**Reason:** BasicInfo DTO does not contain `tenantCode` or `email` fields. They are only available in the JWT payload claims.

**JWT payload fields:**
```json
{
  "tenantCode": "255-38A-051",
  "email": ["LEONGKOKYEW@QNE.COM.MY"],
  "tenantId": "048ea430-...",
  "dname": "Leong",
  "roles": "sys-admin"
}
```

**Decode method:**
```typescript
const payload = JSON.parse(atob(token.split(".")[1]));
const tenantCode = payload.tenantCode ?? payload.tenant_code ?? "—";
const email = Array.isArray(payload.email) ? payload.email[0] : payload.email;
```

---

## DEC-008 — IS_DEV: dual condition (import.meta.env.DEV OR ?dev=true)

**Date:** 2026-07-22
**Status:** ✅ Final

**Decision:** Path B (dev login) is visible when `import.meta.env.DEV === true` OR URL contains `?dev=true`.

**Reason:** Lovable Preview serves a production build. `import.meta.env.DEV` is always `false` in Preview, causing the entire Path B UI block to be compiled out. Adding `?dev=true` URL param as a fallback allows testing in Preview without exposing it to production users (who arrive via `?token=` from N3).

**Code:**
```typescript
const IS_DEV =
  import.meta.env.DEV ||
  (typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("dev"));
```

---

## DEC-009 — 4 N3 proxy routes built in server layer

**Date:** 2026-07-22
**Status:** ✅ Final

**Decision:** Build 4 dedicated server-side proxy routes for N3 data endpoints.

**Routes:**
- `/api/n3/invoices` → `SalesInvoices/List`
- `/api/n3/receipts` → `ARReceipts/List`
- `/api/n3/debits` → `ARDNs/List`
- `/api/n3/credits` → `ARCNs/List`

**Reason:** Browser cannot call N3 directly (no CORS). All data must flow through server routes. Consistent with official N3 architecture requirement.

---

## DEC-010 — 502 on non-2xx upstream (not 5xx from own route)

**Date:** 2026-07-20
**Status:** ✅ Final

**Decision:** When N3 returns non-2xx, proxy routes return HTTP 502 with N3 body. Own route errors return HTTP 400 with JSON body. Never return 5xx from own route handlers.

**Reason:** Lovable preview proxy replaces 5xx responses with HTML error pages, breaking `response.json()` on the client. Using 4xx/502 with JSON body ensures the browser always receives parseable JSON.

---

## DEC-011 — Property disposals stored as snapshots

**Date:** 2026-07-18
**Status:** ✅ Final

**Decision:** Property disposals are stored as point-in-time snapshots in `property_disposals` table, not recalculated from live data.

**Reason:** RPGT calculation uses data "at that moment". If `cost_ledger` receives new entries later, recalculating would change the previously reported tax figure — inconsistent with LHDN filing.

---

## DEC-012 — ARDN project filter: risk flagged, fallback planned

**Date:** 2026-07-23
**Status:** ⚠️ Pending test

**Decision:** For ARDN (Debit Notes), `ARDNListDto` does not include `project` field. OData filter `$filter=project.code eq 'X'` on List endpoint is untested.

**Fallback:** If project filter fails, fetch by `customer.code` and filter in cache by `projectCode`.

**Action required:** Test `GET /api/ARDNs/List?$filter=project.code eq 'X'&$top=1` before implementing Prompt 4.
