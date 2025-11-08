"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { ScheduleDialog } from "./schedule-dialog"
import Swal from "sweetalert2"
import { toast } from "sonner"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

interface Schedule {
  id: string
  doctor_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
  doctor?: {
    id: string
    full_name: string
    specialization: string | null
  }
}

export function ScheduleContent({ profile }: { profile: any }) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>()
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all")
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setIsLoading(true)
    try {
      // Load doctors
      const { data: doctorsData, error: doctorsError } = await supabase
        .from("users")
        .select("*")
        .eq("role", "DOCTOR")
        .eq("is_active", true)
        .order("full_name")

      if (doctorsError) throw doctorsError
      setDoctors(doctorsData || [])

      // Load schedules
      await loadSchedules()
    } catch (error: any) {
      console.error("Error loading data:", error)
      toast.error("Error al cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }

  async function loadSchedules() {
    try {
      const { data, error } = await supabase.from("schedules").select("*").order("day_of_week").order("start_time")

      if (error) throw error

      // Fetch doctor details for each schedule
      const schedulesWithDoctors = await Promise.all(
        (data || []).map(async (schedule) => {
          const { data: doctor } = await supabase
            .from("users")
            .select("id, full_name, specialization")
            .eq("id", schedule.doctor_id)
            .single()

          return {
            ...schedule,
            doctor,
          }
        }),
      )

      setSchedules(schedulesWithDoctors)
    } catch (error: any) {
      console.error("Error loading schedules:", error)
      toast.error("Error al cargar los horarios")
    }
  }

  function handleNew() {
    setEditingSchedule(undefined)
    setIsDialogOpen(true)
  }

  function handleEdit(schedule: Schedule) {
    setEditingSchedule(schedule)
    setIsDialogOpen(true)
  }

  async function handleDelete(schedule: Schedule) {
    const result = await Swal.fire({
      title: "¿Eliminar horario?",
      text: `¿Estás seguro de eliminar este horario del ${DAYS[schedule.day_of_week]}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    })

    if (!result.isConfirmed) return

    try {
      const { error } = await supabase.from("schedules").delete().eq("id", schedule.id)

      if (error) throw error

      toast.success("Horario eliminado correctamente")
      loadSchedules()
    } catch (error: any) {
      console.error("Error deleting schedule:", error)
      toast.error("Error al eliminar el horario")
    }
  }

  async function handleToggleActive(schedule: Schedule) {
    try {
      const { error } = await supabase
        .from("schedules")
        .update({ is_active: !schedule.is_active })
        .eq("id", schedule.id)

      if (error) throw error

      toast.success(schedule.is_active ? "Horario desactivado" : "Horario activado")
      loadSchedules()
    } catch (error: any) {
      console.error("Error toggling schedule:", error)
      toast.error("Error al actualizar el horario")
    }
  }

  const filteredSchedules =
    selectedDoctor === "all" ? schedules : schedules.filter((s) => s.doctor_id === selectedDoctor)

  // Group schedules by doctor and day
  const schedulesByDoctor = filteredSchedules.reduce(
    (acc, schedule) => {
      const doctorId = schedule.doctor_id
      if (!acc[doctorId]) {
        acc[doctorId] = {
          doctor: schedule.doctor,
          schedules: [],
        }
      }
      acc[doctorId].schedules.push(schedule)
      return acc
    },
    {} as Record<string, { doctor: any; schedules: Schedule[] }>,
  )

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-cyan-400">Horarios</h2>
            <p className="text-slate-400 mt-1">Gestión de horarios de disponibilidad de doctores</p>
          </div>
          <Button
            onClick={handleNew}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Horario
          </Button>
        </div>

        {/* Doctor Filter */}
        <Card className="p-4 bg-slate-800/50 border-slate-700">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-300">Filtrar por doctor:</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todos los doctores</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.full_name}
                  {doctor.specialization && ` - ${doctor.specialization}`}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Schedules List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent"></div>
            <p className="mt-4 text-slate-400">Cargando horarios...</p>
          </div>
        ) : Object.keys(schedulesByDoctor).length === 0 ? (
          <Card className="p-12 text-center bg-slate-800/50 border-slate-700">
            <Clock className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No hay horarios registrados. Crea el primer horario.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(schedulesByDoctor).map(([doctorId, { doctor, schedules: doctorSchedules }]) => (
              <Card key={doctorId} className="p-6 bg-slate-800/50 border-slate-700">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-cyan-400">{doctor?.full_name || "Doctor desconocido"}</h3>
                  {doctor?.specialization && <p className="text-sm text-slate-400">{doctor.specialization}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {doctorSchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`p-4 rounded-lg border ${
                        schedule.is_active
                          ? "bg-slate-900/50 border-slate-700"
                          : "bg-slate-900/20 border-slate-800 opacity-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-cyan-300">{DAYS[schedule.day_of_week]}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-blue-400 hover:text-blue-300 hover:bg-slate-800"
                            onClick={() => handleEdit(schedule)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-slate-800"
                            onClick={() => handleDelete(schedule)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Clock className="h-4 w-4" />
                        <span>
                          {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggleActive(schedule)}
                        className={`mt-3 w-full text-xs py-1 rounded ${
                          schedule.is_active ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-400"
                        }`}
                      >
                        {schedule.is_active ? "Activo" : "Inactivo"}
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        <ScheduleDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          schedule={editingSchedule}
          doctors={doctors}
          onSuccess={loadSchedules}
        />
      </div>
    </DashboardLayout>
  )
}
