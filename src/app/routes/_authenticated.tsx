import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/layout/ProtectedRoute";
import { AppLayout } from "@/app/layout/AppLayout";

export const Route = createFileRoute("/_authenticated")({
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </ProtectedRoute>
  ),
});
