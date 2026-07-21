import { createFileRoute } from "@tanstack/react-router";

/**
 * Path B (development-only) N3 connect proxy.
 *
 * The browser POSTs { apiKey } here; this handler calls
 * GET https://openapi.account.qne.cloud/api/auth/connect?api-key=...
 * server-side so the raw key never touches the client bundle.
 *
 * Disabled in production builds — returns 404.
 */
export const Route = createFileRoute("/api/n3/connect")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (process.env.NODE_ENV === "production") {
          return new Response("Not Found", { status: 404 });
        }

        let apiKey = "";
        try {
          const body = (await request.json()) as { apiKey?: unknown };
          if (typeof body.apiKey === "string") apiKey = body.apiKey.trim();
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }
        if (!apiKey) {
          return Response.json({ error: "apiKey required" }, { status: 400 });
        }

        const upstream = await fetch(
          `https://openapi.account.qne.cloud/api/auth/connect?api-key=${encodeURIComponent(apiKey)}`,
          { method: "GET", headers: { accept: "application/json" } },
        );

        const text = await upstream.text();
        console.log("N3 raw response:", text);
        if (!upstream.ok) {
          return Response.json(
            { error: "N3 connect failed", status: upstream.status, detail: text.slice(0, 500) },
            { status: 400 },
          );
        }

        // N3 returns the JWT — sometimes as a bare string, sometimes as JSON.
        let token = "";
        try {
          const parsed = JSON.parse(text) as unknown;
          if (typeof parsed === "string") token = parsed;
          else if (parsed && typeof parsed === "object") {
            const obj = parsed as Record<string, unknown>;
            const topKeys = [
              "access_token",
              "accessToken",
              "token",
              "jwt",
              "Token",
              "AccessToken",
            ];
            for (const k of topKeys) {
              if (typeof obj[k] === "string" && (obj[k] as string).trim()) {
                token = obj[k] as string;
                break;
              }
            }
            if (!token) {
              const nested: Array<[string, string]> = [
                ["data", "access_token"],
                ["data", "accessToken"],
                ["data", "token"],
                ["data", "jwt"],
                ["result", "access_token"],
                ["result", "token"],
              ];
              for (const [outer, inner] of nested) {
                const o = obj[outer];
                if (o && typeof o === "object") {
                  const v = (o as Record<string, unknown>)[inner];
                  if (typeof v === "string" && v.trim()) {
                    token = v;
                    break;
                  }
                }
              }
            }
          }
        } catch {
          token = text.trim().replace(/^"|"$/g, "");
        }

        if (!token) {
          return Response.json(
            { error: "N3 response did not contain a token", detail: text.slice(0, 500) },
            { status: 400 },
          );
        }

        return Response.json({ access_token: token });
      },
    },
  },
});
