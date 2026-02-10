import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Search, Ticket, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CopyButton } from "@/components/shared/CopyButton";
import { ErrorState } from "@/components/shared/ErrorState";
import { useTableParams } from "@/hooks/use-table-params";
import {
  useReferralCodesQuery,
  useToggleReferralCodeMutation,
} from "../api/referral-queries";
import type { ReferralCodeViewModel } from "../types";
import { CreatePromotionalCodeDialog } from "./CreatePromotionalCodeDialog";

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

function createColumns(
  onRowClick: (id: string) => void,
  onToggleActive: (id: string, isActive: boolean) => void,
): ColumnDef<ReferralCodeViewModel, unknown>[] {
  return [
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => {
        const code = row.original;
        return (
          <div className="group/code flex items-center gap-2">
            <button
              type="button"
              className="font-mono text-sm font-medium hover:underline"
              onClick={() => onRowClick(code.id)}
            >
              {code.code}
            </button>
            <span className="opacity-0 transition-opacity group-hover/code:opacity-100">
              <CopyButton value={code.code} label="Copy code" />
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "ownerName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Owner / Campaign" />
      ),
      cell: ({ row }) => {
        const code = row.original;
        if (code.type === "Promotional") {
          return (
            <span className="text-sm text-muted-foreground">
              {code.belongsTo || "No campaign"}
            </span>
          );
        }
        return <span className="text-sm">{code.ownerName}</span>;
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      enableSorting: false,
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge variant={type === "Promotional" ? "default" : "secondary"}>
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => {
        const code = row.original;
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={code.isActive}
              onCheckedChange={(checked) =>
                onToggleActive(code.id, checked)
              }
              aria-label={`Toggle ${code.code} active`}
            />
            <StatusBadge
              status={code.isActive ? "active" : "inactive"}
              size="sm"
            />
          </div>
        );
      },
    },
    {
      accessorKey: "totalUses",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Uses" />
      ),
      cell: ({ row }) => {
        const code = row.original;
        return (
          <span className="text-sm">
            {code.totalUses}
            {code.maxUses != null && (
              <span className="text-muted-foreground"> / {code.maxUses}</span>
            )}
          </span>
        );
      },
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

export function ReferralListPage() {
  const navigate = useNavigate();
  const {
    pagination,
    sorting,
    onPaginationChange,
    onSortingChange,
    searchParams,
  } = useTableParams({ pageSize: 20, sortBy: "createdAt", sortOrder: "desc" });

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, error, refetch } = useReferralCodesQuery({
    search: debouncedSearch || undefined,
    page: searchParams.page,
    limit: searchParams.limit,
    codeType:
      typeFilter === "all"
        ? undefined
        : (typeFilter as "user_generated" | "promotional"),
  });

  const toggleMutation = useToggleReferralCodeMutation();

  const codes = data?.data ?? [];
  const pageCount = data?.meta?.totalPages ?? 0;

  const columns = useMemo(
    () =>
      createColumns(
        (id) => {
          void navigate({
            to: "/referrals/$referralId",
            params: { referralId: id },
          });
        },
        (id, isActive) => {
          toggleMutation.mutate({ id, isActive });
        },
      ),
    [navigate, toggleMutation],
  );

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Referral Codes"
          description="Manage referral codes and promotions"
        />
        <ErrorState
          title="Failed to load referral codes"
          message={
            error instanceof Error
              ? error.message
              : "An unexpected error occurred"
          }
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referral Codes"
        description="Manage referral codes and promotions"
      >
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-1.5 size-4" />
          Create Promotional Code
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by code, owner, or campaign..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Code type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="user_generated">User</SelectItem>
            <SelectItem value="promotional">Promotional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={codes}
        pageCount={pageCount}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={onPaginationChange}
        sorting={sorting}
        onSortingChange={onSortingChange}
        isLoading={isLoading}
        emptyMessage="No referral codes found"
        emptyIcon={Ticket}
        onRowClick={(row) => {
          void navigate({
            to: "/referrals/$referralId",
            params: { referralId: row.id },
          });
        }}
      />

      <CreatePromotionalCodeDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
