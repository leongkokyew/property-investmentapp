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

export const Route = createFileRoute("/api/supabase/properties")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const check = getTenantAuth(request);
        if (!check.ok) return check.response;
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("tenant_code", check.auth.tenantCode)
          .order("created_at", { ascending: false });
        if (error) {
          return Response.json({ error: error.message }, { status: 502 });
        }
        return Response.json(data);
      },
      POST: async ({ request }) => {
        const check = getTenantAuth(request);
        if (!check.ok) return check.response;
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }
        const row = { ...pick(body), tenant_code: check.auth.tenantCode };
        if (!row.name || !row.address || !row.property_type || !row.purchase_date || !row.status) {
          return Response.json(
            { error: "Missing required fields" },
            { status: 400 },
          );
        }
        const { data, error } = await supabase
          .from("properties")
          .insert(row)
          .select()
          .single();
        if (error) {
          return Response.json({ error: error.message }, { status: 502 });
        }
        return Response.json(data, { status: 201 });
      },
    },
  },
});
