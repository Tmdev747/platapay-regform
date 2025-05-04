import { TestLogin } from "@/components/test-login"

export default function TestAuthPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Authentication Test Page</h1>
      <TestLogin />
    </div>
  )
}
