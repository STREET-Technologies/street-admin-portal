import { useState } from "react";
import { Check, ChevronsUpDown, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRetailersQuery } from "@/features/retailers/api/retailer-queries";

interface RetailerFilterProps {
  value: string | undefined;
  onChange: (retailerId: string | undefined) => void;
}

/**
 * Retailer picker for the orders list (TT-448).
 *
 * A searchable combobox rather than a plain select: staging has 11 retailers
 * because they are dev stores, but production is expected to carry far more,
 * and a select becomes unusable well before that. Typing filters the list, so
 * it holds up at either size.
 */
export function RetailerFilter({ value, onChange }: RetailerFilterProps) {
  const [open, setOpen] = useState(false);
  // One page covers the roster today. If it ever exceeds this the picker
  // should search server-side rather than raise the limit again.
  const { data, isLoading } = useRetailersQuery({ limit: 100 });
  const retailers = data?.data ?? [];
  const selected = retailers.find((r) => r.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`h-9 w-[200px] justify-between font-normal ${
            selected ? "" : "text-muted-foreground"
          }`}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Store className="size-3.5 shrink-0" />
            <span className="truncate">
              {selected?.name ?? "All retailers"}
            </span>
          </span>
          <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search retailers..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading retailers..." : "No retailer found."}
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="All retailers"
                onSelect={() => {
                  onChange(undefined);
                  setOpen(false);
                }}
              >
                <Check
                  className={`mr-2 size-3.5 ${value ? "opacity-0" : "opacity-100"}`}
                />
                All retailers
              </CommandItem>
              {retailers.map((retailer) => (
                <CommandItem
                  // Search matches on the name, not the UUID nobody types.
                  key={retailer.id}
                  value={retailer.name}
                  onSelect={() => {
                    onChange(retailer.id === value ? undefined : retailer.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={`mr-2 size-3.5 ${
                      value === retailer.id ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <span className="truncate">{retailer.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
