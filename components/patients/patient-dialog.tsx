"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PatientDialogProps {
  patient: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PatientDialog({ patient, open, onOpenChange }: PatientDialogProps) {
  if (!patient) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Expediente del Paciente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">DPI</p>
              <p className="text-sm">{patient.dpi}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Nombre Completo</p>
              <p className="text-sm">
                {patient.first_name} {patient.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Fecha de Nacimiento</p>
              <p className="text-sm">{patient.date_of_birth}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Sexo</p>
              <p className="text-sm">{patient.gender}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Teléfono</p>
              <p className="text-sm">{patient.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-sm">{patient.email || "N/A"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Dirección</p>
              <p className="text-sm">{patient.address || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tipo de Sangre</p>
              <p className="text-sm">{patient.blood_type || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Contacto de Emergencia</p>
              <p className="text-sm">{patient.emergency_contact_name || "N/A"}</p>
              <p className="text-xs text-gray-400">{patient.emergency_contact_phone || ""}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Alergias</p>
              <p className="text-sm">{patient.allergies || "Ninguna registrada"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Historia Médica</p>
              <p className="text-sm">{patient.medical_history || "No hay historia médica registrada"}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
