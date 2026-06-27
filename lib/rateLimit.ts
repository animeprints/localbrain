import { cookies } from 'next/headers'

const RATE_LIMIT_PREFIX = 'rl_'

export async function checkRateLimit(
  key: string,
  maxRequests: number = 30,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const cookieStore = await cookies()
  const cookieName = `${RATE_LIMIT_PREFIX}${key}`
  const cookieValue = cookieStore.get(cookieName)?.value

  const now = Date.now()

  if (!cookieValue) {
    const expiry = now + windowMs
    cookieStore.set(cookieName, `1:${expiry}`, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: Math.ceil(windowMs / 1000),
    })
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs }
  }

  const [countStr, expiryStr] = cookieValue.split(':')
  const count = parseInt(countStr, 10) || 0
  const expiry = parseInt(expiryStr, 10) || 0

  if (now > expiry) {
    const newExpiry = now + windowMs
    cookieStore.set(cookieName, `1:${newExpiry}`, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: Math.ceil(windowMs / 1000),
    })
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs }
  }

  if (count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: expiry - now }
  }

  const newCount = count + 1
  cookieStore.set(cookieName, `${newCount}:${expiry}`, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: Math.ceil((expiry - now) / 1000),
  })

  return { allowed: true, remaining: maxRequests - newCount, resetIn: expiry - now }
}
