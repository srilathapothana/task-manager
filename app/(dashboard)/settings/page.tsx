import { auth } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Profile</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">Name</label>
            <p className="text-gray-900 dark:text-white font-medium">{session?.user?.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
            <p className="text-gray-900 dark:text-white font-medium">{session?.user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
