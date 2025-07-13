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
import { updateCampaignForLeads } from '@/actions/leads'
import { Tag } from 'lucide-react'

interface UpdateCampaignDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  leadIds: string[]
}

export function UpdateCampaignDialog({
  isOpen,
  onOpenChange,
  leadIds,
}: UpdateCampaignDialogProps) {
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
      await updateCampaignForLeads(leadIds, campaign)
      toast({
        title: 'Campaign Updated!',
        description: `The campaign tag for ${leadIds.length} lead(s) has been updated.`,
      })
      onOpenChange(false)
      setCampaign('')
      setTimeout(() => router.refresh(), 1000)
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Could not update campaign tag. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Campaign Tag</DialogTitle>
          <DialogDescription>
            Enter a new campaign tag for the selected {leadIds.length} lead(s). This will overwrite any existing tag.
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
            {isSubmitting ? 'Updating...' : 'Update Campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
