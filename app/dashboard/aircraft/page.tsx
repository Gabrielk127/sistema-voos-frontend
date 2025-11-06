"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CRUDLayout, type Field } from "@/components/crud-layout";
import {
  listAircraft,
  createAircraft,
  updateAircraft,
  deleteAircraft,
  type Aircraft,
} from "@/lib/api-client";
import { Plane } from "lucide-react";

export default function AircraftPage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAircraft();
  }, []);

  const loadAircraft = async () => {
    try {
      setLoading(true);
      const data = await listAircraft();
      setAircraft(data);
    } catch (error) {
      console.error("Error loading aircraft:", error);
    } finally {
      setLoading(false);
    }
  };

  const fields: Field[] = [
    {
      name: "modelo",
      label: "Modelo",
      type: "text",
      placeholder: "ex: Boeing 737",
      required: true,
      validation: (value: string) =>
        value.length >= 2 ? true : "Modelo deve ter no mínimo 2 caracteres",
    },
    {
      name: "fabricante",
      label: "Fabricante",
      type: "text",
      placeholder: "ex: Boeing",
      required: true,
      validation: (value: string) =>
        value.length >= 2 ? true : "Fabricante deve ter no mínimo 2 caracteres",
    },
    {
      name: "capacidade",
      label: "Capacidade",
      type: "number",
      placeholder: "180",
      required: true,
      validation: (value: string) =>
        !isNaN(Number(value)) && Number(value) > 0
          ? true
          : "Capacidade deve ser um número positivo",
    },
    {
      name: "anoFabricacao",
      label: "Ano de Fabricação",
      type: "number",
      placeholder: "2020",
      required: true,
      validation: (value: string) => {
        const year = Number(value);
        const currentYear = new Date().getFullYear();
        return year >= 1900 && year <= currentYear ? true : "Ano inválido";
      },
    },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }, { label: "Aeronaves" }]}
    >
      <CRUDLayout
        title="Gerenciamento de Aeronaves"
        description="Administre as aeronaves da frota"
        icon={<Plane className="w-6 h-6" />}
        fields={fields}
        data={aircraft}
        loading={loading}
        onAdd={async (data) => {
          await createAircraft({
            modelo: data.modelo,
            fabricante: data.fabricante,
            capacidade: Number(data.capacidade),
            anoFabricacao: Number(data.anoFabricacao),
          });
          loadAircraft();
        }}
        onEdit={async (id, data) => {
          await updateAircraft(id, {
            modelo: data.modelo,
            fabricante: data.fabricante,
            capacidade: Number(data.capacidade),
            anoFabricacao: Number(data.anoFabricacao),
          });
          loadAircraft();
        }}
        onDelete={async (id) => {
          await deleteAircraft(id);
          loadAircraft();
        }}
        displayFields={[
          "id",
          "modelo",
          "fabricante",
          "capacidade",
          "anoFabricacao",
        ]}
      />
    </DashboardLayout>
  );
}
