import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Users, Stethoscope, TrendingUp } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "MedFlow AI - Hospital Management System" },
    { name: "description", content: "Comprehensive hospital management system with intelligent automation" },
  ];
}

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (!isPending && session) {
      navigate("/dashboard", { replace: true });
    }
  }, [session, isPending, navigate]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Activity className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">MedFlow AI</h1>
          </div>
          <Link to="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
          Hospital Management System
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
          Streamline patient care, optimize operations, and improve outcomes with our comprehensive healthcare platform.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/login">
            <Button size="lg" className="px-8 py-6 text-base font-semibold">
              Access Portal
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="px-8 py-6 text-base font-semibold" disabled>
            View Demo
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">
          Key Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Users,
              title: "Patient Management",
              desc: "Centralized patient records and admission tracking",
            },
            {
              icon: Stethoscope,
              title: "Clinical Workflows",
              desc: "Streamlined doctor notes and treatment planning",
            },
            {
              icon: TrendingUp,
              title: "Analytics & Reporting",
              desc: "Real-time dashboards and comprehensive analytics",
            },
            {
              icon: Activity,
              title: "Operations",
              desc: "Pharmacy, lab, appointments, and billing",
            },
          ].map((feature, i) => (
            <Card key={i} className="card border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center space-y-4">
                <div className="flex justify-center">
                  <feature.icon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{feature.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Module Overview */}
      <section className="max-w-6xl mx-auto px-4 py-20 bg-white dark:bg-slate-900 rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">
          Comprehensive Modules
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { title: "Patient Management", features: ["Admissions", "Medical Records", "Discharge"] },
            { title: "Clinical", features: ["Doctor Notes", "Prescriptions", "Lab Results"] },
            { title: "Operations", features: ["Pharmacy", "Laboratory", "Appointments"] },
            { title: "Administration", features: ["Staff Management", "Billing", "Analytics"] },
          ].map((module, i) => (
            <div key={i} className="p-6 border border-slate-200 dark:border-slate-700 rounded-lg">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">{module.title}</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {module.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Card className="card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-0">
          <CardContent className="p-12 space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Ready to Transform Your Hospital?
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Sign in to access your hospital management portal and start optimizing operations today.
            </p>
            <Link to="/login">
              <Button size="lg" className="px-8 py-6 text-base font-semibold">
                Sign In Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-20 py-8 text-center text-sm text-slate-600 dark:text-slate-400">
        <p>MedFlow AI © 2026. Comprehensive Hospital Management System.</p>
      </footer>
    </div>
  );
}
