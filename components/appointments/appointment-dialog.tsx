"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { showSuccess, showError, showWarning } from "@/lib/sweetalert"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"

export function AppointmentDialog({ open, onOpenChange, appointment, patients, doctors, treatments, onSuccess }: any) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [hasConflict, setHasConflict] = useState(false)
  const [conflictMessage, setConflictMessage] = useState("")
  const [isCheckingConflict, setIsCheckingConflict] = useState(false)

  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    treatment_id: "",
    appointment_date: "",
    appointment_time: "",
    duration_minutes: "30",
    reason: "",
    notes: "",
    status: "SCHEDULED",
  })

  useEffect(() => {
    if (appointment) {
      const date = new Date(appointment.appointment_date)
      setFormData({
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        treatment_id: appointment.treatment_id || "",
        appointment_date: date.toISOString().split("T")[0],
        appointment_time: date.toTimeString().slice(0, 5),
        duration_minutes: appointment.duration_minutes.toString(),
        reason: appointment.reason,
        notes: appointment.notes || "",
        status: appointment.status || "SCHEDULED",
      })
    } else {
      setFormData({
        patient_id: "",
        doctor_id: "",
        treatment_id: "",
        appointment_date: "",
        appointment_time: "",
        duration_minutes: "30",
        reason: "",
        notes: "",
        status: "SCHEDULED",
      })
    }
  }, [appointment, open])

  const checkTimeConflict = async () => {
    if (!formData.doctor_id || !formData.appointment_date || !formData.appointment_time || !formData.duration_minutes) {
      setHasConflict(false)
      setConflictMessage("")
      return
    }

    setIsCheckingConflict(true)
    console.log("[v0] Checking appointment conflicts...")

    try {
      const supabase = createClient()

      const startTime = new Date(`${formData.appointment_date}T${formData.appointment_time}`)
      const endTime = new Date(startTime.getTime() + Number.parseInt(formData.duration_minutes) * 60000)

      const dayStart = new Date(formData.appointment_date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(formData.appointment_date)
      dayEnd.setHours(23, 59, 59, 999)

      console.log("[v0] Checking conflicts for:", {
        doctor_id: formData.doctor_id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        dayStart: dayStart.toISOString(),
        dayEnd: dayEnd.toISOString(),
        excludeId: appointment?.id,
      })

      let query = supabase
        .from("appointments")
        .select("*, patient:patients(first_name, last_name)")
        .eq("doctor_id", formData.doctor_id)
        .gte("appointment_date", dayStart.toISOString())
        .lte("appointment_date", dayEnd.toISOString())
        .in("status", ["SCHEDULED", "CONFIRMED"])

      if (appointment) {
        query = query.neq("id", appointment.id)
      }

      const { data: existingAppointments, error } = await query

      if (error) {
        console.error("[v0] Error querying appointments:", error)
        throw error
      }

      console.log("[v0] Found existing appointments:", existingAppointments)

      const conflicts = existingAppointments?.filter((existing: any) => {
        const existingStart = new Date(existing.appointment_date)
        const existingEnd = new Date(existingStart.getTime() + existing.duration_minutes * 60000)

        const overlaps = startTime < existingEnd && endTime > existingStart

        console.log("[v0] Checking overlap:", {
          existing: `${existingStart.toLocaleTimeString()} - ${existingEnd.toLocaleTimeString()}`,
          new: `${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`,
          overlaps,
        })

        return overlaps
      })

      if (conflicts && conflicts.length > 0) {
        setHasConflict(true)
        const conflict = conflicts[0]
        const conflictStart = new Date(conflict.appointment_date)
        const conflictEnd = new Date(conflictStart.getTime() + conflict.duration_minutes * 60000)

        const message =
          `El doctor ya tiene una cita con ${conflict.patient.first_name} ${conflict.patient.last_name} ` +
          `de ${conflictStart.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} ` +
          `a ${conflictEnd.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`

        setConflictMessage(message)
        console.log("[v0] Conflict detected:", message)
      } else {
        setHasConflict(false)
        setConflictMessage("")
        console.log("[v0] No conflicts found")
      }
    } catch (error) {
      console.error("[v0] Error checking conflicts:", error)
    } finally {
      setIsCheckingConflict(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkTimeConflict()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.doctor_id, formData.appointment_date, formData.appointment_time, formData.duration_minutes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (hasConflict) {
      await showWarning(
        "No se puede agendar la cita",
        "El horario seleccionado ya está ocupado. Por favor, seleccione otro horario.",
      )
      return
    }

    setIsLoading(true)

    const supabase = createClient()
    const appointmentDate = new Date(`${formData.appointment_date}T${formData.appointment_time}`)

    try {
      if (appointment) {
        const { data, error } = await supabase
          .from("appointments")
          .update({
            patient_id: formData.patient_id,
            doctor_id: formData.doctor_id,
            treatment_id: formData.treatment_id || null,
            appointment_date: appointmentDate.toISOString(),
            duration_minutes: Number.parseInt(formData.duration_minutes),
            reason: formData.reason,
            notes: formData.notes,
            status: formData.status,
          })
          .eq("id", appointment.id)
          .select()
          .single()

        if (error) throw error

        const [patientData, doctorData, treatmentData] = await Promise.all([
          supabase.from("patients").select("*").eq("id", data.patient_id).single(),
          supabase.from("users").select("*").eq("id", data.doctor_id).single(),
          data.treatment_id
            ? supabase.from("treatments").select("*").eq("id", data.treatment_id).single()
            : Promise.resolve({ data: null }),
        ])

        const fullData = {
          ...data,
          patient: patientData.data,
          doctor: doctorData.data,
          treatment: treatmentData.data,
        }

        onOpenChange(false)
        await showSuccess("Cita actualizada exitosamente")
        onSuccess(fullData)
      } else {
        const { data, error } = await supabase
          .from("appointments")
          .insert([
            {
              patient_id: formData.patient_id,
              doctor_id: formData.doctor_id,
              treatment_id: formData.treatment_id || null,
              appointment_date: appointmentDate.toISOString(),
              duration_minutes: Number.parseInt(formData.duration_minutes),
              reason: formData.reason,
              notes: formData.notes,
              status: formData.status,
            },
          ])
          .select()
          .single()

        if (error) throw error

        const [patientData, doctorData, treatmentData] = await Promise.all([
          supabase.from("patients").select("*").eq("id", data.patient_id).single(),
          supabase.from("users").select("*").eq("id", data.doctor_id).single(),
          data.treatment_id
            ? supabase.from("treatments").select("*").eq("id", data.treatment_id).single()
            : Promise.resolve({ data: null }),
        ])

        const fullData = {
          ...data,
          patient: patientData.data,
          doctor: doctorData.data,
          treatment: treatmentData.data,
        }

        onOpenChange(false)
        await showSuccess("Cita creada exitosamente")
        onSuccess(fullData)
      }

      router.refresh()
    } catch (error: any) {
      await showError(error.message || "Error al guardar la cita")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{appointment ? "Editar Cita" : "Nueva Cita"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {hasConflict && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-300 rounded-lg text-red-900">
              <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-base mb-1">Horario no disponible</p>
                <p className="text-sm">{conflictMessage}</p>
              </div>
            </div>
          )}

          {isCheckingConflict && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
              <p className="text-sm">Verificando disponibilidad...</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="patient_id">Paciente *</Label>
              <Select
                value={formData.patient_id}
                onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient: any) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor_id">Doctor *</Label>
              <Select
                value={formData.doctor_id}
                onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor: any) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointment_date">Fecha *</Label>
              <Input
                id="appointment_date"
                type="date"
                required
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointment_time">Hora *</Label>
              <Input
                id="appointment_time"
                type="time"
                required
                value={formData.appointment_time}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duración (minutos) *</Label>
              <Input
                id="duration_minutes"
                type="number"
                required
                min="15"
                step="15"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHEDULED">Programada</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                  <SelectItem value="ATTENDED">Atendida</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                  <SelectItem value="NO_SHOW">No asistió</SelectItem>
                  <SelectItem value="RESCHEDULED">Reagendada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="treatment_id">Tratamiento</Label>
              <Select
                value={formData.treatment_id}
                onValueChange={(value) => setFormData({ ...formData, treatment_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un tratamiento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguno</SelectItem>
                  {treatments.map((treatment: any) => (
                    <SelectItem key={treatment.id} value={treatment.id}>
                      {treatment.name} - Q{treatment.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="reason">Motivo de la Consulta *</Label>
              <Input
                id="reason"
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Ej: Consulta general, seguimiento, etc."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Notas adicionales sobre la cita..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || hasConflict || isCheckingConflict}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Guardando..." : appointment ? "Actualizar" : "Crear Cita"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
