import { clearUserSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    await clearUserSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return NextResponse.json({ error: "Error al cerrar sesión" }, { status: 500 })
  }
}
