# API.md
# Property Investment Manager — N3 API Reference

> Source of truth: QNE N3 Swagger
> https://openapi.account.qne.cloud/doc/index.html
> Spec files: platform-v1.json / sales-v1.json

---

## API Response Envelope (all endpoints)

```json
{
  "type": "API",
  "success": true,
  "code": "0000",
  "message": "Operation was completed successfully.",
  "data": { ... },
  "error": null
}
```

> ⚠️ `code === "0000"` = success. HTTP 200 does NOT mean business success.
> Always check `code` and `success` fields in the body.

## Paginated List Response

```json
{ "data": { "count": 1523, "value": [ {...} ] } }
```

Rows in `data.value`, total in `data.count`. Never treat `data` as an array.

---

## Authentication

### Get JWT Token
```
GET https://openapi.account.qne.cloud/api/auth/connect?api-key=<GUID>
Response: { "data": { "token": "eyJhbGci..." }, "code": "0000" }
```
> Token is at `data.token` — confirmed in official Swagger description.

### Use Token
```
Authorization: Bearer <token>
```
Every authenticated request must include this header.

---

## Write Workflow (official pattern)

```
1. GET /api/<Entity>/New      → get template with tenant defaults
2. Build payload from template (exclude envelope, exclude response-only fields)
3. POST /api/<Entity>/Create
4. Check code === "0000" (not HTTP status)
```

---

## ✅ Confirmed Working Endpoints

### Platform
| Endpoint | Method | Notes |
|---|---|---|
| `/api/auth/connect` | GET | Token exchange |
| `/api/companyprofile/BasicInfo` | GET | Session header data |
| `/api/companyprofile` | GET | Full company profile |

### Customers
| Endpoint | Method | Notes |
|---|---|---|
| `/api/customers/list` | GET | OData `$filter`, `$top`, `$skip`, `$orderby` |
| `/api/customers/{id}` | GET | Includes `balance` field |

### Stocks
| Endpoint | Method | Notes |
|---|---|---|
| `/api/stocks/list` | GET | |
| `/api/stocks/{id}` | GET | |
| `/api/stockgroups/list` | GET | |
| `/api/agents/lookup` | GET | |

### Sales Invoices
| Endpoint | Method | Notes |
|---|---|---|
| `/api/SalesInvoices/List` | GET | Supports OData |
| `/api/SalesInvoices/{id}` | GET | Includes `itemDetails`, `projectCode`, `projectId` |
| `/api/SalesInvoices/New` | GET | Get template before Create |
| `/api/SalesInvoices/Create` | POST | ✅ Verified working |
| `/api/SalesInvoices/GetPaymentInfo` | GET | |
| `/api/SalesInvoices/Void` | POST | |
| `/api/SalesInvoices/EInvoiceValidation` | POST | |

### AR Receipts
| Endpoint | Method | Notes |
|---|---|---|
| `/api/ARReceipts/List` | GET | Includes `knockoff[]` array |
| `/api/ARReceipts/{id}` | GET | |

### AR Credit / Debit Notes
| Endpoint | Method | Notes |
|---|---|---|
| `/api/ARDNs/List` | GET | Debit Notes |
| `/api/ARCNs/List` | GET | Credit Notes |

### Purchase / Journals
| Endpoint | Method | Notes |
|---|---|---|
| `/api/PurchaseInvoices/List` | GET | `projectCode` currently null |
| `/api/PurchaseInvoices/{id}` | GET | |
| `/api/Journals` | GET + POST | |
| `/api/CashSales` | POST | |

### Marketplace
| Endpoint | Method | Notes |
|---|---|---|
| `POST /api/marketplace/DevelopmentInstructions?key=<app-key>` | POST | Per-app key, must be POST not GET |

---

## ❌ Endpoints That Do NOT Exist

