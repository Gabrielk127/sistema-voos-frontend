"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  listFlightCrews,
  createFlightCrew,
  deleteFlightCrew,
  type FlightCrew,
  type CreateFlightCrewRequest,
  listFlights,
  listEmployees,
  type Flight,
  type Employee,
} from "@/lib/api-client";
import { Users, Plus, Trash2 } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function FlightCrewsPage() {
  const [crews, setCrews] = useState<FlightCrew[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    idFlight: "",
    idEmployee: "",
    role: "",
  });

  const { canCreateFlightCrews, canDeleteFlightCrews } = usePermissions();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [crewsData, flightsData, employeesData] = await Promise.all([
        listFlightCrews(),
        listFlights(),
        listEmployees(),
      ]);
      setCrews(crewsData);
      setFlights(flightsData);
      setEmployees(employeesData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canCreateFlightCrews()) {
      setMessage({ type: "error", text: "Você não tem permissão" });
      return;
    }

    if (!formData.idFlight || !formData.idEmployee) {
      setMessage({ type: "error", text: "Preencha todos os campos" });
      return;
    }

    setSaving(true);
    try {
      const crewData: CreateFlightCrewRequest = {
        idFlight: Number(formData.idFlight),
        idEmployee: Number(formData.idEmployee),
        role: formData.role,
      };

      console.log("[SUBMIT] Enviando tripulação:", crewData);
      await createFlightCrew(crewData);

      setMessage({ type: "success", text: "Tripulação criada com sucesso!" });
      setFormData({
        idFlight: "",
        idEmployee: "",
        role: "",
      });
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error("Error creating flight crew:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao criar tripulação",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (!canDeleteFlightCrews()) {
        setMessage({ type: "error", text: "Você não tem permissão" });
        return;
      }
      await deleteFlightCrew(id);
      setMessage({
        type: "success",
        text: "Tripulação deletada com sucesso!",
      });
      await loadData();
    } catch (err) {
      console.error("Error deleting flight crew:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao deletar",
      });
    }
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }, { label: "Tripulação de Voos" }]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">
                Gerenciamento de Tripulação
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Administre a tripulação dos voos
              </p>
            </div>
          </div>

          {canCreateFlightCrews() && (
            <Button
              onClick={() => setShowForm(!showForm)}
              className="gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Nova Tripulação
            </Button>
          )}
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Nova Tripulação</CardTitle>
              <CardDescription>Atribua funcionários a um voo</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Voo */}
                  <div className="space-y-2">
                    <Label htmlFor="flight">Voo *</Label>
                    <select
                      id="flight"
                      value={formData.idFlight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          idFlight: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    >
                      <option value="">Selecione um voo</option>
                      {flights.map((f) => (
                        <option key={f.id} value={f.id}>
                          Voo {f.id} - {f.departureDate}{" "}
                          {f.scheduledDepartureTime}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Funcionário */}
                  <div className="space-y-2">
                    <Label htmlFor="employee">Funcionário *</Label>
                    <select
                      id="employee"
                      value={formData.idEmployee}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          idEmployee: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    >
                      <option value="">Selecione um funcionário</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Função */}
                  <div className="space-y-2">
                    <Label htmlFor="role">Função *</Label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    >
                      <option value="">Selecione uma função</option>
                      <option value="piloto">Piloto</option>
                      <option value="co-piloto">Co-piloto</option>
                      <option value="comissario">Comissário</option>
                      <option value="mecanico">Mecânico</option>
                      <option value="engenheiro">Engenheiro</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Salvando..." : "Criar Tripulação"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Lista de Tripulação</CardTitle>
            <CardDescription>
              {crews.length} registros encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-semibold">ID</th>
                    <th className="text-left py-3 px-4 font-semibold">Voo</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Funcionário
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Função
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8">
                        Carregando...
                      </td>
                    </tr>
                  ) : crews.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8">
                        Nenhuma tripulação encontrada
                      </td>
                    </tr>
                  ) : (
                    crews.map((crew) => (
                      <tr key={crew.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{crew.id}</td>
                        <td className="py-3 px-4">
                          Voo {crew.flightId} - {crew.departureDate}
                        </td>
                        <td className="py-3 px-4">{crew.employeeName}</td>
                        <td className="py-3 px-4">{crew.employeeEmail}</td>
                        <td className="py-3 px-4">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            {crew.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {canDeleteFlightCrews() && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Deletar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Você tem certeza?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="flex gap-3 justify-end">
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(crew.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Deletar
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
