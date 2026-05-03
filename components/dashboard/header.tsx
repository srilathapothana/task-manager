"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Bell, Sun, Moon, LogOut, User } from "lucide-react";
import { pusherClient } from "@/lib/pusher";
import toast from "react-hot-toast";

interface HeaderProps {
  user: { id?: string; name?: string | null; email?: string | null; image?: string | null };
}

export function Header({ user }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState<{ id: string; message: string; read: boolean }[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUser, setShowUser] = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then(setNotifications)
      .catch(() => {});

    if (user.id) {
      const channel = pusherClient.subscribe(`user-${user.id}`);
      channel.bind("notification", (data: { id: string; message: string; read: boolean }) => {
        setNotifications((prev) => [data, ...prev]);
        toast(data.message, { icon: "🔔" });
      });
      return () => { pusherClient.unsubscribe(`user-${user.id}`); };
    }
  }, [user.id]);

  const unread = notifications.filter((n) => !n.read).length;

  function markRead() {
    setShowNotifs(true);
    if (unread > 0) {
      fetch("/api/notifications", { method: "PATCH" }).then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      });
    }
  }

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-3">
        {/* Dark mode */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={markRead}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition relative"
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 z-50">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="font-semibold text-gray-900 dark:text-white">Notifications</span>
                <button onClick={() => setShowNotifs(false)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-3 border-b border-gray-50 dark:border-gray-800 text-sm ${n.read ? "text-gray-500" : "text-gray-900 dark:text-white font-medium"}`}>
                      {n.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUser(!showUser)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
              {user.name}
            </span>
          </button>
          {showUser && (
            <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 z-50">
              <div className="p-2">
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
