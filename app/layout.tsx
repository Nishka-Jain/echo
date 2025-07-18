import { Toaster } from 'react-hot-toast';

import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import './globals.css';
import 'leaflet/dist/leaflet.css'; 
import { AuthProvider } from './context/AuthContext';

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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body>
        <AuthProvider> 
          <Toaster position="top-center" /> 
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}