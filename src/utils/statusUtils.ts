// Utility functions for status handling
import type { EntityStatus, OrderStatus, InvoiceStatus, NotePriority } from "@/types";

export const getStatusColor = (status: EntityStatus | OrderStatus | InvoiceStatus): string => {
  switch (status.toLowerCase()) {
    case "active":
    case "delivered": 
    case "completed":
    case "paid":
    case "online":
      return "bg-green-100 text-green-800 border-green-200";
    case "blocked":
    case "cancelled":
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200";
    case "withdrawn":
      return "bg-red-900/10 text-red-900 border-red-900/20";
    case "onboarding":
    case "in-progress":
    case "partial":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "inactive":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getPriorityColor = (priority: NotePriority): string => {
  switch (priority) {
    case "high":
      return "border-l-red-500";
    case "medium":
      return "border-l-yellow-500";
    case "low":
      return "border-l-green-500";
    default:
      return "border-l-gray-300";
  }
};

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export const formatDate = (timestamp: string): { date: string; time: string } => {
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
};

export const calculateDaysSince = (dateString: string): number => {
  return Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
};