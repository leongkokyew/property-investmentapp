import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PropertyForm } from "@/components/property-form";
import { TenancyForm } from "@/components/tenancy-form";
import {
  EinvoiceStatusBadge,
  InvoiceStatusBadge,
  PaymentStatusBadge,
  TenancyStatusBadge,
} from "@/components/status-badge";
import { useData } from "@/lib/data/store";
import { formatDate, formatMYR } from "@/lib/format";
import type { Tenancy } from "@/lib/data/types";
import { toast } from "sonner";

export const Route = createFileRoute("/properties/$id")({
  head: () => ({
    meta: [
      { title: "Property · Property Investment Manager" },
      {
        name: "description",
        content:
          "View and edit a property, its tenancies, invoice status, payment status and e-invoice status.",
      },
    ],
  }),
  component: PropertyDetailPage,
  notFoundComponent: () => (
    <div className="p-8 text-center text-muted-foreground">
      Property not found.{" "}
      <Link to="/" className="underline">
        Back to list
      </Link>
    </div>
  ),
});

function PropertyDetailPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const {
    getProperty,
    getTenancies,
    updateProperty,
    createTenancy,
    updateTenancy,
  } = useData();

  const property = getProperty(id);
  const [editingTenancy, setEditingTenancy] = useState<Tenancy | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  if (!property) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-muted-foreground">
          Property not found.{" "}
          <Link to="/" className="underline">
            Back to list
          </Link>
        </p>
      </div>
    );
  }

  const tenancies = getTenancies(property.id);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.navigate({ to: "/" })}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Properties
          </Button>
          <div className="ml-2 border-l pl-3">
            <h1 className="text-base font-semibold leading-tight">
              {property.name}
            </h1>
            <p className="text-xs text-muted-foreground">
              {property.area}, {property.state}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Property details</CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyForm
              initial={property}
              submitLabel="Save changes"
              onSubmit={(data) => {
                updateProperty(property.id, data);
                toast.success("Property updated");
              }}
            />
          </CardContent>
        </Card>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold">Tenancies</h2>
              <p className="text-sm text-muted-foreground">
                {tenancies.length} on record · past and current
              </p>
            </div>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" /> Add tenancy
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add tenancy</DialogTitle>
                </DialogHeader>
                <TenancyForm
                  propertyId={property.id}
                  onSubmit={(data) => {
                    try {
                      createTenancy(data);
                      toast.success("Tenancy created");
                      setAddOpen(false);
                    } catch (e) {
                      toast.error(
                        e instanceof Error ? e.message : "Failed to create",
                      );
                    }
                  }}
                  onCancel={() => setAddOpen(false)}
                  submitLabel="Add tenancy"
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-3">
            {tenancies.length === 0 && (
              <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
                No tenancies yet for this property.
              </div>
            )}
            {tenancies.map((t) => (
              <button
                key={t.id}
                onClick={() => setEditingTenancy(t)}
                className="grid gap-3 rounded-lg border bg-card p-4 text-left transition hover:bg-muted/40"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <div className="font-medium">{t.tenant_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.tenant_type === "company" ? "Company" : "Individual"} ·{" "}
                      {t.tenant_ic_or_reg || "—"}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold tabular-nums">
                      {formatMYR(t.monthly_rent)}
                    </span>
                    <span className="text-muted-foreground"> /mo</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(t.tenancy_start)} → {formatDate(t.tenancy_end)}
                </div>
                <div className="flex flex-wrap gap-2">
                  <TenancyStatusBadge value={t.tenancy_status} />
                  <InvoiceStatusBadge value={t.invoice_status} />
                  <PaymentStatusBadge value={t.payment_status} />
                  <EinvoiceStatusBadge value={t.einvoice_status} />
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      <Dialog
        open={editingTenancy !== null}
        onOpenChange={(o) => !o && setEditingTenancy(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit tenancy</DialogTitle>
          </DialogHeader>
          {editingTenancy && (
            <TenancyForm
              propertyId={property.id}
              initial={editingTenancy}
              onSubmit={(data) => {
                try {
                  updateTenancy(editingTenancy.id, data);
                  toast.success("Tenancy updated");
                  setEditingTenancy(null);
                } catch (e) {
                  toast.error(
                    e instanceof Error ? e.message : "Failed to update",
                  );
                }
              }}
              onCancel={() => setEditingTenancy(null)}
              submitLabel="Save changes"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
