import type { Route } from "../../+types/root";
import { Settings as SettingsIcon, Lock, Bell, Palette, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/provider/theme";
import { Separator } from "@/components/ui/separator";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Settings - MedFlow HMS" }];
}

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
            <SettingsIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          </div>
          Settings & Preferences
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Manage your account, notifications, and system preferences
        </p>
      </div>

      {/* Theme Settings */}
      <Card className="card shadow-sm border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg flex-shrink-0">
              <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            </div>
            <div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the system looks</CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator className="mx-6" />
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <label htmlFor="theme-select" className="text-sm font-semibold text-slate-900 dark:text-white block">
              Theme Preference
            </label>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Choose between light, dark, or system preference
            </p>
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              role="group"
              aria-label="Theme selection"
            >
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
                aria-pressed={theme === "light"}
                className="justify-start"
              >
                ☀️ Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
                aria-pressed={theme === "dark"}
                className="justify-start"
              >
                🌙 Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                onClick={() => setTheme("system")}
                aria-pressed={theme === "system"}
                className="justify-start"
              >
                🖥️ System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="card shadow-sm border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg flex-shrink-0">
              <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
            </div>
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Control how you receive alerts and updates</CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator className="mx-6" />
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Notification Preferences</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Email, SMS, and in-app notifications can be configured here
                </p>
              </div>
              <Button disabled size="sm">
                Configure
              </Button>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              📋 Notification settings will be available in a future update. Currently, all system notifications are enabled.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="card shadow-sm border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg flex-shrink-0">
              <Shield className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <div>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security and access</CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator className="mx-6" />
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Password</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Change your password regularly to maintain account security
                </p>
              </div>
              <Button disabled size="sm" variant="outline">
                <Lock className="h-4 w-4 mr-2" aria-hidden="true" />
                Change
              </Button>
            </div>

            <div className="flex items-start justify-between gap-4 pb-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Two-Factor Authentication</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button disabled size="sm" variant="outline">
                Enable
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900/50 mt-4">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              🔒 <span className="font-semibold">Tip:</span> Using two-factor authentication significantly increases your account security.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="card shadow-sm border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg flex-shrink-0">
              <SettingsIcon className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
            </div>
            <div>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator className="mx-6" />
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Profile Information</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  View and update your profile details
                </p>
              </div>
              <Button disabled size="sm" variant="outline">
                Edit
              </Button>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Deactivate Account</h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button disabled size="sm" variant="destructive">
                Deactivate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Info */}
      <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Need Help?</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          If you have questions about these settings or need additional support, please contact our help desk.
        </p>
        <Button disabled variant="outline" size="sm">
          Contact Support
        </Button>
      </div>
    </div>
  );
}
