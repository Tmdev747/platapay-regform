export function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex items-start justify-end mb-4">
      <div className="bg-[#58317A] text-white p-3 rounded-2xl rounded-tr-none max-w-[85%]">
        <p className="text-sm">{content}</p>
      </div>
    </div>
  )
}
