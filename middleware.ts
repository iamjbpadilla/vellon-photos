import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Middleware disabled - auth checks handled in page components
  // The Supabase client in middleware doesn't have access to browser cookies
  // causing redirect loops. Page components handle auth properly.
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login'],
}
