import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PropertyForm } from "@/components/property-form";
import { PropertyStatusBadge } from "@/components/status-badge";
import { useData } from "@/lib/data/store";
import { formatMYR } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Properties · Property Investment Manager" },
      {
        name: "description",
        content:
          "Manage your property investment portfolio: track properties, tenancies, invoices and payments alongside QNE N3 accounting.",
      },
      { property: "og:title", content: "Properties · Property Investment Manager" },
      {
        property: "og:description",
        content:
          "Manage your property investment portfolio: track properties, tenancies, invoices and payments alongside QNE N3 accounting.",
      },
    ],
  }),
  component: PropertyListPage,
});

function PropertyListPage() {
  const { properties, createProperty } = useData();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">
                Property Investment Manager
              </h1>
              <p className="text-xs text-muted-foreground">
                Portfolio module · alongside QNE N3 accounting
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Properties</h2>
            <p className="text-sm text-muted-foreground">
              {properties.length}{" "}
              {properties.length === 1 ? "property" : "properties"} in your
              portfolio
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 h-4 w-4" /> Add property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add property</DialogTitle>
              </DialogHeader>
              <PropertyForm
                onSubmit={(data) => {
                  createProperty(data);
                  setOpen(false);
                }}
                onCancel={() => setOpen(false)}
                submitLabel="Add property"
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Purchase price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No properties yet. Add your first one to get started.
                  </TableCell>
                </TableRow>
              )}
              {properties.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">
                    <Link
                      to="/properties/$id"
                      params={{ id: p.id }}
                      className="block"
                    >
                      {p.name}
                      <div className="text-xs font-normal text-muted-foreground">
                        {p.address}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to="/properties/$id" params={{ id: p.id }}>
                      {p.area}
                      <div className="text-xs text-muted-foreground">
                        {p.state}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="capitalize">
                    <Link to="/properties/$id" params={{ id: p.id }}>
                      {p.property_type}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to="/properties/$id" params={{ id: p.id }}>
                      <PropertyStatusBadge value={p.status} />
                    </Link>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Link to="/properties/$id" params={{ id: p.id }}>
                      {formatMYR(p.purchase_price)}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
