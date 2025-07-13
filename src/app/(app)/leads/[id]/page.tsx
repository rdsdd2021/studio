import { getLeadDetails, getAssignmentHistory, getLeads, getAssignments } from '@/actions/leads';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AssignmentHistory } from '@/components/leads/assignment-history';
import { UpdateDispositionForm } from '@/components/leads/update-disposition-form';
import { User, Phone, School, MapPin, Milestone, Calendar, Info, Pencil, UserCircle, CalendarDays } from 'lucide-react';
import type { Assignment, Lead } from '@/lib/types';
import { LeadDetailHeader } from '@/components/leads/lead-detail-header';
import { universalCustomFields, campaignCustomFields } from '@/lib/data';
import { UpdateCustomFieldForm } from '@/components/leads/update-custom-field-form';

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await getLeadDetails(params.id);
  if (!lead) {
    notFound();
  }

  const history = await getAssignmentHistory(params.id);
  
  // Mocking current user as a caller
  const currentUserId = 'usr_3'; 
  const currentUserRole = 'caller';

  // To find the next lead, we need the full list of "My Leads"
  const allLeads = await getLeads();
  const allAssignments = await getAssignments();

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

  const relevantCampaignFields = lead.campaign ? campaignCustomFields[lead.campaign] || [] : [];
  const allCustomFieldsForLead = [...universalCustomFields, ...relevantCampaignFields];
  const hasCustomFields = allCustomFieldsForLead.length > 0;

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
          
          {hasCustomFields && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Caller can fill in any empty fields.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 text-sm">
                  {allCustomFieldsForLead.map((fieldName) => {
                    const fieldData = lead.customFields?.[fieldName];
                    const isEditable = !fieldData?.value;

                    return (
                      <div className="space-y-1.5" key={fieldName}>
                        <label className="font-medium text-muted-foreground flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          {fieldName}
                        </label>
                        {isEditable ? (
                           <UpdateCustomFieldForm 
                              leadId={lead.refId}
                              fieldName={fieldName}
                              currentUserId={currentUserId}
                            />
                        ) : (
                          <div>
                            <p className="font-semibold text-base px-3 py-2 bg-muted rounded-md">{fieldData.value}</p>
                             <div className="flex items-center justify-end text-xs text-muted-foreground gap-4 pt-1 pr-1">
                                <div className="flex items-center gap-1"><UserCircle className="h-3 w-3" /> {fieldData.updatedBy}</div>
                                <div className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {new Date(fieldData.updatedAt!).toLocaleDateString()}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

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
