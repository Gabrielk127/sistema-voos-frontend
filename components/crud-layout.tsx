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
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "date"
    | "datetime-local"
    | "time"
    | "select";
  placeholder?: string;
  required?: boolean;
  validation?: (value: string) => string | true | null;
  section?: string;
  hint?: string;
  icon?: React.ReactNode;
  options?: Array<{ label: string; value: string }>;
  fetchOptions?: () => Promise<Array<{ label: string; value: string }>>;
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
  fieldLabels?: Record<string, string>; // Mapa de nomes das colunas em português
  renderTableRow?: (item: T) => React.ReactNode;
  rowActions?: (item: T) => React.ReactNode;
  canAdd?: boolean; // Mostrar botão "Adicionar"
  canEdit?: boolean; // Mostrar botão "Editar"
  canDelete?: boolean; // Mostrar botão "Deletar"
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
  fieldLabels = {},
  renderTableRow,
  rowActions,
  canAdd = true,
  canEdit = true,
  canDelete = true,
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
    // Inicializar formData com todos os campos vazios
    const emptyData: Record<string, any> = {};
    fields.forEach((field) => {
      emptyData[field.name] = "";
    });
    setFormData(emptyData);
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

  const getDisplayValue = (field: string, value: any): any => {
    // Transformar status em português
    if (field === "status") {
      const statusMap: Record<string, string> = {
        SCHEDULED: "Agendado",
        IN_PROGRESS: "Em Progresso",
        COMPLETED: "Concluído",
        CANCELLED: "Cancelado",
      };
      return statusMap[value] || value;
    }

    // Evitar exibir undefined ou null
    if (value === undefined) {
      console.warn(`[CRUD-LAYOUT] Valor undefined para campo: ${field}`);
      return "---";
    }
    if (value === null) {
      return "---";
    }

    return value;
  };

  const handleSave = async () => {
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

        {canAdd && (
          <Button
            onClick={() => {
              setEditingId(null);
              // Inicializar formData com todos os campos vazios
              const emptyData: Record<string, any> = {};
              fields.forEach((field) => {
                emptyData[field.name] = "";
              });
              setFormData(emptyData);
              handleOpenChange(true);
            }}
            className="gap-2 bg-primary hover:bg-primary/90 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            Adicionar Novo
          </Button>
        )}

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
                      {fieldLabels[field] ||
                        field.charAt(0).toUpperCase() + field.slice(1)}
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
                  data.map((item, index) => {
                    return (
                      <tr
                        key={(item as any).id}
                        className="border-b hover:bg-muted/50 transition-colors last:border-0"
                      >
                        {displayFields.map((field) => {
                          const value = (item as any)[field];
                          return (
                            <td
                              key={field}
                              className="py-3 px-4 text-sm font-medium text-foreground/90"
                            >
                              {renderTableRow
                                ? renderTableRow(item)
                                : String(getDisplayValue(field, value))}
                            </td>
                          );
                        })}
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            {canEdit && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(item)}
                                className="gap-1 cursor-pointer"
                              >
                                <Pencil className="w-3 h-3" />
                                Editar
                              </Button>
                            )}
                            {canDelete && (
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
                                      Esta ação não pode ser desfeita. O
                                      registro será deletado permanentemente.
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
                                          (item as any).nome ||
                                            (item as any).codigo
                                        )
                                      }
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                                    >
                                      Deletar
                                    </AlertDialogAction>
                                  </div>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            {rowActions && rowActions(item)}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
