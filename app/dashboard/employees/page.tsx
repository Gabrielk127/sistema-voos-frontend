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
  type CreateEmployeeRequest,
  listEmployeeCategories,
} from "@/lib/api-client";
import { Users } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { useRouter } from "next/navigation";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { canViewEmployees, canManageEmployees } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!canViewEmployees()) {
      router.push("/dashboard");
      return;
    }
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
      name: "employeeCategoryId",
      label: "Categoria",
      type: "select",
      placeholder: "Selecione uma categoria",
      required: true,
      fetchOptions: () =>
        listEmployeeCategories().then((cats) =>
          cats.map((c) => ({ label: c.type, value: c.id.toString() }))
        ),
    },
    {
      name: "name",
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
        canAdd={canManageEmployees()}
        canEdit={canManageEmployees()}
        canDelete={canManageEmployees()}
        onAdd={async (data: any) => {
          if (!canManageEmployees()) {
            alert("Você não tem permissão para criar funcionários");
            return;
          }
          const employeeData: CreateEmployeeRequest = {
            employeeCategoryId: Number(data.employeeCategoryId),
            name: data.name as string,
            email: data.email as string,
          };
          await createEmployee(employeeData);
          loadEmployees();
        }}
        onEdit={async (id, data: any) => {
          if (!canManageEmployees()) {
            alert("Você não tem permissão para editar funcionários");
            return;
          }
          const employeeData: Partial<CreateEmployeeRequest> = {
            employeeCategoryId: Number(data.employeeCategoryId),
            name: data.name as string,
            email: data.email as string,
          };
          await updateEmployee(id, employeeData);
          loadEmployees();
        }}
        onDelete={async (id) => {
          if (!canManageEmployees()) {
            alert("Você não tem permissão para deletar funcionários");
            return;
          }
          await deleteEmployee(id);
          loadEmployees();
        }}
        displayFields={["id", "name", "email"]}
      />
    </DashboardLayout>
  );
}
