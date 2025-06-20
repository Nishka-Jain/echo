import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";

// Configure the Lato font for body text
const lato = Lato({ 
  subsets: ["latin"],
  variable: '--font-lato', // CSS variable
  display: 'swap',
  weight: ['400', '700'] // Include weights you need
});

// Configure the Playfair Display font for headings
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display', // CSS variable
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Echo - Every Voice is a Legacy",
  description: "Record, preserve, and explore real stories, memories, and life wisdom.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${lato.variable} ${playfairDisplay.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}