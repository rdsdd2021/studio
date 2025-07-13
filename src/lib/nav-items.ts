import { LayoutDashboard, Users, User, FolderKanban, Activity, Globe } from "lucide-react"

export const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/leads", icon: FolderKanban, label: "All Leads" },
  { href: "/my-leads", icon: User, label: "My Leads" },
  { href: "/users", icon: Users, label: "Users" },
  { href: "/tracker", icon: Activity, label: "Login Tracker" },
  { href: "/geofencing", icon: Globe, label: "Geofencing" },
];
