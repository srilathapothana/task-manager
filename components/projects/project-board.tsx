"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, UserPlus, Settings, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { pusherClient } from "@/lib/pusher";
import { TaskCard } from "@/components/tasks/task-card";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { MembersModal } from "@/components/projects/members-modal";
import { isOverdue } from "@/lib/utils";

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

interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  members: Member[];
  tasks: Task[];
}

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: "TODO", label: "To Do", color: "bg-gray-100 dark:bg-gray-800" },
  { status: "IN_PROGRESS", label: "In Progress", color: "bg-yellow-50 dark:bg-yellow-950" },
  { status: "DONE", label: "Done", color: "bg-green-50 dark:bg-green-950" },
];

export function ProjectBoard({ project: initial, currentUserId, currentUserRole }: {
  project: Project;
  currentUserId: string;
  currentUserRole: string;
}) {
  const router = useRouter();
  const [project, setProject] = useState(initial);
  const [showCreate, setShowCreate] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("TODO");

  useEffect(() => {
    const channel = pusherClient.subscribe(`project-${project.id}`);
    channel.bind("activity", () => { router.refresh(); });
    return () => { pusherClient.unsubscribe(`project-${project.id}`); };
  }, [project.id, router]);

  async function updateTaskStatus(taskId: string, status: TaskStatus) {
    const res = await fetch(`/api/projects/${project.id}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProject((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...updated } : t)),
      }));
    }
  }

  async function deleteTask(taskId: string) {
    const res = await fetch(`/api/projects/${project.id}/tasks/${taskId}`, { method: "DELETE" });
    if (res.ok) {
      setProject((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== taskId) }));
      toast.success("Task deleted");
    }
  }

  function onTaskCreated(task: Task) {
    setProject((prev) => ({ ...prev, tasks: [task, ...prev.tasks] }));
  }

  function openCreateForColumn(status: TaskStatus) {
    setDefaultStatus(status);
    setShowCreate(true);
  }

  const tasksByStatus = (status: TaskStatus) => project.tasks.filter((t) => t.status === status);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/projects" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentUserRole === "ADMIN" && (
            <button
              onClick={() => setShowMembers(true)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <UserPlus className="w-4 h-4" />
              Members ({project.members.length})
            </button>
          )}
          <button
            onClick={() => openCreateForColumn("TODO")}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {project.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map(({ status, label, color }) => {
          const tasks = tasksByStatus(status);
          return (
            <div key={status} className={`rounded-xl p-3 ${color} min-h-[200px]`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                  <span className="text-xs bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full px-2 py-0.5 font-medium">
                    {tasks.length}
                  </span>
                </div>
                <button
                  onClick={() => openCreateForColumn(status)}
                  className="p-1 rounded hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-500 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    projectId={project.id}
                    currentUserId={currentUserId}
                    currentUserRole={currentUserRole}
                    onStatusChange={updateTaskStatus}
                    onDelete={deleteTask}
                    members={project.members}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && (
        <CreateTaskModal
          projectId={project.id}
          members={project.members}
          defaultStatus={defaultStatus}
          onClose={() => setShowCreate(false)}
          onCreated={onTaskCreated}
        />
      )}
      {showMembers && (
        <MembersModal
          projectId={project.id}
          members={project.members}
          currentUserRole={currentUserRole}
          onClose={() => setShowMembers(false)}
          onMembersChange={(members) => setProject((p) => ({ ...p, members }))}
        />
      )}
    </div>
  );
}
