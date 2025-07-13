import type { Assignment } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Calendar, Clock } from "lucide-react";

interface AssignmentHistoryProps {
  history: Assignment[];
}

export function AssignmentHistory({ history }: AssignmentHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No assignment history found for this lead.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {history.map((item, index) => (
        <div key={item.id} className="relative pl-8">
          <div className="absolute left-3 top-1.5 h-full w-px bg-border"></div>
          <div className={cn(
              "absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground",
               index !== 0 && "bg-secondary text-secondary-foreground"
          )}>
            <span className="text-xs font-bold">{history.length - index}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{item.userName}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(item.assignedTime).toLocaleString()}
              </div>
            </div>
            {item.disposition && (
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <Badge variant={item.disposition === "Interested" ? "default" : "secondary"} className={cn(item.disposition === "Interested" && "bg-green-600")}>{item.disposition}</Badge>
                {item.subDisposition && <span className="text-muted-foreground">&rarr; {item.subDisposition}</span>}
              </div>
            )}
            {item.remark && <p className="text-sm text-muted-foreground pt-1">{item.remark}</p>}
             {(item.followUpDate || item.scheduleDate) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs pt-1">
                {item.followUpDate && (
                  <div className="flex items-center gap-1.5 text-blue-600 font-medium bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                    <Calendar className="h-3 w-3" />
                    <span>Follow-up: {new Date(item.followUpDate).toLocaleDateString()}</span>
                  </div>
                )}
                 {item.scheduleDate && (
                  <div className="flex items-center gap-1.5 text-green-600 font-medium bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                    <Calendar className="h-3 w-3" />
                    <span>Scheduled: {new Date(item.scheduleDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
