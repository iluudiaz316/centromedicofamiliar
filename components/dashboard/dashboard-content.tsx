"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Activity, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

interface DashboardContentProps {
  profile: any
  stats: {
    totalPatients: number
    todayAppointments: number
    confirmedAppointments: number
    attendedAppointments: number
    completedAppointments: number
  }
  todayAppointments: any[]
}

const statusTranslations: Record<string, string> = {
  SCHEDULED: "Programada",
  CONFIRMED: "Confirmada",
  ATTENDED: "Atendida",
  CANCELLED: "Cancelada",
  NO_SHOW: "No Asistió",
  RESCHEDULED: "Reagendada",
}

export function DashboardContent({ profile, stats, todayAppointments }: DashboardContentProps) {
  const attendanceRate =
    stats.completedAppointments > 0 ? Math.round((stats.attendedAppointments / stats.completedAppointments) * 100) : 0

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white">
          <h1 className="text-3xl font-bold">Bienvenido al Centro Médico Familiar</h1>
          <p className="mt-2 text-blue-100">
            {new Date().toLocaleDateString("es-GT", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">Pacientes registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.todayAppointments}</div>
              <p className="text-xs text-muted-foreground">Citas programadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Asistencia</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{attendanceRate}%</div>
              <p className="text-xs text-muted-foreground">Tasa de asistencia</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600">{stats.confirmedAppointments}</div>
              <p className="text-xs text-muted-foreground">Citas confirmadas</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/dashboard/patients/new">
                <Button className="h-24 w-full flex-col gap-2 bg-blue-600 hover:bg-blue-700">
                  <Users className="h-6 w-6" />
                  <span>Registrar Paciente</span>
                </Button>
              </Link>
              <Link href="/dashboard/appointments/new">
                <Button className="h-24 w-full flex-col gap-2 bg-cyan-600 hover:bg-cyan-700">
                  <Calendar className="h-6 w-6" />
                  <span>Nueva Cita</span>
                </Button>
              </Link>
              <Link href="/dashboard/appointments">
                <Button className="h-24 w-full flex-col gap-2 bg-blue-600 hover:bg-blue-700">
                  <Activity className="h-6 w-6" />
                  <span>Ver Agenda</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">Citas de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-500">No hay citas programadas para hoy</p>
                <p className="text-sm text-gray-400">Puedes crear una nueva cita desde Acciones Rápidas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex-1">
                      <p className="font-medium">
                        {appointment.patient?.first_name} {appointment.patient?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{appointment.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date(appointment.appointment_date).toLocaleTimeString("es-GT", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs ${
                          appointment.status === "CONFIRMED"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "ATTENDED"
                              ? "bg-blue-100 text-blue-800"
                              : appointment.status === "CANCELLED"
                                ? "bg-red-100 text-red-800"
                                : appointment.status === "NO_SHOW"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {statusTranslations[appointment.status] || appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
