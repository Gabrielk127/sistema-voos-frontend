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
import { authRegister, setAuthTokens } from "@/lib/api-client";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    cpf: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { username, email, password, cpf } = formData;

    // Validation
    if (!username || !email || !password || !cpf) {
      setError("Preencha todos os campos");
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError("Nome deve ter no mínimo 3 caracteres");
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

    if (cpf.length !== 11 || !/^\d+$/.test(cpf)) {
      setError("CPF deve ter 11 dígitos numéricos");
      setLoading(false);
      return;
    }

    try {
      const response = await authRegister(email, password, username, cpf);

      // Store tokens
      setAuthTokens({
        token: response.accessToken,
        refreshToken: response.refreshToken,
      });

      // Store user info
      const user = {
        id: response.id.toString(),
        email: response.email,
        username: response.username,
        role: (response.roles?.[0] || "USER").replace("ROLE_", "") as
          | "ADMIN"
          | "MODERATOR"
          | "USER",
      };
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isAuthenticated", "true");

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao criar conta. Tente novamente."
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
            <CardTitle className="text-2xl">Criar Nova Conta</CardTitle>
            <CardDescription>Junte-se a milhões de viajantes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome de Usuário</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="João Silva"
                  className="h-10"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="h-10"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  type="text"
                  placeholder="12345678901"
                  className="h-10"
                  value={formData.cpf}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cpf: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  disabled={loading}
                  maxLength={11}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-10"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-10 bg-primary hover:bg-primary/90 cursor-pointer"
                disabled={loading}
              >
                {loading ? "Criando conta..." : "Criar Conta"}
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
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="w-full h-10 bg-transparent cursor-pointer"
                disabled={loading}
              >
                Voltar para Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
