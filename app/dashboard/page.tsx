import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { getUserSession } from "@/lib/auth"

export default async function DashboardPage() {
  const user = await getUserSession()
  if (!user) {
    redirect("/login")
  }

  const supabase = await createClient()

  // Get statistics
  const { count: totalPatients } = await supabase.from("patients").select("*", { count: "exact", head: true })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { count: todayAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .gte("appointment_date", today.toISOString())
    .lt("appointment_date", tomorrow.toISOString())

  const { count: confirmedAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("status", "CONFIRMED")
    .gte("appointment_date", today.toISOString())

  const { count: attendedAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("status", "ATTENDED")

  const { count: completedAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .in("status", ["ATTENDED", "CANCELLED", "NO_SHOW"])

  const { data: todayAppointmentsList } = await supabase
    .from("appointments")
    .select("*")
    .gte("appointment_date", today.toISOString())
    .lt("appointment_date", tomorrow.toISOString())
    .order("appointment_date", { ascending: true })

  // Fetch related data for appointments
  const appointmentsWithDetails = await Promise.all(
    (todayAppointmentsList || []).map(async (appointment) => {
      const { data: patient } = await supabase.from("patients").select("*").eq("id", appointment.patient_id).single()

      const { data: doctor } = await supabase.from("users").select("*").eq("id", appointment.doctor_id).single()

      const { data: treatment } = await supabase
        .from("treatments")
        .select("*")
        .eq("id", appointment.treatment_id)
        .single()

      return {
        ...appointment,
        patient,
        doctor,
        treatment,
      }
    }),
  )

  return (
    <DashboardContent
      profile={user}
      stats={{
        totalPatients: totalPatients || 0,
        todayAppointments: todayAppointments || 0,
        confirmedAppointments: confirmedAppointments || 0,
        attendedAppointments: attendedAppointments || 0,
        completedAppointments: completedAppointments || 0,
      }}
      todayAppointments={appointmentsWithDetails}
    />
  )
}
