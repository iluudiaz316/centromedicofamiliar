import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UsersContent } from "@/components/users/users-content"
import { getUserSession } from "@/lib/auth"

export default async function UsersPage() {
  const user = await getUserSession()
  if (!user) {
    redirect("/login")
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const supabase = await createClient()
  const { data: users } = await supabase.from("users").select("*").order("created_at", { ascending: false })

  return <UsersContent profile={user} users={users || []} />
}
