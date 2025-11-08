import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getUserSession } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { userId, newPassword } = await request.json()

    const currentUser = await getUserSession()

    if (!currentUser) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Check if current user is admin
    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado. Solo administradores pueden cambiar contraseñas." },
        { status: 403 },
      )
    }

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const passwordHash = await bcrypt.hash(newPassword, 10)

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ password_hash: passwordHash })
      .eq("id", userId)

    if (updateError) {
      console.error("[v0] Error updating password:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    console.log("[v0] Password updated successfully for user:", userId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Server error:", error)
    return NextResponse.json({ error: error.message || "Error al cambiar la contraseña" }, { status: 500 })
  }
}
