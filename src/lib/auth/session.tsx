import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const TOKEN_KEY = "qne_access_token";

/**
 * N3 identity source. The JWT stored under `qne_access_token` is the ONLY
 * identity — we do not run a separate auth system. The company/tenant/email
 * shown in the session header are fetched fresh on every mount and never
 * cached to storage.
 */

export interface SessionInfo {
  companyName: string;
  tenantCode: string;
  email: string;
}

interface SessionState {
  token: string | null;
  info: SessionInfo | null;
  loading: boolean;
  error: string | null;
  setToken: (t: string) => void;
  clear: () => void;
  refresh: () => Promise<void>;
}

const Ctx = createContext<SessionState | null>(null);

function pick(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
}

function decodeJwtClaims(token: string): { tenantCode: string; email: string } {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as Record<string, unknown>;
    const tenantCode =
      (payload.tenantCode as string | undefined) ??
      (payload.tenant_code as string | undefined) ??
      "—";
    const rawEmail =
      (payload.email as string | string[] | undefined) ??
      (payload.sub as string | string[] | undefined) ??
      "—";
    const email = Array.isArray(rawEmail) ? rawEmail[0] ?? "—" : rawEmail;
    return { tenantCode: String(tenantCode), email: String(email) };
  } catch {
    return { tenantCode: "—", email: "—" };
  }
}

function normalizeBasicInfo(raw: unknown, token: string): SessionInfo {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const inner =
    obj.data && typeof obj.data === "object"
      ? (obj.data as Record<string, unknown>)
      : obj;

  const { tenantCode, email } = decodeJwtClaims(token);

  return {
    companyName: pick(inner, ["companyName", "CompanyName", "company_name", "name"]),
    tenantCode,
    email,
  };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read token from localStorage after mount (browser-only).
  useEffect(() => {
    try {
      // Path A: token arrives in URL from N3 My Apps (?token=JWT)
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("token");
      if (urlToken?.trim()) {
        localStorage.setItem(TOKEN_KEY, urlToken.trim());
        // Remove token from URL to prevent leakage in referrer headers / bookmarks
        params.delete("token");
        const newSearch = params.toString();
        window.history.replaceState(
          null,
          "",
          window.location.pathname + (newSearch ? `?${newSearch}` : "") + window.location.hash,
        );
        setTokenState(urlToken.trim());
        return;
      }
      // Path B / returning user: fall back to localStorage
      const t = localStorage.getItem(TOKEN_KEY);
      setTokenState(t?.trim() ? t : null);
    } catch {
      setTokenState(null);
    }
  }, []);

  const fetchInfo = useCallback(async (t: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/n3/basic-info", {
        headers: { authorization: `Bearer ${t}` },
      });
      if (res.status === 401) {
        setInfo(null);
        setError("Session expired. Please reconnect from N3.");
        try {
          localStorage.removeItem(TOKEN_KEY);
        } catch {
          /* noop */
        }
        setTokenState(null);
        return;
      }
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Failed to load company profile (${res.status}): ${body.slice(0, 200)}`);
      }
      const json = (await res.json()) as unknown;
      setInfo(normalizeBasicInfo(json, t));
    } catch (e) {
      setInfo(null);
      setError(e instanceof Error ? e.message : "Failed to load company profile");
    } finally {
      setLoading(false);
    }
  }, []);

  // Whenever the token changes, refetch. Never cache info to storage.
  useEffect(() => {
    if (!token) {
      setInfo(null);
      setLoading(false);
      setError(null);
      return;
    }
    void fetchInfo(token);
  }, [token, fetchInfo]);

  const setToken = useCallback((t: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, t);
    } catch {
      /* noop */
    }
    setTokenState(t);
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* noop */
    }
    setTokenState(null);
    setInfo(null);
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    if (token) await fetchInfo(token);
  }, [token, fetchInfo]);

  const value = useMemo<SessionState>(
    () => ({ token, info, loading, error, setToken, clear, refresh }),
    [token, info, loading, error, setToken, clear, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): SessionState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
