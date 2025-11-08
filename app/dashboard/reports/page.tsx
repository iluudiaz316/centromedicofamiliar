import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ReportsContent } from "@/components/reports/reports-content"
import { getUserSession } from "@/lib/auth"

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { start?: string; end?: string; doctor?: string }
}) {
  const user = await getUserSession()
  if (!user) {
    redirect("/login")
  }

  const supabase = await createClient()

  const endDate = searchParams.end ? new Date(searchParams.end) : new Date()
  const startDate = searchParams.start ? new Date(searchParams.start) : new Date()

  if (!searchParams.start) {
    startDate.setDate(startDate.getDate() - 30) // 30 días atrás
  }

  if (!searchParams.end) {
    endDate.setDate(endDate.getDate() + 60) // 60 días adelante para incluir citas futuras
  }

  console.log("[v0] Reports date range:", {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    doctor: searchParams.doctor,
  })

  let query = supabase
    .from("appointments")
    .select("*")
    .gte("appointment_date", startDate.toISOString())
    .lte("appointment_date", endDate.toISOString())
    .order("appointment_date", { ascending: false })

  if (searchParams.doctor) {
    query = query.eq("doctor_id", searchParams.doctor)
  }

  const { data: appointments, error } = await query

  console.log("[v0] Appointments loaded:", appointments?.length || 0)
  if (error) {
    console.log("[v0] Error loading appointments:", error)
  }

  const appointmentsWithRelations = await Promise.all(
    (appointments || []).map(async (apt) => {
      const [patientData, doctorData, treatmentData] = await Promise.all([
        supabase.from("patients").select("*").eq("id", apt.patient_id).single(),
        supabase.from("users").select("*").eq("id", apt.doctor_id).single(),
        apt.treatment_id
          ? supabase.from("treatments").select("*").eq("id", apt.treatment_id).single()
          : Promise.resolve({ data: null }),
      ])

      return {
        ...apt,
        patient: patientData.data,
        doctor: doctorData.data,
        treatment: treatmentData.data,
      }
    }),
  )

  console.log("[v0] Appointments with relations:", appointmentsWithRelations.length)

  const { data: doctors } = await supabase.from("users").select("*").eq("role", "DOCTOR").order("full_name")

  return (
    <ReportsContent
      profile={user}
      appointments={appointmentsWithRelations}
      doctors={doctors || []}
      startDate={startDate.toISOString().split("T")[0]}
      endDate={endDate.toISOString().split("T")[0]}
      doctorId={searchParams.doctor}
    />
  )
}
