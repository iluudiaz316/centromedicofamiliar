import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PatientsContent } from "@/components/patients/patients-content"
import { getUserSession } from "@/lib/auth"

export default async function PatientsPage() {
  const user = await getUserSession()
  if (!user) {
    redirect("/login")
  }

  const supabase = await createClient()
  const { data: patients } = await supabase.from("patients").select("*").order("created_at", { ascending: false })

  return <PatientsContent profile={user} patients={patients || []} />
}
