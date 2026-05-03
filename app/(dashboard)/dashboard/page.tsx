import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardStats } from "@/components/dashboard/stats";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { MyTasks } from "@/components/dashboard/my-tasks";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [totalTasks, completedTasks, inProgressTasks, overdueTasks, recentActivity, myTasks] =
    await Promise.all([
      prisma.task.count({
        where: { project: { members: { some: { userId } } } },
      }),
      prisma.task.count({
        where: { project: { members: { some: { userId } } }, status: "DONE" },
      }),
      prisma.task.count({
        where: { project: { members: { some: { userId } } }, status: "IN_PROGRESS" },
      }),
      prisma.task.count({
        where: {
          project: { members: { some: { userId } } },
          status: { not: "DONE" },
          dueDate: { lt: new Date() },
        },
      }),
      prisma.activityLog.findMany({
        where: { project: { members: { some: { userId } } } },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.task.findMany({
        where: { assigneeId: userId, status: { not: "DONE" } },
        include: { project: { select: { id: true, name: true, color: true } } },
        orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
        take: 10,
      }),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Welcome back, {session?.user?.name?.split(" ")[0]}!
        </p>
      </div>

      <DashboardStats
        total={totalTasks}
        completed={completedTasks}
        inProgress={inProgressTasks}
        overdue={overdueTasks}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MyTasks tasks={myTasks} />
        <RecentActivity activities={recentActivity} />
      </div>
    </div>
  );
}
