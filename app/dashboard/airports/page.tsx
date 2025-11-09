"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CRUDLayoutSimple, type Field } from "@/components/crud-layout-simple";
import {
  listAirports,
  createAirport,
  updateAirport,
  deleteAirport,
  type Airport,
} from "@/lib/api-client";
import { Globe } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

export default function AirportsPage() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const { canCreateAirports, canEditAirports, canDeleteAirports } =
    usePermissions();

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
      name: "code",
      label: "Código",
      type: "text",
      placeholder: "GRU",
      required: true,
    },
    {
      name: "name",
      label: "Nome do Aeroporto",
      type: "text",
      placeholder: "Aeroporto de Guarulhos",
      required: true,
    },
    {
      name: "city",
      label: "Cidade",
      type: "text",
      placeholder: "São Paulo",
      required: true,
    },
    {
      name: "state",
      label: "Estado",
      type: "text",
      placeholder: "SP",
      required: true,
    },
    {
      name: "country",
      label: "País",
      type: "text",
      placeholder: "Brasil",
      required: true,
    },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }, { label: "Aeroportos" }]}
    >
      <CRUDLayoutSimple
        title="Gerenciamento de Aeroportos"
        description="Cadastre e gerencie os aeroportos"
        icon={<Globe className="w-6 h-6" />}
        fields={fields}
        data={airports}
        loading={loading}
        onAdd={async (data: any) => {
          if (!canCreateAirports()) {
            alert("Você não tem permissão para criar aeroportos");
            return;
          }
          console.log("[AIRPORTS] Criando airport com:", data);
          await createAirport({
            code: data.code,
            name: data.name,
            city: data.city,
            state: data.state,
            country: data.country,
          });
          await loadAirports();
        }}
        onEdit={async (id: number, data: any) => {
          if (!canEditAirports()) {
            alert("Você não tem permissão para editar aeroportos");
            return;
          }
          await updateAirport(id, {
            code: data.code,
            name: data.name,
            city: data.city,
            state: data.state,
            country: data.country,
          });
          await loadAirports();
        }}
        onDelete={async (id: number) => {
          if (!canDeleteAirports()) {
            alert("Você não tem permissão para deletar aeroportos");
            return;
          }
          await deleteAirport(id);
          await loadAirports();
        }}
        displayFields={["id", "code", "name", "city", "country"]}
      />
    </DashboardLayout>
  );
}
