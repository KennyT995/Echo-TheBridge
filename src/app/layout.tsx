import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { inter, spaceGrotesk } from '@/app/lib/fonts';
import { cn } from '@/lib/utils';
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Echo: The Bridge',
  description: 'Bridge the gap between long-term vision and daily action.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://echo-the-bridge.com',
    title: 'Echo: The Bridge',
    description: 'Bridge the gap between long-term vision and daily action.',
    siteName: 'Echo: The Bridge',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Echo: The Bridge',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Echo: The Bridge',
    description: 'Bridge the gap between long-term vision and daily action.',
    images: ['/og-image.jpg'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Echo: The Bridge",
  },
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
      className={cn(inter.variable, spaceGrotesk.variable)}
      suppressHydrationWarning
    >
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <div className="flex flex-col min-h-screen w-full">
              <Header />
              <main className="flex-1 flex flex-col">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
