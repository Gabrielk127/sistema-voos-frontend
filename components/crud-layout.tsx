"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Pencil } from "lucide-react";
import { FormDialog, type FormField } from "@/components/form-dialog";

export interface Field {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "date" | "datetime-local";
  placeholder?: string;
  required?: boolean;
  validation?: (value: string) => string | true | null;
  section?: string;
  hint?: string;
  icon?: React.ReactNode;
}

interface CRUDLayoutProps<T = any> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  fields: Field[];
  data: T[];
  loading: boolean;
  onAdd: (data: T) => Promise<void>;
  onEdit: (id: number, data: T) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  displayFields: string[]; // Campos a mostrar na tabela
  renderTableRow?: (item: T) => React.ReactNode;
  rowActions?: (item: T) => React.ReactNode;
}

export function CRUDLayout<T = any>({
  title,
  description,
  icon,
  fields,
  data,
  loading,
  onAdd,
  onEdit,
  onDelete,
  displayFields,
  renderTableRow,
  rowActions,
}: CRUDLayoutProps<T>) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const resetForm = () => {
    setFormData({});
    setErrors({});
    setEditingId(null);
    setMessage(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    setOpen(newOpen);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    for (const field of fields) {
      const value = formData[field.name] || "";

      if (field.required && !value) {
        newErrors[field.name] = `${field.label} é obrigatório`;
        continue;
      }

      if (field.validation && value) {
        const error = field.validation(value);
        if (error && error !== true) {
          newErrors[field.name] = error;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingId) {
        await onEdit(editingId, formData);
        setMessage({ type: "success", text: "Atualizado com sucesso!" });
      } else {
        await onAdd(formData);
        setMessage({ type: "success", text: "Criado com sucesso!" });
      }

      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 1500);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao salvar",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData(item);
    setOpen(true);
  };

  const handleDelete = async (id: number, name?: string) => {
    try {
      await onDelete(id);
      setMessage({ type: "success", text: `Deletado com sucesso!` });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao deletar",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <div className="text-3xl">{icon}</div>}
          <div>
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={() => {
            setEditingId(null);
            setFormData({});
            handleOpenChange(true);
          }}
          className="gap-2 bg-primary hover:bg-primary/90 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          Adicionar Novo
        </Button>

        <FormDialog
          open={open}
          onOpenChange={handleOpenChange}
          title={title.replace("Gerenciamento de ", "")}
          description={description}
          fields={fields as FormField[]}
          data={formData}
          isEditing={editingId !== null}
          onSave={handleSave}
          icon={icon}
        />
      </div>

      {/* Tabela */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Lista de {title}</CardTitle>
          <CardDescription>{data.length} registros encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {displayFields.map((field) => (
                    <th
                      key={field}
                      className="text-left py-3 px-4 font-semibold text-muted-foreground"
                    >
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </th>
                  ))}
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={displayFields.length + 1}
                      className="text-center py-8"
                    >
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
                        <div
                          className="w-4 h-4 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-4 h-4 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                      <p className="text-muted-foreground mt-2">
                        Carregando...
                      </p>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={displayFields.length + 1}
                      className="text-center py-12"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-4xl">📭</div>
                        <p className="text-muted-foreground">
                          Nenhum registro encontrado
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr
                      key={(item as any).id}
                      className="border-b hover:bg-muted/50 transition-colors last:border-0"
                    >
                      {displayFields.map((field) => (
                        <td key={field} className="py-3 px-4 text-foreground">
                          {renderTableRow ? renderTableRow(item) : (item as any)[field]}
                        </td>
                      ))}
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            className="gap-1 cursor-pointer"
                          >
                            <Pencil className="w-3 h-3" />
                            Editar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                Deletar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Você tem certeza?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. O registro
                                  será deletado permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="flex gap-3 justify-end">
                                <AlertDialogCancel className="cursor-pointer">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDelete(
                                      (item as any).id,
                                      (item as any).nome || (item as any).codigo
                                    )
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                                >
                                  Deletar
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                          {rowActions && rowActions(item)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
