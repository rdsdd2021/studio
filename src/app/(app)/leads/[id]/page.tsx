import { getLeadDetails, getAssignmentHistory, getLeads, getAssignments } from '@/actions/leads';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AssignmentHistory } from '@/components/leads/assignment-history';
import { UpdateDispositionForm } from '@/components/leads/update-disposition-form';
import { User, Phone, School, MapPin, Milestone, Calendar } from 'lucide-react';
import type { Assignment, Lead } from '@/lib/types';
import { LeadDetailHeader } from '@/components/leads/lead-detail-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await getLeadDetails(params.id);
  if (!lead) {
    notFound();
  }

  const history = await getAssignmentHistory(params.id);
  
  // To find the next lead, we need the full list of "My Leads"
  const allLeads = await getLeads();
  const allAssignments = await getAssignments();
  const currentUserId = 'usr_3'; // Mocked user

  const latestAssignments = new Map<string, Assignment>();
  allAssignments.forEach(assignment => {
    const existing = latestAssignments.get(assignment.mainDataRefId);
    if (!existing || new Date(assignment.assignedTime) > new Date(existing.assignedTime)) {
      latestAssignments.set(assignment.mainDataRefId, assignment);
    }
  });

  const myLeadAssignments = Array.from(latestAssignments.values()).filter(
    (a) => a.userId === currentUserId
  );
  
  const myLeadIds = new Set(myLeadAssignments.map(a => a.mainDataRefId));
  const myLeads = allLeads.filter(l => myLeadIds.has(l.refId));

  const currentIndex = myLeads.findIndex(l => l.refId === params.id);
  const previousLeadId = currentIndex > 0 ? myLeads[currentIndex - 1].refId : undefined;
  const nextLeadId = currentIndex < myLeads.length - 1 ? myLeads[currentIndex + 1].refId : undefined;


  // Mocking the current user as a caller
  const currentUserRole = 'caller';

  return (
    <div className="flex flex-col gap-8">
      <LeadDetailHeader 
        leadName={lead.name}
        leadId={lead.refId}
        previousLeadId={previousLeadId}
        nextLeadId={nextLeadId}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Gender</p>
                    <p className="font-medium">{lead.gender}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <div className="flex items-center gap-2">
                        <p className="font-medium">{lead.phone}</p>
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                            <a href={`tel:${lead.phone}`}>
                                <Phone className="h-4 w-4" />
                                <span className="sr-only">Call lead</span>
                            </a>
                        </Button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <School className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">School</p>
                    <p className="font-medium">{lead.school}</p>
                  </div>
                </div>
                 <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Locality</p>
                    <p className="font-medium">{lead.locality}</p>
                  </div>
                </div>
                 <div className="flex items-center gap-3">
                  <Milestone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">District</p>
                    <p className="font-medium">{lead.district}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                   <div>
                    <p className="text-muted-foreground">Created On</p>
                    <p className="font-medium">{new Date(lead.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Assignment History</CardTitle>
                <CardDescription>Full history of assignments and dispositions for this lead.</CardDescription>
            </CardHeader>
            <CardContent>
                <AssignmentHistory history={history} />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          {currentUserRole === 'caller' && (
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
                <CardDescription>Log the outcome of your call.</CardDescription>
              </CardHeader>
              <CardContent>
                <UpdateDispositionForm leadId={lead.refId} history={history} myLeads={myLeads} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
