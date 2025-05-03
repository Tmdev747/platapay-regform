"use client"

import Image from "next/image"
import { Volume2 } from "lucide-react"

interface AssistantMessageProps {
  content: string
  onPlayAudio?: () => void
  showPlayButton?: boolean
}

export function AssistantMessage({ content, onPlayAudio, showPlayButton = true }: AssistantMessageProps) {
  return (
    <div className="flex items-start mb-4">
      <div className="w-8 h-8 overflow-hidden mr-2 flex-shrink-0 rounded-full border border-[#58317A]/20">
        <Image
          src="/images/assistant-avatar.png"
          alt="Assistant"
          width={32}
          height={32}
          className="object-cover object-top"
        />
      </div>
      <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl rounded-tl-none max-w-[85%] relative group">
        <p className="text-sm whitespace-pre-wrap">{content}</p>

        {onPlayAudio && showPlayButton && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPlayAudio()
            }}
            className="absolute right-2 top-2 p-1 bg-white rounded-full opacity-70 hover:opacity-100 transition-opacity"
            title="Play message audio"
          >
            <Volume2 size={14} className="text-[#58317A]" />
          </button>
        )}
      </div>
    </div>
  )
}
