export type Role =
  | "all"
  | "admin"
  | "doctor"
  | "nurse"
  | "pharmacist"
  | "lab_tech"
  | "patient";
// src/types/index.ts

// --- 1. PATIENT STATUSES ---
// Clinical states for patients
export type PatientStatus =
  | "admitted"
  | "in_treatment"
  | "observation"
  | "discharged"
  | "follow_up"
  | "deceased"; // Optional, but common in HMS

// --- 2. STAFF STATUSES ---
// Employment/Availability states for Doctors, Nurses, etc.
export type StaffStatus = "active" | "on_leave" | "suspended" | "resigned";

// --- 3. COMBINED USER STATUS ---
// The actual type used in the generic User interface
export type UserStatus = PatientStatus | StaffStatus;

export interface LabResult {
  id: number;
  patient_id: number;
  test_type: string;
  body_part: string;
  image_url: string;
  ai_analysis?: string;
  status: "pending" | "analyzed" | "reviewed";
  doctor_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  status: UserStatus;
  banned: boolean;
  specialization?: string;
  gender?: string;
  blood_group?: string;
  medical_history?: string;
  age?: string;
  department?: string;
  license_number?: string;
  assigned_doctor_id?: number | null;
  assigned_nurse_id?: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "system" | "assignment" | "lab_result" | "alert";
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface WebPushSubscription {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface ActivityLog {
  _id: string;
  user: User; // Who did it?
  action: string; // "Created Exam", "Registered Student"
  details?: string;
  createdAt: Date;
}

export interface invoice {
  _id: string;
  user: User;
  polarCheckoutId?: string; // Links to Polar transaction
  status: "draft" | "pending_payment" | "paid";
  items: Array<{
    description: string; // e.g., "Chest X-Ray"
    quantity: number;
    unitPrice: number; // in cents (Polar uses cents)
    totalPrice: number;
  }>;
  totalAmount: number; // Sum of all items in cents
  createdAt: Date;
}

export interface appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  nurse_id?: number;
  title: string;
  description?: string;
  appointment_type: "in_person" | "telehealth" | "follow_up" | "emergency";
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
  scheduled_at: string;
  duration_minutes: number;
  location?: string;
  meeting_link?: string;
  notes?: string;
  patient_notes?: string;
  cancellation_reason?: string;
  reminder_sent: string;
  created_at?: string;
  updated_at?: string;
}

// --- PRESCRIPTION TYPES ---
export type PrescriptionStatus = 
  | "active" 
  | "dispensed" 
  | "completed" 
  | "cancelled" 
  | "expired";

export interface Prescription {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  quantity: number;
  quantity_dispensed: number;
  instructions?: string;
  warnings?: string;
  refills_allowed: number;
  refills_used: number;
  status: PrescriptionStatus;
  issued_date: string;
  expiry_date?: string;
  dispensed_date?: string;
  dispensed_by_id?: number;
  cancelled_date?: string;
  cancellation_reason?: string;
  cancelled_by_id?: number;
  created_at: string;
  updated_at: string;
}
