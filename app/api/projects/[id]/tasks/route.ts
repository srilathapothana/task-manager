import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/validations";
import { createActivity, createNotification } from "@/lib/activity";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: session.user.id, projectId: params.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const project = await prisma.project.findUnique({ where: { id: params.id }, select: { name: true } });

  const task = await prisma.task.create({
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      projectId: params.id,
      creatorId: session.user.id,
    },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      creator: { select: { id: true, name: true } },
    },
  });

  await createActivity({
    action: `Created task "${task.title}"`,
    userId: session.user.id,
    projectId: params.id,
    taskId: task.id,
  });

  if (task.assigneeId && task.assigneeId !== session.user.id) {
    await createNotification({
      userId: task.assigneeId,
      message: `You were assigned "${task.title}" in project "${project?.name}"`,
    });
  }

  return NextResponse.json(task, { status: 201 });
}
