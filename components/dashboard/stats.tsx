import { CheckCircle, Clock, AlertTriangle, LayoutList } from "lucide-react";

interface StatsProps {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
}

export function DashboardStats({ total, completed, inProgress, overdue }: StatsProps) {
  const stats = [
    { label: "Total Tasks", value: total, icon: LayoutList, color: "indigo", bg: "bg-indigo-50 dark:bg-indigo-950", text: "text-indigo-600 dark:text-indigo-400" },
    { label: "Completed", value: completed, icon: CheckCircle, color: "green", bg: "bg-green-50 dark:bg-green-950", text: "text-green-600 dark:text-green-400" },
    { label: "In Progress", value: inProgress, icon: Clock, color: "yellow", bg: "bg-yellow-50 dark:bg-yellow-950", text: "text-yellow-600 dark:text-yellow-400" },
    { label: "Overdue", value: overdue, icon: AlertTriangle, color: "red", bg: "bg-red-50 dark:bg-red-950", text: "text-red-600 dark:text-red-400" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, bg, text }) => (
        <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
            <div className={`p-2 rounded-lg ${bg}`}>
              <Icon className={`w-4 h-4 ${text}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}
