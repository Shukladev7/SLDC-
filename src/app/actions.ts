"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

async function getAuth() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function createProject(formData: FormData) {
  const session = await getAuth();
  if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
    throw new Error("Forbidden");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as string;
  const clientId = formData.get("clientId") as string;
  const managerId = session.user.role === 'MANAGER' ? session.user.id : (formData.get("managerId") as string);

  await prisma.project.create({
    data: {
      name,
      description,
      priority,
      clientId: clientId === 'none' ? null : clientId,
      managerId: managerId || null,
    }
  });

  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard");
}

export async function createTask(formData: FormData) {
  const session = await getAuth();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as string;
  const projectId = formData.get("projectId") as string;
  const assignedToId = formData.get("assignedToId") as string;
  
  await prisma.task.create({
    data: {
      title,
      description,
      priority,
      projectId,
      assignedToId: assignedToId === 'none' ? null : assignedToId,
    }
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/tasks");
}

export async function createDailyUpdate(formData: FormData) {
  const session = await getAuth();
  if (session.user.role !== 'DEVELOPER') throw new Error("Only developers can submit updates");

  const projectId = formData.get("projectId") as string;
  const completed = formData.get("completed") as string;
  const pending = formData.get("pending") as string;
  const blockers = formData.get("blockers") as string;
  const nextPlanned = formData.get("nextPlanned") as string;
  const hoursWorked = parseFloat(formData.get("hoursWorked") as string) || 0;

  await prisma.dailyUpdate.create({
    data: {
      completed,
      pending,
      blockers,
      nextPlanned,
      hoursWorked,
      projectId,
      developerId: session.user.id
    }
  });

  revalidatePath("/dashboard/updates");
}

export async function createClientRequest(formData: FormData) {
  const session = await getAuth();
  if (session.user.role !== 'CLIENT' && session.user.role !== 'ADMIN') {
    throw new Error("Forbidden");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const importance = formData.get("importance") as string;
  const projectId = formData.get("projectId") as string;

  await prisma.clientRequest.create({
    data: {
      title,
      description,
      importance,
      projectId,
      clientId: session.user.id
    }
  });

  revalidatePath("/dashboard/requests");
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function updateTaskStatus(taskId: string, status: string, projectId: string) {
  await getAuth();
  await prisma.task.update({
    where: { id: taskId },
    data: { status }
  });
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/tasks");
}

export async function sendMessage(formData: FormData) {
  const session = await getAuth();
  const content = formData.get("content") as string;
  if (!content || !content.trim()) return;

  await prisma.message.create({
    data: {
      content: content.trim(),
      authorId: session.user.id
    }
  });

  revalidatePath("/dashboard/discussion");
}

export async function assignDeveloperToProject(formData: FormData) {
  const session = await getAuth();
  if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') throw new Error("Forbidden");

  const projectId = formData.get("projectId") as string;
  const developerId = formData.get("developerId") as string;

  await prisma.projectDeveloper.create({
    data: {
      projectId,
      developerId
    }
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/projects");
}

export async function removeDeveloperFromProject(projectId: string, developerId: string) {
  const session = await getAuth();
  if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') throw new Error("Forbidden");

  await prisma.projectDeveloper.delete({
    where: {
      projectId_developerId: {
        projectId,
        developerId
      }
    }
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/projects");
}

export async function deleteProject(projectId: string) {
  const session = await getAuth();
  if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') throw new Error("Forbidden");

  await prisma.project.delete({
    where: { id: projectId }
  });

  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard");
}
