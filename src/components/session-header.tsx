import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/session";

export function SessionHeader() {
  const { info, clear } = useSession();
  if (!info) return null;

  return (
    <div className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-2 text-xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-medium text-foreground">
            {info.companyName || "—"}
          </span>
          <span className="text-muted-foreground">
            Tenant:{" "}
            <span className="font-mono text-foreground">
              {info.tenantCode || "—"}
            </span>
          </span>
          <span className="text-muted-foreground">{info.email || "—"}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clear}
          className="h-7 px-2 text-xs text-muted-foreground"
        >
          <LogOut className="mr-1 h-3 w-3" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
