import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CatalogContent } from "@/components/catalog/catalog-content"
import { getUserSession } from "@/lib/auth"

export default async function CatalogPage() {
  const user = await getUserSession()
  if (!user) {
    redirect("/login")
  }

  const supabase = await createClient()
  const { data: treatments } = await supabase.from("treatments").select("*").order("name")

  return <CatalogContent profile={user} treatments={treatments || []} />
}
