import { appointment } from "@/types";
import { Check, Clock, AlertCircle, XCircle, Loader } from "lucide-react";

interface AppointmentStatusTrackerProps {
  appointment: appointment;
}

export function AppointmentStatusTracker({
  appointment,
}: AppointmentStatusTrackerProps) {
  const statuses = [
    {
      key: "scheduled",
      label: "Scheduled",
      icon: Clock,
      description: "Appointment scheduled",
    },
    {
      key: "confirmed",
      label: "Confirmed",
      icon: Check,
      description: "Doctor confirmed",
    },
    {
      key: "in_progress",
      label: "In Progress",
      icon: Loader,
      description: "Appointment ongoing",
    },
    {
      key: "completed",
      label: "Completed",
      icon: Check,
      description: "Appointment finished",
    },
  ];

  const statusOrder = ["scheduled", "confirmed", "in_progress", "completed"];
  const currentIndex = statusOrder.indexOf(appointment.status);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "confirmed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "no_show":
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (
    appointment.status === "cancelled" ||
    appointment.status === "no_show"
  ) {
    const Icon =
      appointment.status === "cancelled" ? XCircle : AlertCircle;
    return (
      <div
        className={`p-4 rounded-lg ${getStatusColor(appointment.status)}`}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5" />
          <div>
            <p className="font-semibold capitalize">
              {appointment.status.replace("_", " ")}
            </p>
            {appointment.cancellation_reason && (
              <p className="text-sm opacity-75">
                {appointment.cancellation_reason}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-700">Appointment Status</h3>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(appointment.status)}`}>
          {appointment.status.charAt(0).toUpperCase() +
            appointment.status.slice(1).replace("_", " ")}
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="space-y-6">
          {statuses.map((status, index) => {
            const isActive = statusOrder.indexOf(appointment.status) >= index;
            const isCompleted = statusOrder.indexOf(appointment.status) > index;
            const Icon = status.icon;

            return (
              <div key={status.key} className="flex gap-4">
                {/* Timeline dot and line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  {index < statuses.length - 1 && (
                    <div
                      className={`h-12 w-1 my-2 ${
                        isCompleted ? "bg-blue-500" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>

                {/* Timeline content */}
                <div className="flex-1 pb-6">
                  <p
                    className={`font-semibold ${
                      isActive ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {status.label}
                  </p>
                  <p className="text-sm text-slate-500">
                    {status.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
