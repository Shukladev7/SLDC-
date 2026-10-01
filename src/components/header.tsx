"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, Bell, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header({ user }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/70 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center md:hidden">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5 text-slate-600" />
        </Button>
      </div>
      
      <div className="hidden md:flex flex-1" />

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 rounded-full">
          <Bell className="w-5 h-5 text-slate-500" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all">
            <Avatar className="h-9 w-9 border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
              <AvatarFallback className="bg-indigo-50 text-indigo-700 font-medium">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-slate-200">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col space-y-1.5">
                  <p className="text-sm font-semibold leading-none text-slate-900">{user.name}</p>
                  <p className="text-xs leading-none text-slate-500">
                    {user.email || 'No email provided'}
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 capitalize">
                      {user.role.toLowerCase()}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem className="cursor-pointer text-slate-600 hover:text-slate-900 focus:bg-slate-50 rounded-md">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-slate-600 hover:text-slate-900 focus:bg-slate-50 rounded-md">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem 
              className="cursor-pointer text-red-600 hover:text-red-700 focus:bg-red-50 rounded-md"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
