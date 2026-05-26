import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, Phone } from "lucide-react";

export function meta() {
  return [{ title: "Server Error - MedFlow HMS" }];
}

export default function ServerError() {
  const errorId = Math.random().toString(36).slice(2, 11).toUpperCase();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-red-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Main Error Card */}
        <Card className="card shadow-xl border-0">
          <CardContent className="p-12 text-center space-y-8">
            {/* Icon with subtle animation */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded-full blur-xl opacity-50" />
                <AlertTriangle
                  className="w-20 h-20 text-red-500 relative"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Error Content */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-red-600 dark:text-red-400 tracking-wide uppercase">
                Error 500
              </p>
              <h1 className="text-5xl font-black text-slate-900 dark:text-white">
                Server Error
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
                Something unexpected happened on our end. Our team has been automatically
                notified and is investigating.
              </p>
            </div>

            {/* Error ID for Support */}
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Error Reference ID
              </p>
              <p className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 break-all">
                {errorId}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share this ID with support for faster resolution
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={() => window.location.reload()}
                className="w-full h-11 text-base font-semibold flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Link to="/dashboard" className="w-full">
                <Button variant="outline" className="w-full h-11 text-base font-semibold flex items-center justify-center gap-2">
                  <Home className="w-4 h-4" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>

            {/* Support Information */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Need immediate assistance?
              </p>
              <a
                href="tel:+1-800-MEDFLOW"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm"
              >
                <Phone className="w-4 h-4" />
                Contact Support Team
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Status Info */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-sm">
          <p className="text-slate-700 dark:text-slate-300">
            <span className="font-semibold">System Status:</span>{" "}
            <a href="/status" className="text-blue-600 dark:text-blue-400 hover:underline">
              Check real-time status
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
