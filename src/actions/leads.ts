
'use server'

import { db } from '@/lib/firebase';
import type { Lead, Assignment, Disposition, SubDisposition } from "@/lib/types"

export async function getLeads(): Promise<Lead[]> {
  if (!db) {
    console.warn('DB not configured, returning empty list for leads.');
    return [];
  }
  const snapshot = await db.collection('leads').orderBy('createdAt', 'desc').get();
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(doc => ({ refId: doc.id, ...doc.data() } as Lead));
}

export async function getAssignments(): Promise<Assignment[]> {
    if (!db) {
        console.warn('DB not configured, returning empty list for assignments.');
        return [];
    }
    const snapshot = await db.collection('assignmentHistory').orderBy('assignedTime', 'desc').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
}

export async function getLeadDetails(id: string): Promise<Lead | undefined> {
  if (!db) {
    console.warn('DB not configured, returning undefined for lead details.');
    return undefined;
  }
  const doc = await db.collection('leads').doc(id).get();
  if (!doc.exists) {
    return undefined;
  }
  return { refId: doc.id, ...doc.data() } as Lead;
}

export async function getAssignmentHistory(leadId: string): Promise<Assignment[]> {
    if (!db) {
        console.warn('DB not configured, returning empty list for assignment history.');
        return [];
    }
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
  userId: string,
  disposition: Disposition,
  subDisposition: SubDisposition,
  remark: string,
  followUpDate?: Date,
  scheduleDate?: Date
): Promise<Assignment> {
    if (!db) { throw new Error("Database not configured."); }
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
        throw new Error("User not found");
    }
    const user = userDoc.data();

    const now = new Date();
    const newAssignmentData = {
        mainDataRefId: leadId,
        userId: userId,
        userName: user?.name,
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
    if (!db) { throw new Error("Database not configured."); }
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
        throw new Error("User not found");
    }
    const user = userDoc.data();

    const now = new Date();
    const newAssignments: Assignment[] = [];

    const batch = db.batch();

    for (const leadId of leadIds) {
        const newAssignmentData = {
            mainDataRefId: leadId,
            userId: userId,
            userName: user?.name,
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
    if (!db) { throw new Error("Database not configured."); }
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
    if (!db) { throw new Error("Database not configured."); }
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

export async function updateLeadCustomField(leadId: string, fieldName: string, value: string, userId: string): Promise<Lead> {
    if (!db) { throw new Error("Database not configured."); }
    const leadRef = db.collection('leads').doc(leadId);
    
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
        throw new Error("User not found");
    }
    const user = userDoc.data();

    const fieldData = {
        value,
        updatedBy: user?.name,
        updatedAt: new Date().toISOString()
    };
    
    // Use dot notation to update a specific field within the customFields map
    await leadRef.update({
        [`customFields.${fieldName}`]: fieldData
    });

    const updatedDoc = await leadRef.get();
    return { refId: updatedDoc.id, ...updatedDoc.data() } as Lead;
}
