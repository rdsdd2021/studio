
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { addCampaignToLeads } from '@/actions/leads'
import { Tag } from 'lucide-react'
import type { User } from '@/lib/types'

interface AddCampaignDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  leadIds: string[]
  currentUser: User;
}

export function AddCampaignDialog({
  isOpen,
  onOpenChange,
  leadIds,
  currentUser,
}: AddCampaignDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [campaign, setCampaign] = React.useState('')

  async function handleSubmit() {
    if (leadIds.length === 0) {
      toast({ title: 'No leads selected', variant: 'destructive' })
      return
    }
    if (!campaign.trim()) {
      toast({ title: 'Campaign tag cannot be empty', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      await addCampaignToLeads(leadIds, campaign, currentUser.id)
      toast({
        title: 'Campaign Tag Added!',
        description: `The campaign tag has been added to ${leadIds.length} lead(s).`,
      })
      onOpenChange(false)
      setCampaign('')
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Could not add campaign tag. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  React.useEffect(() => {
    if(isOpen) {
      setCampaign('');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Campaign Tag</DialogTitle>
          <DialogDescription>
            Enter a campaign tag to add to the selected {leadIds.length} lead(s). This will not overwrite existing tags.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="campaign-tag" className="text-right">
              <Tag className="inline-block mr-1 h-4 w-4" />
              Tag
            </Label>
            <Input
              id="campaign-tag"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="e.g., Summer Fest 2024"
              className="col-span-3"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Campaign Tag'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
