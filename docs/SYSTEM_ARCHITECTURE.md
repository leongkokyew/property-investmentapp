# SYSTEM_ARCHITECTURE.md
# Property Investment Manager — System Architecture

---

## Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React + Vite + TypeScript | Via TanStack Start |
| Router | TanStack Router | File-based routing |
| Runtime | Bun | `bunfig.toml` present |
| Database | Supabase (PostgreSQL) | service role key, no anon |
| External API | QNE N3 Open API | Server-side proxy only |
| UI Library | Tailwind + shadcn/ui | |
| Deployment | Lovable (preview) / Vercel (prod) | |

---

## Hybrid Architecture

```
┌─────────────────────────────────────────────────────┐
│                   BROWSER (React)                   │
│         Never calls N3 or Supabase directly         │
└──────────────────────┬──────────────────────────────┘
                       │ calls /api/n3/* or /api/supabase/*
┌──────────────────────▼──────────────────────────────┐
│              SERVER ROUTES (TanStack Start)          │
│   N3 base URL in server env only                    │
│   Supabase service role key in server env only      │
└──────┬───────────────────────────────┬──────────────┘
       │ Bearer token forwarded        │ tenant_code scoped
┌──────▼──────────┐          ┌─────────▼───────────────┐
│  QNE N3 Open    │          │  Supabase (PostgreSQL)  │
│  API            │          │                         │
│  Main host:     │          │  Local data layer:      │
│  openapi.       │          │  Property, Tenancy,     │
│  account.       │          │  Deposit, Insurance,    │
│  qne.cloud      │          │  RPGT, Documents        │
└─────────────────┘          └─────────────────────────┘
```

---

## Data Ownership

| Data | Owner | Reason |
|---|---|---|
| Customer (tenant) | N3 | N3 is system of record for AR |
| Invoice | N3 | N3 generates and validates |
| Receipt | N3 | N3 manages payments |
| Credit Note / Debit Note | N3 | N3 AR module |
| e-Invoice | N3 | MyInvois via N3 |
| General Ledger | N3 | N3 accounting |
| Property | Supabase | N3 has no property concept |
| Tenancy | Supabase | N3 has no lease concept |
| Deposit | Supabase | N3 has no deposit tracking |
| Maintenance | Supabase | N3 has no maintenance concept |
| Insurance | Supabase | N3 has no insurance concept |
| RPGT cost ledger | Supabase | N3 has no tax planning concept |
| Documents | Supabase | Supabase Storage |

---

## The Bridge

```
Supabase                         N3
────────────────────             ────────────────────────
properties                       Project (Child)
  n3_project_code     ═══════►   projectCode (string, read)
                                 projectId   (integer, write)
        │
        ▼ (matched by project_code)
  n3_invoice_cache    ◄───────── SalesInvoices/List
  n3_receipt_cache    ◄───────── ARReceipts/List
  n3_credit_note_cache ◄──────── ARCNs/List
  n3_debit_note_cache  ◄──────── ARDNs/List
```

**Bridge rules:**
- `n3_project_code` is permanent — set once, never change
- Uniqueness constraint: `UNIQUE(tenant_code, n3_project_code)` (not global)
- N3 Project structure: Parent (Portfolio) → Child (each property)
- Invoices can only be assigned to Child Projects (not Parent)

---

## Authentication Architecture

```
Production (Path A):
  N3 My Apps → Open → URL ?token=<JWT>
  → SessionProvider reads URL param
  → Stores in localStorage["qne_access_token"]
  → Fetches company info from /api/n3/basic-info
  → Shows SessionHeader: company · tenantCode · email

Development (Path B):
  URL ?dev=true → shows hidden dev login
  → User enters N3 API key
  → POST /api/n3/connect (server-side proxy)
  → N3 returns JWT in data.token
  → Same flow as Path A from storage onwards

Production build: Path B route returns 404
```

---

## Server Routes (Built)

```
src/routes/api/
├── n3.connect.ts       POST  /api/n3/connect        Path B auth (dev only)
├── n3.basic-info.ts    GET   /api/n3/basic-info      CompanyProfile/BasicInfo proxy
├── n3.invoices.ts      GET   /api/n3/invoices        SalesInvoices/List proxy
├── n3.receipts.ts      GET   /api/n3/receipts        ARReceipts/List proxy
├── n3.debits.ts        GET   /api/n3/debits          ARDNs/List proxy
└── n3.credits.ts       GET   /api/n3/credits         ARCNs/List proxy
```

All proxy routes:
- Read `Authorization` header from request
- Forward `$filter`, `$top`, `$skip`, `$orderby` OData params
- Return N3 response as-is on 2xx; return 502 on non-2xx

---

## Key Components

```
src/
├── components/
│   ├── auth-gate.tsx        AuthGate + NoSessionScreen (Path A/B)
│   ├── session-header.tsx   Fixed header: company · tenant · email · signout
│   ├── property-form.tsx    Add/edit property modal
│   ├── tenancy-form.tsx     Add/edit tenancy modal
│   └── status-badge.tsx     4-status badge component
├── lib/
│   ├── auth/
│   │   └── session.tsx      SessionProvider, decodeJwtClaims, normalizeBasicInfo
│   └── data/
│       ├── store.tsx         Mock data layer (to be replaced by Supabase in Prompt 3)
│       └── types.ts          TypeScript types for all entities
└── routes/
    ├── index.tsx             Property List page
    └── properties.$id.tsx    Property Detail page
```

---

## Multi-Tenancy

```
JWT payload contains:
  tenantCode: "255-38A-051"
  email: ["LEONGKOKYEW@QNE.COM.MY"]
  tenantId: "048ea430-a255-438a-9051-04cf9ced5887"

Isolation in Supabase:
  Every table has: tenant_code TEXT NOT NULL
  Every query adds: WHERE tenant_code = '<decoded from JWT>'
  No Supabase Auth (auth.users) — not used
  Supabase anon access: disabled
  Only service role key used (server-side only)
```

---

## Current Phase Status

| Phase | Status | Description |
|---|---|---|
| Prompt 1 | ✅ Done | Property List + Detail + 4-status tenancy (mock data) |
| Prompt 2 | ✅ Done | N3 Auth + Session Header + tenant_code + 4 proxy routes (2026-07-20 to 2026-07-22) |
| Prompt 3 | ⏳ Next | Path A fix + Supabase real data connection |
| Prompt 4+ | 🔮 Future | Billing, Arrears, RPGT, Compliance with real data |
