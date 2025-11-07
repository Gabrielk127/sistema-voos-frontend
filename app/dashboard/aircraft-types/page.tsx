"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CRUDLayout, type Field } from "@/components/crud-layout";
import {
  listAircraftTypes,
  createAircraftType,
  updateAircraftType,
  deleteAircraftType,
  type AircraftType,
} from "@/lib/api-client";
import { Plane as PlaneIcon } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

export default function AircraftTypesPage() {
  const [types, setTypes] = useState<AircraftType[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    canCreateAircraftTypes,
    canEditAircraftTypes,
    canDeleteAircraftTypes,
  } = usePermissions();

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      setLoading(true);
      const data = await listAircraftTypes();
      setTypes(data);
    } catch (error) {
      console.error("Error loading aircraft types:", error);
    } finally {
      setLoading(false);
    }
  };

  const fields: Field[] = [
    {
      name: "type",
      label: "Tipo",
      type: "text",
      placeholder: "Boeing 737",
      required: true,
      validation: (value: string) =>
        value.length >= 3 ? true : "Tipo deve ter no mínimo 3 caracteres",
    },
    {
      name: "description",
      label: "Descrição",
      type: "text",
      placeholder: "Descrição do tipo de aeronave",
      required: false,
    },
    {
      name: "passengerCapacity",
      label: "Capacidade de Passageiros",
      type: "number",
      placeholder: "180",
      required: false,
    },
    {
      name: "maxSpeed",
      label: "Velocidade Máxima (km/h)",
      type: "number",
      placeholder: "900",
      required: false,
    },
    {
      name: "rangeKm",
      label: "Alcance (km)",
      type: "number",
      placeholder: "10000",
      required: false,
    },
    {
      name: "cargoCapacityKg",
      label: "Capacidade de Carga (kg)",
      type: "number",
      placeholder: "50000",
      required: false,
    },
    {
      name: "maxAltitudeFt",
      label: "Altitude Máxima (ft)",
      type: "number",
      placeholder: "43000",
      required: false,
    },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }, { label: "Tipos de Aeronave" }]}
    >
      <CRUDLayout
        title="Gerenciamento de Tipos de Aeronave"
        description="Administre os tipos de aeronaves da companhia"
        icon={<PlaneIcon className="w-6 h-6" />}
        fields={fields}
        data={types}
        loading={loading}
        onAdd={async (data: any) => {
          if (!canCreateAircraftTypes()) {
            alert("Você não tem permissão para criar tipos de aeronave");
            return;
          }
          const typeData: Omit<AircraftType, "id"> = {
            type: data.type as string,
            description: data.description,
            passengerCapacity: data.passengerCapacity
              ? Number(data.passengerCapacity)
              : undefined,
            maxSpeed: data.maxSpeed ? Number(data.maxSpeed) : undefined,
            rangeKm: data.rangeKm ? Number(data.rangeKm) : undefined,
            cargoCapacityKg: data.cargoCapacityKg
              ? Number(data.cargoCapacityKg)
              : undefined,
            maxAltitudeFt: data.maxAltitudeFt
              ? Number(data.maxAltitudeFt)
              : undefined,
          };
          await createAircraftType(typeData);
          loadTypes();
        }}
        onEdit={async (id, data: any) => {
          if (!canEditAircraftTypes()) {
            alert("Você não tem permissão para editar tipos de aeronave");
            return;
          }
          const typeData: Partial<AircraftType> = {
            type: data.type as string,
            description: data.description,
            passengerCapacity: data.passengerCapacity
              ? Number(data.passengerCapacity)
              : undefined,
            maxSpeed: data.maxSpeed ? Number(data.maxSpeed) : undefined,
            rangeKm: data.rangeKm ? Number(data.rangeKm) : undefined,
            cargoCapacityKg: data.cargoCapacityKg
              ? Number(data.cargoCapacityKg)
              : undefined,
            maxAltitudeFt: data.maxAltitudeFt
              ? Number(data.maxAltitudeFt)
              : undefined,
          };
          await updateAircraftType(id, typeData);
          loadTypes();
        }}
        onDelete={async (id) => {
          if (!canDeleteAircraftTypes()) {
            alert("Você não tem permissão para deletar tipos de aeronave");
            return;
          }
          await deleteAircraftType(id);
          loadTypes();
        }}
        displayFields={["id", "type", "description", "passengerCapacity"]}
      />
    </DashboardLayout>
  );
}
