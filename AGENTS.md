# AGENTS.md — Claude Working Rules
# Property Investment Manager (N3 Property Partner)

> This file is read automatically by Claude Code on every session.
> It defines HOW Claude works, not WHAT to build.
> For business requirements, refer to docs/ in priority order.
> If this file conflicts with any doc in docs/, stop and ask. Do not resolve silently.

---

## Project Identity

| Item | Value |
|---|---|
| App name | Property Investment Manager (N3 Property Partner) |
| Repo | https://github.com/leongkokyew/property-investmentapp |
| Stack | TanStack Start + Supabase + QNE N3 Open API |
| Runtime | Bun |
| Auth | N3 JWT only — no Supabase Auth |
| Multi-tenant | `tenant_code` from JWT (NOT `user_id`) |
| Deployed at | https://property-investmentapp.lovable.app |

---

## Document Priority Order (WHAT to build)

When documents conflict, stop and ask. Never guess.

```
1. docs/BUSINESS_RULE.md
2. docs/DATABASE.md
3. docs/SYSTEM_ARCHITECTURE.md
4. docs/API.md
5. docs/DECISIONS.md
6. README.md  ← does not exist yet; create when project is ready for public/team documentation
7. docs/TODO.md
8. docs/CHANGELOG.md

Note: docs/PRD.md and docs/UI_RULE.md do not exist yet.
Create them only when needed. Do not reference them until they exist.
```

---

## Current Build Status

```
✅ Prompt 1 — Property List + Property Detail + 4-status tenancy (mock data)
✅ Prompt 2 — N3 Auth (Path A/B) + Session Header + tenant_code scoping
⏳ Prompt 3 — Path A ?token= fix + Supabase real data layer (NEXT)
🔮 Prompt 4+ — Billing Run, Arrears, RPGT, Compliance connected to real data
```

### Open Blockers Before Prompt 3
- 🔴 Path A (`?token=JWT`) not reading from URL — `session.tsx` only reads localStorage
- 🟡 Supabase not yet connected — all screens use mock data
- 🟡 ARDN OData `project.code` filter untested

---

## Critical File Protection

**Never modify these files without explicit instruction:**
```
src/lib/auth/session.tsx
src/routes/api/n3.connect.ts
src/components/auth-gate.tsx
src/routes/api/n3.basic-info.ts
docs/DATABASE.md
docs/BUSINESS_RULE.md
AGENTS.md
```

---

## Before Any Task

1. Read this file completely
2. Read `docs/DATABASE.md`
3. Identify which Prompt phase the task belongs to
4. State which files will be changed and why
5. Wait for confirmation before making changes to protected files

---

## Accuracy Rules

- Accuracy is always more important than speed
- If confidence is below 95%: stop, explain uncertainty, ask
- Never invent: business rules, DB structures, API behaviour, field names
- Always distinguish between: **Fact** / **Assumption** / **Suggestion**
- N3 field names must be verified against Swagger before use
  → Swagger: `https://openapi.account.qne.cloud/doc/index.html`
  → Spec files: `platform-v1.json`, `sales-v1.json`

---

## N3 API Rules

```
Browser NEVER calls N3 directly (no CORS)
All N3 calls: frontend → server route → N3

Proxy routes already built:
  /api/n3/connect      → N3 auth (Path B, dev only — access via ?dev=true in URL)
  /api/n3/basic-info   → GET /api/companyprofile/BasicInfo
  /api/n3/invoices     → GET /api/SalesInvoices/List
  /api/n3/receipts     → GET /api/ARReceipts/List
  /api/n3/debits       → GET /api/ARDNs/List
  /api/n3/credits      → GET /api/ARCNs/List
```

**Critical N3 API rules:**
- `code === "0000"` = success. HTTP 200 does NOT mean business success
- Paginated responses: rows in `data.value`, total in `data.count`
- Reading uses `projectCode` (string), writing uses `projectId` (number)
- Token is in `data.token` (not top-level `token`)
- Always call `GET /api/<Entity>/New` before `POST /api/<Entity>/Create`

**N3 endpoints that do NOT exist (do not try):**
```
GET /api/Project        → 404
GET /api/Projects       → 405 (DELETE only)
POST /api/SalesInvoices → 405 (use /api/SalesInvoices/Create)
```

---

## Database Rules

- Never DROP tables, rename columns, or DELETE data without explicit approval
- All schema changes must be documented in `docs/DATABASE.md`
- `tenant_code TEXT` is the multi-tenant isolation key (not `user_id`)
- `n3_project_code` is the permanent bridge between Supabase and N3 — never change once set
- Unique constraint: `UNIQUE(tenant_code, n3_project_code)` — not global unique

---

## Lovable / Claude Code Prompt Rules

- Always explain what will change, why, which files, risks, alternatives
- For Lovable: write diagnostic-only prompt first, then fix prompt
- One feature or one fix per prompt — never mix unrelated changes
- Every prompt must include a verification checklist
- Screenshot to confirm full prompt in input box before sending
- Never let Lovable fabricate field names or data structures

---

## Communication Style

**Before implementation, always state:**
- What will be changed
- Why
- Which files are affected
- Risks
- Alternatives considered

**After implementation, always provide:**
- Summary of changes
- Files modified
- Testing checklist
- Remaining tasks

---

## Architecture Constraints

```
Supabase (local layer)        N3 (accounting layer)
─────────────────────         ──────────────────────
Property          ══════════► Project (Child) [bridge via n3_project_code]
Tenancy                       Customer [N3 customer = tenant for invoicing only]
Deposit                       Invoice
Maintenance                   Receipt
Insurance                     Credit Note / Debit Note
RPGT                          e-Invoice
Documents

Note: ←→ does NOT mean same data. Supabase Tenancy ≠ N3 Customer.
N3 Customer is referenced for invoice creation only.
```

- N3 has the data → read from N3, do not duplicate in Supabase
- Supabase has the data → N3 has no concept of it
- Bridge: `properties.n3_project_code` = N3 `Invoice.projectCode`

---

## Git Rules

- One feature per commit (for manual/Claude Code changes)
- Commit format: `feat:` / `fix:` / `refactor:` / `docs:`
- Do not mix unrelated changes in one commit
- Note: Lovable auto-commits are not controllable — this rule applies to Claude Code only

---

## Decision Log

All architectural decisions are recorded in `docs/DECISIONS.md`.
Before making a new architectural decision, check if it was already decided.
