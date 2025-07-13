export interface User {
  id: string;
  name: string;
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
  refId: string;
  name: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  school: string;
  locality: string;
  district: string;
  createdAt: string;
  campaign?: string;
  customFields?: Record<string, CustomFieldValue>;
}

export type Disposition = 'New' | 'Interested' | 'Not Interested' | 'Follow-up' | 'Callback' | 'Not Reachable';
export type SubDisposition = 'Ringing' | 'Switched Off' | 'Call Back Later' | 'Not Answering' | 'Wrong Number' | 'Language Barrier' | 'High Price' | 'Not Interested Now' | 'Will Join Later' | 'Admission Done';

export interface Assignment {
  id: string;
  mainDataRefId: string;
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
