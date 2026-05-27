import type { Role } from "@/types";
import {
  LayoutDashboard,
  Users,
  ClipboardPlus,
  Stethoscope,
  Pill,
  FlaskConical,
  FileText,
  Settings2,
  LifeBuoy,
  Send,
  ReceiptCent,
  Heart,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon?: any;
  allowedRoles: Role[];
  items?: {
    title: string;
    url: string;
    allowedRoles?: Role[];
  }[];
}

export const navConfig: {
  navMain: NavItem[];
  navAdmin: NavItem[];
  navSecondary: NavItem[];
} = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      allowedRoles: ["admin", "doctor", "nurse", "pharmacist", "lab_tech", "patient"],
      items: [
        { title: "Overview", url: "/dashboard" },
        { title: "Activities Log", url: "/activities-log" },
      ],
    },
    {
      title: "Administrators",
      url: "/admins",
      icon: Users,
      allowedRoles: ["admin"],
      items: [
        { title: "All Administrators", url: "/admins" },
      ],
    },
    {
      title: "Patients",
      url: "/patients",
      icon: Users,
      allowedRoles: ["admin", "doctor", "nurse"],
      items: [
        { title: "All Patients", url: "/patients" },
      ],
    },
    {
      title: "Nursing Station",
      url: "/nursing-station",
      icon: ClipboardPlus,
      allowedRoles: ["admin", "nurse"],
      items: [
        { title: "Vital Signs", url: "/nursing-station" },
        { title: "Care Plans", url: "/nursing-station" },
      ],
    },
    {
      title: "Doctors",
      url: "/doctors",
      icon: Stethoscope,
      allowedRoles: ["admin", "doctor"],
      items: [{ title: "Doctors", url: "/doctors" }],
    },
    {
      title: "Pharmacy",
      url: "/pharmacy",
      icon: Pill,
      allowedRoles: ["admin", "pharmacist", "doctor"],
      items: [
        { title: "Dispense", url: "/pharmacy" },
        { title: "Inventory", url: "/pharmacy" },
        { title: "Prescriptions", url: "/prescriptions" },
      ],
    },
    {
      title: "Laboratory",
      url: "/laboratory",
      icon: FlaskConical,
      allowedRoles: ["admin", "lab_tech", "doctor"],
      items: [
        { title: "Test Requests", url: "/laboratory" },
        { title: "Results Entry", url: "/laboratory" },
      ],
    },
    {
      title: "Prescriptions",
      url: "/prescriptions",
      icon: FileText,
      allowedRoles: ["admin", "doctor", "pharmacist"],
      items: [
        { title: "Manage", url: "/prescriptions" },
        { title: "Active", url: "/prescriptions" },
      ],
    },
    {
      title: "Financial Records",
      url: "/financial-history",
      icon: ReceiptCent,
      allowedRoles: ["admin", "doctor"],
      items: [{ title: "History", url: "/financial-history" }],
    },
    {
      title: "Appointments",
      url: "/appointments",
      icon: FileText,
      allowedRoles: ["admin", "doctor", "nurse", "patient"],
      items: [{ title: "Telemedicine", url: "/telemedicine" }],
    },
    {
      title: "My Health",
      url: "/patient/appointments",
      icon: Heart,
      allowedRoles: ["patient"],
      items: [
        { title: "My Appointments", url: "/patient/appointments" },
        { title: "Medical Records", url: "/patient/medical-records" },
        { title: "Prescriptions", url: "/patient/prescriptions" },
        { title: "Health Profile", url: "/patient/health-profile" },
      ],
    },
  ],
  navAdmin: [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      allowedRoles: ["admin"],
      items: [
        { title: "General", url: "/settings/general" },
        { title: "Roles & Permissions", url: "/settings/roles" },
        { title: "Billing", url: "/settings/billing" },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
      allowedRoles: ["admin", "doctor", "nurse", "pharmacist", "lab_tech"],
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: Send,
      allowedRoles: ["admin", "doctor", "nurse", "pharmacist", "lab_tech"],
    },
  ],
};

// Helper function to find a route configuration by URL
export function getRouteConfig(path: string, items: NavItem[]): NavItem | null {
  for (const item of items) {
    if (item.url === path) return item;
    if (item.items) {
      const found = item.items.find((sub) => sub.url === path);
      if (found)
        return {
          ...found,
          allowedRoles: found.allowedRoles || item.allowedRoles,
        } as NavItem;
    }
  }
  return null;
}
