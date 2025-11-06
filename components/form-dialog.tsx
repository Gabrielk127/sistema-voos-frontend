"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "date"
    | "datetime-local"
    | "tel"
    | "url";
  placeholder?: string;
  required?: boolean;
  validation?: (value: string) => string | true | null;
  section?: string;
  hint?: string;
  icon?: React.ReactNode;
}

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FormField[];
  data: Record<string, string | number>;
  onSave: (data: Record<string, string | number>) => Promise<void>;
  isEditing?: boolean;
  icon?: React.ReactNode;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  data: initialData,
  onSave,
  isEditing = false,
  icon,
}: FormDialogProps) {
  const [formData, setFormData] =
    useState<Record<string, string | number>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Agrupar campos por seção
  const sections = Array.from(
    new Set(fields.map((f) => f.section || "Informações"))
  );
  const fieldsBySection = sections.map((section) => ({
    section,
    fields: fields.filter((f) => (f.section || "Informações") === section),
  }));

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    for (const field of fields) {
      const value = formData[field.name]?.toString() || "";

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

    try {
      setSaving(true);
      await onSave(formData);
      setMessage({
        type: "success",
        text: isEditing ? "Alterado com sucesso!" : "Criado com sucesso!",
      });
      setTimeout(() => {
        onOpenChange(false);
        setFormData(initialData);
        setErrors({});
        setMessage(null);
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

  const handleClose = () => {
    if (!saving) {
      onOpenChange(false);
      setFormData(initialData);
      setErrors({});
      setMessage(null);
    }
  };

  const handleFieldChange = (fieldName: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            {icon && <div className="text-2xl">{icon}</div>}
            <div className="flex-1">
              <DialogTitle className="text-2xl">
                {isEditing ? "Editar" : "Novo"} {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="mt-1">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Mensagem */}
        {message && (
          <Alert
            variant={message.type === "success" ? "default" : "destructive"}
            className={
              message.type === "success" ? "border-green-500 bg-green-50" : ""
            }
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription
              className={
                message.type === "success" ? "text-green-600 font-medium" : ""
              }
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Conteúdo */}
        <div className="space-y-6 py-4">
          {/* Se tem múltiplas seções, mostrar abas */}
          {fieldsBySection.length > 1 ? (
            <Tabs defaultValue={fieldsBySection[0].section} className="w-full">
              <TabsList
                className="grid w-full"
                style={{
                  gridTemplateColumns: `repeat(${fieldsBySection.length}, 1fr)`,
                }}
              >
                {fieldsBySection.map((item) => (
                  <TabsTrigger
                    key={item.section}
                    value={item.section}
                    className="cursor-pointer"
                  >
                    {item.section}
                  </TabsTrigger>
                ))}
              </TabsList>

              {fieldsBySection.map((item) => (
                <TabsContent
                  key={item.section}
                  value={item.section}
                  className="space-y-6 mt-6"
                >
                  <FieldsGroup
                    fields={item.fields}
                    formData={formData}
                    errors={errors}
                    onFieldChange={handleFieldChange}
                    saving={saving}
                  />
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <FieldsGroup
              fields={fields}
              formData={formData}
              errors={errors}
              onFieldChange={handleFieldChange}
              saving={saving}
            />
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={saving}
            className="cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Salvando...
              </div>
            ) : isEditing ? (
              "Atualizar"
            ) : (
              "Criar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface FieldsGroupProps {
  fields: FormField[];
  formData: Record<string, string | number>;
  errors: Record<string, string>;
  onFieldChange: (fieldName: string, value: string | number) => void;
  saving: boolean;
}

function FieldsGroup({
  fields,
  formData,
  errors,
  onFieldChange,
  saving,
}: FieldsGroupProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <Label
              htmlFor={field.name}
              className="font-semibold text-foreground"
            >
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            {field.icon && <span className="text-lg">{field.icon}</span>}
          </div>

          <div className="relative">
            <Input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.name] || ""}
              onChange={(e) => onFieldChange(field.name, e.target.value)}
              disabled={saving}
              className={`
                transition-all duration-200
                ${
                  errors[field.name]
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50"
                    : "focus:ring-2 focus:ring-blue-500/20"
                }
                ${field.required ? "font-medium" : ""}
              `}
            />
          </div>

          {/* Erro */}
          {errors[field.name] && (
            <div className="flex items-center gap-1 mt-2">
              <X className="w-4 h-4 text-red-500" />
              <p className="text-red-500 text-sm font-medium">
                {errors[field.name]}
              </p>
            </div>
          )}

          {/* Hint */}
          {field.hint && !errors[field.name] && (
            <p className="text-xs text-muted-foreground italic">{field.hint}</p>
          )}
        </div>
      ))}
    </div>
  );
}
