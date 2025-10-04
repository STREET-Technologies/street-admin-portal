import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Calendar, Package } from "lucide-react";
import type { Order } from "@/types";

interface OrdersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: Order[];
  userType: string;
  userName: string;
}

export function OrdersDialog({ open, onOpenChange, orders, userType, userName }: OrdersDialogProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {userType === "retail" ? `${userName} - All Orders Received` : `${userName} - Order History`}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div key={order.id}>
                <div className="bg-card rounded-lg p-4 border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold text-black hover:text-primary transition-colors cursor-pointer">{order.orderId}</h3>
                        <p className="text-sm text-muted-foreground">
                          {order.vendor?.storeName || 'Unknown vendor'}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} font-medium`} variant="outline">
                      {order.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-black hover:text-primary transition-colors">Amount:</span>
                      <span className="text-sm font-bold text-green-600">
                        £{(typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-black hover:text-primary transition-colors">
                        {order.shippingAddress?.city || 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-black hover:text-primary transition-colors">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  {order.orderItems && order.orderItems.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm font-medium">Order Items:</span>
                      <div className="mt-2 space-y-2">
                        {order.orderItems.map((item) => {
                          const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                          const totalPrice = typeof item.totalPrice === 'string' ? parseFloat(item.totalPrice) : item.totalPrice;
                          return (
                            <div key={item.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  Product: {item.metadata?.title || item.productId}
                                  {item.metadata?.variant_title && ` - ${item.metadata.variant_title}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Quantity: {item.quantity} × £{price.toFixed(2)}
                                </p>
                              </div>
                              <span className="text-sm font-bold">£{totalPrice.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                {index < orders.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
            
            {orders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No orders found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}