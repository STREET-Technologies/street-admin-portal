import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Package, Star, Users, Truck } from "lucide-react";

interface MetricsCardsProps {
  data: any;
  type: string;
}

export function MetricsCards({ data, type }: MetricsCardsProps) {
  const getMetrics = () => {
    switch (type) {
      case "user":
        return [
          {
            title: "Total Orders",
            value: data.totalOrders,
            icon: Package,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
          },
          {
            title: "Total Spent",
            value: `$${data.totalSpent.toFixed(2)}`,
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-100"
          },
          {
            title: "Avg Order Value",
            value: `$${(data.totalSpent / data.totalOrders).toFixed(2)}`,
            icon: TrendingUp,
            color: "text-purple-600",
            bgColor: "bg-purple-100"
          },
          {
            title: "Member Since",
            value: `${Math.floor((Date.now() - new Date(data.joinDate).getTime()) / (1000 * 60 * 60 * 24))} days`,
            icon: Users,
            color: "text-orange-600",
            bgColor: "bg-orange-100"
          }
        ];
      
      case "retail":
        return [
          {
            title: "Total Orders",
            value: data.totalOrders,
            icon: Package,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
          },
          {
            title: "Total Revenue",
            value: `$${data.totalRevenue.toFixed(2)}`,
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-100"
          },
          {
            title: "Avg Order Value",
            value: `$${(data.totalRevenue / data.totalOrders).toFixed(2)}`,
            icon: TrendingUp,
            color: "text-purple-600",
            bgColor: "bg-purple-100"
          },
          {
            title: "Partner Since",
            value: `${Math.floor((Date.now() - new Date(data.joinDate).getTime()) / (1000 * 60 * 60 * 24))} days`,
            icon: Users,
            color: "text-orange-600",
            bgColor: "bg-orange-100"
          }
        ];
      
      case "courier":
        return [
          {
            title: "Total Deliveries",
            value: data.totalDeliveries,
            icon: Truck,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
          },
          {
            title: "Average Rating",
            value: `${data.averageRating}/5.0`,
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
            value: `${Math.floor((Date.now() - new Date(data.joinDate).getTime()) / (1000 * 60 * 60 * 24))} days`,
            icon: Users,
            color: "text-purple-600",
            bgColor: "bg-purple-100"
          }
        ];
      
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
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500 font-medium">
                  +{Math.floor(Math.random() * 15 + 5)}% from last month
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}