import { lazy, Suspense, useState } from "react";
import type { DateRange } from "react-day-picker";
import { CalendarDays, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * react-day-picker is ~25 kB gzipped and the app ships as a single chunk, so
 * loading it eagerly taxes every page for a control most visits never open.
 * Deferring it to the first open keeps it off the initial bundle; the presets
 * above cover the common cases without ever pulling it in.
 */
const Calendar = lazy(() =>
  import("@/components/ui/calendar").then((m) => ({ default: m.Calendar })),
);
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useSearchParamState } from "@/hooks/use-search-param";
import { toISODate, fromISODate } from "@/lib/date-range-params";

function formatLabel(from: Date | undefined, to: Date | undefined): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  if (from && to) {
    return from.getTime() === to.getTime()
      ? fmt(from)
      : `${fmt(from)} – ${fmt(to)}`;
  }
  if (from) return `From ${fmt(from)}`;
  if (to) return `Until ${fmt(to)}`;
  return "Any date";
}

/** Ranges support actually asks for, relative to today. */
const PRESETS: { label: string; days: number }[] = [
  { label: "Today", days: 0 },
  { label: "Last 7 days", days: 6 },
  { label: "Last 30 days", days: 29 },
];

interface DateRangeFilterProps {
  /** Called after the range changes so the caller can reset to page 1. */
  onChange?: () => void;
}

/**
 * Date-range filter backed by URL params (TT-447).
 *
 * Lives in the URL rather than local state so a filtered view survives a
 * reload and can be pasted to a colleague — the point of a support tool.
 */
export function DateRangeFilter({ onChange }: DateRangeFilterProps) {
  const [dateFrom, setDateFrom] = useSearchParamState("dateFrom");
  const [dateTo, setDateTo] = useSearchParamState("dateTo");
  const [open, setOpen] = useState(false);

  const from = fromISODate(dateFrom);
  const to = fromISODate(dateTo);
  const hasRange = Boolean(from || to);

  function apply(next: DateRange | undefined) {
    setDateFrom(next?.from ? toISODate(next.from) : undefined);
    // A half-picked range (from only) is a valid state mid-interaction —
    // don't invent an end date the user has not chosen.
    setDateTo(next?.to ? toISODate(next.to) : undefined);
    onChange?.();
  }

  function applyPreset(days: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setDateFrom(toISODate(start));
    setDateTo(toISODate(end));
    onChange?.();
    setOpen(false);
  }

  function clear() {
    setDateFrom(undefined);
    setDateTo(undefined);
    onChange?.();
    setOpen(false);
  }

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`h-9 justify-start font-normal ${
              hasRange ? "" : "text-muted-foreground"
            }`}
          >
            <CalendarDays className="mr-2 size-3.5" />
            {formatLabel(from, to)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-wrap gap-1 p-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="h-7 text-xs font-normal"
                onClick={() => applyPreset(preset.days)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <Separator />
          <Suspense
            fallback={
              <div className="p-3">
                <Skeleton className="h-[17rem] w-[15rem]" />
              </div>
            }
          >
            <Calendar
              mode="range"
              selected={{ from, to }}
              onSelect={apply}
              defaultMonth={from ?? new Date()}
              autoFocus
              // Orders cannot be placed in the future; offering those days
              // only invites an empty result.
              disabled={{ after: new Date() }}
            />
          </Suspense>
        </PopoverContent>
      </Popover>

      {hasRange && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={clear}
          aria-label="Clear date filter"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
