import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { InviteeRecord } from '../models/invitation.models';

const firebaseConfig = {
  apiKey: 'AIzaSyCzRQCwGXAyXW_ej-LbBpR_yc8xD3Xkigo',
  authDomain: 'g-invitation-6e173.firebaseapp.com',
  projectId: 'g-invitation-6e173',
  storageBucket: 'g-invitation-6e173.firebasestorage.app',
  messagingSenderId: '289964033553',
  appId: '1:289964033553:web:0bd883f2b94019063113b0',
};

@Injectable({ providedIn: 'root' })
export class InviteeService {
  private initialized = false;

  private ensureInitialized(): void {
    if (typeof window === 'undefined') {
      throw new Error('Firestore operations are only available in the browser.');
    }
    if (!this.initialized) {
      if (!getApps().length) {
        initializeApp(firebaseConfig);
      }
      this.initialized = true;
    }
  }

  private getCollectionName(eventSlug: string): string {
    return `rsvp-${eventSlug}`;
  }

  /**
   * Get a single invitee by ID
   */
  async getInvitee(inviteeId: string, eventSlug: string): Promise<InviteeRecord | null> {
    this.ensureInitialized();
    const db = getFirestore();
    const docRef = doc(db, this.getCollectionName(eventSlug), inviteeId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data() as InviteeRecord;
  }

  /**
   * Get all invitees for an event
   */
  async getAllInvitees(eventSlug: string): Promise<InviteeRecord[]> {
    this.ensureInitialized();
    const db = getFirestore();
    const collectionRef = collection(db, this.getCollectionName(eventSlug));
    const snapshot = await getDocs(collectionRef);

    const invitees: InviteeRecord[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as InviteeRecord;
      invitees.push(data);
    });

    return invitees;
  }

  /**
   * Upload/initialize invitee records (without RSVP data)
   * Use this to restore invitees after accidental deletion
   */
  async uploadInvitees(invitees: InviteeRecord[], eventSlug: string): Promise<void> {
    this.ensureInitialized();
    const db = getFirestore();
    const collectionName = this.getCollectionName(eventSlug);

    console.log(`Starting upload of ${invitees.length} invitees to collection: ${collectionName}`);

    const batchSize = 500;
    const batches = Math.ceil(invitees.length / batchSize);

    for (let i = 0; i < batches; i++) {
      const batch = writeBatch(db);
      const start = i * batchSize;
      const end = Math.min(start + batchSize, invitees.length);

      for (let j = start; j < end; j++) {
        const invitee = invitees[j];
        const docRef = doc(db, collectionName, invitee.id);

        batch.set(docRef, {
          id: invitee.id,
          eventSlug: eventSlug,
          guestNames: invitee.guestNames,
          guestNamesDisplay: invitee.guestNames.join(' & '),
          numberOfPeople: invitee.numberOfPeople,
        }, { merge: true }); // Use merge to not overwrite existing RSVP data
      }

      await batch.commit();
      console.log(`Uploaded batch ${i + 1}/${batches} (${end - start} documents)`);
    }

    console.log(`Successfully uploaded all ${invitees.length} invitees!`);
  }

  /**
   * Create a new invitee record
   */
  async createInvitee(invitee: { id: string; guestNames: string[]; numberOfPeople: number }, eventSlug: string): Promise<void> {
    this.ensureInitialized();
    const db = getFirestore();
    const docRef = doc(db, this.getCollectionName(eventSlug), invitee.id);

    // Check if invitee already exists
    const existingDoc = await getDoc(docRef);
    if (existingDoc.exists()) {
      throw new Error(`An invitation with ID "${invitee.id}" already exists.`);
    }

    await setDoc(docRef, {
      id: invitee.id,
      eventSlug: eventSlug,
      guestNames: invitee.guestNames,
      guestNamesDisplay: invitee.guestNames.join(' & '),
      numberOfPeople: invitee.numberOfPeople,
    });

    console.log(`Created new invitee: ${invitee.id}`);
  }

  /**
   * Submit or update RSVP for an invitee
   */
  async submitRsvp(inviteeId: string, eventSlug: string, rsvpData: {
    attending: boolean;
    attendeeCount: number;
    message: string;
  }): Promise<void> {
    this.ensureInitialized();
    const db = getFirestore();
    const docRef = doc(db, this.getCollectionName(eventSlug), inviteeId);

    const now = new Date().toISOString();
    const existing = await getDoc(docRef);

    if (!existing.exists()) {
      // If document doesn't exist, we need to create it with full data
      // This shouldn't happen if invitees are pre-loaded, but handle it anyway
      throw new Error(`Invitee ${inviteeId} not found in database`);
    }

    const existingData = existing.data() as InviteeRecord;

    const updateData = {
      attending: rsvpData.attending,
      attendeeCount: rsvpData.attending ? rsvpData.attendeeCount : 0,
      message: rsvpData.message || '',
      updatedAt: now,
      guestNamesDisplay: existingData.guestNames.join(' & '), // Ensure this is set for email notifications
    };

    await updateDoc(docRef, updateData);

    // Set createdAt only on first submission
    if (!existingData?.createdAt) {
      await updateDoc(docRef, { createdAt: now });
    }
  }

  /**
   * Delete RSVP data (but keep invitee record)
   */
  async deleteRsvp(inviteeId: string, eventSlug: string): Promise<void> {
    this.ensureInitialized();
    const db = getFirestore();
    const docRef = doc(db, this.getCollectionName(eventSlug), inviteeId);

    // Remove RSVP fields but keep invitee data
    await updateDoc(docRef, {
      attending: null,
      attendeeCount: null,
      message: null,
      createdAt: null,
      updatedAt: null,
    });
  }
}


