"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  listTickets,
  createTicket,
  deleteTicket,
  type Ticket,
  type CreateTicketRequest,
  listBookings,
  type Booking,
} from "@/lib/api-client";
import { Ticket as TicketIcon, Plus, Trash2 } from "lucide-react";
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

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    idBooking: "",
    passengerName: "",
    seatNumber: "",
    checkInCompleted: "false",
  });

  const { canViewTickets, canCreateTickets, canDeleteTickets } =
    usePermissions();

  useEffect(() => {
    if (canViewTickets()) {
      loadData();
    } else {
      setError("Você não tem permissão para acessar passagens");
      setLoading(false);
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ticketsData, bookingsData] = await Promise.all([
        listTickets(),
        listBookings(),
      ]);
      setTickets(ticketsData);
      setBookings(bookingsData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canCreateTickets()) {
      setMessage({ type: "error", text: "Você não tem permissão" });
      return;
    }

    if (
      !formData.idBooking ||
      !formData.passengerName ||
      !formData.seatNumber
    ) {
      setMessage({ type: "error", text: "Preencha todos os campos" });
      return;
    }

    setSaving(true);
    try {
      const seatNumber = parseInt(formData.seatNumber);
      if (isNaN(seatNumber) || seatNumber <= 0) {
        setMessage({ type: "error", text: "Número do assento inválido" });
        setSaving(false);
        return;
      }

      const ticketData: CreateTicketRequest = {
        idBooking: Number(formData.idBooking),
        passengerName: formData.passengerName,
        seatNumber: seatNumber,
        checkInCompleted: formData.checkInCompleted === "true",
      };

      console.log("[SUBMIT] Enviando ticket:", ticketData);
      await createTicket(ticketData);

      setMessage({ type: "success", text: "Passagem criada com sucesso!" });
      setFormData({
        idBooking: "",
        passengerName: "",
        seatNumber: "",
        checkInCompleted: "false",
      });
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error("Error creating ticket:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao criar passagem",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (!canDeleteTickets()) {
        setMessage({ type: "error", text: "Você não tem permissão" });
        return;
      }
      await deleteTicket(id);
      setMessage({ type: "success", text: "Passagem deletada com sucesso!" });
      await loadData();
    } catch (err) {
      console.error("Error deleting ticket:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao deletar",
      });
    }
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }, { label: "Passagens" }]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TicketIcon className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Gerenciamento de Passagens</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Administre as passagens aéreas
              </p>
            </div>
          </div>

          {canCreateTickets() && (
            <Button
              onClick={() => setShowForm(!showForm)}
              className="gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Nova Passagem
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
              <CardTitle>Nova Passagem</CardTitle>
              <CardDescription>Preencha os dados da passagem</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Reserva */}
                  <div className="space-y-2">
                    <Label htmlFor="booking">Reserva *</Label>
                    <select
                      id="booking"
                      value={formData.idBooking}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          idBooking: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    >
                      <option value="">Selecione uma reserva</option>
                      {bookings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bookingNumber} - {b.passenger?.username || "—"}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nome do Passageiro */}
                  <div className="space-y-2">
                    <Label htmlFor="passengerName">Nome do Passageiro *</Label>
                    <Input
                      id="passengerName"
                      type="text"
                      placeholder="João Silva"
                      value={formData.passengerName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          passengerName: e.target.value,
                        })
                      }
                      disabled={saving}
                    />
                  </div>

                  {/* Número do Assento */}
                  <div className="space-y-2">
                    <Label htmlFor="seatNumber">Número do Assento *</Label>
                    <Input
                      id="seatNumber"
                      type="number"
                      placeholder="12"
                      value={formData.seatNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seatNumber: e.target.value,
                        })
                      }
                      disabled={saving}
                    />
                  </div>

                  {/* Check-in Realizado */}
                  <div className="space-y-2">
                    <Label htmlFor="checkIn">Check-in Realizado *</Label>
                    <select
                      id="checkIn"
                      value={formData.checkInCompleted}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          checkInCompleted: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    >
                      <option value="false">Não</option>
                      <option value="true">Sim</option>
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
                    {saving ? "Salvando..." : "Criar Passagem"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Lista de Passagens</CardTitle>
            <CardDescription>
              {tickets.length} passagens encontradas
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
                    <th className="text-left py-3 px-4 font-semibold">
                      Assento
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Check-in
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8">
                        Carregando...
                      </td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8">
                        Nenhuma passagem encontrada
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">{ticket.id}</td>
                        <td className="py-3 px-4">{ticket.passengerName}</td>
                        <td className="py-3 px-4">{ticket.seatNumber}</td>
                        <td className="py-3 px-4">
                          {ticket.checkInCompleted ? "✅ Sim" : "❌ Não"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {canDeleteTickets() && (
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
                                    onClick={() => handleDelete(ticket.id)}
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
