"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CRUDLayout, type Field } from "@/components/crud-layout";
import {
  listFlightTypes,
  createFlightType,
  updateFlightType,
  deleteFlightType,
  type FlightType,
} from "@/lib/api-client";
import { Plane as PlaneIcon } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

export default function FlightTypesPage() {
  const [types, setTypes] = useState<FlightType[]>([]);
  const [loading, setLoading] = useState(true);
  const { canCreateFlightTypes, canEditFlightTypes, canDeleteFlightTypes } =
    usePermissions();

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      setLoading(true);
      const data = await listFlightTypes();
      setTypes(data);
    } catch (error) {
      console.error("Error loading flight types:", error);
    } finally {
      setLoading(false);
    }
  };

  const fields: Field[] = [
    {
      name: "type",
      label: "Tipo",
      type: "text",
      placeholder: "Voo Nacional",
      required: true,
      validation: (value: string) =>
        value.length >= 3 ? true : "Tipo deve ter no mínimo 3 caracteres",
    },
    {
      name: "description",
      label: "Descrição",
      type: "text",
      placeholder: "Descrição do tipo de voo",
      required: false,
    },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }, { label: "Tipos de Voo" }]}
    >
      <CRUDLayout
        title="Gerenciamento de Tipos de Voo"
        description="Administre os tipos de voos da companhia"
        icon={<PlaneIcon className="w-6 h-6" />}
        fields={fields}
        data={types}
        loading={loading}
        onAdd={async (data: any) => {
          if (!canCreateFlightTypes()) {
            alert("Você não tem permissão para criar tipos de voo");
            return;
          }
          const typeData: Omit<FlightType, "id"> = {
            type: data.type as string,
            description: data.description,
          };
          await createFlightType(typeData);
          loadTypes();
        }}
        onEdit={async (id, data: any) => {
          if (!canEditFlightTypes()) {
            alert("Você não tem permissão para editar tipos de voo");
            return;
          }
          const typeData: Partial<FlightType> = {
            type: data.type as string,
            description: data.description,
          };
          await updateFlightType(id, typeData);
          loadTypes();
        }}
        onDelete={async (id) => {
          if (!canDeleteFlightTypes()) {
            alert("Você não tem permissão para deletar tipos de voo");
            return;
          }
          await deleteFlightType(id);
          loadTypes();
        }}
        displayFields={["id", "type", "description"]}
      />
    </DashboardLayout>
  );
}
