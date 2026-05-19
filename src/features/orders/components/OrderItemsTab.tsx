import { Package } from "lucide-react";
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
import { EmptyState } from "@/components/shared/EmptyState";
import type { OrderItemViewModel } from "../types";

interface OrderItemsTabProps {
  items: OrderItemViewModel[];
}

export function OrderItemsTab({ items }: OrderItemsTabProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
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
