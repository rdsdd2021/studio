import type { Database } from './database.types'

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'caller';
  status: 'pending' | 'active' | 'inactive';
  createdAt: string;
  avatar: string;
  loginStatus?: 'online' | 'offline';
  password?: string;
}

export interface CustomFieldValue {
  value: string;
  updatedBy?: string; // User's name
  updatedAt?: string; // ISO date string
}

export interface Lead {
  refId: string; // maps to id in database
  name: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  school: string;
  locality: string;
  district: string;
  createdAt: string;
  campaigns?: string[];
  customFields?: Record<string, CustomFieldValue>;
}

export type Disposition = 'New' | 'Interested' | 'Not Interested' | 'Follow-up' | 'Callback' | 'Not Reachable';
export type SubDisposition = 'Ringing' | 'Switched Off' | 'Call Back Later' | 'Not Answering' | 'Wrong Number' | 'Language Barrier' | 'High Price' | 'Not Interested Now' | 'Will Join Later' | 'Admission Done';

export interface Assignment {
  id: string;
  mainDataRefId: string; // maps to lead_id in database
  userId: string;
  userName: string;
  assignedTime: string;
  disposition?: Disposition;
  dispositionTime?: string;
  subDisposition?: SubDisposition;
  subDispositionTime?: string;
  remark?: string;
  followUpDate?: string;
  scheduleDate?: string;
}

export interface LoginActivity {
    id: string;
    userId: string;
    userName: string;
    timestamp: string;
    activity: 'login' | 'logout';
    ipAddress: string;
    device: string;
}

// Supabase database types (for internal use)
export type DbUser = Database['public']['Tables']['users']['Row']
export type DbUserInsert = Database['public']['Tables']['users']['Insert']
export type DbUserUpdate = Database['public']['Tables']['users']['Update']

export type DbLead = Database['public']['Tables']['leads']['Row']
export type DbLeadInsert = Database['public']['Tables']['leads']['Insert']
export type DbLeadUpdate = Database['public']['Tables']['leads']['Update']

export type DbAssignment = Database['public']['Tables']['assignments']['Row']
export type DbAssignmentInsert = Database['public']['Tables']['assignments']['Insert']
export type DbAssignmentUpdate = Database['public']['Tables']['assignments']['Update']

export type DbLoginActivity = Database['public']['Tables']['login_activity']['Row']
export type DbLoginActivityInsert = Database['public']['Tables']['login_activity']['Insert']

// Helper functions to convert between app types and database types
export const convertDbUserToUser = (dbUser: DbUser): User => ({
  id: dbUser.id,
  name: dbUser.name,
  email: dbUser.email,
  phone: dbUser.phone,
  role: dbUser.role,
  status: dbUser.status,
  createdAt: dbUser.created_at,
  avatar: dbUser.avatar || '',
  loginStatus: dbUser.login_status || undefined,
})

export const convertUserToDbUser = (user: Partial<User>): DbUserInsert => ({
  name: user.name!,
  email: user.email!,
  phone: user.phone!,
  role: user.role!,
  status: user.status || 'pending',
  avatar: user.avatar || null,
  login_status: user.loginStatus || null,
})

export const convertDbLeadToLead = (dbLead: DbLead): Lead => ({
  refId: dbLead.id,
  name: dbLead.name,
  phone: dbLead.phone,
  gender: dbLead.gender,
  school: dbLead.school,
  locality: dbLead.locality,
  district: dbLead.district,
  createdAt: dbLead.created_at,
  campaigns: dbLead.campaigns || undefined,
  customFields: (dbLead.custom_fields as Record<string, CustomFieldValue> | null) || undefined,
})

export const convertLeadToDbLead = (lead: Partial<Lead>): DbLeadInsert => ({
  name: lead.name!,
  phone: lead.phone!,
  gender: lead.gender!,
  school: lead.school!,
  locality: lead.locality!,
  district: lead.district!,
  campaigns: lead.campaigns || null,
  custom_fields: (lead.customFields as any) || null,
})

export const convertDbAssignmentToAssignment = (dbAssignment: DbAssignment): Assignment => ({
  id: dbAssignment.id,
  mainDataRefId: dbAssignment.lead_id,
  userId: dbAssignment.user_id,
  userName: dbAssignment.user_name,
  assignedTime: dbAssignment.assigned_time,
  disposition: dbAssignment.disposition || undefined,
  dispositionTime: dbAssignment.disposition_time || undefined,
  subDisposition: dbAssignment.sub_disposition || undefined,
  subDispositionTime: dbAssignment.sub_disposition_time || undefined,
  remark: dbAssignment.remark || undefined,
  followUpDate: dbAssignment.follow_up_date || undefined,
  scheduleDate: dbAssignment.schedule_date || undefined,
})

export const convertAssignmentToDbAssignment = (assignment: Partial<Assignment>): DbAssignmentInsert => ({
  lead_id: assignment.mainDataRefId!,
  user_id: assignment.userId!,
  user_name: assignment.userName!,
  assigned_time: assignment.assignedTime!,
  disposition: assignment.disposition || null,
  disposition_time: assignment.dispositionTime || null,
  sub_disposition: assignment.subDisposition || null,
  sub_disposition_time: assignment.subDispositionTime || null,
  remark: assignment.remark || null,
  follow_up_date: assignment.followUpDate || null,
  schedule_date: assignment.scheduleDate || null,
})
