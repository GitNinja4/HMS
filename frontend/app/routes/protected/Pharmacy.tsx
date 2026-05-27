import type { Route } from "../../+types/root";
import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pill,
  Search,
  Check,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  TrendingDown,
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
  return [{ title: "Pharmacy Management" }];
}

// Mock data
const mockPrescriptions = [
  {
    id: "RX-001",
    patientName: "Sarah Johnson",
    patientId: "PAT-001",
    medication: "Amoxicillin",
    dosage: "500mg",
    quantity: 20,
    frequency: "3 times daily",
    duration: "7 days",
    prescribedBy: "Dr. Smith",
    status: "pending",
    createdAt: "2026-05-28",
  },
  {
    id: "RX-002",
    patientName: "John Doe",
    patientId: "PAT-002",
    medication: "Lisinopril",
    dosage: "10mg",
    quantity: 30,
    frequency: "Once daily",
    duration: "30 days",
    prescribedBy: "Dr. Wilson",
    status: "pending",
    createdAt: "2026-05-28",
  },
  {
    id: "RX-003",
    patientName: "Mary Brown",
    patientId: "PAT-003",
    medication: "Metformin",
    dosage: "750mg",
    quantity: 60,
    frequency: "Twice daily",
    duration: "30 days",
    prescribedBy: "Dr. Smith",
    status: "dispensed",
    createdAt: "2026-05-27",
  },
];

const mockInventory = [
  {
    id: "MED-001",
    name: "Amoxicillin",
    strength: "500mg",
    form: "Capsule",
    batch: "BTC-2026-001",
    quantity: 450,
    minStock: 100,
    expiryDate: "2027-05-30",
    supplier: "Pharma Corp",
  },
  {
    id: "MED-002",
    name: "Lisinopril",
    strength: "10mg",
    form: "Tablet",
    batch: "BTC-2026-002",
    quantity: 200,
    minStock: 50,
    expiryDate: "2027-06-15",
    supplier: "Medico Ltd",
  },
  {
    id: "MED-003",
    name: "Metformin",
    strength: "750mg",
    form: "Tablet",
    batch: "BTC-2026-003",
    quantity: 80,
    minStock: 100,
    expiryDate: "2027-04-20",
    supplier: "Health Labs",
  },
  {
    id: "MED-004",
    name: "Atorvastatin",
    strength: "20mg",
    form: "Tablet",
    batch: "BTC-2026-004",
    quantity: 300,
    minStock: 100,
    expiryDate: "2027-08-10",
    supplier: "Pharma Corp",
  },
];

