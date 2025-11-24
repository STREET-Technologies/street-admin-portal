import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ChevronRight, DollarSign } from "lucide-react";
import { OrdersDialog } from "@/components/OrdersDialog";
import type { Order, EntityType } from "@/types";
import { ApiService } from "@/services/api";

interface OrdersTabProps {
  entityId: string;
  entityType: EntityType;
}

export function OrdersTab({ entityId, entityType }: OrdersTabProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  const [ordersDialogOpen, setOrdersDialogOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [entityId, entityType]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      if (entityType === 'user') {
        const response = await ApiService.getUserOrders(entityId, 100, 1);
        setOrders(response.orders);
        setTotalOrders(response.meta.total);
      } else if (entityType === 'retail') {
        const response = await ApiService.getVendorOrders(entityId, 100, 1);
        setOrders(response.orders);
        setTotalOrders(response.meta.total);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSpent = orders.reduce((sum, order) => {
    const amount = typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount;
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;
  const recentOrders = orders.slice(0, 3);

  const filteredOrdersForDialog = orders.filter(order =>
    order.status === 'DELIVERED' || order.status === 'CANCELLED'
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Orders</div>
                <div className="text-2xl font-bold">{totalOrders}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  {entityType === 'user' ? 'Total Spent' : 'Total Revenue'}
                </div>
                <div className="text-2xl font-bold">£{totalSpent.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Average Order</div>
                <div className="text-2xl font-bold">£{averageOrderValue.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Recent Orders
          </CardTitle>
          {orders.length > 3 && (
            <Button variant="ghost" size="sm" onClick={() => setOrdersDialogOpen(true)}>
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No orders found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{order.orderId}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      £{typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount).toFixed(2) : order.totalAmount.toFixed(2)}
                    </div>
                    <div className={`text-sm ${order.status === 'DELIVERED' ? 'text-green-600' : order.status === 'CANCELLED' ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Dialog */}
      <OrdersDialog
        open={ordersDialogOpen}
        onOpenChange={setOrdersDialogOpen}
        orders={filteredOrdersForDialog}
        type={entityType}
      />
    </div>
  );
}
