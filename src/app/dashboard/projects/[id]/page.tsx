import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { CreateTaskDialog } from "@/components/forms/CreateTaskForm";
import { CreateRequestDialog } from "@/components/forms/CreateRequestForm";
import { UpdateTaskStatusSelect } from "@/components/forms/UpdateTaskStatusSelect";
import { DeleteProjectButton } from "@/components/forms/DeleteProjectButton";
import { AssignDeveloperDialog } from "@/components/forms/AssignDeveloperDialog";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const prisma = new PrismaClient();

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const resolvedParams = await params;

  const [project, allDevelopers] = await Promise.all([
    prisma.project.findUnique({
      where: { id: resolvedParams.id },
      include: {
        manager: true,
        client: true,
        developers: {
          include: { developer: true }
        },
        tasks: {
          include: { assignedTo: true },
          orderBy: { updatedAt: 'desc' },
          take: 10
        },
        clientRequests: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    }),
    (session.user.role === 'ADMIN' || session.user.role === 'MANAGER') 
      ? prisma.user.findMany({ where: { role: 'DEVELOPER' }, select: { id: true, name: true } }) 
      : Promise.resolve([])
  ]);

  if (!project) return notFound();

  // Basic authorization check - ideally more robust in prod
  if (session.user.role === 'DEVELOPER' && !project.developers.find(d => d.developerId === session.user.id)) return notFound();
  if (session.user.role === 'CLIENT' && project.clientId !== session.user.id) return notFound();

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t: any) => t.status === 'COMPLETED').length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Premium Header */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 p-6 md:p-8 text-white shadow-lg overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors">
                {project.status}
              </Badge>
              <Badge variant={project.priority === 'HIGH' ? 'destructive' : 'secondary'} className={project.priority === 'HIGH' ? "bg-red-500/90 text-white border-none" : "bg-white/10 text-white border-white/20"}>
                {project.priority} Priority
              </Badge>
            </div>
            
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-2">{project.name}</h1>
              <p className="text-slate-300 text-lg leading-relaxed">{project.description}</p>
            </div>
          </div>
          
          {(session.user.role === 'ADMIN' || session.user.role === 'MANAGER') && (
            <div className="shrink-0">
              <DeleteProjectButton projectId={project.id} />
            </div>
          )}
        </div>
        
        {/* Progress Bar inside Header */}
        <div className="relative z-10 mt-8 bg-black/20 p-4 rounded-xl border border-white/10">
          <div className="flex justify-between items-center mb-2 text-sm font-medium">
            <span className="text-slate-300">Project Progress</span>
            <span className="text-white">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2.5 bg-white/10 [&>div]:bg-indigo-400" />
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="requests">Client Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Team</CardTitle>
                {(session.user.role === 'ADMIN' || session.user.role === 'MANAGER') && (
                  <AssignDeveloperDialog 
                    projectId={project.id} 
                    allDevelopers={allDevelopers} 
                    currentDevelopers={project.developers.map(d => ({ id: d.developer.id, name: d.developer.name }))} 
                  />
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Manager</span>
                    <span className="text-sm text-muted-foreground">{project.manager?.name || 'None'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Client</span>
                    <span className="text-sm text-muted-foreground">{project.client?.name || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium block mb-2">Developers</span>
                    <div className="flex flex-wrap gap-2">
                      {project.developers.map(d => (
                        <Badge key={d.developerId} variant="secondary">{d.developer.name}</Badge>
                      ))}
                      {project.developers.length === 0 && <span className="text-sm text-muted-foreground">None assigned</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.tasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.assignedTo?.name || 'Unassigned'}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{task.status}</Badge>
                    </div>
                  ))}
                  {project.tasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks yet.</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>All Tasks</CardTitle>
              </div>
              <div>
                <CreateTaskDialog projectId={project.id} developers={project.developers.map(d => d.developer)} />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assignee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.tasks.map(task => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        <UpdateTaskStatusSelect 
                          taskId={task.id} 
                          projectId={project.id} 
                          currentStatus={task.status} 
                          disabled={session.user.role === 'CLIENT'}
                        />
                      </TableCell>
                      <TableCell>{task.priority}</TableCell>
                      <TableCell>{task.assignedTo?.name || 'Unassigned'}</TableCell>
                    </TableRow>
                  ))}
                  {project.tasks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground h-24">No tasks found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Client Requests</CardTitle>
              </div>
              {(session.user.role === 'ADMIN' || session.user.role === 'CLIENT') && (
                <CreateRequestDialog projectId={project.id} />
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Importance</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.clientRequests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.title}</TableCell>
                      <TableCell><Badge variant="outline">{req.status}</Badge></TableCell>
                      <TableCell>{req.importance}</TableCell>
                      <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {project.clientRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground h-24">No requests found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
