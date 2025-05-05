import type React from "react"
import { Logo } from "@/components/logo"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#58317A] text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Logo size="small" />
            <span className="ml-4 font-semibold">Admin Panel</span>
          </div>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <a href="/admin" className="hover:underline">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/admin/email-test" className="hover:underline">
                  Email Test
                </a>
              </li>
              <li>
                <a href="/admin/templates" className="hover:underline">
                  Templates
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">{children}</main>
      <footer className="bg-gray-100 text-gray-600 p-4 text-center text-sm">
        &copy; {new Date().getFullYear()} PlataPay, a subsidiary of InnovateHub. All rights reserved.
      </footer>
    </div>
  )
}
