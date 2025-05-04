import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <span className="font-bold text-primary text-xl">PlataPay</span>
      <span className="rounded-md bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
        Agent Portal
      </span>
    </Link>
  )
}
