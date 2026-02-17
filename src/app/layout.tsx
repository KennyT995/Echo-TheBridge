import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { FocusAnchorProvider } from "@/features/focus/context/focus-context";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { inter, spaceGrotesk, geist } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://echo-the-bridge.com";
const APP_TITLE = "Echo: The Bridge";
const APP_DESCRIPTION = "Bridge the gap between long-term vision and daily action.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_TITLE,
    template: `%s | ${APP_TITLE}`,
  },
  description: APP_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    siteName: APP_TITLE,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: APP_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_TITLE,
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
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
      className={cn(inter.variable, spaceGrotesk.variable, geist.variable)}
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
            <FocusAnchorProvider>
              <div className="flex flex-col min-h-screen w-full">
                <Header />
                <main className="flex-1 flex flex-col">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </FocusAnchorProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
