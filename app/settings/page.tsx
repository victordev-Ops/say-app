"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "@/components/LogoutButton"; // We'll use the improved version
import Link from "next/link";
import { User, Mail, ArrowLeft } from "lucide-react";

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold flex-1">Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Settings Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-gray-600" />
                Profile
              </h2>
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{username}</p>
                <p className="text-sm text-gray-500 mt-1">Your display name</p>
              </div>
            </div>

            {/* Account Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-gray-600" />
                Account
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
                <div className="pt-4">
                  <LogoutButton />
                </div>
              </div>
            </div>

            {/* Future Settings Teaser */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-3">More coming soon</h2>
              <p className="text-sm text-gray-600">
                We're working on adding preferences for notifications, appearance (dark mode), privacy controls, and more.
              </p>
            </div>
          </div>

          {/* Sidebar (optional on mobile) */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="font-medium text-gray-900 mb-3">Quick links</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/dashboard" className="text-purple-600 hover:underline">
                    Dashboard
                  </Link>
                </li>
                <li className="text-gray-500">Notifications (soon)</li>
                <li className="text-gray-500">Appearance (soon)</li>
                <li className="text-gray-500">Privacy (soon)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mobile-only back button */}
        <div className="fixed bottom-6 left-6 right-6 sm:hidden">
          <Link
            href="/dashboard"
            className="w-full bg-white shadow-lg rounded-xl px-6 py-4 flex items-center justify-center gap-2 font-medium text-gray-900 border border-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
          }
