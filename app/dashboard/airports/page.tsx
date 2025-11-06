"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CRUDLayout, type Field } from "@/components/crud-layout";
import {
  listAirports,
  createAirport,
  updateAirport,
  deleteAirport,
  type Airport,
} from "@/lib/api-client";
import { Building2 } from "lucide-react";

export default function AirportsPage() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAirports();
  }, []);

  const loadAirports = async () => {
    try {
      setLoading(true);
      const data = await listAirports();
      setAirports(data);
    } catch (error) {
      console.error("Error loading airports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fields: Field[] = [
    {
      name: "nome",
      label: "Nome",
      type: "text",
      placeholder: "Aeroporto de São Paulo",
      required: true,
      validation: (value: string) =>
        value.length >= 3 ? true : "Nome deve ter no mínimo 3 caracteres",
    },
    {
      name: "codigo",
      label: "Código",
      type: "text",
      placeholder: "GRU",
      required: true,
      validation: (value: string) =>
        value.length === 3 ? true : "Código deve ter exatamente 3 caracteres",
    },
    {
      name: "cidade",
      label: "Cidade",
      type: "text",
      placeholder: "São Paulo",
      required: true,
      validation: (value: string) =>
        value.length >= 2 ? true : "Cidade deve ter no mínimo 2 caracteres",
    },
    {
      name: "pais",
      label: "País",
      type: "text",
      placeholder: "Brasil",
      required: true,
      validation: (value: string) =>
        value.length >= 2 ? true : "País deve ter no mínimo 2 caracteres",
    },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }, { label: "Aeroportos" }]}
    >
      <CRUDLayout
        title="Gerenciamento de Aeroportos"
        description="Administre os aeroportos da rede"
        icon={<Building2 className="w-6 h-6" />}
        fields={fields}
        data={airports}
        loading={loading}
        onAdd={async (data) => {
          await createAirport({
            nome: data.nome,
            codigo: data.codigo,
            cidade: data.cidade,
            pais: data.pais,
          });
          loadAirports();
        }}
        onEdit={async (id, data) => {
          await updateAirport(id, {
            nome: data.nome,
            codigo: data.codigo,
            cidade: data.cidade,
            pais: data.pais,
          });
          loadAirports();
        }}
        onDelete={async (id) => {
          await deleteAirport(id);
          loadAirports();
        }}
        displayFields={["id", "nome", "codigo", "cidade", "pais"]}
      />
    </DashboardLayout>
  );
}
