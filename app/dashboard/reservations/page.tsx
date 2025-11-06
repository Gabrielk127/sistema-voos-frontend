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
} from "@/lib/api-client";
import { BookOpen } from "lucide-react";

export default function ReservationsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await listBookings();
      setBookings(data);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fields: Field[] = [
    {
      name: "passageiroId",
      label: "ID do Passageiro",
      type: "number",
      placeholder: "1",
      required: true,
      validation: (value: string) =>
        Number(value) > 0 ? true : "ID deve ser um número positivo",
    },
    {
      name: "vooId",
      label: "ID do Voo",
      type: "number",
      placeholder: "1",
      required: true,
      validation: (value: string) =>
        Number(value) > 0 ? true : "ID deve ser um número positivo",
    },
    {
      name: "assento",
      label: "Assento",
      type: "text",
      placeholder: "12A",
      required: true,
      validation: (value: string) =>
        /^[0-9]{1,3}[A-Z]$/.test(value)
          ? true
          : "Formato de assento inválido (ex: 12A)",
    },
    {
      name: "dataReserva",
      label: "Data da Reserva",
      type: "datetime-local",
      required: true,
      validation: (value: string) =>
        value.length > 0 ? true : "Data é obrigatória",
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
        onAdd={async (data) => {
          await createBooking({
            passageiroId: Number(data.passageiroId),
            vooId: Number(data.vooId),
            assento: data.assento,
            dataReserva: data.dataReserva,
          });
          loadBookings();
        }}
        onEdit={async (id, data) => {
          await updateBooking(id, {
            passageiroId: Number(data.passageiroId),
            vooId: Number(data.vooId),
            assento: data.assento,
            dataReserva: data.dataReserva,
          });
          loadBookings();
        }}
        onDelete={async (id) => {
          await deleteBooking(id);
          loadBookings();
        }}
        displayFields={[
          "id",
          "passageiroId",
          "vooId",
          "assento",
          "dataReserva",
        ]}
      />
    </DashboardLayout>
  );
}
