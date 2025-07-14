
'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LeadsFlowLogo } from "@/components/icons"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getNavItems } from "@/lib/nav-items"
import type { User } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth" // Client-side auth fetcher

export function Sidebar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = React.useState<User | undefined>(undefined);

  React.useEffect(() => {
    async function fetchUser() {
      const user = await getCurrentUser();
      setCurrentUser(user);
    }
    fetchUser();
  }, []);

  const navItems = getNavItems(currentUser?.role || 'caller');

  return (
    <aside className="hidden w-16 flex-col border-r bg-card sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 py-4">
          <Link
            href="/dashboard"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <LeadsFlowLogo className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">LeadsFlow</span>
          </Link>

          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                    pathname.startsWith(item.href)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>
    </aside>
  );
}
