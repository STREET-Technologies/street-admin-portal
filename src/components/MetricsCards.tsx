import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Package, Star, Users, Truck } from "lucide-react";
import { calculateDaysSince } from "@/utils/statusUtils";
import type { User, Retailer, Courier, EntityType } from "@/types";

interface MetricsCardsProps {
  data: User | Retailer | Courier;
  type: EntityType;
}

export function MetricsCards({ data, type }: MetricsCardsProps) {
  const getMetrics = () => {
    switch (type) {
      case "user": {
        const userData = data as User;
        return [
          {
            title: "Total Orders",
            value: userData.totalOrders,
            icon: Package,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
          },
          {
            title: "Total Spent",
            value: `£${userData.totalSpent.toFixed(2)}`,
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-100"
          },
          {
            title: "Avg Order Value",
            value: `£${(userData.totalSpent / userData.totalOrders).toFixed(2)}`,
            icon: TrendingUp,
            color: "text-purple-600",
            bgColor: "bg-purple-100"
          },
          {
            title: "Member Since",
            value: `${calculateDaysSince(userData.joinDate)} days`,
            icon: Users,
            color: "text-orange-600",
            bgColor: "bg-orange-100"
          }
        ];
      }
      
      case "retail": {
        const retailerData = data as Retailer;
        return [
          {
            title: "Total Orders",
            value: retailerData.totalOrders,
            icon: Package,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
          },
          {
            title: "Total Revenue",
            value: `£${retailerData.totalRevenue.toFixed(2)}`,
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-100"
          },
          {
            title: "Avg Order Value",
            value: `£${(retailerData.totalRevenue / retailerData.totalOrders).toFixed(2)}`,
            icon: TrendingUp,
            color: "text-purple-600",
            bgColor: "bg-purple-100"
          },
          {
            title: "Partner Since",
            value: `${calculateDaysSince(retailerData.joinDate)} days`,
            icon: Users,
            color: "text-orange-600",
            bgColor: "bg-orange-100"
          }
        ];
      }
      
      case "courier": {
        const courierData = data as Courier;
        return [
          {
            title: "Total Deliveries",
            value: courierData.totalDeliveries,
            icon: Truck,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
          },
          {
            title: "Average Rating",
            value: `${courierData.averageRating}/5.0`,
            icon: Star,
            color: "text-yellow-600",
            bgColor: "bg-yellow-100"
          },
          {
            title: "Completion Rate",
            value: "98.5%",
            icon: TrendingUp,
            color: "text-green-600",
            bgColor: "bg-green-100"
          },
          {
            title: "Active Since",
            value: `${calculateDaysSince(courierData.joinDate)} days`,
            icon: Users,
            color: "text-purple-600",
            bgColor: "bg-purple-100"
          }
        ];
      }
      
      default:
        return [];
    }
  };

  const metrics = getMetrics();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        return (
          <Card key={index} className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <IconComponent className={`w-5 h-5 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold street-title">{metric.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}