import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { appointment } from "@/types";
import * as api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Loader2 } from "lucide-react";

interface RescheduleAppointmentDialogProps {
  appointment: appointment;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RescheduleAppointmentDialog({
  appointment,
  onSuccess,
  onCancel,
}: RescheduleAppointmentDialogProps) {
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  // Fetch available slots for the new date
  const { data: availabilityData, isLoading: loadingSlots } = useQuery({
    queryKey: ["doctor-availability", appointment.doctor_id, newDate],
    queryFn: () => {
      if (!newDate) return null;
      return api.getDoctorAvailability(appointment.doctor_id, newDate);
    },
    enabled: !!newDate,
  });

  const availableSlots = availabilityData?.available_slots || [];

  const rescheduleMutation = useMutation({
    mutationFn: () => {
      if (!newDate || !newTime) {
        setError("Please select both date and time");
        return Promise.reject(new Error("Missing fields"));
      }

      const newScheduledAt = new Date(
        `${newDate}T${newTime}`
      ).toISOString();

      return api.rescheduleAppointment(
        appointment.id.toString(),
        newScheduledAt,
        reason
      );
    },
    onSuccess: () => {
      setError("");
      onSuccess?.();
    },
    onError: (err: any) => {
      setError(err.message || "Failed to reschedule appointment");
    },
  });

  const today = new Date().toISOString().split("T")[0];
  const appointmentDate = new Date(appointment.scheduled_at)
    .toISOString()
    .split("T")[0];

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Current Appointment Info */}
      <div className="bg-slate-50 p-4 rounded-lg">
        <p className="text-sm font-semibold text-slate-700 mb-2">
          Current Appointment
        </p>
        <p className="text-sm">
          {new Date(appointment.scheduled_at).toLocaleDateString()} at{" "}
          {new Date(appointment.scheduled_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* New Date */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          New Date *
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="date"
            value={newDate}
            onChange={(e) => {
              setNewDate(e.target.value);
              setNewTime("");
            }}
            min={today}
            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* New Time */}
      {newDate && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            New Time *
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
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <select
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a time</option>
                {availableSlots.map((slot) => {
                  const time = new Date(slot).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <option
                      key={slot}
                      value={new Date(slot).toTimeString().slice(0, 5)}
                    >
                      {time}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Reason */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Reason for Rescheduling
        </label>
        <textarea
          placeholder="e.g., Conflict with work schedule"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={rescheduleMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={() => rescheduleMutation.mutate()}
          disabled={
            rescheduleMutation.isPending || !newDate || !newTime
          }
          className="gap-2"
        >
          {rescheduleMutation.isPending && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          Reschedule
        </Button>
      </div>
    </div>
  );
}
