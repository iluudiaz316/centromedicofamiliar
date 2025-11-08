import { getUserSession } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = ["/", "/login"]
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith("/_next") || pathname.startsWith("/api/auth/login"),
  )

  // Check if user is authenticated
  const user = await getUserSession()

  // Redirect to login if accessing protected route without auth
  if (!isPublicPath && !user) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if accessing login while authenticated
  if (pathname === "/login" && user) {
    const dashboardUrl = new URL("/dashboard", request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
