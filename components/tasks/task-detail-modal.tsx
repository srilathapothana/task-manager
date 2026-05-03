"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { X, Loader2, Paperclip, Trash2, ExternalLink, Calendar, User, Flag } from "lucide-react";
import { formatDate, isOverdue } from "@/lib/utils";

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

interface Props {
  task: Task;
  projectId: string;
  members: Member[];
  currentUserId: string;
  currentUserRole: string;
  onClose: () => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

const priorityColors = {
  HIGH: "text-red-600",
  MEDIUM: "text-yellow-600",
  LOW: "text-green-600",
};

export function TaskDetailModal({ task: initial, projectId, members, currentUserId, currentUserRole, onClose, onStatusChange, onDelete }: Props) {
  const [task, setTask] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: initial.title,
    description: initial.description || "",
    status: initial.status,
    priority: initial.priority,
    dueDate: initial.dueDate ? new Date(initial.dueDate).toISOString().split("T")[0] : "",
    assigneeId: initial.assignee?.id || "",
  });

  const canEdit = currentUserRole === "ADMIN" || task.creator.id === currentUserId;

  async function saveChanges() {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dueDate: form.dueDate || null,
          assigneeId: form.assigneeId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error);
      setTask({ ...task, ...data });
      onStatusChange(task.id, data.status);
      setEditing(false);
      toast.success("Task updated!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Task Details</h2>
          <div className="flex items-center gap-2">
            {canEdit && (
              <>
                {editing ? (
                  <button
                    onClick={saveChanges}
                    disabled={saving}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Edit
                  </button>
                )}
              </>
            )}
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {editing ? (
            <>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full text-lg font-bold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-700 pb-2 focus:outline-none focus:border-indigo-500"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                placeholder="Description..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
                    className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none">
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Assignee</label>
                  <select value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                    className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none">
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.userId} value={m.userId}>{m.user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{task.title}</h3>
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{task.description}</p>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Flag className={`w-4 h-4 ${priorityColors[task.priority as keyof typeof priorityColors]}`} />
                  <span>{task.priority} priority</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    task.status === "DONE" ? "bg-green-100 text-green-700" :
                    task.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {task.status.replace("_", " ")}
                  </span>
                </div>
                {task.dueDate && (
                  <div className={`flex items-center gap-2 ${isOverdue(task.dueDate) && task.status !== "DONE" ? "text-red-500" : "text-gray-600 dark:text-gray-400"}`}>
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                )}
                {task.assignee && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span>{task.assignee.name}</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400">
                Created by {task.creator.name}
              </div>
            </>
          )}

          {canEdit && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => {
                  if (confirm("Delete this task?")) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete task
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
