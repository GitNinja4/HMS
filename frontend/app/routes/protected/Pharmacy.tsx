import type { Route } from "../../+types/root";
import { AlertCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Pharmacy" }];
}

export default function Pharmacy() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pharmacy Management</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Manage medications and dispensing
        </p>
      </div>

      <Card className="card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            The Pharmacy module is under development. Expected features:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>Prescription dispensing interface</li>
            <li>Medication inventory management</li>
            <li>Stock level tracking</li>
            <li>Drug interaction checker</li>
            <li>Patient medication history</li>
          </ul>
          <Button disabled className="mt-6">
            <Package className="h-4 w-4 mr-2" />
            Access Pharmacy (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