| Endpoint | Result | Note |
|---|---|---|
| `GET /api/Project` | 404 | Does not exist |
| `GET /api/Projects` | 405 (DELETE only) | Exists but GET not allowed |
| `GET /api/ProjectDto` | 404 | |
| `GET /api/ProjectLookup` | 404 | |
| `POST /api/SalesInvoices` | 405 (DELETE only) | Use `/Create` instead |

---

## Key Fields Reference

### ProjectLookupDto (embedded in Invoice/Receipt)
```json
{
  "id": 65401,
  "code": "MONT KIARA PAVILION A-12-3",
  "name": "Mont Kiara Pavilion A-12-3",
  "isActive": true,
  "hasChildren": false
}
```
`hasChildren: false` = Child Project = can attach Invoices

### Read vs Write — projectCode vs projectId
| Operation | Field | Type |
|---|---|---|
| GET (read) | `projectCode` | string |
| POST (write) | `projectId` | integer |

Never pass `projectCode` string when creating — it will be silently ignored.

### Outstanding Amount
- N3 Invoice contains `outstandingAmount` — read directly, do not calculate
- Formula: Invoice amount − receipts applied

### SalesInvoiceDto TIN Fields
| Field | Max Length | Description |
|---|---|---|
| `tinNumber` | 14 | Customer TIN (e-Invoice) |
| `customerTinType` | — | NRIC / BRN / PASSPORT |
| `salesTaxRegNo` | 35 | Sales tax registration |
| `serviceTaxRegNo` | 35 | Service tax registration |
| `rentalLeaseExemptedTaxTotalAmount` | — | Rental lease tax exemption |

---

## Verified Create Invoice Payload

```json
{
  "docDate": "2026-07-19",
  "customerId": 1096347,
  "termCode": "CASH",
  "projectId": 65401,
  "currencyRate": 1,
  "currencyCode": "MYR",
  "itemDetails": [
    {
      "description": "Monthly rental - Mont Kiara Pavilion A-12-3",
      "stockId": 1952998,
      "unitPrice": 4500,
      "qty": 1
    }
  ]
}
```
Result: Invoice INV2607/031, attached to Project id 65401 ✅

---

## Project Filter — OData Support Status

| Endpoint | Project field in List DTO | OData filter | Status |
|---|---|---|---|
| `SalesInvoices/List` | `projectCode` (direct) | `$filter=projectCode eq 'X'` | ✅ Safe |
| `ARReceipts/List` | `project` (nested object) | `$filter=project.code eq 'X'` | ⚠️ Needs testing |
| `ARCNs/List` | `project` (nested object) | `$filter=project.code eq 'X'` | ⚠️ Needs testing |
| `ARDNs/List` | Not in List DTO | Unknown | ⚠️ Highest risk |

ARDN fallback: use `$filter=customer.code eq 'C001'` then filter by projectCode in cache.

---

## N3 Swagger Spec URLs

```
Full spec (recommended for integrators):
  https://openapi.account.qne.cloud/doc/platform-v1.json
  https://openapi.account.qne.cloud/doc/sales-v1.json

Operations only:
  https://openapi.account.qne.cloud/doc/sales-v1-api.json

Schemas only:
  https://openapi.account.qne.cloud/doc/sales-v1-schemas.json
```

---

## Internal Proxy Routes (App's Own API)

| Route | Method | Proxies to |
|---|---|---|
| `/api/n3/connect` | POST | N3 auth connect (dev only, 404 in prod) |
| `/api/n3/basic-info` | GET | `/api/companyprofile/BasicInfo` |
| `/api/n3/invoices` | GET | `/api/SalesInvoices/List` |
| `/api/n3/receipts` | GET | `/api/ARReceipts/List` |
| `/api/n3/debits` | GET | `/api/ARDNs/List` |
| `/api/n3/credits` | GET | `/api/ARCNs/List` |

All proxy routes forward: `Authorization` header + OData params (`$filter`, `$top`, `$skip`, `$orderby`)
