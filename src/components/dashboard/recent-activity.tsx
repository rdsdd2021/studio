'use client';
import * as React from 'react';
import type { Assignment } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
    assignments: Assignment[];
}

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('');
}

const dispositionColors: Record<string, string> = {
    'Interested': 'bg-green-500',
    'Not Interested': 'bg-red-500',
    'Follow-up': 'bg-yellow-500',
    'Callback': 'bg-blue-500',
    'Not Reachable': 'bg-gray-400',
    'New': 'bg-purple-500',
}

function FormattedDate({ dateString }: { dateString: string }) {
    const [formattedDate, setFormattedDate] = React.useState('');

    React.useEffect(() => {
        setFormattedDate(new Date(dateString).toLocaleString());
    }, [dateString]);

    return <>{formattedDate}</>;
}


export function RecentActivity({ assignments }: RecentActivityProps) {

    const recentAssignments = assignments
        .filter(a => a.disposition && a.disposition !== 'New')
        .sort((a, b) => new Date(b.dispositionTime!).getTime() - new Date(a.dispositionTime!).getTime())
        .slice(0, 5);

    if (recentAssignments.length === 0) {
        return <p className="text-sm text-muted-foreground">No recent dispositions to show.</p>
    }

    return (
        <div className="space-y-6">
            {recentAssignments.map((assignment) => {
                return (
                    <div key={assignment.id} className="flex items-start gap-4">
                        <Avatar className="h-9 w-9">
                            {/* In a real app, you might fetch the user's avatar separately if not included in the assignment data */}
                            <AvatarImage src={`https://placehold.co/32x32.png`} alt={assignment.userName} />
                            <AvatarFallback>{getInitials(assignment.userName)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1 text-sm">
                            <p className="font-medium">
                                {assignment.userName}
                                <span className="font-normal text-muted-foreground"> updated lead </span> 
                                <span className="font-medium text-primary">{assignment.mainDataRefId}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className={cn("capitalize text-white", dispositionColors[assignment.disposition!] || 'bg-gray-500')}>
                                    {assignment.disposition}
                                </Badge>
                                {assignment.subDisposition && <span className="text-muted-foreground">&rarr; {assignment.subDisposition}</span>}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {assignment.dispositionTime && <FormattedDate dateString={assignment.dispositionTime} />}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
