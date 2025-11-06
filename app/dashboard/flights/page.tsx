"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CRUDLayout, type Field } from "@/components/crud-layout";
import {
  listFlights,
  createFlight,
  updateFlight,
  deleteFlight,
  type Flight,
} from "@/lib/api-client";
import { Plane as PlaneIcon } from "lucide-react";

export default function FlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    try {
      setLoading(true);
      const data = await listFlights();
      setFlights(data);
    } catch (error) {
      console.error("Error loading flights:", error);
    } finally {
      setLoading(false);
    }
  };

  const fields: Field[] = [
    {
      name: "codigo",
      label: "Código",
      type: "text",
      placeholder: "AA123",
      required: true,
      validation: (value: string) =>
        /^[A-Z]{2}\d{3,4}$/.test(value)
          ? true
          : "Código deve ser formato AA123",
    },
    {
      name: "aeronaveId",
      label: "ID da Aeronave",
      type: "number",
      placeholder: "1",
      required: true,
      validation: (value: string) =>
        Number(value) > 0 ? true : "ID deve ser um número positivo",
    },
    {
      name: "aeroportoOrigemId",
      label: "ID Aeroporto Origem",
      type: "number",
      placeholder: "1",
      required: true,
      validation: (value: string) =>
        Number(value) > 0 ? true : "ID deve ser um número positivo",
    },
    {
      name: "aeroportoDestinoId",
      label: "ID Aeroporto Destino",
      type: "number",
      placeholder: "2",
      required: true,
      validation: (value: string) =>
        Number(value) > 0 ? true : "ID deve ser um número positivo",
    },
    {
      name: "dataPartida",
      label: "Data Partida",
      type: "datetime-local",
      required: true,
      validation: (value: string) =>
        new Date(value) > new Date() ? true : "Data deve ser no futuro",
    },
    {
      name: "dataChegada",
      label: "Data Chegada",
      type: "datetime-local",
      required: true,
      validation: (value: string) =>
        value.length > 0 ? true : "Data é obrigatória",
    },
    {
      name: "preco",
      label: "Preço",
      type: "number",
      placeholder: "500",
      required: true,
      validation: (value: string) =>
        Number(value) > 0 ? true : "Preço deve ser maior que 0",
    },
    {
      name: "assentosDisponiveis",
      label: "Assentos Disponíveis",
      type: "number",
      placeholder: "180",
      required: true,
      validation: (value: string) =>
        Number(value) > 0 ? true : "Assentos deve ser um número positivo",
    },
  ];

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard" }, { label: "Voos" }]}>
      <CRUDLayout
        title="Gerenciamento de Voos"
        description="Administre os voos da companhia aérea"
        icon={<PlaneIcon className="w-6 h-6" />}
        fields={fields}
        data={flights}
        loading={loading}
        onAdd={async (data) => {
          await createFlight({
            codigo: data.codigo,
            aeronaveId: Number(data.aeronaveId),
            aeroportoOrigemId: Number(data.aeroportoOrigemId),
            aeroportoDestinoId: Number(data.aeroportoDestinoId),
            dataPartida: data.dataPartida,
            dataChegada: data.dataChegada,
            preco: Number(data.preco),
            assentosDisponiveis: Number(data.assentosDisponiveis),
          });
          loadFlights();
        }}
        onEdit={async (id, data) => {
          await updateFlight(id, {
            codigo: data.codigo,
            aeronaveId: Number(data.aeronaveId),
            aeroportoOrigemId: Number(data.aeroportoOrigemId),
            aeroportoDestinoId: Number(data.aeroportoDestinoId),
            dataPartida: data.dataPartida,
            dataChegada: data.dataChegada,
            preco: Number(data.preco),
            assentosDisponiveis: Number(data.assentosDisponiveis),
          });
          loadFlights();
        }}
        onDelete={async (id) => {
          await deleteFlight(id);
          loadFlights();
        }}
        displayFields={[
          "id",
          "codigo",
          "aeroportoOrigemId",
          "aeroportoDestinoId",
          "dataPartida",
          "preco",
          "assentosDisponiveis",
        ]}
      />
    </DashboardLayout>
  );
}
