import { AgentMap } from "@/components/agent-map"

export default function MapPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">PlataPay Agent Network</h1>
      <p className="mb-8 text-muted-foreground">
        Find PlataPay agents across the Philippines. Our network of trusted agents can help you with money transfers,
        bill payments, and other financial services.
      </p>

      {/* Larger map for better visibility */}
      <AgentMap height="600px" initialZoom={6} />

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">About Our Agent Network</h2>
        <p className="mb-4">
          PlataPay agents are carefully selected and trained to provide excellent service. All agents undergo a thorough
          verification process to ensure they meet our standards.
        </p>
        <p>
          If you can't find an agent near you, please check back later as we're constantly expanding our network.
          Alternatively, you can{" "}
          <a href="/register" className="text-primary underline">
            apply to become an agent
          </a>{" "}
          yourself!
        </p>
      </div>
    </div>
  )
}
