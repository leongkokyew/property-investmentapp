CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_code TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  area TEXT,
  state TEXT,
  property_type TEXT NOT NULL CHECK (property_type IN ('residential', 'commercial')),
  purchase_price NUMERIC NOT NULL,
  purchase_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'sold', 'vacant')),
  n3_project_code TEXT,
  n3_parent_project_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.tenancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_code TEXT NOT NULL,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_name TEXT NOT NULL,
  tenant_type TEXT CHECK (tenant_type IN ('individual', 'company')),
  tenant_ic_or_reg TEXT,
  monthly_rent NUMERIC NOT NULL,
  tenancy_start DATE NOT NULL,
  tenancy_end DATE NOT NULL,
  tenancy_status TEXT NOT NULL CHECK (tenancy_status IN ('active', 'expired', 'terminated')),
  invoice_status TEXT NOT NULL CHECK (invoice_status IN ('issued', 'not_issued')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('paid', 'partial', 'unpaid', 'na')),
  einvoice_status TEXT NOT NULL CHECK (einvoice_status IN ('valid', 'pending', 'selfbill', 'na')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

GRANT ALL ON public.tenancies TO service_role;
ALTER TABLE public.tenancies ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS one_active_tenancy_per_property
ON public.tenancies(property_id)
WHERE tenancy_status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS unique_project_per_tenant
ON public.properties(tenant_code, n3_project_code)
WHERE n3_project_code IS NOT NULL;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();