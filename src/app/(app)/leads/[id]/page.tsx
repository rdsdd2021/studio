import { getLeadDetails, getAssignmentHistory } from '@/actions/leads';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AssignmentHistory } from '@/components/leads/assignment-history';
import { UpdateDispositionForm } from '@/components/leads/update-disposition-form';
import { User, Phone, School, MapPin, Milestone, Calendar } from 'lucide-react';

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await getLeadDetails(params.id);
  if (!lead) {
    notFound();
  }

  const history = await getAssignmentHistory(params.id);

  // Mocking the current user as a caller
  const currentUserRole = 'caller';

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">{lead.name}</h1>
        <p className="text-muted-foreground">Lead ID: {lead.refId}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
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
                    <p className="font-medium">{lead.phone}</p>
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

        <div className="lg:col-span-1">
          {currentUserRole === 'caller' && (
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
                <CardDescription>Log the outcome of your call.</CardDescription>
              </CardHeader>
              <CardContent>
                <UpdateDispositionForm leadId={lead.refId} history={history} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
