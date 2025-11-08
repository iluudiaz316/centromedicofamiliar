"use client"

import { useState, useRef, useTransition } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, TrendingUp, Users, Calendar, Activity, Search } from "lucide-react"
import { showSuccess, showError } from "@/lib/sweetalert"
import { useRouter } from "next/navigation"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"

const COLORS = ["#29b6f6", "#4fc3f7", "#66bb6a", "#ffa726", "#ef5350", "#ab47bc", "#26c6da", "#7e57c2"]

const statusLabels = {
  ATTENDED: "Asistidas",
  CANCELLED: "Canceladas",
  NO_SHOW: "No Asistidas",
  SCHEDULED: "Programadas",
  CONFIRMED: "Confirmadas",
  RESCHEDULED: "Reagendadas",
}

const statusColors = {
  ATTENDED: "#66bb6a",
  CANCELLED: "#ef5350",
  NO_SHOW: "#ff7043",
  SCHEDULED: "#29b6f6",
  CONFIRMED: "#4fc3f7",
  RESCHEDULED: "#ffa726",
}

export function ReportsContent({
  profile,
  appointments: initialAppointments,
  doctors,
  startDate: initialStartDate,
  endDate: initialEndDate,
  doctorId: initialDoctorId,
}: any) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)
  const [selectedDoctor, setSelectedDoctor] = useState(initialDoctorId || "ALL")
  const reportRef = useRef<HTMLDivElement>(null)

  const filteredAppointments = initialAppointments

  const totalAppointments = filteredAppointments.length
  const pendingAppointments = filteredAppointments.filter(
    (a: any) => a.status === "SCHEDULED" || a.status === "CONFIRMED",
  ).length
  const attendedCount = filteredAppointments.filter((a: any) => a.status === "ATTENDED").length
  const cancelledCount = filteredAppointments.filter((a: any) => a.status === "CANCELLED").length
  const noShowCount = filteredAppointments.filter((a: any) => a.status === "NO_SHOW").length
  const rescheduledCount = filteredAppointments.filter((a: any) => a.status === "RESCHEDULED").length

  const completedAppointments = attendedCount + cancelledCount + noShowCount
  const attendanceRate = completedAppointments > 0 ? ((attendedCount / completedAppointments) * 100).toFixed(1) : "0"
  const cancellationRate =
    completedAppointments > 0 ? (((cancelledCount + noShowCount) / completedAppointments) * 100).toFixed(1) : "0"

  const statusData = Object.entries(
    filteredAppointments.reduce((acc: any, apt: any) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1
      return acc
    }, {}),
  ).map(([status, count]) => ({
    name: statusLabels[status as keyof typeof statusLabels] || status,
    value: count,
    color: statusColors[status as keyof typeof statusColors] || COLORS[0],
  }))

  const doctorData = Object.entries(
    filteredAppointments.reduce((acc: any, apt: any) => {
      const doctorName = apt.doctor.full_name
      if (!acc[doctorName]) {
        acc[doctorName] = { total: 0, attended: 0, cancelled: 0 }
      }
      acc[doctorName].total++
      if (apt.status === "ATTENDED") acc[doctorName].attended++
      if (apt.status === "CANCELLED" || apt.status === "NO_SHOW") acc[doctorName].cancelled++
      return acc
    }, {}),
  ).map(([name, data]: [string, any]) => ({
    name,
    total: data.total,
    attended: data.attended,
    cancelled: data.cancelled,
  }))

  const dailyData = Object.entries(
    filteredAppointments.reduce((acc: any, apt: any) => {
      const date = new Date(apt.appointment_date).toISOString().split("T")[0]
      if (!acc[date]) {
        acc[date] = { total: 0, attended: 0, pending: 0 }
      }
      acc[date].total++
      if (apt.status === "ATTENDED") acc[date].attended++
      if (apt.status === "SCHEDULED" || apt.status === "CONFIRMED") acc[date].pending++
      return acc
    }, {}),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, data]: [string, any]) => ({
      date: new Date(date).toLocaleDateString("es-GT", { month: "short", day: "numeric" }),
      total: data.total,
      attended: data.attended,
      pending: data.pending,
    }))

  const treatmentData = Object.entries(
    filteredAppointments
      .filter((a: any) => a.treatment)
      .reduce((acc: any, apt: any) => {
        const treatmentName = apt.treatment?.name || "Sin tratamiento"
        acc[treatmentName] = (acc[treatmentName] || 0) + 1
        return acc
      }, {}),
  )
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([name, count]) => ({
      name,
      count,
    }))

  const handlePrint = () => {
    window.print()
    showSuccess("Reporte preparado para imprimir")
  }

  const handleExport = () => {
    const csvLines: string[] = []

    // Encabezado del centro médico
    csvLines.push("CENTRO MÉDICO FAMILIAR")
    csvLines.push("REPORTE DE CITAS MÉDICAS")
    csvLines.push("")

    // Información del reporte
    csvLines.push("INFORMACIÓN DEL REPORTE")
    csvLines.push(
      `Período:,${new Date(startDate).toLocaleDateString("es-GT")} - ${new Date(endDate).toLocaleDateString("es-GT")}`,
    )
    csvLines.push(
      `Fecha de generación:,${new Date().toLocaleDateString("es-GT")} ${new Date().toLocaleTimeString("es-GT")}`,
    )
    csvLines.push(`Generado por:,${profile.full_name}`)
    csvLines.push("")

    // Resumen estadístico
    csvLines.push("RESUMEN ESTADÍSTICO")
    csvLines.push("Métrica,Cantidad,Porcentaje")
    csvLines.push(`Total de Citas,${totalAppointments},100%`)
    csvLines.push(`Citas Asistidas,${attendedCount},${attendanceRate}%`)
    csvLines.push(`Citas Canceladas,${cancelledCount},${cancellationRate}%`)
    csvLines.push(
      `No Asistió,${noShowCount},${completedAppointments > 0 ? ((noShowCount / completedAppointments) * 100).toFixed(1) : 0}%`,
    )
    csvLines.push(
      `Citas Pendientes,${pendingAppointments},${totalAppointments > 0 ? ((pendingAppointments / totalAppointments) * 100).toFixed(1) : 0}%`,
    )
    csvLines.push(
      `Reagendadas,${rescheduledCount},${totalAppointments > 0 ? ((rescheduledCount / totalAppointments) * 100).toFixed(1) : 0}%`,
    )
    csvLines.push("")

    // Estadísticas por médico
    if (doctorData.length > 0) {
      csvLines.push("ESTADÍSTICAS POR MÉDICO")
      csvLines.push("Médico,Total Citas,Asistidas,Canceladas,Tasa de Asistencia")
      doctorData.forEach((doc) => {
        const docAttendanceRate = doc.total > 0 ? ((doc.attended / doc.total) * 100).toFixed(1) : "0"
        csvLines.push(`${doc.name},${doc.total},${doc.attended},${doc.cancelled},${docAttendanceRate}%`)
      })
      csvLines.push("")
    }

    // Tratamientos más frecuentes
    if (treatmentData.length > 0) {
      csvLines.push("TRATAMIENTOS MÁS FRECUENTES")
      csvLines.push("Tratamiento,Cantidad")
      treatmentData.forEach((treatment) => {
        csvLines.push(`${treatment.name},${treatment.count}`)
      })
      csvLines.push("")
    }

    // Detalle de citas
    csvLines.push("DETALLE DE CITAS")
    csvLines.push("Fecha,Hora,Paciente,Edad,Doctor,Especialidad,Tratamiento,Motivo de Consulta,Estado,Duración (min)")

    filteredAppointments
      .sort((a: any, b: any) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
      .forEach((apt: any) => {
        const date = new Date(apt.appointment_date).toLocaleDateString("es-GT")
        const time = new Date(apt.appointment_date).toLocaleTimeString("es-GT", {
          hour: "2-digit",
          minute: "2-digit",
        })
        const patient = `${apt.patient.first_name} ${apt.patient.last_name}`
        const age = apt.patient.date_of_birth
          ? Math.floor(
              (new Date().getTime() - new Date(apt.patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
            )
          : "N/A"
        const doctor = apt.doctor.full_name
        const specialty = apt.doctor.specialty || "N/A"
        const treatment = apt.treatment?.name || "Sin tratamiento"
        const reason = `"${apt.reason.replace(/"/g, '""')}"` // Escapar comillas
        const status = statusLabels[apt.status as keyof typeof statusLabels]
        const duration = apt.duration || "30"

        csvLines.push(
          `${date},${time},${patient},${age},${doctor},${specialty},${treatment},${reason},${status},${duration}`,
        )
      })

    csvLines.push("")
    csvLines.push("--- FIN DEL REPORTE ---")

    const csv = csvLines.join("\n")
    const BOM = "\uFEFF" // BOM para que Excel reconozca UTF-8
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Reporte_Citas_${startDate}_${endDate}_${new Date().getTime()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    showSuccess("Reporte exportado exitosamente")
  }

  const handleApplyFilters = () => {
    if (!startDate || !endDate) {
      showError("Por favor selecciona un rango de fechas válido")
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start > end) {
      showError("La fecha de inicio no puede ser mayor a la fecha fin")
      return
    }

    startTransition(() => {
      const params = new URLSearchParams()
      params.set("start", startDate)
      params.set("end", endDate)
      if (selectedDoctor !== "ALL") {
        params.set("doctor", selectedDoctor)
      }

      console.log("[v0] Applying filters:", { startDate, endDate, selectedDoctor })
      router.push(`/dashboard/reports?${params.toString()}`)
    })
  }

  const handleResetFilters = () => {
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)
    const sixtyDaysAhead = new Date()
    sixtyDaysAhead.setDate(today.getDate() + 60)

    setStartDate(thirtyDaysAgo.toISOString().split("T")[0])
    setEndDate(sixtyDaysAhead.toISOString().split("T")[0])
    setSelectedDoctor("ALL")

    startTransition(() => {
      router.push("/dashboard/reports")
    })
  }

  const handleQuickFilter = (preset: string) => {
    const today = new Date()
    let start = new Date()
    let end = new Date()

    switch (preset) {
      case "today":
        start = today
        end = today
        break
      case "week":
        start.setDate(today.getDate() - 7)
        end = today
        break
      case "month":
        start.setDate(today.getDate() - 30)
        end = today
        break
      case "next-week":
        start = today
        end.setDate(today.getDate() + 7)
        break
      case "next-month":
        start = today
        end.setDate(today.getDate() + 30)
        break
    }

    const newStartDate = start.toISOString().split("T")[0]
    const newEndDate = end.toISOString().split("T")[0]

    setStartDate(newStartDate)
    setEndDate(newEndDate)

    startTransition(() => {
      const params = new URLSearchParams()
      params.set("start", newStartDate)
      params.set("end", newEndDate)
      if (selectedDoctor !== "ALL") {
        params.set("doctor", selectedDoctor)
      }
      router.push(`/dashboard/reports?${params.toString()}`)
    })
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-balance text-3xl font-bold text-cyan-400">Reportes y Estadísticas</h1>
            <p className="text-slate-400">Análisis de asistencia, citas y rendimiento del centro médico</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="gap-2 border-slate-600 bg-slate-800/50 text-cyan-400 hover:bg-slate-700"
            >
              <FileText className="h-4 w-4" />
              Imprimir
            </Button>
            <Button
              onClick={handleExport}
              className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-cyan-400">Filtros de Reporte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Filtros Rápidos</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFilter("today")}
                  disabled={isPending}
                  className="border-slate-600 bg-slate-900/50 text-slate-300 hover:bg-cyan-600/20 hover:text-cyan-400"
                >
                  Hoy
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFilter("week")}
                  disabled={isPending}
                  className="border-slate-600 bg-slate-900/50 text-slate-300 hover:bg-cyan-600/20 hover:text-cyan-400"
                >
                  Última Semana
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFilter("month")}
                  disabled={isPending}
                  className="border-slate-600 bg-slate-900/50 text-slate-300 hover:bg-cyan-600/20 hover:text-cyan-400"
                >
                  Último Mes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFilter("next-week")}
                  disabled={isPending}
                  className="border-slate-600 bg-slate-900/50 text-slate-300 hover:bg-cyan-600/20 hover:text-cyan-400"
                >
                  Próxima Semana
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFilter("next-month")}
                  disabled={isPending}
                  className="border-slate-600 bg-slate-900/50 text-slate-300 hover:bg-cyan-600/20 hover:text-cyan-400"
                >
                  Próximo Mes
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-slate-300">
                  Fecha Inicio
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isPending}
                  className="border-slate-600 bg-slate-900/50 text-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-slate-300">
                  Fecha Fin
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isPending}
                  className="border-slate-600 bg-slate-900/50 text-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor" className="text-slate-300">
                  Médico
                </Label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor} disabled={isPending}>
                  <SelectTrigger className="border-slate-600 bg-slate-900/50 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-slate-600 bg-slate-800">
                    <SelectItem value="ALL">Todos los médicos</SelectItem>
                    {doctors.map((doctor: any) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button
                  onClick={handleApplyFilters}
                  disabled={isPending}
                  className="flex-1 gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Consultar
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetFilters}
                  disabled={isPending}
                  className="border-slate-600 bg-slate-900/50 text-slate-300 hover:bg-slate-700"
                  title="Restablecer filtros"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/30 p-3 text-sm">
              <span className="text-slate-400">Mostrando resultados:</span>
              <span className="font-medium text-cyan-400">
                {new Date(startDate).toLocaleDateString("es-GT")} - {new Date(endDate).toLocaleDateString("es-GT")}
              </span>
              {selectedDoctor !== "ALL" && (
                <>
                  <span className="text-slate-400">para</span>
                  <span className="font-medium text-cyan-400">
                    {doctors.find((d: any) => d.id === selectedDoctor)?.full_name || "Doctor seleccionado"}
                  </span>
                </>
              )}
              <span className="ml-auto text-slate-400">
                Total: <span className="font-bold text-cyan-400">{totalAppointments}</span> citas
              </span>
            </div>
          </CardContent>
        </Card>

        <div ref={reportRef} className="space-y-6 print:space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-slate-700 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Total Citas</CardTitle>
                <Calendar className="h-4 w-4 text-cyan-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-400">{totalAppointments}</div>
                <p className="text-xs text-slate-400">En el período seleccionado</p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Citas Pendientes</CardTitle>
                <Activity className="h-4 w-4 text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-400">{pendingAppointments}</div>
                <p className="text-xs text-slate-400">Programadas y confirmadas</p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Tasa de Asistencia</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{attendanceRate}%</div>
                <p className="text-xs text-slate-400">
                  {attendedCount} de {completedAppointments} citas
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Tasa de Cancelación</CardTitle>
                <Users className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">{cancellationRate}%</div>
                <p className="text-xs text-slate-400">{cancelledCount + noShowCount} cancelaciones/ausencias</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-cyan-400">Resumen del Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-sm text-slate-400">Período seleccionado:</span>
                    <span className="text-balance text-sm font-medium text-slate-200">
                      {new Date(startDate).toLocaleDateString("es-GT")} -{" "}
                      {new Date(endDate).toLocaleDateString("es-GT")}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-sm text-slate-400">Tasa de asistencia:</span>
                    <span className="text-sm font-medium text-green-400">{attendanceRate}%</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-sm text-slate-400">Tasa de cancelación:</span>
                    <span className="text-sm font-medium text-red-400">{cancellationRate}%</span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {Object.entries(statusLabels).map(([status, label]) => {
                      const count = filteredAppointments.filter((a: any) => a.status === status).length
                      if (count === 0) return null
                      return (
                        <div key={status} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: statusColors[status as keyof typeof statusColors] }}
                            />
                            <span className="text-slate-400">{label}:</span>
                          </div>
                          <span className="font-medium text-cyan-400">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-cyan-400">Distribución por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#1e293b"
                      strokeWidth={2}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                        color: "#e2e8f0",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-cyan-400">Tendencia de Citas (Últimos 14 días)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#29b6f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#29b6f6" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorAttended" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#66bb6a" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#66bb6a" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffa726" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ffa726" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="date" stroke="#94a3b8" style={{ fill: "#94a3b8" }} />
                  <YAxis stroke="#94a3b8" style={{ fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                      color: "#e2e8f0",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "#94a3b8" }} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#29b6f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                    name="Total"
                  />
                  <Area
                    type="monotone"
                    dataKey="attended"
                    stroke="#66bb6a"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAttended)"
                    name="Asistidas"
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stroke="#ffa726"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPending)"
                    name="Pendientes"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {doctorData.length > 0 && (
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-cyan-400">Rendimiento por Médico</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={doctorData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis type="number" stroke="#94a3b8" style={{ fill: "#94a3b8" }} />
                    <YAxis type="category" dataKey="name" width={150} stroke="#94a3b8" style={{ fill: "#94a3b8" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                        color: "#e2e8f0",
                      }}
                    />
                    <Legend wrapperStyle={{ color: "#94a3b8" }} />
                    <Bar dataKey="total" fill="#29b6f6" name="Total" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="attended" fill="#66bb6a" name="Asistidas" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="cancelled" fill="#ef5350" name="Canceladas" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {treatmentData.length > 0 && (
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-cyan-400">Tratamientos Más Frecuentes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={treatmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      style={{ fill: "#94a3b8", fontSize: "12px" }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis stroke="#94a3b8" style={{ fill: "#94a3b8" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                        color: "#e2e8f0",
                      }}
                    />
                    <Legend wrapperStyle={{ color: "#94a3b8" }} />
                    <Bar dataKey="count" fill="#4fc3f7" name="Cantidad" radius={[8, 8, 0, 0]}>
                      {treatmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          aside,
          header,
          button {
            display: none !important;
          }
          main {
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
          }
        }
      `}</style>
    </DashboardLayout>
  )
}
