import { createFileRoute } from "@tanstack/react-router";

/**
 * Server-side proxy to N3's GET /api/companyprofile/BasicInfo.
 * The browser passes the stored JWT via Authorization; we forward
 * it upstream so the client never talks to N3 directly.
 */
export const Route = createFileRoute("/api/n3/basic-info")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = request.headers.get("authorization");
        if (!auth) {
          return Response.json({ error: "Missing Authorization" }, { status: 401 });
        }

        const upstream = await fetch(
          "https://openapi.account.qne.cloud/api/companyprofile/BasicInfo",
          {
            method: "GET",
            headers: { authorization: auth, accept: "application/json" },
          },
        );

        const text = await upstream.text();
        if (!upstream.ok) {
          return Response.json(
            { error: "N3 basic-info failed", status: upstream.status, detail: text.slice(0, 500) },
            { status: upstream.status === 401 ? 401 : 502 },
          );
        }

        try {
          return Response.json(JSON.parse(text));
        } catch {
          return new Response(text, {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
