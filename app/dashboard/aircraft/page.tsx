"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { listAircraft, createAircraft, updateAircraft, deleteAircraft, type Aircraft } from "@/lib/api-client"

export default function AircraftPage() {
  const [open, setOpen] = useState(false)
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ modelo: "", fabricante: "", capacidade: "", anoFabricacao: "" })

  // Load aircraft on mount
  useEffect(() => {
    loadAircraft()
  }, [])

  const loadAircraft = async () => {
    try {
      setLoading(true)
      const data = await listAircraft()
      setAircraft(data)
    } catch (error) {
      console.error("Error loading aircraft:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateAircraft(editingId, {
          modelo: formData.modelo,
          fabricante: formData.fabricante,
          capacidade: Number.parseInt(formData.capacidade),
          anoFabricacao: Number.parseInt(formData.anoFabricacao),
        })
      } else {
        await createAircraft({
          modelo: formData.modelo,
          fabricante: formData.fabricante,
          capacidade: Number.parseInt(formData.capacidade),
          anoFabricacao: Number.parseInt(formData.anoFabricacao),
        })
      }
      setOpen(false)
      setFormData({ modelo: "", fabricante: "", capacidade: "", anoFabricacao: "" })
      setEditingId(null)
      loadAircraft()
    } catch (error) {
      console.error("Error saving aircraft:", error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteAircraft(id)
      loadAircraft()
    } catch (error) {
      console.error("Error deleting aircraft:", error)
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard" }, { label: "Aeronaves" }]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Aeronaves</h1>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                className="gap-2 bg-primary hover:bg-primary/90 cursor-pointer"
                onClick={() => {
                  setEditingId(null)
                  setFormData({ modelo: "", fabricante: "", capacidade: "", anoFabricacao: "" })
                }}
              >
                <Plus className="w-4 h-4" />
                Adicionar Nova Aeronave
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{editingId ? "Editar Aeronave" : "Nova Aeronave"}</SheetTitle>
                <SheetDescription>Preencha os detalhes da aeronave abaixo.</SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo</Label>
                  <Input
                    id="model"
                    placeholder="ex: Boeing 737"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Fabricante</Label>
                  <Input
                    id="manufacturer"
                    placeholder="ex: Boeing"
                    value={formData.fabricante}
                    onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidade</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="180"
                    value={formData.capacidade}
                    onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Ano de Fabricação</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2020"
                    value={formData.anoFabricacao}
                    onChange={(e) => setFormData({ ...formData, anoFabricacao: e.target.value })}
                  />
                </div>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => setOpen(false)} className="cursor-pointer">
                  Cancelar
                </Button>
                <Button className="bg-primary hover:bg-primary/90 cursor-pointer" onClick={handleSave}>
                  Salvar
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Fabricante</TableHead>
                    <TableHead>Capacidade</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : aircraft.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Nenhuma aeronave encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    aircraft.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{item.modelo}</TableCell>
                        <TableCell>{item.fabricante}</TableCell>
                        <TableCell>{item.capacidade}</TableCell>
                        <TableCell>{item.anoFabricacao}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="cursor-pointer">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingId(item.id)
                                  setFormData({
                                    modelo: item.modelo,
                                    fabricante: item.fabricante,
                                    capacidade: item.capacidade.toString(),
                                    anoFabricacao: item.anoFabricacao.toString(),
                                  })
                                  setOpen(true)
                                }}
                                className="cursor-pointer"
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                    <Trash2 className="w-4 h-4 mr-2 text-destructive" />
                                    <span className="text-destructive">Deletar</span>
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta ação não pode ser desfeita. Isso excluirá permanentemente o registro{" "}
                                      {item.modelo}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90 cursor-pointer"
                                    onClick={() => handleDelete(item.id)}
                                  >
                                    Sim, deletar
                                  </AlertDialogAction>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
