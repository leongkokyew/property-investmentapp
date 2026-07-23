# DATABASE.md
# Property Investment Manager — Database Schema

> Version: 1.0 (2026-07-18)
> Status: Supabase NOT YET connected — all screens use mock data
> Migrated from: `user_id` → `tenant_code`

---

## Core Principle

```
N3 has the data  → read from N3, do not duplicate in Supabase
                    (use cache tables as local mirror)
N3 has no concept → store in Supabase
```

---

## Multi-Tenancy

Every local table has `tenant_code TEXT NOT NULL`.
All queries must add `WHERE tenant_code = '<value decoded from JWT>'`.
No Supabase Auth used. No `auth.users` foreign keys.

---

## Table List (16+ tables)

| Table | Type | Description |
|---|---|---|
| `properties` | Local | Property master record, contains `n3_project_code` bridge |
| `tenancies` | Local | Lease records, 4 independent status fields |
| `deposits` | Local | Deposits (4 types: rental/utility/furniture/other) |
| `insurance_policies` | Local | Fire insurance, `expiry_date` + `reminder_days_before` |
| `maintenance_records` | Local | Maintenance history, `is_capital_improvement` flag |
| `documents` | Local | Document library (Supabase Storage) |
| `ownership_splits` | Local | Co-investor shareholding (trigger: sum ≤ 100%) |
| `cost_ledger` | Local | RPGT cost ledger (purchase + renovation costs) |
| `property_disposals` | Local | Disposal event snapshot — point-in-time, never recalculated |
| `ckht_checklist_items` | Local | CKHT filing checklist (FK → property_disposals) |
| `agency_deals` | Local | Commission records, configurable rate |
| `reminders` | Local | Reminder records (insurance / lease / rent overdue) |
| `app_settings` | Local | Language / theme / default commission (tenant_code UNIQUE) |
| `n3_invoice_cache` | N3 sync | Invoice local mirror, includes `synced_at` |
| `n3_receipt_cache` | N3 sync | Receipt local mirror |
| `n3_credit_note_cache` | N3 sync | ARCN mirror ⚠️ fields not fully validated |
| `n3_debit_note_cache` | N3 sync | ARDN mirror ⚠️ fields not fully validated |
| `n3_ap_invoice_cache` | N3 sync | AP mirror — reserved, sync disabled until needed |

---

## Key Tables — Field Definitions

### `properties`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenant_code` | TEXT NOT NULL | Multi-tenant isolation key |
| `name` | TEXT NOT NULL | Property display name |
| `address` | TEXT NOT NULL | Full address |
| `area` | TEXT | District (e.g. Mont Kiara) |
| `state` | TEXT | State |
| `property_type` | TEXT NOT NULL | `residential` / `commercial` |
| `purchase_price` | NUMERIC NOT NULL | |
| `purchase_date` | DATE NOT NULL | |
| `status` | TEXT NOT NULL | `active` / `sold` / `vacant` |
| `n3_project_code` | TEXT | Bridge to N3 Project — permanent, never change |
| `n3_parent_project_code` | TEXT | Parent Portfolio project code |
| `notes` | TEXT | |
| `created_at` | TIMESTAMPTZ | Auto |
| `updated_at` | TIMESTAMPTZ | Auto |

### `tenancies`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenant_code` | TEXT NOT NULL | |
| `property_id` | UUID FK → properties.id | |
| `tenant_name` | TEXT NOT NULL | |
| `tenant_type` | TEXT | `individual` / `company` |
| `tenant_ic_or_reg` | TEXT | IC or company reg number |
| `monthly_rent` | NUMERIC NOT NULL | |
| `tenancy_start` | DATE NOT NULL | |
| `tenancy_end` | DATE NOT NULL | |
| `tenancy_status` | TEXT NOT NULL | `active` / `expired` / `terminated` |
| `invoice_status` | TEXT NOT NULL | `issued` / `not_issued` |
| `payment_status` | TEXT NOT NULL | `paid` / `partial` / `unpaid` / `na` |
| `einvoice_status` | TEXT NOT NULL | `valid` / `pending` / `selfbill` / `na` |
| `notes` | TEXT | |
| `created_at` | TIMESTAMPTZ | Auto |

