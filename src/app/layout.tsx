import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { inter, spaceGrotesk } from '@/app/lib/fonts';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Echo: The Bridge',
  description: 'Bridge the gap between long-term vision and daily action.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn('dark', inter.variable, spaceGrotesk.variable)}
      suppressHydrationWarning
    >
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <div className="flex flex-col min-h-screen w-full">
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
