import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Package,
  Store,
  Truck,
  User,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useVendorOrdersQuery } from "../api/order-queries";
import { toOrderDetailViewModel } from "../types";
import type { OrderDetailViewModel, OrderItemViewModel } from "../types";

interface OrderDetailPageProps {
  orderId: string;
}

// ---------------------------------------------------------------------------
// Helper: find order from vendor query cache
// ---------------------------------------------------------------------------

/**
 * Since there is no dedicated GET /admin/orders/:id endpoint, the detail page
 * works by receiving the orderId (UUID) as a URL param.  We re-fetch the
 * vendor orders list (which should be cached from the list page) and pluck the
 * matching order.  If the admin deep-links without a warm cache this won't
 * find the order — that's an acceptable limitation given the backend
 * constraints (no global order lookup).
 */

function useOrderDetailFromVendorQuery(
  orderId: string,
  vendorId: string | null,
) {
  const query = useVendorOrdersQuery(vendorId ?? "", { limit: 100 });

  // Find order in the flat array of OrderViewModels — but we need the
  // *raw* BackendOrder for the detail transform.  Unfortunately the query
  // `select` already transforms.  So we also search the *raw* query data.
  const rawOrders = query.data
    ? // The underlying data before select is not easily accessible, so
      // let's just match from the transformed list and use what we have.
      undefined
    : undefined;

  // We can't get BackendOrder from the transformed hook.  Instead let's
  // match on the transformed list and indicate "found" to the caller.
  const order = query.data?.data.find((o) => o.id === orderId);

  return {
    order,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    rawOrders,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const navigate = useNavigate();

  // Since we can't fetch a single order by ID from the admin API, we need
  // to get the full detail from the vendor orders cache.  However this only
  // works if the admin navigated from the orders list (cache is warm).
  //
  // For a more robust approach, we directly fetch vendor orders for the
  // order's vendor.  But we don't know the vendorId from just orderId.
  //
  // PRACTICAL SOLUTION: Use the query client cache to scan all cached
  // vendor order lists.  This is lightweight and works in the common flow.

  return <OrderDetailContent orderId={orderId} />;
}

function OrderDetailContent({ orderId }: { orderId: string }) {
  const navigate = useNavigate();

  // Try to find the order in any cached vendor orders query
  // We use a simple approach: the order detail page looks for the order
  // in the raw vendor orders response using queryClient
  const { data: orderDetail, isLoading, isError, notFound } =
    useOrderFromCache(orderId);

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  if (isError || notFound || !orderDetail) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
          onClick={() => void navigate({ to: "/orders" })}
        >
          <ArrowLeft className="mr-1 size-4" />
          Orders
        </Button>
        <ErrorState
          title="Order not found"
          message="This order could not be loaded. Navigate from the orders list to view order details."
          onRetry={() => void navigate({ to: "/orders" })}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        onClick={() => void navigate({ to: "/orders" })}
      >
        <ArrowLeft className="mr-1 size-4" />
        Orders
      </Button>

      {/* Header */}
      <EntityDetailHeader
        title={`Order ${orderDetail.orderId}`}
        subtitle={`Placed by ${orderDetail.customerName}`}
        status={orderDetail.status}
        avatarFallback="#"
      >
        {orderDetail.paymentStatus && (
          <StatusBadge status={orderDetail.paymentStatus} size="sm" />
        )}
      </EntityDetailHeader>

      <Separator />

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column — 2/3 width */}
        <div className="space-y-6 lg:col-span-2">
          <OrderItemsCard items={orderDetail.items} />
          {orderDetail.pricing && (
            <PricingCard pricing={orderDetail.pricing} />
          )}
          {orderDetail.payment && (
            <PaymentCard payment={orderDetail.payment} />
          )}
        </div>

        {/* Right column — 1/3 width */}
        <div className="space-y-6">
          <CustomerCard
            customer={orderDetail.customer}
            onNavigate={
              orderDetail.customer.id
                ? () =>
                    void navigate({
                      to: "/users/$userId",
                      params: { userId: orderDetail.customer.id! },
                    })
                : undefined
            }
          />
          {orderDetail.retailer && (
            <RetailerCard
              retailer={orderDetail.retailer}
              onNavigate={() =>
                void navigate({
                  to: "/retailers/$retailerId",
                  params: { retailerId: orderDetail.retailer!.id },
                })
              }
            />
          )}
          {orderDetail.delivery && (
            <DeliveryCard delivery={orderDetail.delivery} />
          )}
          {orderDetail.shippingAddress && (
            <AddressCard address={orderDetail.shippingAddress} />
          )}
          <OrderMetaCard orderDetail={orderDetail} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cache-based order lookup hook
// ---------------------------------------------------------------------------

import { useQueryClient } from "@tanstack/react-query";
import { orderKeys } from "../api/order-queries";
import type { VendorOrdersRawResponse } from "../api/order-api";

function useOrderFromCache(orderId: string) {
  const queryClient = useQueryClient();

  // Scan all cached vendor order queries for the matching order
  const queries = queryClient.getQueriesData<VendorOrdersRawResponse>({
    queryKey: orderKeys.lists(),
  });

  let found: OrderDetailViewModel | null = null;

  for (const [, data] of queries) {
    if (!data?.data?.orders) continue;
    const match = data.data.orders.find((o) => o.id === orderId);
    if (match) {
      found = toOrderDetailViewModel(match);
      break;
    }
  }

  return {
    data: found,
    isLoading: false,
    isError: false,
    notFound: !found,
  };
}

// ---------------------------------------------------------------------------
// Sub-components: Cards
// ---------------------------------------------------------------------------

function OrderItemsCard({ items }: { items: OrderItemViewModel[] }) {
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
                        <AvatarImage src={item.imageUrl} alt={item.productName} />
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
                <TableCell className="text-right text-sm">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {item.unitPrice}
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
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

function PricingCard({
  pricing,
}: {
  pricing: NonNullable<OrderDetailViewModel["pricing"]>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{pricing.subtotal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Delivery fee</span>
          <span>{pricing.deliveryFee}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Service fee</span>
          <span>{pricing.serviceFee}</span>
        </div>
        <Separator />
        <div className="flex justify-between text-sm font-semibold">
          <span>Total</span>
          <span>{pricing.total}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentCard({
  payment,
}: {
  payment: NonNullable<OrderDetailViewModel["payment"]>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-4" />
          Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <StatusBadge status={payment.status} size="sm" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Method</span>
          <span className="text-sm capitalize">{payment.method}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Amount</span>
          <span className="text-sm font-medium">{payment.amount}</span>
        </div>
        {payment.refundedAmount && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Refunded</span>
            <span className="text-sm text-destructive">
              {payment.refundedAmount}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CustomerCard({
  customer,
  onNavigate,
}: {
  customer: OrderDetailViewModel["customer"];
  onNavigate?: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="size-4" />
          Customer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Name</p>
          {onNavigate ? (
            <button
              type="button"
              className="text-sm font-medium hover:underline"
              onClick={onNavigate}
            >
              {customer.name}
            </button>
          ) : (
            <p className="text-sm">{customer.name}</p>
          )}
        </div>
        {customer.email !== "No email" && (
          <CopyableField label="Email" value={customer.email} />
        )}
        {customer.phone !== "No phone" && (
          <CopyableField label="Phone" value={customer.phone} />
        )}
      </CardContent>
    </Card>
  );
}

function RetailerCard({
  retailer,
  onNavigate,
}: {
  retailer: NonNullable<OrderDetailViewModel["retailer"]>;
  onNavigate: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="size-4" />
          Retailer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <button
          type="button"
          className="flex items-center gap-3 hover:underline"
          onClick={onNavigate}
        >
          {retailer.logo && (
            <Avatar size="sm">
              <AvatarImage src={retailer.logo} alt={retailer.name} />
              <AvatarFallback>
                {retailer.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="text-sm font-medium">{retailer.name}</span>
        </button>
      </CardContent>
    </Card>
  );
}

function DeliveryCard({
  delivery,
}: {
  delivery: NonNullable<OrderDetailViewModel["delivery"]>;
}) {
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
            <p className="text-xs font-medium text-muted-foreground">
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
            <p className="text-xs font-medium text-muted-foreground">
              Vehicle
            </p>
            <p className="text-sm capitalize">{delivery.vehicleType}</p>
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
        {delivery.estimatedDelivery && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">ETA</p>
            <p className="text-sm">
              {new Date(delivery.estimatedDelivery).toLocaleString("en-GB", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AddressCard({
  address,
}: {
  address: NonNullable<OrderDetailViewModel["shippingAddress"]>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="size-4" />
          Shipping Address
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{address.line1}</p>
        {address.line2 && (
          <p className="text-sm text-muted-foreground">{address.line2}</p>
        )}
        <p className="text-sm">
          {address.city}, {address.postcode}
        </p>
        <p className="text-sm text-muted-foreground">{address.country}</p>
      </CardContent>
    </Card>
  );
}

function OrderMetaCard({
  orderDetail,
}: {
  orderDetail: OrderDetailViewModel;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <CopyableField label="Order ID" value={orderDetail.orderId} mono />
        <CopyableField label="Internal ID" value={orderDetail.id} mono />
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Created</p>
          <p className="text-sm">
            {new Date(orderDetail.createdAt).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Items</p>
          <p className="text-sm">{orderDetail.itemCount} items</p>
        </div>
      </CardContent>
    </Card>
  );
}
