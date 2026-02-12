import { Navigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LoadingState } from "@/components/shared/LoadingState";

/**
 * Auth guard that redirects unauthenticated users to /login.
 * Preserves the attempted URL for post-login redirect.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingState variant="page" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: location.pathname }} />;
  }

  return <>{children}</>;
}
