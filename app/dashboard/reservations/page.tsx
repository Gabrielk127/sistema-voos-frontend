"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CRUDLayout, type Field } from "@/components/crud-layout";
import {
  listBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  type Booking,
  type CreateBookingRequest,
  listPassengers,
  listFlights,
} from "@/lib/api-client";
import { BookOpen } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

export default function ReservationsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    canViewBookings,
    canCreateBookings,
    canEditBookings,
    canDeleteBookings,
    hasRole,
  } = usePermissions();
  usePermissions();

  useEffect(() => {
    if (canViewBookings()) {
      loadBookings();
    } else {
      setError("Você não tem permissão para acessar reservas");
      setLoading(false);
    }
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listBookings();
      setBookings(data);
    } catch (error) {
      console.error("Error loading bookings:", error);
      setError("Erro ao carregar reservas");
    } finally {
      setLoading(false);
    }
  };

  const fields: Field[] = [
    {
      name: "passengerId",
      label: "Passageiro",
      type: "select",
      placeholder: "Selecione o passageiro",
      required: true,
      fetchOptions: () =>
        listPassengers()
          .then((passengers) =>
            passengers.map((p) => ({
              label: `${p.username} (${p.email})`,
              value: p.id.toString(),
            }))
          )
          .catch(() => []),
    },
    {
      name: "flightId",
      label: "Voo",
      type: "select",
      placeholder: "Selecione o voo",
      required: true,
      fetchOptions: () =>
        listFlights()
          .then((flights) =>
            flights.map((f) => ({
              label: `${f.departureDate} - ${f.originAirport.code} → ${f.destinationAirport.code}`,
              value: f.id.toString(),
            }))
          )
          .catch(() => []),
    },
    {
      name: "purchaseDate",
      label: "Data da Compra",
      type: "date",
      required: true,
    },
    {
      name: "totalAmount",
      label: "Valor Total",
      type: "number",
      placeholder: "0.00",
      required: true,
      validation: (value: string) =>
        Number(value) > 0 ? true : "Valor deve ser maior que 0",
    },
    {
      name: "paymentMethod",
      label: "Método de Pagamento",
      type: "select",
      placeholder: "Selecione",
      options: [
        { label: "Cartão de Crédito", value: "CREDIT_CARD" },
        { label: "Cartão de Débito", value: "DEBIT_CARD" },
        { label: "Boleto", value: "BOLETO" },
        { label: "Pix", value: "PIX" },
      ],
      required: false,
    },
    {
      name: "paymentStatus",
      label: "Status do Pagamento",
      type: "select",
      placeholder: "Selecione",
      options: [
        { label: "Pendente", value: "PENDING" },
        { label: "Confirmado", value: "CONFIRMED" },
        { label: "Cancelado", value: "CANCELLED" },
      ],
      required: false,
    },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }, { label: "Reservas" }]}
    >
      <CRUDLayout
        title="Gerenciamento de Reservas"
        description="Administre as reservas de passagens"
        icon={<BookOpen className="w-6 h-6" />}
        fields={fields}
        data={bookings}
        loading={loading}
        canAdd={canCreateBookings()}
        canEdit={canEditBookings()}
        canDelete={canDeleteBookings()}
        onAdd={async (data: any) => {
          if (!canCreateBookings()) {
            alert("Você não tem permissão para criar reservas");
            return;
          }
          const bookingData: CreateBookingRequest = {
            passengerId: Number(data.passengerId),
            flightId: Number(data.flightId),
            purchaseDate: data.purchaseDate,
            totalAmount: Number(data.totalAmount),
            paymentMethod: data.paymentMethod || "CREDIT_CARD",
            paymentStatus: data.paymentStatus || "PENDING",
          };
          await createBooking(bookingData);
          loadBookings();
        }}
        onEdit={async (id, data: any) => {
          if (!canEditBookings()) {
            alert("Você não tem permissão para editar reservas");
            return;
          }
          const bookingData: Partial<CreateBookingRequest> = {
            passengerId: Number(data.passengerId),
            flightId: Number(data.flightId),
            purchaseDate: data.purchaseDate,
            totalAmount: Number(data.totalAmount),
            paymentMethod: data.paymentMethod || "CREDIT_CARD",
            paymentStatus: data.paymentStatus || "PENDING",
          };
          await updateBooking(id, bookingData);
          loadBookings();
        }}
        onDelete={async (id) => {
          if (!canDeleteBookings()) {
            alert("Você não tem permissão para deletar reservas");
            return;
          }
          await deleteBooking(id);
          loadBookings();
        }}
        displayFields={["id", "purchaseDate", "totalAmount", "paymentStatus"]}
        fieldLabels={{
          id: "ID",
          purchaseDate: "Data da Compra",
          totalAmount: "Valor Total",
          paymentStatus: "Status do Pagamento",
        }}
      />
    </DashboardLayout>
  );
}
