export type PropertyType = "residential" | "commercial";
export type PropertyStatus = "active" | "sold" | "vacant";

export type TenantType = "individual" | "company";
export type TenancyStatus = "active" | "expired" | "terminated";
export type InvoiceStatus = "issued" | "not_issued";
export type PaymentStatus = "paid" | "partial" | "unpaid" | "na";
export type EinvoiceStatus = "valid" | "pending" | "selfbill" | "na";

export interface Property {
  id: string;
  name: string;
  address: string;
  area: string;
  state: string;
  property_type: PropertyType;
  purchase_price: number;
  purchase_date: string; // ISO date
  status: PropertyStatus;
  notes: string;
}

export interface Tenancy {
  id: string;
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

export type NewProperty = Omit<Property, "id">;
export type NewTenancy = Omit<Tenancy, "id">;
