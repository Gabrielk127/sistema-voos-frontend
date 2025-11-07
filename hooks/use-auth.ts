"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authLogout, clearAuth } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  username: string;
  role: "ADMIN" | "MODERATOR" | "USER";
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAuth = localStorage.getItem("isAuthenticated");
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");

        console.log("[AUTH] LocalStorage check:", {
          isAuthenticated: isAuth,
          hasUserData: !!userData,
          hasToken: !!token,
        });

        if (isAuth && userData) {
          const parsedUser = JSON.parse(userData);
          console.log("[AUTH] Usuário autenticado:", parsedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          console.log("[AUTH] Não autenticado - dados faltando");
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("[AUTH] Erro ao verificar autenticação:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await authLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearAuth();
      setUser(null);
      setIsAuthenticated(false);
      router.push("/auth/login");
    }
  };

  return { user, isAuthenticated, isLoading, logout };
}
