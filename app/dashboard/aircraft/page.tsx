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
  type CreateAircraftRequest,
  listAircraftTypes,
} from "@/lib/api-client";
import { Plane } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { useRouter } from "next/navigation";

export default function AircraftPage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const { canManageFlights } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!canManageFlights()) {
      router.push("/dashboard");
      return;
    }
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
      name: "aircraftTypeId",
      label: "Tipo de Aeronave",
      type: "select",
      placeholder: "Selecione o tipo",
      required: true,
      fetchOptions: () =>
        listAircraftTypes().then((types) =>
          types.map((t) => ({
            label: `${t.code} - ${t.name}`,
            value: t.id.toString(),
          }))
        ),
    },
    {
      name: "registration",
      label: "Matrícula",
      type: "text",
      placeholder: "PT-AAA",
      required: true,
      validation: (value: string) =>
        /^[A-Z]{2}-[A-Z]{3}$/.test(value) || /^[A-Z]{5}$/.test(value)
          ? true
          : "Matrícula inválida (ex: PT-AAA ou PTAAA)",
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
        canAdd={canManageFlights()}
        canEdit={canManageFlights()}
        canDelete={canManageFlights()}
        onAdd={async (data: any) => {
          const aircraftData: CreateAircraftRequest = {
            aircraftTypeId: Number(data.aircraftTypeId),
            registration: data.registration,
          };
          await createAircraft(aircraftData);
          loadAircraft();
        }}
        onEdit={async (id, data: any) => {
          const aircraftData: Partial<CreateAircraftRequest> = {
            aircraftTypeId: Number(data.aircraftTypeId),
            registration: data.registration,
          };
          await updateAircraft(id, aircraftData);
          loadAircraft();
        }}
        onDelete={async (id) => {
          await deleteAircraft(id);
          loadAircraft();
        }}
        displayFields={["id", "registration"]}
      />
    </DashboardLayout>
  );
}
