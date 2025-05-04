import { StoreLocatorWithDistance } from "@/components/store-locator-with-distance"
import { DatabaseSetupAlert } from "@/components/database-setup-alert"

export default function FindAgentPage() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Find a PlataPay Agent</h1>

      <DatabaseSetupAlert className="mb-6" />

      <StoreLocatorWithDistance height="600px" />
    </main>
  )
}
