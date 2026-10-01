"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, X } from "lucide-react";
import { assignDeveloperToProject, removeDeveloperFromProject } from "@/app/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AssignDeveloperDialog({ 
  projectId, 
  allDevelopers, 
  currentDevelopers 
}: { 
  projectId: string;
  allDevelopers: { id: string, name: string }[];
  currentDevelopers: { id: string, name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedDev, setSelectedDev] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const availableDevelopers = allDevelopers.filter(
    dev => !currentDevelopers.some(cd => cd.id === dev.id)
  );

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDev) return;
    setIsUpdating(true);
    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("developerId", selectedDev);
    await assignDeveloperToProject(formData);
    setSelectedDev("");
    setIsUpdating(false);
  };

  const handleRemove = async (devId: string) => {
    setIsUpdating(true);
    await removeDeveloperFromProject(projectId, devId);
    setIsUpdating(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <UserPlus className="w-4 h-4" />
        Manage Team
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Developers</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Current Developers</h4>
            <div className="flex flex-col gap-2">
              {currentDevelopers.map(dev => (
                <div key={dev.id} className="flex items-center justify-between bg-slate-50 p-2 rounded border">
                  <span className="text-sm">{dev.name}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemove(dev.id)}
                    disabled={isUpdating}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {currentDevelopers.length === 0 && (
                <p className="text-sm text-muted-foreground">No developers assigned.</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Assign New Developer</h4>
            <form onSubmit={handleAssign} className="flex gap-2">
              <Select value={selectedDev} onValueChange={(v) => setSelectedDev(v || "")} disabled={isUpdating}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a developer" />
                </SelectTrigger>
                <SelectContent>
                  {availableDevelopers.map(dev => (
                    <SelectItem key={dev.id} value={dev.id}>{dev.name}</SelectItem>
                  ))}
                  {availableDevelopers.length === 0 && (
                    <SelectItem value="none" disabled>No available developers</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button type="submit" disabled={isUpdating || !selectedDev || selectedDev === "none"}>
                Assign
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
      </Dialog>
    </>
  );
}
