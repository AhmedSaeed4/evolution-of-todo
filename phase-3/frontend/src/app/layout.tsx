import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import Script from 'next/script';
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '700'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '700'],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: "TaskStack - Productivity Meets Intelligence",
  description: "A modern task management platform designed for clarity, focus, and productivity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${dmSans.variable} ${jetBrainsMono.variable} antialiased`}
      >
        {/* ChatKit CDN Script - REQUIRED for ChatKit to work */}
        {/* Note: Next.js 16+ doesn't allow event handlers on Script component */}
        <Script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          strategy="afterInteractive"
        />
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            duration={4000}
            richColors={true}
            toastOptions={{
              className: 'font-mono text-sm',
              style: {
                background: '#F9F7F2',
                color: '#2A1B12',
                border: '1px solid #E5E0D6',
                borderRadius: '0px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

