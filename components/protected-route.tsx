"use client";

import type React from "react";

import { useAuthContext } from "@/components/auth-provider";
import { usePermissions, type Role } from "@/hooks/use-permissions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Role | Role[];
}

export function ProtectedRoute({
  children,
  requiredRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const { hasRole } = usePermissions();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Se ainda está carregando, não fazemos nada
    if (isLoading) {
      console.log("[ProtectedRoute] Ainda carregando autenticação...");
      return;
    }

    console.log("[ProtectedRoute] Verificação de auth concluída:", {
      isAuthenticated,
      requiredRoles,
    });

    // Se não está autenticado, redireciona para login
    if (!isAuthenticated) {
      console.log(
        "[ProtectedRoute] Não autenticado, redirecionando para login"
      );
      router.push("/auth/login");
      return;
    }

    // Se tem roles requeridas e não tem permissão
    if (requiredRoles && !hasRole(requiredRoles)) {
      console.log(
        "[ProtectedRoute] Sem permissão requerida, redirecionando para dashboard"
      );
      router.push("/dashboard");
      return;
    }

    console.log("[ProtectedRoute] Acesso permitido ✓");
    setIsChecking(false);
  }, [isLoading, isAuthenticated, requiredRoles, hasRole, router]);

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRoles && !hasRole(requiredRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
