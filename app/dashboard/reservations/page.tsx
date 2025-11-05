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
import { listBookings, createBooking, updateBooking, deleteBooking, type Booking } from "@/lib/api-client"

export default function ReservationsPage() {
  const [open, setOpen] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ passageiroId: "", vooId: "", assento: "", dataReserva: "" })

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const data = await listBookings()
      setBookings(data)
    } catch (error) {
      console.error("Error loading bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateBooking(editingId, {
          passageiroId: Number.parseInt(formData.passageiroId),
          vooId: Number.parseInt(formData.vooId),
          assento: formData.assento,
          dataReserva: formData.dataReserva,
        })
      } else {
        await createBooking({
          passageiroId: Number.parseInt(formData.passageiroId),
          vooId: Number.parseInt(formData.vooId),
          assento: formData.assento,
          dataReserva: formData.dataReserva,
        })
      }
      setOpen(false)
      setFormData({ passageiroId: "", vooId: "", assento: "", dataReserva: "" })
      setEditingId(null)
      loadBookings()
    } catch (error) {
      console.error("Error saving booking:", error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteBooking(id)
      loadBookings()
    } catch (error) {
      console.error("Error deleting booking:", error)
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard" }, { label: "Reservas" }]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Reservas</h1>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                className="gap-2 bg-primary hover:bg-primary/90 cursor-pointer"
                onClick={() => {
                  setEditingId(null)
                  setFormData({ passageiroId: "", vooId: "", assento: "", dataReserva: "" })
                }}
              >
                <Plus className="w-4 h-4" />
                Adicionar Nova Reserva
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{editingId ? "Editar Reserva" : "Nova Reserva"}</SheetTitle>
                <SheetDescription>Preencha os detalhes da reserva.</SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label>ID Passageiro</Label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={formData.passageiroId}
                    onChange={(e) => setFormData({ ...formData, passageiroId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ID Voo</Label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={formData.vooId}
                    onChange={(e) => setFormData({ ...formData, vooId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Assento</Label>
                  <Input
                    placeholder="12A"
                    value={formData.assento}
                    onChange={(e) => setFormData({ ...formData, assento: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Reserva</Label>
                  <Input
                    type="datetime-local"
                    value={formData.dataReserva}
                    onChange={(e) => setFormData({ ...formData, dataReserva: e.target.value })}
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
                    <TableHead>ID</TableHead>
                    <TableHead>ID Passageiro</TableHead>
                    <TableHead>ID Voo</TableHead>
                    <TableHead>Assento</TableHead>
                    <TableHead>Data Reserva</TableHead>
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
                  ) : bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Nenhuma reserva encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.id}</TableCell>
                        <TableCell>{booking.passageiroId}</TableCell>
                        <TableCell>{booking.vooId}</TableCell>
                        <TableCell>{booking.assento}</TableCell>
                        <TableCell>{new Date(booking.dataReserva).toLocaleDateString()}</TableCell>
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
                                  setEditingId(booking.id)
                                  setFormData({
                                    passageiroId: booking.passageiroId.toString(),
                                    vooId: booking.vooId.toString(),
                                    assento: booking.assento,
                                    dataReserva: booking.dataReserva,
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
                                      Isto vai deletar a reserva permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90 cursor-pointer"
                                    onClick={() => handleDelete(booking.id)}
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
