import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { memberSchema } from "@/lib/validations";
import { createActivity, createNotification } from "@/lib/activity";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const callerMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: session.user.id, projectId: params.id } },
  });
  if (!callerMember || callerMember.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = memberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const userToAdd = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!userToAdd) {
    return NextResponse.json({ error: "User with this email not found" }, { status: 404 });
  }

  const existing = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: userToAdd.id, projectId: params.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "User is already a member" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({ where: { id: params.id }, select: { name: true } });

  const member = await prisma.projectMember.create({
    data: {
      userId: userToAdd.id,
      projectId: params.id,
      role: parsed.data.role || "MEMBER",
    },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });

  await createActivity({
    action: `Added ${userToAdd.name} as ${member.role}`,
    userId: session.user.id,
    projectId: params.id,
  });

  await createNotification({
    userId: userToAdd.id,
    message: `You were added to project "${project?.name}"`,
  });

  return NextResponse.json(member, { status: 201 });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const callerMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: session.user.id, projectId: params.id } },
  });
  if (!callerMember || callerMember.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await req.json();
  if (userId === session.user.id) {
    return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
  }

  await prisma.projectMember.delete({
    where: { userId_projectId: { userId, projectId: params.id } },
  });

  return NextResponse.json({ success: true });
}
