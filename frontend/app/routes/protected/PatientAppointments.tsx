import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus, Clock, MapPin, User, CheckCircle2, AlertCircle, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import * as api from "@/lib/api";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loader from "@/components/global/Loader";
import { Badge } from "@/components/ui/badge";
import { AppointmentBookingForm } from "@/components/appointments/AppointmentBookingForm";
import { RescheduleAppointmentDialog } from "@/components/appointments/RescheduleDialog";
import { AppointmentStatusTracker } from "@/components/appointments/AppointmentStatusTracker";

export function meta() {
  return [{ title: "My Appointments" }];
}

export default function PatientAppointments() {
  const { data: session, isPending: isAuthLoading } = authClient.useSession();
  const user = session?.user;
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // Fetch patient appointments
  const { data: appointmentsData, isLoading: appointmentsLoading, refetch } = useQuery({
    queryKey: ["patient-appointments", user?.id],
    queryFn: () =>
      api.getPatientAppointments({
        patientId: user?.id?.toString() || "",
        limit: 100,
      }),
    enabled: !!user?.id,
  });

  const cancelMutation = useMutation({
    mutationFn: (appointmentId: number) =>
      api.cancelAppointment(appointmentId.toString(), cancellationReason || undefined),
    onSuccess: () => {
      setCancellationReason("");
      setShowCancelModal(null);
      refetch();
    },
  });

  if (isAuthLoading || appointmentsLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader label="Loading appointments..." />
      </div>
    );
  }

  const appointments = appointmentsData?.data || [];

  // Filter appointments
  const now = new Date();
  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.scheduled_at) > now
  );
  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.scheduled_at) <= now
  );

  // Calculate stats
  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const cancelledCount = appointments.filter((a) => a.status === "cancelled").length;
  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;

  if (showBookingForm) {
    return (
      <div className="space-y-6">
        <div>
          <SectionHeader
            title="Book an Appointment"
            description="Schedule a new appointment with a healthcare provider"
            icon={Calendar}
          />
        </div>
        <AppointmentBookingForm
          patientId={user?.id || 0}
          onSuccess={() => {
            setShowBookingForm(false);
            refetch();
          }}
          onCancel={() => setShowBookingForm(false)}
        />
      </div>
    );
  }

  if (selectedAppointment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setSelectedAppointment(null)}
          >
            ← Back
          </Button>
          <h1 className="text-2xl font-bold">{selectedAppointment.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Date & Time</p>
                    <p className="font-semibold">
                      {new Date(selectedAppointment.scheduled_at).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm">
                      {new Date(selectedAppointment.scheduled_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Duration</p>
                    <p className="font-semibold">{selectedAppointment.duration_minutes} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Type</p>
                    <p className="font-semibold capitalize">
                      {selectedAppointment.appointment_type.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Status</p>
                    <p className="font-semibold">
                      <Badge
                        className={
                          selectedAppointment.status === "scheduled"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedAppointment.status === "confirmed"
                              ? "bg-blue-100 text-blue-800"
                              : selectedAppointment.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                        }
                      >
                        {selectedAppointment.status.replace("_", " ")}
                      </Badge>
                    </p>
                  </div>
                </div>

                {selectedAppointment.location && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </p>
                    <p className="font-semibold">{selectedAppointment.location}</p>
                  </div>
                )}

                {selectedAppointment.meeting_link && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-slate-500">Meeting Link</p>
                    <a
                      href={selectedAppointment.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Join Virtual Meeting
                    </a>
                  </div>
                )}

                {selectedAppointment.patient_notes && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-slate-500">Your Notes</p>
                    <p className="font-semibold">{selectedAppointment.patient_notes}</p>
                  </div>
                )}

                {selectedAppointment.notes && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border-t pt-4">
                    <p className="text-sm text-slate-500 font-semibold">Doctor's Notes</p>
                    <p className="text-sm">{selectedAppointment.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {selectedAppointment.status !== "completed" &&
              selectedAppointment.status !== "cancelled" && (
                <Card>
                  <CardContent className="pt-6 flex gap-3">
                    <Button
                      onClick={() => {
                        setShowRescheduleDialog(true);
                        setSelectedAppointment(null);
                      }}
                      variant="outline"
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reschedule
                    </Button>
                    <Button
                      onClick={() => setShowCancelModal(selectedAppointment.id)}
                      variant="destructive"
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Cancel Appointment
                    </Button>
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Status Tracker Sidebar */}
          <div>
            <AppointmentStatusTracker appointment={selectedAppointment} />
          </div>
        </div>

        {/* Cancel Modal */}
        {showCancelModal === selectedAppointment.id && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Cancel Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Are you sure you want to cancel this appointment?
                </p>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reason for Cancellation (optional)
                  </label>
                  <textarea
                    placeholder="e.g., Need to reschedule..."
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCancelModal(null);
                      setCancellationReason("");
                    }}
                  >
                    Keep Appointment
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => cancelMutation.mutate(selectedAppointment.id)}
                    disabled={cancelMutation.isPending}
                    className="gap-2"
                  >
                    {cancelMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Cancel Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reschedule Dialog */}
        {showRescheduleDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Reschedule Appointment</CardTitle>
              </CardHeader>
              <CardContent>
                <RescheduleAppointmentDialog
                  appointment={selectedAppointment}
                  onSuccess={() => {
                    setShowRescheduleDialog(false);
                    setSelectedAppointment(null);
                    refetch();
                  }}
                  onCancel={() => setShowRescheduleDialog(false)}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <SectionHeader
            title="My Appointments"
            description="Manage your healthcare visits and consultations"
            icon={Calendar}
          />
        </div>
        <Button
          onClick={() => setShowBookingForm(true)}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Book Appointment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Upcoming
              </p>
              <p className="text-3xl font-bold text-blue-600">{upcomingAppointments.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Confirmed
              </p>
              <p className="text-3xl font-bold text-purple-600">{confirmedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Completed
              </p>
              <p className="text-3xl font-bold text-green-600">{completedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Total
              </p>
              <p className="text-3xl font-bold">{appointments.length}</p>            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            History ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Appointments */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <EmptyState
              title="No Upcoming Appointments"
              description="You don't have any upcoming appointments. Schedule one with your doctor."
              icon={Calendar}
            />
          ) : (
            upcomingAppointments.map((apt) => (
              <Card key={apt.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{apt.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {apt.appointment_type}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {apt.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Calendar className="h-4 w-4" />
                      {new Date(apt.scheduled_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Clock className="h-4 w-4" />
                      {new Date(apt.scheduled_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {apt.location && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <MapPin className="h-4 w-4" />
                        {apt.location}
                      </div>
                    )}
                  </div>

                  {apt.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {apt.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    {apt.meeting_link && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Join Virtual
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      Reschedule
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Past Appointments */}
        <TabsContent value="history" className="space-y-4">
          {pastAppointments.length === 0 ? (
            <EmptyState
              title="No Appointment History"
              description="You haven't completed any appointments yet"
              icon={Calendar}
            />
          ) : (
            pastAppointments.map((apt) => (
              <Card key={apt.id} className="opacity-75">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{apt.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(apt.scheduled_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      className={
                        apt.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }
                    >
                      {apt.status}
                    </Badge>
                  </div>
                  {apt.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {apt.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
