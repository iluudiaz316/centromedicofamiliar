import Swal from "sweetalert2"

export const showSuccess = (message: string) => {
  return Swal.fire({
    icon: "success",
    title: "Éxito",
    text: message,
    confirmButtonColor: "#3b82f6",
  })
}

export const showError = (message: string) => {
  return Swal.fire({
    icon: "error",
    title: "Error",
    text: message,
    confirmButtonColor: "#ef4444",
  })
}

export const showWarning = (message: string) => {
  return Swal.fire({
    icon: "warning",
    title: "Advertencia",
    text: message,
    confirmButtonColor: "#f59e0b",
  })
}

export const showConfirm = async (message: string): Promise<boolean> => {
  const result = await Swal.fire({
    icon: "question",
    title: "Confirmar",
    text: message,
    showCancelButton: true,
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
  })
  return result.isConfirmed
}

export const showInfo = (message: string) => {
  return Swal.fire({
    icon: "info",
    title: "Información",
    text: message,
    confirmButtonColor: "#3b82f6",
  })
}
