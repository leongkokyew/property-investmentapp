import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  EinvoiceStatus,
  InvoiceStatus,
  NewProperty,
  NewTenancy,
  PaymentStatus,
  Property,
  Tenancy,
  TenancyStatus,
} from "./types";

/**
 * Data access layer.
 *
 * UI components MUST use the hooks exported from this file
 * (`useProperties`, `useTenancies`, etc.) — they must never touch the
 * underlying arrays directly. The function signatures are intentionally
 * async-friendly (returning plain values today, but easy to swap to
 * Promise-returning Supabase or N3 Open API calls later without changing
 * any UI code).
 */

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

/**
 * Placeholder tenant code used to scope mock rows. When this app is
 * wired to real Supabase-backed storage, replace this constant with
 * the tenant_code sourced from the active N3 session.
 */
export const MOCK_TENANT_CODE = "DEV-TENANT-001";


const seedProperties: Property[] = [
  {
    id: "p1",
    tenant_code: MOCK_TENANT_CODE,
    name: "Bangsar Heights Condo A-12-3",
    address: "12 Jalan Bangsar, Bangsar",
    area: "Bangsar",
    state: "Kuala Lumpur",
    property_type: "residential",
    purchase_price: 850000,
    purchase_date: "2019-04-15",
    status: "active",
    notes: "High-yield condo, freehold.",
  },
  {
    id: "p2",
    tenant_code: MOCK_TENANT_CODE,
    name: "KLCC Suites Unit 25-08",
    address: "Jalan Pinang, KLCC",
    area: "KLCC",
    state: "Kuala Lumpur",
    property_type: "residential",
    purchase_price: 1200000,
    purchase_date: "2021-09-30",
    status: "active",
    notes: "",
  },
  {
    id: "p3",
    tenant_code: MOCK_TENANT_CODE,
    name: "Shah Alam Shop Lot 4",
    address: "Seksyen 13, Shah Alam",
    area: "Seksyen 13",
    state: "Selangor",
    property_type: "commercial",
    purchase_price: 1800000,
    purchase_date: "2018-01-10",
    status: "active",
    notes: "Corner lot.",
  },
  {
    id: "p4",
    tenant_code: MOCK_TENANT_CODE,
    name: "Penang Georgetown Heritage Shop",
    address: "Lebuh Armenian, Georgetown",
    area: "Georgetown",
    state: "Penang",
    property_type: "commercial",
    purchase_price: 2500000,
    purchase_date: "2016-06-22",
    status: "vacant",
    notes: "Heritage zone.",
  },
];

const seedTenancies: Tenancy[] = [
  {
    id: "t1",
    tenant_code: MOCK_TENANT_CODE,
    property_id: "p1",
    tenant_name: "Sarah Lim",
    tenant_type: "individual",
    tenant_ic_or_reg: "880212-14-5566",
    monthly_rent: 3200,
    tenancy_start: "2024-06-01",
    tenancy_end: "2026-05-31",
    tenancy_status: "active",
    invoice_status: "issued",
    payment_status: "paid",
    einvoice_status: "valid",
    notes: "",
  },
  {
    id: "t2",
    tenant_code: MOCK_TENANT_CODE,
    property_id: "p1",
    tenant_name: "John Tan",
    tenant_type: "individual",
    tenant_ic_or_reg: "850414-08-1122",
    monthly_rent: 2900,
    tenancy_start: "2022-05-01",
    tenancy_end: "2024-04-30",
    tenancy_status: "expired",
    invoice_status: "issued",
    payment_status: "paid",
    einvoice_status: "na",
    notes: "Moved out, deposit refunded.",
  },
  {
    id: "t3",
    tenant_code: MOCK_TENANT_CODE,
    property_id: "p2",
    tenant_name: "Acme Trading Sdn Bhd",
    tenant_type: "company",
    tenant_ic_or_reg: "202301012345",
    monthly_rent: 5500,
    tenancy_start: "2025-01-01",
    tenancy_end: "2027-12-31",
    tenancy_status: "active",
    invoice_status: "issued",
    payment_status: "partial",
    einvoice_status: "pending",
    notes: "",
  },
  {
    id: "t4",
    tenant_code: MOCK_TENANT_CODE,
    property_id: "p3",
    tenant_name: "Warung Selera Kita",
    tenant_type: "company",
    tenant_ic_or_reg: "199801023456",
    monthly_rent: 4200,
    tenancy_start: "2023-03-01",
    tenancy_end: "2026-02-28",
    tenancy_status: "active",
    invoice_status: "not_issued",
    payment_status: "unpaid",
    einvoice_status: "selfbill",
    notes: "Self-billed e-invoice arrangement.",
  },
];

