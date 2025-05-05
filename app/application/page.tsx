import { redirect } from "next/navigation"

export default function ApplicationPage() {
  // Redirect to the home page since we now start directly with the application form
  redirect("/")
}
