import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import * as api from "@/lib/api";
import Loader from "@/components/global/Loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Pill,
  FileText,
  Heart,
  ChevronRight,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";

export function meta() {
  return [{ title: "Patient Dashboard" }];
}

export default function PatientDashboard() {
  const { data: session, isPending: isAuthLoading } = authClient.useSession();
  const user = session?.user;

  // Fetch patient appointments
  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: () =>
      api.getPatientAppointments({
        patientId: user?.id || "",
        limit: 100,
      }),
    enabled: !!user?.id,
  });

  // Fetch patient prescriptions
  const { data: prescriptionsData, isLoading: prescriptionsLoading } = useQuery({
    queryKey: ["prescriptions", user?.id],
    queryFn: () =>
      api.getPatientPrescriptions({
        patientId: user?.id || "",
        limit: 100,
      }),
    enabled: !!user?.id,
  });

  // Fetch patient vital signs (latest)
  const { data: vitalsData } = useQuery({
    queryKey: ["vitals", user?.id],
    queryFn: () =>
      api.getPatientVitalSigns({
        patientId: user?.id || "",
        limit: 1,
      }),
    enabled: !!user?.id,
  });

  // Fetch assigned doctor info
  const { data: assignedDoctor } = useQuery({
    queryKey: ["assignedDoctor", user?.assigned_doctor_id],
    queryFn: () => (user?.assigned_doctor_id ? api.getUserById(user.assigned_doctor_id) : null),
    enabled: !!user?.assigned_doctor_id,
  });

  if (isAuthLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader label="Preparing Dashboard..." />
      </div>
    );
  }

  const appointments = appointmentsData?.data || [];
  const prescriptions = prescriptionsData?.data || [];

  // Filter appointments
  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.scheduled_at) > new Date()
  );

  const nextAppointment = upcomingAppointments
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .at(0) || null;

  const activePrescriptions = prescriptions.filter((p) => p.status === "active" || p.status === "dispensed");

  // Calculate health score (placeholder - can be enhanced later)
  const calculateHealthScore = () => {
    let score = 85;
    if (vitalsData?.data && vitalsData.data.length > 0) {
      const latest = vitalsData.data[0];
      // Adjust score based on vitals (example logic)
      if (latest.blood_pressure_systolic > 140 || latest.blood_pressure_diastolic > 90) score -= 10;
      if (latest.heart_rate > 100 || latest.heart_rate < 60) score -= 5;
    }
    return Math.max(0, Math.min(100, score));
  };

  const healthScore = calculateHealthScore();

  return (
    <div className="space-y-8">
      {/* 1. Welcome & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Here's an overview of your health status
          </p>
        </div>
      </div>

      {/* 2. Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  Upcoming Appointments
                </p>
                <p className="text-3xl font-bold">
                  {appointmentsLoading ? "..." : upcomingAppointments.length}
                </p>
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
                  Active Medications
                </p>
                <p className="text-3xl font-bold">
                  {prescriptionsLoading ? "..." : activePrescriptions.length}
                </p>
              </div>
              <Pill className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  Total Appointments
                </p>
                <p className="text-3xl font-bold">
                  {appointmentsLoading ? "..." : appointments.length}
                </p>
              </div>
              <FileText className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  Health Score
                </p>
                <p className="text-3xl font-bold">{healthScore}%</p>
              </div>
              <Heart className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN (8 Units) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Next Appointment */}
          {appointmentsLoading ? (
            <Card>
              <CardContent className="pt-6">
                <Loader label="Loading appointments..." />
              </CardContent>
            </Card>
          ) : nextAppointment ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Next Appointment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-lg">
                        {nextAppointment.title || "Medical Appointment"}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {nextAppointment.appointment_type}
                      </p>
                    </div>
                    <Badge>{nextAppointment.status}</Badge>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <p>
                      📅{" "}
                      {new Date(nextAppointment.scheduled_at).toLocaleDateString()}
                    </p>
                    <p>
                      🕐{" "}
                      {new Date(nextAppointment.scheduled_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {nextAppointment.location && <p>📍 {nextAppointment.location}</p>}
                  </div>

                  <div className="flex gap-2">
                    <Link to="/patient/appointments" className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        View All
                      </Button>
                    </Link>
                    {nextAppointment.meeting_link && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Join Virtual
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    No upcoming appointments
                  </p>
                  <Link to="/patient/appointments">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Book Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Medications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Active Medications
              </CardTitle>
              <Link to="/patient/prescriptions">
                <Button variant="ghost" size="sm" className="gap-2">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {prescriptionsLoading ? (
                <Loader label="Loading prescriptions..." />
              ) : activePrescriptions.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  No active medications
                </p>
              ) : (
                <ul className="space-y-3">
                  {activePrescriptions.slice(0, 3).map((med) => (
                    <li
                      key={med.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <p className="font-semibold text-sm">
                        {med.medication_name} - {med.dosage}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {med.frequency} for {med.duration}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Health Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Health Alerts & Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activePrescriptions.length > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/30 rounded-lg">
                  <p className="text-sm font-semibold">⚠️ Medication Reminder</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Take {activePrescriptions[0]?.medication_name || "your medications"} as scheduled
                  </p>
                </div>
              )}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                <p className="text-sm font-semibold">ℹ️ Upcoming Appointment</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {nextAppointment
                    ? `You have an appointment on ${new Date(nextAppointment.scheduled_at).toLocaleDateString()}`
                    : "Schedule your next appointment with your doctor"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN (4 Units) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/patient/appointments" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  My Appointments
                </Button>
              </Link>
              <Link to="/patient/prescriptions" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Pill className="h-4 w-4 mr-2" />
                  Prescriptions
                </Button>
              </Link>
              <Link to="/patient/medical-records" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Medical Records
                </Button>
              </Link>
              <Link to="/patient/health-profile" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Health Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Assigned Doctor */}
          {assignedDoctor ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assigned Doctor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-3" />
                  <p className="font-semibold">{assignedDoctor.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {assignedDoctor.specialization || "Medical Professional"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">No Assigned Doctor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  You haven't been assigned a doctor yet. Contact administration to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
