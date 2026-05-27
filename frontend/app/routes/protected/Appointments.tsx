import React, { useMemo, useState } from "react"
import {
  mockAppointments,
  mockDoctors,
  getAppointmentsByDepartment,
} from "@/lib/mockData"
import { MockAppointment } from "@/lib/mockData"
import { SectionHeader } from "@/components/ui/section-header"
import { TableToolbar } from "@/components/ui/table-toolbar"
import { AppointmentCalendar } from "@/components/appointments/AppointmentCalendar"
import { AppointmentCardCompact } from "@/components/appointments/AppointmentCardCompact"
import { DoctorAvailability } from "@/components/appointments/DoctorAvailability"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/ui/empty-state"
import { Calendar, Users, Clock } from "lucide-react"

export function meta() {
  return [{ title: "Appointments" }]
}

const Appointments = () => {
  const [activeTab, setActiveTab] = useState("calendar")
  const [searchValue, setSearchValue] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [departmentFilter, setDepartmentFilter] = useState<string | undefined>()
  const [doctorFilter, setDoctorFilter] = useState<string | undefined>()
  const [selectedAppointment, setSelectedAppointment] =
    useState<MockAppointment | null>(null)
  const [currentWeekDate, setCurrentWeekDate] = useState(new Date())

  // Get unique departments
  const departments = Array.from(
    new Set(mockAppointments.map((a) => a.department))
  ).sort()

  // Get unique doctors for appointments
  const appointmentDoctors = Array.from(
    new Set(mockAppointments.map((a) => ({ id: a.doctorId, name: a.doctorName })))
  ).sort((a, b) => a.name.localeCompare(b.name))

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return mockAppointments.filter((apt) => {
      const matchesSearch =
        searchValue === "" ||
        apt.patientName.toLowerCase().includes(searchValue.toLowerCase()) ||
        apt.id.includes(searchValue)

      const matchesStatus = !statusFilter || apt.status === statusFilter
      const matchesDepartment =
        !departmentFilter || apt.department === departmentFilter
      const matchesDoctor = !doctorFilter || apt.doctorId === doctorFilter

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDepartment &&
        matchesDoctor
      )
    })
  }, [searchValue, statusFilter, departmentFilter, doctorFilter])

  // Get appointments for current week
  const weekStart = new Date(currentWeekDate)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1) // Monday
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6) // Sunday

  const weekAppointments = filteredAppointments.filter((apt) => {
    const aptDate = new Date(apt.appointmentDate)
    return aptDate >= weekStart && aptDate <= weekEnd
  })

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeekDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeekDate(newDate)
  }

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeekDate(newDate)
  }

  const activeFiltersCount =
    (searchValue ? 1 : 0) +
    (statusFilter ? 1 : 0) +
    (departmentFilter ? 1 : 0) +
    (doctorFilter ? 1 : 0)

  // Count appointments by status
  const appointmentStats = {
    total: filteredAppointments.length,
    confirmed: filteredAppointments.filter((a) => a.status === "confirmed").length,
    pending: filteredAppointments.filter((a) => a.status === "pending").length,
    emergency: filteredAppointments.filter((a) => a.status === "emergency").length,
    completed: filteredAppointments.filter((a) => a.status === "completed").length,
    cancelled: filteredAppointments.filter((a) => a.status === "cancelled").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        title="Appointment Management"
        description={`${mockAppointments.length} total appointments • ${filteredAppointments.length} visible`}
        icon={Calendar}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Week View</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">List View</span>
          </TabsTrigger>
          <TabsTrigger value="doctors" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Doctors</span>
          </TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-6">
          <AppointmentCalendar
            appointments={weekAppointments}
            weekStartDate={currentWeekDate}
            onPreviousWeek={handlePreviousWeek}
            onNextWeek={handleNextWeek}
            onAppointmentClick={setSelectedAppointment}
          />
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-6">
          {/* Search & Filter Toolbar */}
          <TableToolbar
            searchPlaceholder="Search by patient name or appointment ID..."
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            filters={[
              {
                label: "Status",
                options: [
                  { label: "Confirmed", value: "confirmed" },
                  { label: "Pending", value: "pending" },
                  { label: "Completed", value: "completed" },
                  { label: "Cancelled", value: "cancelled" },
                  { label: "Emergency", value: "emergency" },
                ],
                selectedValue: statusFilter,
                onFilterChange: setStatusFilter,
              },
              {
                label: "Department",
                options: departments.map((dept) => ({
                  label: dept,
                  value: dept,
                })),
                selectedValue: departmentFilter,
                onFilterChange: setDepartmentFilter,
              },
              {
                label: "Doctor",
                options: appointmentDoctors.map((doc) => ({
                  label: doc.name,
                  value: doc.id,
                })),
                selectedValue: doctorFilter,
                onFilterChange: setDoctorFilter,
              },
            ]}
            activeFiltersCount={activeFiltersCount}
            onClearFilters={() => {
              setSearchValue("")
              setStatusFilter(undefined)
              setDepartmentFilter(undefined)
              setDoctorFilter(undefined)
            }}
          />

          {/* Appointments List */}
          {filteredAppointments.length > 0 ? (
            <div className="space-y-3">
              {filteredAppointments.map((appointment) => (
                <AppointmentCardCompact
                  key={appointment.id}
                  appointment={appointment}
                  onClick={() => setSelectedAppointment(appointment)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              variant="no-results"
              title="No appointments found"
              description="Try adjusting your search or filter criteria"
            />
          )}

          {/* Stats */}
          {filteredAppointments.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Statistics
              </h3>
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold text-foreground">
                    {appointmentStats.total}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Confirmed
                  </p>
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                    {appointmentStats.confirmed}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    Pending
                  </p>
                  <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                    {appointmentStats.pending}
                  </p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Emergency
                  </p>
                  <p className="text-lg font-bold text-red-700 dark:text-red-300">
                    {appointmentStats.emergency}
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Completed
                  </p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-300">
                    {appointmentStats.completed}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Cancelled
                  </p>
                  <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                    {appointmentStats.cancelled}
                  </p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Doctor Availability */}
        <TabsContent value="doctors" className="space-y-6">
          <DoctorAvailability doctors={mockDoctors} />
        </TabsContent>
      </Tabs>

      {/* Selected Appointment Details (Modal-like) */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                Appointment Details
              </h2>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Appointment ID
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {selectedAppointment.id}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Patient
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {selectedAppointment.patientName}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Doctor
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {selectedAppointment.doctorName}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Department
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {selectedAppointment.department}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Date
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(
                      selectedAppointment.appointmentDate
                    ).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Time
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {selectedAppointment.startTime} -{" "}
                    {selectedAppointment.endTime}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Room
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {selectedAppointment.room || "Not assigned"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Reason
                </p>
                <p className="text-sm text-foreground">
                  {selectedAppointment.reason}
                </p>
              </div>

              {selectedAppointment.notes && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                    Notes
                  </p>
                  <p className="text-sm text-blue-900 dark:text-blue-300">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-foreground rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Appointments
