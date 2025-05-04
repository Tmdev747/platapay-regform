import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Video, Download, ArrowLeft } from "lucide-react"

export default function ResourcesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-8">
        <Link href="/" className="flex items-center text-primary hover:underline mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold">Agent Resources</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started Guide</CardTitle>
            <CardDescription>Essential information for new PlataPay agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40 bg-primary/5 rounded-md mb-4">
              <FileText className="h-16 w-16 text-primary/60" />
            </div>
            <p className="text-sm text-muted-foreground">
              Learn about the basics of being a PlataPay agent, including account setup, transaction processing, and
              customer service best practices.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training Videos</CardTitle>
            <CardDescription>Step-by-step video tutorials</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40 bg-primary/5 rounded-md mb-4">
              <Video className="h-16 w-16 text-primary/60" />
            </div>
            <p className="text-sm text-muted-foreground">
              Watch our comprehensive video tutorials covering all aspects of the PlataPay agent platform and services.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View Videos
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Marketing Materials</CardTitle>
            <CardDescription>Promote your PlataPay services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40 bg-primary/5 rounded-md mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-16 w-16 text-primary/60"
              >
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                <path d="M18 14h-8" />
                <path d="M15 18h-5" />
                <path d="M10 6h8v4h-8V6Z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">
              Access posters, flyers, social media assets, and other marketing materials to promote your PlataPay
              services.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" /> Download Assets
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 bg-primary/5 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Need Additional Help?</h2>
        <p className="mb-4">
          Our agent support team is available to assist you with any questions or issues you may encounter.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button>Contact Support</Button>
          <Button variant="outline">Visit FAQ</Button>
        </div>
      </div>
    </div>
  )
}
