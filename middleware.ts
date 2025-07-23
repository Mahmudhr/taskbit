import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const USER_ALLOWED_PATHS = ['/dashboard/my-tasks', '/dashboard/my-payments'];
const ADMIN_PATHS = [
  '/dashboard/payments',
  '/dashboard/tasks',
  '/dashboard/users',
  '/dashboard/clients',
];

export default withAuth(
  function middleware(req) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (req.nextauth?.token as any)?.user?.role;

    const path = req.nextUrl.pathname;

    if (role === 'USER') {
      // If trying to access any admin path or its subpages, redirect to /dashboard/my-tasks
      if (ADMIN_PATHS.some((adminPath) => path.startsWith(adminPath))) {
        return NextResponse.redirect(new URL('/dashboard/my-tasks', req.url));
      }
      if (!USER_ALLOWED_PATHS.includes(path)) {
        return NextResponse.redirect(new URL('/dashboard/my-tasks', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
    callbacks: {
      authorized: async ({ token }) => {
        return !!token;
      },
    },
    pages: {
      signIn: '/signin',
      error: '/signin',
    },
  }
);

export const config = { matcher: ['/dashboard/:path*'] };
