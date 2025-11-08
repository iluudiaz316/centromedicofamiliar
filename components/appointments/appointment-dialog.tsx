"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { showSuccess, showError } from "@/lib/sweetalert"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function AppointmentDialog({ open, onOpenChange, appointment, patients, doctors, treatments, onSuccess }: any) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{appointment ? "Editar Cita" : "Nueva Cita"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Guardando..." : appointment ? "Actualizar" : "Crear Cita"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
