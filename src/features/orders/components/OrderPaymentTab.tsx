import { CreditCard } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { OrderDetailViewModel } from "../types";

interface OrderPaymentTabProps {
  orderDetail: OrderDetailViewModel;
}

export function OrderPaymentTab({ orderDetail }: OrderPaymentTabProps) {
  const { payment, pricing } = orderDetail;

  if (!payment && !pricing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            No payment information available for this order.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Payment */}
      {payment && (
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
              <span className="text-sm font-medium tabular-nums">
                {payment.amount}
              </span>
            </div>
            {payment.refundedAmount && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Refunded</span>
                <span className="text-sm text-destructive tabular-nums">
                  {payment.refundedAmount}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pricing breakdown */}
      {pricing && (
        <Card>
          <CardHeader>
            <CardTitle>Pricing breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
