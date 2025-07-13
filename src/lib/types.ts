export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'admin' | 'caller';
  active: boolean;
  createdAt: string;
  avatar: string;
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
  customFields?: Record<string, any>;
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
}
