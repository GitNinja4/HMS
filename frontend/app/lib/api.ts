import type {
  PaginatedResponse,
  Role,
  User,
  LabResult,
  WebPushSubscription,
  ActivityLog,
  invoice,
  appointment,
} from "@/types";
import { authClient } from "@/lib/auth-client";

export const API_URL = "http://localhost:5000/api";

// Helper to get authentication headers
const getAuthHeaders = (): Record<string, string> => {
  const token = authClient.getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// Global error handler for consistent error parsing
const handleApiError = async (response: Response): Promise<never> => {
  try {
    const error = await response.json();
    throw new Error(error.detail || error.message || `HTTP ${response.status}`);
  } catch (e) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
};

export const getUsers = async (params: {
  role?: Role;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<User>> => {
  const skip = ((params.page || 1) - 1) * (params.limit || 10);
  const query = new URLSearchParams({
    skip: skip.toString(),
    limit: (params.limit || 10).toString(),
  });
  if (params.role) query.append("role", params.role);

  const res = await fetch(`${API_URL}/users?${query.toString()}`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!res.ok) await handleApiError(res);

  return res.json();
};

export const getDoctorPatients = async (params: {
  doctorId: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<User>> => {
  const skip = ((params.page || 1) - 1) * (params.limit || 10);
  const query = new URLSearchParams({
    skip: skip.toString(),
    limit: (params.limit || 10).toString(),
  });

  const res = await fetch(`${API_URL}/users/doctor/${params.doctorId}/patients?${query.toString()}`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!res.ok) await handleApiError(res);

  return res.json();
};

export const getNursePatients = async (params: {
  nurseId: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<User>> => {
  const skip = ((params.page || 1) - 1) * (params.limit || 10);
  const query = new URLSearchParams({
    skip: skip.toString(),
    limit: (params.limit || 10).toString(),
  });

  const res = await fetch(`${API_URL}/users/nurse/${params.nurseId}/patients?${query.toString()}`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!res.ok) await handleApiError(res);

  return res.json();
};

export const triggerAdmission = async ({
  patientId,
  admissionReason,
}: {
  patientId: string;
  admissionReason: string;
}) => {
  // /:id/admit
  const res = await fetch(`${API_URL}/users/${patientId}/admit`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ admissionReason }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to start admission process");
  return res.json();
};

interface UpdateUserParams {
  userId: string;
  userData: Partial<User> & Record<string, any>; // Allow custom fields
}

export const updateUser = async ({ userId, userData }: UpdateUserParams) => {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
    credentials: "include",
  });

  if (!res.ok) await handleApiError(res);

  return res.json();
};

export const createActityLog = async (data: {
  userId: string;
  action: string;
  details?: string;
}) => {
  const res = await fetch(`${API_URL}/activity-logs/create`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
    credentials: "include", // Important for Better Auth cookies
  });
  if (!res.ok) throw new Error("Failed to create activity log");
  return res.json();
};

export const getPatientLabResults = async (
  patientId: string,
): Promise<LabResult[]> => {
  const res = await fetch(`${API_URL}/lab-results/patient/${patientId}`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch lab results");
  return res.json();
};

export const updateLabResult = async ({
  id,
  data,
}: {
  id: string;
  data: { doctorNotes?: string; status?: string };
}) => {
  const res = await fetch(`${API_URL}/lab-results/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to update lab result");
  return res.json();
};

export const createLabResult = async (data: {
  patientId: string;
  testType: string;
  bodyPart: string;
  imageUrl: string;
  aiAnalysis?: string;
}) => {
  const res = await fetch(`${API_URL}/lab-results`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
    credentials: "include", // Important for Better Auth cookies
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create lab result");
  }

  return res.json();
};

export const deleteFile = async ({ file }: { file: string }) => {
  const res = await fetch(`${API_URL}/uploadthing/delete`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({ fileUrl: file }),
    credentials: "include", // Important for Better Auth cookies
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete file");
  }

  return res.json();
};

export const getActivityLogs = async (params: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<ActivityLog>> => {
  const query = new URLSearchParams({
    page: (params.page || 1).toString(),
    limit: (params.limit || 10).toString(),
  }).toString();

  const res = await fetch(`${API_URL}/activity-logs?${query}`, {
    headers: getAuthHeaders(),
    credentials: "include", // Important for Better Auth cookies
  });

  if (!res.ok) throw new Error("Failed to fetch activity logs");

  return res.json();
};

export const getUserById = async (userId: string) => {
  const res = await fetch(`${API_URL}/users/profile/${userId}`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
};

export const getMyActiveInvoice = async () => {
  const res = await fetch(`${API_URL}/invoices/my-active-invoice`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) {
    if (res.status === 404) return null; // No active invoice
    throw new Error("Failed to fetch invoice");
  }
  return res.json();
};

export const createCheckoutSession = async (invoiceId: string) => {
  const res = await fetch(`${API_URL}/invoices/${invoiceId}/checkout`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to initiate checkout");
  return res.json();
};

export const getBillingHistory = async (userId: string) => {
  const res = await fetch(`${API_URL}/invoices/history/${userId}`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch billing history");
  return res.json();
};

export const getAllInvoices = async (data?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<invoice>> => {
  const res = await fetch(`${API_URL}/invoices`, {
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch invoices");
  return res.json();
};

export const polarPortalLink = async (userId: string) => {
  const res = await fetch(`${API_URL}/users/polar-portal/${userId}`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch polar portal link");
  return res.json();
};

export const fetchNotifications = async () => {
  const res = await fetch(`${API_URL}/notifications`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json(); // Expected response: { notifications:[], unreadCount: 0 }
};

export const markAsRead = async (id: string) => {
  const res = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to mark as read");
  return res.json();
};

// ==================== APPOINTMENTS ====================

export const getAppointments = async (params: {
  patientId?: string;
  doctorId?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<appointment>> => {
  const skip = ((params.page || 1) - 1) * (params.limit || 10);
  const query = new URLSearchParams({
    skip: skip.toString(),
    limit: (params.limit || 10).toString(),
  });
  if (params.patientId) query.append("patient_id", params.patientId);
  if (params.doctorId) query.append("doctor_id", params.doctorId);
  if (params.status) query.append("status", params.status);

  const res = await fetch(`${API_URL}/appointments?${query.toString()}`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const getPatientAppointments = async (params: {
  patientId: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<appointment>> => {
  return getAppointments({
    patientId: params.patientId,
    status: params.status,
    page: params.page,
    limit: params.limit,
  });
};

export const createAppointment = async (data: {
  patientId: number;
  doctorId: number;
  title: string;
  description?: string;
  appointmentType?: "in_person" | "telehealth" | "follow_up" | "emergency";
  scheduledAt: string;
  durationMinutes?: number;
  location?: string;
  meetingLink?: string;
  patientNotes?: string;
}): Promise<appointment> => {
  const res = await fetch(`${API_URL}/appointments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const updateAppointment = async (
  appointmentId: string,
  data: Partial<{
    title: string;
    description: string;
    scheduledAt: string;
    durationMinutes: number;
    location: string;
    meetingLink: string;
    status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
    notes: string;
  }>
): Promise<appointment> => {
  const res = await fetch(`${API_URL}/appointments/${appointmentId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const cancelAppointment = async (
  appointmentId: string,
  cancellationReason?: string
): Promise<appointment> => {
  const res = await fetch(`${API_URL}/appointments/${appointmentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({ cancellationReason }),
    credentials: "include",
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
};

// ==================== APPOINTMENT WORKFLOW ====================

export const acceptAppointment = async (
  appointmentId: string,
  notes?: string
): Promise<appointment> => {
  const res = await fetch(`${API_URL}/appointments/${appointmentId}/accept`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: notes ? JSON.stringify({ notes }) : undefined,
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const rejectAppointment = async (
  appointmentId: string,
  reason?: string
): Promise<appointment> => {
  const res = await fetch(`${API_URL}/appointments/${appointmentId}/reject`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: reason ? JSON.stringify({ reason }) : undefined,
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const rescheduleAppointment = async (
  appointmentId: string,
  newScheduledAt: string,
  reason?: string
): Promise<appointment> => {
  const params = new URLSearchParams({
    new_scheduled_at: newScheduledAt,
  });
  if (reason) params.append("reason", reason);

  const res = await fetch(
    `${API_URL}/appointments/${appointmentId}/reschedule?${params.toString()}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
    }
  );

  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const assignNurseToAppointment = async (
  appointmentId: string,
  nurseId: number
): Promise<appointment> => {
  const params = new URLSearchParams({
    nurse_id: nurseId.toString(),
  });

  const res = await fetch(
    `${API_URL}/appointments/${appointmentId}/assign-nurse?${params.toString()}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
    }
  );

  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const getNurseAppointments = async (params: {
  nurseId: number;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<appointment>> => {
  const skip = ((params.page || 1) - 1) * (params.limit || 10);
  const query = new URLSearchParams({
    skip: skip.toString(),
    limit: (params.limit || 10).toString(),
  });

  const res = await fetch(
    `${API_URL}/appointments/nurse/${params.nurseId}/assignments?${query.toString()}`,
    {
      headers: getAuthHeaders(),
      credentials: "include",
    }
  );

  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const markAppointmentCompleted = async (
  appointmentId: string
): Promise<appointment> => {
  const res = await fetch(
    `${API_URL}/appointments/${appointmentId}/mark-completed`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
    }
  );

  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const getDoctorAvailability = async (
  doctorId: number,
  date: string
): Promise<{ doctor_id: number; date: string; available_slots: string[] }> => {
  const params = new URLSearchParams({
    date,
  });

  const res = await fetch(
    `${API_URL}/appointments/doctor/${doctorId}/availability?${params.toString()}`,
    {
      headers: getAuthHeaders(),
      credentials: "include",
    }
  );

  if (!res.ok) await handleApiError(res);
  return res.json();
};

// ==================== PRESCRIPTIONS ====================

export const getPrescriptions = async (params: {
  patientId?: string;
  doctorId?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<any>> => {
  const skip = ((params.page || 1) - 1) * (params.limit || 10);
  const query = new URLSearchParams({
    skip: skip.toString(),
    limit: (params.limit || 10).toString(),
  });
  if (params.patientId) query.append("patient_id", params.patientId);
  if (params.doctorId) query.append("doctor_id", params.doctorId);
  if (params.status) query.append("status_filter", params.status);

  const res = await fetch(`${API_URL}/prescriptions?${query.toString()}`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const getPatientPrescriptions = async (params: {
  patientId: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<any>> => {
  return getPrescriptions({
    patientId: params.patientId,
    status: params.status,
    page: params.page,
    limit: params.limit,
  });
};

export const createPrescription = async (data: {
  patientId: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  route?: string;
  quantity: number;
  instructions?: string;
  warnings?: string;
  refillsAllowed?: number;
  expiryDate?: string;
  appointmentId?: number;
}): Promise<any> => {
  const res = await fetch(`${API_URL}/prescriptions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const updatePrescription = async (
  prescriptionId: string,
  data: Partial<any>
): Promise<any> => {
  const res = await fetch(`${API_URL}/prescriptions/${prescriptionId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const dispensePrescription = async (
  prescriptionId: string,
  quantityDispensed: number
): Promise<any> => {
  const res = await fetch(`${API_URL}/prescriptions/${prescriptionId}/dispense`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ quantityDispensed }),
    credentials: "include",
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const requestPrescriptionRefill = async (
  prescriptionId: string
): Promise<any> => {
  const res = await fetch(`${API_URL}/prescriptions/${prescriptionId}/refill-request`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
};

// ==================== VITAL SIGNS ====================

export const getPatientVitalSigns = async (params: {
  patientId: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<any>> => {
  const skip = ((params.page || 1) - 1) * (params.limit || 10);
  const query = new URLSearchParams({
    skip: skip.toString(),
    limit: (params.limit || 10).toString(),
  });

  const res = await fetch(`${API_URL}/users/${params.patientId}/vital-signs?${query.toString()}`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const createVitalSigns = async (data: {
  patientId: number;
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  notes?: string;
}): Promise<any> => {
  const res = await fetch(`${API_URL}/vital-signs`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
};

// ==================== PATIENT HEALTH PROFILE ====================

export const getPatientHealthProfile = async (patientId: string): Promise<any> => {
  const res = await fetch(`${API_URL}/users/${patientId}/health-profile`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const updatePatientHealthProfile = async (
  patientId: string,
  data: Partial<any>
): Promise<any> => {
  const res = await fetch(`${API_URL}/users/${patientId}/health-profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const getPatientMedicalConditions = async (patientId: string): Promise<any[]> => {
  const res = await fetch(`${API_URL}/users/${patientId}/medical-conditions`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const getPatientAllergies = async (patientId: string): Promise<any[]> => {
  const res = await fetch(`${API_URL}/users/${patientId}/allergies`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
};

export const getPatientMedicalHistory = async (patientId: string): Promise<any[]> => {
  const res = await fetch(`${API_URL}/users/${patientId}/medical-history`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!res.ok) await handleApiError(res);
  return res.json();
};
