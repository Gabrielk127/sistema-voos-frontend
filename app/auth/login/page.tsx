"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authLogin, setAuthTokens } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError("Preencha email e senha");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Email inválido");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Senha deve ter no mínimo 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const response = await authLogin(email, password);

      // Store tokens
      setAuthTokens({
        token: response.accessToken,
        refreshToken: response.refreshToken,
      });

      // Store user info
      const roleString = response.roles?.[0] || "ROLE_USER";
      let role: "ADMIN" | "MODERATOR" | "USER" = "USER";

      if (roleString.includes("ADMIN")) {
        role = "ADMIN";
      } else if (roleString.includes("MODERATOR")) {
        role = "MODERATOR";
      }

      const user = {
        id: response.id.toString(),
        email: response.email,
        username: response.username,
        role,
      };

      console.log("Login successful - User:", user);
      console.log(
        "Access Token saved:",
        response.accessToken.substring(0, 20) + "..."
      );

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isAuthenticated", "true");

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao fazer login. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-primary to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Plane className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Acessar Plataforma</CardTitle>
            <CardDescription>
              Entre com sua conta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="h-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-10 bg-primary hover:bg-primary/90 cursor-pointer"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">ou</span>
              </div>
            </div>
            <Link href="/auth/register">
              <Button
                variant="outline"
                className="w-full h-10 bg-transparent cursor-pointer"
                disabled={loading}
              >
                Criar uma conta
              </Button>
            </Link>
            <div className="text-xs text-muted-foreground text-center pt-2">
              <p>Use qualquer email e senha com 6+ caracteres</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
