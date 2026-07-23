# TODO.md
# Property Investment Manager

---

## 🔴 Blockers — Must resolve before Prompt 3

- [ ] Fix Path A: add URL token reading to `SessionProvider`
      ```typescript
      // Add to useEffect in session.tsx before localStorage.getItem:
      const urlToken = new URLSearchParams(window.location.search).get("token");
      if (urlToken) localStorage.setItem(TOKEN_KEY, urlToken);
      ```
- [ ] Confirm Supabase project URL and anon key available for Prompt 3

---

## 🟡 Prompt 3 — Supabase Real Data Layer

- [ ] Replace mock `store.tsx` with Supabase client
- [ ] `properties` table: connect CREATE + READ + UPDATE
- [ ] `tenancies` table: connect CREATE + READ + UPDATE
- [ ] All queries scoped by `tenant_code` from JWT
- [ ] Verify Path A flow end-to-end from N3 My Apps

---

## 🟡 Pending Tests

- [ ] Test ARDN OData project filter: `GET /api/ARDNs/List?$filter=project.code eq 'X'&$top=1`
- [ ] Test ARCN OData project filter: `GET /api/ARCNs/List?$filter=project.code eq 'X'&$top=1`
- [ ] Test ARReceipt OData project filter: `GET /api/ARReceipts/List?$filter=project.code eq 'X'&$top=1`

---

## 🔵 Prompt 4+ — Features (after Supabase connected)

- [ ] Dashboard: connect real N3 cache data (invoices, receipts, DN, CN)
- [ ] Billing Run: push invoices to N3 via `/api/SalesInvoices/Create`
- [ ] Arrears Board: real overdue detection from N3 invoice cache
- [ ] Tenancy Manager: deposits, insurance expiry alerts
- [ ] RPGT Worksheet: cost ledger from Supabase + disposal snapshot
- [ ] Compliance Centre: document matrix + deposit register
- [ ] Agency Commissions: configurable rates + paid/pending tracking

---

## 🔵 Known Bugs / Risks

- [ ] Collection Rate: NaN% when all properties vacant (divide by zero — no guard)
- [ ] ARDN project filter: unconfirmed — may need fallback to customer filter
- [ ] ARCN / Debit Note field structure: ⚠️ not fully validated against Swagger
- [ ] Date math uses browser `new Date()` — not server-authoritative (fine for display, not for legal filings)

---

## 🔵 Future (Not in current scope)

- [ ] AI Executive Summary
- [ ] AI CFO / AI Collection Agent
- [ ] WhatsApp Automation
- [ ] OCR for receipts
- [ ] Complete RPGT Rule Engine (needs tax advisor)
- [ ] Multi-language beyond ZH/EN/MS
- [ ] Dark mode (CSS token framework already in place)
