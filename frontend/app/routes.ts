import {
  type RouteConfig,
  index,
  layout,
  route,
  path,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/Login.tsx"),
  route("signup", "routes/Signup.tsx"),
  // you can use index or layout for nested routes
  layout("routes/protected/layout.tsx", [
    route("dashboard", "routes/protected/Dashboard.tsx"),
    route("admins", "routes/protected/Admins.tsx"),
    route("doctors", "routes/protected/Doctors.tsx"),
    route("nurses", "routes/protected/Nurses.tsx"),
    route("patients", "routes/protected/Patients.tsx"),
    route("activities-log", "routes/protected/ActivitiesLog.tsx"),
    route("profile/:id", "routes/protected/Profile.tsx"),
    route("financial-history", "routes/protected/FinancialHistory.tsx"),
    // Patient Portal Routes
    route("patient-dashboard", "routes/protected/PatientDashboard.tsx"),
    route("patient/appointments", "routes/protected/PatientAppointments.tsx"),
    route("patient/medical-records", "routes/protected/PatientMedicalRecords.tsx"),
    route("patient/prescriptions", "routes/protected/PatientPrescriptions.tsx"),
    route("patient/health-profile", "routes/protected/PatientHealthProfile.tsx"),
    // NEW ROUTES - Fully Implemented
    route("pharmacy", "routes/protected/Pharmacy.tsx"),
    route("laboratory", "routes/protected/Laboratory.tsx"),
    route("prescriptions", "routes/protected/Prescriptions.tsx"),
    route("nursing-station", "routes/protected/NursingStation.tsx"),
    route("appointments", "routes/protected/Appointments.tsx"),
    route("settings", "routes/protected/Settings.tsx"),
    route("telemedicine", "routes/protected/Telemedicine.tsx"),
  ]),
  // Catch-all route for 404s
  route("*", "routes/errors/not-found.tsx"),
] satisfies RouteConfig;
