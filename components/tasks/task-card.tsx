"use client";

import { useState } from "react";
import { AlertCircle, Paperclip, ChevronRight, Trash2, User } from "lucide-react";
import { formatDate, isOverdue, cn } from "@/lib/utils";
import { TaskDetailModal } from "./task-detail-modal";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: string;
  dueDate: Date | null;
  assignee: { id: string; name: string; image: string | null } | null;
  creator: { id: string; name: string };
  _count: { attachments: number };
}

interface Member {
  userId: string;
  role: string;
  user: { id: string; name: string; email: string; image: string | null };
}

const priorityColors = {
  HIGH: "border-l-red-500",
  MEDIUM: "border-l-yellow-500",
  LOW: "border-l-green-500",
};

const priorityBadge = {
  HIGH: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  MEDIUM: "bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400",
  LOW: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
};

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

export function TaskCard({ task, projectId, currentUserId, currentUserRole, onStatusChange, onDelete, members }: {
  task: Task;
  projectId: string;
  currentUserId: string;
  currentUserRole: string;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  members: Member[];
}) {
  const [showDetail, setShowDetail] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const overdue = task.dueDate && isOverdue(task.dueDate) && task.status !== "DONE";

  return (
    <>
      <div
        className={cn(
          "bg-white dark:bg-gray-900 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-800 border-l-4 cursor-pointer hover:shadow-md transition group",
          priorityColors[task.priority as keyof typeof priorityColors]
        )}
        onClick={() => setShowDetail(true)}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 flex-1">{task.title}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if ((currentUserRole === "ADMIN" || task.creator.id === currentUserId) && confirm("Delete task?")) {
                onDelete(task.id);
              }
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityBadge[task.priority as keyof typeof priorityBadge]}`}>
              {task.priority}
            </span>
            {task._count?.attachments > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Paperclip className="w-3 h-3" />
                {task._count?.attachments}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {task.dueDate && (
              <span className={cn("text-xs flex items-center gap-0.5", overdue ? "text-red-500" : "text-gray-400")}>
                {overdue && <AlertCircle className="w-3 h-3" />}
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>

        {task.assignee && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                {task.assignee.name.charAt(0)}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{task.assignee.name}</span>
          </div>
        )}
      </div>

      {showDetail && (
        <TaskDetailModal
          task={task}
          projectId={projectId}
          members={members}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onClose={() => setShowDetail(false)}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
