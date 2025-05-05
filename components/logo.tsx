import Image from "next/image"

export function Logo({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizes = {
    small: { width: 32, height: 32 },
    default: { width: 48, height: 48 },
    large: { width: 64, height: 64 },
  }

  const { width, height } = sizes[size] || sizes.default

  return (
    <div className="flex items-center">
      <div className="flex-shrink-0 mr-2">
        <Image
          src="/images/platapay-logo.png"
          alt="PlataPay Logo"
          width={width}
          height={height}
          className="object-contain"
        />
      </div>
      <span className={`font-bold ${size === "large" ? "text-2xl" : size === "small" ? "text-base" : "text-xl"}`}>
        PlataPay
      </span>
    </div>
  )
}
