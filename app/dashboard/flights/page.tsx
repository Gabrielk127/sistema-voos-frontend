"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  listFlights,
  createFlight,
  deleteFlight,
  type Flight,
  type CreateFlightRequest,
  listFlightTypes,
  listAircraftTypes,
  listAirports,
  type FlightType,
  type AircraftType,
  type Airport,
} from "@/lib/api-client";
import { Plane as PlaneIcon, Plus, Trash2 } from "lucide-react";
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

export default function FlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [flightTypes, setFlightTypes] = useState<FlightType[]>([]);
  const [aircraftTypes, setAircraftTypes] = useState<AircraftType[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    idFlightType: "",
    idAircraftType: "",
    idOriginAirport: "",
    idDestinationAirport: "",
    departureDate: "",
    scheduledDepartureTime: "",
    arrivalDate: "",
    scheduledArrivalTime: "",
    scheduledDurationMin: "",
    status: "SCHEDULED",
  });

  const { canCreateFlights, canDeleteFlights } = usePermissions();

  const getStatusDisplay = (status: string): string => {
    const statusMap: Record<string, string> = {
      SCHEDULED: "Agendado",
      IN_PROGRESS: "Em Progresso",
      COMPLETED: "Concluído",
      CANCELLED: "Cancelado",
    };
    return statusMap[status] || status;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [flightsData, typesData, aircraftData, airportsData] =
        await Promise.all([
          listFlights(),
          listFlightTypes(),
          listAircraftTypes(),
          listAirports(),
        ]);
      setFlights(flightsData);
      setFlightTypes(typesData);
      setAircraftTypes(aircraftData);
      setAirports(airportsData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string): string => {
    if (!time) return time;
    const parts = time.split(":");
    if (parts.length === 2) {
      return `${parts[0]}:${parts[1]}:00`;
    }
    return time;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canCreateFlights()) {
      setMessage({ type: "error", text: "Você não tem permissão" });
      return;
    }

    if (
      !formData.idFlightType ||
      !formData.idAircraftType ||
      !formData.idOriginAirport ||
      !formData.idDestinationAirport ||
      !formData.departureDate ||
      !formData.scheduledDepartureTime ||
      !formData.arrivalDate ||
      !formData.scheduledArrivalTime ||
      !formData.scheduledDurationMin
    ) {
      setMessage({ type: "error", text: "Preencha todos os campos" });
      return;
    }

    setSaving(true);
    try {
      const flightData: CreateFlightRequest = {
        idFlightType: Number(formData.idFlightType),
        idAircraftType: Number(formData.idAircraftType),
        idOriginAirport: Number(formData.idOriginAirport),
        idDestinationAirport: Number(formData.idDestinationAirport),
        departureDate: formData.departureDate,
        scheduledDepartureTime: formatTime(formData.scheduledDepartureTime),
        arrivalDate: formData.arrivalDate,
        scheduledArrivalTime: formatTime(formData.scheduledArrivalTime),
        scheduledDurationMin: formatTime(formData.scheduledDurationMin),
        status: formData.status,
      };

      console.log("[SUBMIT] Enviando voo:", flightData);
      await createFlight(flightData);

      setMessage({ type: "success", text: "Voo criado com sucesso!" });
      setFormData({
        idFlightType: "",
        idAircraftType: "",
        idOriginAirport: "",
        idDestinationAirport: "",
        departureDate: "",
        scheduledDepartureTime: "",
        arrivalDate: "",
        scheduledArrivalTime: "",
        scheduledDurationMin: "",
        status: "SCHEDULED",
      });
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error("Error creating flight:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao criar voo",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (!canDeleteFlights()) {
        setMessage({ type: "error", text: "Você não tem permissão" });
        return;
      }
      await deleteFlight(id);
      setMessage({ type: "success", text: "Voo deletado com sucesso!" });
      await loadData();
    } catch (err) {
      console.error("Error deleting flight:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao deletar",
      });
    }
  };

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard" }, { label: "Voos" }]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PlaneIcon className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Gerenciamento de Voos</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Administre os voos da companhia aérea
              </p>
            </div>
          </div>

          {canCreateFlights() && (
            <Button
              onClick={() => setShowForm(!showForm)}
              className="gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Novo Voo
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
              <CardTitle>Novo Voo</CardTitle>
              <CardDescription>Preencha os dados do voo</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tipo de Voo */}
                  <div className="space-y-2">
                    <Label htmlFor="flightType">Tipo de Voo *</Label>
                    <select
                      id="flightType"
                      value={formData.idFlightType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          idFlightType: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    >
                      <option value="">Selecione o tipo</option>
                      {flightTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tipo de Aeronave */}
                  <div className="space-y-2">
                    <Label htmlFor="aircraftType">Tipo de Aeronave *</Label>
                    <select
                      id="aircraftType"
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
                      <option value="">Selecione a aeronave</option>
                      {aircraftTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Aeroporto de Origem */}
                  <div className="space-y-2">
                    <Label htmlFor="originAirport">Aeroporto de Origem *</Label>
                    <select
                      id="originAirport"
                      value={formData.idOriginAirport}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          idOriginAirport: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    >
                      <option value="">Selecione origem</option>
                      {airports.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.code} - {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Aeroporto de Destino */}
                  <div className="space-y-2">
                    <Label htmlFor="destinationAirport">
                      Aeroporto de Destino *
                    </Label>
                    <select
                      id="destinationAirport"
                      value={formData.idDestinationAirport}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          idDestinationAirport: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    >
                      <option value="">Selecione destino</option>
                      {airports.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.code} - {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Data de Partida */}
                  <div className="space-y-2">
                    <Label htmlFor="departureDate">Data de Partida *</Label>
                    <Input
                      id="departureDate"
                      type="date"
                      value={formData.departureDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          departureDate: e.target.value,
                        })
                      }
                      disabled={saving}
                    />
                  </div>

                  {/* Hora de Partida */}
                  <div className="space-y-2">
                    <Label htmlFor="departureTime">Hora de Partida *</Label>
                    <Input
                      id="departureTime"
                      type="time"
                      value={formData.scheduledDepartureTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduledDepartureTime: e.target.value,
                        })
                      }
                      disabled={saving}
                    />
                  </div>

                  {/* Data de Chegada */}
                  <div className="space-y-2">
                    <Label htmlFor="arrivalDate">Data de Chegada *</Label>
                    <Input
                      id="arrivalDate"
                      type="date"
                      value={formData.arrivalDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          arrivalDate: e.target.value,
                        })
                      }
                      disabled={saving}
                    />
                  </div>

                  {/* Hora de Chegada */}
                  <div className="space-y-2">
                    <Label htmlFor="arrivalTime">Hora de Chegada *</Label>
                    <Input
                      id="arrivalTime"
                      type="time"
                      value={formData.scheduledArrivalTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduledArrivalTime: e.target.value,
                        })
                      }
                      disabled={saving}
                    />
                  </div>

                  {/* Duração */}
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração (hh:mm) *</Label>
                    <Input
                      id="duration"
                      type="time"
                      value={formData.scheduledDurationMin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduledDurationMin: e.target.value,
                        })
                      }
                      disabled={saving}
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    >
                      <option value="SCHEDULED">Agendado</option>
                      <option value="IN_PROGRESS">Em Progresso</option>
                      <option value="COMPLETED">Concluído</option>
                      <option value="CANCELLED">Cancelado</option>
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
                    {saving ? "Salvando..." : "Criar Voo"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Lista de Voos</CardTitle>
            <CardDescription>{flights.length} voos encontrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-semibold">ID</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Data de Partida
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Hora de Partida
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Data de Chegada
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Status
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
                  ) : flights.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8">
                        Nenhum voo encontrado
                      </td>
                    </tr>
                  ) : (
                    flights.map((flight) => (
                      <tr
                        key={flight.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">{flight.id}</td>
                        <td className="py-3 px-4">{flight.departureDate}</td>
                        <td className="py-3 px-4">
                          {flight.scheduledDepartureTime}
                        </td>
                        <td className="py-3 px-4">{flight.arrivalDate}</td>
                        <td className="py-3 px-4">
                          {getStatusDisplay(flight.status)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {canDeleteFlights() && (
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
                                    onClick={() => handleDelete(flight.id)}
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
