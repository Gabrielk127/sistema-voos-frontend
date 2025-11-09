"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  listAircraftTypes,
  createAircraftType,
  deleteAircraftType,
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

export default function AircraftTypesPage() {
  const [aircraftTypes, setAircraftTypes] = useState<AircraftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    passengerCapacity: "",
    aircraftCategory: "",
    maxSpeed: "",
    rangeKm: "",
    cargoCapacityKg: "",
    maxAltitudeFt: "",
  });

  const { canCreateAircraftTypes, canDeleteAircraftTypes } = usePermissions();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await listAircraftTypes();
      setAircraftTypes(data);
    } catch (error) {
      console.error("Error loading aircraft types:", error);
      setMessage({
        type: "error",
        text: "Erro ao carregar tipos de aeronave",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type.trim()) {
      setMessage({ type: "error", text: "Tipo é obrigatório" });
      return;
    }

    if (!formData.passengerCapacity) {
      setMessage({
        type: "error",
        text: "Capacidade de passageiros é obrigatória",
      });
      return;
    }

    if (!formData.aircraftCategory) {
      setMessage({
        type: "error",
        text: "Categoria de aeronave é obrigatória",
      });
      return;
    }

    if (!formData.maxSpeed) {
      setMessage({ type: "error", text: "Velocidade máxima é obrigatória" });
      return;
    }

    if (!formData.rangeKm) {
      setMessage({ type: "error", text: "Alcance é obrigatório" });
      return;
    }

    if (!formData.cargoCapacityKg) {
      setMessage({ type: "error", text: "Capacidade de carga é obrigatória" });
      return;
    }

    if (!formData.maxAltitudeFt) {
      setMessage({ type: "error", text: "Altitude máxima é obrigatória" });
      return;
    }

    try {
      setSaving(true);
      const aircraftTypeData = {
        type: formData.type,
        description: formData.description || "",
        passengerCapacity: Number(formData.passengerCapacity),
        aircraftCategory: formData.aircraftCategory,
        maxSpeed: Number(formData.maxSpeed),
        rangeKm: Number(formData.rangeKm),
        cargoCapacityKg: Number(formData.cargoCapacityKg),
        maxAltitudeFt: Number(formData.maxAltitudeFt),
      };

      console.log("[SUBMIT] Enviando:", aircraftTypeData);
      await createAircraftType(aircraftTypeData);

      setMessage({
        type: "success",
        text: "Tipo de aeronave criado com sucesso!",
      });

      setFormData({
        type: "",
        description: "",
        passengerCapacity: "",
        aircraftCategory: "",
        maxSpeed: "",
        rangeKm: "",
        cargoCapacityKg: "",
        maxAltitudeFt: "",
      });
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error("Error creating aircraft type:", err);
      setMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "Erro ao criar tipo de aeronave",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este tipo de aeronave?"))
      return;

    try {
      if (!canDeleteAircraftTypes()) {
        setMessage({ type: "error", text: "Você não tem permissão" });
        return;
      }
      await deleteAircraftType(id);
      setMessage({
        type: "success",
        text: "Tipo de aeronave deletado com sucesso!",
      });
      await loadData();
    } catch (err) {
      console.error("Error deleting aircraft type:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao deletar",
      });
    }
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }, { label: "Tipos de Aeronave" }]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plane className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">
                Gerenciamento de Tipos de Aeronave
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Administre os tipos de aeronaves da companhia
              </p>
            </div>
          </div>

          {canCreateAircraftTypes() && (
            <Button
              onClick={() => setShowForm(!showForm)}
              className="gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Novo Tipo
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
              <CardTitle>Novo Tipo de Aeronave</CardTitle>
              <CardDescription>Crie um novo tipo de aeronave</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <input
                      id="type"
                      type="text"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      placeholder="Boeing 737, Airbus A320..."
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passengerCapacity">
                      Capacidade de Passageiros *
                    </Label>
                    <input
                      id="passengerCapacity"
                      type="number"
                      value={formData.passengerCapacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          passengerCapacity: e.target.value,
                        })
                      }
                      placeholder="180"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aircraftCategory">Categoria *</Label>
                    <select
                      id="aircraftCategory"
                      value={formData.aircraftCategory}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          aircraftCategory: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    >
                      <option value="">Selecione uma categoria</option>
                      <option value="COMERCIAL">Comercial</option>
                      <option value="CARGUEIRO">Cargueiro</option>
                      <option value="MILITAR">Militar</option>
                      <option value="REGIONAL">Regional</option>
                      <option value="EXECUTIVO">Executivo</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <input
                      id="description"
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Descrição da aeronave..."
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxSpeed">Velocidade Máxima (km/h) *</Label>
                    <input
                      id="maxSpeed"
                      type="number"
                      value={formData.maxSpeed}
                      onChange={(e) =>
                        setFormData({ ...formData, maxSpeed: e.target.value })
                      }
                      placeholder="900"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rangeKm">Alcance (km) *</Label>
                    <input
                      id="rangeKm"
                      type="number"
                      value={formData.rangeKm}
                      onChange={(e) =>
                        setFormData({ ...formData, rangeKm: e.target.value })
                      }
                      placeholder="10000"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cargoCapacityKg">
                      Capacidade de Carga (kg) *
                    </Label>
                    <input
                      id="cargoCapacityKg"
                      type="number"
                      value={formData.cargoCapacityKg}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cargoCapacityKg: e.target.value,
                        })
                      }
                      placeholder="50000"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxAltitudeFt">
                      Altitude Máxima (ft) *
                    </Label>
                    <input
                      id="maxAltitudeFt"
                      type="number"
                      value={formData.maxAltitudeFt}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxAltitudeFt: e.target.value,
                        })
                      }
                      placeholder="43000"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    />
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
                    {saving ? "Salvando..." : "Criar Tipo"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Lista de Tipos de Aeronave</CardTitle>
            <CardDescription>
              {aircraftTypes.length} registros encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando tipos de aeronave...
              </div>
            ) : aircraftTypes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum tipo de aeronave encontrado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-semibold">ID</th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Tipo
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Descrição
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Passageiros
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Vel. Máx.
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Alcance
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {aircraftTypes.map((aircraftType) => (
                      <tr
                        key={aircraftType.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">{aircraftType.id}</td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                            {aircraftType.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {aircraftType.description || "---"}
                        </td>
                        <td className="py-3 px-4">
                          {aircraftType.passengerCapacity || "---"}
                        </td>
                        <td className="py-3 px-4">
                          {aircraftType.maxSpeed || "---"}
                        </td>
                        <td className="py-3 px-4">
                          {aircraftType.rangeKm || "---"}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(aircraftType.id)}
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
