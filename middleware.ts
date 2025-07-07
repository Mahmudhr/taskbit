import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

const USER_ALLOWED_PATHS = ['/dashboard/my-tasks', '/dashboard/my-payments'];

export default withAuth(
  function middleware(req) {
    //@ts-ignore
    const role = req.nextauth?.token?.user?.role;

    const path = req.nextUrl.pathname;

    if (role === 'USER') {
      if (!USER_ALLOWED_PATHS.includes(path)) {
        return NextResponse.rewrite(new URL('/denied', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
    callbacks: {
      authorized: async ({ token }) => {
        return !!token; // Ensure the token exists
      },
    },
    pages: {
      signIn: '/signin',
      error: '/signin',
    },
  }
);

export const config = { matcher: ['/dashboard/:path*'] };
