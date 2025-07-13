'use server'

import { leads, assignmentHistory, users } from '@/lib/data';
import type { Lead, Assignment, Disposition, SubDisposition } from "@/lib/types"

export async function getLeads(): Promise<Lead[]> {
  // In a real app, you'd fetch this from a database.
  // We'll add a delay to simulate network latency.
  await new Promise(resolve => setTimeout(resolve, 500));
  return JSON.parse(JSON.stringify(leads));
}

export async function getAssignments(): Promise<Assignment[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return JSON.parse(JSON.stringify(assignmentHistory));
}

export async function getLeadDetails(id: string): Promise<Lead | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const lead = leads.find(l => l.refId === id);
  return lead ? JSON.parse(JSON.stringify(lead)) : undefined;
}

export async function getAssignmentHistory(leadId: string): Promise<Assignment[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const history = assignmentHistory.filter(a => a.mainDataRefId === leadId).sort((a,b) => new Date(b.assignedTime).getTime() - new Date(a.assignedTime).getTime());
  return JSON.parse(JSON.stringify(history));
}

export async function addAssignment(
  leadId: string,
  userId: string,
  disposition: Disposition,
  subDisposition: SubDisposition,
  remark: string
): Promise<Assignment> {
    const user = users.find(u => u.id === userId);
    if (!user) {
        throw new Error("User not found");
    }

    const now = new Date();
    const newAssignment: Assignment = {
        id: `asgn_${Date.now()}`,
        mainDataRefId: leadId,
        userId: userId,
        userName: user.name,
        assignedTime: now.toISOString(),
        disposition,
        dispositionTime: now.toISOString(),
        subDisposition,
        subDispositionTime: now.toISOString(),
        remark,
    };
    
    assignmentHistory.unshift(newAssignment);
    
    return JSON.parse(JSON.stringify(newAssignment));
}

export async function assignLeads(leadIds: string[], userId: string): Promise<Assignment[]> {
    const user = users.find(u => u.id === userId);
    if (!user) {
        throw new Error("User not found");
    }

    const now = new Date();
    const newAssignments: Assignment[] = [];

    for (const leadId of leadIds) {
        const newAssignment: Assignment = {
            id: `asgn_${Date.now()}_${leadId}`,
            mainDataRefId: leadId,
            userId: userId,
            userName: user.name,
            assignedTime: now.toISOString(),
            disposition: 'New',
        };
        assignmentHistory.unshift(newAssignment);
        newAssignments.push(newAssignment);
    }
    
    return JSON.parse(JSON.stringify(newAssignments));
}

export async function importLeads(
  newLeads: Partial<Lead>[],
  campaign?: string
): Promise<{ count: number }> {
    const now = new Date().toISOString();
    
    newLeads.forEach((leadData) => {
        const newLead: Lead = {
            name: leadData.name || 'N/A',
            phone: leadData.phone || 'N/A',
            gender: leadData.gender || 'Other',
            school: leadData.school || 'N/A',
            locality: leadData.locality || 'N/A',
            district: leadData.district || 'N/A',
            refId: `lead_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            createdAt: now,
            campaign: campaign || leadData.campaign,
            customFields: leadData.customFields || {},
        };
        leads.unshift(newLead);
    });
    
    return { count: newLeads.length };
}


export async function updateCampaignForLeads(leadIds: string[], campaign: string): Promise<{ count: number }> {
    let updatedCount = 0;
    leads.forEach(lead => {
        if (leadIds.includes(lead.refId)) {
            lead.campaign = campaign;
            updatedCount++;
        }
    });
    return { count: updatedCount };
}

export async function updateLeadCustomField(leadId: string, fieldName: string, value: string, userId: string): Promise<Lead> {
    const leadIndex = leads.findIndex(l => l.refId === leadId);
    if (leadIndex === -1) {
        throw new Error("Lead not found");
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
        throw new Error("User not found");
    }

    const lead = leads[leadIndex];
    if (!lead.customFields) {
        lead.customFields = {};
    }

    lead.customFields[fieldName] = {
        value,
        updatedBy: user.name,
        updatedAt: new Date().toISOString()
    };
    
    return JSON.parse(JSON.stringify(lead));
}
