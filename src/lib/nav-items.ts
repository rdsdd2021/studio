
import { LayoutDashboard, Users, User, FolderKanban, Activity } from "lucide-react"
import type { User as UserType } from "./types";

const allNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ['admin', 'caller'] },
  { href: "/leads", icon: FolderKanban, label: "All Leads", roles: ['admin'] },
  { href: "/my-leads", icon: User, label: "My Leads", roles: ['caller'] },
  { href: "/users", icon: Users, label: "Users", roles: ['admin'] },
  { href: "/tracker", icon: Activity, label: "Login Tracker", roles: ['admin'] },
];

export function getNavItems(role: UserType['role']) {
    return allNavItems.filter(item => item.roles.includes(role));
}
