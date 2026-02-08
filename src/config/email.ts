export const DISPOSABLE_DOMAINS = [
  'mailinator.com',
  '10minutemail.com',
  'guerrillamail.com',
  'tempmail.com',
  'yopmail.com',
  'sharklasers.com',
  'trashmail.com',
  'getnada.com',
]

export function getAllowedDomains(): string[] {
  const raw = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS || ''
  return raw
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean)
}

export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase() || ''
  return DISPOSABLE_DOMAINS.includes(domain)
}

export function isAllowedDomain(email: string): boolean {
  const allowed = getAllowedDomains()
  if (allowed.length === 0) return true
  const domain = email.split('@')[1]?.toLowerCase() || ''
  return allowed.includes(domain)
}
