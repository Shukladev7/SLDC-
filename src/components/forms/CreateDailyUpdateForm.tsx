"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createDailyUpdate } from "@/app/actions";
import { Plus } from "lucide-react";

export function CreateDailyUpdateDialog({ projects }: { projects: any[] }) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    await createDailyUpdate(formData);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
          <Plus className="mr-2 h-4 w-4" /> Submit Update
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Submit Daily Update</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium">Project</label>
            <Select name="projectId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Completed Today</label>
              <Textarea name="completed" required placeholder="What did you finish?" className="h-24" />
            </div>
            <div>
              <label className="text-sm font-medium">Pending / Next Planned</label>
              <Textarea name="nextPlanned" required placeholder="What are you doing next?" className="h-24" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-red-700">Blockers (Optional)</label>
            <Textarea name="blockers" placeholder="Any issues blocking progress?" />
          </div>
          <div>
            <label className="text-sm font-medium">Hours Worked</label>
            <Input name="hoursWorked" type="number" step="0.5" required placeholder="8" />
          </div>
          <Button type="submit" className="w-full">Submit Update</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
