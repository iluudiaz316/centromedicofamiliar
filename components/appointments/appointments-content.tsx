"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarView } from "./calendar-view"
import { AppointmentsList } from "./appointments-list"
import { AppointmentDialog } from "./appointment-dialog"
import { Plus } from "lucide-react"

export function AppointmentsContent({
  profile,
  appointments: initialAppointments,
  patients,
  doctors,
  treatments,
}: any) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)

  const handleEdit = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setSelectedAppointment(null)
    setIsDialogOpen(true)
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Citas</h1>
            <p className="text-gray-400">Calendario y gestión de citas médicas</p>
          </div>
          <Button
            onClick={handleNew}
            className="gap-2 bg-gradient-to-r from-[#29b6f6] to-[#0288d1] hover:from-[#4fc3f7] hover:to-[#29b6f6] shadow-lg shadow-cyan-500/20"
          >
            <Plus className="h-4 w-4" />
            Nueva Cita
          </Button>
        </div>

        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendar">Vista Calendario</TabsTrigger>
            <TabsTrigger value="list">Vista Lista</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <CalendarView appointments={appointments} onEdit={handleEdit} />
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <AppointmentsList appointments={appointments} onEdit={handleEdit} onUpdate={setAppointments} />
          </TabsContent>
        </Tabs>
      </div>

      <AppointmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        appointment={selectedAppointment}
        patients={patients}
        doctors={doctors}
        treatments={treatments}
        onSuccess={(newAppointment) => {
          if (selectedAppointment) {
            setAppointments(appointments.map((a: any) => (a.id === newAppointment.id ? newAppointment : a)))
          } else {
            setAppointments([...appointments, newAppointment])
          }
        }}
      />
    </DashboardLayout>
  )
}
