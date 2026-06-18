import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, FileText, Loader2 } from "lucide-react";
import * as api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AppointmentBookingFormProps {
  patientId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AppointmentBookingForm({
  patientId,
  onSuccess,
  onCancel,
}: AppointmentBookingFormProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentType, setAppointmentType] = useState<
    "in_person" | "telehealth"
  >("in_person");
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  // Fetch doctors
  const { data: doctorsData, isLoading: loadingDoctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => api.getDoctors(),
  });

  const doctors = doctorsData?.data || [];

  // Fetch available slots when doctor and date are selected
  const { data: availabilityData, isLoading: loadingSlots } = useQuery({
    queryKey: ["doctor-availability", selectedDoctor, appointmentDate],
    queryFn: () => {
      if (!selectedDoctor || !appointmentDate) return null;
      return api.getDoctorAvailability(selectedDoctor, appointmentDate);
    },
    enabled: !!selectedDoctor && !!appointmentDate,
  });

  const availableSlots = availabilityData?.available_slots || [];

  // Create appointment mutation
  const createMutation = useMutation({
    mutationFn: () => {
      if (!selectedDoctor || !appointmentDate || !appointmentTime || !title) {
        setError("Please fill in all required fields");
        return Promise.reject(new Error("Missing fields"));
      }

      const scheduledAt = new Date(`${appointmentDate}T${appointmentTime}`);

      return api.createAppointment({
        patientId: patientId.toString(),
        doctorId: selectedDoctor,
        title,
        description: reason,
        appointmentType,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: 30,
        location: appointmentType === "in_person" ? location : undefined,
      });
    },
    onSuccess: () => {
      setError("");
      onSuccess?.();
    },
    onError: (err: any) => {
      setError(err.message || "Failed to book appointment");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book an Appointment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Doctor Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Select Doctor *
          </label>
          <select
            value={selectedDoctor || ""}
            onChange={(e) => {
              setSelectedDoctor(parseInt(e.target.value) || null);
              setAppointmentTime("");
            }}
            disabled={loadingDoctors}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              {loadingDoctors ? "Loading doctors..." : "Choose a doctor"}
            </option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                Dr. {doctor.name} {doctor.specialization ? `(${doctor.specialization})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Appointment Title */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Appointment Title *
          </label>
          <input
            type="text"
            placeholder="e.g., General Checkup, Follow-up"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Appointment Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Appointment Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="in_person"
                checked={appointmentType === "in_person"}
                onChange={(e) =>
                  setAppointmentType(e.target.value as "in_person" | "telehealth")
                }
              />
              <span>In-Person</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="telehealth"
                checked={appointmentType === "telehealth"}
                onChange={(e) =>
                  setAppointmentType(e.target.value as "in_person" | "telehealth")
                }
              />
              <span>Telehealth</span>
            </label>
          </div>
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Date *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => {
                setAppointmentDate(e.target.value);
                setAppointmentTime("");
              }}
              min={new Date().toISOString().split("T")[0]}
              disabled={!selectedDoctor}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Time Selection */}
        {appointmentDate && selectedDoctor && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Time *
            </label>
            {loadingSlots ? (
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading available times...
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-sm text-slate-500">
                No available slots for this date. Please choose another date.
              </div>
            ) : (
              <select
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a time</option>
                {availableSlots.map((slot) => {
                  const time = new Date(slot).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <option key={slot} value={new Date(slot).toTimeString().slice(0, 5)}>
                      {time}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
        )}

        {/* Location (for in-person) */}
        {appointmentType === "in_person" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Clinic address or room number"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Reason for Visit */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Reason for Visit
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <textarea
              placeholder="Describe your symptoms or reason for this appointment"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={
              createMutation.isPending ||
              !selectedDoctor ||
              !appointmentDate ||
              !appointmentTime ||
              !title
            }
            className="gap-2"
          >
            {createMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Book Appointment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
