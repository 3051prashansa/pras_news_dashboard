import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/auth/signin'

  // Get the token from the cookies
  const token = request.cookies.get('firebase-token')?.value

  // Redirect logic
  if (isPublicPath && token) {
    // If user is signed in and tries to access signin page, redirect to home
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!isPublicPath && !token) {
    // If user is not signed in and tries to access protected page, redirect to signin
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/news',
    '/payouts',
    '/analytics',
    '/auth/signin'
  ]
} 