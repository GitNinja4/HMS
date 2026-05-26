import type { Route } from "../../+types/root";
import { AlertCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Telemedicine" }];
}

export default function Telemedicine() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Telemedicine</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Remote consultation and virtual visits
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
            The Telemedicine module is under development. Expected features:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>Video consultation interface</li>
            <li>Screen sharing capabilities</li>
            <li>Virtual waiting room</li>
            <li>Recording and transcription</li>
            <li>Post-consultation notes</li>
          </ul>
          <Button disabled className="mt-6">
            <Video className="h-4 w-4 mr-2" />
            Start Consultation (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
