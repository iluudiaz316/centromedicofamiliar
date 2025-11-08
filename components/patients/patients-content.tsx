"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Eye, Pencil, Trash2, Download } from "lucide-react"
import Link from "next/link"
import { PatientDialog } from "./patient-dialog"
import { showConfirm, showSuccess, showError } from "@/lib/sweetalert"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function PatientsContent({ profile, patients: initialPatients }: any) {
  const [patients, setPatients] = useState(initialPatients)
  const [search, setSearch] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  const filteredPatients = patients.filter((p: any) =>
    `${p.first_name} ${p.last_name} ${p.dpi} ${p.phone}`.toLowerCase().includes(search.toLowerCase()),
  )

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm(
      "¿Está seguro que desea eliminar este paciente? Esta acción no se puede deshacer.",
    )
    if (!confirmed) return

    const supabase = createClient()
    const { error } = await supabase.from("patients").delete().eq("id", id)

    if (error) {
      await showError("Error al eliminar el paciente")
      return
    }

    await showSuccess("Paciente eliminado exitosamente")
    setPatients(patients.filter((p: any) => p.id !== id))
    router.refresh()
  }

  const exportCSV = () => {
    const headers = ["DPI", "Nombre", "Fecha Nacimiento", "Sexo", "Teléfono", "Email"]
    const rows = filteredPatients.map((p: any) => [
      p.dpi,
      `${p.first_name} ${p.last_name}`,
      p.date_of_birth,
      p.gender,
      p.phone,
      p.email || "",
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pacientes-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Pacientes</h1>
            <p className="text-gray-400">Gestión de expedientes de pacientes</p>
          </div>
          <Link href="/dashboard/patients/new">
            <Button className="gap-2 bg-gradient-to-r from-[#29b6f6] to-[#0288d1] hover:from-[#4fc3f7] hover:to-[#29b6f6] shadow-lg shadow-cyan-500/20">
              <Plus className="h-4 w-4" />
              Nuevo Paciente
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Pacientes</CardTitle>
              <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por DPI, nombre o teléfono..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e3a5f]">
                    <th className="px-4 py-3 text-left text-sm font-medium text-cyan-400">DPI</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-cyan-400">Nombre Completo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-cyan-400">Fecha Nacimiento</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-cyan-400">Sexo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-cyan-400">Teléfono</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-cyan-400">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient: any) => (
                    <tr key={patient.id} className="border-b border-[#1e3a5f] hover:bg-[#1a3a52] transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-300">{patient.dpi}</td>
                      <td className="px-4 py-3 text-sm font-medium text-white">
                        {patient.first_name} {patient.last_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{patient.date_of_birth}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{patient.gender}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{patient.phone}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedPatient(patient)
                              setIsDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Link href={`/dashboard/patients/${patient.id}/edit`}>
                            <Button size="sm" variant="ghost">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            onClick={() => handleDelete(patient.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPatients.length === 0 && (
                <div className="py-12 text-center text-gray-400">No se encontraron pacientes</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <PatientDialog patient={selectedPatient} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </DashboardLayout>
  )
}
