"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  listBookings,
  createBooking,
  deleteBooking,
  type Booking,
  type CreateBookingRequest,
  listPassengers,
  listFlights,
  type Passenger,
  type Flight,
} from "@/lib/api-client";
import { BookOpen, Plus, Trash2 } from "lucide-react";
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

export default function ReservationsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    idPassenger: "",
    idFlight: "",
    purchaseDate: "",
    totalAmount: "",
    paymentMethod: "",
  });

  const { canViewBookings, canCreateBookings, canDeleteBookings } =
    usePermissions();

  useEffect(() => {
    if (canViewBookings()) {
      loadData();
    } else {
      setError("Você não tem permissão para acessar reservas");
      setLoading(false);
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bookingsData, passengersData, flightsData] = await Promise.all([
        listBookings(),
        listPassengers(),
        listFlights(),
      ]);
      setBookings(bookingsData);
      setPassengers(passengersData);
      setFlights(flightsData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canCreateBookings()) {
      setMessage({ type: "error", text: "Você não tem permissão" });
      return;
    }

    if (
      !formData.idPassenger ||
      !formData.idFlight ||
      !formData.purchaseDate ||
      !formData.totalAmount ||
      !formData.paymentMethod
    ) {
      setMessage({ type: "error", text: "Preencha todos os campos" });
      return;
    }

    setSaving(true);
    try {
      // Garantir que totalAmount é sempre um número com 2 casas decimais
      const totalAmountValue = parseFloat(formData.totalAmount);
      if (isNaN(totalAmountValue) || totalAmountValue <= 0) {
        setMessage({ type: "error", text: "Valor total inválido" });
        setSaving(false);
        return;
      }

      const bookingData: CreateBookingRequest = {
        idPassenger: Number(formData.idPassenger),
        idFlight: Number(formData.idFlight),
        purchaseDate: formData.purchaseDate,
        totalAmount: totalAmountValue,
        paymentMethod: formData.paymentMethod,
      };

      console.log("[SUBMIT] Enviando:", bookingData);
      console.log("[SUBMIT] totalAmount tipo:", typeof bookingData.totalAmount);
      console.log("[SUBMIT] JSON:", JSON.stringify(bookingData));

      await createBooking(bookingData);

      setMessage({ type: "success", text: "Reserva criada com sucesso!" });
      setFormData({
        idPassenger: "",
        idFlight: "",
        purchaseDate: "",
        totalAmount: "",
        paymentMethod: "",
      });
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error("Error creating booking:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao criar reserva",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (!canDeleteBookings()) {
        setMessage({ type: "error", text: "Você não tem permissão" });
        return;
      }
      await deleteBooking(id);
      setMessage({ type: "success", text: "Reserva deletada com sucesso!" });
      await loadData();
    } catch (err) {
      console.error("Error deleting booking:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao deletar",
      });
    }
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }, { label: "Reservas" }]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Gerenciamento de Reservas</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Administre as reservas de passagens
              </p>
            </div>
          </div>

          {canCreateBookings() && (
            <Button
              onClick={() => setShowForm(!showForm)}
              className="gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Nova Reserva
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
              <CardTitle>Nova Reserva</CardTitle>
              <CardDescription>Preencha os dados da reserva</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Passageiro */}
                  <div className="space-y-2">
                    <Label htmlFor="passenger">Passageiro *</Label>
                    <select
                      id="passenger"
                      value={formData.idPassenger}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          idPassenger: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    >
                      <option value="">Selecione um passageiro</option>
                      {passengers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.username} ({p.email})
                        </option>
                      ))}
                    </select>
                  </div>

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
                          {f.departureDate} - {f.originAirport.code} →{" "}
                          {f.destinationAirport.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Data da Compra */}
                  <div className="space-y-2">
                    <Label htmlFor="purchaseDate">Data da Compra *</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purchaseDate: e.target.value,
                        })
                      }
                      disabled={saving}
                    />
                  </div>

                  {/* Valor Total */}
                  <div className="space-y-2">
                    <Label htmlFor="totalAmount">Valor Total *</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      step="0.01"
                      placeholder="700.90"
                      value={formData.totalAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalAmount: e.target.value,
                        })
                      }
                      disabled={saving}
                    />
                  </div>

                  {/* Método de Pagamento */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="paymentMethod">Método de Pagamento *</Label>
                    <select
                      id="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    >
                      <option value="">Selecione um método</option>
                      <option value="bank_slip">Boleto</option>
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
                    {saving ? "Salvando..." : "Criar Reserva"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Lista de Reservas</CardTitle>
            <CardDescription>
              {bookings.length} reservas encontradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-semibold">ID</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Passageiro
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">Voo</th>
                    <th className="text-left py-3 px-4 font-semibold">Data</th>
                    <th className="text-left py-3 px-4 font-semibold">Valor</th>
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
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8">
                        Nenhuma reserva encontrada
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">{booking.id}</td>
                        <td className="py-3 px-4">
                          {booking.passenger?.username || "—"}
                        </td>
                        <td className="py-3 px-4">
                          {booking.flight?.originAirport?.code} →{" "}
                          {booking.flight?.destinationAirport?.code || "—"}
                        </td>
                        <td className="py-3 px-4">{booking.purchaseDate}</td>
                        <td className="py-3 px-4">
                          R$ {booking.totalAmount?.toFixed(2) || "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {canDeleteBookings() && (
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
                                    onClick={() => handleDelete(booking.id)}
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
