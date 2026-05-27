import { useState, useMemo } from "react";
import { Calendar, MapPin, User, Clock, Plus, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { mockAppointments, mockDoctors } from "@/lib/mockData";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loader from "@/components/global/Loader";
import { toast } from "sonner";

export function meta() {
  return [{ title: "My Appointments" }];
}

export default function PatientAppointments() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [isBooking, setIsBooking] = useState(false);

  if (isPending) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader label="Loading appointments..." />
      </div>
    );
  }

  // Get patient's appointments (simulated by matching user name with patient in appointments)
  const patientAppointments = useMemo(
    () =>
      mockAppointments.filter(
        (apt) =>
          apt.patientName.toLowerCase() === user?.name?.toLowerCase() ||
          apt.patientId === user?.id
      ),
    [user]
  );

  const upcomingAppointments = patientAppointments.filter(
    (apt) => new Date(apt.appointmentDate) > new Date()
  );
  const pastAppointments = patientAppointments.filter(
    (apt) => new Date(apt.appointmentDate) <= new Date()
  );

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedDoctor || !selectedReason) {
      toast.error("Please fill all fields");
      return;
    }

    setIsBooking(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Appointment booked successfully!");
      setShowBookingModal(false);
      setSelectedDate("");
      setSelectedDoctor("");
      setSelectedReason("");
    } catch (error) {
      toast.error("Failed to book appointment");
    } finally {
      setIsBooking(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      confirmed: "default",
      pending: "secondary",
      completed: "outline",
      cancelled: "destructive",
      emergency: "destructive",
    };
    return variants[status] || "default";
  };

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
          onClick={() => setShowBookingModal(true)}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Book Appointment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Upcoming
              </p>
              <p className="text-3xl font-bold">{upcomingAppointments.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Completed
              </p>
              <p className="text-3xl font-bold">
                {pastAppointments.filter((a) => a.status === "completed").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Total
              </p>
              <p className="text-3xl font-bold">{patientAppointments.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Upcoming Appointments */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <EmptyState
              title="No Upcoming Appointments"
              description="You don't have any scheduled appointments. Book one now!"
              icon={Calendar}
            />
          ) : (
            <div className="grid gap-4">
              {upcomingAppointments.map((apt) => (
                <Card key={apt.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{apt.doctorName}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {apt.department}
                        </p>
                      </div>
                      <Badge variant={getStatusBadge(apt.status)}>
                        {apt.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {new Date(apt.appointmentDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {apt.appointmentTime}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        Room {apt.roomNumber}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Reschedule
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Past Appointments */}
        <TabsContent value="history" className="space-y-4">
          {pastAppointments.length === 0 ? (
            <EmptyState
              title="No Appointment History"
              description="Your past appointments will appear here"
              icon={Calendar}
            />
          ) : (
            <div className="grid gap-4">
              {pastAppointments.map((apt) => (
                <Card key={apt.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{apt.doctorName}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {apt.department}
                        </p>
                      </div>
                      <Badge variant={getStatusBadge(apt.status)}>
                        {apt.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {new Date(apt.appointmentDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {apt.appointmentTime}
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full mt-4">
                      View Notes
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Book New Appointment</CardTitle>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Select Doctor
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a doctor...</option>
                  {mockDoctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name} - {doc.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Reason for Visit
                </label>
                <input
                  type="text"
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  placeholder="e.g., Regular checkup"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBookAppointment}
                  disabled={isBooking}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isBooking ? "Booking..." : "Book"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
