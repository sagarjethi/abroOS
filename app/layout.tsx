import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/ThemeProvider";
import { FileSystemProvider } from "@/contexts/FileSystemContext";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AbroOSOS',
  description: 'Created by AbroOSan Volynets',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link type="image/png" sizes="16x16" rel="icon" href="/favi-16x16.png" />
        <link type="image/png" sizes="32x32" rel="icon" href="/favi-32x32.png" />
        {/* Can add more favicon sizes if needed */}
      </head>
      <body className={`${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
        >
          <FileSystemProvider>
            {children}
          </FileSystemProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
