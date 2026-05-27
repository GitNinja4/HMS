import type { Route } from "../../+types/root";
import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity,
  Heart,
  Droplets,
  Thermometer,
  Wind,
  Plus,
  Edit,
  Eye,
  Check,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Nursing Station" }];
}

// Mock data
const mockPatients = [
  {
    id: "PAT-001",
    name: "Sarah Johnson",
    roomNumber: "101",
    bedNumber: "A",
    admissionDate: "2026-05-20",
    diagnosis: "Pneumonia",
    status: "stable",
    assignedNurse: "Nurse Emma",
  },
  {
    id: "PAT-002",
    name: "John Doe",
    roomNumber: "102",
    bedNumber: "B",
    admissionDate: "2026-05-22",
    diagnosis: "Post-op Recovery",
    status: "critical",
    assignedNurse: "Nurse Mark",
  },
  {
    id: "PAT-003",
    name: "Mary Brown",
    roomNumber: "103",
    bedNumber: "A",
    admissionDate: "2026-05-18",
    diagnosis: "Hypertension",
    status: "stable",
    assignedNurse: "Nurse Emma",
  },
];

const mockVitalSigns = {
  "PAT-001": [
    { time: "08:00", bp: "120/80", pulse: 72, temp: 98.6, respRate: 16, o2Sat: 98 },
    { time: "12:00", bp: "118/78", pulse: 70, temp: 98.5, respRate: 16, o2Sat: 98 },
    { time: "16:00", bp: "122/82", pulse: 74, temp: 98.7, respRate: 16, o2Sat: 97 },
  ],
  "PAT-002": [
    { time: "08:30", bp: "140/90", pulse: 88, temp: 99.2, respRate: 20, o2Sat: 95 },
    { time: "12:30", bp: "138/88", pulse: 86, temp: 99.1, respRate: 20, o2Sat: 95 },
    { time: "16:30", bp: "142/92", pulse: 90, temp: 99.3, respRate: 22, o2Sat: 94 },
  ],
  "PAT-003": [
    { time: "07:30", bp: "130/85", pulse: 68, temp: 98.6, respRate: 16, o2Sat: 99 },
    { time: "13:30", bp: "128/83", pulse: 66, temp: 98.5, respRate: 16, o2Sat: 99 },
  ],
};

