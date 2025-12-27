// app/settings/page.tsx
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Account</h2>
            <LogoutButton />
          </div>

          <div className="pt-6 border-t">
            <p className="text-sm text-gray-500">
              More settings coming soon: notifications, theme, privacy, etc.
            </p>
          </div>

          <div className="pt-6 border-t text-center">
            <Link href="/dashboard" className="text-purple-600 hover:underline">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
