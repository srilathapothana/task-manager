export type Role = "ADMIN" | "MEMBER";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface ProjectMember {
  userId: string;
  role: Role;
  user: User;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: Date | null;
  projectId: string;
  assigneeId: string | null;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  assignee: Pick<User, "id" | "name" | "image"> | null;
  creator: Pick<User, "id" | "name">;
  _count?: { attachments: number };
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  members: ProjectMember[];
  tasks: Task[];
  _count?: { tasks: number };
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string | null;
  createdAt: Date;
  userId: string;
  projectId: string;
  taskId: string | null;
  user: Pick<User, "name" | "image">;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: Date;
  userId: string;
}
