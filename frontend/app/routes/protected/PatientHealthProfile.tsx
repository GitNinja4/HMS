import { useQuery } from "@tanstack/react-query";
import { Heart, AlertCircle, Edit2, TrendingDown, TrendingUp } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import * as api from "@/lib/api";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loader from "@/components/global/Loader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function meta() {
  return [{ title: "My Health Profile" }];
}

export default function PatientHealthProfile() {
  const { data: session, isPending: isAuthLoading } = authClient.useSession();
  const user = session?.user;

  // Fetch health profile
  const { data: healthProfile, isLoading: healthProfileLoading } = useQuery({
    queryKey: ["health-profile", user?.id],
    queryFn: () => api.getPatientHealthProfile(user?.id || ""),
    enabled: !!user?.id,
  });

  // Fetch latest vital signs
  const { data: vitalsData } = useQuery({
    queryKey: ["vitals", user?.id],
    queryFn: () =>
      api.getPatientVitalSigns({
        patientId: user?.id || "",
        limit: 1,
      }),
    enabled: !!user?.id,
  });

  if (isAuthLoading || healthProfileLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader label="Loading health profile..." />
      </div>
    );
  }

  const profile = healthProfile || {};
  const latestVitals = vitalsData?.data?.[0];

  // Calculate BMI if weight and height available
  const calculateBMI = () => {
    if (latestVitals?.weight && latestVitals?.height) {
      const heightInMeters = latestVitals.height / 100;
      return (latestVitals.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  const bmi = calculateBMI();

  // Get BMI category
  const getBMICategory = () => {
    if (!bmi) return null;
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return { label: "Underweight", color: "bg-blue-100 text-blue-800" };
    if (bmiValue < 25) return { label: "Normal", color: "bg-green-100 text-green-800" };
    if (bmiValue < 30) return { label: "Overweight", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Obese", color: "bg-red-100 text-red-800" };
  };

  const bmiCategory = getBMICategory();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="My Health Profile"
        description="Manage your medical information and health conditions"
        icon={Heart}
      />

      {/* Basic Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Blood Group</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{profile.blood_group || "-"}</p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Height</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{latestVitals?.height || "-"} <span className="text-sm text-slate-500">cm</span></p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{latestVitals?.weight || "-"} <span className="text-sm text-slate-500">kg</span></p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">BMI</CardTitle>
          </CardHeader>
          <CardContent>
            {bmi ? (
              <div>
                <p className="text-2xl font-bold">{bmi}</p>
                {bmiCategory && (
                  <Badge className={`mt-2 ${bmiCategory.color}`}>
                    {bmiCategory.label}
                  </Badge>
                )}
              </div>
            ) : (
              <p className="text-2xl font-bold">-</p>
            )}
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Age</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{profile.age || "-"} <span className="text-sm text-slate-500">years</span></p>
          </CardContent>
        </Card>
      </div>

      {/* Latest Vital Signs */}
      {latestVitals && (
        <Card className="card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Latest Vital Signs
            </CardTitle>
            <span className="text-xs text-slate-500">
              Recorded: {new Date(latestVitals.recorded_at).toLocaleDateString()}
            </span>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {latestVitals.blood_pressure_systolic && (
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Blood Pressure</p>
                  <p className="text-lg font-semibold">
                    {latestVitals.blood_pressure_systolic}/{latestVitals.blood_pressure_diastolic} mmHg
                  </p>
                </div>
              )}
              {latestVitals.heart_rate && (
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Heart Rate</p>
                  <p className="text-lg font-semibold">{latestVitals.heart_rate} BPM</p>
                </div>
              )}
              {latestVitals.temperature && (
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Temperature</p>
                  <p className="text-lg font-semibold">{latestVitals.temperature}°C</p>
                </div>
              )}
              {latestVitals.oxygen_saturation && (
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded">
                  <p className="text-sm text-slate-500 dark:text-slate-400">O₂ Saturation</p>
                  <p className="text-lg font-semibold">{latestVitals.oxygen_saturation}%</p>
                </div>
              )}
              {latestVitals.respiratory_rate && (
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Respiratory Rate</p>
                  <p className="text-lg font-semibold">{latestVitals.respiratory_rate}/min</p>
                </div>
              )}
            </div>
            {latestVitals.notes && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Notes:</strong> {latestVitals.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Medical Conditions */}
      <Card className="card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Medical Conditions</CardTitle>
          <Button size="sm" variant="ghost" className="gap-2">
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          {profile.medical_history ? (
            <div className="space-y-2">
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {profile.medical_history}
              </p>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No medical conditions recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Personal Information</CardTitle>
          <Button size="sm" variant="ghost" className="gap-2">
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
              <p className="font-semibold">{profile.name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Gender</p>
              <p className="font-semibold capitalize">{profile.gender || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
              <Badge className="capitalize">
                {profile.status || "active"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Healthcare Providers */}
      <Card className="card">
        <CardHeader>
          <CardTitle>Healthcare Team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.assigned_doctor_id ? (
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Assigned Doctor</p>
                <p className="font-semibold">Doctor ID: {profile.assigned_doctor_id}</p>
              </div>
              <Button size="sm" variant="outline">Contact</Button>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No doctor assigned</p>
          )}

          {profile.assigned_nurse_id && (
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Assigned Nurse</p>
                <p className="font-semibold">Nurse ID: {profile.assigned_nurse_id}</p>
              </div>
              <Button size="sm" variant="outline">Contact</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
