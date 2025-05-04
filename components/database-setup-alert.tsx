import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

interface DatabaseSetupAlertProps {
  className?: string
  variant?: "default" | "destructive"
}

export function DatabaseSetupAlert({ className, variant = "destructive" }: DatabaseSetupAlertProps) {
  return (
    <Alert variant={variant} className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Database Setup Required</AlertTitle>
      <AlertDescription>
        Before you can use this feature, you need to set up your database schema.{" "}
        <Link href="/setup" className="font-medium underline">
          Click here to set up the database
        </Link>
      </AlertDescription>
    </Alert>
  )
}
