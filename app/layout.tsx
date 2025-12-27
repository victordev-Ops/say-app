import type { Metadata } from "next";
import { GeistSans, GeistMono } from "next/font/google"; // Cleaner import names
import "./globals.css";
import BottomNavbar from "@/components/BottomNavbar";
import { supabaseServer } from "@/lib/supabase/server";
import { Suspense } from "react";

// Font configuration
const geistSans = GeistSans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = GeistMono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "say",
  description: "Receive anonymous confessions from anyone.",
  // Optional: Add more SEO-friendly metadata
  openGraph: {
    title: "say",
    description: "Receive anonymous confessions from anyone.",
    url: "https://say-app.vercel.app",
    type: "website",
  },
};

// Optional: Skeleton fallback for BottomNavbar during loading
function BottomNavbarFallback() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-gray-50 border-t border-gray-200" />
  );
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServer();

  // Parallel fetch: Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // In most Supabase + profiles setups, the profile.id === user.id
  // So we can skip the extra query unless you have a custom setup
  const profileId = user?.id ?? null;

  return (
    <html lang="en">
      <body
        className={`\( {geistSans.variable} \){geistMono.variable} antialiased min-h-screen bg-gray-50 pb-24`}
      >
        {/* Main content */}
        {children}

        {/* Smooth, non-flickering BottomNavbar */}
        <Suspense fallback={<BottomNavbarFallback />}>
          {profileId ? (
            <BottomNavbar profileId={profileId} />
          ) : (
            // Keep space reserved even when not logged in
            <div className="h-24" />
          )}
        </Suspense>
      </body>
    </html>
  );
}
