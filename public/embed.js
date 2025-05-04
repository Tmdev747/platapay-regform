;(() => {
  // Create iframe element
  const iframe = document.createElement("iframe")

  // Set attributes
  iframe.src = "https://your-domain.com/embed"
  iframe.style.width = "100%"
  iframe.style.height = "600px"
  iframe.style.border = "none"
  iframe.style.overflow = "hidden"
  iframe.scrolling = "no"
  iframe.id = "platapay-agent-form"

  // Add message listener for resizing
  window.addEventListener("message", (event) => {
    // Verify origin for security
    if (event.origin !== "https://your-domain.com") return

    // Handle resize message
    if (event.data && event.data.type === "resize") {
      iframe.style.height = event.data.height + "px"
    }
  })

  // Find the container element
  const container = document.getElementById("platapay-agent-form-container")

  // Insert iframe
  if (container) {
    container.appendChild(iframe)
  } else {
    console.error('Container element not found. Add a div with id="platapay-agent-form-container" to your page.')
  }
})()
