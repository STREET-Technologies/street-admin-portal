import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
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
import { formatDate } from "@/lib/format-utils";
import { useRetailersQuery } from "../api/retailer-queries";
import type { RetailerStatusFilter, RetailerViewModel } from "../types";

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
        {formatDate(row.original.createdAt)}
      </span>
    ),
    enableSorting: true,
  },
];

// ---------------------------------------------------------------------------
// RetailerListPage
// ---------------------------------------------------------------------------

export function RetailerListPage() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<RetailerStatusFilter | "all">(
    "all",
  );
  const debouncedSearch = useDebounce(searchValue, 300);

  const { pagination, sorting, onPaginationChange, onSortingChange, searchParams } =
    useTableParams({ pageSize: 20, sortBy: "createdAt", sortOrder: "desc" });

  // Reset to page 1 when search or filter changes (skip initial render so a
  // bookmarked ?page=N URL survives).
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onPaginationChange({ pageIndex: 0, pageSize: pagination.pageSize });
  }, [debouncedSearch, statusFilter, onPaginationChange, pagination.pageSize]);

  // Search, status filter, sorting, and pagination are all server-side.
  const { data, isLoading, isError, refetch } = useRetailersQuery({
    name: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder,
    page: searchParams.page,
    limit: searchParams.limit,
  });

  const retailers = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 0;

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
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as RetailerStatusFilter | "all")
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="uninstalled">Uninstalled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={retailers}
        pageCount={totalPages}
        totalItems={data?.meta.total}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={onPaginationChange}
        sorting={sorting}
        onSortingChange={onSortingChange}
        isLoading={isLoading}
        emptyMessage="No retailers found"
        emptyIcon={Store}
        onRowClick={(retailer) => {
          void navigate({
            to: "/retailers/$retailerId",
            params: { retailerId: retailer.id },
          });
        }}
      />
    </div>
  );
}
