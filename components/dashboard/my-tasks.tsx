import Link from "next/link";
import { formatDate, isOverdue } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  project: { id: string; name: string; color: string };
}

const priorityColor = {
  HIGH: "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400",
  MEDIUM: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400",
  LOW: "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400",
};

export function MyTasks({ tasks }: { tasks: Task[] }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">My Tasks</h2>
        <Link href="/tasks" className="text-sm text-indigo-600 hover:underline">View all</Link>
      </div>
      {tasks.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No tasks assigned to you</p>
      ) : (
        <div className="space-y-2">
          {tasks.slice(0, 8).map((task) => (
            <Link
              key={task.id}
              href={`/projects/${task.project.id}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition group"
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: task.project.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                <p className="text-xs text-gray-400">{task.project.name}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {task.dueDate && isOverdue(task.dueDate) && (
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                )}
                {task.dueDate && (
                  <span className={`text-xs ${isOverdue(task.dueDate) ? "text-red-500" : "text-gray-400"}`}>
                    {formatDate(task.dueDate)}
                  </span>
                )}
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityColor[task.priority as keyof typeof priorityColor]}`}>
                  {task.priority}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
