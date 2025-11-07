"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CRUDLayout, type Field } from "@/components/crud-layout";
import {
  listTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  listBookings,
  type Ticket,
  type CreateTicketRequest,
} from "@/lib/api-client";
import { Ticket as TicketIcon } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { canViewTickets, canCreateTickets, canManageTickets, hasRole } = usePermissions();

  useEffect(() => {
    if (canViewTickets()) {
      loadTickets();
    } else {
      setError("Você não tem permissão para acessar passagens");
      setLoading(false);
    }
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listTickets();
      setTickets(data);
    } catch (error) {
      console.error("Error loading tickets:", error);
      setError("Erro ao carregar passagens");
    } finally {
      setLoading(false);
    }
  };

  const fields: Field[] = [
    {
      name: "bookingId",
      label: "Reserva",
      type: "select",
      placeholder: "Selecione a reserva",
      required: true,
      fetchOptions: () =>
        listBookings()
          .then((bookings) =>
            bookings.map((b) => ({
              label: `${b.bookingNumber} - ${b.passenger.username}`,
              value: b.id.toString(),
            }))
          )
          .catch(() => []),
    },
    {
      name: "passengerName",
      label: "Nome do Passageiro",
      type: "text",
      placeholder: "João Silva",
      required: true,
      validation: (value: string) =>
        value.length >= 3 ? true : "Nome deve ter no mínimo 3 caracteres",
    },
    {
      name: "seatNumber",
      label: "Número do Assento",
      type: "number",
      placeholder: "12A",
      required: true,
    },
    {
      name: "checkInCompleted",
      label: "Check-in Realizado",
      type: "select",
      placeholder: "Selecione o status",
      options: [
        { label: "Não", value: "false" },
        { label: "Sim", value: "true" },
      ],
      required: false,
    },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }, { label: "Passagens" }]}
    >
      <CRUDLayout
        title="Gerenciamento de Passagens"
        description="Administre as passagens aéreas"
        icon={<TicketIcon className="w-6 h-6" />}
        fields={fields}
        data={tickets}
        loading={loading}
        canAdd={canCreateTickets()}
        canEdit={canManageTickets()}
        canDelete={canManageTickets()}
        onAdd={async (data: any) => {
          if (!canManageTickets()) {
            alert("Você não tem permissão para criar passagens");
            return;
          }
          const ticketData: CreateTicketRequest = {
            bookingId: Number(data.bookingId),
            passengerName: data.passengerName as string,
            seatNumber: Number(data.seatNumber),
            checkInCompleted:
              data.checkInCompleted === "true" ? true : false,
          };
          await createTicket(ticketData);
          loadTickets();
        }}
        onEdit={async (id, data: any) => {
          if (!canManageTickets()) {
            alert("Você não tem permissão para editar passagens");
            return;
          }
          const ticketData: Partial<CreateTicketRequest> = {
            bookingId: Number(data.bookingId),
            passengerName: data.passengerName as string,
            seatNumber: Number(data.seatNumber),
            checkInCompleted:
              data.checkInCompleted === "true" ? true : false,
          };
          await updateTicket(id, ticketData);
          loadTickets();
        }}
        onDelete={async (id) => {
          if (!canManageTickets()) {
            alert("Você não tem permissão para deletar passagens");
            return;
          }
          await deleteTicket(id);
          loadTickets();
        }}
        displayFields={[
          "id",
          "passengerName",
          "seatNumber",
          "checkInCompleted",
        ]}
      />
    </DashboardLayout>
  );
}
