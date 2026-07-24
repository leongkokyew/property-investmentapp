import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "../auth/session";
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

interface DataStore {
  properties: Property[];
  loading: boolean;
  error: string | null;
  getProperty: (id: string) => Property | undefined;
  getTenancies: (propertyId: string) => Tenancy[];
  fetchTenancies: (propertyId: string) => Promise<void>;
  createProperty: (data: NewProperty) => Promise<Property>;
  updateProperty: (id: string, data: Partial<NewProperty>) => Promise<Property>;
  createTenancy: (data: NewTenancy) => Promise<Tenancy>;
  updateTenancy: (id: string, data: Partial<NewTenancy>) => Promise<Tenancy>;
  updateTenancyStatus: (
    id: string,
    field: "tenancy_status" | "invoice_status" | "payment_status" | "einvoice_status",
    value: TenancyStatus | InvoiceStatus | PaymentStatus | EinvoiceStatus,
  ) => Promise<Tenancy>;
}

const DataCtx = createContext<DataStore | null>(null);

async function apiFetch<T>(
  url: string,
  token: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? `Request failed (${res.status})`);
  }
  return json as T;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { token } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenanciesCache, setTenanciesCache] = useState<Record<string, Tenancy[]>>({});
  const fetchingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!token) {
      setProperties([]);
      setTenanciesCache({});
      return;
    }
    setLoading(true);
    setError(null);
    apiFetch<Property[]>("/api/supabase/properties", token)
      .then(setProperties)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load properties"),
      )
      .finally(() => setLoading(false));
  }, [token]);

  const getProperty = useCallback(
    (id: string) => properties.find((p) => p.id === id),
    [properties],
  );

  const getTenancies = useCallback(
    (propertyId: string): Tenancy[] => tenanciesCache[propertyId] ?? [],
    [tenanciesCache],
  );

  const fetchTenancies = useCallback(
    async (propertyId: string): Promise<void> => {
      if (!token) return;
      if (fetchingRef.current.has(propertyId)) return;
      fetchingRef.current.add(propertyId);
      try {
        const data = await apiFetch<Tenancy[]>(
          `/api/supabase/tenancies?propertyId=${propertyId}`,
          token,
        );
        setTenanciesCache((prev) => ({ ...prev, [propertyId]: data }));
      } finally {
        fetchingRef.current.delete(propertyId);
      }
    },
    [token],
  );

  const createProperty = useCallback(
    async (data: NewProperty): Promise<Property> => {
      if (!token) throw new Error("Not authenticated");
      const p = await apiFetch<Property>("/api/supabase/properties", token, {
        method: "POST",
        body: JSON.stringify(data),
      });
      setProperties((cur) => [p, ...cur]);
      return p;
    },
    [token],
  );

  const updateProperty = useCallback(
    async (id: string, data: Partial<NewProperty>): Promise<Property> => {
      if (!token) throw new Error("Not authenticated");
      const p = await apiFetch<Property>(`/api/supabase/properties/${id}`, token, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      setProperties((cur) => cur.map((x) => (x.id === id ? p : x)));
      return p;
    },
    [token],
  );

  const createTenancy = useCallback(
    async (data: NewTenancy): Promise<Tenancy> => {
      if (!token) throw new Error("Not authenticated");
      const t = await apiFetch<Tenancy>("/api/supabase/tenancies", token, {
        method: "POST",
        body: JSON.stringify(data),
      });
      setTenanciesCache((prev) => ({
        ...prev,
        [data.property_id]: [t, ...(prev[data.property_id] ?? [])],
      }));
      return t;
    },
    [token],
  );

  const updateTenancy = useCallback(
    async (id: string, data: Partial<NewTenancy>): Promise<Tenancy> => {
      if (!token) throw new Error("Not authenticated");
      const t = await apiFetch<Tenancy>(`/api/supabase/tenancies/${id}`, token, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      setTenanciesCache((prev) => {
        const pid = t.property_id;
        const list = prev[pid] ?? [];
        return { ...prev, [pid]: list.map((x) => (x.id === id ? t : x)) };
      });
      return t;
    },
    [token],
  );

  const updateTenancyStatus = useCallback(
    async (
      id: string,
      field: "tenancy_status" | "invoice_status" | "payment_status" | "einvoice_status",
      value: TenancyStatus | InvoiceStatus | PaymentStatus | EinvoiceStatus,
    ): Promise<Tenancy> => updateTenancy(id, { [field]: value } as Partial<NewTenancy>),
    [updateTenancy],
  );

  const value = useMemo<DataStore>(
    () => ({
      properties,
      loading,
      error,
      getProperty,
      getTenancies,
      fetchTenancies,
      createProperty,
      updateProperty,
      createTenancy,
      updateTenancy,
      updateTenancyStatus,
    }),
    [
      properties, loading, error,
      getProperty, getTenancies, fetchTenancies,
      createProperty, updateProperty,
      createTenancy, updateTenancy, updateTenancyStatus,
    ],
  );

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}

export function useData(): DataStore {
  const ctx = useContext(DataCtx);
  if (!ctx) throw new Error("useData must be used inside <DataProvider>");
  return ctx;
}
