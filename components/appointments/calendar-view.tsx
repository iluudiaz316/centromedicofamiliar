"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

export function CalendarView({ appointments, onEdit }: any) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getAppointmentsForDay = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split("T")[0]
    return appointments.filter((apt: any) => {
      const aptDate = new Date(apt.appointment_date).toISOString().split("T")[0]
      return aptDate === dateStr
    })
  }

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="p-2" />)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayAppointments = getAppointmentsForDay(day)
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

    days.push(
      <div
        key={day}
        className={`min-h-[120px] border p-2 ${isToday ? "bg-gradient-to-br from-[#1a3a52] to-[#0d2137] border-cyan-500" : "bg-[#0d2137] border-[#1e3a5f]"}`}
      >
        <div className={`text-sm font-medium ${isToday ? "text-cyan-400" : "text-gray-300"}`}>{day}</div>
        <div className="mt-1 space-y-1">
          {dayAppointments.map((apt: any) => (
            <button
              key={apt.id}
              onClick={() => onEdit(apt)}
              className={`w-full rounded px-2 py-1 text-left text-xs transition-colors ${
                apt.status === "CONFIRMED"
                  ? "bg-green-900/40 text-green-300 hover:bg-green-900/60 border border-green-700/50"
                  : apt.status === "SCHEDULED"
                    ? "bg-cyan-900/40 text-cyan-300 hover:bg-cyan-900/60 border border-cyan-700/50"
                    : apt.status === "ATTENDED"
                      ? "bg-gray-700/40 text-gray-300 hover:bg-gray-700/60 border border-gray-600/50"
                      : apt.status === "CANCELLED"
                        ? "bg-red-900/40 text-red-300 hover:bg-red-900/60 border border-red-700/50"
                        : "bg-amber-900/40 text-amber-300 hover:bg-amber-900/60 border border-amber-700/50"
              }`}
            >
              <div className="font-medium">
                {new Date(apt.appointment_date).toLocaleTimeString("es-GT", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="truncate">
                {apt.patient.first_name} {apt.patient.last_name}
              </div>
            </button>
          ))}
        </div>
      </div>,
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-cyan-400" />
            {new Date(year, month).toLocaleDateString("es-GT", {
              month: "long",
              year: "numeric",
            })}
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={previousMonth} variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button onClick={() => setCurrentDate(new Date())} variant="outline" size="sm">
              Hoy
            </Button>
            <Button onClick={nextMonth} variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-cyan-400">
              {day}
            </div>
          ))}
          {days}
        </div>
      </CardContent>
    </Card>
  )
}
