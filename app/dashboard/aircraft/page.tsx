"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CRUDLayoutSimple, type Field } from "@/components/crud-layout-simple";
import {
  listAircraft,
  createAircraft,
  updateAircraft,
  deleteAircraft,
  type Aircraft,
} from "@/lib/api-client";
import { Plane } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

export default function AircraftPage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const { canCreateAircraft, canEditAircraft, canDeleteAircraft } =
    usePermissions();

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
      name: "registration",
      label: "Matrícula",
      type: "text",
      placeholder: "PT-ABC",
      required: true,
    },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }, { label: "Aeronaves" }]}
    >
      <CRUDLayoutSimple
        title="Gerenciamento de Aeronaves"
        description="Administre as aeronaves da frota"
        icon={<Plane className="w-6 h-6" />}
        fields={fields}
        data={aircraft}
        loading={loading}
        onAdd={async (data: any) => {
          if (!canCreateAircraft()) {
            alert("Você não tem permissão");
            return;
          }
          await createAircraft({
            registration: data.registration,
          });
          await loadAircraft();
        }}
        onEdit={async (id: number, data: any) => {
          if (!canEditAircraft()) {
            alert("Você não tem permissão");
            return;
          }
          await updateAircraft(id, {
            registration: data.registration,
          });
          await loadAircraft();
        }}
        onDelete={async (id: number) => {
          if (!canDeleteAircraft()) {
            alert("Você não tem permissão");
            return;
          }
          await deleteAircraft(id);
          await loadAircraft();
        }}
        displayFields={["id", "registration"]}
      />
    </DashboardLayout>
  );
}
