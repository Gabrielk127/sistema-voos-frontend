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
import { listPassengers, createPassenger, updatePassenger, deletePassenger, type Passenger } from "@/lib/api-client"

export default function PassengersPage() {
  const [open, setOpen] = useState(false)
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ nome: "", email: "", cpf: "", dataAtendimento: "" })

  useEffect(() => {
    loadPassengers()
  }, [])

  const loadPassengers = async () => {
    try {
      setLoading(true)
      const data = await listPassengers()
      setPassengers(data)
    } catch (error) {
      console.error("Error loading passengers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (editingId) {
        await updatePassenger(editingId, formData)
      } else {
        await createPassenger(formData)
      }
      setOpen(false)
      setFormData({ nome: "", email: "", cpf: "", dataAtendimento: "" })
      setEditingId(null)
      loadPassengers()
    } catch (error) {
      console.error("Error saving passenger:", error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deletePassenger(id)
      loadPassengers()
    } catch (error) {
      console.error("Error deleting passenger:", error)
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard" }, { label: "Passageiros" }]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Passageiros</h1>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                className="gap-2 bg-primary hover:bg-primary/90 cursor-pointer"
                onClick={() => {
                  setEditingId(null)
                  setFormData({ nome: "", email: "", cpf: "", dataAtendimento: "" })
                }}
              >
                <Plus className="w-4 h-4" />
                Adicionar Novo Passageiro
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{editingId ? "Editar Passageiro" : "Novo Passageiro"}</SheetTitle>
                <SheetDescription>Preencha os detalhes do passageiro.</SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    placeholder="João Silva"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="joao@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input
                    placeholder="123.456.789-00"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Atendimento</Label>
                  <Input
                    type="date"
                    value={formData.dataAtendimento}
                    onChange={(e) => setFormData({ ...formData, dataAtendimento: e.target.value })}
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
                    <TableHead>Email</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Data Atendimento</TableHead>
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
                  ) : passengers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Nenhum passageiro encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    passengers.map((passenger) => (
                      <TableRow key={passenger.id}>
                        <TableCell className="font-medium">{passenger.nome}</TableCell>
                        <TableCell>{passenger.email}</TableCell>
                        <TableCell>{passenger.cpf}</TableCell>
                        <TableCell>{new Date(passenger.dataAtendimento).toLocaleDateString()}</TableCell>
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
                                  setEditingId(passenger.id)
                                  setFormData(passenger)
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
                                      Isto vai deletar o passageiro {passenger.nome} permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90 cursor-pointer"
                                    onClick={() => handleDelete(passenger.id)}
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
