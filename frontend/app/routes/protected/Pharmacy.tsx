import type { Route } from "../../+types/root";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, Plus, Search
} from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Pharmacy Management" }];
}

export default function Pharmacy() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pharmacy Management</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Manage prescriptions and medication inventory
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dispensed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">0</p>
          </CardContent>
        </Card>
      </div>

      <Card className="card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Pharmacy Module Under Development
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            The pharmacy management module is currently being integrated with the backend API.
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>Prescription management and dispensing</li>
            <li>Medication inventory tracking</li>
            <li>Stock level monitoring</li>
            <li>Drug interaction checking</li>
            <li>Expiry date tracking</li>
          </ul>
          <div className="mt-6">
            <Button disabled className="mr-2">
              <Plus className="h-4 w-4 mr-2" />
              New Prescription (Coming Soon)
            </Button>
            <Button variant="outline">
              View Inventory
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
