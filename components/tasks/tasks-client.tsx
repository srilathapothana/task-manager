"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDate, isOverdue } from "@/lib/utils";
import { AlertCircle, CheckCircle, Clock, Circle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  project: { id: string; name: string; color: string };
}

const statusIcon = {
  TODO: <Circle className="w-4 h-4 text-gray-400" />,
  IN_PROGRESS: <Clock className="w-4 h-4 text-yellow-500" />,
  DONE: <CheckCircle className="w-4 h-4 text-green-500" />,
};

const priorityBadge = {
  HIGH: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  MEDIUM: "bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400",
  LOW: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
};

export function TasksClient({ tasks }: { tasks: Task[] }) {
  const [filter, setFilter] = useState<"ALL" | "TODO" | "IN_PROGRESS" | "DONE">("ALL");

  const filtered = filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
        <p className="text-gray-500 dark:text-gray-400">{tasks.length} tasks assigned to you</p>
      </div>

      <div className="flex gap-2">
        {(["ALL", "TODO", "IN_PROGRESS", "DONE"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === s
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tasks found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
          {filtered.map((task) => {
            const overdue = task.dueDate && isOverdue(task.dueDate) && task.status !== "DONE";
            return (
              <Link
                key={task.id}
                href={`/projects/${task.project.id}`}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                {statusIcon[task.status as keyof typeof statusIcon]}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.status === "DONE" ? "line-through text-gray-400" : "text-gray-900 dark:text-white"}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.project.color }} />
                    <p className="text-xs text-gray-400">{task.project.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {task.dueDate && (
                    <span className={`flex items-center gap-1 text-xs ${overdue ? "text-red-500" : "text-gray-400"}`}>
                      {overdue && <AlertCircle className="w-3 h-3" />}
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityBadge[task.priority as keyof typeof priorityBadge]}`}>
                    {task.priority}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
