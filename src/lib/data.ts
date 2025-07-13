import type { User, Lead, Assignment, LoginActivity, Disposition } from './types';

// NOTE: This file contains mock data for the application.
// In a real-world scenario, this data would come from a database.

export const users: User[] = [
    { id: 'usr_1', name: 'Admin User', phone: '1112223331', role: 'admin', status: 'active', createdAt: new Date('2023-10-01T10:00:00Z').toISOString(), avatar: 'https://placehold.co/32x32.png?text=AU' },
    { id: 'usr_2', name: 'Jane Doe', phone: '1112223332', role: 'caller', status: 'active', createdAt: new Date('2023-10-05T11:30:00Z').toISOString(), avatar: 'https://placehold.co/32x32.png?text=JD' },
    { id: 'usr_3', name: 'John Smith', phone: '1112223333', role: 'caller', status: 'active', createdAt: new Date('2023-10-05T12:00:00Z').toISOString(), avatar: 'https://placehold.co/32x32.png?text=JS' },
    { id: 'usr_4', name: 'Emily White', phone: '1112223334', role: 'caller', status: 'inactive', createdAt: new Date('2023-10-10T14:00:00Z').toISOString(), avatar: 'https://placehold.co/32x32.png?text=EW' },
    { id: 'usr_5', name: 'Michael Brown', phone: '1112223335', role: 'caller', status: 'pending', createdAt: new Date('2023-10-12T16:45:00Z').toISOString(), avatar: 'https://placehold.co/32x32.png?text=MB' },
];

export const leads: Lead[] = [
    { refId: 'lead_001', name: 'Aarav Sharma', phone: '9876543210', gender: 'Male', school: 'Delhi Public School', locality: 'RK Puram', district: 'New Delhi', createdAt: new Date('2024-05-01T09:00:00Z').toISOString(), campaign: 'Summer Fest 2024', customFields: { "Parent's Name": 'Sunita Sharma' } },
    { refId: 'lead_002', name: 'Priya Patel', phone: '9876543211', gender: 'Female', school: 'Modern School', locality: 'Vasant Vihar', district: 'New Delhi', createdAt: new Date('2024-05-01T10:30:00Z').toISOString() },
    { refId: 'lead_003', name: 'Rohan Gupta', phone: '9876543212', gender: 'Male', school: 'Amity International', locality: 'Saket', district: 'South Delhi', createdAt: new Date('2024-05-02T11:00:00Z').toISOString(), campaign: 'Diwali Dhamaka' },
    { refId: 'lead_004', name: 'Sneha Reddy', phone: '9876543213', gender: 'Female', school: 'Delhi Public School', locality: 'Noida Sector 15', district: 'Gautam Budh Nagar', createdAt: new Date('2024-05-02T14:15:00Z').toISOString(), campaign: 'Summer Fest 2024' },
    { refId: 'lead_005', name: 'Vikram Singh', phone: '9876543214', gender: 'Male', school: 'The Shri Ram School', locality: 'DLF Phase 3', district: 'Gurugram', createdAt: new Date('2024-05-03T16:00:00Z').toISOString() },
    { refId: 'lead_006', name: 'Ananya Iyer', phone: '9876543215', gender: 'Female', school: 'Venkateshwar Global School', locality: 'Rohini', district: 'North West Delhi', createdAt: new Date('2024-05-04T09:30:00Z').toISOString(), campaign: 'Diwali Dhamaka' },
    { refId: 'lead_007', name: 'Karan Malhotra', phone: '9876543216', gender: 'Male', school: 'Ryan International', locality: 'Vasant Kunj', district: 'South West Delhi', createdAt: new Date('2024-05-05T11:45:00Z').toISOString() },
    { refId: 'lead_008', name: 'Diya Mehta', phone: '9876543217', gender: 'Female', school: 'Delhi Public School', locality: 'Mathura Road', district: 'South East Delhi', createdAt: new Date('2024-05-06T13:00:00Z').toISOString(), campaign: 'Summer Fest 2024' },
    { refId: 'lead_009', name: 'Arjun Desai', phone: '9876543218', gender: 'Male', school: 'Springdales School', locality: 'Dhaula Kuan', district: 'New Delhi', createdAt: new Date('2024-05-07T15:20:00Z').toISOString() },
    { refId: 'lead_010', name: 'Ishita Joshi', phone: '9876543219', gender: 'Female', school: 'Apeejay School', locality: 'Pitampura', district: 'North West Delhi', createdAt: new Date('2024-05-08T17:00:00Z').toISOString(), campaign: 'Diwali Dhamaka' },
];

export const assignmentHistory: Assignment[] = [
    { id: 'asgn_001', mainDataRefId: 'lead_001', userId: 'usr_2', userName: 'Jane Doe', assignedTime: new Date('2024-05-02T10:00:00Z').toISOString(), disposition: 'Interested', dispositionTime: new Date('2024-05-02T10:15:00Z').toISOString(), subDisposition: 'Will Join Later', remark: 'Parent is interested, will confirm by the weekend.' },
    { id: 'asgn_002', mainDataRefId: 'lead_002', userId: 'usr_3', userName: 'John Smith', assignedTime: new Date('2024-05-02T11:00:00Z').toISOString(), disposition: 'Not Interested', dispositionTime: new Date('2024-05-02T11:20:00Z').toISOString(), subDisposition: 'High Price', remark: 'Student found the course fees to be too high.' },
    { id: 'asgn_003', mainDataRefId: 'lead_003', userId: 'usr_2', userName: 'Jane Doe', assignedTime: new Date('2024-05-03T12:00:00Z').toISOString(), disposition: 'Follow-up', dispositionTime: new Date('2024-05-03T12:10:00Z').toISOString(), subDisposition: 'Call Back Later', remark: 'Asked to call back next week for more details.' },
    { id: 'asgn_004', mainDataRefId: 'lead_004', userId: 'usr_3', userName: 'John Smith', assignedTime: new Date('2024-05-03T15:00:00Z').toISOString() }, // Still 'New'
    { id: 'asgn_005', mainDataRefId: 'lead_001', userId: 'usr_3', userName: 'John Smith', assignedTime: new Date('2024-05-08T14:00:00Z').toISOString(), disposition: 'Interested', dispositionTime: new Date('2024-05-08T14:30:00Z').toISOString(), subDisposition: 'Admission Done', remark: 'Followed up and completed the admission process.' },
    { id: 'asgn_006', mainDataRefId: 'lead_007', userId: 'usr_3', userName: 'John Smith', assignedTime: new Date('2024-05-08T16:00:00Z').toISOString(), disposition: 'Callback', dispositionTime: new Date('2024-05-08T16:05:00Z').toISOString(), subDisposition: 'Call Back Later', remark: 'Needs to discuss with parents.' },
];

export const loginActivity: LoginActivity[] = [
    { id: 'act_1', userId: 'usr_1', userName: 'Admin User', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), activity: 'login', ipAddress: '192.168.1.1', device: 'Chrome on macOS' },
    { id: 'act_2', userId: 'usr_2', userName: 'Jane Doe', timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), activity: 'login', ipAddress: '203.0.113.25', device: 'Safari on iPhone' },
    { id: 'act_3', userId: 'usr_3', userName: 'John Smith', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), activity: 'login', ipAddress: '198.51.100.10', device: 'Chrome on Windows' },
    { id: 'act_4', userId: 'usr_2', userName: 'Jane Doe', timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(), activity: 'logout', ipAddress: '203.0.113.25', device: 'Safari on iPhone' },
];
