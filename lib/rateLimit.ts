const rateLimits = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  key: string,
  maxRequests: number = 30,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const record = rateLimits.get(key)

  if (!record || now > record.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs }
  }

  if (record.count >= maxRequests) {
    const resetIn = record.resetTime - now
    return { allowed: false, remaining: 0, resetIn }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count, resetIn: record.resetTime - now }
}

export function addRateLimitHeaders(
  response: Response,
  remaining: number,
  resetIn: number
): Response {
  const headers = new Headers(response.headers)
  headers.set('X-RateLimit-Remaining', remaining.toString())
  headers.set('X-RateLimit-Reset', Math.ceil(resetIn / 1000).toString())
  return new Response(response.body, { ...response, headers })
}
