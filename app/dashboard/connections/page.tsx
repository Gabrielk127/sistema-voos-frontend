"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import {
  listConnections,
  deleteConnection,
  Connection,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function ConnectionsPage() {
  const {
    canViewFlightCrews: canView,
    canCreateFlightCrews: canCreate,
    canDeleteFlightCrews: canDelete,
  } = usePermissions();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await listConnections();
      setConnections(data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar conexões"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await deleteConnection(deleteId);
      setConnections(connections.filter((c) => c.id !== deleteId));
      setDeleteId(null);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar");
    } finally {
      setDeleting(false);
    }
  };

  if (!canView()) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Conexões" }]}>
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
        { label: "Conexões" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Conexões</h1>
            <p className="text-muted-foreground">
              Gerenciamento de conexões entre aeroportos
            </p>
          </div>
          {canCreate() && (
            <Link href="/dashboard/connections/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Conexão
              </Button>
            </Link>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Lista de Conexões</CardTitle>
            <CardDescription>
              Total: {connections.length} conexão(ões)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : connections.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Nenhuma conexão cadastrada
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Distância</TableHead>
                    <TableHead>Tempo Estimado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connections.map((connection) => (
                    <TableRow key={connection.id}>
                      <TableCell className="font-medium">
                        {connection.id}
                      </TableCell>
                      <TableCell>
                        {connection.originAirport?.code ||
                          connection.originAirport?.name ||
                          "N/A"}
                      </TableCell>
                      <TableCell>
                        {connection.destinationAirport?.code ||
                          connection.destinationAirport?.name ||
                          "N/A"}
                      </TableCell>
                      <TableCell>{connection.distance || "N/A"} km</TableCell>
                      <TableCell>{connection.estimatedTime || "N/A"}</TableCell>
                      <TableCell className="flex gap-2">
                        {canCreate() && (
                          <Link
                            href={`/dashboard/connections/${connection.id}/edit`}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <Edit2 className="h-3 w-3" />
                              Editar
                            </Button>
                          </Link>
                        )}
                        {canDelete() && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(connection.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                            Deletar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta conexão? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
            <div className="flex justify-end gap-3">
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="gap-2"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Deletar
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
