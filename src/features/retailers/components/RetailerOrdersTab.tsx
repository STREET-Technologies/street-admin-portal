import { Link, useNavigate } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CopyButton } from "@/components/shared/CopyButton";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRetailerOrdersQuery } from "../api/retailer-queries";

interface RetailerOrdersTabProps {
  retailerId: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

export function RetailerOrdersTab({ retailerId }: RetailerOrdersTabProps) {
  const navigate = useNavigate();
  const { data: orders, isLoading, isError, refetch } =
    useRetailerOrdersQuery(retailerId);

  if (isLoading) {
    return <LoadingState variant="table" rows={5} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load orders"
        message="There was a problem fetching retailer orders."
        onRetry={() => void refetch()}
      />
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="This retailer has not received any orders."
      />
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className="cursor-pointer"
              onClick={(e) => {
                // Don't navigate when clicking interactive elements (copy button, links)
                const target = e.target as HTMLElement;
                if (target.closest("button") || target.closest("a")) return;
                void navigate({
                  to: "/orders/$orderId",
                  params: { orderId: order.id },
                });
              }}
            >
              <TableCell>
                <div className="group/id flex items-center gap-1">
                  <Link
                    to="/orders/$orderId"
                    params={{ orderId: order.id }}
                    className="font-mono text-xs font-medium text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {order.orderNumber ?? order.id.slice(0, 8)}
                  </Link>
                  <span className="opacity-0 transition-opacity group-hover/id:opacity-100">
                    <CopyButton value={order.id} label="Copy order ID" />
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {order.customerName ?? "Unknown"}
              </TableCell>
              <TableCell>
                <StatusBadge status={order.status} size="sm" />
              </TableCell>
              <TableCell className="text-sm font-medium">
                {order.totalAmount !== null
                  ? formatCurrency(order.totalAmount)
                  : "--"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
