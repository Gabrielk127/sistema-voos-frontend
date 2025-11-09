"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Home,
  Plane,
  PlaneTakeoff,
  Building2,
  Users,
  Ticket,
  Briefcase,
  LogOut,
  Menu,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { authLogout } from "@/lib/api-client";

interface MenuItem {
  icon: any;
  label: string;
  href: string;
  requiredRoles?: Array<"ADMIN" | "MODERATOR" | "USER">;
}

const menuItems: MenuItem[] = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },

  // ---- VOOS (Público - todos veem) ----
  { icon: Plane, label: "Voos", href: "/dashboard/flights" },

  // ---- RESERVAS E PASSAGENS (TODOS AUTENTICADOS) ----
  {
    icon: Ticket,
    label: "Passagens",
    href: "/dashboard/tickets",
    requiredRoles: ["ADMIN", "MODERATOR", "USER"],
  },
  {
    icon: BookOpen,
    label: "Reservas",
    href: "/dashboard/reservations",
    requiredRoles: ["ADMIN", "MODERATOR", "USER"],
  },

  // ---- ADMIN ONLY ----
  {
    icon: PlaneTakeoff,
    label: "Aeronaves",
    href: "/dashboard/aircraft",
    requiredRoles: ["ADMIN"],
  },
  {
    icon: Building2,
    label: "Aeroportos",
    href: "/dashboard/airports",
    requiredRoles: ["ADMIN"],
  },

  // ---- ADMIN/MODERATOR ----
  {
    icon: Users,
    label: "Passageiros",
    href: "/dashboard/passengers",
    requiredRoles: ["ADMIN", "MODERATOR"],
  },
  {
    icon: Briefcase,
    label: "Funcionários",
    href: "/dashboard/employees",
    requiredRoles: ["ADMIN", "MODERATOR"],
  },

  // ---- MASTER DATA (ADMIN ONLY) ----
  {
    icon: Plane,
    label: "Tipos de Aeronave",
    href: "/dashboard/aircraft-types",
    requiredRoles: ["ADMIN"],
  },
  {
    icon: Briefcase,
    label: "Categorias de Funcionário",
    href: "/dashboard/employee-categories",
    requiredRoles: ["ADMIN"],
  },
  {
    icon: Plane,
    label: "Tipos de Voo",
    href: "/dashboard/flight-types",
    requiredRoles: ["ADMIN"],
  },
  {
    icon: Users,
    label: "Tripulação de Voo",
    href: "/dashboard/flight-crews",
    requiredRoles: ["ADMIN"],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const { logout, user } = useAuth();
  const { hasRole } = usePermissions();

  const handleLogout = async () => {
    try {
      await authLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      logout();
    }
  };

  // Filtrar itens do menu baseado no role do usuário
  const visibleMenuItems = menuItems.filter((item) => {
    if (!item.requiredRoles) {
      return true; // Item sem restrição é visível para todos
    }
    return hasRole(item.requiredRoles as any);
  });

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(!open)}
          className="bg-white cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="p-2 bg-sidebar-primary rounded-lg">
                <Plane className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-sidebar-foreground">
                SkyHub
              </span>
            </Link>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-sidebar-border">
            <p className="text-sm font-medium text-sidebar-foreground">
              {user?.email}
            </p>
            <p className="text-xs text-sidebar-foreground/60 mt-1">
              {user?.role === "ADMIN" && "Administrador"}
              {user?.role === "MODERATOR" && "Moderador"}
              {user?.role === "USER" && "Usuário"}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
            {visibleMenuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 cursor-pointer ${
                    pathname === item.href
                      ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-sidebar-border">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
