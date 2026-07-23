import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase.server";
import { getTenantAuth } from "@/lib/auth/tenant.server";

const ALLOWED_FIELDS = [
  "tenant_name",
  "tenant_type",
  "tenant_ic_or_reg",
  "monthly_rent",
  "tenancy_start",
  "tenancy_end",
  "tenancy_status",
  "invoice_status",
  "payment_status",
  "einvoice_status",
  "notes",
] as const;

function pick(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const k of ALLOWED_FIELDS) {
    if (k in body) out[k] = body[k];
  }
  return out;
}

export const Route = createFileRoute("/api/supabase/tenancies/$id")({
  server: {
    handlers: {
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
          .from("tenancies")
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
