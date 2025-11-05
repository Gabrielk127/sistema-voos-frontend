"use client"

import type React from "react"
import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardHeader } from "./dashboard-header"
import { ProtectedRoute } from "./protected-route"

interface DashboardLayoutProps {
  children: React.ReactNode
  breadcrumbs: Array<{ label: string; href?: string }>
}

export function DashboardLayout({ children, breadcrumbs }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <div className="md:ml-64 flex flex-col min-h-screen">
          <DashboardHeader breadcrumbs={breadcrumbs} />
          <main className="flex-1 p-4 md:p-8 pt-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
