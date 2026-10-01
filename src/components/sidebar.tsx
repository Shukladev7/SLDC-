"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  MessageSquare,
  Users,
  Settings,
  Activity,
  FileText
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: string;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      roles: ["ADMIN", "MANAGER", "DEVELOPER", "CLIENT"],
    },
    {
      label: "Projects",
      icon: FolderKanban,
      href: "/dashboard/projects",
      roles: ["ADMIN", "MANAGER", "DEVELOPER", "CLIENT"],
    },
    {
      label: "Tasks",
      icon: CheckSquare,
      href: "/dashboard/tasks",
      roles: ["ADMIN", "MANAGER", "DEVELOPER"],
    },
    {
      label: "Daily Updates",
      icon: Activity,
      href: "/dashboard/updates",
      roles: ["ADMIN", "MANAGER", "DEVELOPER"],
    },
    {
      label: "Client Requests",
      icon: MessageSquare,
      href: "/dashboard/requests",
      roles: ["ADMIN", "MANAGER", "CLIENT"],
    },
    {
      label: "Discussion",
      icon: MessageSquare,
      href: "/dashboard/discussion",
      roles: ["ADMIN", "MANAGER", "DEVELOPER", "CLIENT"],
    },
    {
      label: "Users",
      icon: Users,
      href: "/dashboard/users",
      roles: ["ADMIN", "MANAGER"],
    },
    {
      label: "Reports",
      icon: FileText,
      href: "/dashboard/reports",
      roles: ["ADMIN", "MANAGER"],
    },
  ];

  const visibleRoutes = routes.filter(route => route.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          Tracker
        </div>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-1 px-3">
          {visibleRoutes.map((route) => {
            const isActive = pathname === route.href || (pathname.startsWith(`${route.href}/`) && route.href !== '/dashboard');
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out text-sm font-medium group",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <route.icon className={cn(
                  "w-4 h-4 transition-colors", 
                  isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {route.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t border-slate-100 text-xs text-slate-400 font-medium text-center">
        &copy; 2026 ProjectTracker UI
      </div>
    </aside>
  );
}
