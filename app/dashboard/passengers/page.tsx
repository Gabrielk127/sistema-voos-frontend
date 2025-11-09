"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CRUDLayoutSimple, type Field } from "@/components/crud-layout-simple";
import {
  listPassengers,
  createPassenger,
  updatePassenger,
  deletePassenger,
  type Passenger,
} from "@/lib/api-client";
import { usePermissions } from "@/hooks/use-permissions";

export default function PassengersPage() {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const { canCreatePassengers, canEditPassengers, canDeletePassengers } =
    usePermissions();

  useEffect(() => {
    loadPassengers();
  }, []);

  const loadPassengers = async () => {
    try {
      setLoading(true);
      const data = await listPassengers();
      setPassengers(data);
    } catch (error) {
      console.error("Error loading passengers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fields: Field[] = [
    {
      name: "username",
      label: "Nome de Usuário",
      type: "text",
      placeholder: "joao_silva",
      required: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "joao@example.com",
      required: true,
    },
    {
      name: "password",
      label: "Senha",
      type: "text",
      placeholder: "Mínimo 6 caracteres",
      required: true,
    },
    {
      name: "cpf",
      label: "CPF",
      type: "text",
      placeholder: "12345678900",
      required: true,
    },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }, { label: "Passageiros" }]}
    >
      <CRUDLayoutSimple
        title="Gerenciamento de Passageiros"
        description="Cadastre e gerencie passageiros"
        icon="👥"
        fields={fields}
        data={passengers}
        loading={loading}
        onAdd={async (data: any) => {
          if (!canCreatePassengers()) {
            alert("Você não tem permissão");
            return;
          }
          await createPassenger({
            username: data.username,
            email: data.email,
            password: data.password,
            cpf: data.cpf,
          });
          await loadPassengers();
        }}
        onEdit={async (id: number, data: any) => {
          if (!canEditPassengers()) {
            alert("Você não tem permissão");
            return;
          }
          await updatePassenger(id, {
            username: data.username,
            email: data.email,
            password: data.password,
            cpf: data.cpf,
          });
          await loadPassengers();
        }}
        onDelete={async (id: number) => {
          if (!canDeletePassengers()) {
            alert("Você não tem permissão");
            return;
          }
          await deletePassenger(id);
          await loadPassengers();
        }}
        displayFields={["id", "username", "email", "cpf"]}
      />
    </DashboardLayout>
  );
}
