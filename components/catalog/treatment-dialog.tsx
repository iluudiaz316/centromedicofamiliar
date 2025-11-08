"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { showSuccess, showError } from "@/lib/sweetalert"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function TreatmentDialog({ open, onOpenChange, treatment, onSuccess }: any) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration_minutes: "",
  })

  useEffect(() => {
    if (treatment) {
      setFormData({
        name: treatment.name,
        description: treatment.description || "",
        price: treatment.price.toString(),
        duration_minutes: treatment.duration_minutes?.toString() || "",
      })
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        duration_minutes: "",
      })
    }
  }, [treatment, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
      const data = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        duration_minutes: formData.duration_minutes ? Number.parseInt(formData.duration_minutes) : null,
      }

      if (treatment) {
        const { data: updated, error } = await supabase
          .from("treatments")
          .update(data)
          .eq("id", treatment.id)
          .select()
          .single()

        if (error) throw error
        await showSuccess("Tratamiento actualizado exitosamente")
        onSuccess(updated)
      } else {
        const { data: created, error } = await supabase.from("treatments").insert([data]).select().single()

        if (error) throw error
        await showSuccess("Tratamiento creado exitosamente")
        onSuccess(created)
      }

      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      await showError(error.message || "Error al guardar el tratamiento")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{treatment ? "Editar Tratamiento" : "Nuevo Tratamiento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Consulta General"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Descripción del tratamiento o estudio..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Precio (Q) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duración (minutos)</Label>
              <Input
                id="duration_minutes"
                type="number"
                min="0"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                placeholder="30"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Guardando..." : treatment ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
