"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { UserPlus, X, Trash2, Crown, User } from "lucide-react";

interface Member {
  userId: string;
  role: string;
  user: { id: string; name: string; email: string; image: string | null };
}

interface MembersModalProps {
  projectId: string;
  members: Member[];
  currentUserRole: string;
  onClose: () => void;
  onMembersChange: (members: Member[]) => void;
}

export function MembersModal({ projectId, members, currentUserRole, onClose, onMembersChange }: MembersModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [adding, setAdding] = useState(false);

  async function addMember() {
    if (!email.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error);
      onMembersChange([...members, data]);
      setEmail("");
      toast.success("Member added!");
    } finally {
      setAdding(false);
    }
  }

  async function removeMember(userId: string) {
    const res = await fetch(`/api/projects/${projectId}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      onMembersChange(members.filter((m) => m.userId !== userId));
      toast.success("Member removed");
    } else {
      const data = await res.json();
      toast.error(data.error);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Project Members</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {currentUserRole === "ADMIN" && (
            <div className="flex gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="User email"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={(e) => e.key === "Enter" && addMember()}
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "ADMIN" | "MEMBER")}
                className="px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button
                onClick={addMember}
                disabled={adding}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-60"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {members.map((m) => (
              <div key={m.userId} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {m.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{m.user.name}</p>
                    <p className="text-xs text-gray-400">{m.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${m.role === "ADMIN" ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                    {m.role === "ADMIN" ? <Crown className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {m.role}
                  </span>
                  {currentUserRole === "ADMIN" && (
                    <button
                      onClick={() => removeMember(m.userId)}
                      className="p-1 text-red-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
