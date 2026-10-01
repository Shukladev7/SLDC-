import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateDailyUpdateDialog } from "@/components/forms/CreateDailyUpdateForm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, AlertTriangle, CheckCircle2, CircleDashed, LayoutList } from "lucide-react";

const prisma = new PrismaClient();

export default async function UpdatesPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  let updates: any[] = [];

  if (session.user.role === 'ADMIN' || session.user.role === 'MANAGER') {
    updates = await prisma.dailyUpdate.findMany({
      include: { developer: true, project: true },
      orderBy: { date: 'desc' }
    });
  } else if (session.user.role === 'DEVELOPER') {
    updates = await prisma.dailyUpdate.findMany({
      where: { developerId: session.user.id },
      include: { project: true, developer: true },
      orderBy: { date: 'desc' }
    });
  }

  let devProjects: any[] = [];
  if (session.user.role === 'DEVELOPER') {
    const projects = await prisma.projectDeveloper.findMany({
      where: { developerId: session.user.id },
      include: { project: true }
    });
    devProjects = projects.map(p => p.project);
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Activity & Updates</h1>
          <p className="text-slate-500 mt-2">Track daily progress, achievements, and blockers.</p>
        </div>
        {session.user.role === 'DEVELOPER' && (
          <div className="shrink-0">
            <CreateDailyUpdateDialog projects={devProjects} />
          </div>
        )}
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute top-0 bottom-0 left-6 sm:left-8 w-0.5 bg-slate-200" />
        
        <div className="space-y-8">
          {updates.map((update, idx) => (
            <div key={update.id} className="relative flex items-start gap-4 sm:gap-6 group">
              {/* Timeline dot */}
              <div className="relative z-10 w-12 sm:w-16 flex justify-center shrink-0">
                <div className="w-10 h-10 rounded-full bg-white border-[3px] border-indigo-100 flex items-center justify-center group-hover:border-indigo-300 transition-colors shadow-sm">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-indigo-50 text-indigo-700 text-xs font-semibold">
                      {update.developer?.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Content Card */}
              <div className="flex-1 min-w-0">
                <Card className="shadow-sm border-slate-200 group-hover:shadow-md transition-shadow">
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                          {update.developer?.name || 'You'}
                          <span className="text-slate-400 font-normal text-sm">posted an update</span>
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                          <span className="flex items-center gap-1"><LayoutList className="w-3.5 h-3.5" /> {update.project.name}</span>
                          <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {new Date(update.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="w-fit text-[10px] uppercase font-bold tracking-wider bg-slate-50 text-slate-600">
                        {update.status}
                      </Badge>
                    </div>

                    <div className="space-y-4 text-sm mt-4 pt-4 border-t border-slate-100">
                      <div>
                        <h4 className="font-medium text-emerald-700 flex items-center gap-2 mb-1.5">
                          <CheckCircle2 className="w-4 h-4" /> What I completed
                        </h4>
                        <p className="text-slate-600 whitespace-pre-wrap pl-6 leading-relaxed">{update.completed}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-indigo-700 flex items-center gap-2 mb-1.5">
                          <CircleDashed className="w-4 h-4" /> What's next
                        </h4>
                        <p className="text-slate-600 whitespace-pre-wrap pl-6 leading-relaxed">{update.nextPlanned}</p>
                      </div>

                      {update.blockers && (
                        <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 mt-4">
                          <h4 className="font-medium text-red-700 flex items-center gap-2 mb-1.5">
                            <AlertTriangle className="w-4 h-4" /> Blockers
                          </h4>
                          <p className="text-red-900/80 whitespace-pre-wrap pl-6 leading-relaxed">{update.blockers}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ))}

          {updates.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 ml-12 sm:ml-16">
              <CalendarDays className="w-12 h-12 mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-900">No updates yet</h3>
              <p className="text-sm mt-1">Daily updates will appear here on a timeline.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
