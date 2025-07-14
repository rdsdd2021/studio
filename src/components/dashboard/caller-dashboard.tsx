import type { Assignment, Lead } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DispositionChart } from '@/components/dashboard/disposition-chart';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ArrowRight, CalendarClock, PhoneOutgoing } from 'lucide-react';
import { format, isToday, isFuture } from 'date-fns';

interface CallerDashboardProps {
    userId: string;
    leads: Lead[];
    assignments: Assignment[];
}

export function CallerDashboard({ userId, leads, assignments }: CallerDashboardProps) {

    const myAssignments = assignments.filter(a => a.userId === userId);
    const myLeadIds = new Set(myAssignments.map(a => a.mainDataRefId));
    const myLeads = leads.filter(l => myLeadIds.has(l.refId));

    const latestAssignments = new Map<string, Assignment>();
    myAssignments.forEach(assignment => {
        const existing = latestAssignments.get(assignment.mainDataRefId);
        if (!existing || new Date(assignment.assignedTime) > new Date(existing.assignedTime)) {
        latestAssignments.set(assignment.mainDataRefId, assignment);
        }
    });

    const myLatestAssignments = Array.from(latestAssignments.values());
    const myOpenLeadsCount = myLatestAssignments.filter(a => a.disposition === 'New').length;
    const myFollowUps = myLatestAssignments.filter(a => a.followUpDate && isFuture(new Date(a.followUpDate)));
    const todaysFollowUps = myFollowUps.filter(a => a.followUpDate && isToday(new Date(a.followUpDate))).length;

    const firstLeadId = myLeads[0]?.refId;

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">My Dashboard</h1>
                <p className="text-muted-foreground">Your personal overview and pending tasks.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Assigned Leads</CardTitle>
                        <PhoneOutgoing className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myLatestAssignments.length}</div>
                        <p className="text-xs text-muted-foreground">{myOpenLeadsCount} open leads pending disposition</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Follow-ups</CardTitle>
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myFollowUps.length}</div>
                        <p className="text-xs text-muted-foreground">{todaysFollowUps > 0 ? `${todaysFollowUps} scheduled for today` : "No follow-ups scheduled for today"}</p>
                    </CardContent>
                </Card>
                 <Card className="flex flex-col items-center justify-center bg-accent/50 border-dashed">
                    <CardContent className="pt-6 text-center">
                        {firstLeadId ? (
                            <Button asChild size="lg">
                                <Link href={`/leads/${firstLeadId}`}>
                                    Start Calling
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        ) : (
                            <p className="text-muted-foreground">No leads assigned yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>My Disposition Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                       <DispositionChart assignments={myAssignments} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Follow-ups</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {myFollowUps.length > 0 ? (
                             <ul className="space-y-4">
                                {myFollowUps.slice(0, 5).map(a => {
                                    const lead = myLeads.find(l => l.refId === a.mainDataRefId);
                                    return (
                                        <li key={a.id} className="flex items-center justify-between text-sm">
                                            <Link href={`/leads/${lead?.refId}`} className="font-medium hover:underline">{lead?.name}</Link>
                                            <span className="text-muted-foreground">{format(new Date(a.followUpDate!), 'PPP')}</span>
                                        </li>
                                    )
                                })}
                             </ul>
                        ): (
                            <p className="text-sm text-center text-muted-foreground py-8">No upcoming follow-ups.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
