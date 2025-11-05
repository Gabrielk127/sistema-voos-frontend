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
import { listAirports, createAirport, updateAirport, deleteAirport, type Airport } from "@/lib/api-client"

export default function AirportsPage() {
  const [open, setOpen] = useState(false)
  const [airports, setAirports] = useState<Airport[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ nome: "", codigo: "", cidade: "", pais: "" })

  useEffect(() => {
    loadAirports()
  }, [])

  const loadAirports = async () => {
    try {
      setLoading(true)
      const data = await listAirports()
      setAirports(data)
    } catch (error) {
      console.error("Error loading airports:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateAirport(editingId, formData)
      } else {
        await createAirport(formData)
      }
      setOpen(false)
      setFormData({ nome: "", codigo: "", cidade: "", pais: "" })
      setEditingId(null)
      loadAirports()
    } catch (error) {
      console.error("Error saving airport:", error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteAirport(id)
      loadAirports()
    } catch (error) {
      console.error("Error deleting airport:", error)
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard" }, { label: "Aeroportos" }]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Aeroportos</h1>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                className="gap-2 bg-primary hover:bg-primary/90 cursor-pointer"
                onClick={() => {
                  setEditingId(null)
                  setFormData({ nome: "", codigo: "", cidade: "", pais: "" })
                }}
              >
                <Plus className="w-4 h-4" />
                Adicionar Novo Aeroporto
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{editingId ? "Editar Aeroporto" : "Novo Aeroporto"}</SheetTitle>
                <SheetDescription>Preencha os detalhes do aeroporto.</SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    placeholder="Aeroporto de São Paulo"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Código</Label>
                  <Input
                    placeholder="GRU"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    placeholder="São Paulo"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>País</Label>
                  <Input
                    placeholder="Brasil"
                    value={formData.pais}
                    onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
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

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : airports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Nenhum aeroporto encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    airports.map((airport) => (
                      <TableRow key={airport.id}>
                        <TableCell className="font-medium">{airport.nome}</TableCell>
                        <TableCell>{airport.codigo}</TableCell>
                        <TableCell>{airport.cidade}</TableCell>
                        <TableCell>{airport.pais}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="cursor-pointer">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => {
                                  setEditingId(airport.id)
                                  setFormData(airport)
                                  setOpen(true)
                                }}
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
                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Isto vai deletar o aeroporto {airport.nome} permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90 cursor-pointer"
                                    onClick={() => handleDelete(airport.id)}
                                  >
                                    Deletar
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
