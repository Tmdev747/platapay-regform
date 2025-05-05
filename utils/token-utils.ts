import { createHash } from "crypto"

/**
 * Generates a unique token for email verification
 * @param email User's email address
 * @returns A unique token
 */
export function generateVerificationToken(email: string): string {
  const timestamp = Date.now()
  const data = `${email}:${timestamp}`
  return createHash("sha256").update(data).digest("hex")
}

/**
 * Generates a unique application ID for a user
 * @param email User's email address
 * @returns A unique application ID
 */
export function generateApplicationId(email: string): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const data = `${email}:${timestamp}:${randomStr}`
  return createHash("md5").update(data).digest("hex").substring(0, 8).toUpperCase()
}
