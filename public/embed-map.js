;(() => {
  // Create iframe element
  const iframe = document.createElement("iframe")

  // Set attributes
  iframe.src = `${window.location.protocol}//${window.location.host}/embed/map`
  iframe.style.width = "100%"
  iframe.style.height = "500px"
  iframe.style.border = "none"
  iframe.style.overflow = "hidden"
  iframe.scrolling = "no"
  iframe.id = "platapay-agent-map"

  // Add message listener for resizing
  window.addEventListener("message", (event) => {
    // Verify origin for security
    if (event.origin !== `${window.location.protocol}//${window.location.host}`) return

    // Handle resize message
    if (event.data && event.data.type === "resize") {
      iframe.style.height = `${event.data.height}px`
    }
  })

  // Find the container element
  const container = document.getElementById("platapay-agent-map-container")

  // Insert iframe
  if (container) {
    container.appendChild(iframe)
  } else {
    console.error('Container element not found. Add a div with id="platapay-agent-map-container" to your page.')
  }
})()
