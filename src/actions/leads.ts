
'use server'

import { supabase } from '@/lib/supabase';
import type { Lead, Assignment, Disposition, SubDisposition, User } from "@/lib/types"
import { convertDbLeadToLead, convertDbAssignmentToAssignment, convertLeadToDbLead, convertAssignmentToDbAssignment } from "@/lib/types"
import { verifyUser } from '@/lib/auth';
import { headers } from 'next/headers';

export async function getLeads(): Promise<Lead[]> {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch leads: ${error.message}`);
  }

  return leads?.map(convertDbLeadToLead) || [];
}

export async function getAssignments(): Promise<Assignment[]> {
  const { data: assignments, error } = await supabase
    .from('assignments')
    .select('*')
    .order('assigned_time', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch assignments: ${error.message}`);
  }

  return assignments?.map(convertDbAssignmentToAssignment) || [];
}

export async function getAssignmentHistory(leadId: string): Promise<Assignment[]> {
  const { data: assignments, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('lead_id', leadId)
    .order('assigned_time', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch assignment history: ${error.message}`);
  }

  return assignments?.map(convertDbAssignmentToAssignment) || [];
}

export async function getLeadDetails(leadId: string): Promise<Lead | null> {
  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null;
    }
    throw new Error(`Failed to fetch lead details: ${error.message}`);
  }

  return lead ? convertDbLeadToLead(lead) : null;
}

export async function addAssignment(
  leadId: string,
  disposition: Disposition,
  subDisposition: SubDisposition,
  remark: string,
  followUpDate?: Date,
  scheduleDate?: Date
): Promise<Assignment> {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  const user = await verifyUser(token);

  const assignment: Partial<Assignment> = {
    mainDataRefId: leadId,
    disposition,
    subDisposition,
    remark,
    followUpDate: followUpDate?.toISOString(),
    scheduleDate: scheduleDate?.toISOString(),
    assignedTime: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
  };

  const dbAssignment = convertAssignmentToDbAssignment(assignment);
  
  const { data, error } = await supabase
    .from('assignments')
    .insert([dbAssignment])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add assignment: ${error.message}`);
  }

  return convertDbAssignmentToAssignment(data);
}

export async function assignLeads(leadIds: string[], userId: string): Promise<Assignment[]> {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  const currentUser = await verifyUser(token, 'admin');

  // Get the target user's details
  const { data: targetUser, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError || !targetUser) {
    throw new Error("Target user not found.");
  }

  const assignments: Partial<Assignment>[] = leadIds.map(leadId => ({
    mainDataRefId: leadId,
    disposition: 'New',
    subDisposition: 'Ringing',
    remark: `Assigned by ${currentUser.name}`,
    assignedTime: new Date().toISOString(),
    userId: targetUser.id,
    userName: targetUser.name,
  }));

  const dbAssignments = assignments.map(convertAssignmentToDbAssignment);

  const { data, error } = await supabase
    .from('assignments')
    .insert(dbAssignments)
    .select();

  if (error) {
    throw new Error(`Failed to assign leads: ${error.message}`);
  }

  return data?.map(convertDbAssignmentToAssignment) || [];
}

export async function importLeads(
  newLeads: Partial<Lead>[],
  campaign?: string
): Promise<{ count: number }> {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  const user = await verifyUser(token, 'admin');

  const leadsToInsert = newLeads.map(leadData => {
    const lead: Partial<Lead> = {
      ...leadData,
      campaigns: campaign ? [campaign] : (leadData.campaigns || []),
      createdAt: new Date().toISOString(),
    };
    
    const dbLead = convertLeadToDbLead(lead);
    return {
      ...dbLead,
      imported_by: user.name,
      updated_at: new Date().toISOString(),
      updated_by: user.name,
    };
  });

  const { data, error } = await supabase
    .from('leads')
    .insert(leadsToInsert)
    .select();

  if (error) {
    throw new Error(`Failed to import leads: ${error.message}`);
  }

  return { count: data?.length || 0 };
}

export async function addCampaignToLeads(leadIds: string[], campaign: string): Promise<{ count: number }> {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  const user = await verifyUser(token, 'admin');

  // Get current campaigns for each lead and append the new one
  const { data: leads, error: fetchError } = await supabase
    .from('leads')
    .select('id, campaigns')
    .in('id', leadIds);

  if (fetchError) {
    throw new Error(`Failed to fetch leads: ${fetchError.message}`);
  }

  const updates = leads?.map(lead => ({
    id: lead.id,
    campaigns: [...(lead.campaigns || []), campaign],
    updated_at: new Date().toISOString(),
    updated_by: user.name,
  })) || [];

  const { error: updateError } = await supabase
    .from('leads')
    .upsert(updates);

  if (updateError) {
    throw new Error(`Failed to add campaign to leads: ${updateError.message}`);
  }

  return { count: leadIds.length };
}

export async function updateLeadCustomField(leadId: string, fieldName: string, value: string): Promise<Lead> {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ') ) {
    throw new Error("No authentication token found.");
  }

  const token = authHeader.split('Bearer ')[1];
  const user = await verifyUser(token);
  
  // Get the current lead
  const { data: currentLead, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch lead: ${fetchError.message}`);
  }

  const currentCustomFields = (currentLead.custom_fields as Record<string, any>) || {};
  
  const updatedCustomFields = {
    ...currentCustomFields,
    [fieldName]: {
      value,
      updatedBy: user.name,
      updatedAt: new Date().toISOString()
    }
  };

  const { data, error } = await supabase
    .from('leads')
    .update({
      custom_fields: updatedCustomFields,
      updated_at: new Date().toISOString(),
      updated_by: user.name,
    })
    .eq('id', leadId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update lead custom field: ${error.message}`);
  }

  return convertDbLeadToLead(data);
}
