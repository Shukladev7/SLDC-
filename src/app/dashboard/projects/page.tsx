import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CreateProjectDialog } from "@/components/forms/CreateProjectForm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Briefcase, Users, LayoutList } from "lucide-react";

const prisma = new PrismaClient();

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const clients = await prisma.user.findMany({ where: { role: 'CLIENT' } });
  const managers = await prisma.user.findMany({ where: { role: 'MANAGER' } });

  let projects: any[] = [];

  const includeConfig = {
    manager: true,
    client: true,
    tasks: { select: { status: true } },
    developers: { include: { developer: true } }
  };

  if (session.user.role === 'ADMIN' || session.user.role === 'MANAGER') {
    projects = await prisma.project.findMany({ include: includeConfig, orderBy: { updatedAt: 'desc' } });
  } else if (session.user.role === 'DEVELOPER') {
    const devProjects = await prisma.projectDeveloper.findMany({
      where: { developerId: session.user.id },
      include: { project: { include: includeConfig } },
      orderBy: { project: { updatedAt: 'desc' } }
    });
    projects = devProjects.map(dp => dp.project);
  } else if (session.user.role === 'CLIENT') {
    projects = await prisma.project.findMany({
      where: { clientId: session.user.id },
      include: includeConfig,
      orderBy: { updatedAt: 'desc' }
    });
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ON_HOLD': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-2">Manage and monitor all your active engagements.</p>
        </div>
        {(session.user.role === 'ADMIN' || session.user.role === 'MANAGER') && (
          <CreateProjectDialog clients={clients} managers={managers} />
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map(project => {
          const totalTasks = project.tasks.length;
          const completedTasks = project.tasks.filter((t: any) => t.status === 'COMPLETED').length;
          const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

          return (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="group block h-full">
              <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-200 border-slate-200 group-hover:border-indigo-200">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {project.name}
                    </CardTitle>
                    <Badge className={getStatusColor(project.status)} variant="outline">
                      {project.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-2 h-10">{project.description}</p>
                </CardHeader>
                <CardContent className="mt-auto pt-0">
                  <div className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Progress</span>
                        <span className="font-medium text-slate-700">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-slate-100" />
                    </div>
                    
                    {/* Stats & Avatars */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <LayoutList className="w-4 h-4 text-slate-400" />
                          <span>{totalTasks}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span>{project.developers.length}</span>
                        </div>
                      </div>
                      
                      {/* Team Avatars */}
                      <div className="flex -space-x-2">
                        {project.manager && (
                          <Avatar className="w-7 h-7 border-2 border-white" title={`Manager: ${project.manager.name}`}>
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-[10px]">{project.manager.name[0]}</AvatarFallback>
                          </Avatar>
                        )}
                        {project.client && (
                          <Avatar className="w-7 h-7 border-2 border-white" title={`Client: ${project.client.name}`}>
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-[10px]">{project.client.name[0]}</AvatarFallback>
                          </Avatar>
                        )}
                        {project.developers.slice(0, 3).map((d: any) => (
                          <Avatar key={d.developerId} className="w-7 h-7 border-2 border-white" title={`Dev: ${d.developer.name}`}>
                            <AvatarFallback className="bg-slate-100 text-slate-700 text-[10px]">{d.developer.name[0]}</AvatarFallback>
                          </Avatar>
                        ))}
                        {project.developers.length > 3 && (
                          <Avatar className="w-7 h-7 border-2 border-white">
                            <AvatarFallback className="bg-slate-50 text-slate-500 text-[10px]">+{project.developers.length - 3}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {projects.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <Briefcase className="w-12 h-12 mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900">No projects found</h3>
            <p className="text-sm mt-1">Get started by creating a new project.</p>
          </div>
        )}
      </div>
    </div>
  );
}
