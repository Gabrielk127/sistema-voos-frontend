"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  listEmployeeCategories,
  createEmployeeCategory,
  deleteEmployeeCategory,
  type EmployeeCategory,
} from "@/lib/api-client";
import { Tag, Plus, Trash2 } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function EmployeeCategoriesPage() {
  const [categories, setCategories] = useState<EmployeeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    type: "",
    description: "",
  });

  const { canCreateEmployeeCategories, canDeleteEmployeeCategories } =
    usePermissions();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await listEmployeeCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
      setMessage({
        type: "error",
        text: "Erro ao carregar categorias",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type.trim()) {
      setMessage({ type: "error", text: "Tipo é obrigatório" });
      return;
    }

    try {
      setSaving(true);
      const categoryData = {
        type: formData.type.toLowerCase(),
        description: formData.description || "",
      };

      console.log("[SUBMIT] Enviando:", categoryData);
      await createEmployeeCategory(categoryData);

      setMessage({
        type: "success",
        text: "Categoria criada com sucesso!",
      });

      setFormData({ type: "", description: "" });
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error("Error creating category:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao criar categoria",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta categoria?")) return;

    try {
      if (!canDeleteEmployeeCategories()) {
        setMessage({ type: "error", text: "Você não tem permissão" });
        return;
      }
      await deleteEmployeeCategory(id);
      setMessage({
        type: "success",
        text: "Categoria deletada com sucesso!",
      });
      await loadData();
    } catch (err) {
      console.error("Error deleting category:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao deletar",
      });
    }
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard" },
        { label: "Categorias de Funcionário" },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tag className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">
                Gerenciamento de Categorias
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Administre as categorias de funcionários da companhia
              </p>
            </div>
          </div>

          {canCreateEmployeeCategories() && (
            <Button
              onClick={() => setShowForm(!showForm)}
              className="gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Nova Categoria
            </Button>
          )}
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Nova Categoria</CardTitle>
              <CardDescription>
                Crie uma nova categoria de funcionário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <input
                    id="type"
                    type="text"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    placeholder="piloto, mecanico, comissario..."
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <input
                    id="description"
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descrição da categoria..."
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={saving}
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Salvando..." : "Criar Categoria"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Lista de Categorias</CardTitle>
            <CardDescription>
              {categories.length} registros encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando categorias...
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma categoria encontrada
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-semibold">ID</th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Tipo
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Descrição
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr
                        key={category.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">{category.id}</td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                            {category.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {category.description || "---"}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Deletar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
