"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

export function MainNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/find-agent",
      label: "Find Agent",
      active: pathname === "/find-agent",
    },
    {
      href: "/register",
      label: "Become an Agent",
      active: pathname === "/register",
    },
  ]

  // Admin routes
  const adminRoutes = [
    {
      href: "/admin",
      label: "Admin Dashboard",
      active: pathname === "/admin",
    },
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-primary" : "text-muted-foreground",
          )}
        >
          {route.label}
        </Link>
      ))}

      {user && (
        <Link
          href="/dashboard"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
          )}
        >
          Dashboard
        </Link>
      )}

      {user && (
        <Link
          href="/profile"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/profile" ? "text-primary" : "text-muted-foreground",
          )}
        >
          Profile
        </Link>
      )}

      {/* Admin routes */}
      {user &&
        adminRoutes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              route.active ? "text-primary" : "text-muted-foreground",
            )}
          >
            {route.label}
          </Link>
        ))}
    </nav>
  )
}
