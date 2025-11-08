"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Pencil, Power, PowerOff, KeyRound } from "lucide-react"
import { UserDialog } from "./user-dialog"
import { ChangePasswordDialog } from "./change-password-dialog"
import { showConfirm, showSuccess, showError } from "@/lib/sweetalert"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const roleLabels: any = {
  ADMIN: "Administrador",
  DOCTOR: "Doctor",
  RECEPTIONIST: "Recepcionista",
}

const roleColors: any = {
  ADMIN: "bg-red-100 text-red-800",
  DOCTOR: "bg-blue-100 text-blue-800",
  RECEPTIONIST: "bg-green-100 text-green-800",
}

export function UsersContent({ profile, users: initialUsers }: any) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [userForPassword, setUserForPassword] = useState<any>(null)
  const router = useRouter()

  const filteredUsers = users.filter((u: any) =>
    `${u.full_name} ${u.email}`.toLowerCase().includes(search.toLowerCase()),
  )

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const confirmed = await showConfirm(
      `¿Está seguro que desea ${currentStatus ? "desactivar" : "activar"} este usuario?`,
    )
    if (!confirmed) return

    const supabase = createClient()
    const { error } = await supabase.from("users").update({ is_active: !currentStatus }).eq("id", id)

    if (error) {
      await showError("Error al cambiar el estado del usuario")
      return
    }

    await showSuccess(`Usuario ${!currentStatus ? "activado" : "desactivado"} exitosamente`)
    setUsers(users.map((u: any) => (u.id === id ? { ...u, is_active: !currentStatus } : u)))
    router.refresh()
  }

  const handleNew = () => {
    setSelectedUser(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (user: any) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  const handleChangePassword = (user: any) => {
    setUserForPassword(user)
    setIsPasswordDialogOpen(true)
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
            <p className="text-gray-500">Gestión de usuarios del sistema</p>
          </div>
          <Button onClick={handleNew} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nombre Completo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Rol</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Teléfono</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user: any) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{user.full_name}</td>
                      <td className="px-4 py-3 text-sm">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs ${roleColors[user.role]}`}>
                          {roleLabels[user.role]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{user.phone || "N/A"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            user.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(user)} title="Editar usuario">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleChangePassword(user)}
                            title="Cambiar contraseña"
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleStatus(user.id, user.is_active)}
                            title={user.is_active ? "Desactivar usuario" : "Activar usuario"}
                          >
                            {user.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="py-12 text-center text-gray-500">No se encontraron usuarios</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={selectedUser}
        onSuccess={(newUser) => {
          if (selectedUser) {
            setUsers(users.map((u: any) => (u.id === newUser.id ? newUser : u)))
          } else {
            setUsers([...users, newUser])
          }
        }}
      />

      <ChangePasswordDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen} user={userForPassword} />
    </DashboardLayout>
  )
}
