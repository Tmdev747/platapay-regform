import type React from "react"
export default function EmbeddableMapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="w-full h-[500px]">{children}</div>
}