interface DataStore {
  properties: Property[];
  tenancies: Tenancy[];
  getProperty: (id: string) => Property | undefined;
  getTenancies: (propertyId: string) => Tenancy[];
  createProperty: (data: NewProperty) => Property;
  updateProperty: (id: string, data: Partial<NewProperty>) => Property;
  createTenancy: (data: NewTenancy) => Tenancy; // throws on active-conflict
  updateTenancy: (id: string, data: Partial<NewTenancy>) => Tenancy;
  updateTenancyStatus: (
    id: string,
    field: "tenancy_status" | "invoice_status" | "payment_status" | "einvoice_status",
    value: TenancyStatus | InvoiceStatus | PaymentStatus | EinvoiceStatus,
  ) => Tenancy;
}

const DataCtx = createContext<DataStore | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(seedProperties);
  const [tenancies, setTenancies] = useState<Tenancy[]>(seedTenancies);

  const getProperty = useCallback(
    (id: string) => properties.find((p) => p.id === id),
    [properties],
  );

  const getTenancies = useCallback(
    (propertyId: string) =>
      tenancies
        .filter((t) => t.property_id === propertyId)
        .slice()
        .sort((a, b) => (a.tenancy_start < b.tenancy_start ? 1 : -1)),
    [tenancies],
  );

  const createProperty = useCallback((data: NewProperty): Property => {
    const p: Property = { ...data, id: uid(), tenant_code: MOCK_TENANT_CODE };
    setProperties((cur) => [...cur, p]);
    return p;
  }, []);

  const updateProperty = useCallback(
    (id: string, data: Partial<NewProperty>): Property => {
      let updated: Property | undefined;
      setProperties((cur) =>
        cur.map((p) => {
          if (p.id !== id) return p;
          updated = { ...p, ...data };
          return updated;
        }),
      );
      if (!updated) throw new Error("Property not found");
      return updated;
    },
    [],
  );

  const createTenancy = useCallback(
    (data: NewTenancy): Tenancy => {
      if (data.tenancy_status === "active") {
        const conflict = tenancies.find(
          (t) =>
            t.property_id === data.property_id &&
            t.tenancy_status === "active",
        );
        if (conflict) {
          throw new Error(
            "This property already has an active tenancy. Only one tenancy can be active at a time.",
          );
        }
      }
      const t: Tenancy = { ...data, id: uid(), tenant_code: MOCK_TENANT_CODE };
      setTenancies((cur) => [...cur, t]);
      return t;
    },
    [tenancies],
  );

  const updateTenancy = useCallback(
    (id: string, data: Partial<NewTenancy>): Tenancy => {
      let updated: Tenancy | undefined;
      setTenancies((cur) => {
        const existing = cur.find((t) => t.id === id);
        if (!existing) return cur;
        const next: Tenancy = { ...existing, ...data };
        // enforce single-active rule
        if (
          next.tenancy_status === "active" &&
          existing.tenancy_status !== "active"
        ) {
          const conflict = cur.find(
            (t) =>
              t.id !== id &&
              t.property_id === next.property_id &&
              t.tenancy_status === "active",
          );
          if (conflict) {
            throw new Error(
              "This property already has an active tenancy. Only one tenancy can be active at a time.",
            );
          }
        }
        updated = next;
        return cur.map((t) => (t.id === id ? next : t));
      });
      if (!updated) throw new Error("Tenancy not found");
      return updated;
    },
    [],
  );

  const updateTenancyStatus: DataStore["updateTenancyStatus"] = useCallback(
    (id, field, value) => {
      return updateTenancy(id, { [field]: value } as Partial<NewTenancy>);
    },
    [updateTenancy],
  );

  const value = useMemo<DataStore>(
    () => ({
      properties,
      tenancies,
      getProperty,
      getTenancies,
      createProperty,
      updateProperty,
      createTenancy,
      updateTenancy,
      updateTenancyStatus,
    }),
    [
      properties,
      tenancies,
      getProperty,
      getTenancies,
      createProperty,
      updateProperty,
      createTenancy,
      updateTenancy,
      updateTenancyStatus,
    ],
  );

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}

export function useData(): DataStore {
  const ctx = useContext(DataCtx);
  if (!ctx) throw new Error("useData must be used inside <DataProvider>");
  return ctx;
}
