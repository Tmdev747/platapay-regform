import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase"
import { AdminDashboard } from "@/components/admin-dashboard"
import { AgentDashboard } from "@/components/agent-dashboard"

export default async function DashboardPage() {
  const supabase = createServerClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Fetch user role
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", session.user.id)
    .single()

  // If no profile exists, create one with default role "agent"
  if (!userProfile) {
    await supabase.from("user_profiles").insert({
      user_id: session.user.id,
      display_name: session.user.user_metadata.name || session.user.email,
      role: "agent",
    })
  }

  const role = userProfile?.role || "agent"

  // Render appropriate dashboard based on role
  if (role === "admin") {
    return <AdminDashboard />
  } else {
    return <AgentDashboard />
  }
}
