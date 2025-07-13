import type { User, Lead, Assignment, Disposition, SubDisposition, LoginActivity } from './types';

export const users: User[] = [
  { id: 'usr_1', name: 'Admin User', phone: '1112223331', role: 'admin', status: 'active', createdAt: '2023-01-15T09:30:00Z', avatar: '/avatars/01.png', latitude: 28.6139, longitude: 77.2090 },
  { id: 'usr_2', name: 'Jane Doe', phone: '1112223332', role: 'caller', status: 'active', createdAt: '2023-01-16T10:00:00Z', avatar: '/avatars/02.png', latitude: 28.6145, longitude: 77.2100 },
  { id: 'usr_3', name: 'John Smith', phone: '1112223333', role: 'caller', status: 'active', createdAt: '2023-01-17T11:45:00Z', avatar: '/avatars/03.png', latitude: 28.6130, longitude: 77.2085 },
  { id: 'usr_4', name: 'Emily White', phone: '1112223334', role: 'caller', status: 'inactive', createdAt: '2023-01-18T14:00:00Z', avatar: '/avatars/04.png', latitude: 28.7041, longitude: 77.1025 },
  { id: 'usr_5', name: 'Michael Brown', phone: '1112223335', role: 'caller', status: 'pending', createdAt: '2023-01-19T16:20:00Z', avatar: '/avatars/05.png', latitude: 28.5355, longitude: 77.3910 },
  { id: 'usr_6', name: 'Jessica Green', phone: '1112223336', role: 'caller', status: 'pending', createdAt: '2023-01-20T10:15:00Z', avatar: 'https://placehold.co/32x32.png', latitude: 28.6139, longitude: 77.2090 },
];

export const loginActivity: LoginActivity[] = [
    { id: 'act_1', userId: 'usr_1', userName: 'Admin User', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), activity: 'login', ipAddress: '192.168.1.1', device: 'Chrome on macOS' },
    { id: 'act_2', userId: 'usr_2', userName: 'Jane Doe', timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), activity: 'login', ipAddress: '203.0.113.25', device: 'Safari on iPhone' },
    { id: 'act_3', userId: 'usr_3', userName: 'John Smith', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), activity: 'login', ipAddress: '198.51.100.10', device: 'Chrome on Windows' },
    { id: 'act_4', userId: 'usr_2', userName: 'Jane Doe', timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(), activity: 'logout', ipAddress: '203.0.113.25', device: 'Safari on iPhone' },
];

export const leads: Lead[] = Array.from({ length: 50 }, (_, i) => ({
  refId: `LD${1001 + i}`,
  name: `Lead Name ${i + 1}`,
  phone: `98765432${i.toString().padStart(2, '0')}`,
  gender: i % 2 === 0 ? 'Male' : 'Female',
  school: `School #${(i % 5) + 1}`,
  locality: `Locality ${(i % 10) + 1}`,
  district: `District ${(i % 3) + 1}`,
  createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
}));

const dispositions: Disposition[] = ['New', 'Interested', 'Not Interested', 'Follow-up', 'Callback', 'Not Reachable'];
const subDispositions: SubDisposition[] = ['Ringing', 'Switched Off', 'Call Back Later', 'Not Answering', 'Wrong Number', 'Language Barrier', 'High Price', 'Not Interested Now', 'Will Join Later', 'Admission Done'];

export const assignmentHistory: Assignment[] = [
  // Lead LD1001 assigned to Jane Doe
  {
    id: `asg_${Math.random().toString(36).substr(2, 9)}`,
    mainDataRefId: 'LD1001',
    userId: 'usr_2',
    userName: 'Jane Doe',
    assignedTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    disposition: 'Interested',
    dispositionTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
    subDisposition: 'Will Join Later',
    subDispositionTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
    remark: 'Spoke with the student. They are very interested in the computer science program and will discuss with their parents over the weekend. Planning to join the next batch.',
  },
  // Lead LD1002 assigned to John Smith
  {
    id: `asg_${Math.random().toString(36).substr(2, 9)}`,
    mainDataRefId: 'LD1002',
    userId: 'usr_3',
    userName: 'John Smith',
    assignedTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    disposition: 'Not Interested',
    dispositionTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1200000).toISOString(),
    subDisposition: 'High Price',
    subDispositionTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1200000).toISOString(),
    remark: 'The student feels the course fees are too high compared to other local institutions. Not willing to proceed.',
  },
  // Lead LD1003 assigned to Jane Doe, then reassigned to John Smith
  {
    id: `asg_${Math.random().toString(36).substr(2, 9)}`,
    mainDataRefId: 'LD1003',
    userId: 'usr_2',
    userName: 'Jane Doe',
    assignedTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    disposition: 'Callback',
    dispositionTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 1800000).toISOString(),
    subDisposition: 'Call Back Later',
    subDispositionTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 1800000).toISOString(),
    remark: 'Requested a call back in the evening as they were in a meeting.',
  },
  {
    id: `asg_${Math.random().toString(36).substr(2, 9)}`,
    mainDataRefId: 'LD1003',
    userId: 'usr_3',
    userName: 'John Smith',
    assignedTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    disposition: 'Follow-up',
    dispositionTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 3000000).toISOString(),
    subDisposition: 'Not Answering',
    subDispositionTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 3000000).toISOString(),
    remark: 'Tried calling in the evening as requested, but there was no answer.',
  },
  // Some more assigned leads for the dashboard
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `asg_${Math.random().toString(36).substr(2, 9)}`,
    mainDataRefId: `LD10${(i + 4).toString().padStart(2, '0')}`,
    userId: i % 2 === 0 ? 'usr_2' : 'usr_3',
    userName: i % 2 === 0 ? 'Jane Doe' : 'John Smith',
    assignedTime: new Date(Date.now() - (i + 1) * 12 * 60 * 60 * 1000).toISOString(),
    disposition: dispositions[i % dispositions.length],
    dispositionTime: new Date(Date.now() - (i + 1) * 12 * 60 * 60 * 1000 + 1800000).toISOString(),
    subDisposition: subDispositions[i % subDispositions.length],
    subDispositionTime: new Date(Date.now() - (i + 1) * 12 * 60 * 60 * 1000 + 1800000).toISOString(),
    remark: `This is a sample remark for lead LD10${(i + 4).toString().padStart(2, '0')}.`
  }))
];
