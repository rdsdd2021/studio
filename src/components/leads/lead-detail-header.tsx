import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadDetailHeaderProps {
  leadName: string;
  leadId: string;
  previousLeadId?: string;
  nextLeadId?: string;
}

export function LeadDetailHeader({
  leadName,
  leadId,
  previousLeadId,
  nextLeadId,
}: LeadDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">{leadName}</h1>
        <p className="text-muted-foreground">Lead ID: {leadId}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          asChild
          disabled={!previousLeadId}
          aria-disabled={!previousLeadId}
          className={cn(!previousLeadId && "pointer-events-none opacity-50")}
        >
          <Link href={previousLeadId ? `/leads/${previousLeadId}` : '#'}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Lead</span>
          </Link>
        </Button>
        <Button
          variant="outline"
          size="icon"
          asChild
          disabled={!nextLeadId}
          aria-disabled={!nextLeadId}
          className={cn(!nextLeadId && "pointer-events-none opacity-50")}
        >
          <Link href={nextLeadId ? `/leads/${nextLeadId}` : '#'}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Lead</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
