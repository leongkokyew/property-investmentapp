import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NewTenancy, Tenancy } from "@/lib/data/types";

interface Props {
  propertyId: string;
  initial?: Tenancy;
  onSubmit: (data: NewTenancy) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

function emptyTenancy(propertyId: string): NewTenancy {
  const today = new Date().toISOString().slice(0, 10);
  return {
    property_id: propertyId,
    tenant_name: "",
    tenant_type: "individual",
    tenant_ic_or_reg: "",
    monthly_rent: 0,
    tenancy_start: today,
    tenancy_end: today,
    tenancy_status: "active",
    invoice_status: "not_issued",
    payment_status: "unpaid",
    einvoice_status: "pending",
    notes: "",
  };
}

export function TenancyForm({
  propertyId,
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: Props) {
  const [form, setForm] = useState<NewTenancy>(
    initial ? { ...initial } : emptyTenancy(propertyId),
  );
  const set = <K extends keyof NewTenancy>(k: K, v: NewTenancy[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tname">Tenant name</Label>
          <Input
            id="tname"
            value={form.tenant_name}
            onChange={(e) => set("tenant_name", e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Tenant type</Label>
          <Select
            value={form.tenant_type}
            onValueChange={(v) =>
              set("tenant_type", v as NewTenancy["tenant_type"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="company">Company</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="ic">IC / Reg number</Label>
          <Input
            id="ic"
            value={form.tenant_ic_or_reg}
            onChange={(e) => set("tenant_ic_or_reg", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="rent">Monthly rent (RM)</Label>
          <Input
            id="rent"
            type="number"
            min={0}
            value={form.monthly_rent}
            onChange={(e) => set("monthly_rent", Number(e.target.value))}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tstart">Tenancy start</Label>
          <Input
            id="tstart"
            type="date"
            value={form.tenancy_start}
            onChange={(e) => set("tenancy_start", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="tend">Tenancy end</Label>
          <Input
            id="tend"
            type="date"
            value={form.tenancy_end}
            onChange={(e) => set("tenancy_end", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Tenancy status</Label>
          <Select
            value={form.tenancy_status}
            onValueChange={(v) =>
              set("tenancy_status", v as NewTenancy["tenancy_status"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Invoice status</Label>
          <Select
            value={form.invoice_status}
            onValueChange={(v) =>
              set("invoice_status", v as NewTenancy["invoice_status"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="issued">Issued</SelectItem>
              <SelectItem value="not_issued">Not issued</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Payment status</Label>
          <Select
            value={form.payment_status}
            onValueChange={(v) =>
              set("payment_status", v as NewTenancy["payment_status"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="na">N/A</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>e-Invoice status</Label>
          <Select
            value={form.einvoice_status}
            onValueChange={(v) =>
              set("einvoice_status", v as NewTenancy["einvoice_status"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="valid">Valid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="selfbill">Self-bill</SelectItem>
              <SelectItem value="na">N/A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="tnotes">Notes</Label>
        <Textarea
          id="tnotes"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
