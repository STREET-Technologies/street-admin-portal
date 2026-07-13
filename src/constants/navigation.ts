import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingCart,
  Tag,
  Shield,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  icon: LucideIcon;
  href: string;
  requireAdmin?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", icon: LayoutDashboard, href: "/" }],
  },
  {
    label: "Customers",
    items: [
      { title: "Users", icon: Users, href: "/users" },
      { title: "Retailers", icon: Store, href: "/retailers" },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Orders", icon: ShoppingCart, href: "/orders" },
      { title: "Referral Codes", icon: Tag, href: "/referrals" },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Team", icon: Shield, href: "/admin-users", requireAdmin: true },
      { title: "Settings", icon: Settings, href: "/settings", requireAdmin: true },
    ],
  },
];
