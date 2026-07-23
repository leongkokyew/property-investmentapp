import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase.server";
import { getTenantAuth } from "@/lib/auth/tenant.server";

const ALLOWED_FIELDS = [
  "name",
  "address",
  "area",
  "state",
  "property_type",
  "purchase_price",
  "purchase_date",
  "status",
  "n3_project_code",
  "n3_parent_project_code",
  "notes",
] as const;

function pick(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const k of ALLOWED_FIELDS) {
    if (k in body) out[k] = body[k];
  }
  return out;
}

export const Route = createFileRoute("/api/supabase/properties/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const check = getTenantAuth(request);
        if (!check.ok) return check.response;
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("id", params.id)
          .eq("tenant_code", check.auth.tenantCode)
          .maybeSingle();
        if (error) return Response.json({ error: error.message }, { status: 502 });
        if (!data) return Response.json({ error: "Not found" }, { status: 404 });
        return Response.json(data);
      },
      PATCH: async ({ request, params }) => {
        const check = getTenantAuth(request);
        if (!check.ok) return check.response;
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }
        const patch = pick(body);
        if (Object.keys(patch).length === 0) {
          return Response.json({ error: "No updatable fields" }, { status: 400 });
        }
        const { data, error } = await supabase
          .from("properties")
          .update(patch)
          .eq("id", params.id)
          .eq("tenant_code", check.auth.tenantCode)
          .select()
          .maybeSingle();
        if (error) return Response.json({ error: error.message }, { status: 502 });
        if (!data) return Response.json({ error: "Not found" }, { status: 404 });
        return Response.json(data);
      },
    },
  },
});
