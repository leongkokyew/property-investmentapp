import { useState, type ReactNode } from "react";
import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth/session";
import { SessionHeader } from "@/components/session-header";

const IS_DEV =
  import.meta.env.DEV ||
  (typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("dev"));

export function AuthGate({ children }: { children: ReactNode }) {
  const { token, info, loading, error } = useSession();

  // Signed in and info loaded → render app with header.
  if (token && info) {
    return (
      <div className="min-h-screen bg-background">
        <SessionHeader />
        {children}
      </div>
    );
  }

  // Signed in but still loading / errored basic info.
  if (token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          {loading ? (
            <>
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                Loading your N3 session…
              </p>
            </>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-foreground">
                Couldn't load your N3 session
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {error ?? "Unknown error"}
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // No token — show the "open from N3" message; dev key form is a discreet fallback.
  return <NoSessionScreen />;
}

function NoSessionScreen() {
  const { setToken } = useSession();
  const [showDev, setShowDev] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [devError, setDevError] = useState<string | null>(null);

  async function handleDevSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setSubmitting(true);
    setDevError(null);
    try {
      const res = await fetch("/api/n3/connect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      if (res.status === 404) {
        setDevError("Dev connect is disabled in this build.");
        return;
      }
      const json = (await res.json()) as {
        access_token?: string;
        error?: string;
        detail?: string;
      };
      if (!res.ok || !json.access_token) {
        const base = json.error ?? `Connect failed (${res.status})`;
        setDevError(json.detail ? `${base} — ${json.detail}` : base);
        return;
      }
      setToken(json.access_token);
    } catch (err) {
      setDevError(err instanceof Error ? err.message : "Connect failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Building2 className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
          Open this app from N3 → My Apps
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Property Investment Manager runs inside your QNE N3 Cloud Accounting
          workspace. Launch it from the N3 My Apps section to sign in.
        </p>

        {IS_DEV && (
          <div className="mt-8 rounded-lg border border-dashed bg-card p-4 text-left">
            {!showDev ? (
              <button
                type="button"
                onClick={() => setShowDev(true)}
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Developer: use API key (Path B)
              </button>
            ) : (
              <form onSubmit={handleDevSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="apiKey" className="text-xs">
                    N3 API key
                  </Label>
                  <Input
                    id="apiKey"
                    type="password"
                    autoComplete="off"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste your N3 API key"
                    className="mt-1 font-mono text-xs"
                  />
                </div>
                {devError && (
                  <p className="text-xs text-destructive">{devError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDev(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={submitting}>
                    {submitting ? "Connecting…" : "Connect"}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Development only. Disabled in production builds.
                </p>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
