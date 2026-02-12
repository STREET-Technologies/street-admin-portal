import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, User, Store, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useDebounce } from "@/hooks/use-debounce";
import { useGlobalSearchQuery } from "../api/search-queries";
import type { SearchResultItem } from "../api/search-api";

// ---------------------------------------------------------------------------
// Icons by entity type
// ---------------------------------------------------------------------------

const typeIcons = {
  user: User,
  retailer: Store,
  order: ShoppingCart,
} as const;

// ---------------------------------------------------------------------------
// GlobalSearch
// ---------------------------------------------------------------------------

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();

  const { data, isLoading } = useGlobalSearchQuery(debouncedQuery);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Clear query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      setOpen(false);
      void navigate({ to: item.href });
    },
    [navigate],
  );

  const hasResults =
    data &&
    (data.users.length > 0 ||
      data.retailers.length > 0 ||
      data.orders.length > 0);

  return (
    <>
      {/* Trigger button */}
      <Button
        variant="outline"
        size="sm"
        className="relative h-8 w-48 justify-start text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 size-3.5" />
        Search...
        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Command palette dialog */}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search users, retailers, and orders"
      >
        <CommandInput
          placeholder="Search users, retailers, orders..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {debouncedQuery.length >= 2 && !isLoading && !hasResults && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}

          {isLoading && debouncedQuery.length >= 2 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}

          {data?.users && data.users.length > 0 && (
            <CommandGroup heading="Users">
              {data.users.map((item) => (
                <SearchResultRow
                  key={item.id}
                  item={item}
                  onSelect={handleSelect}
                />
              ))}
            </CommandGroup>
          )}

          {data?.retailers && data.retailers.length > 0 && (
            <CommandGroup heading="Retailers">
              {data.retailers.map((item) => (
                <SearchResultRow
                  key={item.id}
                  item={item}
                  onSelect={handleSelect}
                />
              ))}
            </CommandGroup>
          )}

          {data?.orders && data.orders.length > 0 && (
            <CommandGroup heading="Orders">
              {data.orders.map((item) => (
                <SearchResultRow
                  key={item.id}
                  item={item}
                  onSelect={handleSelect}
                />
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// SearchResultRow
// ---------------------------------------------------------------------------

function SearchResultRow({
  item,
  onSelect,
}: {
  item: SearchResultItem;
  onSelect: (item: SearchResultItem) => void;
}) {
  const Icon = typeIcons[item.type];

  return (
    <CommandItem
      value={`${item.type}-${item.id}-${item.title}`}
      onSelect={() => onSelect(item)}
      className="flex items-center gap-3"
    >
      {item.avatarUrl ? (
        <Avatar size="sm">
          <AvatarImage src={item.avatarUrl} alt={item.title} />
          <AvatarFallback>
            {item.title.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="flex size-8 items-center justify-center rounded-full bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {item.subtitle}
        </p>
      </div>
      {item.status && <StatusBadge status={item.status} size="sm" />}
    </CommandItem>
  );
}
