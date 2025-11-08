"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Users, Calendar, Clock, BookOpen, UserCog, BarChart3, LogOut, Home } from "lucide-react"
import { showConfirm, showSuccess } from "@/lib/sweetalert"

interface DashboardLayoutProps {
  children: React.ReactNode
  profile: any
}

export function DashboardLayout({ children, profile }: DashboardLayoutProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const confirmed = await showConfirm("¿Está seguro que desea cerrar sesión?")
    if (!confirmed) return

    try {
      await fetch("/api/auth/logout", { method: "POST" })
      await showSuccess("Sesión cerrada exitosamente")
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("[v0] Logout error:", error)
    }
  }

  const allNavItems = [
    { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
    { href: "/dashboard/patients", label: "Pacientes", icon: Users },
    { href: "/dashboard/appointments", label: "Citas", icon: Calendar },
    { href: "/dashboard/schedule", label: "Horarios", icon: Clock },
    { href: "/dashboard/catalog", label: "Catálogo", icon: BookOpen },
    { href: "/dashboard/users", label: "Usuarios", icon: UserCog, adminOnly: true },
    { href: "/dashboard/reports", label: "Reportes", icon: BarChart3 },
  ]

  // Solo mostrar "Usuarios" si el usuario es ADMIN
  const navItems = allNavItems.filter((item) => {
    if (item.adminOnly) {
      return profile?.role === "ADMIN"
    }
    return true
  })

  const fullName = profile?.full_name || profile?.email || "Usuario"
  const role = profile?.role || "Usuario"

  // Generate initials safely
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex min-h-screen bg-[#0a1929]">
      <aside className="w-64 border-r border-[#1e3a5f] bg-[#0d1b2a]">
        <div className="flex h-16 items-center gap-2 border-b border-[#1e3a5f] px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#29b6f6] to-[#4fc3f7] shadow-lg shadow-cyan-500/30">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#e3f2fd]">Centro Médico</p>
            <p className="text-xs text-[#81d4fa]">Familiar</p>
          </div>
        </div>

        <nav className="space-y-1 p-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-[#b3e5fc] hover:bg-[#1a2942] hover:text-[#29b6f6]"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 border-t border-[#1e3a5f] bg-[#0d1b2a] p-4">
          <div className="mb-3 rounded-lg bg-[#1a2942] p-3 border border-[#1e3a5f]">
            <p className="text-sm font-medium text-[#e3f2fd]">{fullName}</p>
            <p className="text-xs text-[#81d4fa]">{role}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-3 text-[#ef5350] hover:bg-red-950 hover:text-red-400 bg-transparent border-[#1e3a5f]"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-[#1e3a5f] bg-[#132f4c] px-6">
          <h2 className="text-xl font-semibold text-[#e3f2fd]">Sistema de Gestión Médica</h2>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent border-[#1e3a5f] text-[#81d4fa] hover:bg-[#1a2942] hover:text-[#29b6f6]"
              >
                <Home className="h-4 w-4" />
                Inicio
              </Button>
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#29b6f6] to-[#4fc3f7] text-sm font-medium text-white shadow-lg shadow-cyan-500/30">
              {initials}
            </div>
          </div>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
