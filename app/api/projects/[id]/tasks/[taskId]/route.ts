import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/validations";
import { createActivity, createNotification } from "@/lib/activity";

export async function GET(_req: Request, { params }: { params: { id: string; taskId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const task = await prisma.task.findUnique({
    where: { id: params.taskId },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      creator: { select: { id: true, name: true, image: true } },
      attachments: true,
    },
  });

  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(task);
}

export async function PATCH(req: Request, { params }: { params: { id: string; taskId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: session.user.id, projectId: params.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = taskSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const oldTask = await prisma.task.findUnique({ where: { id: params.taskId } });
  const project = await prisma.project.findUnique({ where: { id: params.id }, select: { name: true } });

  const task = await prisma.task.update({
    where: { id: params.taskId },
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : parsed.data.dueDate,
    },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      creator: { select: { id: true, name: true } },
      _count: { select: { attachments: true } },
    },
  });

  if (oldTask?.status !== task.status) {
    await createActivity({
      action: `Changed "${task.title}" status to ${task.status.replace("_", " ")}`,
      userId: session.user.id,
      projectId: params.id,
      taskId: task.id,
    });
  }

  if (parsed.data.assigneeId && parsed.data.assigneeId !== oldTask?.assigneeId && parsed.data.assigneeId !== session.user.id) {
    await createActivity({
      action: `Assigned "${task.title}" to ${task.assignee?.name}`,
      userId: session.user.id,
      projectId: params.id,
      taskId: task.id,
    });
    await createNotification({
      userId: parsed.data.assigneeId,
      message: `You were assigned "${task.title}" in project "${project?.name}"`,
    });
  }

  return NextResponse.json(task);
}

export async function DELETE(_req: Request, { params }: { params: { id: string; taskId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: session.user.id, projectId: params.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const task = await prisma.task.findUnique({ where: { id: params.taskId } });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (task.creatorId !== session.user.id && member.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.task.delete({ where: { id: params.taskId } });

  await createActivity({
    action: `Deleted task "${task.title}"`,
    userId: session.user.id,
    projectId: params.id,
  });

  return NextResponse.json({ success: true });
}
