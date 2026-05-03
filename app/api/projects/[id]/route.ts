import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";

async function getProjectMember(projectId: string, userId: string) {
  return prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await getProjectMember(params.id, session.user.id);
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
      },
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, image: true } },
          creator: { select: { id: true, name: true } },
          _count: { select: { attachments: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return NextResponse.json({ project, role: member.role });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await getProjectMember(params.id, session.user.id);
  if (!member || member.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = projectSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const project = await prisma.project.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json(project);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await getProjectMember(params.id, session.user.id);
  if (!member || member.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.project.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
