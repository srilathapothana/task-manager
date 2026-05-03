import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProjectBoard } from "@/components/projects/project-board";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const userId = session!.user!.id!;

  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId: params.id } },
  });

  if (!member) notFound();

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

  if (!project) notFound();

  return (
    <ProjectBoard
      project={project}
      currentUserId={userId}
      currentUserRole={member.role}
    />
  );
}