export default function Pharmacy() {
  const [searchPrescription, setSearchPrescription] = useState("");
  const [searchInventory, setSearchInventory] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState<(typeof mockPrescriptions)[0] | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<(typeof mockInventory)[0] | null>(null);
  const [dispenseDialog, setDispenseDialog] = useState(false);
  const [dispenseQty, setDispenseQty] = useState("");
  const [prescriptions, setPrescriptions] = useState(mockPrescriptions);

  // Filter prescriptions
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter(
      (p) =>
        p.patientName.toLowerCase().includes(searchPrescription.toLowerCase()) ||
        p.id.toLowerCase().includes(searchPrescription.toLowerCase())
    );
  }, [searchPrescription, prescriptions]);

  // Filter inventory
  const filteredInventory = useMemo(() => {
    return mockInventory.filter(
      (m) =>
        m.name.toLowerCase().includes(searchInventory.toLowerCase()) ||
        m.id.toLowerCase().includes(searchInventory.toLowerCase())
    );
  }, [searchInventory]);

  const handleDispense = (prescription: (typeof mockPrescriptions)[0]) => {
    setSelectedPrescription(prescription);
    setDispenseDialog(true);
    setDispenseQty(prescription.quantity.toString());
  };

  const confirmDispense = () => {
    if (selectedPrescription) {
      setPrescriptions(
        prescriptions.map((p) =>
          p.id === selectedPrescription.id ? { ...p, status: "dispensed" } : p
        )
      );
      setDispenseDialog(false);
      setSelectedPrescription(null);
      setDispenseQty("");
    }
  };

  const lowStockMeds = mockInventory.filter((m) => m.quantity < m.minStock);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pharmacy Management</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Manage prescriptions, medications, and inventory
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {prescriptions.filter((p) => p.status === "pending").length}
            </p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dispensed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {prescriptions.filter((p) => p.status === "dispensed").length}
            </p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockInventory.length}</p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{lowStockMeds.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="prescriptions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-4">
          <Card className="card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pending Prescriptions</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Prescription
                </Button>
              </div>
              <div className="mt-4 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by patient or RX ID..."
                  value={searchPrescription}
                  onChange={(e) => setSearchPrescription(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>RX ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Prescribed By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrescriptions.map((rx) => (
                      <TableRow key={rx.id}>
                        <TableCell className="font-mono text-sm">{rx.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{rx.patientName}</p>
                            <p className="text-xs text-slate-500">{rx.patientId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{rx.medication}</TableCell>
                        <TableCell>{rx.dosage}</TableCell>
                        <TableCell>{rx.quantity}</TableCell>
                        <TableCell className="text-sm">{rx.prescribedBy}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              rx.status === "pending"
                                ? "outline"
                                : "secondary"
                            }
                          >
                            {rx.status === "pending" ? (
                              <Clock className="h-3 w-3 mr-1" />
                            ) : (
                              <Check className="h-3 w-3 mr-1" />
                            )}
                            {rx.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {rx.status === "pending" && (
                              <Button
                                size="sm"
                                onClick={() => handleDispense(rx)}
                              >
                                Dispense
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
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

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card className="card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Medication Inventory</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </div>
              <div className="mt-4 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search medications..."
                  value={searchInventory}
                  onChange={(e) => setSearchInventory(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Strength</TableHead>
                      <TableHead>Form</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Min Stock</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((med) => {
                      const isLowStock = med.quantity < med.minStock;
                      const isExpired = new Date(med.expiryDate) < new Date();

                      return (
                        <TableRow
                          key={med.id}
                          className={isExpired ? "bg-red-50" : ""}
                        >
                          <TableCell className="font-medium">{med.name}</TableCell>
                          <TableCell>{med.strength}</TableCell>
                          <TableCell className="text-sm">{med.form}</TableCell>
                          <TableCell className="font-mono text-sm">{med.batch}</TableCell>
                          <TableCell
                            className={isLowStock ? "font-bold text-red-600" : ""}
                          >
                            {med.quantity}
                          </TableCell>
                          <TableCell>{med.minStock}</TableCell>
                          <TableCell>{med.expiryDate}</TableCell>
                          <TableCell>
                            {isExpired ? (
                              <Badge variant="destructive">Expired</Badge>
                            ) : isLowStock ? (
                              <Badge variant="outline" className="text-yellow-700">
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge variant="secondary">OK</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setSelectedMedication(med)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card className="card">
            <CardHeader>
              <CardTitle>Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lowStockMeds.length === 0 ? (
                <p className="text-slate-500">All medications are adequately stocked.</p>
              ) : (
                <div className="space-y-3">
                  {lowStockMeds.map((med) => (
                    <div
                      key={med.id}
                      className="flex items-start gap-4 p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950"
                    >
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">{med.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Current stock: {med.quantity} (Min required: {med.minStock})
                        </p>
                      </div>
                      <Button size="sm">
                        Order Now
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dispense Dialog */}
      <Dialog open={dispenseDialog} onOpenChange={setDispenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispense Prescription</DialogTitle>
          </DialogHeader>
          {selectedPrescription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Patient</p>
                  <p className="font-medium">{selectedPrescription.patientName}</p>
                </div>
                <div>
                  <p className="text-slate-500">RX ID</p>
                  <p className="font-mono text-sm">{selectedPrescription.id}</p>
                </div>
                <div>
                  <p className="text-slate-500">Medication</p>
                  <p className="font-medium">{selectedPrescription.medication}</p>
                </div>
                <div>
                  <p className="text-slate-500">Dosage</p>
                  <p className="font-medium">{selectedPrescription.dosage}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Quantity to Dispense</label>
                <Input
                  type="number"
                  value={dispenseQty}
                  onChange={(e) => setDispenseQty(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Checkbox id="verify" />
                <label htmlFor="verify" className="text-sm cursor-pointer">
                  I verify this prescription and medication are correct
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDispenseDialog(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={confirmDispense}>
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Dispensing
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
