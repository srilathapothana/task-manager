import { prisma } from "./prisma";

export async function createActivity({
  action,
  details,
  userId,
  projectId,
  taskId,
}: {
  action: string;
  details?: string;
  userId: string;
  projectId: string;
  taskId?: string;
}) {
  const activity = await prisma.activityLog.create({
    data: { action, details, userId, projectId, taskId },
    include: { user: { select: { name: true, image: true } } },
  });
  return activity;
}

export async function createNotification({
  userId,
  message,
}: {
  userId: string;
  message: string;
}) {
  const notification = await prisma.notification.create({
    data: { userId, message },
  });
  return notification;
}