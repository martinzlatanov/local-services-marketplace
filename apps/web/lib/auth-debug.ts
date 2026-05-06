import { verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"

export function debugGetToken(req: Request): string | null {
  let token: string | undefined
  const authHeader = req.headers.get("Authorization")
  console.log("[DEBUG] Auth header:", authHeader?.substring(0, 30))
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7)
  }
  if (!token) {
    const cookieHeader = req.headers.get("cookie")
    console.log("[DEBUG] Cookie header:", cookieHeader?.substring(0, 100))
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").map(c => c.trim())
      console.log("[DEBUG] Cookies:", cookies)
      const tokenCookie = cookies.find(c => c.startsWith("token="))
      console.log("[DEBUG] Token cookie:", tokenCookie?.substring(0, 30))
      if (tokenCookie) {
        token = tokenCookie.substring(6)
      }
    }
  }
  console.log("[DEBUG] Token extracted:", token?.substring(0, 30))
  return token || null
}

export function debugVerifyToken(token: string): any {
  try {
    const payload = verify(token, JWT_SECRET)
    console.log("[DEBUG] Token valid:", payload)
    return payload
  } catch(e: any) {
    console.log("[DEBUG] Token invalid:", e.message)
    return null
  }
}
