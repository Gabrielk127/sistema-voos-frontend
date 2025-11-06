"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CRUDLayout, type Field } from "@/components/crud-layout";
import {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  type Employee,
} from "@/lib/api-client";
import { Users } from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await listEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Error loading employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const fields: Field[] = [
    {
      name: "nome",
      label: "Nome",
      type: "text",
      placeholder: "Maria Silva",
      required: true,
      validation: (value: string) =>
        value.length >= 3 ? true : "Nome deve ter no mínimo 3 caracteres",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "maria@email.com",
      required: true,
      validation: (value: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? true : "Email inválido",
    },
    {
      name: "cpf",
      label: "CPF",
      type: "text",
      placeholder: "12345678900",
      required: true,
      validation: (value: string) =>
        value.replace(/\D/g, "").length === 11
          ? true
          : "CPF deve ter 11 dígitos",
    },
    {
      name: "cargo",
      label: "Cargo",
      type: "text",
      placeholder: "Piloto",
      required: true,
      validation: (value: string) =>
        value.length >= 2 ? true : "Cargo deve ter no mínimo 2 caracteres",
    },
    {
      name: "dataAdmissao",
      label: "Data de Admissão",
      type: "date",
      required: true,
      validation: (value: string) => {
        const date = new Date(value);
        const today = new Date();
        return date <= today ? true : "Data não pode ser no futuro";
      },
    },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }, { label: "Funcionários" }]}
    >
      <CRUDLayout
        title="Gerenciamento de Funcionários"
        description="Administre a equipe da companhia"
        icon={<Users className="w-6 h-6" />}
        fields={fields}
        data={employees}
        loading={loading}
        onAdd={async (data) => {
          await createEmployee({
            nome: data.nome,
            email: data.email,
            cpf: data.cpf.replace(/\D/g, ""),
            cargo: data.cargo,
            dataAdmissao: data.dataAdmissao,
          });
          loadEmployees();
        }}
        onEdit={async (id, data) => {
          await updateEmployee(id, {
            nome: data.nome,
            email: data.email,
            cpf: data.cpf.replace(/\D/g, ""),
            cargo: data.cargo,
            dataAdmissao: data.dataAdmissao,
          });
          loadEmployees();
        }}
        onDelete={async (id) => {
          await deleteEmployee(id);
          loadEmployees();
        }}
        displayFields={["id", "nome", "email", "cargo", "dataAdmissao"]}
      />
    </DashboardLayout>
  );
}
