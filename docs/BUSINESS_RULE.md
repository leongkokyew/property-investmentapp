bash

cat /mnt/user-data/outputs/framework/docs/BUSINESS_RULE.md
Output

# BUSINESS_RULE.md
# Property Investment Manager — Business Rules

> Priority: #1 (highest)
> Never modify business rules without approval.
> If a better approach exists: explain first, wait for approval, then implement.

---

## Product Positioning

- **Product name:** Property Investment Manager
- **Target user:** Property investment business owners (not tenants, not accountants)
- **This product IS:** A management tool that works alongside QNE N3
- **This product IS NOT:** Property Management System / Building Management System / ERP
- **Relationship with N3:** Complementary — never replaces N3

---

## Core Architecture Rule

```
N3 manages money (accounting layer):
  Customer, Invoice, Receipt, Credit Note, Debit Note, e-Invoice, GL

Supabase manages property (local layer):
  Property, Tenancy, Deposit, Maintenance, Insurance, RPGT, Documents
```

**Bridge rule:** Every property in Supabase must have a corresponding
Child Project in N3. The link is `properties.n3_project_code`.
Once set, this value must never change.

---

## Authentication Rules

1. Identity comes from N3 JWT only — no parallel user table
2. `tenant_code` from JWT is the only multi-tenant isolation key
3. Path A (production): user opens from N3 My Apps → URL carries `?token=JWT`
4. Path B (development only): API key login, hidden behind `?dev=true`
5. Session header must always show: company name / tenant code / email
6. Session header values must be re-fetched on every page load — never cached

---

## Financial Calculation Rules

### Outstanding
```
Outstanding = SUM(Invoice amount)
            + SUM(Debit Note amount)
            − SUM(Receipt amount)
            − SUM(Credit Note amount)
Grouped by: n3_project_code (= one property)
```
Note: N3 Invoice already contains `outstandingAmount` — read directly.

### Dashboard KPIs
| KPI | Formula | Source |
|---|---|---|
| Occupancy Rate | `active tenancies / total properties × 100` | Local |
| Cash Collected | `SUM(receipt amounts)` | N3 |
| Outstanding | Formula above | N3 |
| Collection Rate | `Cash Collected / (Cash Collected + Outstanding) × 100` | Derived |

**Dashboard must NOT show:** Trial Balance, General Ledger, or accounting reports.
**Dashboard must show:** Cash flow per property, unpaid rent, upcoming lease expiry, insurance renewal.

---

## Tenancy Rules

1. One property can only have ONE active tenancy at a time
2. Tenancy status has FOUR independent fields — never merge into one:
   - `tenancy_status`: active / expired / terminated
   - `invoice_status`: issued / not_issued
   - `payment_status`: paid / partial / unpaid
   - `einvoice_status`: valid / pending / selfbill / na
3. Security deposit is a LIABILITY, not income — store separately, never mix with rent

### Deposit Types (4 types, stored independently)
- Rental Deposit
- Utility Deposit
- Furniture Deposit
- Other Deposits

---

## Commission Rules

1. Commission rate is CONFIGURABLE — never hardcode
2. Default rates (BOVAEA standards, upper limits):
   - Sale: 3% of transaction value
   - Letting: 1 month rental
3. All commissions + 8% SST
4. Commission is a company liability until paid — track status (pending / paid)

---

## Insurance Rules

1. Insurance status is computed from expiry date — never stored as Yes/No
2. Status logic:
   - Expired: `expiry_date < today`
   - Expiring soon: `expiry_date <= today + 30 days`
   - Active: everything else
3. "Active" insurance with a past expiry date must show as Expired (no false compliance)

---

## RPGT Rules

1. Current implementation is DEMO VERSION (estimation tool only)
2. RPGT calculation function must be isolated: `calculateRPGT(property, scenario)`
3. Never implement complete RPGT Rule Engine without professional tax advisor input
4. Buyer must withhold 3% of disposal price and remit to LHDN
5. Filing deadline: 60 days from disposal date (CKHT)
6. Property disposal must be saved as a snapshot — never recalculate from live data

### RPGT Cost Ledger
- Record every cost with receipt evidence
- Missing receipts = higher tax — system must warn user
- `is_capital_improvement` flag determines if cost reduces RPGT

---

## Malaysian Compliance Rules

| Rule | Detail |
|---|---|
| e-Invoice Phase 4 | RM1M–5M revenue, effective 2026-01-01, grace until 2026-12-31 |
| Commercial rental SST | 8%, landlord taxable if rental > RM1M/year, from 2025-07-01 |
| RPGT rates (company) | 1–3 yrs: 30% / Yr 4: 20% / Yr 5: 15% / Yr 6+: 10% |
| BOVAEA commission | Sale ≤3%, Letting ~1 month rent, all + 8% SST |
| CKHT filing | 60 days from disposal |
| Buyer withholding | 3% of disposal price |

> ⚠️ Always verify e-Invoice grace period dates at LHDN website before demo — dates may change.

---

## UI Rules (Business Level)

1. UI language: Chinese (ZH) / English (EN) / Bahasa Malaysia (MS)
2. Language switching does not affect database values — always store code values
3. Light / Dark mode: CSS variable tokens only — never change layout
4. Color coding is consistent across all screens:
   - 🟢 Green: completed / paid / valid / active
   - 🟡 Yellow: pending / upcoming / needs attention
   - 🔴 Red: overdue / expired / missing / action required
   - 🔵 Blue: neutral / in progress

---

## Future Features (NOT to implement without explicit instruction)

- AI Executive Summary
- AI CFO
- AI Collection Agent
- WhatsApp Automation
- OCR
- Complete RPGT Rule Engine
- Multi-language UI beyond current 3 languages
