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
  return [{ title: "Laboratory Management" }];
}

export default function Laboratory() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Laboratory Management</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Manage lab tests, results, and diagnostics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Results</CardTitle>
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
            Laboratory Module Under Development
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            The laboratory management module is currently being integrated with the backend API.
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>Test order creation and tracking</li>
            <li>Result entry and management</li>
            <li>Lab report generation</li>
            <li>Quality control and verification</li>
            <li>Result delivery to patients and doctors</li>
          </ul>
          <div className="mt-6">
            <Button disabled className="mr-2">
              <Plus className="h-4 w-4 mr-2" />
              New Test Order (Coming Soon)
            </Button>
            <Button variant="outline">
              View Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
