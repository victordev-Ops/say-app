// app/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string>("Anonymous");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchUserAndProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (profile?.username) {
          setUsername(profile.username);
        }
      }

      setLoading(false);
    }

    fetchUserAndProfile();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="bg-white rounded-2xl shadow-md p-6 space-y-8">
          {/* Username Display */}
          <div className="text-center py-6 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600">Your Name</p>
            <p className="text-2xl font-bold mt-1">{username}</p>
          </div>

          {/* Account Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Account</h2>
            <div className="space-y-4">
              {user && (
                <p className="text-sm text-gray-600">
                  Logged in as <span className="font-medium">{user.email}</span>
                </p>
              )}
              <LogoutButton />
            </div>
          </div>

          {/* Coming Soon */}
          <div className="pt-6 border-t">
            <p className="text-sm text-gray-500">
              More settings coming soon: notifications, theme, privacy, etc.
            </p>
          </div>

          {/* Back Link */}
          <div className="pt-6 border-t text-center">
            <Link href="/dashboard" className="text-purple-600 hover:underline">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
                                                   }
