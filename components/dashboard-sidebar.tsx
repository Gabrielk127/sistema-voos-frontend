"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Plane, PlaneTakeoff, Building2, Users, Ticket, Briefcase, Settings, LogOut, Menu } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { authLogout } from "@/lib/api-client"

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Plane, label: "Voos", href: "/dashboard/flights" },
  { icon: PlaneTakeoff, label: "Aeronaves", href: "/dashboard/aircraft" },
  { icon: Building2, label: "Aeroportos", href: "/dashboard/airports" },
  { icon: Users, label: "Passageiros", href: "/dashboard/passengers" },
  { icon: Ticket, label: "Reservas", href: "/dashboard/reservations" },
  { icon: Briefcase, label: "Funcionários", href: "/dashboard/employees" },
  { icon: Settings, label: "Configurações", href: "/dashboard/settings" },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await authLogout()
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      logout()
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="bg-white cursor-pointer">
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
            <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
              <div className="p-2 bg-sidebar-primary rounded-lg">
                <Plane className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-sidebar-foreground">SkyHub</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
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
  )
}
