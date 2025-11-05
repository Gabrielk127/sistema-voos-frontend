"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronRight, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { authLogout } from "@/lib/api-client"

interface DashboardHeaderProps {
  breadcrumbs: Array<{ label: string; href?: string }>
}

export function DashboardHeader({ breadcrumbs }: DashboardHeaderProps) {
  const [userName, setUserName] = useState("AD")
  const { logout } = useAuth()

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      const userData = JSON.parse(user)
      setUserName(userData.nome?.slice(0, 2).toUpperCase() || "AD")
    }
  }, [])

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
    <header className="sticky top-0 z-20 bg-white border-b border-border h-16 px-4 md:px-8 flex items-center justify-between">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            <span
              className={index === breadcrumbs.length - 1 ? "font-semibold text-foreground" : "text-muted-foreground"}
            >
              {crumb.label}
            </span>
          </div>
        ))}
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full cursor-pointer">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">{userName}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer">Meu Perfil</DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
