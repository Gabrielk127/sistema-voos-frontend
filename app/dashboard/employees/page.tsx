"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  type Employee,
} from "@/lib/api-client";
import { Users, Trash2, Edit2, Plus } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";

interface EmployeeForm {
  idEmployeeCategory: string;
  name: string;
  email: string;
}

const EMPLOYEE_CATEGORIES = [
  { value: "1", label: "Piloto" },
  { value: "2", label: "Co-Piloto" },
  { value: "3", label: "Comissário" },
  { value: "4", label: "Atendente" },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<EmployeeForm>({
    idEmployeeCategory: "",
    name: "",
    email: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.idEmployeeCategory || !formData.name || !formData.email) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        idEmployeeCategory: parseInt(formData.idEmployeeCategory),
        name: formData.name,
        email: formData.email,
      };

      console.log("[EMPLOYEE-SUBMIT]", JSON.stringify(payload, null, 2));

      if (editingId) {
        if (!canEditEmployees()) {
          alert("Você não tem permissão para editar");
          return;
        }
        await updateEmployee(editingId, payload);
      } else {
        if (!canCreateEmployees()) {
          alert("Você não tem permissão para criar");
          return;
        }
        await createEmployee(payload);
      }

      setFormData({ idEmployeeCategory: "", name: "", email: "" });
      setEditingId(null);
      await loadEmployees();
    } catch (error) {
      console.error("Error:", error);
      alert("Erro ao processar funcionário");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    if (!canEditEmployees()) {
      alert("Você não tem permissão");
      return;
    }
    setFormData({
      idEmployeeCategory: "", // Precisa do ID da categoria, mas não vem no response
      name: employee.name,
      email: employee.email,
    });
    setEditingId(employee.id);
  };

  const handleDelete = async (id: number) => {
    if (!canDeleteEmployees()) {
      alert("Você não tem permissão");
      return;
    }
    if (confirm("Tem certeza que deseja deletar?")) {
      try {
        await deleteEmployee(id);
        await loadEmployees();
      } catch (error) {
        console.error("Error:", error);
        alert("Erro ao deletar funcionário");
      }
    }
  };

  const handleCancel = () => {
    setFormData({ idEmployeeCategory: "", name: "", email: "" });
    setEditingId(null);
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }, { label: "Funcionários" }]}
    >
      <div className="space-y-6">
        {/* Form Card */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            <h2 className="text-lg font-semibold">
              {editingId ? "Editar Funcionário" : "Novo Funcionário"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <select
                  id="category"
                  value={formData.idEmployeeCategory}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      idEmployeeCategory: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {EMPLOYEE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Maria Silva"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="maria@email.com"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {editingId ? "Atualizar" : "Criar"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Data Table */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Funcionários</h2>
          {loading ? (
            <p className="text-gray-500">Carregando...</p>
          ) : employees.length === 0 ? (
            <p className="text-gray-500">Nenhum funcionário cadastrado</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>{employee.id}</TableCell>
                      <TableCell>
                        {employee.categoriaFuncionario?.type || "-"}
                      </TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(employee)}
                            disabled={!canEditEmployees()}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(employee.id)}
                            disabled={!canDeleteEmployees()}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
