import { createFileRoute } from "@tanstack/react-router";

const UPSTREAM = "https://openapi.account.qne.cloud/api/ARReceipts/List";
const FORWARDED = ["$filter", "$top", "$skip", "$orderby"] as const;

export const Route = createFileRoute("/api/n3/receipts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = request.headers.get("authorization");
        if (!auth) {
          return Response.json({ error: "Missing Authorization" }, { status: 401 });
        }

        const incoming = new URL(request.url).searchParams;
        const forwarded = new URLSearchParams();
        for (const key of FORWARDED) {
          const v = incoming.get(key);
          if (v !== null) forwarded.set(key, v);
        }
        const qs = forwarded.toString();
        const url = qs ? `${UPSTREAM}?${qs}` : UPSTREAM;

        const upstream = await fetch(url, {
          method: "GET",
          headers: { authorization: auth, accept: "application/json" },
        });

        const text = await upstream.text();
        const status = upstream.ok ? upstream.status : 502;
        return new Response(text, {
          status,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
