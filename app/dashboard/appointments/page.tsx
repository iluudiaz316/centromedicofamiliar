import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppointmentsContent } from "@/components/appointments/appointments-content"
import { getUserSession } from "@/lib/auth"

export default async function AppointmentsPage() {
  const user = await getUserSession()
  if (!user) {
    redirect("/login")
  }

  const supabase = await createClient()

  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      *,
      patient:patients(*),
      doctor:users!appointments_doctor_id_fkey(*),
      treatment:treatments(*)
    `)
    .order("appointment_date", { ascending: true })

  const { data: patients } = await supabase.from("patients").select("*").order("first_name")

  const { data: doctors } = await supabase.from("users").select("*").eq("role", "DOCTOR").order("full_name")

  const { data: treatments } = await supabase.from("treatments").select("*").eq("is_active", true).order("name")

  return (
    <AppointmentsContent
      profile={user}
      appointments={appointments || []}
      patients={patients || []}
      doctors={doctors || []}
      treatments={treatments || []}
    />
  )
}
