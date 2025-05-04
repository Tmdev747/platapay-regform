import type React from "react"
export default function EmbedMapDemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {children}
      <script src="/embed-map.js" async></script>
    </div>
  )
}
