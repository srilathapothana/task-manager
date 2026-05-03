import { formatDate } from "@/lib/utils";

interface Activity {
  id: string;
  action: string;
  createdAt: Date;
  user: { name: string; image: string | null };
}

export function RecentActivity({ activities }: { activities: Activity[] }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
      {activities.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {activities.map((a) => (
            <div key={a.id} className="flex items-start gap-3">
              <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  {a.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">{a.user.name}</span>{" "}
                  <span className="text-gray-600 dark:text-gray-400">{a.action}</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(a.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
