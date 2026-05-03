import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProjectsClient } from "@/components/projects/projects-client";

export default async function ProjectsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const projects = await prisma.project.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const projectsWithRole = projects.map((p) => ({
    ...p,
    role: p.members.find((m) => m.userId === userId)?.role || "MEMBER",
  }));

  return <ProjectsClient projects={projectsWithRole} />;
}
