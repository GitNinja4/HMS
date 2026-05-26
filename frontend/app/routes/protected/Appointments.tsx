import React, { useMemo, useState } from "react"
import {
  mockAppointments,
  mockDoctors,
  getAppointmentsByDepartment,
} from "@/app/lib/mockData"
import { MockAppointment } from "@/app/lib/mockData"
import { SectionHeader } from "@/app/components/ui/section-header"
import { TableToolbar } from "@/app/components/ui/table-toolbar"
import { AppointmentCalendar } from "@/app/components/appointments/AppointmentCalendar"
import { AppointmentCardCompact } from "@/app/components/appointments/AppointmentCardCompact"
import { DoctorAvailability } from "@/app/components/appointments/DoctorAvailability"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { EmptyState } from "@/app/components/ui/empty-state"
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
      doctorSpecialty: "Neurology",
      date: "2026-05-25",
      time: "2:00 PM",
      duration: 30,
      status: "completed",
      type: "follow-up",
      location: "Room 405 - Neurology Wing",
      notes: "Post-treatment consultation",
    },
    {
      id: "APT-006",
      patientName: "Sarah Martinez",
      patientId: "P-006",
      doctorName: "Dr. Michael Chen",
      doctorSpecialty: "General Practice",
      date: "2026-05-24",
      time: "10:00 AM",
      duration: 20,
      status: "no-show",
      type: "consultation",
      location: "Room 105 - GP Wing",
    },
    {
      id: "APT-007",
      patientName: "Thomas Clark",
      patientId: "P-007",
      doctorName: "Dr. Sarah Smith",
      doctorSpecialty: "Cardiology",
      date: "2026-05-23",
      time: "1:00 PM",
      duration: 30,
      status: "cancelled",
      type: "follow-up",
      location: "Room 201 - Cardiology Wing",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800";
      case "no-show":
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300 border border-slate-200 dark:border-slate-800";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300";
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ");
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ");
  };

  const appointmentTabs = [
    {
      value: "upcoming",
      label: "Upcoming",
      appointments: allAppointments.filter(
        (apt) =>
          (apt.status === "confirmed" || apt.status === "pending") &&
          new Date(apt.date) >= new Date()
      ),
    },
    {
      value: "completed",
      label: "Completed",
      appointments: allAppointments.filter((apt) => apt.status === "completed"),
    },
    {
      value: "cancelled",
      label: "Cancelled",
      appointments: allAppointments.filter(
        (apt) => apt.status === "cancelled" || apt.status === "no-show"
      ),
    },
  ];

  const currentTabAppointments = appointmentTabs.find(
    (tab) => tab.value === selectedTab
  )?.appointments || [];

  const filteredAppointments = currentTabAppointments.filter(
    (apt) =>
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="card shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-700">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Left: Appointment Details */}
          <div className="flex-1 space-y-3">
            {/* Patient Name + Status */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {appointment.patientName}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  ID: {appointment.patientId}
                </p>
              </div>
              <Badge
                className={`${getStatusColor(appointment.status)} whitespace-nowrap flex-shrink-0`}
              >
                {getStatusLabel(appointment.status)}
              </Badge>
            </div>

            {/* Doctor & Specialty */}
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <User className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <span className="font-medium">{appointment.doctorName}</span>
              <span className="text-xs text-slate-500">
                • {appointment.doctorSpecialty}
              </span>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Calendar className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <span className="font-medium">
                {new Date(appointment.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Time & Duration */}
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Clock className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <span className="font-medium">{appointment.time}</span>
              <span className="text-xs text-slate-500">
                • {appointment.duration} min
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <span className="text-sm">{appointment.location}</span>
            </div>

            {/* Type Badge */}
            {appointment.type && (
              <div className="flex items-center gap-2 pt-2">
                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">
                  {getTypeLabel(appointment.type)}
                </Badge>
              </div>
            )}

            {/* Notes */}
            {appointment.notes && (
              <div className="pt-2 bg-slate-50 dark:bg-slate-900/30 rounded p-3 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Notes
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {appointment.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-2 lg:flex-shrink-0">
            <Button
              disabled={appointment.status !== "confirmed"}
              variant={
                appointment.status === "confirmed" ? "outline" : "ghost"
              }
              size="sm"
              className="whitespace-nowrap"
            >
              Reschedule
            </Button>
            <Button
              disabled={
                appointment.status === "cancelled" ||
                appointment.status === "completed"
              }
              variant="ghost"
              size="sm"
              className="whitespace-nowrap"
            >
              Cancel
            </Button>
            {appointment.status === "confirmed" && (
              <Button
                disabled
                variant="ghost"
                size="sm"
                className="whitespace-nowrap text-xs"
              >
                Join Call
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            Appointments
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage patient consultations and procedures
          </p>
        </div>
        <Button disabled className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Appointment
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3" role="tablist">
          {appointmentTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              role="tab"
              className="text-xs sm:text-sm"
            >
              {tab.label}
              <span className="ml-2 text-xs font-semibold text-slate-500">
                ({tab.appointments.length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Search & Filter */}
        <div className="flex gap-2 mt-6 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
            <Input
              placeholder="Search by patient, doctor, or location..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search appointments"
            />
          </div>
          <Button variant="outline" size="icon" disabled aria-label="Filter appointments">
            <Filter className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Content */}
        {appointmentTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            {filteredAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredAppointments.map((apt) => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))}
              </div>
            ) : (
              <Card className="card shadow-sm border-dashed">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" aria-hidden="true" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">
                    {searchTerm
                      ? "No appointments match your search"
                      : `No ${tab.label.toLowerCase()} appointments`}
                  </p>
                  {searchTerm && (
                    <p className="text-sm text-slate-500">
                      Try adjusting your search terms
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {allAppointments.filter(
                (apt) =>
                  (apt.status === "confirmed" || apt.status === "pending") &&
                  new Date(apt.date) >= new Date()
              ).length}
            </div>
            <p className="text-xs text-slate-500 mt-1">appointments scheduled</p>
          </CardContent>
        </Card>

        <Card className="card shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {
                allAppointments.filter(
                  (apt) =>
                    apt.date ===
                    new Date().toISOString().split("T")[0]
                ).length
              }
            </div>
            <p className="text-xs text-slate-500 mt-1">appointments today</p>
          </CardContent>
        </Card>

        <Card className="card shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {allAppointments.filter((apt) => apt.status === "completed")
                .length}
            </div>
            <p className="text-xs text-slate-500 mt-1">this month</p>
          </CardContent>
        </Card>

        <Card className="card shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              No-shows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {allAppointments.filter(
                (apt) => apt.status === "no-show"
              ).length}
            </div>
            <p className="text-xs text-slate-500 mt-1">missed appointments</p>
          </CardContent>
        </Card>
      </div>

      {/* Features Coming Soon */}
      <Card className="card shadow-sm bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            Upcoming Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc list-inside">
            <li>Interactive calendar view with drag-and-drop rescheduling</li>
            <li>Doctor availability synchronization</li>
            <li>Patient self-booking portal</li>
            <li>Automated appointment reminders (SMS/Email)</li>
            <li>Video consultation integration</li>
            <li>Appointment analytics and reports</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}