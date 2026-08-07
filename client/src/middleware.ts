import { NextRequest, NextResponse } from 'next/server'

const templatePrefixes = ['/components', '/charts', '/forms', '/ui', '/tables', '/dashboards', '/pages']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (templatePrefixes.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.rewrite(new URL('/404', request.url))
  }

  if (pathname.startsWith('/apps') && !pathname.startsWith('/apps/invoice/print')) {
    return NextResponse.rewrite(new URL('/404', request.url))
  }

  if (pathname.startsWith('/app/orders/label') || /\/app\/orders\/(inbox|spam|trash|archive|sent|draft)$/.test(pathname)) {
    return NextResponse.rewrite(new URL('/404', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/components/:path*', '/charts/:path*', '/forms/:path*', '/ui/:path*', '/tables/:path*', '/dashboards/:path*', '/pages/:path*', '/apps/:path*', '/app/orders/:path*']
}
