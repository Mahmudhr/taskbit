import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const USER_ALLOWED_PATHS = [
  '/dashboard/my-tasks',
  '/dashboard/my-payments',
  '/dashboard/profile',
];

const ADMIN_PATHS = [
  '/dashboard/payments',
  '/dashboard/expenses',
  '/dashboard/salaries',
  '/dashboard/tasks',
  '/dashboard/users',
  '/dashboard/clients',
  '/dashboard/dashboard',
];

export default withAuth(
  function middleware(req) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (req.nextauth?.token as any)?.user?.role;
    const path = req.nextUrl.pathname;

    if (role === 'USER' || role === 'EMPLOYEE') {
      if (ADMIN_PATHS.some((adminPath) => path.startsWith(adminPath))) {
        return NextResponse.redirect(new URL('/dashboard/my-tasks', req.url));
      }

      const isAllowedPath = USER_ALLOWED_PATHS.some((userPath) =>
        path.startsWith(userPath)
      );

      if (!isAllowedPath) {
        return NextResponse.redirect(new URL('/dashboard/my-tasks', req.url));
      }
    }

    if (role === 'ADMIN') {
      return NextResponse.next();
    }

    if (!role) {
      return NextResponse.redirect(new URL('/signin', req.url));
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
