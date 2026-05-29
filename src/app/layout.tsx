import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

// Explicit viewport — ensures Lighthouse mobile scoring picks up the
// proper meta tag and prevents zoom-blocking. Also colors the address bar
// to brand green on supported browsers.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0E7C3A" },
    { media: "(prefers-color-scheme: dark)", color: "#0E7C3A" },
  ],
};

export const metadata: Metadata = {
  title: "JayField — Booking Lapangan Futsal",
  description:
    "Booking lapangan futsal jadi lebih mudah. Pilih, pesan, dan main. Semudah itu.",
  keywords: ["futsal", "booking", "lapangan", "jayfield", "sport"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={cn(inter.variable, montserrat.variable)}
      suppressHydrationWarning
    >
      <head>
        {/*
         * FOUC-prevention: read the persisted theme synchronously and apply
         * the `dark` class to <html> before the body renders. Runs at most
         * a few microseconds so the user never sees a flash of light theme
         * before dark kicks in. localStorage and matchMedia are wrapped in
         * try/catch since they can throw in private mode / sandboxed iframes.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('jayfield-theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
        {/*
         * Preconnect to image CDNs we hit on landing/critical paths so the
         * browser can warm up the TLS handshake before the first <img>
         * request. dns-prefetch is a fallback for older agents.
         */}
        <link rel="preconnect" href="https://utfs.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://utfs.io" />
        <link
          rel="preconnect"
          href="https://images.unsplash.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="font-body antialiased bg-background text-text-primary">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
