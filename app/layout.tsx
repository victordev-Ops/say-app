import type { Metadata } from "next";
import { GeistSans, GeistMono } from "next/font/google";
import "./globals.css";
import BottomNavbar from "@/components/BottomNavbar";
import { supabaseServer } from "@/lib/supabase/server";
import { Suspense } from "react";

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
};

function BottomNavbarFallback() {
  return <div className="fixed bottom-0 left-0 right-0 h-24 bg-gray-50 border-t border-gray-200" />;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profileId = user?.id ?? null;

  return (
    <html lang="en">
      <body
        className={`\( {geistSans.variable} \){geistMono.variable} font-sans antialiased min-h-screen bg-gray-50 pb-24`}
      >
        {children}

        <Suspense fallback={<BottomNavbarFallback />}>
          {profileId ? (
            <BottomNavbar profileId={profileId} />
          ) : (
            <div className="h-24" />
          )}
        </Suspense>
      </body>
    </html>
  );
}
