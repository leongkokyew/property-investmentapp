import type {
  EinvoiceStatus,
  InvoiceStatus,
  PaymentStatus,
  TenancyStatus,
} from "@/lib/data/types";

type Tone = "green" | "amber" | "red" | "blue" | "grey";

const toneClass: Record<Tone, string> = {
  green:
    "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-800",
  amber:
    "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800",
  red: "bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-800",
  blue: "bg-sky-100 text-sky-800 border border-sky-200 dark:bg-sky-900/40 dark:text-sky-200 dark:border-sky-800",
  grey: "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
};

const tenancyTone: Record<TenancyStatus, Tone> = {
  active: "green",
  expired: "amber",
  terminated: "red",
};
const invoiceTone: Record<InvoiceStatus, Tone> = {
  issued: "blue",
  not_issued: "grey",
};
const paymentTone: Record<PaymentStatus, Tone> = {
  paid: "green",
  partial: "amber",
  unpaid: "red",
  na: "grey",
};
const einvoiceTone: Record<EinvoiceStatus, Tone> = {
  valid: "green",
  pending: "amber",
  selfbill: "red",
  na: "grey",
};

const labelMap: Record<string, string> = {
  not_issued: "not issued",
  selfbill: "self-bill",
  na: "n/a",
};

function label(v: string) {
  return labelMap[v] ?? v;
}

function Pill({
  tone,
  prefix,
  value,
}: {
  tone: Tone;
  prefix: string;
  value: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${toneClass[tone]}`}
    >
      <span className="opacity-60 font-normal">{prefix}</span>
      <span className="capitalize">{label(value)}</span>
    </span>
  );
}

export function TenancyStatusBadge({ value }: { value: TenancyStatus }) {
  return <Pill tone={tenancyTone[value]} prefix="Tenancy" value={value} />;
}
export function InvoiceStatusBadge({ value }: { value: InvoiceStatus }) {
  return <Pill tone={invoiceTone[value]} prefix="Invoice" value={value} />;
}
export function PaymentStatusBadge({ value }: { value: PaymentStatus }) {
  return <Pill tone={paymentTone[value]} prefix="Payment" value={value} />;
}
export function EinvoiceStatusBadge({ value }: { value: EinvoiceStatus }) {
  return <Pill tone={einvoiceTone[value]} prefix="e-Invoice" value={value} />;
}

export function PropertyStatusBadge({
  value,
}: {
  value: "active" | "sold" | "vacant";
}) {
  const tone: Tone =
    value === "active" ? "green" : value === "vacant" ? "amber" : "grey";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${toneClass[tone]}`}
    >
      {value}
    </span>
  );
}
