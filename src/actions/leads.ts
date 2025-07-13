'use server'

import { db } from "@/lib/firebase";
import type { Lead, Assignment, Disposition, SubDisposition } from "@/lib/types"
import { FieldValue } from "firebase-admin/firestore";

async function docToLead(doc: FirebaseFirestore.DocumentSnapshot): Promise<Lead> {
    const data = doc.data();
    if (!data) throw new Error("Document data is empty");
    return {
        refId: doc.id,
        name: data.name,
        phone: data.phone,
        gender: data.gender,
        school: data.school,
        locality: data.locality,
        district: data.district,
        createdAt: (data.createdAt.toDate()).toISOString(),
        campaign: data.campaign,
        customFields: data.customFields,
    };
}

async function docToAssignment(doc: FirebaseFirestore.DocumentSnapshot): Promise<Assignment> {
    const data = doc.data();
    if (!data) throw new Error("Document data is empty");
    return {
        id: doc.id,
        mainDataRefId: data.mainDataRefId,
        userId: data.userId,
        userName: data.userName,
        assignedTime: (data.assignedTime.toDate()).toISOString(),
        disposition: data.disposition,
        dispositionTime: data.dispositionTime ? (data.dispositionTime.toDate()).toISOString() : undefined,
        subDisposition: data.subDisposition,
        subDispositionTime: data.subDispositionTime ? (data.subDispositionTime.toDate()).toISOString() : undefined,
        remark: data.remark,
    };
}


export async function getLeads(): Promise<Lead[]> {
  const snapshot = await db.collection('leads').orderBy('createdAt', 'desc').get();
  return Promise.all(snapshot.docs.map(docToLead));
}

export async function getAssignments(): Promise<Assignment[]> {
    const snapshot = await db.collectionGroup('assignments').orderBy('assignedTime', 'desc').get();
    return Promise.all(snapshot.docs.map(docToAssignment));
}

export async function getLeadDetails(id: string): Promise<Lead | undefined> {
  const doc = await db.collection('leads').doc(id).get();
  if (!doc.exists) return undefined;
  return docToLead(doc);
}

export async function getAssignmentHistory(leadId: string): Promise<Assignment[]> {
  const snapshot = await db.collection('leads').doc(leadId).collection('assignments').orderBy('assignedTime', 'desc').get();
  return Promise.all(snapshot.docs.map(docToAssignment));
}

export async function addAssignment(
  leadId: string,
  userId: string,
  disposition: Disposition,
  subDisposition: SubDisposition,
  remark: string
): Promise<Assignment> {
  const userDoc = await db.collection('users').doc(userId).get();
  const user = userDoc.data();
  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();
  const newAssignmentData = {
    mainDataRefId: leadId,
    userId: userId,
    userName: user.name,
    assignedTime: now,
    disposition,
    dispositionTime: now,
    subDisposition,
    subDispositionTime: now,
    remark,
  };

  const assignmentRef = await db.collection('leads').doc(leadId).collection('assignments').add(newAssignmentData);
  
  return { id: assignmentRef.id, ...newAssignmentData, assignedTime: now.toISOString(), dispositionTime: now.toISOString(), subDispositionTime: now.toISOString() };
}

export async function assignLeads(leadIds: string[], userId: string): Promise<Assignment[]> {
    const userDoc = await db.collection('users').doc(userId).get();
    const user = userDoc.data();
    if (!user) {
        throw new Error("User not found");
    }

    const now = new Date();
    const newAssignments: Assignment[] = [];
    const batch = db.batch();

    for (const leadId of leadIds) {
        const newAssignmentData = {
            mainDataRefId: leadId,
            userId: userId,
            userName: user.name,
            assignedTime: now,
            disposition: 'New' as Disposition,
        };
        const assignmentRef = db.collection('leads').doc(leadId).collection('assignments').doc();
        batch.set(assignmentRef, newAssignmentData);
        newAssignments.push({ id: assignmentRef.id, ...newAssignmentData, assignedTime: now.toISOString() });
    }
    
    await batch.commit();
    return newAssignments;
}

export async function importLeads(newLeads: Omit<Lead, 'refId' | 'createdAt'>[]): Promise<{ count: number }> {
    const batch = db.batch();
    
    newLeads.forEach((lead) => {
        const leadRef = db.collection('leads').doc();
        const newLeadData = {
            ...lead,
            createdAt: FieldValue.serverTimestamp(),
        };
        batch.set(leadRef, newLeadData);
    });
    
    await batch.commit();
    return { count: newLeads.length };
}

export async function updateCampaignForLeads(leadIds: string[], campaign: string): Promise<{ count: number }> {
    const batch = db.batch();
    leadIds.forEach(leadId => {
        const leadRef = db.collection('leads').doc(leadId);
        batch.update(leadRef, { campaign });
    });
    
    await batch.commit();
    return { count: leadIds.length };
}
