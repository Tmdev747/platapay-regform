"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Eye } from "lucide-react"
import { AgentMap } from "@/components/agent-map"

interface Agent {
  id: string
  created_at: string
  name: string
  email: string
  phone: string
  address: string
  location: {
    latitude: number
    longitude: number
  }
  status: "pending" | "approved" | "rejected"
  additional_info?: string
}

export function AdminDashboard() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [activeTab, setActiveTab] = useState("pending")

  const supabase = createBrowserClient()

  // Fetch agents based on status
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true)

        const { data, error } = await supabase
          .from("agents")
          .select("*")
          .eq("status", activeTab)
          .order("created_at", { ascending: false })

        if (error) throw error

        setAgents(data as Agent[])
      } catch (err) {
        console.error("Error fetching agents:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()

    // Set up real-time subscription
    const subscription = supabase
      .channel("agents-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agents",
          filter: `status=eq.${activeTab}`,
        },
        (payload) => {
          fetchAgents()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [activeTab, supabase])

  // Update agent status
  const updateAgentStatus = async (agentId: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase.from("agents").update({ status }).eq("id", agentId)

      if (error) throw error

      // Update local state
      setAgents(agents.filter((agent) => agent.id !== agentId))
      setSelectedAgent(null)
    } catch (err) {
      console.error("Error updating agent status:", err)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              <h2 className="text-xl font-semibold">Pending Applications</h2>
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : agents.length === 0 ? (
                <p className="text-muted-foreground">No pending applications</p>
              ) : (
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <Card key={agent.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardHeader className="pb-2" onClick={() => setSelectedAgent(agent)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{agent.name}</CardTitle>
                            <CardDescription>
                              {agent.email} • {agent.phone}
                            </CardDescription>
                          </div>
                          <Badge>{agent.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardFooter className="pt-2">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedAgent(agent)}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                          <Button size="sm" variant="default" onClick={() => updateAgentStatus(agent.id, "approved")}>
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateAgentStatus(agent.id, "rejected")}
                          >
                            <X className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              <h2 className="text-xl font-semibold">Approved Applications</h2>
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : agents.length === 0 ? (
                <p className="text-muted-foreground">No approved applications</p>
              ) : (
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <Card key={agent.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardHeader className="pb-2" onClick={() => setSelectedAgent(agent)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{agent.name}</CardTitle>
                            <CardDescription>
                              {agent.email} • {agent.phone}
                            </CardDescription>
                          </div>
                          <Badge className="bg-green-500">{agent.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardFooter className="pt-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedAgent(agent)}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              <h2 className="text-xl font-semibold">Rejected Applications</h2>
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : agents.length === 0 ? (
                <p className="text-muted-foreground">No rejected applications</p>
              ) : (
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <Card key={agent.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardHeader className="pb-2" onClick={() => setSelectedAgent(agent)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{agent.name}</CardTitle>
                            <CardDescription>
                              {agent.email} • {agent.phone}
                            </CardDescription>
                          </div>
                          <Badge variant="destructive">{agent.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardFooter className="pt-2">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedAgent(agent)}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                          <Button size="sm" variant="default" onClick={() => updateAgentStatus(agent.id, "approved")}>
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          {selectedAgent ? (
            <Card>
              <CardHeader>
                <CardTitle>Agent Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Name</h3>
                  <p>{selectedAgent.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Contact</h3>
                  <p>Email: {selectedAgent.email}</p>
                  <p>Phone: {selectedAgent.phone}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Address</h3>
                  <p>{selectedAgent.address}</p>
                </div>
                {selectedAgent.additional_info && (
                  <div>
                    <h3 className="font-semibold">Additional Information</h3>
                    <p>{selectedAgent.additional_info}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {selectedAgent.status === "pending" && (
                  <div className="flex space-x-2 w-full">
                    <Button
                      className="flex-1"
                      variant="default"
                      onClick={() => updateAgentStatus(selectedAgent.id, "approved")}
                    >
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button
                      className="flex-1"
                      variant="destructive"
                      onClick={() => updateAgentStatus(selectedAgent.id, "rejected")}
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
                {selectedAgent.status === "rejected" && (
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => updateAgentStatus(selectedAgent.id, "approved")}
                  >
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                )}
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Agent Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Select an agent to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-8">
        <AgentMap />
      </div>
    </div>
  )
}
