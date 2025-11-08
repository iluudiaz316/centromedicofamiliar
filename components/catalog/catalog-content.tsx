"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Pencil, Trash2, Power, PowerOff } from "lucide-react"
import { TreatmentDialog } from "./treatment-dialog"
import { showConfirm, showSuccess, showError } from "@/lib/sweetalert"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function CatalogContent({ profile, treatments: initialTreatments }: any) {
  const [treatments, setTreatments] = useState(initialTreatments)
  const [search, setSearch] = useState("")
  const [selectedTreatment, setSelectedTreatment] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  const filteredTreatments = treatments.filter((t: any) =>
    `${t.name} ${t.description}`.toLowerCase().includes(search.toLowerCase()),
  )

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm(
      "¿Está seguro que desea eliminar este tratamiento? Esta acción no se puede deshacer.",
    )
    if (!confirmed) return

    const supabase = createClient()
    const { error } = await supabase.from("treatments").delete().eq("id", id)

    if (error) {
      await showError("Error al eliminar el tratamiento")
      return
    }

    await showSuccess("Tratamiento eliminado exitosamente")
    setTreatments(treatments.filter((t: any) => t.id !== id))
    router.refresh()
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const supabase = createClient()
    const { error } = await supabase.from("treatments").update({ is_active: !currentStatus }).eq("id", id)

    if (error) {
      await showError("Error al cambiar el estado")
      return
    }

    await showSuccess(`Tratamiento ${!currentStatus ? "activado" : "desactivado"} exitosamente`)
    setTreatments(treatments.map((t: any) => (t.id === id ? { ...t, is_active: !currentStatus } : t)))
    router.refresh()
  }

  const handleNew = () => {
    setSelectedTreatment(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (treatment: any) => {
    setSelectedTreatment(treatment)
    setIsDialogOpen(true)
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Catálogo de Tratamientos</h1>
            <p className="text-gray-500">Administración de estudios y tratamientos con precios</p>
          </div>
          {profile.role === "ADMIN" && (
            <Button onClick={handleNew} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Nuevo Tratamiento
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Tratamientos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o descripción..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTreatments.map((treatment: any) => (
                <Card key={treatment.id} className={`relative ${!treatment.is_active ? "opacity-60" : ""}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{treatment.name}</CardTitle>
                        <p className="mt-1 text-2xl font-bold text-blue-600">Q{treatment.price.toFixed(2)}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          treatment.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {treatment.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{treatment.description || "Sin descripción"}</p>
                    {treatment.duration_minutes && (
                      <p className="mt-2 text-xs text-gray-500">Duración: {treatment.duration_minutes} minutos</p>
                    )}

                    {profile.role === "ADMIN" && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => handleEdit(treatment)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(treatment.id, treatment.is_active)}
                        >
                          {treatment.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 bg-transparent"
                          onClick={() => handleDelete(treatment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTreatments.length === 0 && (
              <div className="py-12 text-center text-gray-500">No se encontraron tratamientos</div>
            )}
          </CardContent>
        </Card>
      </div>

      <TreatmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        treatment={selectedTreatment}
        onSuccess={(newTreatment) => {
          if (selectedTreatment) {
            setTreatments(treatments.map((t: any) => (t.id === newTreatment.id ? newTreatment : t)))
          } else {
            setTreatments([...treatments, newTreatment])
          }
        }}
      />
    </DashboardLayout>
  )
}
