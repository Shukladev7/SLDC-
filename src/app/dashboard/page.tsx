import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FolderKanban, CheckSquare, Users, AlertCircle, Clock, LayoutDashboard } from "lucide-react";
import { TaskChart } from "@/components/dashboard/TaskChart";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const role = session.user.role;
  let projectCount = 0;
  let taskCount = 0;
  let userCount = 0;
  let rawTasks: { status: string }[] = [];
  let recentProjects: any[] = [];

  if (role === 'ADMIN' || role === 'MANAGER') {
    const [pCount, tCount, uCount, rTasks, rProjects] = await Promise.all([
      prisma.project.count(),
      prisma.task.count(),
      prisma.user.count(),
      prisma.task.findMany({ select: { status: true } }),
      prisma.project.findMany({ take: 3, orderBy: { updatedAt: 'desc' }, include: { tasks: true } })
    ]);
    projectCount = pCount;
    taskCount = tCount;
    userCount = uCount;
    rawTasks = rTasks;
    recentProjects = rProjects;
  } else if (role === 'DEVELOPER') {
    const [pCount, tCount, rTasks, devProjects] = await Promise.all([
      prisma.projectDeveloper.count({ where: { developerId: session.user.id } }),
      prisma.task.count({ where: { assignedToId: session.user.id } }),
      prisma.task.findMany({ where: { assignedToId: session.user.id }, select: { status: true } }),
      prisma.projectDeveloper.findMany({
        where: { developerId: session.user.id },
        include: { project: { include: { tasks: true } } },
        take: 3
      })
    ]);
    projectCount = pCount;
    taskCount = tCount;
    rawTasks = rTasks;
    recentProjects = devProjects.map(dp => dp.project);
  } else if (role === 'CLIENT') {
    const [pCount, rProjects] = await Promise.all([
      prisma.project.count({ where: { clientId: session.user.id } }),
      prisma.project.findMany({ where: { clientId: session.user.id }, take: 3, include: { tasks: true } })
    ]);
    projectCount = pCount;
    recentProjects = rProjects;
  }

  // Aggregate task statuses
  const statuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'BLOCKED'];
  const taskChartData = statuses.map(status => ({
    status,
    count: rawTasks.filter(t => t.status === status).length
  }));

  const activeTasks = rawTasks.filter(t => t.status !== 'COMPLETED').length;
  const blockedTasks = rawTasks.filter(t => t.status === 'BLOCKED').length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500">
          Welcome back, <span className="font-medium text-slate-700">{session.user.name}</span>. Here's what's happening with your projects today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Projects</CardTitle>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <FolderKanban className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{projectCount}</div>
            <p className="text-xs text-slate-500 mt-1">Total engaged projects</p>
          </CardContent>
        </Card>

        {role !== 'CLIENT' && (
          <>
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Tasks Pending</CardTitle>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <CheckSquare className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{activeTasks}</div>
                <p className="text-xs text-slate-500 mt-1">Total {taskCount} assigned</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Blocked Tasks</CardTitle>
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{blockedTasks}</div>
                <p className="text-xs text-slate-500 mt-1">Requires immediate attention</p>
              </CardContent>
            </Card>
          </>
        )}

        {(role === 'ADMIN' || role === 'MANAGER') && (
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Users className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{userCount}</div>
              <p className="text-xs text-slate-500 mt-1">Registered accounts</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {role !== 'CLIENT' && (
          <Card className="col-span-4 shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>Task Distribution</CardTitle>
              <CardDescription>Overview of task statuses across your workspace.</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <TaskChart data={taskChartData} />
            </CardContent>
          </Card>
        )}

        <Card className={role === 'CLIENT' ? "col-span-7" : "col-span-3"} >
          <CardHeader>
            <CardTitle>Active Projects Health</CardTitle>
            <CardDescription>Recent projects and their completion status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {recentProjects.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-8">No active projects found.</div>
            ) : (
              recentProjects.map(proj => {
                const total = proj.tasks.length;
                const completed = proj.tasks.filter((t: any) => t.status === 'COMPLETED').length;
                const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
                
                return (
                  <div key={proj.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">{proj.name}</span>
                      <span className="text-xs font-medium text-slate-500">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-slate-100" />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-slate-500">{completed} of {total} tasks</span>
                      <Badge variant="outline" className="text-[10px] font-normal">{proj.status}</Badge>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
