import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Search, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/DataTable";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CopyButton } from "@/components/shared/CopyButton";
import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorState } from "@/components/shared/ErrorState";
import { useTableParams } from "@/hooks/use-table-params";
import { useDebounce } from "@/hooks/use-debounce";
import { useRetailersQuery } from "../api/retailer-queries";
import type { RetailerViewModel } from "../types";

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const columns: ColumnDef<RetailerViewModel, unknown>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const retailer = row.original;
      return (
        <Link
          to="/retailers/$retailerId"
          params={{ retailerId: retailer.id }}
          className="font-medium hover:underline"
        >
          {retailer.name}
        </Link>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const email = row.original.email;
      if (!email) return <span className="text-muted-foreground">--</span>;
      return (
        <div className="group/email flex items-center gap-1">
          <span className="text-sm">{email}</span>
          <span className="opacity-0 transition-opacity group-hover/email:opacity-100">
            <CopyButton value={email} label="Copy email" />
          </span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.original.phone;
      if (!phone) return <span className="text-muted-foreground">--</span>;
      return (
        <div className="group/phone flex items-center gap-1">
          <span className="text-sm">{phone}</span>
          <span className="opacity-0 transition-opacity group-hover/phone:opacity-100">
            <CopyButton value={phone} label="Copy phone" />
          </span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.category}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" />,
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </span>
    ),
    enableSorting: true,
  },
];

// ---------------------------------------------------------------------------
// RetailerListPage
// ---------------------------------------------------------------------------

export function RetailerListPage() {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(searchValue, 300);

  const { pagination, sorting, onPaginationChange, onSortingChange, searchParams } =
    useTableParams({ pageSize: 20, sortBy: "createdAt", sortOrder: "desc" });

  const { data, isLoading, isError, refetch } = useRetailersQuery({
    name: debouncedSearch || undefined,
    page: searchParams.page,
    limit: searchParams.limit,
  });

  const retailers = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 0;

  // Client-side status filter (backend has no status filter param)
  const filteredRetailers = useMemo(() => {
    if (statusFilter === "all") return retailers;
    return retailers.filter((r) => r.status === statusFilter);
  }, [retailers, statusFilter]);

  // Client-side sort (backend has no sorting params)
  const sortedRetailers = useMemo(() => {
    if (sorting.length === 0) return filteredRetailers;
    const [sort] = sorting;
    const key = sort.id as keyof RetailerViewModel;
    return [...filteredRetailers].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal));
      return sort.desc ? -cmp : cmp;
    });
  }, [filteredRetailers, sorting]);

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Retailers" description="Manage retailer accounts" />
        <ErrorState
          title="Failed to load retailers"
          message="There was a problem fetching the retailer list. Please try again."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Retailers" description="Manage retailer accounts" />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search retailers..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={sortedRetailers}
        pageCount={totalPages}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={onPaginationChange}
        sorting={sorting}
        onSortingChange={onSortingChange}
        isLoading={isLoading}
        emptyMessage="No retailers found"
        emptyIcon={Store}
      />
    </div>
  );
}
