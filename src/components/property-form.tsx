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
import type { NewProperty, Property } from "@/lib/data/types";

interface Props {
  initial?: Property;
  onSubmit: (data: NewProperty) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

const emptyProperty: NewProperty = {
  name: "",
  address: "",
  area: "",
  state: "",
  property_type: "residential",
  purchase_price: 0,
  purchase_date: new Date().toISOString().slice(0, 10),
  status: "active",
  n3_project_code: "",
  notes: "",
};

export function PropertyForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: Props) {
  const [form, setForm] = useState<NewProperty>(
    initial ? { ...initial } : emptyProperty,
  );

  const set = <K extends keyof NewProperty>(k: K, v: NewProperty[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="area">Area</Label>
          <Input
            id="area"
            value={form.area}
            onChange={(e) => set("area", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={form.state}
            onChange={(e) => set("state", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Property type</Label>
          <Select
            value={form.property_type}
            onValueChange={(v) =>
              set("property_type", v as NewProperty["property_type"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) => set("status", v as NewProperty["status"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="vacant">Vacant</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="price">Purchase price (RM)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            value={form.purchase_price}
            onChange={(e) => set("purchase_price", Number(e.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="pdate">Purchase date</Label>
          <Input
            id="pdate"
            type="date"
            value={form.purchase_date}
            onChange={(e) => set("purchase_date", e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="n3code">N3 Project Code</Label>
        <Input
          id="n3code"
          value={form.n3_project_code ?? ""}
          onChange={(e) => set("n3_project_code", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Link to N3 Child Project. Set once — do not change after saving.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
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
