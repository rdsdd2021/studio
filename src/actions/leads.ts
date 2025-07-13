'use server'

import { assignmentHistory, leads, users } from "@/lib/data"
import type { Lead, Assignment, Disposition, SubDisposition } from "@/lib/types"

export async function getLeads(): Promise<Lead[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return leads;
}

export async function getAssignments(): Promise<Assignment[]> {
    // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return assignmentHistory;
}

export async function getLeadDetails(id: string): Promise<Lead | undefined> {
  return leads.find(lead => lead.refId === id);
}

export async function getAssignmentHistory(leadId: string): Promise<Assignment[]> {
  return assignmentHistory.filter(a => a.mainDataRefId === leadId).sort((a, b) => new Date(b.assignedTime).getTime() - new Date(a.assignedTime).getTime());
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

  const newAssignment: Assignment = {
    id: `asg_${Math.random().toString(36).substr(2, 9)}`,
    mainDataRefId: leadId,
    userId: user.id,
    userName: user.name,
    assignedTime: new Date().toISOString(),
    disposition,
    dispositionTime: new Date().toISOString(),
    subDisposition,
    subDispositionTime: new Date().toISOString(),
    remark,
  };

  assignmentHistory.push(newAssignment);
  return newAssignment;
}

export async function assignLeads(leadIds: string[], userId: string): Promise<Assignment[]> {
    const user = users.find(u => u.id === userId);
    if (!user) {
        throw new Error("User not found");
    }

    const newAssignments: Assignment[] = [];
    for (const leadId of leadIds) {
        const newAssignment: Assignment = {
            id: `asg_${Math.random().toString(36).substr(2, 9)}`,
            mainDataRefId: leadId,
            userId: user.id,
            userName: user.name,
            assignedTime: new Date().toISOString(),
            disposition: 'New',
        };
        assignmentHistory.unshift(newAssignment);
        newAssignments.push(newAssignment);
    }
    return newAssignments;
}
