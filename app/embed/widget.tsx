"use client"

import { useEffect, useRef } from "react"
import { AgentRegistrationForm } from "@/components/agent-registration-form"

export default function EmbedWidget() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Adjust iframe height based on content
  useEffect(() => {
    const sendHeight = () => {
      if (containerRef.current && window.parent) {
        const height = containerRef.current.scrollHeight
        window.parent.postMessage({ type: "resize", height }, "*")
      }
    }

    // Send initial height
    sendHeight()

    // Set up observer to detect content changes
    const observer = new MutationObserver(sendHeight)

    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      })
    }

    // Clean up observer
    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} className="p-4">
      <AgentRegistrationForm embedded={true} />
    </div>
  )
}
