import { useNavigate } from "@tanstack/react-router";
import { BackButton } from "@/components/shared/BackButton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntityDetailHeader } from "@/components/shared/EntityDetailHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useOrderDetailQuery } from "../api/order-queries";
import { toOrderDetailViewModel } from "../types";
import { OrderOverviewTab } from "./OrderOverviewTab";
import { OrderItemsTab } from "./OrderItemsTab";
import { OrderPaymentTab } from "./OrderPaymentTab";
import { OrderDeliveryTab } from "./OrderDeliveryTab";

interface OrderDetailPageProps {
  orderId: string;
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
        <BackButton to="/orders" label="Orders" />
        <ErrorState
          title="Order not found"
          message="This order could not be loaded. Please check the order ID and try again."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const orderDetail = toOrderDetailViewModel(backendOrder);

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <BackButton to="/orders" label="Orders" />

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

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">
            Items{orderDetail.items.length > 0 ? ` (${orderDetail.items.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OrderOverviewTab
            orderDetail={orderDetail}
            onNavigateToCustomer={
              orderDetail.customer.id
                ? () =>
                    void navigate({
                      to: "/users/$userId",
                      params: { userId: orderDetail.customer.id! },
                    })
                : undefined
            }
            onNavigateToRetailer={
              orderDetail.retailer
                ? () =>
                    void navigate({
                      to: "/retailers/$retailerId",
                      params: { retailerId: orderDetail.retailer!.id },
                    })
                : undefined
            }
          />
        </TabsContent>

        <TabsContent value="items" className="mt-6">
          <OrderItemsTab items={orderDetail.items} />
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <OrderPaymentTab orderDetail={orderDetail} />
        </TabsContent>

        <TabsContent value="delivery" className="mt-6">
          <OrderDeliveryTab orderDetail={orderDetail} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
