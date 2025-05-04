"use client"

import { useLoading } from "@/contexts/loading-context"
import { Loader2 } from "lucide-react"

export function GlobalLoading() {
  const { isLoading } = useLoading()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background p-6 rounded-lg shadow-lg flex flex-col items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-lg font-medium">Loading...</p>
        <p className="text-sm text-muted-foreground mt-1">Please wait</p>
      </div>
    </div>
  )
}
