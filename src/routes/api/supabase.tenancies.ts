import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase.server";
import { getTenantAuth } from "@/lib/auth/tenant.server";

const ALLOWED_FIELDS = [
  "property_id",
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

async function ownsProperty(propertyId: string, tenantCode: string) {
  const { data } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("tenant_code", tenantCode)
    .maybeSingle();
  return !!data;
}

export const Route = createFileRoute("/api/supabase/tenancies")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const check = getTenantAuth(request);
        if (!check.ok) return check.response;
        const url = new URL(request.url);
        const propertyId = url.searchParams.get("propertyId");
        if (!propertyId) {
          return Response.json(
            { error: "Missing propertyId query param" },
            { status: 400 },
          );
        }
        if (!(await ownsProperty(propertyId, check.auth.tenantCode))) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }
        const { data, error } = await supabase
          .from("tenancies")
          .select("*")
          .eq("property_id", propertyId)
          .eq("tenant_code", check.auth.tenantCode)
          .order("tenancy_start", { ascending: false });
        if (error) return Response.json({ error: error.message }, { status: 502 });
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
        const row = pick(body);
        const propertyId = row.property_id as string | undefined;
        if (!propertyId) {
          return Response.json({ error: "Missing property_id" }, { status: 400 });
        }
        if (!(await ownsProperty(propertyId, check.auth.tenantCode))) {
          return Response.json({ error: "Property not found" }, { status: 404 });
        }
        const insertRow = { ...row, tenant_code: check.auth.tenantCode };
        const { data, error } = await supabase
          .from("tenancies")
          .insert(insertRow)
          .select()
          .single();
        if (error) return Response.json({ error: error.message }, { status: 502 });
        return Response.json(data, { status: 201 });
      },
      DELETE: async ({ request }) => {
        const check = getTenantAuth(request);
        if (!check.ok) return check.response;
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        const propertyId = url.searchParams.get("propertyId");
        if (!id || !propertyId)
          return Response.json({ error: "Missing id or propertyId" }, { status: 400 });
        if (!(await ownsProperty(propertyId, check.auth.tenantCode)))
          return Response.json({ error: "Not found" }, { status: 404 });
        const { error } = await supabase.from("tenancies").delete()
          .eq("id", id).eq("tenant_code", check.auth.tenantCode);
        if (error) return Response.json({ error: error.message }, { status: 502 });
        return new Response(null, { status: 204 });
      },
    },
  },
});
