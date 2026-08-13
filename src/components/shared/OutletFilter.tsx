import { Store } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRetailerOutletsQuery } from "@/features/retailers/api/retailer-queries";

interface OutletFilterProps {
  /** Only rendered once a retailer is chosen — outlets belong to one. */
  retailerId: string | undefined;
  value: string | undefined;
  onChange: (outletId: string | undefined) => void;
}

/**
 * Outlet (branch) filter for the orders list (TT-450).
 *
 * Deliberately conditional: without a retailer selected it would list every
 * branch on the platform, which is noise, and picking one would implicitly
 * filter the retailer anyway. It also stays hidden for single-outlet
 * retailers, where the only choice it could offer is the one already implied.
 */
export function OutletFilter({
  retailerId,
  value,
  onChange,
}: OutletFilterProps) {
  const { data: outlets = [] } = useRetailerOutletsQuery(retailerId ?? "");

  // Nothing to choose between — a lone outlet adds a control that can only
  // restate the retailer filter.
  if (!retailerId || outlets.length < 2) return null;

  return (
    <Select
      value={value ?? "all"}
      onValueChange={(next) => onChange(next === "all" ? undefined : next)}
    >
      <SelectTrigger className="w-[180px]">
        <span className="flex min-w-0 items-center gap-2">
          <Store className="size-3.5 shrink-0 text-muted-foreground" />
          <SelectValue placeholder="All outlets" />
        </span>
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value="all">All outlets</SelectItem>
        {outlets.map((outlet) => (
          <SelectItem key={outlet.id} value={outlet.id}>
            {outlet.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
