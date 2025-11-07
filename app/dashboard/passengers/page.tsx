"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CRUDLayout } from "@/components/crud-layout";
import {
  listPassengers,
  createPassenger,
  updatePassenger,
  deletePassenger,
  type Passenger,
  type CreatePassengerRequest,
} from "@/lib/api-client";
import { usePermissions } from "@/hooks/use-permissions";
import { useRouter } from "next/navigation";

export default function PassengersPage() {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const { canViewPassengers, canManagePassengers } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!canViewPassengers()) {
      console.log("[PERMISSION] Acesso negado à página de passageiros. Role insuficiente.");
      router.push("/dashboard");
      return;
    }
    console.log("[PERMISSION] Acesso permitido à página de passageiros");
    loadPassengers();
  }, [canViewPassengers, router]);

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

  const handleAdd = async (formData: any) => {
    if (!canManagePassengers()) {
      alert("Você não tem permissão para criar passageiros");
      return;
    }
    await createPassenger(formData);
    await loadPassengers();
  };

  const handleEdit = async (id: number, formData: any) => {
    if (!canViewPassengers()) {
      alert("Você não tem permissão para editar passageiros");
      return;
    }
    await updatePassenger(id, formData);
    await loadPassengers();
  };

  const handleDelete = async (id: number) => {
    if (!canManagePassengers()) {
      alert("Você não tem permissão para deletar passageiros");
      return;
    }
    await deletePassenger(id);
    await loadPassengers();
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }, { label: "Passageiros" }]}
    >
      <CRUDLayout
        title="Gerenciamento de Passageiros"
        description="Cadastre, edite e gerencie todos os passageiros do sistema"
        icon="👥"
        fields={[
          {
            name: "username",
            label: "Nome de Usuário",
            type: "text",
            placeholder: "joao_silva",
            required: true,
            hint: "Nome único para login",
          },
          {
            name: "email",
            label: "Email",
            type: "email",
            placeholder: "joao@example.com",
            required: true,
            hint: "Email válido para contato",
          },
          {
            name: "cpf",
            label: "CPF",
            type: "text",
            placeholder: "12345678900",
            required: true,
            hint: "Apenas números (11 dígitos)",
            validation: (value: string) => {
              const cpfClean = value.replace(/\D/g, "");
              if (cpfClean.length !== 11) return "CPF deve ter 11 dígitos";
              return true;
            },
          },
          {
            name: "password",
            label: "Senha",
            type: "password",
            placeholder: "••••••••",
            required: false,
            hint: "Deixe em branco para manter a senha atual",
          },
        ]}
        data={passengers}
        loading={loading}
        canAdd={canManagePassengers()}
        canEdit={canManagePassengers()}
        canDelete={canManagePassengers()}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        displayFields={["id", "username", "email", "cpf"]}
      />
    </DashboardLayout>
  );
}
