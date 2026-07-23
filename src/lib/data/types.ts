export type PropertyType = "residential" | "commercial";
export type PropertyStatus = "active" | "sold" | "vacant";

export type TenantType = "individual" | "company";
export type TenancyStatus = "active" | "expired" | "terminated";
export type InvoiceStatus = "issued" | "not_issued";
export type PaymentStatus = "paid" | "partial" | "unpaid" | "na";
export type EinvoiceStatus = "valid" | "pending" | "selfbill" | "na";

export interface Property {
  id: string;
  /** N3 tenant code that owns this row. Replaces user_id scoping. */
  tenant_code: string;
  name: string;
  address: string;
  area: string;
  state: string;
  property_type: PropertyType;
  purchase_price: number;
  purchase_date: string; // ISO date
  status: PropertyStatus;
  n3_project_code?: string;
  n3_parent_project_code?: string;
  created_at?: string;
  updated_at?: string;
  notes: string;
}

export interface Tenancy {
  id: string;
  /** N3 tenant code that owns this row. Replaces user_id scoping. */
  tenant_code: string;
  property_id: string;
  tenant_name: string;
  tenant_type: TenantType;
  tenant_ic_or_reg: string;
  monthly_rent: number;
  tenancy_start: string;
  tenancy_end: string;
  tenancy_status: TenancyStatus;
  invoice_status: InvoiceStatus;
  payment_status: PaymentStatus;
  einvoice_status: EinvoiceStatus;
  notes: string;
}

export type NewProperty = Omit<Property, "id" | "tenant_code">;
export type NewTenancy = Omit<Tenancy, "id" | "tenant_code">;

