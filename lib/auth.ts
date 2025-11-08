import { createClient as createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

export type UserRole = "ADMIN" | "DOCTOR" | "RECEPTIONIST"

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  phone: string | null
  specialization: string | null
  license_number: string | null
  is_active: boolean
}

const SESSION_COOKIE_NAME = "clinic_session"
const SESSION_DURATION = 7 * 24 * 60 * 60 // 7 days in seconds

export async function setUserSession(user: User): Promise<void> {
  const cookieStore = await cookies()
  const sessionData = JSON.stringify(user)

  cookieStore.set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  })
}

export async function getUserSession(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) return null

  try {
    return JSON.parse(sessionCookie.value) as User
  } catch {
    return null
  }
}

export async function clearUserSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function validateLogin(email: string, password: string): Promise<User | null> {
  const supabase = await createServerClient()

  console.log("[v0] Attempting login for:", email)

  // Query the user directly from the database
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .eq("is_active", true)
    .limit(1)

  console.log("[v0] Database query result:", { users, error })

  if (error) {
    console.error("[v0] Database query error:", error)
    return null
  }

  if (!users || users.length === 0) {
    console.log("[v0] No user found with email:", email)
    return null
  }

  const userData = users[0]

  // Validate password using bcrypt
  const isValidPassword = await bcrypt.compare(password, userData.password_hash)

  console.log("[v0] Password validation result:", isValidPassword)

  if (!isValidPassword) {
    console.log("[v0] Invalid password for user:", email)
    return null
  }

  console.log("[v0] Login successful for user:", userData.email)

  return {
    id: userData.id,
    email: userData.email,
    full_name: userData.full_name,
    role: userData.role,
    phone: userData.phone,
    specialization: userData.specialization,
    license_number: userData.license_number,
    is_active: userData.is_active,
  } as User
}

export async function hasRole(roles: UserRole[]): Promise<boolean> {
  const user = await getUserSession()
  if (!user) return false
  return roles.includes(user.role)
}

export async function requireAuth(): Promise<User> {
  const user = await getUserSession()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

export async function requireRole(roles: UserRole[]): Promise<User> {
  const user = await requireAuth()
  if (!hasRole(roles)) {
    throw new Error("Forbidden")
  }
  return user
}
