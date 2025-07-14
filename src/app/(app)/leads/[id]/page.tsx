
'use client';

import * as React from 'react';
import { getLeadDetails, getAssignmentHistory, getLeads, getAssignments } from '@/actions/leads';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AssignmentHistory } from '@/components/leads/assignment-history';
import { UpdateDispositionForm } from '@/components/leads/update-disposition-form';
import { User, Phone, School, MapPin, Milestone, Calendar, Info, Pencil, UserCircle, CalendarDays } from 'lucide-react';
import type { Assignment, Lead } from '@/lib/types';
import { LeadDetailHeader } from '@/components/leads/lead-detail-header';
import { getUniversalCustomFields, getCampaignCustomFields } from '@/actions/settings';
import { UpdateCustomFieldForm } from '@/components/leads/update-custom-field-form';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);
  const [pageData, setPageData] = React.useState<{
    lead: Lead;
    history: Assignment[];
    previousLeadId?: string;
    nextLeadId?: string;
    allCustomFieldsForLead: string[];
  } | null>(null);

  React.useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      const lead = await getLeadDetails(params.id);
      if (!lead) {
        setIsLoading(false);
        return; // will be handled by notFound outside effect
      }
      
      const [
        history, 
        allLeads, 
        allAssignments, 
        universalCustomFields, 
        campaignCustomFields
      ] = await Promise.all([
        getAssignmentHistory(params.id),
        getLeads(),
        getAssignments(),
        getUniversalCustomFields(),
        getCampaignCustomFields(),
      ]);
      
      const latestAssignments = new Map<string, Assignment>();
      allAssignments.forEach(assignment => {
        const existing = latestAssignments.get(assignment.mainDataRefId);
        if (!existing || new Date(assignment.assignedTime) > new Date(existing.assignedTime)) {
          latestAssignments.set(assignment.mainDataRefId, assignment);
        }
      });

      const myLeadAssignments = Array.from(latestAssignments.values()).filter(a => a.userId === user.id);
      const myLeadIds = new Set(myLeadAssignments.map(a => a.mainDataRefId));
      const myLeads = allLeads.filter(l => myLeadIds.has(l.refId));

      const currentIndex = myLeads.findIndex(l => l.refId === params.id);
      const previousLeadId = currentIndex > 0 ? myLeads[currentIndex - 1].refId : undefined;
      const nextLeadId = currentIndex < myLeads.length - 1 ? myLeads[currentIndex + 1].refId : undefined;
      
      const relevantCampaignFields = lead.campaigns?.flatMap(c => campaignCustomFields[c] || []) || [];
      const allCustomFieldsForLead = [...universalCustomFields, ...relevantCampaignFields];
      
      setPageData({
        lead,
        history,
        previousLeadId,
        nextLeadId,
        allCustomFieldsForLead,
      });

      setIsLoading(false);
    };

    fetchData();
  }, [params.id, user]);

  if (isLoading) {
    return <Skeleton className="w-full h-[600px]" />;
  }

  if (!pageData?.lead) {
    notFound();
  }

  const { lead, history, previousLeadId, nextLeadId, allCustomFieldsForLead } = pageData;
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
                    const isEditable = !fieldData?.value && user?.role === 'caller';

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
                            />
                        ) : (
                          <div>
                            <p className="font-semibold text-base px-3 py-2 bg-muted rounded-md">{fieldData?.value || 'N/A'}</p>
                             {fieldData?.updatedBy && (
                                <div className="flex items-center justify-end text-xs text-muted-foreground gap-4 pt-1 pr-1">
                                    <div className="flex items-center gap-1"><UserCircle className="h-3 w-3" /> {fieldData.updatedBy}</div>
                                    <div className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {new Date(fieldData.updatedAt!).toLocaleDateString()}</div>
                                </div>
                             )}
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
          {user?.role === 'caller' && (
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
