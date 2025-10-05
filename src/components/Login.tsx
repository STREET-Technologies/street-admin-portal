import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/v1';

interface LoginProps {
  onLogin: (email: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  useEffect(() => {
    // Check if redirected back from Google OAuth with success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      // Extract email from JWT token if available
      checkAuth();
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.email) {
          onLogin(data.data.email);
          toast.success('Successfully logged in!');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      toast.error('Authentication failed. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/admin/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md relative">
        {/* STREET Logo */}
        <div className="text-center mb-8">
          <h1 className="street-logo text-6xl text-secondary mb-2">STREET</h1>
          <div className="w-16 h-1 street-gradient mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Admin Portal</p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-4">
            <h2 className="street-title text-2xl">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in with your STREET account</p>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 font-semibold border border-gray-300 transition-all duration-200 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>

            <div className="text-center pt-4">
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