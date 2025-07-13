import { LayoutDashboard, Users, User, FolderKanban } from "lucide-react"

export const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/leads", icon: FolderKanban, label: "All Leads" },
  { href: "/my-leads", icon: User, label: "My Leads" },
  { href: "/users", icon: Users, label: "Users" },
];
