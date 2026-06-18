import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import * as api from "@/lib/api";
import Loader from "@/components/global/Loader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, User, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function meta() {
  return [{ title: "My Appointments" }];
}

export default function PatientAppointments() {
  const { data: session, isPending: isAuthLoading } = authClient.useSession();
  const user = session?.user;
  const [selectedTab, setSelectedTab] = useState("upcoming");

  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: () =>
      api.getPatientAppointments({
        patientId: user?.id || "",
        limit: 100,
      }),
    enabled: !!user?.id,
  });

  if (isAuthLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader label="Loading appointments..." />
      </div>
    );
  }

  const appointments = appointmentsData?.data || [];

  // Filter appointments
  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.scheduled_at) > new Date() && apt.status !== "cancelled"
  );

  const completedAppointments = appointments.filter(
    (apt) => apt.status === "completed" || new Date(apt.scheduled_at) <= new Date()
  );

  const cancelledAppointments = appointments.filter(
    (apt) => apt.status === "cancelled"
  );

  // Stats
  const stats = {
    upcoming: upcomingAppointments.length,
    completed: completedAppointments.length,
    cancelled: cancelledAppointments.length,
    total: appointments.length,
  };

  // AppointmentCard component
  const AppointmentCard = ({
    appointment,
    status,
  }: {
    appointment: any;
    status: "upcoming" | "completed" | "cancelled";
  }) => {
    const appointmentDate = new Date(appointment.scheduled_at);
    const isUpcoming = new Date(appointment.scheduled_at) > new Date();

    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{appointment.title || "Medical Appointment"}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                    {appointment.appointment_type.replace("_", " ")}
                  </p>
                </div>
                <Badge
                  className={
                    status === "upcoming"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      : status === "completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  }
                >
                  {appointment.status}
                </Badge>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Calendar className="h-4 w-4" />
                  {appointmentDate.toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Clock className="h-4 w-4" />
                  {appointmentDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                {appointment.location && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4" />
                    {appointment.location}
                  </div>
                )}
              </div>

              {appointment.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                  {appointment.description}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {isUpcoming && appointment.meeting_link && (
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Join Virtual
                </Button>
              )}
              {isUpcoming && (
                <Button variant="outline" size="sm">
                  Reschedule
                </Button>
              )}
              {isUpcoming && (
                <Button variant="outline" size="sm" className="text-red-600">
                  Cancel
                </Button>
              )}
              {status !== "upcoming" && (
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Schedule and manage your medical appointments
          </p>
        </div>
        <Button className="gap-2 w-full md:w-auto">
          <Plus className="h-4 w-4" />
          Book Appointment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  Upcoming
                </p>
                <p className="text-3xl font-bold">{isLoading ? "..." : stats.upcoming}</p>
              </div>
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  Completed
                </p>
                <p className="text-3xl font-bold">{isLoading ? "..." : stats.completed}</p>
              </div>
              <Calendar className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  Cancelled
                </p>
                <p className="text-3xl font-bold">{isLoading ? "..." : stats.cancelled}</p>
              </div>
              <Calendar className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  Total
                </p>
                <p className="text-3xl font-bold">{isLoading ? "..." : stats.total}</p>
              </div>
              <Calendar className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
          <CardDescription>View and manage your scheduled appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            {/* Upcoming Appointments */}
            <TabsContent value="upcoming" className="space-y-4">
              {isLoading ? (
                <Loader label="Loading appointments..." />
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    No upcoming appointments
                  </p>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Book Your First Appointment
                  </Button>
                </div>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    status="upcoming"
                  />
                ))
              )}
            </TabsContent>

            {/* Completed Appointments */}
            <TabsContent value="completed" className="space-y-4">
              {isLoading ? (
                <Loader label="Loading appointments..." />
              ) : completedAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">
                    No completed appointments
                  </p>
                </div>
              ) : (
                completedAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    status="completed"
                  />
                ))
              )}
            </TabsContent>

            {/* Cancelled Appointments */}
            <TabsContent value="cancelled" className="space-y-4">
              {isLoading ? (
                <Loader label="Loading appointments..." />
              ) : cancelledAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">
                    No cancelled appointments
                  </p>
                </div>
              ) : (
                cancelledAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    status="cancelled"
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
