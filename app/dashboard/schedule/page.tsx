import { redirect } from "next/navigation"
import { ScheduleContent } from "@/components/schedule/schedule-content"
import { getUserSession } from "@/lib/auth"

export default async function SchedulePage() {
  const user = await getUserSession()
  if (!user) {
    redirect("/login")
  }

  return <ScheduleContent profile={user} />
}
