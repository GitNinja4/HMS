import React, { useState } from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Calendar } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import Loader from "@/components/global/Loader"

export function meta() {
  return [{ title: "Appointments" }]
}

const Appointments = () => {
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user

  if (isPending) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader label="Loading appointments..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Appointments Management"
        description="View and manage all healthcare appointments"
        icon={Calendar}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Today's Appointments
              </p>
              <p className="text-3xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                This Week
              </p>
              <p className="text-3xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Confirmed
              </p>
              <p className="text-3xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Pending
              </p>
              <p className="text-3xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Message */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6 flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Appointment System Under Development</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              The appointment scheduling and management system is being integrated with the backend. Features like calendar view, doctor availability, and booking will be available soon.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="doctors">Doctor Availability</TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-4">
          <EmptyState
            title="No Appointments Scheduled"
            description="Calendar view coming soon"
            icon={Calendar}
          />
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          <EmptyState
            title="No Appointments"
            description="There are no appointments to display"
            icon={Calendar}
          />
        </TabsContent>

        {/* Doctor Availability */}
        <TabsContent value="doctors" className="space-y-4">
          <EmptyState
            title="Doctor Availability"
            description="Doctor availability will be displayed here"
            icon={Calendar}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Appointments
