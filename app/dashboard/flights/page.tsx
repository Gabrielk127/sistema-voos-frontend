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
import { listFlights, createFlight, updateFlight, deleteFlight, type Flight } from "@/lib/api-client"

export default function FlightsPage() {
  const [open, setOpen] = useState(false)
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    codigo: "",
    aeronaveId: "",
    aeroportoOrigemId: "",
    aeroportoDestinoId: "",
    dataPartida: "",
    dataChegada: "",
    preco: "",
    assentosDisponiveis: "",
  })

  useEffect(() => {
    loadFlights()
  }, [])

  const loadFlights = async () => {
    try {
      setLoading(true)
      const data = await listFlights()
      setFlights(data)
    } catch (error) {
      console.error("Error loading flights:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateFlight(editingId, {
          codigo: formData.codigo,
          aeronaveId: Number.parseInt(formData.aeronaveId),
          aeroportoOrigemId: Number.parseInt(formData.aeroportoOrigemId),
          aeroportoDestinoId: Number.parseInt(formData.aeroportoDestinoId),
          dataPartida: formData.dataPartida,
          dataChegada: formData.dataChegada,
          preco: Number.parseFloat(formData.preco),
          assentosDisponiveis: Number.parseInt(formData.assentosDisponiveis),
        })
      } else {
        await createFlight({
          codigo: formData.codigo,
          aeronaveId: Number.parseInt(formData.aeronaveId),
          aeroportoOrigemId: Number.parseInt(formData.aeroportoOrigemId),
          aeroportoDestinoId: Number.parseInt(formData.aeroportoDestinoId),
          dataPartida: formData.dataPartida,
          dataChegada: formData.dataChegada,
          preco: Number.parseFloat(formData.preco),
          assentosDisponiveis: Number.parseInt(formData.assentosDisponiveis),
        })
      }
      setOpen(false)
      setFormData({
        codigo: "",
        aeronaveId: "",
        aeroportoOrigemId: "",
        aeroportoDestinoId: "",
        dataPartida: "",
        dataChegada: "",
        preco: "",
        assentosDisponiveis: "",
      })
      setEditingId(null)
      loadFlights()
    } catch (error) {
      console.error("Error saving flight:", error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteFlight(id)
      loadFlights()
    } catch (error) {
      console.error("Error deleting flight:", error)
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard" }, { label: "Voos" }]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Voos</h1>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                className="gap-2 bg-primary hover:bg-primary/90 cursor-pointer"
                onClick={() => {
                  setEditingId(null)
                  setFormData({
                    codigo: "",
                    aeronaveId: "",
                    aeroportoOrigemId: "",
                    aeroportoDestinoId: "",
                    dataPartida: "",
                    dataChegada: "",
                    preco: "",
                    assentosDisponiveis: "",
                  })
                }}
              >
                <Plus className="w-4 h-4" />
                Adicionar Novo Voo
              </Button>
            </SheetTrigger>
            <SheetContent className="max-h-screen overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{editingId ? "Editar Voo" : "Novo Voo"}</SheetTitle>
                <SheetDescription>Preencha os detalhes do voo abaixo.</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-6">
                <div className="space-y-2">
                  <Label>Código</Label>
                  <Input
                    placeholder="AA123"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ID Aeronave</Label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={formData.aeronaveId}
                    onChange={(e) => setFormData({ ...formData, aeronaveId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ID Aeroporto Origem</Label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={formData.aeroportoOrigemId}
                    onChange={(e) => setFormData({ ...formData, aeroportoOrigemId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ID Aeroporto Destino</Label>
                  <Input
                    type="number"
                    placeholder="2"
                    value={formData.aeroportoDestinoId}
                    onChange={(e) => setFormData({ ...formData, aeroportoDestinoId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Partida</Label>
                  <Input
                    type="datetime-local"
                    value={formData.dataPartida}
                    onChange={(e) => setFormData({ ...formData, dataPartida: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Chegada</Label>
                  <Input
                    type="datetime-local"
                    value={formData.dataChegada}
                    onChange={(e) => setFormData({ ...formData, dataChegada: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço</Label>
                  <Input
                    type="number"
                    placeholder="500"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Assentos Disponíveis</Label>
                  <Input
                    type="number"
                    placeholder="180"
                    value={formData.assentosDisponiveis}
                    onChange={(e) => setFormData({ ...formData, assentosDisponiveis: e.target.value })}
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
                    <TableHead>Código</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Partida</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Assentos</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : flights.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Nenhum voo encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    flights.map((flight) => (
                      <TableRow key={flight.id}>
                        <TableCell className="font-medium">{flight.codigo}</TableCell>
                        <TableCell>{flight.aeroportoOrigemId}</TableCell>
                        <TableCell>{flight.aeroportoDestinoId}</TableCell>
                        <TableCell>{new Date(flight.dataPartida).toLocaleDateString()}</TableCell>
                        <TableCell>R$ {flight.preco.toFixed(2)}</TableCell>
                        <TableCell>{flight.assentosDisponiveis}</TableCell>
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
                                  setEditingId(flight.id)
                                  setFormData({
                                    codigo: flight.codigo,
                                    aeronaveId: flight.aeronaveId.toString(),
                                    aeroportoOrigemId: flight.aeroportoOrigemId.toString(),
                                    aeroportoDestinoId: flight.aeroportoDestinoId.toString(),
                                    dataPartida: flight.dataPartida,
                                    dataChegada: flight.dataChegada,
                                    preco: flight.preco.toString(),
                                    assentosDisponiveis: flight.assentosDisponiveis.toString(),
                                  })
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
                                      Isto vai deletar o voo {flight.codigo} permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90 cursor-pointer"
                                    onClick={() => handleDelete(flight.id)}
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
