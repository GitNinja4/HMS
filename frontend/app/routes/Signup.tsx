import type { Route } from "../+types/root";
import { Activity, Lock, Mail, User, Building2, ChevronRight, AlertCircle, ArrowLeft } from "lucide-react";
import { CustomInput } from "@/components/global/CustomInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { useState } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate, Navigate, Link } from "react-router";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/global/Loader";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign Up" },
    { name: "description", content: "Create a new MedFlow account" },
  ];
}

// Sign-up validation schema with proper password complexity
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .refine((pass) => /[A-Z]/.test(pass), "Password must contain at least one uppercase letter")
    .refine((pass) => /[a-z]/.test(pass), "Password must contain at least one lowercase letter")
    .refine((pass) => /[0-9]/.test(pass), "Password must contain at least one number")
    .refine((pass) => /[!@#$%^&*()_+\-=\[\]{};:'",./<>?/\\|`~]/.test(pass), "Password must contain at least one special character"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
  organization: z.string().min(2, "Organization name is required"),
  role: z.enum(["admin", "doctor", "nurse", "pharmacist", "lab_tech", "patient"], {
    errorMap: () => ({ message: "Please select a role" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const Signup = () => {
  const [globalError, setGlobalError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      organization: "",
      role: "doctor",
    },
  });

  if (isPending) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader label="Loading..." />
      </div>
    );
  }

  // Redirect if logged in
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: SignupFormValues) => {
    setGlobalError("");
    setIsLoading(true);

    try {
      // Use the auth client to signup
      await authClient.signup(
        data.email,
        data.password,
        data.name,
        data.role,
        data.organization
      );

      toast.success("Account created! Logging you in...");
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
      setGlobalError(errorMessage);
      toast.error(errorMessage);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors p-4">
      <Card className="rounded-lg shadow-2xl card backdrop-blur-xl w-full md:max-w-md">
        <CardContent className="p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="bg-linear-to-tr from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-blue-500/30 mb-4">
              <Activity className="text-white w-8 h-8" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Create Account
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">
              Join MedFlow Healthcare Network
            </p>
          </div>

          {/* Global Error */}
          {globalError && (
            <div
              className="mb-6 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm flex items-center gap-3 border border-red-100 dark:border-red-900/50"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle size={18} className="shrink-0" aria-hidden="true" />
              <span className="font-medium">{globalError}</span>
            </div>
          )}

          {/* Form */}
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
            aria-label="Sign up form"
            noValidate
          >
            {/* Full Name */}
            <CustomInput
              control={form.control}
              name="name"
              label="Full Name"
              placeholder="Dr. John Doe"
              type="text"
              startIcon={<User size={18} />}
              autoComplete="name"
              required
            />

            {/* Email */}
            <CustomInput
              control={form.control}
              name="email"
              label="Email Address"
              placeholder="john@hospital.com"
              type="email"
              startIcon={<Mail size={18} />}
              autoComplete="email"
              required
            />

            {/* Organization */}
            <CustomInput
              control={form.control}
              name="organization"
              label="Organization"
              placeholder="City Hospital"
              type="text"
              startIcon={<Building2 size={18} />}
              required
            />

            {/* Role Selection */}
            <div>
              <label className="text-sm font-semibold text-slate-900 dark:text-white block mb-2">
                Professional Role <span className="text-red-500">*</span>
              </label>
              <select
                {...form.register("role")}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Professional role"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="lab_tech">Lab Technician</option>
                <option value="admin">Administrator</option>
              </select>
              {form.formState.errors.role && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.role.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <CustomInput
                control={form.control}
                name="password"
                label="Password"
                placeholder="••••••••"
                type="password"
                startIcon={<Lock size={18} />}
                autoComplete="new-password"
                required
              />
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                <p className="font-medium mb-1">Password must contain:</p>
                <ul className="space-y-1 ml-2">
                  <li className={form.watch('password')?.length >= 8 ? 'text-green-600' : 'text-slate-500'}>✓ At least 8 characters</li>
                  <li className={/[A-Z]/.test(form.watch('password') || '') ? 'text-green-600' : 'text-slate-500'}>✓ One uppercase letter</li>
                  <li className={/[a-z]/.test(form.watch('password') || '') ? 'text-green-600' : 'text-slate-500'}>✓ One lowercase letter</li>
                  <li className={/[0-9]/.test(form.watch('password') || '') ? 'text-green-600' : 'text-slate-500'}>✓ One number</li>
                  <li className={/[!@#$%^&*()_+\-=\[\]{};:'",./<>?/\\|`~]/.test(form.watch('password') || '') ? 'text-green-600' : 'text-slate-500'}>✓ One special character</li>
                </ul>
              </div>
            </div>

            {/* Confirm Password */}
            <CustomInput
              control={form.control}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="••••••••"
              type="password"
              startIcon={<Lock size={18} />}
              required
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl py-6 font-bold text-base shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] group mt-6"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    role="status"
                    aria-label="Loading"
                    aria-hidden="true"
                  />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Create Account
                  <ChevronRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                    aria-hidden="true"
                  />
                </div>
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Back to Home */}
      <Link
        to="/"
        className="mt-6 flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to Home
      </Link>
    </div>
  );
};

export default Signup;
