import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CopyButton } from "@/components/shared/CopyButton";
import { formatDate } from "@/lib/format-utils";
import { useOrderDetailQuery } from "../api/order-queries";
import { OrderActionsControl } from "./OrderActionsControl";
import { toOrderDetailViewModel } from "../types";
import type { OrderViewModel } from "../types";

interface OrderPeekSheetProps {
  /**
   * The row that was clicked. Renders immediately from list data so the panel
   * never opens empty; the detail query fills in the rest as it lands.
   */
  order: OrderViewModel | null;
  onOpenChange: (open: boolean) => void;
}

/** Label above a value. Flat rows, matching the detail page's section style. */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-sm">{children}</span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="mt-2 border-t pt-2">{children}</div>
    </section>
  );
}

/**
 * Quick-peek panel for a row in the orders list (TT-446).
 *
 * Exists so a support session can triage an order without leaving a filtered,
 * paged list and losing its place. The full detail page is unchanged and
 * remains the destination for anything this does not carry — the Order ID in
 * the row still links straight to it, as does the header action here.
 */
export function OrderPeekSheet({ order, onOpenChange }: OrderPeekSheetProps) {
  const bodyRef = useRef<HTMLDivElement>(null);

  // Only fetches once a row is open (the hook is disabled on an empty id).
  const { data: backendOrder, isLoading } = useOrderDetailQuery(
    order?.orderId ?? "",
  );
  // The hook returns the raw entity; the detail page's own transform is the
  // single definition of how that becomes a view model.
  const detail = backendOrder ? toOrderDetailViewModel(backendOrder) : null;

  return (
    <Sheet open={Boolean(order)} onOpenChange={onOpenChange}>
      <SheetContent
        // Radix focuses the first focusable child on open, which is the copy
        // button — the panel opened wearing a focus ring that stayed until you
        // clicked elsewhere. Send focus to the body wrapper instead: still
        // inside the panel, so the focus trap and Esc behave, but nothing
        // looks pressed. The ref goes on our own div because SheetContent is
        // a plain function component and React 18 would drop a ref on it.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          bodyRef.current?.focus();
        }}
        className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md"
      >
        {order && (
          <div
            ref={bodyRef}
            tabIndex={-1}
            className="flex min-h-full flex-col focus:outline-none"
          >
            {/* pr-10 clears the close button, which sits absolute at top-4
                right-4 — without it the status badge collides with the X. */}
            <SheetHeader className="space-y-1 pr-10 pb-5">
              <div className="flex items-center gap-2">
                <SheetTitle className="font-mono text-sm">
                  {order.orderId}
                </SheetTitle>
                <CopyButton value={order.orderId} label="Copy order ID" />
                <span className="ml-auto">
                  <StatusBadge status={order.displayStatus} size="sm" />
                </span>
              </div>
              <SheetDescription className="text-xs">
                {order.retailerName ?? "Unknown retailer"} ·{" "}
                {formatDate(order.createdAt)}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-5 px-4 pb-4">
              <Section title="Customer">
                <Field label="Name">{order.customerName || "Unknown"}</Field>
                <Field label="Email">
                  <span className="break-all">
                    {order.customerEmail || "—"}
                  </span>
                </Field>
                <Field label="Phone">
                  {isLoading ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    detail?.customer.phone || "—"
                  )}
                </Field>
              </Section>

              <Section title="Order">
                <Field label="Items">{order.itemCount}</Field>
                <Field label="Total">{order.totalAmount}</Field>
                <Field label="Payment">
                  {isLoading ? (
                    <Skeleton className="h-4 w-20" />
                  ) : (
                    (detail?.payment?.status ?? order.paymentStatus ?? "—")
                  )}
                </Field>
                {detail?.payment?.refundedAmount && (
                  <Field label="Refunded">
                    {detail.payment.refundedAmount}
                  </Field>
                )}
              </Section>

              <Section title="Delivery">
                {isLoading ? (
                  <div className="space-y-2 py-1.5">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : detail?.shippingAddress ? (
                  <address className="py-1.5 text-sm not-italic leading-relaxed">
                    {detail.shippingAddress.line1}
                    {detail.shippingAddress.line2 && (
                      <>
                        <br />
                        {detail.shippingAddress.line2}
                      </>
                    )}
                    <br />
                    {detail.shippingAddress.city}{" "}
                    {detail.shippingAddress.postcode}
                  </address>
                ) : (
                  <p className="py-1.5 text-sm text-muted-foreground">
                    No delivery address recorded.
                  </p>
                )}
                {order.reconciliationAttempts > 0 && (
                  <Field label="Reconciliation">
                    {order.reconciliationAttempts} attempts
                  </Field>
                )}
              </Section>

              {detail && detail.items.length > 0 && (
                <Section title={`Items (${detail.items.length})`}>
                  <ul className="divide-y">
                    {detail.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-baseline justify-between gap-3 py-2"
                      >
                        <span className="text-sm">
                          {item.quantity}× {item.productName}
                        </span>
                        <span className="shrink-0 text-sm tabular-nums">
                          {item.totalPrice}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>

            {/* Actions pinned at the foot so they sit in the same place on
                every order, however long the body runs. */}
            <div className="mt-auto flex items-center gap-2 border-t px-4 py-3">
              <Button variant="outline" size="sm" asChild>
                <Link to="/orders/$orderId" params={{ orderId: order.orderId }}>
                  Open full page
                  <ExternalLink className="ml-1.5 size-3.5" />
                </Link>
              </Button>
              {detail && (
                <div className="ml-auto">
                  <OrderActionsControl
                    orderUuid={detail.id}
                    orderDisplayId={detail.orderId}
                    orderStatus={detail.status}
                    paymentStatus={detail.payment?.status ?? ""}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
