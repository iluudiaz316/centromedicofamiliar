"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Pencil, Trash2 } from "lucide-react"
import { showConfirm, showSuccess, showError } from "@/lib/sweetalert"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const statusColors: any = {
  SCHEDULED: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  CONFIRMED: "bg-green-500/20 text-green-300 border border-green-500/30",
  ATTENDED: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
  CANCELLED: "bg-red-500/20 text-red-300 border border-red-500/30",
  NO_SHOW: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  RESCHEDULED: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
}

const statusLabels: any = {
  SCHEDULED: "Programada",
  CONFIRMED: "Confirmada",
  ATTENDED: "Atendida",
  CANCELLED: "Cancelada",
  NO_SHOW: "No se presentó",
  RESCHEDULED: "Reagendada",
}

export function AppointmentsList({ appointments: initialAppointments, onEdit, onUpdate }: any) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const router = useRouter()

  const filteredAppointments = appointments.filter((apt: any) => {
    if (!apt.patient || !apt.doctor) return false
    const matchesSearch = `${apt.patient.first_name} ${apt.patient.last_name} ${apt.reason}`
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || apt.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm("¿Está seguro que desea eliminar esta cita? Esta acción no se puede deshacer.")
    if (!confirmed) return

    const supabase = createClient()
    const { error } = await supabase.from("appointments").delete().eq("id", id)

    if (error) {
      await showError("Error al eliminar la cita")
      return
    }

    await showSuccess("Cita eliminada exitosamente")
    const newAppointments = appointments.filter((a: any) => a.id !== id)
    setAppointments(newAppointments)
    onUpdate(newAppointments)
    router.refresh()
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("appointments").update({ status: newStatus }).eq("id", id)

    if (error) {
      await showError("Error al actualizar el estado")
      return
    }

    await showSuccess("Estado actualizado exitosamente")
    const newAppointments = appointments.map((a: any) => (a.id === id ? { ...a, status: newStatus } : a))
    setAppointments(newAppointments)
    onUpdate(newAppointments)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Citas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por paciente o motivo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los estados</SelectItem>
              <SelectItem value="SCHEDULED">Programada</SelectItem>
              <SelectItem value="CONFIRMED">Confirmada</SelectItem>
              <SelectItem value="ATTENDED">Atendida</SelectItem>
              <SelectItem value="CANCELLED">Cancelada</SelectItem>
              <SelectItem value="NO_SHOW">No se presentó</SelectItem>
              <SelectItem value="RESCHEDULED">Reagendada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Fecha y Hora</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Paciente</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Doctor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Motivo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment: any) => (
                <tr key={appointment.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    {new Date(appointment.appointment_date).toLocaleDateString("es-GT")}
                    <br />
                    <span className="text-gray-500">
                      {new Date(appointment.appointment_date).toLocaleTimeString("es-GT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {appointment.patient?.first_name || ""} {appointment.patient?.last_name || ""}
                  </td>
                  <td className="px-4 py-3 text-sm">{appointment.doctor?.full_name || "Sin asignar"}</td>
                  <td className="px-4 py-3 text-sm">{appointment.reason}</td>
                  <td className="px-4 py-3">
                    <Select
                      value={appointment.status}
                      onValueChange={(value) => handleStatusChange(appointment.id, value)}
                    >
                      <SelectTrigger className={`w-[140px] ${statusColors[appointment.status]}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SCHEDULED">Programada</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                        <SelectItem value="ATTENDED">Atendida</SelectItem>
                        <SelectItem value="CANCELLED">Cancelada</SelectItem>
                        <SelectItem value="NO_SHOW">No se presentó</SelectItem>
                        <SelectItem value="RESCHEDULED">Reagendada</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => onEdit(appointment)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(appointment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAppointments.length === 0 && (
            <div className="py-12 text-center text-gray-500">No se encontraron citas</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
