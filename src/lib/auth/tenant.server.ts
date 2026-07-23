/**
 * Server-only helper: extract tenant_code from an N3 JWT
 * carried in the incoming Authorization: Bearer <jwt> header.
 */
export interface TenantAuth {
  token: string;
  tenantCode: string;
}

export function getTenantAuth(request: Request):
  | { ok: true; auth: TenantAuth }
  | { ok: false; response: Response } {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return {
      ok: false,
      response: Response.json({ error: "Missing Bearer token" }, { status: 401 }),
    };
  }
  const token = match[1].trim();
  const parts = token.split(".");
  if (parts.length < 2) {
    return {
      ok: false,
      response: Response.json({ error: "Invalid JWT" }, { status: 401 }),
    };
  }
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "===".slice((b64.length + 3) % 4);
    const payload = JSON.parse(
      typeof atob !== "undefined"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf8"),
    );
    const tenantCode = payload.tenantCode ?? payload.tenant_code;
    if (!tenantCode || typeof tenantCode !== "string") {
      return {
        ok: false,
        response: Response.json(
          { error: "JWT missing tenantCode" },
          { status: 401 },
        ),
      };
    }
    return { ok: true, auth: { token, tenantCode } };
  } catch {
    return {
      ok: false,
      response: Response.json({ error: "Malformed JWT" }, { status: 401 }),
    };
  }
}
