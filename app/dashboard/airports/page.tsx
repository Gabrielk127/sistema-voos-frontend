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
import { Globe } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { useRouter } from "next/navigation";

export default function AirportsPage() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const { canManageFlights } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!canManageFlights()) {
      router.push("/dashboard");
      return;
    }
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
      validation: (value: string) =>
        value.length === 3 ? true : "Código deve ter exatamente 3 letras",
    },
    {
      name: "name",
      label: "Nome do Aeroporto",
      type: "text",
      placeholder: "Aeroporto de Guarulhos",
      required: true,
      validation: (value: string) =>
        value.length >= 5
          ? true
          : "Nome deve ter no mínimo 5 caracteres",
    },
    {
      name: "city",
      label: "Cidade",
      type: "text",
      placeholder: "São Paulo",
      required: true,
    },
    {
      name: "country",
      label: "País",
      type: "text",
      placeholder: "Brasil",
      required: true,
    },
    {
      name: "description",
      label: "Descrição",
      type: "text",
      placeholder: "Descrição do aeroporto",
      required: false,
    },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }, { label: "Aeroportos" }]}
    >
      <CRUDLayout
        title="Gerenciamento de Aeroportos"
        description="Cadastre e gerencie os aeroportos"
        icon={<Globe className="w-6 h-6" />}
        fields={fields}
        data={airports}
        loading={loading}
        onAdd={async (data: any) => {
          if (!canManageFlights()) {
            alert("Você não tem permissão para criar aeroportos");
            return;
          }
          await createAirport({
            code: data.code,
            name: data.name,
            city: data.city,
            country: data.country,
            description: data.description,
          });
          loadAirports();
        }}
        onEdit={async (id, data: any) => {
          if (!canManageFlights()) {
            alert("Você não tem permissão para editar aeroportos");
            return;
          }
          await updateAirport(id, {
            code: data.code,
            name: data.name,
            city: data.city,
            country: data.country,
            description: data.description,
          });
          loadAirports();
        }}
        onDelete={async (id) => {
          if (!canManageFlights()) {
            alert("Você não tem permissão para deletar aeroportos");
            return;
          }
          await deleteAirport(id);
          loadAirports();
        }}
        displayFields={["id", "code", "name", "city", "country"]}
      />
    </DashboardLayout>
  );
}
