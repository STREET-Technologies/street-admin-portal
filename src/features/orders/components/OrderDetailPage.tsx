import { useNavigate } from "@tanstack/react-router";
import {
  ExternalLink,
  MapPin,
  Package,
  Truck,
  User,
} from "lucide-react";
import { BackButton } from "@/components/shared/BackButton";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EntityDetailHeader } from "@/components/shared/EntityDetailHeader";
import { CopyableField } from "@/components/shared/CopyableField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDateTime } from "@/lib/format-utils";
import { useOrderDetailQuery } from "../api/order-queries";
import { toOrderDetailViewModel } from "../types";
import type { OrderDetailViewModel, OrderItemViewModel } from "../types";
import { StuckDeliveryControl } from "./StuckDeliveryControl";
import { ReturnsCard } from "./ReturnsCard";

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
  const { data: backendOrder, isLoading, isError, refetch } =
    useOrderDetailQuery(orderId);

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
    <div className="space-y-6">
      <BackButton to="/orders" label="Orders" useHistory />

      {/* Header carries the order ID, customer name, order + payment status pills */}
      <EntityDetailHeader
        title={`Order ${orderDetail.orderId}`}
        subtitle={`Placed by ${orderDetail.customerName}`}
        status={orderDetail.status}
        avatarFallback="#"
      />

      <Separator />

      {/* Top row: order summary + customer & shipping */}
      <div className="grid gap-6 md:grid-cols-2">
        <OrderSummaryCard
          orderDetail={orderDetail}
          onNavigateToRetailer={navigateToRetailer}
        />
        <CustomerShippingCard
          orderDetail={orderDetail}
          onNavigateToCustomer={navigateToCustomer}
        />
      </div>

      {/* Items table */}
      <ItemsCard items={orderDetail.items} />

      {/* Bottom row: pricing/payment + delivery */}
      <div className="grid gap-6 md:grid-cols-2">
        <PricingPaymentCard orderDetail={orderDetail} />
        <DeliveryCard orderDetail={orderDetail} />
      </div>

      {/* Returns + refunds (TT-226) — only renders when there's a return or shipping refund */}
      <ReturnsCard orderDetail={orderDetail} />

      {/* Stuck delivery resolve — renders its own card only when applicable */}
      <StuckDeliveryControl
        orderUuid={orderDetail.id}
        orderDisplayId={orderDetail.orderId}
        orderStatus={orderDetail.status}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

function OrderSummaryCard({
  orderDetail,
  onNavigateToRetailer,
}: {
  orderDetail: OrderDetailViewModel;
  onNavigateToRetailer?: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
      </CardContent>
    </Card>
  );
}

function CustomerShippingCard({
  orderDetail,
  onNavigateToCustomer,
}: {
  orderDetail: OrderDetailViewModel;
  onNavigateToCustomer?: () => void;
}) {
  const { customer, shippingAddress } = orderDetail;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="size-4" />
          Customer & shipping
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
      </CardContent>
    </Card>
  );
}

function ItemsCard({ items }: { items: OrderItemViewModel[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="size-4" />
            Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Package}
            title="No items"
            description="This order has no line items."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="size-4" />
          Items ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {item.imageUrl && (
                      <Avatar size="sm">
                        <AvatarImage
                          src={item.imageUrl}
                          alt={item.productName}
                        />
                        <AvatarFallback>
                          {item.productName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <p className="text-sm font-medium">{item.productName}</p>
                      {item.sku !== "--" && (
                        <p className="text-xs text-muted-foreground">
                          SKU: {item.sku}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.variant}
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums">
                  {item.unitPrice}
                </TableCell>
                <TableCell className="text-right text-sm font-medium tabular-nums">
                  {item.totalPrice}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PricingPaymentCard({
  orderDetail,
}: {
  orderDetail: OrderDetailViewModel;
}) {
  const { pricing, payment } = orderDetail;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing & payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
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
            {payment.refundedAmount && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Refunded</span>
                <span className="text-destructive tabular-nums">
                  {payment.refundedAmount}
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function DeliveryCard({
  orderDetail,
}: {
  orderDetail: OrderDetailViewModel;
}) {
  const { delivery } = orderDetail;

  if (!delivery) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="size-4" />
            Delivery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No delivery has been dispatched for this order yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="size-4" />
          Delivery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <StatusBadge status={delivery.status} size="sm" />
        </div>
        {delivery.courierName && (
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Courier
            </p>
            <div className="flex items-center gap-2">
              {delivery.courierPhoto && (
                <Avatar size="sm">
                  <AvatarImage
                    src={delivery.courierPhoto}
                    alt={delivery.courierName}
                  />
                  <AvatarFallback>
                    {delivery.courierName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="text-sm">{delivery.courierName}</span>
            </div>
          </div>
        )}
        {delivery.courierPhone && (
          <CopyableField label="Courier Phone" value={delivery.courierPhone} />
        )}
        {delivery.vehicleType && (
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Vehicle
            </p>
            <p className="text-sm capitalize">{delivery.vehicleType}</p>
          </div>
        )}
        {delivery.estimatedDelivery && (
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              ETA
            </p>
            <p className="text-sm tabular-nums">
              {formatDateTime(delivery.estimatedDelivery)}
            </p>
          </div>
        )}
        {delivery.trackingUrl && (
          <a
            href={delivery.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View tracking
            <ExternalLink className="size-3" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}
