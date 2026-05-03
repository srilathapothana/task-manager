"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, FolderKanban, Trash2, Users, CheckSquare } from "lucide-react";
import { PROJECT_COLORS } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  role: string;
  members: { user: { id: string; name: string; image: string | null } }[];
  _count: { tasks: number };
}

export function ProjectsClient({ projects: initial }: { projects: Project[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initial);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: PROJECT_COLORS[0] });

  async function createProject() {
    if (!form.name.trim()) return toast.error("Project name is required");
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error);
      setProjects([{ ...data, role: "ADMIN" }, ...projects]);
      setForm({ name: "", description: "", color: PROJECT_COLORS[0] });
      setShowCreate(false);
      toast.success("Project created!");
    } finally {
      setCreating(false);
    }
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project and all its tasks?")) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects(projects.filter((p) => p.id !== id));
      toast.success("Project deleted");
    } else {
      toast.error("Failed to delete project");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-500 dark:text-gray-400">{projects.length} projects</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm({ ...form, color: c })}
                      className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? "scale-125 ring-2 ring-offset-2 ring-gray-400" : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createProject}
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition disabled:opacity-60"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No projects yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                  <Link
                    href={`/projects/${project.id}`}
                    className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  >
                    {project.name}
                  </Link>
                </div>
                {project.role === "ADMIN" && (
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {project.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{project.description}</p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <CheckSquare className="w-4 h-4" />
                  <span>{project._count.tasks} tasks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{project.members.length} members</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${project.role === "ADMIN" ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                  {project.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
