"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CRUDLayout, type Field } from "@/components/crud-layout";
import {
  listEmployeeCategories,
  createEmployeeCategory,
  updateEmployeeCategory,
  deleteEmployeeCategory,
  type EmployeeCategory,
} from "@/lib/api-client";
import { Tag } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

export default function EmployeeCategoriesPage() {
  const [categories, setCategories] = useState<EmployeeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { canManageEmployees } = usePermissions();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await listEmployeeCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading employee categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fields: Field[] = [
    {
      name: "type",
      label: "Tipo",
      type: "text",
      placeholder: "Piloto",
      required: true,
      validation: (value: string) =>
        value.length >= 3 ? true : "Tipo deve ter no mínimo 3 caracteres",
    },
    {
      name: "description",
      label: "Descrição",
      type: "text",
      placeholder: "Descrição da categoria",
      required: false,
    },
  ];

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard" },
        { label: "Categorias de Funcionário" },
      ]}
    >
      <CRUDLayout
        title="Gerenciamento de Categorias de Funcionário"
        description="Administre as categorias de funcionários da companhia"
        icon={<Tag className="w-6 h-6" />}
        fields={fields}
        data={categories}
        loading={loading}
        onAdd={async (data: any) => {
          if (!canManageEmployees()) {
            alert("Você não tem permissão para criar categorias");
            return;
          }
          const categoryData: Omit<EmployeeCategory, "id"> = {
            type: data.type as string,
            description: data.description,
          };
          await createEmployeeCategory(categoryData);
          loadCategories();
        }}
        onEdit={async (id, data: any) => {
          if (!canManageEmployees()) {
            alert("Você não tem permissão para editar categorias");
            return;
          }
          const categoryData: Partial<EmployeeCategory> = {
            type: data.type as string,
            description: data.description,
          };
          await updateEmployeeCategory(id, categoryData);
          loadCategories();
        }}
        onDelete={async (id) => {
          if (!canManageEmployees()) {
            alert("Você não tem permissão para deletar categorias");
            return;
          }
          await deleteEmployeeCategory(id);
          loadCategories();
        }}
        displayFields={["id", "type", "description"]}
      />
    </DashboardLayout>
  );
}
