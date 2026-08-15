import { useNavigate } from "@tanstack/react-router";
import { MapPin, Package, User } from "lucide-react";
import { BackButton } from "@/components/shared/BackButton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EntityDetailHeader } from "@/components/shared/EntityDetailHeader";
import { CopyableField } from "@/components/shared/CopyableField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDateTime } from "@/lib/format-utils";
import { useOrderDetailQuery } from "../api/order-queries";
import { toOrderDetailViewModel } from "../types";
import type {
  LineStatus,
  OrderDetailViewModel,
  OrderItemViewModel,
} from "../types";
import { DeliveryPanel } from "./DeliveryPanel";
import { OrderActionsControl } from "./OrderActionsControl";
import { RefundSummary } from "./RefundSummary";
import { RefundsReturnsSection } from "./RefundsReturnsSection";

interface OrderDetailPageProps {
  orderId: string;
}

// Friendly payment-method label (normalizes backend values like shopify_checkout).
function formatPaymentMethod(method: string): string {
  const normalized = method.toLowerCase();
  if (normalized === "shopify_checkout") return "Shopify";
  if (normalized === "others" || normalized === "other") return "Other";
  return method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const navigate = useNavigate();
  const {
    data: backendOrder,
    isLoading,
    isError,
    refetch,
  } = useOrderDetailQuery(orderId);

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  if (isError || !backendOrder) {
    return (
      <div className="space-y-6">
        <BackButton to="/orders" label="Orders" useHistory />
        <ErrorState
          title="Order not found"
          message="This order could not be loaded. Please check the order ID and try again."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const orderDetail = toOrderDetailViewModel(backendOrder);

  const navigateToCustomer = orderDetail.customer.id
    ? () =>
        void navigate({
          to: "/users/$userId",
          params: { userId: orderDetail.customer.id! },
        })
    : undefined;

  const navigateToRetailer = orderDetail.retailer
    ? () =>
        void navigate({
          to: "/retailers/$retailerId",
          params: { retailerId: orderDetail.retailer!.id },
        })
    : undefined;

  return (
    <div className="space-y-8">
      <BackButton to="/orders" label="Orders" useHistory />

      {/* Header carries the order ID, customer name, and consolidated displayStatus
          pill — supersedes the original order status when a return is active (TT-226).
          The refund summary sits on the same line (TT-473): money going back is
          the first thing support needs to know, before any scrolling. */}
      <EntityDetailHeader
        title={`Order ${orderDetail.orderId}`}
        subtitle={`Placed by ${orderDetail.customerName}`}
        status={orderDetail.displayStatus.toLowerCase()}
        statusExtra={
          <RefundSummary
            refundState={orderDetail.refundState}
            totalRefundedFormatted={orderDetail.totalRefundedFormatted}
          />
        }
        avatarFallback="#"
      >
        <OrderActionsControl
          orderUuid={orderDetail.id}
          orderDisplayId={orderDetail.orderId}
          orderStatus={orderDetail.status}
          paymentStatus={orderDetail.paymentStatus ?? ""}
        />
      </EntityDetailHeader>

      {/* Refunds & returns first (TT-473) — only renders when there are any. */}
      <RefundsReturnsSection orderDetail={orderDetail} />

      {/* Top row: order summary + customer & shipping */}
      <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
        <OrderSummarySection
          orderDetail={orderDetail}
          onNavigateToRetailer={navigateToRetailer}
        />
        <CustomerShippingSection
          orderDetail={orderDetail}
          onNavigateToCustomer={navigateToCustomer}
        />
      </div>

      {/* Items table */}
      <ItemsSection items={orderDetail.items} />

      {/* Bottom row: pricing/payment + unified delivery panel (TT-354) —
          real courier state + reconciliation folded into one section. */}
      <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
        <PricingPaymentSection orderDetail={orderDetail} />
        <DeliveryPanel
          orderUuid={orderDetail.id}
          orderDisplayId={orderDetail.orderId}
          orderStatus={orderDetail.status}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sections — flat, single-plane. Title + 1px divider + content. No elevation.
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-base font-semibold leading-none">
      {children}
    </h2>
  );
}

function OrderSummarySection({
  orderDetail,
  onNavigateToRetailer,
}: {
  orderDetail: OrderDetailViewModel;
  onNavigateToRetailer?: () => void;
}) {
  return (
    <section>
      <SectionHeading>Order summary</SectionHeading>
      <div className="mt-4 space-y-3 border-t pt-5">
        <CopyableField label="Internal ID" value={orderDetail.id} mono />
        {orderDetail.shopifyOrderId && (
          <CopyableField
            label="Shopify Order ID"
            value={orderDetail.shopifyOrderId}
            mono
          />
        )}
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Placed
          </p>
          <p className="text-sm tabular-nums">
            {formatDateTime(orderDetail.createdAt)}
          </p>
        </div>
        {orderDetail.retailer && (
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Retailer
            </p>
            {onNavigateToRetailer ? (
              <button
                type="button"
                className="text-sm font-medium hover:underline"
                onClick={onNavigateToRetailer}
              >
                {orderDetail.retailer.name}
              </button>
            ) : (
              <p className="text-sm font-medium">{orderDetail.retailer.name}</p>
            )}
          </div>
        )}
        {/* TT-449 — the branch, not just the brand. Only rendered when the
            order carries one: orders predating outlet attribution (TT-366)
            genuinely have none, and an empty row would imply otherwise. */}
        {orderDetail.outletName && (
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Outlet
            </p>
            <p className="text-sm font-medium">{orderDetail.outletName}</p>
          </div>
        )}
        {/* Only surface payment status when it's *not* the assumed "Paid". For
            paid orders this row stays hidden (noise); for pending/failed/refunded
            it sits inline with the other order metadata. */}
        {orderDetail.paymentStatus &&
          orderDetail.paymentStatus.toLowerCase() !== "paid" && (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Payment status
              </p>
              <StatusBadge status={orderDetail.paymentStatus} size="sm" />
            </div>
          )}
      </div>
    </section>
  );
}

function CustomerShippingSection({
  orderDetail,
  onNavigateToCustomer,
}: {
  orderDetail: OrderDetailViewModel;
  onNavigateToCustomer?: () => void;
}) {
  const { customer, shippingAddress } = orderDetail;

  return (
    <section>
      <SectionHeading>
        <User className="size-4" />
        Customer & shipping
      </SectionHeading>
      <div className="mt-4 space-y-3 border-t pt-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Name
          </p>
          {onNavigateToCustomer ? (
            <button
              type="button"
              className="text-sm font-medium hover:underline"
              onClick={onNavigateToCustomer}
            >
              {customer.name}
            </button>
          ) : (
            <p className="text-sm font-medium">{customer.name}</p>
          )}
        </div>
        {customer.email !== "No email" && (
          <CopyableField label="Email" value={customer.email} />
        )}
        {customer.phone !== "No phone" && (
          <CopyableField label="Phone" value={customer.phone} />
        )}

        {shippingAddress && (
          <>
            <Separator />
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <MapPin className="size-3" />
                Shipping address
              </p>
              <p className="text-sm">{shippingAddress.line1}</p>
              {shippingAddress.line2 && (
                <p className="text-sm">{shippingAddress.line2}</p>
              )}
              <p className="text-sm tabular-nums">
                {shippingAddress.city}, {shippingAddress.postcode}
              </p>
              <p className="text-sm text-muted-foreground">
                {shippingAddress.country}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function ItemsSection({ items }: { items: OrderItemViewModel[] }) {
  return (
    <section>
      <SectionHeading>
        <Package className="size-4" />
        Items{items.length > 0 ? ` (${items.length})` : ""}
      </SectionHeading>
      <div className="mt-4">
        {items.length === 0 ? (
          <div className="border-t pt-5">
            <EmptyState
              icon={Package}
              title="No items"
              description="This order has no line items."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* Product photos are ~3:2 — a square/rectangular tile
                          keeps them legible where a circle crops them. */}
                      <span className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {item.productName.charAt(0)}
                          </span>
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-medium">
                          {item.productName}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span>{item.variant}</span>
                    {item.variantId && (
                      <p className="font-mono text-xs text-muted-foreground">
                        {item.variantId}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.sku}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {item.unitPrice}
                  </TableCell>
                  <TableCell
                    className={
                      item.lineStatus === "PAID"
                        ? "text-right text-sm font-medium tabular-nums"
                        : "text-right text-sm tabular-nums text-muted-foreground line-through"
                    }
                  >
                    {item.totalPrice}
                  </TableCell>
                  {/* TT-473 — per-line settlement as a plain label, not a pill.
                      REFUNDED = removed at acceptance or whole order refunded;
                      RETURNED = came back on a Return (with the count when partial). */}
                  <TableCell>
                    <LineStatusLabel item={item} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}

function LineStatusLabel({ item }: { item: OrderItemViewModel }) {
  const status: LineStatus = item.lineStatus;
  const label =
    status === "RETURNED" && item.returnedQuantity < item.quantity
      ? `Returned ${item.returnedQuantity}/${item.quantity}`
      : status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span
      className={
        status === "PAID"
          ? "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          : "text-[11px] font-semibold uppercase tracking-wider text-foreground"
      }
    >
      {label}
    </span>
  );
}

function PricingPaymentSection({
  orderDetail,
}: {
  orderDetail: OrderDetailViewModel;
}) {
  const { pricing, payment } = orderDetail;

  return (
    <section>
      <SectionHeading>Pricing & payment</SectionHeading>
      <div className="mt-4 space-y-2 border-t pt-5">
        {pricing && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{pricing.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="tabular-nums">{pricing.deliveryFee}</span>
            </div>
            {!pricing.isShopifyOrder && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service fee</span>
                <span className="tabular-nums">{pricing.serviceFee}</span>
              </div>
            )}
            {pricing.discount && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                  −{pricing.discount}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{pricing.total}</span>
            </div>
          </>
        )}

        {payment && (
          <>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment method</span>
              <span className="font-medium">
                {formatPaymentMethod(payment.method)}
              </span>
            </div>
          </>
        )}

        {/* TT-473 — one supporting line; the primary signal is the header
            summary and the Refunds & returns section at the top of the page,
            where the shipping component is stated per refund. */}
        {orderDetail.totalRefundedFormatted && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Refunded</span>
            <span className="tabular-nums">
              −{orderDetail.totalRefundedFormatted}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
