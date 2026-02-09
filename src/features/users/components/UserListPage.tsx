import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CopyButton } from "@/components/shared/CopyButton";
import { ErrorState } from "@/components/shared/ErrorState";
import { useTableParams } from "@/hooks/use-table-params";
import { useUsersQuery } from "../api/user-queries";
import type { UserViewModel } from "../types";

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

function createColumns(
  onRowClick: (userId: string) => void,
): ColumnDef<UserViewModel, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <button
            type="button"
            className="flex items-center gap-3 text-left hover:underline"
            onClick={() => onRowClick(user.id)}
          >
            <Avatar size="sm">
              {user.avatarUrl && (
                <AvatarImage src={user.avatarUrl} alt={user.name} />
              )}
              <AvatarFallback>
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{user.name}</span>
            {user.isTestAccount && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                TEST
              </span>
            )}
          </button>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => {
        const email = row.original.email;
        if (email === "No email") {
          return (
            <span className="text-muted-foreground">{email}</span>
          );
        }
        return (
          <div className="group/email flex items-center gap-1">
            <span className="text-sm">{email}</span>
            <span className="opacity-0 transition-opacity group-hover/email:opacity-100">
              <CopyButton value={email} label="Copy email" />
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => {
        const phone = row.original.phone;
        if (phone === "No phone") {
          return (
            <span className="text-muted-foreground">{phone}</span>
          );
        }
        return (
          <div className="group/phone flex items-center gap-1">
            <span className="text-sm">{phone}</span>
            <span className="opacity-0 transition-opacity group-hover/phone:opacity-100">
              <CopyButton value={phone} label="Copy phone" />
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" />,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <span className="text-sm text-muted-foreground">
            {date.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UserListPage() {
  const navigate = useNavigate();
  const { pagination, sorting, onPaginationChange, onSortingChange, searchParams } =
    useTableParams({ pageSize: 20, sortBy: "createdAt", sortOrder: "desc" });

  // Debounced search input
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch users
  const { data, isLoading, isError, error, refetch } = useUsersQuery({
    search: debouncedSearch || undefined,
    page: searchParams.page,
    limit: searchParams.limit,
  });

  const users = data?.data ?? [];
  const pageCount = data?.meta?.totalPages ?? 0;

  // Client-side sort (backend has no sorting params)
  const sortedUsers = useMemo(() => {
    if (sorting.length === 0) return users;
    const [sort] = sorting;
    const key = sort.id as keyof UserViewModel;
    return [...users].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal));
      return sort.desc ? -cmp : cmp;
    });
  }, [users, sorting]);

  const columns = useMemo(
    () =>
      createColumns((userId) => {
        void navigate({ to: "/users/$userId", params: { userId } });
      }),
    [navigate],
  );

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Users" description="Manage user accounts" />
        <ErrorState
          title="Failed to load users"
          message={error instanceof Error ? error.message : "An unexpected error occurred"}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage user accounts" />

      {/* Search bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users by name, email, or phone..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={sortedUsers}
        pageCount={pageCount}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={onPaginationChange}
        sorting={sorting}
        onSortingChange={onSortingChange}
        isLoading={isLoading}
        emptyMessage="No users found"
        emptyIcon={Users}
      />
    </div>
  );
}
