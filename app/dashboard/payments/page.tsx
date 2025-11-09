"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, AlertCircle } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function PaymentsPage() {
  const { canCreateBookings } = usePermissions();
  const [activeTab, setActiveTab] = useState("boleto");

  if (!canCreateBookings()) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Pagamentos" }]}>
        <div className="flex h-full items-center justify-center">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você não tem permissão para acessar esta página.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Pagamentos" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
            <p className="text-muted-foreground">
              Gerenciamento de pagamentos de reservas
            </p>
          </div>
          <Link href="/dashboard/payments/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Pagamento
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="boleto">Boleto</TabsTrigger>
            <TabsTrigger value="card">Cartão de Crédito</TabsTrigger>
          </TabsList>

          <TabsContent value="boleto" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pagamentos por Boleto</CardTitle>
                <CardDescription>
                  Visualize e gerencie pagamentos via boleto bancário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Integração de Boleto será implementada em breve.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="card" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pagamentos por Cartão de Crédito</CardTitle>
                <CardDescription>
                  Visualize e gerencie pagamentos via cartão de crédito
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Integração de Cartão será implementada em breve.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
