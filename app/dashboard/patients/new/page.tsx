import { redirect } from "next/navigation"
import { PatientForm } from "@/components/patients/patient-form"
import { getUserSession } from "@/lib/auth"

export default async function NewPatientPage() {
  const user = await getUserSession()
  if (!user) {
    redirect("/login")
  }

  return <PatientForm profile={user} />
}
