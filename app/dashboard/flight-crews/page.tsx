"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CRUDLayout, type Field } from "@/components/crud-layout";
import {
  listFlightCrews,
  createFlightCrew,
  updateFlightCrew,
  deleteFlightCrew,
  listFlights,
  listEmployees,
  type FlightCrew,
  type CreateFlightCrewRequest,
} from "@/lib/api-client";
import { Users } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

export default function FlightCrewsPage() {
  const [crews, setCrews] = useState<FlightCrew[]>([]);
  const [loading, setLoading] = useState(true);
  const { canManageFlights } = usePermissions();

  useEffect(() => {
    loadCrews();
  }, []);

  const loadCrews = async () => {
    try {
      setLoading(true);
      const data = await listFlightCrews();
      setCrews(data);
    } catch (error) {
      console.error("Error loading flight crews:", error);
    } finally {
      setLoading(false);
    }
  };

  const fields: Field[] = [
    {
      name: "flightId",
      label: "Voo",
      type: "select",
      placeholder: "Selecione o voo",
      required: true,
      fetchOptions: () =>
        listFlights().then((flights) =>
          flights.map((f) => ({
            label: `${f.id} - ${f.departureDate}`,
            value: f.id.toString(),
          }))
        ),
    },
    {
      name: "employeeId",
      label: "Funcionário",
      type: "select",
      placeholder: "Selecione o funcionário",
      required: true,
      fetchOptions: () =>
        listEmployees().then((employees) =>
          employees.map((e) => ({
            label: e.name,
            value: e.id.toString(),
          }))
        ),
    },
    {
      name: "role",
      label: "Função",
      type: "select",
      placeholder: "Selecione a função",
      options: [
        { label: "Piloto", value: "PILOTO" },
        { label: "Co-piloto", value: "CO_PILOTO" },
        { label: "Comissário", value: "COMISSARIO" },
        { label: "Técnico", value: "TECNICO" },
      ],
      required: true,
    },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard" },
        { label: "Tripulação de Voo" },
      ]}
    >
      <CRUDLayout
        title="Gerenciamento de Tripulação de Voo"
        description="Administre a tripulação dos voos"
        icon={<Users className="w-6 h-6" />}
        fields={fields}
        data={crews}
        loading={loading}
        onAdd={async (data: any) => {
          if (!canManageFlights()) {
            alert("Você não tem permissão para criar tripulação");
            return;
          }
          const crewData: CreateFlightCrewRequest = {
            flightId: Number(data.flightId),
            employeeId: Number(data.employeeId),
            role: data.role as string,
          };
          await createFlightCrew(crewData);
          loadCrews();
        }}
        onEdit={async (id, data: any) => {
          if (!canManageFlights()) {
            alert("Você não tem permissão para editar tripulação");
            return;
          }
          const crewData: Partial<CreateFlightCrewRequest> = {
            flightId: Number(data.flightId),
            employeeId: Number(data.employeeId),
            role: data.role as string,
          };
          await updateFlightCrew(id, crewData);
          loadCrews();
        }}
        onDelete={async (id) => {
          if (!canManageFlights()) {
            alert("Você não tem permissão para deletar tripulação");
            return;
          }
          await deleteFlightCrew(id);
          loadCrews();
        }}
        displayFields={["id", "role"]}
      />
    </DashboardLayout>
  );
}
