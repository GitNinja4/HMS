import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ArrowRight, Home } from "lucide-react";

export function meta() {
  return [{ title: "Page Not Found - MedFlow HMS" }];
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Main Error Card */}
        <Card className="card shadow-xl border-0">
          <CardContent className="p-12 text-center space-y-8">
            {/* Icon with subtle animation */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-100 dark:bg-amber-900/30 rounded-full blur-xl opacity-50" />
                <AlertTriangle
                  className="w-20 h-20 text-amber-500 relative"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Error Content */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 tracking-wide uppercase">
                Error 404
              </p>
              <h1 className="text-5xl font-black text-slate-900 dark:text-white">
                Page Not Found
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
                The page you're looking for doesn't exist or has been moved. This is not a
                problem with your system.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Link to="/dashboard" className="w-full">
                <Button className="w-full h-11 text-base font-semibold flex items-center justify-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Go to Dashboard
                </Button>
              </Link>
              <Link to="/" className="w-full">
                <Button variant="outline" className="w-full h-11 text-base font-semibold flex items-center justify-center gap-2">
                  <Home className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Help Text */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Need help? <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Contact support
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="font-semibold text-slate-900 dark:text-white mb-1">Check URL</p>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Verify the web address is correct
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="font-semibold text-slate-900 dark:text-white mb-1">Clear Cache</p>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Try refreshing or clearing browser cache
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
