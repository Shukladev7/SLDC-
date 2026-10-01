import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateTaskDialog } from "@/components/forms/CreateTaskForm";
import { UpdateTaskStatusSelect } from "@/components/forms/UpdateTaskStatusSelect";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, CheckCircle2, Circle, LayoutList, CheckSquare } from "lucide-react";

const prisma = new PrismaClient();

export default async function TasksPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  let tasks: any[] = [];
  const includeConfig = { project: true, assignedTo: true };

  if (session.user.role === 'ADMIN' || session.user.role === 'MANAGER') {
    tasks = await prisma.task.findMany({ include: includeConfig, orderBy: { dueDate: 'asc' } });
  } else if (session.user.role === 'DEVELOPER') {
    tasks = await prisma.task.findMany({ where: { assignedToId: session.user.id }, include: includeConfig, orderBy: { dueDate: 'asc' } });
  } else if (session.user.role === 'CLIENT') {
    tasks = await prisma.task.findMany({ where: { project: { clientId: session.user.id } }, include: includeConfig, orderBy: { dueDate: 'asc' } });
  }

  let allProjects: any[] = [];
  let allDevelopers: any[] = await prisma.user.findMany({ where: { role: 'DEVELOPER' } });
  
  if (session.user.role === 'ADMIN' || session.user.role === 'MANAGER') {
    allProjects = await prisma.project.findMany();
  } else if (session.user.role === 'DEVELOPER') {
    const devProjects = await prisma.projectDeveloper.findMany({ where: { developerId: session.user.id }, include: { project: true } });
    allProjects = devProjects.map(p => p.project);
  } else if (session.user.role === 'CLIENT') {
    allProjects = await prisma.project.findMany({ where: { clientId: session.user.id } });
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'LOW': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tasks</h1>
          <p className="text-slate-500 mt-2">Manage and track your assigned work across all projects.</p>
        </div>
        <div className="shrink-0">
          <CreateTaskDialog projects={allProjects} developers={allDevelopers} />
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map(task => {
          const isCompleted = task.status === 'COMPLETED';
          const isBlocked = task.status === 'BLOCKED';
          
          return (
            <Card key={task.id} className={`transition-all duration-200 hover:shadow-md border-l-4 ${isCompleted ? 'border-l-emerald-500 opacity-60 hover:opacity-100' : isBlocked ? 'border-l-red-500' : 'border-l-indigo-500'}`}>
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <Circle className="w-5 h-5 text-slate-300 shrink-0" />}
                    <h3 className={`font-semibold text-lg ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {task.title}
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 ml-7">
                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md text-xs font-medium">
                      <LayoutList className="w-3 h-3" /> {task.project.name}
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> 
                        {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                    <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:justify-end gap-4 sm:w-[280px] shrink-0 ml-7 sm:ml-0">
                  <div className="w-full sm:w-auto">
                    <UpdateTaskStatusSelect 
                      taskId={task.id} 
                      projectId={task.projectId} 
                      currentStatus={task.status} 
                      disabled={session.user.role === 'CLIENT'}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 hidden sm:flex">
                    <Avatar className="w-8 h-8 border border-slate-200" title={task.assignedTo?.name || 'Unassigned'}>
                      <AvatarFallback className="bg-indigo-50 text-indigo-700 text-xs font-medium">
                        {task.assignedTo?.name?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

              </CardContent>
            </Card>
          );
        })}

        {tasks.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <CheckSquare className="w-12 h-12 mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900">You're all caught up!</h3>
            <p className="text-sm mt-1">No tasks assigned to you right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
