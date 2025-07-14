
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
    if (!db || !auth) throw new Error("Database not configured.");
    const idToken = headers().get('Authorization')?.split('Bearer ')[1];
    if (!idToken) throw new Error("Authentication required.");

    const user = await verifyUser(idToken, 'caller');

    const now = new Date();
    const newAssignmentData = {
        mainDataRefId: leadId,
        userId: user.id,
        userName: user.name,
        assignedTime: now.toISOString(),
        disposition,
        dispositionTime: now.toISOString(),
        subDisposition,
        subDispositionTime: now.toISOString(),
        remark,
        followUpDate: followUpDate?.toISOString(),
        scheduleDate: scheduleDate?.toISOString(),
    };
    
    const docRef = await db.collection('assignmentHistory').add(newAssignmentData);
    
    return { id: docRef.id, ...newAssignmentData } as Assignment;
}

export async function assignLeads(leadIds: string[], userId: string): Promise<Assignment[]> {
    if (!db || !auth) throw new Error("Database not configured.");

    const idToken = headers().get('Authorization')?.split('Bearer ')[1];
    if (!idToken) throw new Error("Authentication required.");
    await verifyUser(idToken, 'admin');

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
        throw new Error("User to assign to not found");
    }
    const userToAssign = userDoc.data();
    if (userToAssign?.role !== 'caller') {
        throw new Error("Leads can only be assigned to callers.");
    }

    const now = new Date();
    const newAssignments: Assignment[] = [];

    const batch = db.batch();

    for (const leadId of leadIds) {
        const newAssignmentData = {
            mainDataRefId: leadId,
            userId: userId,
            userName: userToAssign?.name,
            assignedTime: now.toISOString(),
            disposition: 'New' as Disposition,
        };
        const docRef = db.collection('assignmentHistory').doc(); // Create a new doc reference
        batch.set(docRef, newAssignmentData);
        newAssignments.push({ id: docRef.id, ...newAssignmentData } as Assignment);
    }
    
    await batch.commit();
    return newAssignments;
}

export async function importLeads(
  newLeads: Partial<Lead>[],
  campaign?: string
): Promise<{ count: number }> {
    if (!db || !auth) throw new Error("Database not configured.");
    
    const idToken = headers().get('Authorization')?.split('Bearer ')[1];
    if (!idToken) throw new Error("Authentication required.");
    await verifyUser(idToken, 'admin');

    const now = new Date().toISOString();
    const batch = db.batch();
    
    newLeads.forEach((leadData) => {
        const docRef = db.collection('leads').doc();
        const newLead: Omit<Lead, 'refId'> = {
            name: leadData.name || 'N/A',
            phone: leadData.phone || 'N/A',
            gender: leadData.gender || 'Other',
            school: leadData.school || 'N/A',
            locality: leadData.locality || 'N/A',
            district: leadData.district || 'N/A',
            createdAt: now,
            campaigns: campaign ? [campaign] : leadData.campaigns || [],
            customFields: leadData.customFields || {},
        };
        batch.set(docRef, newLead);
    });
    
    await batch.commit();
    return { count: newLeads.length };
}


export async function addCampaignToLeads(leadIds: string[], campaign: string): Promise<{ count: number }> {
    if (!db || !auth) throw new Error("Database not configured.");

    const idToken = headers().get('Authorization')?.split('Bearer ')[1];
    if (!idToken) throw new Error("Authentication required.");
    await verifyUser(idToken, 'admin');

    const { firestore } = await import('firebase-admin/firestore');
    const batch = db.batch();
    
    for (const leadId of leadIds) {
        const leadRef = db.collection('leads').doc(leadId);
        batch.update(leadRef, {
            campaigns: firestore.FieldValue.arrayUnion(campaign)
        });
    }

    await batch.commit();
    return { count: leadIds.length };
}

export async function updateLeadCustomField(leadId: string, fieldName: string, value: string): Promise<Lead> {
    if (!db || !auth) throw new Error("Database not configured.");
    
    const idToken = headers().get('Authorization')?.split('Bearer ')[1];
    if (!idToken) throw new Error("Authentication required.");
    const user = await verifyUser(idToken, 'caller');

    const leadRef = db.collection('leads').doc(leadId);

    const fieldData = {
        value,
        updatedBy: user.name,
        updatedAt: new Date().toISOString()
    };
    
    await leadRef.update({
        [`customFields.${fieldName}`]: fieldData
    });

    const updatedDoc = await leadRef.get();
    return { refId: updatedDoc.id, ...updatedDoc.data() } as Lead;
}
