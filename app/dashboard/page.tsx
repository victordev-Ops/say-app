"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import BottomNavbar from "@/components/BottomNavbar";
import { Copy, Check } from "lucide-react";

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

  const slug = profile?.slug ?? "anonymous";
  const confessUrl = `https://say-app.vercel.app/confess/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(confessUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
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

  // Exact same loading animation as Settings page
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 pb-32">
        <div className="max-w-2xl mx-auto">
          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 md:p-10">
            <div className="text-center space-y-10">
              {/* Welcome Header */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  Welcome back! 👋
                </h1>
                <p className="text-lg text-gray-600">
                  Share your link and start receiving anonymous confessions
                </p>
              </div>

              {/* Share Link Section */}
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Your personal confession link
                  </p>

                  <div className="relative max-w-lg mx-auto">
                    <div className="p-5 bg-gray-100 rounded-2xl font-mono text-sm break-all pr-16 text-gray-800 border border-gray-300">
                      {confessUrl}
                    </div>

                    <button
                      onClick={handleCopy}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white shadow-md hover:shadow-lg transition-all hover:scale-105"
                      aria-label="Copy link to clipboard"
                    >
                      {copied ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <Copy className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                  </div>

                  {copied && (
                    <p className="mt-3 text-sm text-green-600 font-medium animate-pulse">
                      ✓ Link copied to clipboard!
                    </p>
                  )}
                </div>

                {/* Friendly Note */}
                <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                  <p className="text-sm text-purple-800 leading-relaxed">
                    Anyone with this link can send you anonymous messages. 
                    Share it with friends, post it on social media, or add it to your bio!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle tip */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Messages appear instantly • No sign-up required for senders
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navbar - Only show if authenticated and profile exists */}
      {user && profile && <BottomNavbar profileId={user.id} />}
    </>
  );
}
