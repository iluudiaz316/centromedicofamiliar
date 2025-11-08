import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Users, Calendar, BookOpen, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#0d2137] to-[#0f172a]">
      <header className="border-b border-[#1e3a5f] bg-[#0d2137]/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#29b6f6] to-[#0288d1]">
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
              <p className="text-sm font-semibold text-white">Centro Médico</p>
              <p className="text-xs text-cyan-400">Familiar</p>
            </div>
          </div>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-[#29b6f6] to-[#0288d1] hover:from-[#4fc3f7] hover:to-[#29b6f6] shadow-lg shadow-cyan-500/20">
              Ingresar
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-block rounded-full bg-[#1a3a52] border border-cyan-500/30 px-4 py-1 text-sm font-medium text-cyan-400">
            Sistema de Gestión Médica
          </div>
          <h1 className="mb-6 text-5xl font-bold text-white">
            Gestión de Pacientes
            <br />
            <span className="bg-gradient-to-r from-[#29b6f6] to-[#4fc3f7] bg-clip-text text-transparent">
              y Citas Médicas
            </span>
          </h1>
          <p className="mb-8 text-lg text-gray-300">
            Sistema integral para la administración de expedientes médicos, programación de citas y catálogo de
            tratamientos
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#29b6f6] to-[#0288d1] hover:from-[#4fc3f7] hover:to-[#29b6f6] shadow-lg shadow-cyan-500/30"
            >
              Acceder al Sistema
            </Button>
          </Link>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-[#1e3a5f] bg-gradient-to-br from-[#1a2f45] to-[#0d1f2d] shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#29b6f6] to-[#0288d1] shadow-lg shadow-cyan-500/30">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Expedientes de Pacientes</h3>
              <p className="text-sm text-gray-400">Gestión completa de datos de pacientes con DPI guatemalteco</p>
            </CardContent>
          </Card>

          <Card className="border-[#1e3a5f] bg-gradient-to-br from-[#1a2f45] to-[#0d1f2d] shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#4fc3f7] to-[#29b6f6] shadow-lg shadow-cyan-400/30">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Control de Citas</h3>
              <p className="text-sm text-gray-400">Calendario inteligente con prevención de conflictos de horario</p>
            </CardContent>
          </Card>

          <Card className="border-[#1e3a5f] bg-gradient-to-br from-[#1a2f45] to-[#0d1f2d] shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#29b6f6] to-[#0288d1] shadow-lg shadow-cyan-500/30">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Catálogo de Tratamientos</h3>
              <p className="text-sm text-gray-400">Administración de estudios y tratamientos con precios</p>
            </CardContent>
          </Card>

          <Card className="border-[#1e3a5f] bg-gradient-to-br from-[#1a2f45] to-[#0d1f2d] shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#4fc3f7] to-[#29b6f6] shadow-lg shadow-cyan-400/30">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-white">Reportes y Estadísticas</h3>
              <p className="text-sm text-gray-400">Análisis de asistencia, citas y rendimiento del centro médico</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 rounded-2xl bg-gradient-to-r from-[#29b6f6] to-[#0288d1] p-8 text-center text-white shadow-2xl shadow-cyan-500/40">
          <div className="mb-4 flex justify-center gap-8">
            <div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-cyan-100">Disponibilidad</div>
            </div>
            <div>
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-cyan-100">Seguro</div>
            </div>
            <div>
              <div className="text-3xl font-bold">∞</div>
              <div className="text-sm text-cyan-100">Pacientes</div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#1e3a5f] bg-[#0d2137] py-6">
        <div className="container mx-auto px-6 text-center text-sm text-gray-400">
          © 2025 Centro Médico Familiar. Sistema de Gestión de Pacientes.
        </div>
      </footer>
    </div>
  )
}