### `deposits`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenant_code` | TEXT NOT NULL | |
| `tenancy_id` | UUID FK → tenancies.id | |
| `deposit_type` | TEXT NOT NULL | `rental` / `utility` / `furniture` / `other` |
| `label` | TEXT | Custom label |
| `amount` | NUMERIC NOT NULL | |
| `received_date` | DATE NOT NULL | |
| `status` | TEXT NOT NULL | `holding` / `refunded` / `forfeited` |
| `refund_date` | DATE | |
| `refund_amount` | NUMERIC | |
| `n3_credit_note_code` | TEXT | When refunded via N3 CN |
| `created_at` | TIMESTAMPTZ | Auto |

### `insurance_policies`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenant_code` | TEXT NOT NULL | |
| `property_id` | UUID FK → properties.id | |
| `policy_number` | TEXT NOT NULL | |
| `insurer` | TEXT | |
| `coverage_amount` | NUMERIC | |
| `premium` | NUMERIC | |
| `start_date` | DATE NOT NULL | |
| `expiry_date` | DATE NOT NULL | Used by VIEW to compute status |
| `reminder_days_before` | INT | Default 30 |
| `document_path` | TEXT | Supabase Storage path |
| `created_at` | TIMESTAMPTZ | Auto |

> ⚠️ Do NOT store `status` as a column. Status is computed by VIEW (see Constraints section).
### `ownership_splits`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenant_code` | TEXT NOT NULL | |
| `property_id` | UUID FK → properties.id | |
| `investor_name` | TEXT NOT NULL | |
| `ownership_pct` | NUMERIC NOT NULL | Percentage (all rows for same property must sum ≤ 100) |
| `is_primary` | BOOLEAN NOT NULL | Primary holder flag |
| `notes` | TEXT | |
| `created_at` | TIMESTAMPTZ | Auto |



### `agency_deals`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenant_code` | TEXT NOT NULL | |
| `property_id` | UUID FK → properties.id | Optional (external property) |
| `deal_type` | TEXT NOT NULL | `sale` / `letting` |
| `transaction_value` | NUMERIC NOT NULL | Sale price or monthly rent |
| `commission_rate` | NUMERIC NOT NULL | Configurable — never hardcode |
| `commission_basis` | TEXT NOT NULL | `percentage` / `monthly_rent` |
| `commission_amount` | NUMERIC NOT NULL | Before SST |
| `sst_rate` | NUMERIC NOT NULL | Default 0.08 |
| `sst_amount` | NUMERIC NOT NULL | |
| `total_payable` | NUMERIC NOT NULL | commission + SST |
| `agent_name` | TEXT NOT NULL | |
| `status` | TEXT NOT NULL | `pending` / `paid` |
| `paid_date` | DATE | |
| `created_at` | TIMESTAMPTZ | Auto |

### `n3_invoice_cache`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenant_code` | TEXT NOT NULL | |
| `n3_id` | TEXT | N3 invoice UUID |
| `doc_code` | TEXT | Invoice number (e.g. INV01620) |
| `doc_date` | DATE | |
| `due_date` | DATE | |
| `customer_code` | TEXT | |
| `customer_name` | TEXT | |
| `project_code` | TEXT | Links to properties.n3_project_code |
| `net_total_amount` | NUMERIC | |
| `outstanding_amount` | NUMERIC | Read directly from N3 |
| `status` | TEXT | N3 status (Unpaid/Paid) |
| `einvoice_status` | TEXT | N3 eInvoiceStatus |
| `property_id` | UUID FK → properties.id | Resolved via project_code |
| `synced_at` | TIMESTAMPTZ | Last sync time |

---

## Database Constraints (Enforced)

### 1. One active tenancy per property
```sql
CREATE UNIQUE INDEX one_active_tenancy_per_property
ON tenancies(property_id)
WHERE tenancy_status = 'active';
```

