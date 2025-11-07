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
  type CreateFlightRequest,
  listFlightTypes,
  listAircraftTypes,
  listAirports,
} from "@/lib/api-client";
import { Plane as PlaneIcon } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

export default function FlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const { canCreateFlights, canEditFlights, canDeleteFlights } =
    usePermissions();

  const getStatusDisplay = (status: string): string => {
    const statusMap: Record<string, string> = {
      SCHEDULED: "Agendado",
      IN_PROGRESS: "Em Progresso",
      COMPLETED: "Concluído",
      CANCELLED: "Cancelado",
    };
    return statusMap[status] || status;
  };

  useEffect(() => {
    console.log("[FLIGHTS] Página montada, iniciando carregamento...");
    loadFlights();
  }, []);

  const loadFlights = async () => {
    try {
      setLoading(true);
      console.log("[FLIGHTS] Iniciando listFlights()...");
      const data = await listFlights();
      console.log("[FLIGHTS] Dados carregados:", data.length, "voos");
      setFlights(data);
    } catch (error) {
      console.error("[FLIGHTS] Erro ao carregar voos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fields: Field[] = [
    {
      name: "idFlightType",
      label: "Tipo de Voo",
      type: "select",
      placeholder: "Selecione o tipo",
      required: true,
      fetchOptions: () =>
        listFlightTypes().then((types) =>
          types.map((t) => ({ label: t.type, value: t.id.toString() }))
        ),
    },
    {
      name: "idAircraftType",
      label: "Tipo de Aeronave",
      type: "select",
      placeholder: "Selecione a aeronave",
      required: true,
      fetchOptions: () =>
        listAircraftTypes().then((types) =>
          types.map((t) => ({ label: `${t.type}`, value: t.id.toString() }))
        ),
    },
    {
      name: "idOriginAirport",
      label: "Aeroporto de Origem",
      type: "select",
      placeholder: "Selecione origem",
      required: true,
      fetchOptions: () =>
        listAirports().then((airports) =>
          airports.map((a) => ({
            label: `${a.code} - ${a.name}`,
            value: a.id.toString(),
          }))
        ),
    },
    {
      name: "idDestinationAirport",
      label: "Aeroporto de Destino",
      type: "select",
      placeholder: "Selecione destino",
      required: true,
      fetchOptions: () =>
        listAirports().then((airports) =>
          airports.map((a) => ({
            label: `${a.code} - ${a.name}`,
            value: a.id.toString(),
          }))
        ),
    },
    {
      name: "departureDate",
      label: "Data de Partida",
      type: "date",
      required: true,
    },
    {
      name: "scheduledDepartureTime",
      label: "Hora de Partida",
      type: "time",
      required: true,
    },
    {
      name: "arrivalDate",
      label: "Data de Chegada",
      type: "date",
      required: true,
    },
    {
      name: "scheduledArrivalTime",
      label: "Hora de Chegada",
      type: "time",
      required: true,
    },
    {
      name: "scheduledDurationMin",
      label: "Duração (hh:mm:ss)",
      type: "time",
      required: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      placeholder: "Selecione status",
      options: [
        { label: "Agendado", value: "SCHEDULED" },
        { label: "Em Progresso", value: "IN_PROGRESS" },
        { label: "Concluído", value: "COMPLETED" },
        { label: "Cancelado", value: "CANCELLED" },
      ],
      required: false,
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
        canAdd={canCreateFlights()}
        canEdit={canEditFlights()}
        canDelete={canDeleteFlights()}
        onAdd={async (data: any) => {
          console.log("🔷 [FLIGHTS] Iniciando criação com dados:", data);

          if (!canCreateFlights()) {
            alert("Você não tem permissão para criar voos");
            return;
          }
          const flightData: CreateFlightRequest = {
            idFlightType: Number(data.idFlightType),
            idAircraftType: Number(data.idAircraftType),
            idOriginAirport: Number(data.idOriginAirport),
            idDestinationAirport: Number(data.idDestinationAirport),
            departureDate: data.departureDate,
            scheduledDepartureTime: data.scheduledDepartureTime,
            arrivalDate: data.arrivalDate,
            scheduledArrivalTime: data.scheduledArrivalTime,
            scheduledDurationMin: data.scheduledDurationMin,
            status: data.status || "SCHEDULED",
          };

          console.log("🔷 [FLIGHTS] Dados formatados para enviar:", flightData);

          try {
            const result = await createFlight(flightData);
            console.log("🟢 [FLIGHTS] Voo criado com sucesso:", result);
            await loadFlights();
          } catch (error) {
            console.error("🔴 [FLIGHTS] Erro ao criar voo:", error);
            throw error;
          }
        }}
        onEdit={async (id, data: any) => {
          if (!canEditFlights()) {
            alert("Você não tem permissão para editar voos");
            return;
          }
          const flightData: Partial<CreateFlightRequest> = {
            idFlightType: Number(data.idFlightType),
            idAircraftType: Number(data.idAircraftType),
            idOriginAirport: Number(data.idOriginAirport),
            idDestinationAirport: Number(data.idDestinationAirport),
            departureDate: data.departureDate,
            scheduledDepartureTime: data.scheduledDepartureTime,
            arrivalDate: data.arrivalDate,
            scheduledArrivalTime: data.scheduledArrivalTime,
            scheduledDurationMin: data.scheduledDurationMin,
            status: data.status || "SCHEDULED",
          };
          await updateFlight(id, flightData);
          loadFlights();
        }}
        onDelete={async (id) => {
          if (!canDeleteFlights()) {
            alert("Você não tem permissão para deletar voos");
            return;
          }
          await deleteFlight(id);
          loadFlights();
        }}
        displayFields={[
          "id",
          "departureDate",
          "scheduledDepartureTime",
          "arrivalDate",
          "status",
        ]}
        fieldLabels={{
          id: "ID",
          departureDate: "Data de Partida",
          scheduledDepartureTime: "Hora de Partida",
          arrivalDate: "Data de Chegada",
          status: "Status",
        }}
      />
    </DashboardLayout>
  );
}
