import { ExternalLink, MapPin, Truck } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CopyableField } from "@/components/shared/CopyableField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime } from "@/lib/format-utils";
import type { OrderDetailViewModel } from "../types";
import { StuckDeliveryControl } from "./StuckDeliveryControl";

interface OrderDeliveryTabProps {
  orderDetail: OrderDetailViewModel;
}

export function OrderDeliveryTab({ orderDetail }: OrderDeliveryTabProps) {
  const { delivery, shippingAddress } = orderDetail;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left: Delivery + stuck-control */}
      <div className="space-y-6">
        {delivery ? (
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
                <CopyableField
                  label="Courier Phone"
                  value={delivery.courierPhone}
                />
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
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                No delivery has been dispatched for this order yet.
              </p>
            </CardContent>
          </Card>
        )}

        <StuckDeliveryControl
          orderUuid={orderDetail.id}
          orderDisplayId={orderDetail.orderId}
          orderStatus={orderDetail.status}
        />
      </div>

      {/* Right: Shipping address */}
      {shippingAddress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-4" />
              Shipping address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{shippingAddress.line1}</p>
            {shippingAddress.line2 && (
              <p className="text-sm text-muted-foreground">
                {shippingAddress.line2}
              </p>
            )}
            <p className="text-sm tabular-nums">
              {shippingAddress.city}, {shippingAddress.postcode}
            </p>
            <p className="text-sm text-muted-foreground">
              {shippingAddress.country}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