### 2. Ownership percentages must not exceed 100%
```sql
CREATE OR REPLACE FUNCTION check_ownership_total()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT SUM(ownership_pct) FROM ownership_splits
      WHERE property_id = NEW.property_id) > 100 THEN
    RAISE EXCEPTION 'Ownership percentages exceed 100%% for this property';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_ownership_total
BEFORE INSERT OR UPDATE ON ownership_splits
FOR EACH ROW EXECUTE FUNCTION check_ownership_total();
```

### 3. Insurance status computed by VIEW, never stored
```sql
CREATE VIEW insurance_status_view AS
SELECT *,
  CASE
    WHEN expiry_date < CURRENT_DATE THEN 'expired'
    WHEN expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
    ELSE 'active'
  END AS computed_status
FROM insurance_policies;
```

### 4. n3_project_code unique per tenant (not globally)
```sql
CREATE UNIQUE INDEX unique_project_per_tenant
ON properties(tenant_code, n3_project_code);
```

---

## ER Diagram

```
tenant_code (from N3 JWT)
    │
    ├──< properties
    │       │  (n3_project_code → N3 Project bridge)
    │       │
    │       ├──< tenancies (4 independent status fields)
    │       │       └──< deposits (4 types)
    │       ├──< insurance_policies (status via VIEW)
    │       ├──< maintenance_records (is_capital_improvement flag)
    │       ├──< documents
    │       ├──< ownership_splits (trigger: sum ≤ 100%)
    │       ├──< cost_ledger (purchase + renovation)
    │       ├──< property_disposals (point-in-time snapshot)
    │       │       └──< ckht_checklist_items
    │       ├──< n3_invoice_cache      ← synced from N3 via project_code
    │       ├──< n3_receipt_cache      ← synced from N3 via project_code
    │       ├──< n3_credit_note_cache  ← synced from N3 via project_code
    │       ├──< n3_debit_note_cache   ← synced from N3 via project_code
    │       └──< n3_ap_invoice_cache   ← reserved, not yet enabled
    │
    ├──< agency_deals (configurable commission rate)
    ├──< reminders
    └──< app_settings (UNIQUE on tenant_code)
```


---

## Remaining Tables — Key Fields Only

> These tables have not yet been connected to Supabase (Prompt 3+).
> Field definitions are planned, not yet implemented in code.

### `maintenance_records`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenant_code` | TEXT NOT NULL | |
| `property_id` | UUID FK → properties.id | |
| `maintenance_date` | DATE NOT NULL | |
| `category` | TEXT NOT NULL | `plumbing` / `electrical` / `aircon` / `painting` / `other` |
| `description` | TEXT NOT NULL | |
| `vendor` | TEXT | Contractor name |
| `cost` | NUMERIC NOT NULL | |
| `has_receipt` | BOOLEAN NOT NULL | |
| `is_capital_improvement` | BOOLEAN NOT NULL | If true → include in cost_ledger for RPGT |
| `document_path` | TEXT | Receipt file path |
| `created_at` | TIMESTAMPTZ | Auto |

### `documents`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenant_code` | TEXT NOT NULL | |
| `property_id` | UUID FK → properties.id | |
| `tenancy_id` | UUID FK → tenancies.id | Nullable — only for tenancy docs |
| `doc_type` | TEXT NOT NULL | `title_deed` / `tenancy_agreement` / `stamp_duty` / `spa` / `other` |
| `doc_label` | TEXT NOT NULL | Display name |
| `file_path` | TEXT | Supabase Storage path |
| `status` | TEXT NOT NULL | `uploaded` / `missing` |
| `expiry_date` | DATE | For docs with expiry |
| `uploaded_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | Auto |

### `cost_ledger`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenant_code` | TEXT NOT NULL | |
| `property_id` | UUID FK → properties.id | |
| `cost_type` | TEXT NOT NULL | `purchase_price` / `stamp_duty` / `legal_fee` / `valuation` / `renovation` / `other` |
| `description` | TEXT NOT NULL | |
| `amount` | NUMERIC NOT NULL | |
| `date_incurred` | DATE NOT NULL | |
| `has_receipt` | BOOLEAN NOT NULL | |
| `document_path` | TEXT | |
| `created_at` | TIMESTAMPTZ | Auto |

