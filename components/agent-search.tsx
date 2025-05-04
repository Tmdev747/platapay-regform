"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

interface Agent {
  id: string
  name: string
  address: string
  phone: string
}

export function AgentSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  // Search for agents
  const searchAgents = async (query: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("agents")
        .select("id, name, address, phone")
        .eq("status", "approved")
        .or(`name.ilike.%${query}%, address.ilike.%${query}%`)
        .limit(10)

      if (error) {
        // Check if the error is about missing relation
        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          setError("The agents table doesn't exist yet. Please set up your database schema first.")
          console.error("Database schema not set up:", error.message)
        } else {
          setError("Failed to search agents")
          console.error("Error searching agents:", error)
        }
        setAgents([])
        return
      }

      setAgents(data as Agent[])
    } catch (err) {
      console.error("Error searching agents:", err)
      setError("Failed to search agents")
      setAgents([])
    } finally {
      setLoading(false)
    }
  }

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchAgents(searchQuery)
  }

  // Load initial agents on mount
  useEffect(() => {
    searchAgents("")
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Agents</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Search by name or location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="icon" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </form>

        <div className="mt-4">
          {error ? (
            <div className="rounded-md border border-destructive p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">{error}</p>
                  {error.includes("database schema") && (
                    <p className="text-sm mt-2">
                      Please visit{" "}
                      <Link href="/setup" className="text-primary underline font-medium">
                        the setup page
                      </Link>{" "}
                      to initialize your database.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : agents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No agents found</p>
          ) : (
            <div className="space-y-4 mt-4">
              {agents.map((agent) => (
                <Card key={agent.id}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">{agent.address}</p>
                    <p className="text-sm mt-2">Phone: {agent.phone}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
