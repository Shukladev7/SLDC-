import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateRequestDialog } from "@/components/forms/CreateRequestForm";
import { MessageSquare, LayoutList, Calendar, AlertCircle } from "lucide-react";

const prisma = new PrismaClient();

export default async function RequestsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  let requests: any[] = [];
  let clientProjects: any[] = [];

  if (session.user.role === 'ADMIN') {
    const [reqs, projs] = await Promise.all([
      prisma.clientRequest.findMany({ include: { client: true, project: true }, orderBy: { createdAt: 'desc' } }),
      prisma.project.findMany()
    ]);
    requests = reqs;
    clientProjects = projs;
  } else if (session.user.role === 'MANAGER') {
    requests = await prisma.clientRequest.findMany({ include: { client: true, project: true }, orderBy: { createdAt: 'desc' } });
  } else if (session.user.role === 'CLIENT') {
    const [reqs, projs] = await Promise.all([
      prisma.clientRequest.findMany({ where: { clientId: session.user.id }, include: { project: true }, orderBy: { createdAt: 'desc' } }),
      prisma.project.findMany({ where: { clientId: session.user.id } })
    ]);
    requests = reqs;
    clientProjects = projs;
  }

  const getImportanceColor = (imp: string) => {
    switch (imp) {
      case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'COMPLETED' || status === 'IMPLEMENTED') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'IN_PROGRESS') return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Client Requests</h1>
          <p className="text-slate-500 mt-2">Manage feedback, issues, and new requirements.</p>
        </div>
        {(session.user.role === 'ADMIN' || session.user.role === 'CLIENT') && (
          <div className="shrink-0">
            <CreateRequestDialog projects={clientProjects} />
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {requests.map(req => (
          <Card key={req.id} className="flex flex-col border-slate-200 hover:shadow-lg transition-all duration-200 group">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-3 gap-2">
                <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${getImportanceColor(req.importance)}`}>
                  {req.importance}
                </Badge>
                <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${getStatusColor(req.status)}`}>
                  {req.status}
                </Badge>
              </div>
              <CardTitle className="text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                {req.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="mt-auto pt-0 flex flex-col flex-1">
              <p className="text-sm text-slate-600 line-clamp-4 leading-relaxed mb-6 flex-1">
                {req.description}
              </p>
              
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center text-xs font-medium text-slate-500 gap-2">
                  <LayoutList className="w-3.5 h-3.5" />
                  <span className="truncate">{req.project.name}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {req.client && session.user.role !== 'CLIENT' && (
                    <span className="text-slate-400">By {req.client.name}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {requests.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <MessageSquare className="w-12 h-12 mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900">No requests</h3>
            <p className="text-sm mt-1">There are no client requests in the system.</p>
          </div>
        )}
      </div>
    </div>
  );
}
