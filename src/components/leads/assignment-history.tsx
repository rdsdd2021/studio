import type { Assignment } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{item.userName}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(item.assignedTime).toLocaleString()}
              </p>
            </div>
            {item.disposition && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant={item.disposition === "Interested" ? "default" : "secondary"} className={cn(item.disposition === "Interested" && "bg-green-600")}>{item.disposition}</Badge>
                {item.subDisposition && <span className="text-muted-foreground">&rarr; {item.subDisposition}</span>}
              </div>
            )}
            {item.remark && <p className="text-sm text-muted-foreground pt-1">{item.remark}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
