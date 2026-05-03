import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const password = await bcrypt.hash("password123", 10);

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: { name: "Alice Johnson", email: "alice@example.com", password },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: { name: "Bob Smith", email: "bob@example.com", password },
  });

  const project = await prisma.project.create({
    data: {
      name: "Demo Project",
      description: "A sample project to get you started",
      color: "#6366f1",
      members: {
        create: [
          { userId: alice.id, role: "ADMIN" },
          { userId: bob.id, role: "MEMBER" },
        ],
      },
    },
  });

  await prisma.task.createMany({
    data: [
      { title: "Set up project structure", status: "DONE", priority: "HIGH", projectId: project.id, creatorId: alice.id, assigneeId: alice.id },
      { title: "Design database schema", status: "DONE", priority: "HIGH", projectId: project.id, creatorId: alice.id, assigneeId: alice.id },
      { title: "Build authentication system", status: "IN_PROGRESS", priority: "HIGH", projectId: project.id, creatorId: alice.id, assigneeId: bob.id },
      { title: "Create task CRUD APIs", status: "IN_PROGRESS", priority: "MEDIUM", projectId: project.id, creatorId: alice.id, assigneeId: bob.id },
      { title: "Add real-time notifications", status: "TODO", priority: "MEDIUM", projectId: project.id, creatorId: alice.id },
      { title: "Deploy to Railway", status: "TODO", priority: "HIGH", projectId: project.id, creatorId: alice.id },
      { title: "Write documentation", status: "TODO", priority: "LOW", projectId: project.id, creatorId: alice.id },
    ],
  });

  console.log("✅ Seed complete!");
  console.log("Demo accounts:");
  console.log("  alice@example.com / password123 (Admin)");
  console.log("  bob@example.com / password123 (Member)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