export default function NursingStation() {
  const [searchPatients, setSearchPatients] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [selectedPatient, setSelectedPatient] = useState<(typeof mockPatients)[0] | null>(null);
  const [vitalSignsDialog, setVitalSignsDialog] = useState(false);
  const [careNotesDialog, setCareNotesDialog] = useState(false);
  const [newVitalSigns, setNewVitalSigns] = useState({
    bp: "",
    pulse: "",
    temp: "",
    respRate: "",
    o2Sat: "",
  });
  const [careNotes, setCareNotes] = useState("");
  const [patients, setPatients] = useState(mockPatients);
  const [vitals, setVitals] = useState(mockVitalSigns as Record<string, any[]>);

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchPatients.toLowerCase()) ||
        p.roomNumber.includes(searchPatients);
      const matchesStatus = !statusFilter || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchPatients, statusFilter, patients]);

  const handleAddVitalSigns = () => {
    if (selectedPatient && newVitalSigns.bp) {
      const patientVitals = vitals[selectedPatient.id] || [];
      setVitals({
        ...vitals,
        [selectedPatient.id]: [
          ...patientVitals,
          {
            time: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            ...newVitalSigns,
          },
        ],
      });
      setNewVitalSigns({
        bp: "",
        pulse: "",
        temp: "",
        respRate: "",
        o2Sat: "",
      });
      setVitalSignsDialog(false);
    }
  };

  const handleAddCareNotes = () => {
    if (selectedPatient && careNotes) {
      // In a real app, this would be saved to database
      setCareNotes("");
      setCareNotesDialog(false);
    }
  };

  const criticalPatients = patients.filter((p) => p.status === "critical").length;
  const stablePatients = patients.filter((p) => p.status === "stable").length;
  const assignedToUser = patients.filter((p) => p.assignedNurse === "Nurse Emma").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "destructive";
      case "stable":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical":
        return <AlertCircle className="h-3 w-3 mr-1" />;
      case "stable":
        return <Check className="h-3 w-3 mr-1" />;
      default:
        return <Clock className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nursing Station</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Monitor patients, record vital signs, and manage care
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{patients.length}</p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{criticalPatients}</p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stablePatients}</p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assigned to Me</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{assignedToUser}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="patients" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          <TabsTrigger value="care">Care Plans</TabsTrigger>
        </TabsList>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-4">
          <Card className="card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Admitted Patients</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Admission
                </Button>
              </div>
              <div className="mt-4 relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Search by patient name or room number..."
                      value={searchPatients}
                      onChange={(e) => setSearchPatients(e.target.value)}
                      className="pl-3"
                    />
                  </div>
                  <select
                    value={statusFilter || ""}
                    onChange={(e) => setStatusFilter(e.target.value || undefined)}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="critical">Critical</option>
                    <option value="stable">Stable</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Room/Bed</TableHead>
                      <TableHead>Diagnosis</TableHead>
                      <TableHead>Admitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned Nurse</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow
                        key={patient.id}
                        className={
                          patient.status === "critical" ? "bg-red-50 dark:bg-red-950/20" : ""
                        }
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-xs text-slate-500">{patient.id}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {patient.roomNumber}/{patient.bedNumber}
                        </TableCell>
                        <TableCell className="text-sm">{patient.diagnosis}</TableCell>
                        <TableCell className="text-sm">{patient.admissionDate}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(patient.status)}>
                            {getStatusIcon(patient.status)}
                            {patient.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{patient.assignedNurse}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPatient(patient);
                                setVitalSignsDialog(true);
                              }}
                            >
                              <Activity className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPatient(patient);
                                setCareNotesDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vital Signs Tab */}
        <TabsContent value="vitals" className="space-y-4">
          <Card className="card">
            <CardHeader>
              <CardTitle>Patient Vital Signs Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {filteredPatients.map((patient) => {
                const patientVitals = vitals[patient.id] || [];
                const latestVital = patientVitals[patientVitals.length - 1];

                return (
                  <div
                    key={patient.id}
                    className="p-4 border rounded-lg space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{patient.name}</p>
                        <p className="text-sm text-slate-500">
                          Room {patient.roomNumber}, Bed {patient.bedNumber}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setVitalSignsDialog(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Record Vitals
                      </Button>
                    </div>

                    {latestVital ? (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span className="text-xs text-slate-500">BP</span>
                          </div>
                          <p className="font-bold mt-1">{latestVital.bp}</p>
                          <p className="text-xs text-slate-400 mt-1">{latestVital.time}</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-blue-500" />
                            <span className="text-xs text-slate-500">Pulse</span>
                          </div>
                          <p className="font-bold mt-1">{latestVital.pulse} bpm</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Thermometer className="h-4 w-4 text-orange-500" />
                            <span className="text-xs text-slate-500">Temp</span>
                          </div>
                          <p className="font-bold mt-1">{latestVital.temp}°F</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Wind className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-slate-500">RR</span>
                          </div>
                          <p className="font-bold mt-1">{latestVital.respRate}</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-purple-500" />
                            <span className="text-xs text-slate-500">O2</span>
                          </div>
                          <p className="font-bold mt-1">{latestVital.o2Sat}%</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No vital signs recorded</p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Care Plans Tab */}
        <TabsContent value="care" className="space-y-4">
          <Card className="card">
            <CardHeader>
              <CardTitle>Care Plans & Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPatients.map((patient) => (
                  <div key={patient.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold">{patient.name}</p>
                        <p className="text-sm text-slate-500">
                          Diagnosis: {patient.diagnosis}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setCareNotesDialog(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                    <div className="text-sm text-slate-600 bg-slate-50 dark:bg-slate-900 p-3 rounded">
                      <p>No care notes recorded yet.</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Vital Signs Dialog */}
      <Dialog open={vitalSignsDialog} onOpenChange={setVitalSignsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Vital Signs</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                <p className="text-sm text-slate-500">Patient</p>
                <p className="font-medium">{selectedPatient.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Blood Pressure (e.g., 120/80)</label>
                <Input
                  placeholder="120/80"
                  value={newVitalSigns.bp}
                  onChange={(e) =>
                    setNewVitalSigns({ ...newVitalSigns, bp: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Pulse (bpm)</label>
                  <Input
                    type="number"
                    placeholder="72"
                    value={newVitalSigns.pulse}
                    onChange={(e) =>
                      setNewVitalSigns({ ...newVitalSigns, pulse: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Temperature (°F)</label>
                  <Input
                    type="number"
                    placeholder="98.6"
                    value={newVitalSigns.temp}
                    onChange={(e) =>
                      setNewVitalSigns({ ...newVitalSigns, temp: e.target.value })
                    }
                    className="mt-1"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Respiratory Rate</label>
                  <Input
                    type="number"
                    placeholder="16"
                    value={newVitalSigns.respRate}
                    onChange={(e) =>
                      setNewVitalSigns({ ...newVitalSigns, respRate: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">O2 Saturation (%)</label>
                  <Input
                    type="number"
                    placeholder="98"
                    value={newVitalSigns.o2Sat}
                    onChange={(e) =>
                      setNewVitalSigns({ ...newVitalSigns, o2Sat: e.target.value })
                    }
                    className="mt-1"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setVitalSignsDialog(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAddVitalSigns}>
                  <Check className="h-4 w-4 mr-2" />
                  Save Vital Signs
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Care Notes Dialog */}
      <Dialog open={careNotesDialog} onOpenChange={setCareNotesDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Care Note</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                <p className="text-sm text-slate-500">Patient</p>
                <p className="font-medium">{selectedPatient.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Care Notes</label>
                <Textarea
                  placeholder="Record observations, care provided, patient response, etc."
                  value={careNotes}
                  onChange={(e) => setCareNotes(e.target.value)}
                  className="mt-1 min-h-32"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCareNotesDialog(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAddCareNotes}>
                  <Check className="h-4 w-4 mr-2" />
                  Save Note
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
