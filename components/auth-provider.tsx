"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  username: string;
  role: "ADMIN" | "MODERATOR" | "USER";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAuth = localStorage.getItem("isAuthenticated");
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");

        console.log("[AuthProvider] Verificando autenticação:", {
          hasAuth: !!isAuth,
          hasUserData: !!userData,
          hasToken: !!token,
        });

        if (isAuth === "true" && userData && token) {
          const parsedUser = JSON.parse(userData);
          console.log("[AuthProvider] ✅ Usuário encontrado:", {
            username: parsedUser.username,
            role: parsedUser.role,
            email: parsedUser.email,
          });
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          console.log("[AuthProvider] ❌ Nenhuma autenticação encontrada");
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("[AuthProvider] Erro ao verificar autenticação:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext deve ser usado dentro de AuthProvider");
  }
  return context;
}
