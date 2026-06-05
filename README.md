# TaskFlow — Team Task Manager

A full-stack team task management app built with **Next.js 14**, **PostgreSQL**, **Prisma**, **NextAuth**, and **Pusher**.

## 🚀 Live Demo
> https://task-manager-production-ff6d.up.railway.app/

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL (Railway) |
| ORM | Prisma |
| Auth | NextAuth.js v5 |
| Styling | Tailwind CSS |
| Real-time | Pusher |

## ✨ Features
- 🔐 Authentication (Signup/Login with JWT sessions)
- 📁 Projects CRUD with color coding
- 👥 Team management with Admin/Member roles
- ✅ Kanban board (To Do → In Progress → Done)
- 🎯 Task details: priority, due dates, assignees
- 📊 Dashboard stats: total, completed, in-progress, overdue
- 🔔 Real-time notifications via Pusher
- 📜 Activity audit log
- 🌙 Dark mode

## 📦 Local Setup

### 1. Install
```bash
npm install
cp .env.example .env
# Fill in your .env values
```

### 2. Database
```bash
npx prisma db push
```

### 3. Run
```bash
npm run dev
```

---

## 🚂 Railway Deployment

1. Create a Railway project → add **PostgreSQL** service
2. Add a new service → connect your GitHub repo
3. Set environment variables (see `.env.example`)
4. Push to deploy — Railway auto-builds!

**Required env vars:**
```
DATABASE_URL         (from Railway Postgres)
AUTH_SECRET          (openssl rand -base64 32)
NEXTAUTH_URL         (https://your-app.up.railway.app)
PUSHER_APP_ID
PUSHER_SECRET
NEXT_PUBLIC_PUSHER_KEY
NEXT_PUBLIC_PUSHER_CLUSTER
```

## 📡 API Endpoints

```
POST   /api/auth/signup
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/members
DELETE /api/projects/:id/members
POST   /api/projects/:id/tasks
PATCH  /api/projects/:id/tasks/:taskId
DELETE /api/projects/:id/tasks/:taskId
GET    /api/activity
GET    /api/notifications
PATCH  /api/notifications
```

## 🔒 RBAC

| Action | Admin | Member |
|---|---|---|
| Create/edit own tasks | ✅ | ✅ |
| Edit/delete any task | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Delete project | ✅ | ❌ |
