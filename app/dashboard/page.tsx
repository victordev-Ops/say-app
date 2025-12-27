// app/dashboard/page.tsx (Logout removed, as requested)
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import BottomNavbar from "@/components/BottomNavbar";
import { Copy, Check } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{ username: string; slug: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("username, slug")
          .eq("id", user.id)
          .single();

        setProfile(prof);
      }

      setLoading(false);
    }

    fetchData();
  }, [supabase]);

  const name = profile?.username ?? "Anonymous";
  const slug = profile?.slug ?? "anonymous";
  const confessUrl = `https://say-app.vercel.app/confess/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(confessUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = confessUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 pb-32">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8">
          <div className="space-y-12 text-center">
            {/* Main Share Section */}
            <div>
              <h2 className="text-3xl font-bold mb-8">{name}</h2>

              <p className="text-sm text-gray-600 mb-3">Share this link:</p>

              <div className="relative max-w-md mx-auto">
                <div className="p-5 bg-gray-100 rounded-2xl font-mono text-sm break-all pr-16">
                  {confessUrl}
                </div>

                <button
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-200 transition"
                  aria-label="Copy link to clipboard"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <Copy className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Anyone with this link can send you anonymous confessions!
              </p>
            </div>

            {/* Settings Link (optional replacement for logout visibility) */}
            <div className="pt-8 border-t border-gray-200">
      
          </div>
        </div>
      </div>

      {/* Bottom Navbar */}
      {user && profile && <BottomNavbar profileId={user.id} />}
    </>
  );
    }
