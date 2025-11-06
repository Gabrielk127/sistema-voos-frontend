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
} from "@/lib/api-client";

export default function PassengersPage() {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleAdd = async (formData: Omit<Passenger, "id">) => {
    await createPassenger(formData);
    await loadPassengers();
  };

  const handleEdit = async (id: number, formData: Omit<Passenger, "id">) => {
    await updatePassenger(id, formData);
    await loadPassengers();
  };

  const handleDelete = async (id: number) => {
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
          // Seção: Informações Pessoais
          {
            name: "nome",
            label: "Nome Completo",
            type: "text",
            placeholder: "João Silva Santos",
            required: true,
            section: "Informações Pessoais",
            icon: "👤",
            hint: "Nome como consta no documento de identidade",
            validation: (value: string) => {
              if (value.length < 3)
                return "Nome deve ter no mínimo 3 caracteres";
              if (!/^[a-zA-Z\s]+$/.test(value))
                return "Apenas letras e espaços";
              return true;
            },
          },
          {
            name: "email",
            label: "Email",
            type: "email",
            placeholder: "joao@example.com",
            required: true,
            section: "Informações Pessoais",
            icon: "📧",
            hint: "Email válido para contato",
            validation: (value: string) => {
              if (!value.includes("@")) return "Email inválido";
              return true;
            },
          },

          // Seção: Documentação
          {
            name: "cpf",
            label: "CPF",
            type: "text",
            placeholder: "12345678900",
            required: true,
            section: "Documentação",
            icon: "📄",
            hint: "Apenas números (11 dígitos)",
            validation: (value: string) => {
              const cpfClean = value.replace(/\D/g, "");
              if (cpfClean.length !== 11) return "CPF deve ter 11 dígitos";
              return true;
            },
          },
          {
            name: "dataAtendimento",
            label: "Data de Atendimento",
            type: "date",
            required: true,
            section: "Documentação",
            icon: "📅",
            hint: "Data do primeiro atendimento",
            validation: (value: string) => {
              const date = new Date(value);
              const today = new Date();
              return date <= today ? true : "Data não pode ser no futuro";
            },
          },
        ]}
        data={passengers}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        displayFields={["id", "nome", "email", "cpf", "dataAtendimento"]}
      />
    </DashboardLayout>
  );
}
