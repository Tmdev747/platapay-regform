export default function EmbedMapDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">PlataPay Agent Map Embed Demo</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
        <div id="platapay-agent-map-container" className="border rounded-md" style={{ height: "500px" }}></div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">How to Embed</h2>
        <p>Add this HTML to your website where you want the map to appear:</p>

        <div className="bg-muted p-4 rounded-md overflow-x-auto">
          <pre className="text-sm">
            {`<div id="platapay-agent-map-container"></div>
<script src="${process.env.NEXT_PUBLIC_APP_URL}/embed-map.js"></script>`}
          </pre>
        </div>

        <p className="text-sm text-muted-foreground">
          The map will automatically resize based on the content and will be responsive to different screen sizes.
        </p>
      </div>
    </div>
  )
}
