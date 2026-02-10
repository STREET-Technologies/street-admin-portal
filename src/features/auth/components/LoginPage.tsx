import { useState, type FormEvent } from "react";
import { Navigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "../hooks/useAuth";
import { authApi } from "../api/auth-api";

const DEV_BYPASS_AUTH = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { redirect } = useSearch({ from: "/login" });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={redirect ?? "/users"} />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { accessToken, refreshToken } = await authApi.login(
        email,
        password,
      );
      login(accessToken, refreshToken);
      toast.success("Successfully logged in!");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          toast.error("Invalid email or password");
        } else if (error.status === 423) {
          const msg =
            (error.data as { message?: string })?.message ??
            "Account temporarily locked. Try again later.";
          toast.error(msg);
        } else if (error.status === 429) {
          toast.error("Too many login attempts. Please wait a moment.");
        } else {
          toast.error("Login failed. Please try again.");
        }
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDevBypass() {
    login("dev-bypass-token", "dev-bypass-refresh-token", {
      email: "dev@street.london",
      name: "Dev User",
    });
    toast.warning(
      "Dev bypass mode active -- this should NEVER be enabled in production!",
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        {/* STREET Logo */}
        <div className="mb-8 text-center">
          <h1 className="street-logo mb-2 text-6xl text-secondary">STREET</h1>
          <div className="street-gradient mx-auto mb-4 h-1 w-16" />
          <p className="text-lg text-muted-foreground">Admin Portal</p>
        </div>

        <Card className="border-0 bg-white/95 shadow-2xl backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="street-title text-2xl">
              Welcome Back
            </CardTitle>
            <CardDescription>
              Sign in with your STREET account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@street.london"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="current-password"
                />
              </div>
              <Button
                type="submit"
                className="h-12 w-full font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Dev Bypass (only when env var enabled) */}
            {DEV_BYPASS_AUTH && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Dev Only
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleDevBypass}
                  variant="outline"
                  className="h-12 w-full border-orange-300 bg-orange-50 font-semibold text-orange-700 transition-all duration-200 hover:bg-orange-100"
                >
                  Dev Bypass Login
                </Button>

                <p className="text-center text-xs font-medium text-orange-600">
                  Development bypass mode enabled
                </p>
              </>
            )}

            {/* Footer note */}
            <div className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Admin access restricted to authorized accounts only
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
