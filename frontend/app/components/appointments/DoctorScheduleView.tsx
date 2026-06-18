import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appointment } from "@/types";
import * as api from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/global/Loader";
import { EmptyState } from "@/components/ui/empty-state";

interface DoctorScheduleViewProps {
  doctorId?: number;
}

export function DoctorScheduleView({ doctorId }: DoctorScheduleViewProps) {
  const { data: session, isPending: isAuthLoading } = authClient.useSession();
  const user = session?.user;
  const actualDoctorId = doctorId || user?.id;

  const [selectedNote, setSelectedNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showNoteModal, setShowNoteModal] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // Fetch doctor's appointments
  const { data: appointmentsData, isLoading: loadingAppointments } = useQuery({
    queryKey: ["doctor-appointments", actualDoctorId],
    queryFn: () =>
      api.getDoctorAppointments({
        doctorId: actualDoctorId?.toString() || "",
        limit: 100,
      }),
    enabled: !!actualDoctorId && !isAuthLoading,
  });

  const appointments = appointmentsData?.data || [];

  // Group appointments by status
  const pendingAppointments = appointments.filter(
    (apt) => apt.status === "scheduled"
  );
  const confirmedAppointments = appointments.filter(
    (apt) => apt.status === "confirmed"
  );
  const completedAppointments = appointments.filter(
    (apt) => apt.status === "completed"
  );

  // Accept appointment mutation
  const acceptMutation = useMutation({
    mutationFn: (appointmentId: number) =>
      api.acceptAppointment(appointmentId.toString(), selectedNote || undefined),
    onSuccess: () => {
      setSelectedNote("");
      setShowNoteModal(null);
      queryClient.invalidateQueries({
        queryKey: ["doctor-appointments", actualDoctorId],
      });
    },
  });

  // Reject appointment mutation
  const rejectMutation = useMutation({
    mutationFn: (appointmentId: number) =>
      api.rejectAppointment(appointmentId.toString(), rejectReason || undefined),
    onSuccess: () => {
      setRejectReason("");
      setShowRejectModal(null);
      queryClient.invalidateQueries({
        queryKey: ["doctor-appointments", actualDoctorId],
      });
    },
  });

  // Mark completed mutation
  const completeMutation = useMutation({
    mutationFn: (appointmentId: number) =>
      api.markAppointmentCompleted(appointmentId.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["doctor-appointments", actualDoctorId],
      });
    },
  });

  if (isAuthLoading || loadingAppointments) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader label="Loading schedule..." />
      </div>
    );
  }

  const AppointmentCard = ({
    apt,
    showActions,
  }: {
    apt: appointment;
    showActions: boolean;
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{apt.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Patient ID: {apt.patient_id}
            </p>
          </div>
          <Badge
            className={
              apt.status === "scheduled"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : apt.status === "confirmed"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            }
          >
            {apt.status.replace("_", " ")}
          </Badge>
        </div>

        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Calendar className="h-4 w-4" />
            {new Date(apt.scheduled_at).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Clock className="h-4 w-4" />
            {new Date(apt.scheduled_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            ({apt.duration_minutes} minutes)
          </div>
          {apt.appointment_type === "telehealth" && apt.meeting_link && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <MessageSquare className="h-4 w-4" />
              <a
                href={apt.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Join Meeting
              </a>
            </div>
          )}
          {apt.patient_notes && (
            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Patient Note:
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {apt.patient_notes}
              </p>
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex gap-2 flex-wrap">
            {apt.status === "scheduled" && (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 gap-2"
                  onClick={() => setShowNoteModal(apt.id)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setShowRejectModal(apt.id)}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
            {apt.status === "confirmed" && (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => completeMutation.mutate(apt.id)}
                disabled={completeMutation.isPending}
              >
                {completeMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Mark Completed
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <SectionHeader
          title="My Schedule"
          description="View and manage your appointments"
          icon={Calendar}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Pending
              </p>
              <p className="text-3xl font-bold text-yellow-600">
                {pendingAppointments.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Confirmed
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {confirmedAppointments.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Completed
              </p>
              <p className="text-3xl font-bold text-green-600">
                {completedAppointments.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending ({pendingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmed ({confirmedAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingAppointments.length === 0 ? (
            <EmptyState
              title="No Pending Appointments"
              description="All pending appointments have been handled"
              icon={Calendar}
            />
          ) : (
            pendingAppointments.map((apt) => (
              <AppointmentCard key={apt.id} apt={apt} showActions={true} />
            ))
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-4">
          {confirmedAppointments.length === 0 ? (
            <EmptyState
              title="No Confirmed Appointments"
              description="Confirmed appointments will appear here"
              icon={Calendar}
            />
          ) : (
            confirmedAppointments.map((apt) => (
              <AppointmentCard key={apt.id} apt={apt} showActions={true} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedAppointments.length === 0 ? (
            <EmptyState
              title="No Completed Appointments"
              description="Your completed appointments will appear here"
              icon={Calendar}
            />
          ) : (
            completedAppointments.map((apt) => (
              <AppointmentCard key={apt.id} apt={apt} showActions={false} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Accept Appointment Modal */}
      {showNoteModal !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Accept Appointment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Add Notes (optional)
                </label>
                <textarea
                  placeholder="e.g., Please bring medical records..."
                  value={selectedNote}
                  onChange={(e) => setSelectedNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowNoteModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    acceptMutation.mutate(showNoteModal)
                  }
                  disabled={acceptMutation.isPending}
                  className="gap-2"
                >
                  {acceptMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Confirm Accept
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reject Appointment Modal */}
      {showRejectModal !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Reject Appointment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Reason for Rejection *
                </label>
                <textarea
                  placeholder="e.g., Already scheduled at this time..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    rejectMutation.mutate(showRejectModal)
                  }
                  disabled={rejectMutation.isPending || !rejectReason}
                  className="gap-2"
                >
                  {rejectMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Confirm Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
