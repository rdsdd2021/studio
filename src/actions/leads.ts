
'use server'

import { db, auth } from '@/lib/firebase';
import type { Lead, Assignment, Disposition, SubDisposition, User } from "@/lib/types"
import { headers } from 'next/headers';


async function verifyUser(idToken: string, requiredRole?: 'admin' | 'caller'): Promise<User> {
    if (!auth || !db) throw new Error("Authentication services not available.");
    
    const decodedToken = await auth.verifyIdToken(idToken);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
        throw new Error("User not found in database.");
    }

    const user = { id: userDoc.id, ...userDoc.data() } as User;

    if (requiredRole && user.role !== requiredRole) {
        throw new Error(`Unauthorized: User does not have the required role ('${requiredRole}').`);
    }

    if (user.status !== 'active') {
        throw new Error("User account is not active.");
    }
    
    return user;
}


export async function getLeads(): Promise<Lead[]> {
  if (!db) throw new Error("Database not configured.");
  const snapshot = await db.collection('leads').orderBy('createdAt', 'desc').get();
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(doc => ({ refId: doc.id, ...doc.data() } as Lead));
}

export async function getAssignments(): Promise<Assignment[]> {
    if (!db) throw new Error("Database not configured.");
    const snapshot = await db.collection('assignmentHistory').orderBy('assignedTime', 'desc').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
}

export async function getLeadDetails(id: string): Promise<Lead | undefined> {
  if (!db) throw new Error("Database not configured.");
  const doc = await db.collection('leads').doc(id).get();
  if (!doc.exists) {
    return undefined;
  }
  return { refId: doc.id, ...doc.data() } as Lead;
}

export async function getAssignmentHistory(leadId: string): Promise<Assignment[]> {
    if (!db) throw new Error("Database not configured.");
  const snapshot = await db.collection('assignmentHistory')
    .where('mainDataRefId', '==', leadId)
    .orderBy('assignedTime', 'desc')
    .get();
    
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
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
    const idToken = headersList.get('Authorization')?.split('Bearer ')[1];
    
    if (!idToken) {
        throw new Error("No authentication token found.");
    }

    const user = await verifyUser(idToken);

    if (!db) throw new Error("Database not configured.");

    const assignment: Omit<Assignment, 'id'> = {
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

    const docRef = await db.collection('assignmentHistory').add(assignment);
    return { id: docRef.id, ...assignment };
}

export async function assignLeads(leadIds: string[], userId: string): Promise<Assignment[]> {
    const headersList = await headers();
    const idToken = headersList.get('Authorization')?.split('Bearer ')[1];
    
    if (!idToken) {
        throw new Error("No authentication token found.");
    }

    const currentUser = await verifyUser(idToken, 'admin');

    if (!db) throw new Error("Database not configured.");

    // Get the target user's details
    const targetUserDoc = await db.collection('users').doc(userId).get();
    if (!targetUserDoc.exists) {
        throw new Error("Target user not found.");
    }
    const targetUser = { id: targetUserDoc.id, ...targetUserDoc.data() } as User;

    const assignments: Assignment[] = [];
    const batch = db.batch();

    for (const leadId of leadIds) {
        const assignment: Omit<Assignment, 'id'> = {
            mainDataRefId: leadId,
            disposition: 'New',
            subDisposition: 'Ringing',
            remark: `Assigned by ${currentUser.name}`,
            assignedTime: new Date().toISOString(),
            userId: targetUser.id,
            userName: targetUser.name,
        };

        const docRef = db.collection('assignmentHistory').doc();
        batch.set(docRef, assignment);
        assignments.push({ id: docRef.id, ...assignment });
    }

    await batch.commit();
    return assignments;
}

export async function importLeads(
  newLeads: Partial<Lead>[],
  campaign?: string
): Promise<{ count: number }> {
    const headersList = await headers();
    const idToken = headersList.get('Authorization')?.split('Bearer ')[1];
    
    if (!idToken) {
        throw new Error("No authentication token found.");
    }

    const user = await verifyUser(idToken, 'admin');

    if (!db) throw new Error("Database not configured.");

    const batch = db.batch();
    
    for (const leadData of newLeads) {
        const docRef = db.collection('leads').doc();
        const lead: Omit<Lead, 'refId'> = {
            ...leadData,
            campaigns: campaign ? [campaign] : (leadData.campaigns || []),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            importedBy: user.name,
        } as Omit<Lead, 'refId'>;
        
        batch.set(docRef, lead);
    }
    
    await batch.commit();
    return { count: newLeads.length };
}

export async function addCampaignToLeads(leadIds: string[], campaign: string): Promise<{ count: number }> {
    const headersList = await headers();
    const idToken = headersList.get('Authorization')?.split('Bearer ')[1];
    
    if (!idToken) {
        throw new Error("No authentication token found.");
    }

    const user = await verifyUser(idToken, 'admin');

    const { FieldValue } = await import('firebase-admin/firestore');
    
    if (!db) throw new Error("Database not configured.");

    const batch = db.batch();
    
    for (const leadId of leadIds) {
        const leadRef = db.collection('leads').doc(leadId);
        batch.update(leadRef, {
            campaigns: FieldValue.arrayUnion(campaign),
            updatedAt: new Date().toISOString(),
            updatedBy: user.name,
        });
    }
    
    await batch.commit();
    return { count: leadIds.length };
}

export async function updateLeadCustomField(leadId: string, fieldName: string, value: string): Promise<Lead> {
    const headersList = await headers();
    const idToken = headersList.get('Authorization')?.split('Bearer ')[1];
    
    if (!idToken) {
        throw new Error("No authentication token found.");
    }

    const user = await verifyUser(idToken);
    
    if (!db) throw new Error("Database not configured.");

    const leadRef = db.collection('leads').doc(leadId);
    const updateData = {
        [`customFields.${fieldName}`]: {
            value,
            updatedBy: user.name,
            updatedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString(),
        updatedBy: user.name,
    };
    
    await leadRef.update(updateData);
    
    // Return the updated lead
    const updatedDoc = await leadRef.get();
    return { refId: updatedDoc.id, ...updatedDoc.data() } as Lead;
}
