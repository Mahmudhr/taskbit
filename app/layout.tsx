import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Suspense } from 'react';
import { Toaster } from 'sonner';
import Loading from '@/components/loading';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Taskbit',
  description:
    'A comprehensive task management system with admin and user panels',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <Suspense fallback={<Loading />}>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <div suppressHydrationWarning>{children}</div>
            <Toaster richColors position='top-center' />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
