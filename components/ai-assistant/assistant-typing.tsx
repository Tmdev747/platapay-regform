import Image from "next/image"

export function AssistantTyping() {
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
      <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-[#58317A]/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div
            className="w-2 h-2 bg-[#58317A]/60 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-[#58317A]/60 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  )
}
