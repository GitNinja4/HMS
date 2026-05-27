import React, { useMemo, useState } from "react"
import { mockPatients } from "@/lib/mockData"
import { User } from "@/types"
import { SectionHeader } from "@/components/ui/section-header"
import { TableToolbar } from "@/components/ui/table-toolbar"
import { DetailsSheet } from "@/components/users/DetailsSheet"
import { PatientCard } from "@/components/users/PatientCard"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Users, Plus } from "lucide-react"

export function meta() {
  return [{ title: "Patients" }]
}

const Patients = () => {
  const [searchValue, setSearchValue] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Filter patients based on search and status
  const filteredPatients = useMemo(() => {
    return mockPatients.filter((patient) => {
      const matchesSearch =
        searchValue === "" ||
        patient.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchValue.toLowerCase()) ||
        patient._id.includes(searchValue)

      const matchesStatus =
        !statusFilter || patient.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [searchValue, statusFilter])

  const handleViewPatient = (patient: User) => {
    setSelectedPatient(patient)
    setIsSheetOpen(true)
  }

  // Status filter options
  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Admitted", value: "admitted" },
    { label: "In Treatment", value: "in_treatment" },
    { label: "Observation", value: "observation" },
    { label: "Follow-up", value: "follow_up" },
    { label: "Discharged", value: "discharged" },
  ]

  const activeFiltersCount = (searchValue ? 1 : 0) + (statusFilter ? 1 : 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Patient Directory"
          description={`${mockPatients.length} total patients • ${filteredPatients.length} visible`}
          icon={Users}
          action={{ label: "Add Patient", onClick: () => {} }}
        />
      </div>

      {/* Search & Filter Toolbar */}
      <TableToolbar
        searchPlaceholder="Search by name, email, or ID..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={[
          {
            label: "Status",
            options: statusOptions.slice(1),
            selectedValue: statusFilter,
            onFilterChange: setStatusFilter,
          },
        ]}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={() => {
          setSearchValue("")
          setStatusFilter(undefined)
        }}
      />

      {/* Patient Cards Grid */}
      {filteredPatients.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient._id}
              patient={patient}
              onClick={() => handleViewPatient(patient)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          variant="no-results"
          title="No patients found"
          description={
            searchValue || statusFilter
              ? "Try adjusting your search or filter criteria"
              : "No patients in the system yet"
          }
          action={{
            label: "Create New Patient",
            onClick: () => {},
          }}
        />
      )}

      {/* Patient Detail Sheet */}
      <DetailsSheet
        patient={selectedPatient}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />

      {/* Stats Footer */}
      {filteredPatients.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {mockPatients.filter((p) => p.status === "admitted").length}
              </p>
              <p className="text-xs text-muted-foreground">Admitted</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {mockPatients.filter((p) => p.status === "in_treatment").length}
              </p>
              <p className="text-xs text-muted-foreground">In Treatment</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {mockPatients.filter((p) => p.status === "observation").length}
              </p>
              <p className="text-xs text-muted-foreground">Observation</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {mockPatients.filter((p) => p.status === "discharged").length}
              </p>
              <p className="text-xs text-muted-foreground">Discharged</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Patients
