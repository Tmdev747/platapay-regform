"use client"

import { useState } from "react"
import { Volume2, AlertCircle, X } from "lucide-react"

interface AudioPermissionModalProps {
  onAllow: () => void
  onDeny: () => void
  onClose: () => void
}

export function AudioPermissionModal({ onAllow, onDeny, onClose }: AudioPermissionModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAllow = async () => {
    setIsLoading(true)
    try {
      // Try to get audio permission
      await navigator.mediaDevices.getUserMedia({ audio: true })
      onAllow()
    } catch (error) {
      console.error("Error getting audio permission:", error)
      onDeny()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative z-10">
        <div className="absolute top-4 right-4">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[#58317A]/10 flex items-center justify-center">
            <Volume2 size={32} className="text-[#58317A]" />
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2 text-center">Enable Voice Features?</h3>

        <p className="text-gray-600 mb-4 text-center">
          To use voice features, MARIA AI needs permission to access your microphone and play audio.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md mb-6 text-sm flex items-start">
          <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
          <span>
            Your browser may show a permission request. Please click "Allow" when prompted to enable voice features.
          </span>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={handleAllow}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-[#58317A] text-white rounded-md hover:bg-[#482968] disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <span className="mr-2">Requesting permission...</span>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              </>
            ) : (
              "Allow Microphone Access"
            )}
          </button>

          <button
            onClick={onDeny}
            disabled={isLoading}
            className="w-full py-2.5 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Continue without Voice
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          You can change this setting anytime in your browser settings or by clicking the "Enable Audio" button in the
          chat.
        </p>
      </div>
    </div>
  )
}
