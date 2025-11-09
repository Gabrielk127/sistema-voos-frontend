"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  listAircraft,
  listAircraftTypes,
  createAircraft,
  deleteAircraft,
  type Aircraft,
  type AircraftType,
} from "@/lib/api-client";
import { Plane, Plus, Trash2 } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function AircraftPage() {
  const [aircraftList, setAircraftList] = useState<Aircraft[]>([]);
  const [aircraftTypes, setAircraftTypes] = useState<AircraftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    registration: "",
    idAircraftType: "",
  });

  const { canCreateAircraft, canDeleteAircraft } = usePermissions();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [aircraftData, typesData] = await Promise.all([
        listAircraft(),
        listAircraftTypes(),
      ]);
      setAircraftList(aircraftData);
      setAircraftTypes(typesData);
    } catch (error) {
      console.error("Error loading data:", error);
      setMessage({
        type: "error",
        text: "Erro ao carregar aeronaves",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.registration.trim()) {
      setMessage({ type: "error", text: "Matrícula é obrigatória" });
      return;
    }

    if (!formData.idAircraftType) {
      setMessage({ type: "error", text: "Tipo de aeronave é obrigatório" });
      return;
    }

    try {
      setSaving(true);
      const aircraftData = {
        registration: formData.registration.toUpperCase(),
        idAircraftType: Number(formData.idAircraftType),
      };

      console.log("[SUBMIT] Enviando:", aircraftData);
      console.log("[SUBMIT] Registration:", aircraftData.registration);
      console.log(
        "[SUBMIT] idAircraftType:",
        aircraftData.idAircraftType,
        "type:",
        typeof aircraftData.idAircraftType
      );
      await createAircraft(aircraftData);

      setMessage({
        type: "success",
        text: "Aeronave criada com sucesso!",
      });

      setFormData({ registration: "", idAircraftType: "" });
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error("Error creating aircraft:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao criar aeronave",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta aeronave?")) return;

    try {
      if (!canDeleteAircraft()) {
        setMessage({ type: "error", text: "Você não tem permissão" });
        return;
      }
      await deleteAircraft(id);
      setMessage({
        type: "success",
        text: "Aeronave deletada com sucesso!",
      });
      await loadData();
    } catch (err) {
      console.error("Error deleting aircraft:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao deletar",
      });
    }
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }, { label: "Aeronaves" }]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plane className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Gerenciamento de Aeronaves</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Administre a frota de aeronaves
              </p>
            </div>
          </div>

          {canCreateAircraft() && (
            <Button
              onClick={() => setShowForm(!showForm)}
              className="gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Nova Aeronave
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
              <CardTitle>Nova Aeronave</CardTitle>
              <CardDescription>
                Cadastre uma nova aeronave na frota
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="registration">Matrícula *</Label>
                    <input
                      id="registration"
                      type="text"
                      value={formData.registration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          registration: e.target.value,
                        })
                      }
                      placeholder="PT-ABC"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idAircraftType">Tipo de Aeronave *</Label>
                    <select
                      id="idAircraftType"
                      value={formData.idAircraftType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          idAircraftType: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    >
                      <option value="">Selecione um tipo</option>
                      {aircraftTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.type}
                        </option>
                      ))}
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
                    {saving ? "Salvando..." : "Criar Aeronave"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Lista de Aeronaves</CardTitle>
            <CardDescription>
              {aircraftList.length} registros encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando aeronaves...
              </div>
            ) : aircraftList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma aeronave encontrada
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-semibold">ID</th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Matrícula
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Tipo
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Capacidade
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {aircraftList.map((aircraft) => (
                      <tr
                        key={aircraft.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">{aircraft.id}</td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
                            {aircraft.registration}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {aircraft.aircraftType?.type || "---"}
                        </td>
                        <td className="py-3 px-4">
                          {aircraft.aircraftType?.passengerCapacity || "---"}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(aircraft.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Deletar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