### `property_disposals`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenant_code` | TEXT NOT NULL | |
| `property_id` | UUID FK → properties.id | |
| `disposal_date` | DATE NOT NULL | |
| `disposal_price` | NUMERIC NOT NULL | |
| `holding_years` | NUMERIC NOT NULL | Snapshot at time of disposal |
| `rpgt_rate` | NUMERIC NOT NULL | Snapshot — do not recalculate |
| `chargeable_gain` | NUMERIC NOT NULL | Snapshot |
| `rpgt_payable` | NUMERIC NOT NULL | Snapshot |
| `buyer_withholding_3pct` | NUMERIC NOT NULL | 3% of disposal price |
| `balance_payable` | NUMERIC NOT NULL | rpgt_payable − withholding |
| `notes` | TEXT | |
| `created_at` | TIMESTAMPTZ | Auto |

### `ckht_checklist_items`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `disposal_id` | UUID FK → property_disposals.id | |
| `item_label` | TEXT NOT NULL | Checklist item description |
| `is_checked` | BOOLEAN NOT NULL | Default false |
| `checked_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | Auto |

### `reminders`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenant_code` | TEXT NOT NULL | |
| `type` | TEXT NOT NULL | `insurance_renewal` / `lease_renewal` / `rent_overdue` / `maintenance` |
| `reference_id` | UUID NOT NULL | FK to referenced record |
| `reference_table` | TEXT NOT NULL | Table name of referenced record |
| `due_date` | DATE NOT NULL | |
| `status` | TEXT NOT NULL | `pending` / `sent` / `dismissed` |
| `sent_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | Auto |

### `app_settings`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenant_code` | TEXT NOT NULL UNIQUE | One row per tenant |
| `language` | TEXT NOT NULL | `zh` / `en` / `ms` — default `zh` |
| `theme` | TEXT NOT NULL | `light` / `dark` — default `light` |
| `default_sale_commission_rate` | NUMERIC | Default 0.03 |
| `default_letting_commission_basis` | TEXT | Default `monthly_rent` |
| `created_at` | TIMESTAMPTZ | Auto |
| `updated_at` | TIMESTAMPTZ | Auto |

### `n3_receipt_cache`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `tenant_code` | TEXT NOT NULL | |
| `n3_id` | TEXT | N3 receipt UUID |
| `doc_code` | TEXT | Receipt number |
| `doc_date` | DATE | |
| `customer_code` | TEXT | |
| `customer_name` | TEXT | |
| `net_total_amount` | NUMERIC | |
| `outstanding_amount` | NUMERIC | Unapplied balance |
| `status` | TEXT | N3 status |
| `project_code` | TEXT | Links to properties.n3_project_code |
| `property_id` | UUID FK → properties.id | |
| `synced_at` | TIMESTAMPTZ | |

### `n3_credit_note_cache` / `n3_debit_note_cache`
> ⚠️ Field structure not yet fully validated against N3 Swagger.
> Use same pattern as n3_invoice_cache. Verify before connecting in Prompt 4+.

### `n3_ap_invoice_cache`
> Reserved. Sync disabled. Do not connect until explicitly instructed.

---

## Important: property_disposals is a Snapshot

Property disposals must be stored as a complete point-in-time snapshot including tax rate and calculated result. Reason: RPGT rules apply at the moment of disposal. If `cost_ledger` receives new entries later, recalculating would change the previously reported figure — inconsistent with LHDN filing records.

---

## N3 Cache Sync Strategy

| Cache table | Synced from | Sync trigger | project_code filter |
|---|---|---|---|
| `n3_invoice_cache` | `SalesInvoices/List` | On demand / scheduled | `$filter=projectCode eq 'X'` ✅ |
| `n3_receipt_cache` | `ARReceipts/List` | On demand / scheduled | `$filter=project.code eq 'X'` ⚠️ needs test |
| `n3_credit_note_cache` | `ARCNs/List` | On demand / scheduled | `$filter=project.code eq 'X'` ⚠️ needs test |
| `n3_debit_note_cache` | `ARDNs/List` | On demand / scheduled | Unknown ⚠️ highest risk |
| `n3_ap_invoice_cache` | `PurchaseInvoices/List` | Disabled | N/A |
