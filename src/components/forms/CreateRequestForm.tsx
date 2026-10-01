"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createClientRequest } from "@/app/actions";
import { Plus } from "lucide-react";

export function CreateRequestDialog({ projectId, projects }: { projectId?: string, projects?: any[] }) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    if (projectId) {
      formData.append("projectId", projectId);
    }
    await createClientRequest(formData);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 ${projectId ? 'h-8 rounded-md px-3 text-xs' : 'h-9 px-4 py-2'}`}>
          <Plus className="mr-2 h-4 w-4" /> New Request
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit New Request / Feedback</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input name="title" required placeholder="e.g. Add export to PDF feature" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea name="description" required placeholder="Detailed requirements..." className="h-24" />
          </div>
          {!projectId && (
            <div>
              <label className="text-sm font-medium">Project</label>
              <Select name="projectId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Importance</label>
            <Select name="importance" defaultValue="NORMAL">
              <SelectTrigger>
                <SelectValue placeholder="Select importance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="IMPORTANT">Important</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">Submit Request</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
