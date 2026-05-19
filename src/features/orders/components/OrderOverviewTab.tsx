import { Store, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CopyableField } from "@/components/shared/CopyableField";
import { formatDateTime } from "@/lib/format-utils";
import type { OrderDetailViewModel } from "../types";

interface OrderOverviewTabProps {
  orderDetail: OrderDetailViewModel;
  onNavigateToCustomer?: () => void;
  onNavigateToRetailer?: () => void;
}

export function OrderOverviewTab({
  orderDetail,
  onNavigateToCustomer,
  onNavigateToRetailer,
}: OrderOverviewTabProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Order Info — left column */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Order info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CopyableField label="Order ID" value={orderDetail.orderId} mono />
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
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Items
            </p>
            <p className="text-sm tabular-nums">
              {orderDetail.itemCount} items
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Customer + Retailer + Pricing — right two columns */}
      <div className="space-y-6 lg:col-span-2">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-4" />
                Customer
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
                    {orderDetail.customer.name}
                  </button>
                ) : (
                  <p className="text-sm font-medium">
                    {orderDetail.customer.name}
                  </p>
                )}
              </div>
              {orderDetail.customer.email !== "No email" && (
                <CopyableField
                  label="Email"
                  value={orderDetail.customer.email}
                />
              )}
              {orderDetail.customer.phone !== "No phone" && (
                <CopyableField
                  label="Phone"
                  value={orderDetail.customer.phone}
                />
              )}
            </CardContent>
          </Card>

          {/* Retailer */}
          {orderDetail.retailer && onNavigateToRetailer && (
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
                  onClick={onNavigateToRetailer}
                >
                  {orderDetail.retailer.logo && (
                    <Avatar size="sm">
                      <AvatarImage
                        src={orderDetail.retailer.logo}
                        alt={orderDetail.retailer.name}
                      />
                      <AvatarFallback>
                        {orderDetail.retailer.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <span className="text-sm font-medium">
                    {orderDetail.retailer.name}
                  </span>
                </button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pricing summary */}
        {orderDetail.pricing && (
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">
                  {orderDetail.pricing.subtotal}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="tabular-nums">
                  {orderDetail.pricing.deliveryFee}
                </span>
              </div>
              {!orderDetail.pricing.isShopifyOrder && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service fee</span>
                  <span className="tabular-nums">
                    {orderDetail.pricing.serviceFee}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="tabular-nums">
                  {orderDetail.pricing.total}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
