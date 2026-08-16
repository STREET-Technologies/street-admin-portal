import { formatDateTime } from "@/lib/format-utils";
import { cn } from "@/lib/utils";
import type { ShopifySays } from "../types";

interface ShopifySaysLineProps {
  shopifySays: ShopifySays | null;
  className?: string;
}

/**
 * What Shopify itself last said about the order (TT-477). Support has no
 * access to the retailer's store in production, so this is the line they can
 * read to a customer — the retailer sees the same words in Shopify admin.
 * Plain text, no pill: our pill is the goods, our money line is derived; this
 * is the tie-breaker. A disagreement with our derived refund state is a bug
 * signal for us and is said out loud, never hidden.
 */
export function ShopifySaysLine({
  shopifySays,
  className,
}: ShopifySaysLineProps) {
  return (
    <p className={cn("text-xs text-muted-foreground tabular-nums", className)}>
      <span className="font-medium text-foreground/80">Shopify:</span>{" "}
      {shopifySays ? (
        <>
          <span className="font-mono">{shopifySays.label}</span>
          {" · as of "}
          {formatDateTime(shopifySays.at)}
          {shopifySays.disagreesWithRefundState ? (
            <span className="ml-2 font-medium text-destructive">
              differs from our refund state
            </span>
          ) : null}
        </>
      ) : (
        <span>not received yet</span>
      )}
    </p>
  );
}
