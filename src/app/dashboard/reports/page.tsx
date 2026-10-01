import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  
  if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
    redirect('/dashboard');
  }

  const projectStats = await prisma.project.groupBy({
    by: ['status'],
    _count: { id: true }
  });

  const taskStats = await prisma.task.groupBy({
    by: ['status'],
    _count: { id: true }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-2">High-level overview and analytics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Projects by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {projectStats.map(stat => (
                <div key={stat.status} className="flex justify-between items-center">
                  <span className="font-medium text-sm">{stat.status}</span>
                  <span className="text-muted-foreground">{stat._count.id}</span>
                </div>
              ))}
              {projectStats.length === 0 && <span className="text-sm text-muted-foreground">No data.</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {taskStats.map(stat => (
                <div key={stat.status} className="flex justify-between items-center">
                  <span className="font-medium text-sm">{stat.status}</span>
                  <span className="text-muted-foreground">{stat._count.id}</span>
                </div>
              ))}
              {taskStats.length === 0 && <span className="text-sm text-muted-foreground">No data.</span>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
