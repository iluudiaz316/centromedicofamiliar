import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PatientForm } from "@/components/patients/patient-form"
import { getUserSession } from "@/lib/auth"

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getUserSession()
  if (!user) {
    redirect("/login")
  }

  const supabase = await createClient()
  const { data: patient } = await supabase.from("patients").select("*").eq("id", id).single()

  if (!patient) {
    redirect("/dashboard/patients")
  }

  return <PatientForm profile={user} patient={patient} />
}
