import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TasksClient } from "@/components/tasks/tasks-client";

export default async function TasksPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const tasks = await prisma.task.findMany({
    where: { assigneeId: userId },
    include: {
      project: { select: { id: true, name: true, color: true } },
      assignee: { select: { id: true, name: true, image: true } },
      creator: { select: { id: true, name: true } },
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  return <TasksClient tasks={tasks} />;
}
