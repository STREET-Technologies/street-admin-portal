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
import { ThemeToggle } from "@/app/layout/ThemeToggle";
import { useAuth } from "../hooks/useAuth";
import { authApi } from "../api/auth-api";

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
      await authApi.login(email, password);
      login();
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

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        {/* STREET Logo */}
        <div className="mb-8 text-center">
          <h1 className="street-logo mb-2 text-6xl text-foreground">STREET</h1>
          <div className="street-gradient mx-auto mb-4 h-1 w-16" />
          <p className="text-lg text-muted-foreground">Admin Portal</p>
        </div>

        <Card className="border-0 bg-card/95 shadow-2xl backdrop-blur-sm">
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
