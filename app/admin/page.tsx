import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  const supabase = createServerClient()

  // Check if user is authenticated and is an admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch user role
  const { data: userRole } = await supabase.from("user_profiles").select("role").eq("user_id", session.user.id).single()

  // Redirect if not admin
  if (!userRole || userRole.role !== "admin") {
    redirect("/")
  }

  return <AdminDashboard />
}
