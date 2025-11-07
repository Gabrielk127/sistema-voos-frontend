"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CRUDLayoutSimple, type Field } from "@/components/crud-layout-simple";
import {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  type Employee,
} from "@/lib/api-client";
import { Users } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { canCreateEmployees, canEditEmployees, canDeleteEmployees } =
    usePermissions();

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
      name: "name",
      label: "Nome",
      type: "text",
      placeholder: "Maria Silva",
      required: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "maria@email.com",
      required: true,
    },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }, { label: "Funcionários" }]}
    >
      <CRUDLayoutSimple
        title="Gerenciamento de Funcionários"
        description="Administre a equipe da companhia"
        icon={<Users className="w-6 h-6" />}
        fields={fields}
        data={employees}
        loading={loading}
        onAdd={async (data: any) => {
          if (!canCreateEmployees()) {
            alert("Você não tem permissão");
            return;
          }
          await createEmployee({
            name: data.name,
            email: data.email,
          });
          await loadEmployees();
        }}
        onEdit={async (id: number, data: any) => {
          if (!canEditEmployees()) {
            alert("Você não tem permissão");
            return;
          }
          await updateEmployee(id, {
            name: data.name,
            email: data.email,
          });
          await loadEmployees();
        }}
        onDelete={async (id: number) => {
          if (!canDeleteEmployees()) {
            alert("Você não tem permissão");
            return;
          }
          await deleteEmployee(id);
          await loadEmployees();
        }}
        displayFields={["id", "name", "email"]}
      />
    </DashboardLayout>
  );
}
