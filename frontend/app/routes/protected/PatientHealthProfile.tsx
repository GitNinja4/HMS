import { Heart, AlertCircle, Edit2, Save, X } from "lucide-react";
import { useState, useMemo } from "react";
import { authClient } from "@/lib/auth-client";
import { getMedicalHistoryByPatientId, getPatientById } from "@/lib/mockData";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/global/Loader";
import { toast } from "sonner";

export function meta() {
  return [{ title: "My Health Profile" }];
}

export default function PatientHealthProfile() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get patient-specific medical history
  const medicalHistory = useMemo(
    () => getMedicalHistoryByPatientId(user?.id || ""),
    [user?.id]
  );

  // Get patient details
  const patientDetails = useMemo(
    () => getPatientById(user?.id || ""),
    [user?.id]
  );

  // Build mock health data from patient details and medical history
  const mockHealthData = useMemo(
    () => ({
      bloodGroup: patientDetails?.bloodgroup || "N/A",
      height: "5'10\"",
      weight: "75 kg",
      bmi: "24.5",
      conditions: medicalHistory
        .filter((h) => h.type === "condition")
        .map((h) => h.title),
      allergies: medicalHistory
        .filter((h) => h.type === "allergy")
        .map((h) => ({
          name: h.title,
          severity: (h.severity || "mild") as "mild" | "moderate" | "severe",
          reaction: h.description,
        })),
      surgeries: medicalHistory
        .filter((h) => h.type === "surgery")
        .map((h) => ({
          name: h.title,
          date: h.date,
          hospital: h.description,
        })),
      medications: medicalHistory
        .filter((h) => h.type === "medication")
        .map((h) => h.title),
      emergencyContact: {
        name: "Not Set",
        relationship: "",
        phone: "",
      },
    }),
    [medicalHistory, patientDetails]
  );

  const [formData, setFormData] = useState({
    height: mockHealthData.height,
    weight: mockHealthData.weight,
  });

  if (isPending) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader label="Loading health profile..." />
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Health profile updated!");
      setIsEditingProfile(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const getSeverityColor = (
    severity: string
  ): "default" | "destructive" | "secondary" => {
    if (severity === "severe") return "destructive";
    if (severity === "moderate") return "secondary";
    return "default";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionHeader
          title="My Health Profile"
          description="Manage your medical information and health records"
          icon={Heart}
        />
        {!isEditingProfile && (
          <Button
            onClick={() => setIsEditingProfile(true)}
            variant="outline"
            className="gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                Name
              </p>
              <p className="font-semibold">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                Email
              </p>
              <p className="font-semibold">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                Blood Group
              </p>
              <Badge>{mockHealthData.bloodGroup}</Badge>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                BMI
              </p>
              <p className="font-semibold">{mockHealthData.bmi}</p>
            </div>
          </div>

          {isEditingProfile && (
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Height
                </label>
                <input
                  type="text"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({ ...formData, height: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Weight (kg)
                </label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allergies - High Priority */}
      <Card className="border-2 border-red-200 dark:border-red-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <CardTitle>Known Allergies</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockHealthData.allergies.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">No allergies recorded</p>
          ) : (
            mockHealthData.allergies.map((allergy, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-100 dark:border-red-900/50"
              >
                <div>
                  <p className="font-semibold">{allergy.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Reaction: {allergy.reaction}
                  </p>
                </div>
                <Badge variant={getSeverityColor(allergy.severity)}>
                  {allergy.severity}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Medical Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {mockHealthData.conditions.map((condition, idx) => (
              <Badge key={idx} variant="secondary" className="text-sm">
                {condition}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Medications */}
      <Card>
        <CardHeader>
          <CardTitle>Current Medications</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {mockHealthData.medications.map((med, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-600 rounded-full" />
                {med}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Surgical History */}
      <Card>
        <CardHeader>
          <CardTitle>Surgical History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockHealthData.surgeries.map((surgery, idx) => (
            <div
              key={idx}
              className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <p className="font-semibold">{surgery.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {new Date(surgery.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {surgery.hospital}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-semibold">Name: </span>
              {mockHealthData.emergencyContact.name}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Relationship: </span>
              {mockHealthData.emergencyContact.relationship}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Phone: </span>
              {mockHealthData.emergencyContact.phone}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Edit Actions */}
      {isEditingProfile && (
        <div className="flex gap-2 sticky bottom-4">
          <Button
            variant="outline"
            onClick={() => setIsEditingProfile(false)}
            className="flex-1 gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}
