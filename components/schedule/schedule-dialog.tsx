"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const DAYS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
]

interface ScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule?: any
  doctors: any[]
  onSuccess: () => void
}

export function ScheduleDialog({ open, onOpenChange, schedule, doctors, onSuccess }: ScheduleDialogProps) {
  const [formData, setFormData] = useState({
    doctor_id: "",
    day_of_week: 1,
    start_time: "08:00",
    end_time: "17:00",
    is_active: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (schedule) {
      setFormData({
        doctor_id: schedule.doctor_id,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time.substring(0, 5),
        end_time: schedule.end_time.substring(0, 5),
        is_active: schedule.is_active,
      })
    } else {
      setFormData({
        doctor_id: doctors[0]?.id || "",
        day_of_week: 1,
        start_time: "08:00",
        end_time: "17:00",
        is_active: true,
      })
    }
  }, [schedule, doctors, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate time range
      if (formData.start_time >= formData.end_time) {
        toast.error("La hora de inicio debe ser menor a la hora de fin")
        return
      }

      if (schedule) {
        // Update existing schedule
        const { error } = await supabase.from("schedules").update(formData).eq("id", schedule.id)

        if (error) throw error
        toast.success("Horario actualizado correctamente")
      } else {
        // Create new schedule
        const { error } = await supabase.from("schedules").insert([formData])

        if (error) throw error
        toast.success("Horario creado correctamente")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error saving schedule:", error)
      toast.error(error.message || "Error al guardar el horario")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">{schedule ? "Editar Horario" : "Nuevo Horario"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doctor_id" className="text-slate-300">
              Doctor *
            </Label>
            <select
              id="doctor_id"
              required
              value={formData.doctor_id}
              onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="">Seleccionar doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.full_name}
                  {doctor.specialization && ` - ${doctor.specialization}`}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="day_of_week" className="text-slate-300">
              Día de la semana *
            </Label>
            <select
              id="day_of_week"
              required
              value={formData.day_of_week}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  day_of_week: Number.parseInt(e.target.value),
                })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {DAYS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time" className="text-slate-300">
                Hora inicio *
              </Label>
              <input
                id="start_time"
                type="time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time" className="text-slate-300">
                Hora fin *
              </Label>
              <input
                id="end_time"
                type="time"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
            />
            <Label htmlFor="is_active" className="text-slate-300">
              Horario activo
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              {isLoading ? "Guardando..." : schedule ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
