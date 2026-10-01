"use client";

import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateTaskStatus } from "@/app/actions";

export function UpdateTaskStatusSelect({ taskId, projectId, currentStatus, disabled }: { taskId: string, projectId: string, currentStatus: string, disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string | null) => {
    if (!newStatus) return;
    startTransition(async () => {
      await updateTaskStatus(taskId, newStatus, projectId);
    });
  };

  return (
    <Select defaultValue={currentStatus} onValueChange={handleStatusChange} disabled={disabled || isPending}>
      <SelectTrigger className="w-[130px] h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="TODO">Todo</SelectItem>
        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
        <SelectItem value="REVIEW">Review</SelectItem>
        <SelectItem value="COMPLETED">Completed</SelectItem>
        <SelectItem value="BLOCKED">Blocked</SelectItem>
      </SelectContent>
    </Select>
  );
}
