import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard" }, { label: "Configurações" }]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Componente em construção...</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
